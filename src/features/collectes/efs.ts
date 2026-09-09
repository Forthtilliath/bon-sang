/**
 * Types partiels de l'API Carto v3 de l'EFS.
 * Doc : https://oudonner.api.efs.sante.fr/carto-api/swagger/
 */

export const EFS_API_BASE =
  process.env.EFS_COLLECTES_URL ?? "https://oudonner.api.efs.sante.fr/carto-api/v3";

export type EfsCity = {
  nom?: string | null;
  codePostal?: string | null;
  lat?: number | null;
  lon?: number | null;
};

export type EfsCollection = {
  id?: number | null;
  date?: string | null;
  morningStartTime?: string | null;
  morningEndTime?: string | null;
  afternoonStartTime?: string | null;
  afternoonEndTime?: string | null;
  isPublishable?: boolean | null;
  urlBlood?: string | null;
  nbPlacesRestantesST?: number | null;
};

export type EfsLocation = {
  name?: string | null;
  city?: string | null;
  ville?: string | null;
  fullAddress?: string | null;
  address1?: string | null;
  address2?: string | null;
  postCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  giveBlood?: number | boolean | null;
  givePlasma?: number | boolean | null;
  givePlatelet?: number | boolean | null;
  urlBlood?: string | null;
  urlPlasma?: string | null;
  urlPlatelets?: string | null;
  horaires?: string | null;
  isMDD?: boolean | null;
  id?: number | null;
  samplingLocationCode?: string | null;
};

export type EfsLocationWithCollections = EfsLocation & {
  collections?: EfsCollection[] | null;
};

export type EfsSearchResponse = {
  samplingLocationEntities_SF?: EfsLocation[] | null;
  samplingLocationCollections?: EfsLocationWithCollections[] | null;
};
