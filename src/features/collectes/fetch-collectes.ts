import "server-only";

import { EFS_API_BASE, type EfsCity, type EfsSearchResponse } from "./efs";
import { normalizeCollectes, upcomingCollectes } from "./normalize";
import { formatIsoDate } from "@/lib/dates";
import type { CollectesResult } from "./types";

const REVALIDATE_SECONDS = 3600;
// Les coordonnées d'une ville ne changent (quasiment) jamais : un cache bien plus
// long que celui des collectes évite de re-géocoder à chaque recherche répétée.
const GEOCODE_REVALIDATE_SECONDS = 60 * 60 * 24 * 7; // 7 jours
const TIMEOUT_MS = 7000;

async function efsFetch<T>(
  path: string,
  revalidate: number = REVALIDATE_SECONDS,
): Promise<T | null> {
  try {
    const response = await fetch(`${EFS_API_BASE}${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function geocodeCity(query: string): Promise<EfsCity | null> {
  const cities = await efsFetch<EfsCity[]>(
    `/city/searchbyinput?searchString=${encodeURIComponent(query)}`,
    GEOCODE_REVALIDATE_SECONDS,
  );
  const first = cities?.find((c) => typeof c.lat === "number" && typeof c.lon === "number");
  return first ?? null;
}

/**
 * Recherche les collectes autour d'une ville (nom ou code postal).
 *
 * Deux appels réseau séquentiels et non parallélisables : la recherche de
 * collectes a besoin des coordonnées renvoyées par le géocodage. Le géocodage,
 * lui, est mis en cache bien plus longtemps (cf. `GEOCODE_REVALIDATE_SECONDS`).
 */
export async function fetchCollectesByCity(rawQuery: string): Promise<CollectesResult> {
  const query = rawQuery.trim();
  if (query.length < 2) return { status: "empty", query, collectes: [] };

  const city = await geocodeCity(query);
  if (!city || typeof city.lat !== "number" || typeof city.lon !== "number") {
    return { status: "not-found", query, collectes: [] };
  }

  const params = new URLSearchParams({
    CityName: city.nom ?? query,
    UserLatitude: String(city.lat),
    UserLongitude: String(city.lon),
    HideNonPubliableCollects: "true",
    Limit: "60",
  });
  const raw = await efsFetch<EfsSearchResponse>(
    `/samplingcollection/searchbycityname?${params.toString()}`,
  );
  if (!raw) return { status: "error", query, collectes: [] };

  const collectes = upcomingCollectes(normalizeCollectes(raw), formatIsoDate(new Date()));
  return {
    status: collectes.length > 0 ? "ok" : "not-found",
    query: city.nom ?? query,
    collectes,
  };
}
