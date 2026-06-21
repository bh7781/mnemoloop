"use client";

import { useState } from "react";
import type { QuizData } from "./page";

type QuizProps = {
  quiz: QuizData;
};

export default function Quiz({ quiz }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  );
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const hasAnswered = selectedOptionIndex !== null;
  const isCorrect =
    hasAnswered && selectedOptionIndex === currentQuestion.correctOptionIndex;

  function selectOption(optionIndex: number) {
    if (hasAnswered) {
      return;
    }

    setSelectedOptionIndex(optionIndex);

    if (optionIndex === currentQuestion.correctOptionIndex) {
      setCorrectCount((count) => count + 1);
    }
  }

  function goToNextQuestion() {
    if (currentQuestionIndex === quiz.questions.length - 1) {
      setIsComplete(true);
      return;
    }

    setCurrentQuestionIndex((index) => index + 1);
    setSelectedOptionIndex(null);
  }

  function restartQuiz() {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setCorrectCount(0);
    setIsComplete(false);
  }

  if (isComplete) {
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <QuizHeader quiz={quiz} />
        <div className="border-t border-slate-200 pt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
            Quiz complete
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
            Final score: {correctCount} / {quiz.questions.length}
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            You answered {correctCount} out of {quiz.questions.length} questions
            correctly.
          </p>
          <button
            type="button"
            onClick={restartQuiz}
            className="mt-8 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
          >
            Restart quiz
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <QuizHeader quiz={quiz} />

      <div className="border-t border-slate-200 pt-8">
        <p className="text-sm font-medium text-slate-500">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
          {currentQuestion.question}
        </h1>

        <div className="mt-8 grid gap-3">
          {currentQuestion.options.map((option, optionIndex) => {
            const isSelected = selectedOptionIndex === optionIndex;

            return (
              <button
                key={option}
                type="button"
                onClick={() => selectOption(optionIndex)}
                disabled={hasAnswered}
                className={[
                  "rounded-md border px-4 py-3 text-left text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 sm:text-base",
                  getOptionClassName({ hasAnswered, isSelected }),
                ].join(" ")}
              >
                {option}
              </button>
            );
          })}
        </div>

        {hasAnswered ? (
          <div className="mt-8 rounded-md border border-slate-200 bg-slate-50 p-5">
            <p
              className={[
                "text-sm font-semibold",
                isCorrect ? "text-teal-700" : "text-red-700",
              ].join(" ")}
            >
              {isCorrect ? "Correct" : "Incorrect"}
            </p>
            <p className="mt-2 text-base leading-7 text-slate-700">
              {currentQuestion.explanation}
            </p>
            <button
              type="button"
              onClick={goToNextQuestion}
              className="mt-5 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
            >
              Next question
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function QuizHeader({ quiz }: QuizProps) {
  return (
    <header>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
        {quiz.provider}
      </p>
      <p className="mt-3 text-sm font-medium text-slate-500">{quiz.course}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
        {quiz.chapterTitle}
      </h2>
    </header>
  );
}

function getOptionClassName({
  hasAnswered,
  isSelected,
}: {
  hasAnswered: boolean;
  isSelected: boolean;
}) {
  if (!hasAnswered) {
    return "border-slate-200 bg-white text-slate-800 hover:border-teal-700 hover:bg-teal-50";
  }

  if (isSelected) {
    return "border-teal-700 bg-teal-50 text-teal-950";
  }

  return "border-slate-200 bg-white text-slate-500";
}
