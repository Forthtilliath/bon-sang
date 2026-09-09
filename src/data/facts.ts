/**
 * Chiffres clés du don du sang. Valeurs communiquées par l'EFS ; à revérifier
 * périodiquement (cf. ROADMAP §6). Les libellés sont dans les messages i18n
 * sous `Pages.understand.figures.<id>`.
 */
export const KEY_FIGURES = [
  { id: "livesPerDonation", value: "3" },
  { id: "donationsPerDay", value: "≈ 10 000" },
  { id: "patientsPerYear", value: "1 M" },
  { id: "duration", value: "≈ 45 min" },
] as const;

export type KeyFigureId = (typeof KEY_FIGURES)[number]["id"];

/** Durées de conservation des produits sanguins (jours). */
export const SHELF_LIFE = [
  { id: "redCells", days: 42 },
  { id: "platelets", days: 7 },
  { id: "plasma", days: 365 },
] as const;

export const FACTS_SOURCE = {
  label: "Établissement français du sang",
  url: "https://dondesang.efs.sante.fr",
  asOf: "2026",
} as const;
