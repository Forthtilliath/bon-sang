import { ANNUAL_BLOOD_CAP } from "@/features/tracker/eligibility-date";
import { addDays, addMonths, latestDate, parseIsoDate } from "@/lib/dates";

import type {
  Answers,
  EligibilityReason,
  EligibilityResult,
  Rule,
  RuleOutcome,
  Verdict,
} from "./types";

const eligible: RuleOutcome = { verdict: "eligible" };

/** `base` + `months`, ou `null` si la date de référence est absente/invalide. */
function waitFromDate(value: Answers[string], months: number): Date | null {
  const base = parseIsoDate(value);
  return base ? addMonths(base, months) : null;
}

export const RULES: readonly Rule[] = [
  {
    id: "age",
    evaluate: (a) => {
      const age = a.age;
      if (typeof age !== "number") return eligible;
      if (age < 18) return { verdict: "wait", reasonKey: "ageMinor", until: null };
      if (age > 70) return { verdict: "ineligible", reasonKey: "ageMax" };
      return eligible;
    },
  },
  {
    id: "weight",
    evaluate: (a) =>
      typeof a.weight === "number" && a.weight < 50
        ? { verdict: "ineligible", reasonKey: "weightMin" }
        : eligible,
  },
  {
    id: "healthy",
    evaluate: (a) =>
      a.healthy === false ? { verdict: "wait", reasonKey: "healthNow", until: null } : eligible,
  },
  {
    id: "infection",
    evaluate: (a, today) =>
      a.infection === true
        ? { verdict: "wait", reasonKey: "infection", until: addDays(today, 14) }
        : eligible,
  },
  {
    id: "dentalCare",
    evaluate: (a, today) => {
      if (a.dentalCare === "minor")
        return { verdict: "wait", reasonKey: "dentalMinor", until: addDays(today, 1) };
      if (a.dentalCare === "major")
        return { verdict: "wait", reasonKey: "dentalMajor", until: addDays(today, 7) };
      return eligible;
    },
  },
  {
    id: "tattoo",
    evaluate: (a) =>
      a.tattoo === true
        ? { verdict: "wait", reasonKey: "tattoo", until: waitFromDate(a.tattooDate, 4) }
        : eligible,
  },
  {
    id: "surgery",
    evaluate: (a) =>
      a.surgery === true
        ? { verdict: "wait", reasonKey: "surgery", until: waitFromDate(a.surgeryDate, 4) }
        : eligible,
  },
  {
    id: "travel",
    evaluate: (a) => (a.travel === true ? { verdict: "check", reasonKey: "travel" } : eligible),
  },
  {
    id: "pregnancy",
    evaluate: (a) => {
      if (a.pregnancy === "current")
        return { verdict: "wait", reasonKey: "pregnancyCurrent", until: null };
      if (a.pregnancy === "recent")
        return {
          verdict: "wait",
          reasonKey: "pregnancyRecent",
          until: waitFromDate(a.pregnancyEnd, 6),
        };
      return eligible;
    },
  },
  {
    id: "transfusion",
    evaluate: (a) =>
      a.transfusion === true ? { verdict: "ineligible", reasonKey: "transfusion" } : eligible,
  },
  {
    id: "riskExposure",
    evaluate: (a, today) =>
      a.riskExposure === true
        ? { verdict: "wait", reasonKey: "riskExposure", until: addMonths(today, 4) }
        : eligible,
  },
  {
    id: "chronic",
    evaluate: (a) => (a.chronic === true ? { verdict: "check", reasonKey: "chronic" } : eligible),
  },
  {
    id: "interval",
    evaluate: (a) => {
      if (a.lastDonation !== "recent") return eligible;
      const last = parseIsoDate(a.lastDonationDate);
      return {
        verdict: "wait",
        reasonKey: "interval",
        until: last ? addDays(last, 56) : null,
      };
    },
  },
  {
    id: "annualCap",
    // Plafond annuel de dons de sang total, selon le sexe (mêmes seuils que le
    // suivi `Tracker`, cf. `ANNUAL_BLOOD_CAP`). Pas de date connue : contrairement
    // au suivi, le quiz ne connaît pas la date du don le plus ancien de la fenêtre.
    evaluate: (a) => {
      const sex = a.sex;
      const count = a.donationsLast12Months;
      if (
        typeof count !== "number" ||
        (sex !== "male" && sex !== "female" && sex !== "unspecified")
      )
        return eligible;
      return count >= ANNUAL_BLOOD_CAP[sex]
        ? { verdict: "wait", reasonKey: "annualCap", until: null }
        : eligible;
    },
  },
] as const;

const SEVERITY: Record<Verdict, number> = { eligible: 0, wait: 1, check: 2, ineligible: 3 };

/** Évalue toutes les règles et agrège le verdict le plus restrictif. */
export function evaluate(answers: Answers, today: Date = new Date()): EligibilityResult {
  const reasons: EligibilityReason[] = [];

  for (const rule of RULES) {
    const outcome = rule.evaluate(answers, today);
    if (outcome.verdict === "eligible") continue;
    reasons.push({
      id: rule.id,
      verdict: outcome.verdict,
      reasonKey: outcome.reasonKey,
      until: outcome.verdict === "wait" ? outcome.until : null,
    });
  }

  const verdict = reasons.reduce<Verdict>(
    (worst, r) => (SEVERITY[r.verdict] > SEVERITY[worst] ? r.verdict : worst),
    "eligible",
  );

  const until =
    verdict === "wait"
      ? latestDate(reasons.filter((r) => r.verdict === "wait").map((r) => r.until))
      : null;

  // Reasons triées par sévérité décroissante pour l'affichage.
  reasons.sort((x, y) => SEVERITY[y.verdict] - SEVERITY[x.verdict]);

  return { verdict, until, reasons };
}
