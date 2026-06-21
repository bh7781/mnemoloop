"use client";

import Link from "next/link";
import { useState } from "react";
import type { QuizData } from "./page";

type QuizProps = {
  quiz: QuizData;
};

type AnsweredQuestion = {
  questionId: string;
  selectedOptionIndex: number;
};

export default function Quiz({ quiz }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  );
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<
    AnsweredQuestion[]
  >([]);
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
    setAnsweredQuestions((answers) => [
      ...answers,
      {
        questionId: currentQuestion.id,
        selectedOptionIndex: optionIndex,
      },
    ]);

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
    setAnsweredQuestions([]);
    setIsComplete(false);
  }

  if (isComplete) {
    const totalQuestions = quiz.questions.length;
    const incorrectCount = totalQuestions - correctCount;
    const percentageScore = Math.round((correctCount / totalQuestions) * 100);
    const answersByQuestionId = new Map(
      answeredQuestions.map((answer) => [answer.questionId, answer]),
    );

    return (
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <QuizHeader quiz={quiz} />
        <div className="border-t border-slate-200 pt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
            Quiz complete
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
            Final score: {correctCount} / {totalQuestions}
          </h1>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <ResultStat label="Percentage score" value={`${percentageScore}%`} />
            <ResultStat label="Total correct" value={correctCount} />
            <ResultStat label="Total incorrect" value={incorrectCount} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={restartQuiz}
              className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
            >
              Restart quiz
            </button>
            <Link
              href="/content"
              className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
            >
              Back to content
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
            Review answers
          </h2>
          <ol className="mt-5 grid gap-5">
            {quiz.questions.map((question, questionIndex) => {
              const answer = answersByQuestionId.get(question.id);
              const userSelectedAnswer =
                answer === undefined
                  ? "No answer selected"
                  : question.options[answer.selectedOptionIndex];
              const correctAnswer =
                question.options[question.correctOptionIndex];
              const answeredCorrectly =
                answer?.selectedOptionIndex === question.correctOptionIndex;

              return (
                <li
                  key={question.id}
                  className={[
                    "rounded-lg border p-5",
                    answeredCorrectly
                      ? "border-teal-200 bg-teal-50"
                      : "border-red-200 bg-red-50",
                  ].join(" ")}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">
                        Question {questionIndex + 1}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">
                        {question.question}
                      </h3>
                    </div>
                    <span
                      className={[
                        "inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
                        answeredCorrectly
                          ? "bg-teal-700 text-white"
                          : "bg-red-700 text-white",
                      ].join(" ")}
                    >
                      {answeredCorrectly ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <AnswerLine
                      label="Your answer"
                      value={userSelectedAnswer}
                      tone={answeredCorrectly ? "correct" : "incorrect"}
                    />
                    <AnswerLine
                      label="Correct answer"
                      value={correctAnswer}
                      tone="correct"
                    />
                  </div>

                  <div className="mt-5 rounded-md border border-slate-200 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-700">
                      Explanation
                    </p>
                    <p className="mt-2 text-base leading-7 text-slate-700">
                      {question.explanation}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
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

function ResultStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
        {value}
      </p>
    </div>
  );
}

function AnswerLine({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "correct" | "incorrect";
}) {
  return (
    <div
      className={[
        "rounded-md border bg-white p-4",
        tone === "correct" ? "border-teal-300" : "border-red-300",
      ].join(" ")}
    >
      <p
        className={[
          "text-sm font-semibold",
          tone === "correct" ? "text-teal-700" : "text-red-700",
        ].join(" ")}
      >
        {label}
      </p>
      <p className="mt-1 text-base leading-7 text-slate-800">{value}</p>
    </div>
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
