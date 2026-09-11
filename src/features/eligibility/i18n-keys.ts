import type { MessageKeys, Messages, NestedKeyOf } from "next-intl";

type QuizMessages = Messages["Quiz"];

/** Chemins de clé valides du namespace `Quiz`, dérivés de `messages/fr.json`. */
export type QuizKey = MessageKeys<QuizMessages, NestedKeyOf<QuizMessages>>;

/**
 * `question.id` (et les options d'une question `choice`) sont des chaînes
 * connues seulement à l'exécution : next-intl ne peut pas vérifier un gabarit
 * de clé (`questions.${id}.label`) au moment où il est construit. Ce
 * contournement, restreint à la clé elle-même et typé sur les clés réelles
 * des messages plutôt que sur `string`, remplace l'ancien `as unknown as` qui
 * désactivait toute vérification sur le traducteur (valeurs, `t.has`,
 * `t.rich`…) — une clé absente des messages reste rejetée à la compilation.
 */
export type QuestionMessageKey = Extract<QuizKey, `questions.${string}`>;
