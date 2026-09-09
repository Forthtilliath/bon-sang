"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatIsoDate } from "@/lib/dates";

import type { Question } from "./questions";
import { QuizResult } from "./quiz-result";
import type { AnswerValue } from "./types";
import { isFutureDate, useQuiz } from "./use-quiz";

/**
 * Le quiz accède aux messages par clés dynamiques (`questions.${id}.label`, …).
 * next-intl ne peut pas les typer statiquement, d'où cette signature permissive
 * limitée au namespace `Quiz`.
 */
type QuizT = ((key: string, values?: Record<string, string | number>) => string) & {
  has: (key: string) => boolean;
};

const useQuizT = () => useTranslations("Quiz") as unknown as QuizT;

export function Quiz() {
  const t = useQuizT();
  const quiz = useQuiz();

  if (quiz.submitted && quiz.result) {
    return <QuizResult result={quiz.result} onRestart={quiz.restart} />;
  }

  const current = quiz.current;
  if (!current) return null;

  const progress = Math.round((quiz.stepNumber / quiz.total) * 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-muted text-sm" aria-live="polite">
          {t("progress", { current: quiz.stepNumber, total: quiz.total })}
        </p>
        <div
          className="bg-surface-strong h-1.5 overflow-hidden rounded-full"
          role="progressbar"
          aria-valuenow={quiz.stepNumber}
          aria-valuemin={1}
          aria-valuemax={quiz.total}
        >
          <div
            className="bg-primary h-full rounded-full transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <QuestionField
        key={current.id}
        question={current}
        value={quiz.answers[current.id]}
        onChange={(value) => quiz.setAnswer(current.id, value)}
      />

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={quiz.back}
          disabled={quiz.isFirst}
          className={buttonClasses({ variant: "ghost", size: "sm" })}
        >
          {t("back")}
        </button>
        <button
          type="button"
          onClick={quiz.next}
          disabled={!quiz.canAdvance}
          className={buttonClasses({ size: "sm" })}
        >
          {quiz.isLast ? t("see") : t("next")}
        </button>
      </div>
    </div>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}) {
  const t = useQuizT();
  const groupId = useId();
  const help = t.has(`questions.${question.id}.help`) ? t(`questions.${question.id}.help`) : null;

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="text-xl font-medium tracking-tight text-balance">
        {t(`questions.${question.id}.label`)}
      </legend>
      {help ? <p className="text-muted -mt-2 text-sm">{help}</p> : null}

      {question.kind === "boolean" ? (
        <OptionList
          name={groupId}
          options={[
            {
              key: "yes",
              label: t("yes"),
              selected: value === true,
              onSelect: () => onChange(true),
            },
            {
              key: "no",
              label: t("no"),
              selected: value === false,
              onSelect: () => onChange(false),
            },
          ]}
        />
      ) : null}

      {question.kind === "choice" ? (
        <OptionList
          name={groupId}
          options={question.options.map((opt) => ({
            key: opt,
            label: t(`questions.${question.id}.options.${opt}`),
            selected: value === opt,
            onSelect: () => onChange(opt),
          }))}
        />
      ) : null}

      {question.kind === "number" ? (
        <NumberField question={question} value={value} onChange={onChange} />
      ) : null}

      {question.kind === "date" ? (
        <DateField question={question} value={value} onChange={onChange} />
      ) : null}
    </fieldset>
  );
}

function OptionList({
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
            "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
            option.selected ? "border-primary bg-primary-subtle" : "border-border hover:bg-surface",
          )}
        >
          <input
            type="radio"
            name={name}
            checked={option.selected}
            onChange={option.onSelect}
            className="accent-primary size-4"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

function NumberField({
  question,
  value,
  onChange,
}: {
  question: Extract<Question, { kind: "number" }>;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}) {
  const t = useQuizT();
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={question.min}
        max={question.max}
        value={typeof value === "number" ? value : ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)}
        className="border-border bg-bg w-28 rounded-xl border px-3 py-2 text-sm"
      />
      <span className="text-muted text-sm">{t(`units.${question.unit}`)}</span>
    </div>
  );
}

function DateField({
  question,
  value,
  onChange,
}: {
  question: Extract<Question, { kind: "date" }>;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}) {
  const t = useQuizT();
  const id = useId();
  const invalid = question.notFuture && isFutureDate(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          id={id}
          type="date"
          max={question.notFuture ? formatIsoDate(new Date()) : undefined}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid || undefined}
          className="border-border bg-bg rounded-xl border px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => onChange("")}
          className={buttonClasses({ variant: "ghost", size: "sm" })}
        >
          {t("dontKnow")}
        </button>
      </div>
      {invalid ? <p className="text-primary text-sm">{t("futureDate")}</p> : null}
    </div>
  );
}
