"use client";

import { useTranslations } from "next-intl";

import { cardClasses } from "@/components/ui/card";
import { Drop } from "@/components/ui/drop";
import { cn } from "@/lib/cn";

import { BADGES } from "./badges";
import { Section, type TrackerApi } from "./tracker-ui";

export function Badges({ tracker }: { tracker: TrackerApi }) {
  const t = useTranslations("Tracker");

  return (
    <Section title={t("badges.title")}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BADGES.map((badge) => {
          const earned = tracker.badges.includes(badge.id);
          return (
            <li
              key={badge.id}
              className={cardClasses({
                variant: earned ? "sticker" : "outline",
                className: cn(
                  "flex items-start gap-3 p-4 text-sm",
                  earned ? "bg-accent text-accent-fg" : "border-dashed",
                ),
              })}
            >
              <Drop
                filled={earned}
                className={cn("mt-0.5 size-6 shrink-0", earned ? "text-primary" : "text-muted")}
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-display text-base font-semibold">
                  {t(`badges.items.${badge.id}.name`)}
                </span>
                <span className={cn("text-xs", !earned && "text-muted")}>
                  {earned ? t(`badges.items.${badge.id}.hint`) : t("badges.locked")}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
