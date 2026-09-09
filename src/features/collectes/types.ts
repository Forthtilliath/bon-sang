export const DON_KINDS = ["blood", "plasma", "platelets"] as const;
export type DonKind = (typeof DON_KINDS)[number];

/** Une collecte normalisée, indépendante du format brut de l'API EFS. */
export type Collecte = {
  id: string;
  nom: string;
  ville: string;
  codePostal: string;
  adresse: string;
  lat: number | null;
  lng: number | null;
  /** Site permanent (Maison du don) vs collecte mobile ponctuelle. */
  fixe: boolean;
  /** `YYYY-MM-DD` pour une collecte mobile, `null` pour un site fixe. */
  date: string | null;
  /** `HH:mm` (heure locale). */
  heureDebut: string | null;
  heureFin: string | null;
  /** Horaires en texte libre, pour les sites fixes. */
  horaires: string | null;
  typesDon: DonKind[];
  rdvUrl: string | null;
  placesRestantes: number | null;
};

export type CollectesStatus = "ok" | "empty" | "not-found" | "error";

export type CollectesResult = {
  status: CollectesStatus;
  query: string;
  collectes: Collecte[];
};
