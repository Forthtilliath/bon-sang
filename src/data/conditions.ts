/**
 * Maladies mises en avant sur /qui-ca-aide. Le contenu rédactionnel (description,
 * apport du don, témoignage illustratif) est dans les messages i18n sous
 * `Pages.whoItHelps.conditions.<id>`. Les témoignages sont des personas
 * représentatifs, pas des personnes réelles.
 */
export const CONDITIONS = [
  {
    id: "sickleCell",
    association: { name: "SOS Globi", url: "https://sosglobi.fr" },
  },
  {
    id: "cysticFibrosis",
    association: { name: "Vaincre la Mucoviscidose", url: "https://www.vaincrelamuco.org" },
  },
  {
    id: "steinert",
    association: { name: "AFM-Téléthon", url: "https://www.afm-telethon.fr" },
  },
] as const;

export type ConditionId = (typeof CONDITIONS)[number]["id"];
