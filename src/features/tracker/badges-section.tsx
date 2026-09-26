"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";

import { BADGES } from "./badges";
import { Section, type TrackerApi } from "./tracker-ui";

export function Badges({ tracker }: { tracker: TrackerApi }) {
  const t = useTranslations("Tracker");

  return (
    <Section title={t("badges.title")}>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BADGES.map((badge) => {
          const earned = tracker.badges.includes(badge.id);
          return (
            <li
              key={badge.id}
              className={cn(
                "flex flex-col gap-1 rounded-xl border p-4 text-sm",
                earned ? "border-primary/30 bg-primary-subtle" : "border-border bg-surface",
              )}
            >
              <span className="font-medium">{t(`badges.items.${badge.id}.name`)}</span>
              <span className="text-muted text-xs">
                {earned ? t(`badges.items.${badge.id}.hint`) : t("badges.locked")}
              </span>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
