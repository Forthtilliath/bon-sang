import { describe, expect, it } from "vitest";

import { formatIsoDate } from "@/lib/dates";

import { evaluate } from "./rules";
import type { Answers } from "./types";

const TODAY = new Date("2026-06-01T00:00:00");

/** Jeu de réponses d'une personne parfaitement éligible. */
const OK: Answers = {
  age: 30,
  weight: 70,
  healthy: true,
  infection: false,
  dentalCare: "none",
  tattoo: false,
  surgery: false,
  travel: false,
  pregnancy: "no",
  transfusion: false,
  riskExposure: false,
  chronic: false,
  lastDonation: "old",
};

const iso = (d: Date | null) => (d ? formatIsoDate(d) : null);

describe("evaluate — cas éligible", () => {
  it("ne renvoie aucune raison quand tout va bien", () => {
    const result = evaluate(OK, TODAY);
    expect(result.verdict).toBe("eligible");
    expect(result.reasons).toHaveLength(0);
    expect(result.until).toBeNull();
  });
});

describe("evaluate — contre-indications définitives", () => {
  it("poids < 50 kg", () => {
    expect(evaluate({ ...OK, weight: 48 }, TODAY).verdict).toBe("ineligible");
  });

  it("transfusion déjà reçue", () => {
    const result = evaluate({ ...OK, transfusion: true }, TODAY);
    expect(result.verdict).toBe("ineligible");
    expect(result.reasons[0].reasonKey).toBe("transfusion");
  });

  it("âge > 70 ans", () => {
    expect(evaluate({ ...OK, age: 72 }, TODAY).verdict).toBe("ineligible");
  });
});

describe("evaluate — délais temporaires", () => {
  it("mineur : attente sans date connue", () => {
    const result = evaluate({ ...OK, age: 16 }, TODAY);
    expect(result.verdict).toBe("wait");
    expect(result.until).toBeNull();
  });

  it("tatouage : 4 mois après la date saisie", () => {
    const result = evaluate({ ...OK, tattoo: true, tattooDate: "2026-05-01" }, TODAY);
    expect(result.verdict).toBe("wait");
    expect(iso(result.until)).toBe("2026-09-01");
  });

  it("infection récente : 2 semaines à partir d'aujourd'hui", () => {
    expect(iso(evaluate({ ...OK, infection: true }, TODAY).until)).toBe("2026-06-15");
  });

  it("dernier don récent : 56 jours après", () => {
    const result = evaluate(
      { ...OK, lastDonation: "recent", lastDonationDate: "2026-05-20" },
      TODAY,
    );
    expect(iso(result.until)).toBe("2026-07-15");
  });

  it("retient la date de ré-éligibilité la plus tardive", () => {
    const result = evaluate(
      {
        ...OK,
        infection: true, // +14 j -> 2026-06-15
        tattoo: true,
        tattooDate: "2026-05-01", // +4 mois -> 2026-09-01
      },
      TODAY,
    );
    expect(result.verdict).toBe("wait");
    expect(iso(result.until)).toBe("2026-09-01");
    expect(result.reasons).toHaveLength(2);
  });
});

describe("evaluate — plafond annuel de dons (sexe)", () => {
  it("plafond atteint pour un homme (6 dons / 12 mois) => wait", () => {
    const result = evaluate({ ...OK, sex: "male", donationsLast12Months: 6 }, TODAY);
    expect(result.verdict).toBe("wait");
    expect(result.reasons.some((r) => r.reasonKey === "annualCap")).toBe(true);
  });

  it("plafond non atteint pour une femme (3 dons / 12 mois) => eligible", () => {
    expect(evaluate({ ...OK, sex: "female", donationsLast12Months: 3 }, TODAY).verdict).toBe(
      "eligible",
    );
  });

  it("plafond atteint pour une femme (4 dons / 12 mois) => wait", () => {
    expect(evaluate({ ...OK, sex: "female", donationsLast12Months: 4 }, TODAY).verdict).toBe(
      "wait",
    );
  });

  it("sans réponse à ces deux questions, aucune incidence", () => {
    expect(evaluate(OK, TODAY).verdict).toBe("eligible");
  });
});

describe("evaluate — avis médical", () => {
  it("maladie chronique => check", () => {
    expect(evaluate({ ...OK, chronic: true }, TODAY).verdict).toBe("check");
  });

  it("voyage hors Europe => check", () => {
    expect(evaluate({ ...OK, travel: true }, TODAY).verdict).toBe("check");
  });
});

describe("evaluate — priorité des verdicts", () => {
  it("une contre-indication définitive prime sur un délai", () => {
    const result = evaluate({ ...OK, transfusion: true, infection: true }, TODAY);
    expect(result.verdict).toBe("ineligible");
    expect(result.reasons).toHaveLength(2);
    expect(result.reasons[0].verdict).toBe("ineligible");
  });

  it("un avis médical prime sur un simple délai", () => {
    const result = evaluate({ ...OK, chronic: true, infection: true }, TODAY);
    expect(result.verdict).toBe("check");
  });
});
