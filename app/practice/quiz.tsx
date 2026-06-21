"use client";

import { useState, type ReactNode } from "react";
import type { QuizData, QuizQuestion } from "./page";

type QuizProps = {
  quiz: QuizData;
};

type AnswersByQuestionId = Record<string, number[]>;

type ReviewFilter = "incorrect" | "correct" | "all" | "marked";

type ReviewedQuestion = {
  answeredCorrectly: boolean;
  isMarkedForReview: boolean;
  isUnanswered: boolean;
  question: QuizQuestion;
  questionIndex: number;
  selectedOptionIndexes: number[];
};

export default function Quiz({ quiz }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answersByQuestionId, setAnswersByQuestionId] =
    useState<AnswersByQuestionId>({});
  const [markedQuestionIds, setMarkedQuestionIds] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("incorrect");

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedOptionIndexes = getSelectedOptionIndexes(
    answersByQuestionId,
    currentQuestion.id,
  );
  const isMultipleAnswer = currentQuestion.correctOptionIndexes.length > 1;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const isCurrentQuestionMarked = markedQuestionIds.includes(
    currentQuestion.id,
  );

  function selectOption(optionIndex: number) {
    setAnswersByQuestionId((answers) => {
      const existingIndexes = getSelectedOptionIndexes(
        answers,
        currentQuestion.id,
      );
      const nextIndexes = getNextSelectedOptionIndexes({
        existingIndexes,
        isMultipleAnswer,
        optionIndex,
      });
      const nextAnswers = { ...answers };

      if (nextIndexes.length === 0) {
        delete nextAnswers[currentQuestion.id];
        return nextAnswers;
      }

      nextAnswers[currentQuestion.id] = nextIndexes;
      return nextAnswers;
    });
  }

  function goToQuestion(questionIndex: number) {
    setCurrentQuestionIndex(questionIndex);
  }

  function goToNextQuestion() {
    setCurrentQuestionIndex((index) =>
      Math.min(index + 1, quiz.questions.length - 1),
    );
  }

  function toggleMarkedForReview() {
    setMarkedQuestionIds((questionIds) => {
      if (questionIds.includes(currentQuestion.id)) {
        return questionIds.filter(
          (questionId) => questionId !== currentQuestion.id,
        );
      }

      return [...questionIds, currentQuestion.id];
    });
  }

  function submitTest() {
    const unansweredCount = getUnansweredCount(quiz, answersByQuestionId);

    if (
      unansweredCount > 0 &&
      !window.confirm("You have unanswered questions. Submit anyway?")
    ) {
      return;
    }

    setReviewFilter("incorrect");
    setIsComplete(true);
  }

  function restartQuiz() {
    setCurrentQuestionIndex(0);
    setAnswersByQuestionId({});
    setMarkedQuestionIds([]);
    setIsComplete(false);
    setReviewFilter("incorrect");
  }

  if (isComplete) {
    const reviewedQuestions = getReviewedQuestions({
      answersByQuestionId,
      markedQuestionIds,
      quiz,
    });
    const correctCount = reviewedQuestions.filter(
      (reviewedQuestion) => reviewedQuestion.answeredCorrectly,
    ).length;
    const totalQuestions = quiz.questions.length;
    const incorrectCount = totalQuestions - correctCount;
    const percentageScore = Math.round((correctCount / totalQuestions) * 100);
    const filteredQuestions = getFilteredQuestions(
      reviewedQuestions,
      reviewFilter,
    );

    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <QuizHeader quiz={quiz} />
        <div className="border-t border-slate-200 pt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
            Test complete
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
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
            Review answers
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            <ReviewFilterButton
              filter="incorrect"
              activeFilter={reviewFilter}
              onSelect={setReviewFilter}
            >
              Incorrect
            </ReviewFilterButton>
            <ReviewFilterButton
              filter="correct"
              activeFilter={reviewFilter}
              onSelect={setReviewFilter}
            >
              Correct
            </ReviewFilterButton>
            <ReviewFilterButton
              filter="all"
              activeFilter={reviewFilter}
              onSelect={setReviewFilter}
            >
              All
            </ReviewFilterButton>
            <ReviewFilterButton
              filter="marked"
              activeFilter={reviewFilter}
              onSelect={setReviewFilter}
            >
              Marked for Review
            </ReviewFilterButton>
          </div>

          <ol className="mt-5 grid gap-5">
            {filteredQuestions.map((reviewedQuestion) => (
              <ReviewQuestionCard
                key={reviewedQuestion.question.id}
                reviewedQuestion={reviewedQuestion}
              />
            ))}
          </ol>

          {filteredQuestions.length === 0 ? (
            <p className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600">
              No questions match this filter.
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[220px_1fr] lg:p-8">
      <aside className="lg:border-r lg:border-slate-200 lg:pr-6">
        <QuizHeader quiz={quiz} />
        <div className="mt-6 border-t border-slate-200 pt-6">
          <p className="text-sm font-semibold text-slate-700">
            {quiz.questions.length} questions
          </p>
          <div className="mt-4 grid grid-cols-6 gap-2 lg:grid-cols-4">
            {quiz.questions.map((question, questionIndex) => {
              const isCurrent = questionIndex === currentQuestionIndex;
              const isAnswered =
                getSelectedOptionIndexes(answersByQuestionId, question.id)
                  .length > 0;
              const isMarked = markedQuestionIds.includes(question.id);

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => goToQuestion(questionIndex)}
                  aria-current={isCurrent ? "step" : undefined}
                  className={getQuestionNavClassName({
                    isAnswered,
                    isCurrent,
                    isMarked,
                  })}
                >
                  {questionIndex + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-5 grid gap-2 text-xs font-medium text-slate-600">
            <LegendItem className="border-slate-950 bg-slate-950" label="Current" />
            <LegendItem className="border-teal-600 bg-teal-100" label="Answered" />
            <LegendItem className="border-amber-500 bg-amber-100" label="Marked" />
          </div>
        </div>
      </aside>

      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
              {currentQuestion.question}
            </h1>
            <p className="mt-3 text-sm font-medium text-slate-500">
              {isMultipleAnswer ? "Select all that apply." : "Select one answer."}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleMarkedForReview}
            className={[
              "w-fit rounded-md border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
              isCurrentQuestionMarked
                ? "border-amber-500 bg-amber-100 text-amber-950"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            {isCurrentQuestionMarked ? "Marked for review" : "Mark for review"}
          </button>
        </div>

        <div className="mt-8 grid gap-3">
          {currentQuestion.options.map((option, optionIndex) => {
            const isSelected = selectedOptionIndexes.includes(optionIndex);

            return (
              <button
                key={`${option}-${optionIndex}`}
                type="button"
                onClick={() => selectOption(optionIndex)}
                aria-pressed={isSelected}
                className={[
                  "rounded-md border px-4 py-3 text-left text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 sm:text-base",
                  getOptionClassName({ isSelected }),
                ].join(" ")}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6">
          {isLastQuestion ? (
            <button
              type="button"
              onClick={submitTest}
              className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
            >
              Submit Test
            </button>
          ) : (
            <button
              type="button"
              onClick={goToNextQuestion}
              className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewQuestionCard({
  reviewedQuestion,
}: {
  reviewedQuestion: ReviewedQuestion;
}) {
  const {
    answeredCorrectly,
    isMarkedForReview,
    isUnanswered,
    question,
    questionIndex,
    selectedOptionIndexes,
  } = reviewedQuestion;
  const correctAnswer = formatOptionAnswers(
    question.options,
    question.correctOptionIndexes,
  );
  const userSelectedAnswer = formatOptionAnswers(
    question.options,
    selectedOptionIndexes,
  );

  return (
    <li
      className={[
        "rounded-lg border p-5",
        answeredCorrectly ? "border-teal-200 bg-teal-50" : "border-red-200 bg-red-50",
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
        <div className="flex flex-wrap gap-2">
          {isUnanswered ? (
            <StatusBadge tone="unanswered">Unanswered</StatusBadge>
          ) : null}
          {isMarkedForReview ? (
            <StatusBadge tone="marked">Marked for review</StatusBadge>
          ) : null}
          <StatusBadge tone={answeredCorrectly ? "correct" : "incorrect"}>
            {answeredCorrectly ? "Correct" : "Incorrect"}
          </StatusBadge>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        {question.options.map((option, optionIndex) => {
          const isSelected = selectedOptionIndexes.includes(optionIndex);
          const isCorrectOption =
            question.correctOptionIndexes.includes(optionIndex);

          return (
            <div
              key={`${question.id}-${optionIndex}`}
              className={[
                "rounded-md border bg-white p-4 text-sm text-slate-800",
                isCorrectOption ? "border-teal-300 bg-teal-50" : "border-slate-200",
                isSelected && !isCorrectOption ? "border-red-300 bg-red-50" : "",
              ].join(" ")}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p>{option}</p>
                <div className="flex flex-wrap gap-2">
                  {isSelected ? (
                    <AnswerBadge tone="selected">Selected</AnswerBadge>
                  ) : null}
                  {isCorrectOption ? (
                    <AnswerBadge tone="correct">Correct</AnswerBadge>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3">
        <AnswerLine
          label={question.correctOptionIndexes.length > 1 ? "Your answers" : "Your answer"}
          value={userSelectedAnswer}
          tone={answeredCorrectly ? "correct" : "incorrect"}
        />
        <AnswerLine
          label={
            question.correctOptionIndexes.length > 1
              ? "Correct answers"
              : "Correct answer"
          }
          value={correctAnswer}
          tone="correct"
        />
      </div>

      <div className="mt-5 rounded-md border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-700">Explanation</p>
        <p className="mt-2 text-base leading-7 text-slate-700">
          {question.explanation}
        </p>
      </div>
    </li>
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

function AnswerBadge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "selected" | "correct";
}) {
  return (
    <span
      className={[
        "inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em]",
        tone === "correct"
          ? "bg-teal-700 text-white"
          : "bg-slate-800 text-white",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function StatusBadge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "correct" | "incorrect" | "marked" | "unanswered";
}) {
  const toneClassNames = {
    correct: "bg-teal-700 text-white",
    incorrect: "bg-red-700 text-white",
    marked: "bg-amber-500 text-amber-950",
    unanswered: "bg-slate-700 text-white",
  };

  return (
    <span
      className={[
        "inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
        toneClassNames[tone],
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function ReviewFilterButton({
  activeFilter,
  children,
  filter,
  onSelect,
}: {
  activeFilter: ReviewFilter;
  children: ReactNode;
  filter: ReviewFilter;
  onSelect: (filter: ReviewFilter) => void;
}) {
  const isActive = activeFilter === filter;

  return (
    <button
      type="button"
      onClick={() => onSelect(filter)}
      className={[
        "rounded-md border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
        isActive
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={["h-3 w-3 rounded-sm border", className].join(" ")} />
      <span>{label}</span>
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
      <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl lg:text-3xl">
        {quiz.chapterTitle}
      </h2>
    </header>
  );
}

function getQuestionNavClassName({
  isAnswered,
  isCurrent,
  isMarked,
}: {
  isAnswered: boolean;
  isCurrent: boolean;
  isMarked: boolean;
}) {
  if (isCurrent && isMarked) {
    return "rounded-md border border-amber-500 bg-slate-950 px-3 py-2 text-sm font-semibold text-white ring-2 ring-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2";
  }

  if (isCurrent) {
    return "rounded-md border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2";
  }

  if (isMarked) {
    return "rounded-md border border-amber-500 bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2";
  }

  if (isAnswered) {
    return "rounded-md border border-teal-600 bg-teal-100 px-3 py-2 text-sm font-semibold text-teal-950 transition hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2";
  }

  return "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2";
}

function getOptionClassName({ isSelected }: { isSelected: boolean }) {
  if (isSelected) {
    return "border-teal-700 bg-teal-50 text-teal-950";
  }

  return "border-slate-200 bg-white text-slate-800 hover:border-teal-700 hover:bg-teal-50";
}

function getNextSelectedOptionIndexes({
  existingIndexes,
  isMultipleAnswer,
  optionIndex,
}: {
  existingIndexes: number[];
  isMultipleAnswer: boolean;
  optionIndex: number;
}) {
  if (!isMultipleAnswer) {
    return [optionIndex];
  }

  if (existingIndexes.includes(optionIndex)) {
    return existingIndexes.filter((index) => index !== optionIndex);
  }

  return [...existingIndexes, optionIndex];
}

function getSelectedOptionIndexes(
  answersByQuestionId: AnswersByQuestionId,
  questionId: string,
) {
  return answersByQuestionId[questionId] ?? [];
}

function getUnansweredCount(
  quiz: QuizData,
  answersByQuestionId: AnswersByQuestionId,
) {
  return quiz.questions.filter(
    (question) =>
      getSelectedOptionIndexes(answersByQuestionId, question.id).length === 0,
  ).length;
}

function getReviewedQuestions({
  answersByQuestionId,
  markedQuestionIds,
  quiz,
}: {
  answersByQuestionId: AnswersByQuestionId;
  markedQuestionIds: string[];
  quiz: QuizData;
}): ReviewedQuestion[] {
  return quiz.questions.map((question, questionIndex) => {
    const selectedOptionIndexes = getSelectedOptionIndexes(
      answersByQuestionId,
      question.id,
    );
    const isUnanswered = selectedOptionIndexes.length === 0;

    return {
      answeredCorrectly:
        !isUnanswered &&
        areOptionIndexesEqual(selectedOptionIndexes, question.correctOptionIndexes),
      isMarkedForReview: markedQuestionIds.includes(question.id),
      isUnanswered,
      question,
      questionIndex,
      selectedOptionIndexes,
    };
  });
}

function getFilteredQuestions(
  reviewedQuestions: ReviewedQuestion[],
  reviewFilter: ReviewFilter,
) {
  if (reviewFilter === "correct") {
    return reviewedQuestions.filter(
      (reviewedQuestion) => reviewedQuestion.answeredCorrectly,
    );
  }

  if (reviewFilter === "incorrect") {
    return reviewedQuestions.filter(
      (reviewedQuestion) => !reviewedQuestion.answeredCorrectly,
    );
  }

  if (reviewFilter === "marked") {
    return reviewedQuestions.filter(
      (reviewedQuestion) => reviewedQuestion.isMarkedForReview,
    );
  }

  return reviewedQuestions;
}

function areOptionIndexesEqual(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false;
  }

  const sortedLeft = [...left].sort((a, b) => a - b);
  const sortedRight = [...right].sort((a, b) => a - b);

  return sortedLeft.every((index, position) => index === sortedRight[position]);
}

function formatOptionAnswers(options: string[], optionIndexes: number[]) {
  if (optionIndexes.length === 0) {
    return "No answer selected";
  }

  return [...optionIndexes]
    .sort((a, b) => a - b)
    .map((optionIndex) => options[optionIndex])
    .join("; ");
}
