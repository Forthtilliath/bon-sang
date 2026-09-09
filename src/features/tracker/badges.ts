import { parseIsoDate } from "@/lib/dates";

import type { TrackerState } from "./types";

export type BadgeId = "first" | "three" | "ten" | "regular" | "universal" | "plasma";

type BadgeDef = {
  id: BadgeId;
  earned: (state: TrackerState) => boolean;
};

function spansAtLeastOneYear(dates: Date[]): boolean {
  if (dates.length < 2) return false;
  const times = dates.map((d) => d.getTime());
  return Math.max(...times) - Math.min(...times) >= 365 * 86_400_000;
}

export const BADGES: readonly BadgeDef[] = [
  { id: "first", earned: (s) => s.donations.length >= 1 },
  { id: "three", earned: (s) => s.donations.length >= 3 },
  { id: "ten", earned: (s) => s.donations.length >= 10 },
  {
    id: "regular",
    earned: (s) =>
      spansAtLeastOneYear(
        s.donations.map((d) => parseIsoDate(d.date)).filter((d): d is Date => d !== null),
      ),
  },
  { id: "universal", earned: (s) => s.profile.bloodGroup === "O-" },
  { id: "plasma", earned: (s) => s.donations.some((d) => d.type === "plasma") },
] as const;

export function earnedBadges(state: TrackerState): BadgeId[] {
  return BADGES.filter((badge) => badge.earned(state)).map((badge) => badge.id);
}
