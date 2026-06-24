"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { QuizData, QuizQuestion } from "./page";

type QuizProps = {
  quiz: QuizData;
};

type AnswersByQuestionId = Record<string, number[]>;

type ReviewFilter = "incorrect" | "correct" | "all" | "marked";

type QuizSetup = {
  count: number;
  isAllQuestions: boolean;
  isTimed: boolean;
};

type ReviewedQuestion = {
  answeredCorrectly: boolean;
  isMarkedForReview: boolean;
  isUnanswered: boolean;
  question: QuizQuestion;
  questionIndex: number;
  selectedOptionIndexes: number[];
};

export default function Quiz({ quiz }: QuizProps) {
  const totalAvailableQuestions = quiz.questions.length;
  const [setup, setSetup] = useState<QuizSetup>({
    count: Math.min(10, Math.max(5, totalAvailableQuestions)),
    isAllQuestions: totalAvailableQuestions < 5,
    isTimed: false,
  });
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answersByQuestionId, setAnswersByQuestionId] =
    useState<AnswersByQuestionId>({});
  const [markedQuestionIds, setMarkedQuestionIds] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("incorrect");

  const questionCountForSetup = setup.isAllQuestions
    ? totalAvailableQuestions
    : setup.count;
  const effectiveQuestionCount = Math.min(
    questionCountForSetup,
    totalAvailableQuestions,
  );
  const selectedQuestionCountLabel = setup.isAllQuestions
    ? "All questions"
    : `${setup.count} questions`;
  const timedDurationMinutes = effectiveQuestionCount * 2;

  useEffect(() => {
    if (!activeQuiz || !setup.isTimed || isComplete) {
      return;
    }

    if (remainingSeconds === null) {
      return;
    }

    if (remainingSeconds <= 0) {
      completeQuiz();
      return;
    }

    const timerId = window.setTimeout(() => {
      setRemainingSeconds((seconds) =>
        seconds === null ? null : Math.max(0, seconds - 1),
      );
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [activeQuiz, isComplete, remainingSeconds, setup.isTimed]);

  if (totalAvailableQuestions === 0) {
    return (
      <section className="mx-auto w-full max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
          Practice unavailable
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
          This question bank is empty.
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
          Generate questions for this content, then return to practice.
        </p>
      </section>
    );
  }

  if (!activeQuiz) {
    return (
      <QuizSetupScreen
        effectiveQuestionCount={effectiveQuestionCount}
        onStart={startQuiz}
        quiz={quiz}
        selectedQuestionCountLabel={selectedQuestionCountLabel}
        setup={setup}
        timedDurationMinutes={timedDurationMinutes}
        totalAvailableQuestions={totalAvailableQuestions}
        updateSetup={setSetup}
      />
    );
  }

  const runningQuiz = activeQuiz;
  const currentQuestion = runningQuiz.questions[currentQuestionIndex];
  const selectedOptionIndexes = getSelectedOptionIndexes(
    answersByQuestionId,
    currentQuestion.id,
  );
  const isMultipleAnswer = currentQuestion.correctOptionIndexes.length > 1;
  const isLastQuestion = currentQuestionIndex === runningQuiz.questions.length - 1;
  const isCurrentQuestionMarked = markedQuestionIds.includes(
    currentQuestion.id,
  );

  function startQuiz() {
    const sampledQuestions =
      setup.isAllQuestions || setup.count >= totalAvailableQuestions
        ? shuffleArray(quiz.questions)
        : quiz.practiceMode === "course"
          ? balancedSampleCourseQuestions(quiz.questions, setup.count)
          : sampleQuestions(quiz.questions, setup.count);
    const preparedQuestions = sampledQuestions.map(shuffleQuestionOptions);

    setActiveQuiz({
      ...quiz,
      questions: preparedQuestions,
    });
    setCurrentQuestionIndex(0);
    setAnswersByQuestionId({});
    setMarkedQuestionIds([]);
    setIsComplete(false);
    setReviewFilter("incorrect");
    setRemainingSeconds(setup.isTimed ? preparedQuestions.length * 2 * 60 : null);
  }

  function completeQuiz() {
    setReviewFilter("incorrect");
    setIsComplete(true);
    setRemainingSeconds(null);
  }

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
      Math.min(index + 1, runningQuiz.questions.length - 1),
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
    const unansweredCount = getUnansweredCount(runningQuiz, answersByQuestionId);

    if (
      unansweredCount > 0 &&
      !window.confirm("You have unanswered questions. Submit anyway?")
    ) {
      return;
    }

    completeQuiz();
  }

  function restartQuiz() {
    startQuiz();
  }

  if (isComplete) {
    const reviewedQuestions = getReviewedQuestions({
      answersByQuestionId,
      markedQuestionIds,
      quiz: runningQuiz,
    });
    const correctCount = reviewedQuestions.filter(
      (reviewedQuestion) => reviewedQuestion.answeredCorrectly,
    ).length;
    const totalQuestions = runningQuiz.questions.length;
    const incorrectCount = totalQuestions - correctCount;
    const percentageScore = Math.round((correctCount / totalQuestions) * 100);
    const filteredQuestions = getFilteredQuestions(
      reviewedQuestions,
      reviewFilter,
    );

    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <QuizHeader quiz={runningQuiz} />
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
    <section className="mx-auto grid w-full max-w-7xl gap-5 lg:h-[min(760px,calc(100vh-7rem))] lg:min-h-[620px] lg:grid-cols-[280px_1fr]">
      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex lg:min-h-0 lg:flex-col">
        <QuizHeader quiz={runningQuiz} compact />
        <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
              {runningQuiz.practiceMode === "course" ? "Course Test" : "Chapter Practice"}
            </p>
              <p className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">
                {runningQuiz.questions.length}
              </p>
            </div>
            <p className="pb-1 text-sm font-medium text-slate-500">
              total questions
            </p>
          </div>
        </div>
        <div className="mt-5 flex-1 border-t border-slate-200 pt-5 lg:min-h-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-800">
              Question navigator
            </p>
            <p className="text-xs font-medium text-slate-500">
              {currentQuestionIndex + 1} / {runningQuiz.questions.length}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-6 gap-2 lg:max-h-[360px] lg:grid-cols-5 lg:overflow-y-auto lg:pr-1">
            {runningQuiz.questions.map((question, questionIndex) => {
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
          <div className="mt-5 grid grid-cols-3 gap-2 text-xs font-medium text-slate-600 lg:grid-cols-1">
            <LegendItem className="border-slate-950 bg-slate-950" label="Current" />
            <LegendItem className="border-teal-600 bg-teal-100" label="Answered" />
            <LegendItem className="border-amber-500 bg-amber-100" label="Marked" />
          </div>
        </div>
      </aside>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm lg:flex lg:min-h-0 lg:flex-col">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-700">
              Question {currentQuestionIndex + 1} of {runningQuiz.questions.length}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {remainingSeconds !== null ? (
                <p className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-900">
                  {formatRemainingTime(remainingSeconds)}
                </p>
              ) : null}
              <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {isMultipleAnswer ? "Multiple answer" : "Single answer"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 py-6 lg:min-h-0 lg:overflow-y-auto">
          <h1 className="text-2xl font-semibold leading-snug tracking-normal text-slate-950 lg:text-[1.7rem]">
            {currentQuestion.question}
          </h1>
          <p className="mt-3 text-sm font-medium text-slate-500">
            {isMultipleAnswer ? "Select all that apply." : "Select one answer."}
          </p>

          <div className="mt-7 grid gap-3">
            {currentQuestion.options.map((option, optionIndex) => {
              const isSelected = selectedOptionIndexes.includes(optionIndex);

              return (
                <button
                  key={`${option}-${optionIndex}`}
                  type="button"
                  onClick={() => selectOption(optionIndex)}
                  aria-pressed={isSelected}
                  className={[
                    "grid min-h-[64px] grid-cols-[2.25rem_1fr] items-center gap-3 rounded-md border px-4 py-3 text-left text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 sm:text-base",
                    getOptionClassName({ isSelected }),
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold",
                      isSelected
                        ? "border-teal-700 bg-teal-700 text-white"
                        : "border-slate-300 bg-white text-slate-600",
                    ].join(" ")}
                  >
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span className="leading-6">{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid min-h-[88px] gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:grid-cols-[180px_1fr_160px] sm:items-center">
          <button
            type="button"
            onClick={toggleMarkedForReview}
            className={[
              "h-12 w-full rounded-md border px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
              isCurrentQuestionMarked
                ? "border-amber-500 bg-amber-100 text-amber-950 hover:bg-amber-200"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
            ].join(" ")}
          >
            {isCurrentQuestionMarked ? "Marked" : "Mark for review"}
          </button>
          <div className="hidden text-center text-sm font-medium text-slate-500 sm:block">
            Answers are saved as you move through the test.
          </div>
          {isLastQuestion ? (
            <button
              type="button"
              onClick={submitTest}
              className="h-12 w-full rounded-md bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
            >
              Submit Test
            </button>
          ) : (
            <button
              type="button"
              onClick={goToNextQuestion}
              className="h-12 w-full rounded-md bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function QuizSetupScreen({
  effectiveQuestionCount,
  onStart,
  quiz,
  selectedQuestionCountLabel,
  setup,
  timedDurationMinutes,
  totalAvailableQuestions,
  updateSetup,
}: {
  effectiveQuestionCount: number;
  onStart: () => void;
  quiz: QuizData;
  selectedQuestionCountLabel: string;
  setup: QuizSetup;
  timedDurationMinutes: number;
  totalAvailableQuestions: number;
  updateSetup: (setup: QuizSetup | ((setup: QuizSetup) => QuizSetup)) => void;
}) {
  const difficultyMix = useMemo(
    () => getDifficultyMix(quiz.questions),
    [quiz.questions],
  );
  const quickCounts = [5, 10, 20, 30, 50, 60];
  const shouldUseAllAvailable =
    setup.isAllQuestions || setup.count > totalAvailableQuestions;

  function setQuestionCount(count: number) {
    updateSetup((currentSetup) => ({
      ...currentSetup,
      count: clampQuestionCount(count),
      isAllQuestions: false,
    }));
  }

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
            {quiz.practiceMode === "course" ? "Course Test" : "Chapter Practice"}
          </p>
          <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
            {quiz.course}
          </p>
          {quiz.practiceMode !== "course" ? (
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-4xl">
              {quiz.chapterTitle}
            </h1>
          ) : (
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-4xl">
              Course Test
            </h1>
          )}
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total available
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
            {totalAvailableQuestions}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SetupStat label="easy" value={difficultyMix.easy} />
        <SetupStat label="moderate" value={difficultyMix.moderate} />
        <SetupStat label="difficult" value={difficultyMix.difficult} />
      </div>

      <div className="grid gap-6 border-t border-slate-200 pt-6 dark:border-slate-800 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-normal text-slate-950 dark:text-white">
                Question count
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Selected: {selectedQuestionCountLabel}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={setup.isAllQuestions}
                onChange={(event) =>
                  updateSetup((currentSetup) => ({
                    ...currentSetup,
                    isAllQuestions: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-teal-700"
              />
              Practice all questions
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {quickCounts.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQuestionCount(count)}
                className={[
                  "h-10 rounded-md border px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
                  !setup.isAllQuestions && setup.count === count
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                {count}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_96px] sm:items-center">
            <input
              type="range"
              min={5}
              max={60}
              value={setup.count}
              onChange={(event) => setQuestionCount(Number(event.target.value))}
              className="w-full accent-teal-700"
            />
            <input
              type="number"
              min={5}
              max={60}
              value={setup.count}
              onChange={(event) => setQuestionCount(Number(event.target.value))}
              className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {shouldUseAllAvailable ? (
            <p className="mt-3 text-sm font-medium text-amber-700 dark:text-amber-300">
              Only {totalAvailableQuestions} available question
              {totalAvailableQuestions === 1 ? "" : "s"} will be used.
            </p>
          ) : null}
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold tracking-normal text-slate-950 dark:text-white">
            Test mode
          </h2>
          <div className="mt-4 grid gap-2">
            <ModeButton
              isActive={!setup.isTimed}
              label="Practice Mode"
              meta="untimed"
              onSelect={() =>
                updateSetup((currentSetup) => ({
                  ...currentSetup,
                  isTimed: false,
                }))
              }
            />
            <ModeButton
              isActive={setup.isTimed}
              label="Timed Test"
              meta="timed"
              onSelect={() =>
                updateSetup((currentSetup) => ({
                  ...currentSetup,
                  isTimed: true,
                }))
              }
            />
          </div>
          {setup.isTimed ? (
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
              Duration: {timedDurationMinutes} minutes
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          The quiz will shuffle questions and answer options when it starts.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="h-12 rounded-md bg-slate-950 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          Start quiz with {effectiveQuestionCount}
        </button>
      </div>
    </section>
  );
}

function SetupStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function ModeButton({
  isActive,
  label,
  meta,
  onSelect,
}: {
  isActive: boolean;
  label: string;
  meta: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "rounded-md border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
        isActive
          ? "border-teal-700 bg-teal-50 text-teal-950"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
      ].join(" ")}
    >
      <span className="block text-sm font-semibold">{label}</span>
      <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.12em] opacity-70">
        {meta}
      </span>
    </button>
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

function QuizHeader({
  compact = false,
  quiz,
}: QuizProps & { compact?: boolean }) {
  return (
    <header>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
        {quiz.practiceMode === "course" ? "Course Test" : "Chapter Practice"}
      </p>
      <p className="mt-3 text-sm font-medium text-slate-500">{quiz.course}</p>
      <h2
        className={[
          "mt-2 font-semibold tracking-normal text-slate-950",
          compact ? "text-2xl leading-tight" : "text-3xl sm:text-4xl lg:text-3xl",
        ].join(" ")}
      >
        {quiz.chapterTitle}
      </h2>
      {quiz.practiceMode !== "course" ? (
        <p className="mt-2 text-sm font-medium text-slate-500">{quiz.provider}</p>
      ) : null}
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
    return "flex h-10 w-full items-center justify-center rounded-md border border-amber-500 bg-slate-950 text-sm font-semibold text-white ring-2 ring-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2";
  }

  if (isCurrent) {
    return "flex h-10 w-full items-center justify-center rounded-md border border-slate-950 bg-slate-950 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2";
  }

  if (isMarked) {
    return "flex h-10 w-full items-center justify-center rounded-md border border-amber-500 bg-amber-100 text-sm font-semibold text-amber-950 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2";
  }

  if (isAnswered) {
    return "flex h-10 w-full items-center justify-center rounded-md border border-teal-600 bg-teal-100 text-sm font-semibold text-teal-950 transition hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2";
  }

  return "flex h-10 w-full items-center justify-center rounded-md border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2";
}

function getOptionClassName({ isSelected }: { isSelected: boolean }) {
  if (isSelected) {
    return "border-teal-700 bg-teal-50 text-teal-950 shadow-md";
  }

  return "border-slate-200 bg-white text-slate-800 hover:border-teal-500 hover:bg-slate-50";
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

function clampQuestionCount(count: number) {
  if (!Number.isFinite(count)) {
    return 5;
  }

  return Math.min(60, Math.max(5, Math.round(count)));
}

function normalizeDifficulty(difficulty: string | undefined) {
  if (difficulty === "easy") {
    return "easy";
  }

  if (difficulty === "difficult" || difficulty === "hard") {
    return "difficult";
  }

  return "moderate";
}

function getDifficultyMix(questions: QuizQuestion[]) {
  return questions.reduce(
    (difficultyMix, question) => {
      difficultyMix[normalizeDifficulty(question.difficulty)] += 1;
      return difficultyMix;
    },
    {
      difficult: 0,
      easy: 0,
      moderate: 0,
    },
  );
}

function shuffleArray<T>(items: T[]) {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[swapIndex]] = [
      shuffledItems[swapIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
}

function shuffleQuestionOptions(question: QuizQuestion): QuizQuestion {
  const shuffledOptions = shuffleArray(
    question.options.map((option, originalIndex) => ({
      isCorrect: question.correctOptionIndexes.includes(originalIndex),
      option,
    })),
  );

  return {
    ...question,
    correctOptionIndexes: shuffledOptions.reduce<number[]>(
      (correctIndexes, option, optionIndex) => {
        if (option.isCorrect) {
          correctIndexes.push(optionIndex);
        }

        return correctIndexes;
      },
      [],
    ),
    options: shuffledOptions.map((option) => option.option),
  };
}

function sampleQuestions(questions: QuizQuestion[], count: number) {
  return shuffleArray(questions).slice(0, Math.min(count, questions.length));
}

function balancedSampleCourseQuestions(
  questions: QuizQuestion[],
  requestedCount: number,
) {
  const groups = new Map<string, QuizQuestion[]>();

  for (const question of questions) {
    const chapterKey =
      question.sourceChapterId ?? question.sourceChapterTitle ?? "course";
    const chapterQuestions = groups.get(chapterKey) ?? [];
    chapterQuestions.push(question);
    groups.set(chapterKey, chapterQuestions);
  }

  const targetCount = Math.min(requestedCount, questions.length);
  const shuffledGroups = shuffleArray(
    Array.from(groups.values()).map((groupQuestions) =>
      shuffleArray(groupQuestions),
    ),
  );
  const selectedQuestions: QuizQuestion[] = [];
  let groupIndex = 0;

  while (selectedQuestions.length < targetCount && shuffledGroups.length > 0) {
    const group = shuffledGroups[groupIndex % shuffledGroups.length];
    const question = group.shift();

    if (question) {
      selectedQuestions.push(question);
    }

    if (group.length === 0) {
      shuffledGroups.splice(groupIndex % shuffledGroups.length, 1);
      groupIndex = 0;
    } else {
      groupIndex += 1;
    }
  }

  return shuffleArray(selectedQuestions);
}

function formatRemainingTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
