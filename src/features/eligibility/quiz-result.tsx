"use client";

import { useEffect, useRef, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";
import { EMPTY_TRACKER, TRACKER_STORAGE_KEY, type TrackerState } from "@/features/tracker";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { formatIsoDate } from "@/lib/dates";

import type { EligibilityResult, Verdict } from "./types";

type QuizT = (key: string, values?: Record<string, string | number>) => string;

const CARD_STYLES: Record<Verdict, string> = {
  eligible:
    "border-emerald-600/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  wait: "border-amber-600/30 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  check: "border-sky-600/30 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100",
  ineligible: "border-rose-600/30 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100",
};

export function QuizResult({
  result,
  onRestart,
}: {
  result: EligibilityResult;
  onRestart: () => void;
}) {
  const t = useTranslations("Quiz") as unknown as QuizT;
  const format = useFormatter();
  const tracker = usePersistentState<TrackerState>(TRACKER_STORAGE_KEY, EMPTY_TRACKER);
  const [remembered, setRemembered] = useState(false);

  // À la soumission, le focus arrive sur le résultat (annoncé par `role="status"`).
  const headingRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const verdictKey =
    result.verdict === "wait" ? (result.until ? "waitWithDate" : "waitNoDate") : result.verdict;

  const formattedUntil = result.until ? format.dateTime(result.until, { dateStyle: "long" }) : null;
  const canRemember = result.verdict === "wait" && result.until !== null;

  const remember = () => {
    if (!result.until) return;
    tracker.setValue((prev) => ({
      ...prev,
      reminder: { date: formatIsoDate(result.until as Date) },
    }));
    setRemembered(true);
  };

  return (
    <div
      ref={headingRef}
      tabIndex={-1}
      className="flex flex-col gap-6 focus:outline-none"
      role="status"
      aria-live="polite"
    >
      <div
        className={cn("flex flex-col gap-2 rounded-2xl border p-6", CARD_STYLES[result.verdict])}
      >
        <h2 className="text-xl font-semibold tracking-tight">
          {formattedUntil
            ? t(`verdicts.${verdictKey}.title`, { date: formattedUntil })
            : t(`verdicts.${verdictKey}.title`)}
        </h2>
        <p className="text-sm">{t(`verdicts.${verdictKey}.body`)}</p>
      </div>

      {result.reasons.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">{t("reasonsTitle")}</h3>
          <ul className="flex flex-col gap-2">
            {result.reasons.map((reason) => (
              <li
                key={reason.id}
                className="border-border bg-surface flex flex-col gap-0.5 rounded-xl border p-3 text-sm"
              >
                <span>{t(`reasons.${reason.reasonKey}`)}</span>
                {reason.until ? (
                  <span className="text-muted">
                    {t("untilDate", {
                      date: format.dateTime(reason.until, { dateStyle: "long" }),
                    })}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {result.verdict === "eligible" ? (
          <Link href="/collectes" className={buttonClasses()}>
            {t("findDrive")}
          </Link>
        ) : null}
        {canRemember && !remembered ? (
          <button type="button" onClick={remember} className={buttonClasses()}>
            {t("remember")}
          </button>
        ) : null}
        {remembered ? (
          <span className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
            {t("remembered")}
            <Link href="/mon-suivi" className="text-primary font-medium hover:underline">
              {t("openTracker")}
            </Link>
          </span>
        ) : null}
        <button
          type="button"
          onClick={onRestart}
          className={buttonClasses({
            variant: result.verdict === "eligible" ? "ghost" : "outline",
          })}
        >
          {t("restart")}
        </button>
      </div>

      <p className="border-border text-muted border-t pt-4 text-xs">{t("disclaimer")}</p>
    </div>
  );
}
