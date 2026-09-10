import { describe, expect, it } from "vitest";

import { MAX_IMPORT_BYTES, isTrackerState, parseTrackerState } from "./validate";

const valid = {
  profile: { sex: "male", bloodGroup: "O+" },
  donations: [{ id: "a1", date: "2026-01-15", type: "blood", place: "Toulouse" }],
  reminder: { date: "2026-03-01", note: "après 8 semaines" },
};

describe("isTrackerState", () => {
  it("accepte un état complet", () => {
    expect(isTrackerState(valid)).toBe(true);
  });

  it("accepte un reminder null et un don sans lieu", () => {
    expect(
      isTrackerState({
        profile: { sex: "unspecified", bloodGroup: "unknown" },
        donations: [{ id: "x", date: "2026-02-02", type: "plasma" }],
        reminder: null,
      }),
    ).toBe(true);
  });

  it("rejette une valeur non-objet", () => {
    expect(isTrackerState(null)).toBe(false);
    expect(isTrackerState("{}")).toBe(false);
    expect(isTrackerState([])).toBe(false);
  });

  it("rejette un profil aux énums inconnues", () => {
    expect(isTrackerState({ ...valid, profile: { sex: "other", bloodGroup: "O+" } })).toBe(false);
    expect(isTrackerState({ ...valid, profile: { sex: "male", bloodGroup: "C+" } })).toBe(false);
  });

  it("rejette des dons mal formés", () => {
    expect(
      isTrackerState({ ...valid, donations: [{ id: "a", date: "15/01/2026", type: "blood" }] }),
    ).toBe(false);
    expect(
      isTrackerState({ ...valid, donations: [{ id: "a", date: "2026-01-15", type: "gold" }] }),
    ).toBe(false);
    expect(isTrackerState({ ...valid, donations: [{ date: "2026-01-15", type: "blood" }] })).toBe(
      false,
    );
    expect(isTrackerState({ ...valid, donations: "nope" })).toBe(false);
  });

  it("rejette une date impossible", () => {
    expect(
      isTrackerState({ ...valid, donations: [{ id: "a", date: "2026-13-40", type: "blood" }] }),
    ).toBe(false);
  });

  it("rejette un reminder mal typé", () => {
    expect(isTrackerState({ ...valid, reminder: { note: "sans date" } })).toBe(false);
    expect(isTrackerState({ ...valid, reminder: { date: "2026-03-01", note: 5 } })).toBe(false);
  });
});

describe("parseTrackerState", () => {
  it("renvoie un état nettoyé des champs superflus", () => {
    const raw = JSON.stringify({
      ...valid,
      extra: "ignored",
      profile: { ...valid.profile, junk: 1 },
    });
    expect(parseTrackerState(raw)).toEqual(valid);
  });

  it("renvoie null sur du JSON invalide", () => {
    expect(parseTrackerState("{ not json")).toBeNull();
  });

  it("renvoie null si la forme est invalide", () => {
    expect(parseTrackerState(JSON.stringify({ profile: {}, donations: [] }))).toBeNull();
  });

  it("refuse un fichier au-dessus de la limite de taille", () => {
    const huge = "x".repeat(MAX_IMPORT_BYTES + 1);
    expect(parseTrackerState(huge)).toBeNull();
  });

  it("omet place et note quand absents", () => {
    const raw = JSON.stringify({
      profile: { sex: "female", bloodGroup: "A-" },
      donations: [{ id: "d1", date: "2026-05-05", type: "platelets" }],
      reminder: null,
    });
    expect(parseTrackerState(raw)).toEqual({
      profile: { sex: "female", bloodGroup: "A-" },
      donations: [{ id: "d1", date: "2026-05-05", type: "platelets" }],
      reminder: null,
    });
  });
});
