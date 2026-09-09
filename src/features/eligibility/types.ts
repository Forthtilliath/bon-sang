/** Valeur d'une réponse : booléen (oui/non), nombre (âge, poids), ou chaîne (choix, date ISO). */
export type AnswerValue = boolean | number | string | undefined;

export type Answers = Record<string, AnswerValue>;

export type Verdict = "eligible" | "wait" | "check" | "ineligible";

/** Résultat d'une règle unitaire. `reasonKey` pointe vers `Quiz.reasons.<key>` en i18n. */
export type RuleOutcome =
  | { verdict: "eligible" }
  | { verdict: "wait"; reasonKey: string; until: Date | null }
  | { verdict: "check"; reasonKey: string }
  | { verdict: "ineligible"; reasonKey: string };

export type Rule = {
  id: string;
  evaluate: (answers: Answers, today: Date) => RuleOutcome;
};

export type EligibilityReason = {
  id: string;
  verdict: Exclude<Verdict, "eligible">;
  reasonKey: string;
  until: Date | null;
};

export type EligibilityResult = {
  verdict: Verdict;
  /** Date de ré-éligibilité la plus tardive connue (verdict `wait`), sinon `null`. */
  until: Date | null;
  reasons: EligibilityReason[];
};
