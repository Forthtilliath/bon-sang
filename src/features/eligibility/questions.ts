import { parseIsoDate } from "@/lib/dates";

import type { Answers } from "./types";

/**
 * Date (ISO) à laquelle les règles ci-dessous ont été relevées sur le site grand
 * public de l'EFS. À mettre à jour manuellement si les critères officiels changent
 * (ROADMAP §6.2 : « critères au JJ/MM/AAAA »).
 */
export const CRITERIA_UPDATED_AT = "2026-09-10";

/**
 * `CRITERIA_UPDATED_AT` déjà résolue en `Date`, calculée une seule fois au
 * chargement du module plutôt qu'à chaque rendu (cf. `@eslint-react/purity`) —
 * le fallback `new Date()` ne se déclenche que si la constante ci-dessus est
 * mal formée, ce qui n'arrive jamais en pratique.
 */
export const CRITERIA_UPDATED_AT_DATE = parseIsoDate(CRITERIA_UPDATED_AT) ?? new Date();

type BaseQuestion = {
  id: string;
  /** Affichée seulement si cette condition est vraie (question de suivi). */
  showIf?: (answers: Answers) => boolean;
};

export type Question = BaseQuestion &
  (
    | { kind: "boolean" }
    | { kind: "number"; min: number; max: number; unit: "years" | "kg" | "count" }
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
  // Alimente le plafond annuel de dons (règle `annualCap`) et le profil du suivi
  // (mêmes valeurs que `Sex`) : posées en fin de parcours, sans effet sur l'ordre
  // des questions déjà couvert par les tests existants.
  { id: "sex", kind: "choice", options: ["female", "male", "unspecified"] },
  { id: "donationsLast12Months", kind: "number", min: 0, max: 10, unit: "count" },
] as const;

/** Liste des questions à afficher compte tenu des réponses déjà données. */
export function visibleQuestions(answers: Answers): Question[] {
  return QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
}
