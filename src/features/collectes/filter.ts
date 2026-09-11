import { addDays, formatIsoDate, parseIsoDate } from "@/lib/dates";

import type { Collecte, DonKind } from "./types";

export const PERIODS = ["all", "week", "month"] as const;
export type Period = (typeof PERIODS)[number];

export const RADII_KM = [10, 25, 50, 100] as const;

export type Filters = {
  /** Vide = tous les types. */
  kinds: DonKind[];
  period: Period;
  /** Distance maximale depuis l'origine (km) ; `null` = pas de limite. Ignoré sans origine. */
  radiusKm?: number | null;
};

export const DEFAULT_FILTERS: Filters = { kinds: [], period: "all", radiusKm: null };

export const SORTS = ["date", "distance"] as const;
export type Sort = (typeof SORTS)[number];

export type Point = { lat: number; lng: number };

export type CollecteWithDistance = Collecte & { distanceKm: number | null };

const EARTH_RADIUS_KM = 6371;

/** Distance à vol d'oiseau entre deux points (km). */
export function haversineKm(a: Point, b: Point): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

function horizonDate(period: Period, today: string): string | null {
  const base = parseIsoDate(today);
  if (!base || period === "all") return null;
  return formatIsoDate(addDays(base, period === "week" ? 7 : 31));
}

/** Applique les filtres type de don + période (les sites fixes ignorent la période). */
export function filterCollectes(
  collectes: Collecte[],
  filters: Filters,
  today: string,
): Collecte[] {
  const horizon = horizonDate(filters.period, today);

  return collectes.filter((collecte) => {
    if (
      filters.kinds.length > 0 &&
      !filters.kinds.some((kind) => collecte.typesDon.includes(kind))
    ) {
      return false;
    }
    if (horizon && !collecte.fixe && collecte.date && collecte.date > horizon) {
      return false;
    }
    return true;
  });
}

/** Ajoute la distance depuis `origin` et trie du plus proche au plus loin. */
export function withDistance(collectes: Collecte[], origin: Point | null): CollecteWithDistance[] {
  const withDist = collectes.map((collecte) => ({
    ...collecte,
    distanceKm:
      origin && collecte.lat !== null && collecte.lng !== null
        ? haversineKm(origin, { lat: collecte.lat, lng: collecte.lng })
        : null,
  }));

  if (!origin) return withDist;

  return withDist.sort((a, b) => {
    if (a.distanceKm === null) return 1;
    if (b.distanceKm === null) return -1;
    return a.distanceKm - b.distanceKm;
  });
}

export function toggleKind(kinds: DonKind[], kind: DonKind): DonKind[] {
  return kinds.includes(kind) ? kinds.filter((k) => k !== kind) : [...kinds, kind];
}

/** Retire les collectes hors rayon (celles sans distance connue restent visibles). */
export function withinRadius(
  collectes: CollecteWithDistance[],
  radiusKm: number | null | undefined,
): CollecteWithDistance[] {
  if (!radiusKm) return collectes;
  return collectes.filter((c) => c.distanceKm === null || c.distanceKm <= radiusKm);
}

/** Trie par date (sites fixes d'abord) ou par distance (sans-coordonnées en dernier). */
export function sortCollectes(collectes: CollecteWithDistance[], sort: Sort): CollecteWithDistance[] {
  if (sort === "date") {
    return [...collectes].sort((a, b) => {
      if (a.fixe !== b.fixe) return a.fixe ? -1 : 1;
      return (a.date ?? "").localeCompare(b.date ?? "");
    });
  }
  return [...collectes].sort((a, b) => {
    if (a.distanceKm === null) return 1;
    if (b.distanceKm === null) return -1;
    return a.distanceKm - b.distanceKm;
  });
}
