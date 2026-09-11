import type { Messages } from "next-intl";

/** Valeur d'une réponse : booléen (oui/non), nombre (âge, poids), ou chaîne (choix, date ISO). */
export type AnswerValue = boolean | number | string | undefined;

export type Answers = Record<string, AnswerValue>;

export type Verdict = "eligible" | "wait" | "check" | "ineligible";

/**
 * Clé de raison, dérivée de `Quiz.reasons` dans les messages (source de
 * vérité unique) plutôt que déclarée en `string` : une clé qui n'existe pas
 * dans `messages/fr.json` est rejetée à la compilation, ici comme côté
 * affichage (`quiz-result.tsx`).
 */
export type ReasonKey = keyof Messages["Quiz"]["reasons"];

/** Résultat d'une règle unitaire. `reasonKey` pointe vers `Quiz.reasons.<key>` en i18n. */
export type RuleOutcome =
  | { verdict: "eligible" }
  | { verdict: "wait"; reasonKey: ReasonKey; until: Date | null }
  | { verdict: "check"; reasonKey: ReasonKey }
  | { verdict: "ineligible"; reasonKey: ReasonKey };

export type Rule = {
  id: string;
  evaluate: (answers: Answers, today: Date) => RuleOutcome;
};

export type EligibilityReason = {
  id: string;
  verdict: Exclude<Verdict, "eligible">;
  reasonKey: ReasonKey;
  until: Date | null;
};

export type EligibilityResult = {
  verdict: Verdict;
  /** Date de ré-éligibilité la plus tardive connue (verdict `wait`), sinon `null`. */
  until: Date | null;
  reasons: EligibilityReason[];
};
