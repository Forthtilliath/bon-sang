"use client";

import { useEffect, useId, useRef } from "react";
import { useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";

import type { QuestionMessageKey } from "./i18n-keys";
import type { Question } from "./questions";
import { DateField, NumberField, OptionList } from "./quiz-fields";
import { QuizResult } from "./quiz-result";
import type { AnswerValue } from "./types";
import { useQuiz } from "./use-quiz";

const useQuizT = () => useTranslations("Quiz");

export function Quiz() {
  const t = useQuizT();
  const quiz = useQuiz();

  // Le focus suit le changement d'étape : sur la question (sa `<legend>`), et sur
  // le résultat à la soumission (géré dans `QuizResult`). On ne le déplace qu'à un
  // vrai changement, jamais au premier rendu (arrivée sur la page).
  const legendRef = useRef<HTMLLegendElement>(null);
  const focusKey = quiz.submitted ? "result" : `step-${quiz.stepNumber}`;
  const prevFocusKey = useRef(focusKey);
  useEffect(() => {
    if (prevFocusKey.current === focusKey) return;
    prevFocusKey.current = focusKey;
    if (!quiz.submitted) legendRef.current?.focus();
  }, [focusKey, quiz.submitted]);

  // Les réponses sont restaurées depuis `localStorage` après le montage : on
  // attend l'hydratation pour ne pas afficher l'étape 1 puis sauter à l'étape X.
  if (!quiz.hydrated) {
    return (
      <div className="flex flex-col gap-6" aria-hidden>
        <div className="bg-surface-strong h-1.5 animate-pulse rounded-full" />
        <div className="bg-surface h-8 w-2/3 animate-pulse rounded" />
        <div className="flex flex-col gap-2">
          <div className="bg-surface h-12 animate-pulse rounded-xl" />
          <div className="bg-surface h-12 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (quiz.submitted && quiz.result) {
    const sex = quiz.answers.sex;
    return (
      <QuizResult
        result={quiz.result}
        onRestart={quiz.restart}
        sex={sex === "female" || sex === "male" ? sex : null}
      />
    );
  }

  const current = quiz.current;
  if (!current) return null;

  const progress = Math.round(quiz.progress * 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-muted text-sm" aria-live="polite">
          {t("progress", { current: quiz.stepNumber, total: quiz.total })}
        </p>
        <div
          className="bg-surface-strong h-1.5 overflow-hidden rounded-full"
          role="progressbar"
          aria-label={t("progressLabel")}
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
        legendRef={legendRef}
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
  legendRef,
}: {
  question: Question;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  legendRef: React.Ref<HTMLLegendElement>;
}) {
  const t = useQuizT();
  const groupId = useId();
  const label = t(`questions.${question.id}.label` as QuestionMessageKey);
  const helpKey = `questions.${question.id}.help` as QuestionMessageKey;
  const help = t.has(helpKey) ? t(helpKey) : null;

  return (
    <fieldset className="flex flex-col gap-4">
      <legend
        ref={legendRef}
        tabIndex={-1}
        className="text-xl font-medium tracking-tight text-balance focus:outline-none"
      >
        {label}
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
            label: t(`questions.${question.id}.options.${opt}` as QuestionMessageKey),
            selected: value === opt,
            onSelect: () => onChange(opt),
          }))}
        />
      ) : null}

      {question.kind === "number" ? (
        <NumberField question={question} label={label} value={value} onChange={onChange} />
      ) : null}

      {question.kind === "date" ? (
        <DateField question={question} label={label} value={value} onChange={onChange} />
      ) : null}
    </fieldset>
  );
}
