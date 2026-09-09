import type { Answers } from "./types";

type BaseQuestion = {
  id: string;
  /** Affichée seulement si cette condition est vraie (question de suivi). */
  showIf?: (answers: Answers) => boolean;
};

export type Question = BaseQuestion &
  (
    | { kind: "boolean" }
    | { kind: "number"; min: number; max: number; unit: "years" | "kg" }
    | { kind: "choice"; options: readonly string[] }
    | { kind: "date"; notFuture?: boolean }
  );

const isYes = (answers: Answers, id: string) => answers[id] === true;
const isChoice = (answers: Answers, id: string, value: string) => answers[id] === value;

/**
 * Sous-ensemble représentatif des critères de l'EFS. Non exhaustif : le test le
 * précise et renvoie systématiquement vers l'entretien pré-don.
 */
export const QUESTIONS: readonly Question[] = [
  { id: "age", kind: "number", min: 0, max: 120, unit: "years" },
  { id: "weight", kind: "number", min: 30, max: 250, unit: "kg" },
  { id: "healthy", kind: "boolean" },
  { id: "infection", kind: "boolean" },
  { id: "dentalCare", kind: "choice", options: ["none", "minor", "major"] },
  { id: "tattoo", kind: "boolean" },
  { id: "tattooDate", kind: "date", notFuture: true, showIf: (a) => isYes(a, "tattoo") },
  { id: "surgery", kind: "boolean" },
  { id: "surgeryDate", kind: "date", notFuture: true, showIf: (a) => isYes(a, "surgery") },
  { id: "travel", kind: "boolean" },
  { id: "pregnancy", kind: "choice", options: ["no", "current", "recent"] },
  {
    id: "pregnancyEnd",
    kind: "date",
    notFuture: true,
    showIf: (a) => isChoice(a, "pregnancy", "recent"),
  },
  { id: "transfusion", kind: "boolean" },
  { id: "riskExposure", kind: "boolean" },
  { id: "chronic", kind: "boolean" },
  { id: "lastDonation", kind: "choice", options: ["never", "recent", "old"] },
  {
    id: "lastDonationDate",
    kind: "date",
    notFuture: true,
    showIf: (a) => isChoice(a, "lastDonation", "recent"),
  },
] as const;

/** Liste des questions à afficher compte tenu des réponses déjà données. */
export function visibleQuestions(answers: Answers): Question[] {
  return QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
}
