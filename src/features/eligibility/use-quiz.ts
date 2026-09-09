"use client";

import { useCallback, useMemo, useState } from "react";

import { parseIsoDate } from "@/lib/dates";

import { type Question, visibleQuestions } from "./questions";
import { evaluate } from "./rules";
import type { AnswerValue, Answers } from "./types";

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

export function useQuiz() {
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const questions = useMemo(() => visibleQuestions(answers), [answers]);
  const clampedIndex = Math.min(index, Math.max(0, questions.length - 1));
  const current = questions[clampedIndex];
  const total = questions.length;

  const setAnswer = useCallback((id: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const canAdvance = current ? isAnswered(current, answers) : false;
  const isLast = clampedIndex === questions.length - 1;

  const next = useCallback(() => {
    setIndex((i) => {
      if (i < questions.length - 1) return i + 1;
      setSubmitted(true);
      return i;
    });
  }, [questions.length]);

  const back = useCallback(() => {
    setSubmitted(false);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const restart = useCallback(() => {
    setAnswers({});
    setIndex(0);
    setSubmitted(false);
  }, []);

  const result = useMemo(() => (submitted ? evaluate(answers) : null), [submitted, answers]);

  return {
    answers,
    setAnswer,
    current,
    stepNumber: clampedIndex + 1,
    total,
    canAdvance,
    isFirst: clampedIndex === 0,
    isLast,
    next,
    back,
    restart,
    submitted,
    result,
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
