import { describe, expect, it } from "vitest";

import { formatIsoDate } from "@/lib/dates";

import { nextEligibleDate } from "./eligibility-date";
import { EMPTY_TRACKER, type Donation, type TrackerState } from "./types";

const TODAY = new Date("2026-06-01T00:00:00");
const iso = (d: Date | null) => (d ? formatIsoDate(d) : null);

const donation = (over: Partial<Donation>): Donation => ({
  id: crypto.randomUUID(),
  date: "2026-01-01",
  type: "blood",
  ...over,
});

const state = (over: Partial<TrackerState>): TrackerState => ({ ...EMPTY_TRACKER, ...over });

describe("nextEligibleDate", () => {
  it("aucune contrainte quand l'historique est vide", () => {
    expect(nextEligibleDate(EMPTY_TRACKER, TODAY)).toEqual({ date: null, reason: null });
  });

  it("intervalle de 56 jours après un don de sang total", () => {
    const result = nextEligibleDate(
      state({ donations: [donation({ date: "2026-05-20" })] }),
      TODAY,
    );
    expect(result.reason).toBe("interval");
    expect(iso(result.date)).toBe("2026-07-15");
  });

  it("intervalle de 14 jours après un don de plasma", () => {
    const result = nextEligibleDate(
      state({ donations: [donation({ date: "2026-05-25", type: "plasma" })] }),
      TODAY,
    );
    expect(iso(result.date)).toBe("2026-06-08");
  });

  it("ignore un intervalle déjà écoulé", () => {
    const result = nextEligibleDate(
      state({ donations: [donation({ date: "2026-01-01" })] }),
      TODAY,
    );
    expect(result).toEqual({ date: null, reason: null });
  });

  it("applique le plafond annuel (femme : 4 dons de sang total)", () => {
    const result = nextEligibleDate(
      state({
        profile: { sex: "female", bloodGroup: "unknown" },
        donations: [
          donation({ date: "2026-01-10" }),
          donation({ date: "2026-03-10" }),
          donation({ date: "2026-05-10" }),
          donation({ date: "2026-05-25" }),
        ],
      }),
      TODAY,
    );
    expect(result.reason).toBe("annualCap");
    expect(iso(result.date)).toBe("2027-01-10");
  });

  it("un homme a droit à 6 dons avant le plafond", () => {
    const result = nextEligibleDate(
      state({
        profile: { sex: "male", bloodGroup: "unknown" },
        donations: [
          donation({ date: "2026-01-10" }),
          donation({ date: "2026-03-10" }),
          donation({ date: "2026-05-10" }),
          donation({ date: "2026-05-25" }),
        ],
      }),
      TODAY,
    );
    expect(result.reason).toBe("interval");
  });

  it("ignore un rappel déjà échu", () => {
    const result = nextEligibleDate(state({ reminder: { date: "2026-03-01" } }), TODAY);
    expect(result).toEqual({ date: null, reason: null });
  });

  it("retient la contrainte la plus tardive entre intervalle et rappel", () => {
    const result = nextEligibleDate(
      state({
        donations: [donation({ date: "2026-05-20" })], // interval -> 2026-07-15
        reminder: { date: "2026-09-01" },
      }),
      TODAY,
    );
    expect(result.reason).toBe("reminder");
    expect(iso(result.date)).toBe("2026-09-01");
  });
});
