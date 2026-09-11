import { describe, expect, it } from "vitest";

import {
  filterCollectes,
  haversineKm,
  sortCollectes,
  toggleKind,
  withDistance,
  withinRadius,
} from "./filter";
import type { Collecte } from "./types";

const base: Collecte = {
  id: "x",
  nom: "Test",
  ville: "Ville",
  codePostal: "31000",
  adresse: "1 rue",
  lat: 43.6,
  lng: 1.44,
  fixe: false,
  date: "2026-06-10",
  heureDebut: "09:00",
  heureFin: "13:00",
  horaires: null,
  typesDon: ["blood"],
  rdvUrl: null,
  placesRestantes: null,
};

const c = (over: Partial<Collecte>): Collecte => ({ ...base, id: crypto.randomUUID(), ...over });

const TODAY = "2026-06-01";

describe("filterCollectes", () => {
  it("ne filtre rien par défaut", () => {
    const list = [c({}), c({ fixe: true, date: null })];
    expect(filterCollectes(list, { kinds: [], period: "all" }, TODAY)).toHaveLength(2);
  });

  it("filtre par type de don", () => {
    const list = [c({ typesDon: ["blood"] }), c({ typesDon: ["plasma"] })];
    expect(filterCollectes(list, { kinds: ["plasma"], period: "all" }, TODAY)).toHaveLength(1);
  });

  it("filtre par période mais garde les sites fixes", () => {
    const list = [
      c({ date: "2026-06-05" }), // dans la semaine
      c({ date: "2026-06-20" }), // hors semaine
      c({ fixe: true, date: null }),
    ];
    const result = filterCollectes(list, { kinds: [], period: "week" }, TODAY);
    expect(result.map((x) => x.date)).toEqual(["2026-06-05", null]);
  });

  it("la période « mois » garde ~31 jours d'horizon", () => {
    const list = [c({ date: "2026-06-25" }), c({ date: "2026-07-10" })];
    const result = filterCollectes(list, { kinds: [], period: "month" }, TODAY);
    expect(result.map((x) => x.date)).toEqual(["2026-06-25"]);
  });
});

describe("haversineKm", () => {
  it("Toulouse -> Paris ≈ 590 km", () => {
    const d = haversineKm({ lat: 43.6, lng: 1.44 }, { lat: 48.86, lng: 2.35 });
    expect(d).toBeGreaterThan(560);
    expect(d).toBeLessThan(620);
  });
});

describe("withDistance", () => {
  it("trie du plus proche au plus loin et met les sans-coordonnées à la fin", () => {
    const list = [
      c({ id: "far", lat: 48.86, lng: 2.35 }),
      c({ id: "near", lat: 43.61, lng: 1.45 }),
      c({ id: "nocoord", lat: null, lng: null }),
    ];
    const result = withDistance(list, { lat: 43.6, lng: 1.44 });
    expect(result.map((x) => x.id)).toEqual(["near", "far", "nocoord"]);
  });

  it("sans origine, ne trie pas et distance = null", () => {
    const result = withDistance([c({}), c({})], null);
    expect(result.every((x) => x.distanceKm === null)).toBe(true);
  });
});

describe("toggleKind", () => {
  it("ajoute puis retire", () => {
    expect(toggleKind([], "blood")).toEqual(["blood"]);
    expect(toggleKind(["blood", "plasma"], "blood")).toEqual(["plasma"]);
  });
});

describe("withinRadius", () => {
  const origin = { lat: 43.6, lng: 1.44 };
  const list = withDistance(
    [
      c({ id: "close", lat: 43.61, lng: 1.45 }),
      c({ id: "far", lat: 48.86, lng: 2.35 }),
      c({ id: "nocoord", lat: null, lng: null }),
    ],
    origin,
  );

  it("ne filtre rien sans rayon (null ou absent)", () => {
    expect(withinRadius(list, null).map((x) => x.id)).toEqual(["close", "far", "nocoord"]);
    expect(withinRadius(list, undefined).map((x) => x.id)).toEqual(["close", "far", "nocoord"]);
  });

  it("garde les collectes dans le rayon et celles sans coordonnées", () => {
    expect(withinRadius(list, 50).map((x) => x.id)).toEqual(["close", "nocoord"]);
  });
});

describe("sortCollectes", () => {
  const withDist = withDistance(
    [
      c({ id: "a", date: "2026-06-20", lat: 48.86, lng: 2.35 }), // ~590 km
      c({ id: "b", date: "2026-06-05", lat: 43.65, lng: 1.5 }), // ~7 km
      c({ id: "c", fixe: true, date: null, lat: 43.601, lng: 1.441 }), // ~0.1 km
    ],
    { lat: 43.6, lng: 1.44 },
  );

  it("« date » : sites fixes d'abord, puis par date croissante", () => {
    expect(sortCollectes(withDist, "date").map((x) => x.id)).toEqual(["c", "b", "a"]);
  });

  it("« distance » : du plus proche au plus loin", () => {
    expect(sortCollectes(withDist, "distance").map((x) => x.id)).toEqual(["c", "b", "a"]);
  });
});
