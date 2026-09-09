import type { DonKind, Collecte } from "./types";
import type { EfsCollection, EfsLocation, EfsSearchResponse } from "./efs";

/** `"2026-09-10T00:00:00"` ou `"10/09/2026 00:00:00"` -> `"2026-09-10"`. */
export function parseEfsDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const fr = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (fr) return `${fr[3]}-${fr[2]}-${fr[1]}`;
  return null;
}

/** `"08:30:00"` -> `"08:30"`, `""` / `null` -> `null`. */
export function parseEfsTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const m = value.match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : null;
}

function truthy(value: number | boolean | null | undefined): boolean {
  return value === true || value === 1;
}

function kindsOf(location: EfsLocation): DonKind[] {
  const kinds: DonKind[] = [];
  if (truthy(location.giveBlood)) kinds.push("blood");
  if (truthy(location.givePlasma)) kinds.push("plasma");
  if (truthy(location.givePlatelet)) kinds.push("platelets");
  return kinds;
}

function address(location: EfsLocation): string {
  return (
    location.fullAddress?.trim() ||
    [location.address1, location.address2].filter(Boolean).join(" ").trim() ||
    ""
  );
}

function rdvUrl(...candidates: Array<string | null | undefined>): string | null {
  const raw = candidates.find((c) => c && c.trim().length > 0)?.trim();
  if (!raw) return null;
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

function normalizeMobile(location: EfsLocation, collection: EfsCollection): Collecte | null {
  if (collection.isPublishable === false) return null;
  const date = parseEfsDate(collection.date);
  if (!date) return null;

  return {
    id: String(collection.id ?? `${location.samplingLocationCode}-${date}`),
    nom: location.name?.trim() || location.city?.trim() || "",
    ville: (location.ville || location.city || "").trim(),
    codePostal: (location.postCode ?? "").trim(),
    adresse: address(location),
    lat: typeof location.latitude === "number" ? location.latitude : null,
    lng: typeof location.longitude === "number" ? location.longitude : null,
    fixe: false,
    date,
    heureDebut: parseEfsTime(collection.morningStartTime ?? collection.afternoonStartTime),
    heureFin: parseEfsTime(collection.afternoonEndTime ?? collection.morningEndTime),
    horaires: null,
    typesDon: kindsOf(location),
    rdvUrl: rdvUrl(collection.urlBlood, location.urlBlood),
    placesRestantes:
      typeof collection.nbPlacesRestantesST === "number" ? collection.nbPlacesRestantesST : null,
  };
}

function normalizeFixed(location: EfsLocation): Collecte {
  return {
    id: `sf-${location.id ?? location.samplingLocationCode ?? location.name}`,
    nom: location.name?.trim() || "",
    ville: (location.ville || location.city || "").replace(/^\d{5}\s*/, "").trim(),
    codePostal: (location.postCode ?? "").trim(),
    adresse: address(location),
    lat: typeof location.latitude === "number" ? location.latitude : null,
    lng: typeof location.longitude === "number" ? location.longitude : null,
    fixe: true,
    date: null,
    heureDebut: null,
    heureFin: null,
    horaires: location.horaires?.trim() || null,
    typesDon: kindsOf(location),
    rdvUrl: rdvUrl(location.urlBlood, location.urlPlasma, location.urlPlatelets),
    placesRestantes: null,
  };
}

/** Aplati la réponse EFS en une liste de collectes normalisées. */
export function normalizeCollectes(raw: EfsSearchResponse): Collecte[] {
  const fixed = (raw.samplingLocationEntities_SF ?? []).map(normalizeFixed);

  const mobile = (raw.samplingLocationCollections ?? []).flatMap((location) =>
    (location.collections ?? [])
      .map((collection) => normalizeMobile(location, collection))
      .filter((c): c is Collecte => c !== null),
  );

  return [...fixed, ...mobile];
}

/** Garde les sites fixes et les collectes mobiles encore à venir, triées par date. */
export function upcomingCollectes(collectes: Collecte[], today: string): Collecte[] {
  return collectes
    .filter((c) => c.fixe || (c.date !== null && c.date >= today))
    .sort((a, b) => {
      if (a.fixe !== b.fixe) return a.fixe ? -1 : 1;
      return (a.date ?? "").localeCompare(b.date ?? "");
    });
}
