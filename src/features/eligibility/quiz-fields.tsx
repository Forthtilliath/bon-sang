"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";
import { inputClasses } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { formatIsoDate } from "@/lib/dates";

import type { Question } from "./questions";
import type { AnswerValue } from "./types";
import { isFutureDate } from "./use-quiz";

export function OptionList({
  name,
  options,
}: {
  name: string;
  options: { key: string; label: string; selected: boolean; onSelect: () => void }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <label
          key={option.key}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3.5 font-medium transition-[background-color,border-color,box-shadow]",
            option.selected
              ? "border-ink bg-primary-subtle shadow-sticker-sm"
              : "border-border bg-bg hover:border-ink",
          )}
        >
          <input
            type="radio"
            name={name}
            checked={option.selected}
            onChange={option.onSelect}
            className="accent-primary size-5"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

export function NumberField({
  question,
  label,
  value,
  onChange,
}: {
  question: Extract<Question, { kind: "number" }>;
  label: string;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}) {
  const t = useTranslations("Quiz");
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={question.min}
        max={question.max}
        value={typeof value === "number" && Number.isFinite(value) ? value : ""}
        onChange={(e) => {
          const next = e.target.valueAsNumber;
          onChange(Number.isFinite(next) ? next : undefined);
        }}
        className={inputClasses("w-32 text-base")}
      />
      <span className="text-muted text-sm">{t(`units.${question.unit}`)}</span>
    </div>
  );
}

export function DateField({
  question,
  label,
  value,
  onChange,
}: {
  question: Extract<Question, { kind: "date" }>;
  label: string;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}) {
  const t = useTranslations("Quiz");
  const id = useId();
  const invalid = question.notFuture && isFutureDate(value);
  // `""` = « je ne sais pas » : une réponse valable, distincte de « pas encore répondu ».
  const dontKnow = value === "";

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          id={id}
          type="date"
          // Doit refléter la vraie date du jour à chaque rendu (borne max du
          // champ) — pas un état à figer une fois pour toutes au montage.
          // eslint-disable-next-line @eslint-react/purity
          max={question.notFuture ? formatIsoDate(new Date()) : undefined}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid || undefined}
          className={inputClasses("text-base")}
        />
        <button
          type="button"
          aria-pressed={dontKnow}
          onClick={() => onChange(dontKnow ? undefined : "")}
          className={cn(
            buttonClasses({ variant: "ghost", size: "sm" }),
            dontKnow && "border-ink bg-accent text-accent-fg hover:bg-accent",
          )}
        >
          {t("dontKnow")}
        </button>
      </div>
      {dontKnow ? <p className="text-muted text-sm">{t("dontKnowActive")}</p> : null}
      {invalid ? <p className="text-primary text-sm font-medium">{t("futureDate")}</p> : null}
    </div>
  );
}
