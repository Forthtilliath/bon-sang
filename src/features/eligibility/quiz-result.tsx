"use client";

import { useEffect, useRef, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { usePersistentState } from "@forthtilliath/react-kit/usePersistentState";

import { buttonClasses } from "@/components/ui/button";
import { cardClasses } from "@/components/ui/card";
import { Drop } from "@/components/ui/drop";
import { EMPTY_TRACKER, TRACKER_STORAGE_KEY, type TrackerState } from "@/features/tracker";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { formatIsoDate } from "@/lib/dates";

import { CRITERIA_UPDATED_AT_DATE } from "./questions";
import type { EligibilityResult, Verdict } from "./types";

// Fond et goutte de chaque verdict (tokens du thème, suivent la bascule clair/sombre).
const VERDICT_STYLES: Record<Verdict, { card: string; drop: string }> = {
  eligible: { card: "bg-ok-subtle", drop: "text-ok" },
  wait: { card: "bg-warn-subtle", drop: "text-warn" },
  check: { card: "bg-info-subtle", drop: "text-info" },
  ineligible: { card: "bg-primary-subtle", drop: "text-primary" },
};

export function QuizResult({
  result,
  onRestart,
  sex,
}: {
  result: EligibilityResult;
  onRestart: () => void;
  /** Réponse à la question « sexe » du quiz, si donnée (`null` sinon). */
  sex?: "female" | "male" | null;
}) {
  const t = useTranslations("Quiz");
  const format = useFormatter();
  const tracker = usePersistentState<TrackerState>(TRACKER_STORAGE_KEY, EMPTY_TRACKER);
  const [remembered, setRemembered] = useState(false);

  // À la soumission, le focus arrive sur le résultat (annoncé par `role="status"`).
  const headingRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Le quiz alimente le profil du suivi : dès que le sexe est renseigné, il est
  // reporté sur le profil s'il n'a jamais été précisé côté suivi (jamais d'écrasement
  // d'un choix déjà fait dans `/mon-suivi`).
  useEffect(() => {
    if (!tracker.hydrated || !sex) return;
    if (tracker.value.profile.sex !== "unspecified") return;
    tracker.setValue((prev) => ({ ...prev, profile: { ...prev.profile, sex } }));
    // `tracker.value`/`tracker.setValue` sont volontairement absents des deps : ils
    // changeraient à chaque écriture, ce qui redéclencherait cet effet en boucle.
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [tracker.hydrated, sex]);

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
        className={cardClasses({
          className: cn("flex gap-4 p-6", VERDICT_STYLES[result.verdict].card),
        })}
      >
        <Drop className={cn("mt-1 size-8 shrink-0", VERDICT_STYLES[result.verdict].drop)} />
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {/* `date` n'est référencé que par `verdicts.waitWithDate.title` ; les autres
              variantes l'ignorent (comportement standard ICU). Le passer systématiquement
              évite un appel conditionnel et permet à `verdictKey` de rester une union
              littérale vérifiée par TypeScript, sans contournement de typage. */}
            {t(`verdicts.${verdictKey}.title`, { date: formattedUntil ?? "" })}
          </h2>
          <p>{t(`verdicts.${verdictKey}.body`)}</p>
        </div>
      </div>

      {result.reasons.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">{t("reasonsTitle")}</h3>
          <ul className="flex flex-col gap-2">
            {result.reasons.map((reason) => (
              <li
                key={reason.id}
                className="border-border bg-surface flex flex-col gap-0.5 rounded-2xl border-2 p-4 text-sm"
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
          <span className="text-ok flex items-center gap-2 text-sm font-medium">
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

      <div className="border-border text-muted border-t-2 border-dashed pt-4 text-xs">
        <p>{t("disclaimer")}</p>
        <p>
          {t("criteriaVersion", {
            date: format.dateTime(CRITERIA_UPDATED_AT_DATE, {
              dateStyle: "short",
            }),
          })}
        </p>
      </div>
    </div>
  );
}
