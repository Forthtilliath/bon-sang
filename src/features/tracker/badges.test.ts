import { describe, expect, it } from "vitest";

import { earnedBadges } from "./badges";
import { EMPTY_TRACKER, type Donation, type TrackerState } from "./types";

const donation = (date: string, type: Donation["type"] = "blood"): Donation => ({
  id: date,
  date,
  type,
});

const state = (over: Partial<TrackerState>): TrackerState => ({ ...EMPTY_TRACKER, ...over });

describe("earnedBadges", () => {
  it("aucun badge au départ", () => {
    expect(earnedBadges(EMPTY_TRACKER)).toEqual([]);
  });

  it("premier don", () => {
    expect(earnedBadges(state({ donations: [donation("2026-01-01")] }))).toContain("first");
  });

  it("trois dons", () => {
    const badges = earnedBadges(
      state({
        donations: [donation("2026-01-01"), donation("2026-03-01"), donation("2026-05-01")],
      }),
    );
    expect(badges).toEqual(expect.arrayContaining(["first", "three"]));
    expect(badges).not.toContain("ten");
  });

  it("régularité sur plus d'un an", () => {
    const badges = earnedBadges(
      state({ donations: [donation("2025-01-01"), donation("2026-02-01")] }),
    );
    expect(badges).toContain("regular");
  });

  it("pas de badge régularité sur moins d'un an", () => {
    const badges = earnedBadges(
      state({ donations: [donation("2026-01-01"), donation("2026-06-01")] }),
    );
    expect(badges).not.toContain("regular");
  });

  it("donneur universel selon le groupe sanguin", () => {
    expect(earnedBadges(state({ profile: { sex: "unspecified", bloodGroup: "O-" } }))).toContain(
      "universal",
    );
  });

  it("badge plasma", () => {
    expect(earnedBadges(state({ donations: [donation("2026-01-01", "plasma")] }))).toContain(
      "plasma",
    );
  });
});
