"use client";

import { useFormatter, useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { daysBetween, formatIsoDate } from "@/lib/dates";
import { downloadTextFile } from "@/lib/download";
import { buildIcs } from "@/lib/ics";

import { Section, type TrackerApi } from "./tracker-ui";

export function NextDonation({ tracker }: { tracker: TrackerApi }) {
  const t = useTranslations("Tracker");
  const format = useFormatter();
  const { date, reason } = tracker.nextEligible;
  const hasDonations = tracker.state.donations.length > 0;

  const handleIcs = () => {
    if (!date) return;
    const ics = buildIcs({
      uid: `bon-sang-${formatIsoDate(date)}@bon-sang`,
      title: t("ics.title"),
      description: t("ics.description"),
      start: date,
    });
    downloadTextFile("don-du-sang.ics", ics, "text/calendar");
  };

  return (
    <Section title={t("next.title")}>
      <div className="border-border bg-surface flex flex-col gap-3 rounded-2xl border p-6">
        {date ? (
          <>
            <p className="text-primary text-2xl font-semibold tracking-tight">
              {format.dateTime(date, { dateStyle: "long" })}
            </p>
            <p className="text-muted text-sm">
              {t("next.inDays", { days: Math.max(0, daysBetween(new Date(), date)) })}
              {reason ? ` · ${t(`next.reason.${reason}`)}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <button type="button" onClick={handleIcs} className={buttonClasses({ size: "sm" })}>
                {t("next.addToCalendar")}
              </button>
              {tracker.state.reminder ? (
                <button
                  type="button"
                  onClick={tracker.clearReminder}
                  className={buttonClasses({ variant: "ghost", size: "sm" })}
                >
                  {t("next.clearReminder")}
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm">{hasDonations ? t("next.now") : t("next.unknown")}</p>
            <div className="mt-1 flex flex-wrap gap-3">
              <Link href="/collectes" className={buttonClasses({ variant: "outline", size: "sm" })}>
                {t("next.findDrive")}
              </Link>
            </div>
          </>
        )}
      </div>
    </Section>
  );
}
