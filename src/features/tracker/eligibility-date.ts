import { addDays, parseIsoDate } from "@/lib/dates";

import type { DonationType, Sex, TrackerState } from "./types";

/** Délai minimal avant un nouveau don, selon le type du dernier don (jours). */
export const INTERVAL_DAYS: Record<DonationType, number> = {
  blood: 56,
  plasma: 14,
  platelets: 28,
};

/** Plafond annuel de dons de sang total, selon le sexe. */
export const ANNUAL_BLOOD_CAP: Record<Sex, number> = {
  male: 6,
  female: 4,
  unspecified: 4,
};

export type NextEligible = {
  date: Date | null;
  reason: "interval" | "annualCap" | "reminder" | null;
};

/**
 * Prochaine date à laquelle un don de sang total est possible, d'après l'historique,
 * le plafond annuel et un éventuel rappel manuel. `null` = aucune contrainte connue.
 */
export function nextEligibleDate(state: TrackerState, today: Date = new Date()): NextEligible {
  const candidates: { date: Date; reason: NextEligible["reason"] }[] = [];

  const dated = state.donations
    .map((d) => ({ ...d, parsed: parseIsoDate(d.date) }))
    .filter((d): d is typeof d & { parsed: Date } => d.parsed !== null)
    .sort((a, b) => b.parsed.getTime() - a.parsed.getTime());

  const last = dated[0];
  if (last) {
    candidates.push({ date: addDays(last.parsed, INTERVAL_DAYS[last.type]), reason: "interval" });
  }

  // Plafond annuel : si `cap` dons de sang total sur les 12 derniers mois,
  // le prochain n'est possible qu'un an après le plus ancien de cette fenêtre.
  const cap = ANNUAL_BLOOD_CAP[state.profile.sex];
  const windowStart = addDays(today, -365);
  const bloodInWindow = dated
    .filter((d) => d.type === "blood" && d.parsed.getTime() >= windowStart.getTime())
    .sort((a, b) => a.parsed.getTime() - b.parsed.getTime());
  if (bloodInWindow.length >= cap) {
    candidates.push({ date: addDays(bloodInWindow[0].parsed, 365), reason: "annualCap" });
  }

  const reminder = parseIsoDate(state.reminder?.date);
  if (reminder) {
    candidates.push({ date: reminder, reason: "reminder" });
  }

  const future = candidates.filter((c) => c.date.getTime() > today.getTime());
  if (future.length === 0) return { date: null, reason: null };

  return future.reduce((latest, c) => (c.date.getTime() > latest.date.getTime() ? c : latest));
}
