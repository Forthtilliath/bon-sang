"use client";

import { useCallback, useMemo } from "react";

import { usePersistentState } from "@forthtilliath/react-kit/usePersistentState";
import { parseIsoDate } from "@/lib/dates";

import { type Question, visibleQuestions } from "./questions";
import { evaluate } from "./rules";
import type { AnswerValue, Answers } from "./types";

const QUIZ_STORAGE_KEY = "bon-sang:quiz";

type QuizProgress = {
  answers: Answers;
  index: number;
  submitted: boolean;
  /** Fraction (0–1) la plus avancée atteinte : la barre ne recule jamais. */
  peak: number;
};

const EMPTY_PROGRESS: QuizProgress = { answers: {}, index: 0, submitted: false, peak: 0 };

function isAnswered(question: Question, answers: Answers): boolean {
  const value = answers[question.id];
  switch (question.kind) {
    case "boolean":
      return value === true || value === false;
    case "number":
      return typeof value === "number" && value >= question.min && value <= question.max;
    case "choice":
      return typeof value === "string" && question.options.includes(value);
    case "date":
      // "" = « je ne sais pas », réponse valable. Une date future est refusée.
      if (typeof value !== "string") return false;
      if (value === "") return true;
      return parseIsoDate(value) !== null && !(question.notFuture && isFutureDate(value));
  }
}

/** Recadre l'index sur la liste visible et met à jour le pic de progression. */
function reconcile(state: Omit<QuizProgress, "peak">, prevPeak: number): QuizProgress {
  const visible = visibleQuestions(state.answers);
  const index = Math.min(state.index, Math.max(0, visible.length - 1));
  const ratio = visible.length > 0 ? (index + 1) / visible.length : 0;
  return { ...state, index, peak: Math.max(prevPeak, ratio) };
}

export function useQuiz() {
  const {
    value: progress,
    setValue,
    clear,
    hydrated,
  } = usePersistentState<QuizProgress>(QUIZ_STORAGE_KEY, EMPTY_PROGRESS);
  const { answers, submitted } = progress;

  const questions = useMemo(() => visibleQuestions(answers), [answers]);
  const clampedIndex = Math.min(progress.index, Math.max(0, questions.length - 1));
  const current = questions[clampedIndex];
  const total = questions.length;

  const setAnswer = useCallback(
    (id: string, value: AnswerValue) => {
      setValue((prev) =>
        reconcile({ ...prev, answers: { ...prev.answers, [id]: value } }, prev.peak),
      );
    },
    [setValue],
  );

  const canAdvance = current ? isAnswered(current, answers) : false;
  const isLast = clampedIndex === questions.length - 1;

  const next = useCallback(() => {
    setValue((prev) => {
      const visible = visibleQuestions(prev.answers);
      const index = Math.min(prev.index, Math.max(0, visible.length - 1));
      const isLast = index >= visible.length - 1;
      const upcoming = visible[index + 1];
      // On coupe le test dès qu'une réponse rend le don impossible ou à différer, sans
      // attendre la dernière question — sauf si la question suivante précise encore la
      // réponse qui vient de bloquer (ex. la date du tatouage après « tatouage récent ? »,
      // révélée par son `showIf`) : elle est posée quand même, pour ne pas perdre la date
      // de fin d'attente affichée dans le résultat.
      if (
        (isLast || !upcoming?.showIf) &&
        (isLast || evaluate(prev.answers).verdict !== "eligible")
      ) {
        return { ...prev, submitted: true, peak: 1 };
      }
      return reconcile({ ...prev, index: index + 1 }, prev.peak);
    });
  }, [setValue]);

  const back = useCallback(() => {
    setValue((prev) =>
      reconcile({ ...prev, submitted: false, index: Math.max(0, prev.index - 1) }, prev.peak),
    );
  }, [setValue]);

  const restart = useCallback(() => clear(), [clear]);

  const result = useMemo(() => (submitted ? evaluate(answers) : null), [submitted, answers]);

  return {
    answers,
    setAnswer,
    current,
    stepNumber: clampedIndex + 1,
    total,
    // Ne redescend pas quand une question conditionnelle grossit le dénominateur.
    progress: total > 0 ? Math.max(progress.peak, (clampedIndex + 1) / total) : 0,
    canAdvance,
    isFirst: clampedIndex === 0,
    isLast,
    next,
    back,
    restart,
    submitted,
    result,
    hydrated,
  };
}

/** Vrai si la date saisie est dans le futur (interdit pour les questions `notFuture`). */
export function isFutureDate(value: AnswerValue): boolean {
  const date = parseIsoDate(value);
  if (!date) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date.getTime() > today.getTime();
}
