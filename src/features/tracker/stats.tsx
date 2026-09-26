"use client";

import { useTranslations } from "next-intl";

import type { BadgeId } from "./badges";
import { Section, type TrackerApi } from "./tracker-ui";
import { DONATION_TYPES } from "./types";

const COUNT_BADGES: readonly { id: BadgeId; threshold: number }[] = [
  { id: "first", threshold: 1 },
  { id: "three", threshold: 3 },
  { id: "ten", threshold: 10 },
];

export function Stats({ tracker }: { tracker: TrackerApi }) {
  const t = useTranslations("Tracker");
  const total = tracker.state.donations.length;
  const nextBadge = COUNT_BADGES.find((badge) => total < badge.threshold);

  return (
    <Section title={t("stats.title")}>
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label={t("stats.total")} value={total} />
        {DONATION_TYPES.map((type) => (
          <StatCard
            key={type}
            label={t(`journal.types.${type}`)}
            value={tracker.state.donations.filter((d) => d.type === type).length}
          />
        ))}
      </div>
      <p className="text-muted text-sm">
        {nextBadge
          ? t("stats.nextBadge", {
              remaining: nextBadge.threshold - total,
              badge: t(`badges.items.${nextBadge.id}.name`),
            })
          : t("stats.allBadges")}
      </p>
    </Section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border bg-surface flex flex-col gap-1 rounded-xl border p-4">
      <span className="text-2xl font-semibold tracking-tight">{value}</span>
      <span className="text-muted text-xs">{label}</span>
    </div>
  );
}
