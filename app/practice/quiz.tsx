"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
  const [isAbortModalOpen, setIsAbortModalOpen] = useState(false);
  const [pendingAbortHref, setPendingAbortHref] = useState("/practice");

  const isAttemptActive = activeQuiz !== null && !isComplete;
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

  useEffect(() => {
    if (!isAttemptActive) {
      return;
    }

    function interceptGlobalNavigation(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");

      if (!anchor || anchor.target) {
        return;
      }

      const href = anchor.getAttribute("href");

      if (!href) {
        return;
      }

      const url = new URL(href, window.location.href);
      const isSameOrigin = url.origin === window.location.origin;
      const isGlobalNavPath =
        url.pathname === "/" ||
        url.pathname === "/content" ||
        url.pathname === "/practice";

      if (!isSameOrigin || !isGlobalNavPath) {
        return;
      }

      event.preventDefault();
      requestAbortConfirmation(`${url.pathname}${url.search}${url.hash}`);
    }

    document.addEventListener("click", interceptGlobalNavigation, true);

    return () => {
      document.removeEventListener("click", interceptGlobalNavigation, true);
    };
  }, [isAttemptActive]);

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

  function requestAbortConfirmation(href = "/practice") {
    setPendingAbortHref(href);
    setIsAbortModalOpen(true);
  }

  function continueTest() {
    setIsAbortModalOpen(false);
  }

  function abortAttempt() {
    setIsAbortModalOpen(false);
    setActiveQuiz(null);
    setRemainingSeconds(null);
    setCurrentQuestionIndex(0);
    setAnswersByQuestionId({});
    setMarkedQuestionIds([]);
    setIsComplete(false);
    setReviewFilter("incorrect");
    router.push(pendingAbortHref);
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
    const unansweredCount = reviewedQuestions.filter(
      (reviewedQuestion) => reviewedQuestion.isUnanswered,
    ).length;
    const markedCount = reviewedQuestions.filter(
      (reviewedQuestion) => reviewedQuestion.isMarkedForReview,
    ).length;
    const incorrectCount = totalQuestions - correctCount;
    const percentageScore = Math.round((correctCount / totalQuestions) * 100);
    const filteredQuestions = getFilteredQuestions(
      reviewedQuestions,
      reviewFilter,
    );

    return (
      <section className="mx-auto w-full max-w-7xl">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/75 p-6 shadow-2xl shadow-slate-950/[0.06] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-cyan-950/25 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:items-center">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-950 p-6 text-white shadow-2xl shadow-cyan-950/20 dark:border-white/10 dark:bg-[#07111f]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
                Test complete
              </p>
              <p className="mt-5 text-6xl font-semibold tracking-normal">
                {percentageScore}%
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {correctCount} correct out of {totalQuestions} questions
              </p>
            </div>
            <div>
              <QuizHeader quiz={runningQuiz} />
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <ResultStat label="Correct" value={correctCount} tone="correct" />
                <ResultStat label="Incorrect" value={incorrectCount} tone="incorrect" />
                <ResultStat label="Unanswered" value={unansweredCount} />
                <ResultStat label="Marked" value={markedCount} tone="marked" />
                <ResultStat label="Mode" value={setup.isTimed ? "Timed" : "Untimed"} />
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={restartQuiz}
                  className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-500/15 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-50"
                >
                  Retake Test
                </button>
                <Link
                  href="/practice"
                  className="inline-flex items-center justify-center rounded-md border border-slate-300/80 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:border-white/15 dark:bg-white/[0.06] dark:text-slate-100 dark:hover:border-cyan-200/40 dark:hover:bg-white/[0.1]"
                >
                  Back to Practice
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-5 shadow-xl shadow-slate-950/[0.04] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">
                Review answers
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
                Learn from each response
              </h2>
            </div>
            <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200/80 bg-slate-50/80 p-1 dark:border-white/10 dark:bg-white/[0.045]">
              <ReviewFilterButton filter="incorrect" activeFilter={reviewFilter} onSelect={setReviewFilter}>
                Incorrect
              </ReviewFilterButton>
              <ReviewFilterButton filter="correct" activeFilter={reviewFilter} onSelect={setReviewFilter}>
                Correct
              </ReviewFilterButton>
              <ReviewFilterButton filter="all" activeFilter={reviewFilter} onSelect={setReviewFilter}>
                All
              </ReviewFilterButton>
              <ReviewFilterButton filter="marked" activeFilter={reviewFilter} onSelect={setReviewFilter}>
                Marked For Review
              </ReviewFilterButton>
            </div>
          </div>

          <ol className="mt-6 grid gap-5">
            {filteredQuestions.map((reviewedQuestion) => (
              <ReviewQuestionCard
                key={reviewedQuestion.question.id}
                reviewedQuestion={reviewedQuestion}
              />
            ))}
          </ol>

          {filteredQuestions.length === 0 ? (
            <p className="mt-6 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
              No questions match this filter.
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  const progressPercent = Math.round(
    ((currentQuestionIndex + 1) / runningQuiz.questions.length) * 100,
  );

  return (
    <>
      <section className="mx-auto grid w-full max-w-7xl gap-5 lg:h-[min(820px,calc(100vh-7rem))] lg:min-h-[660px] lg:grid-cols-[300px_1fr]">
        <aside className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-5 shadow-xl shadow-slate-950/[0.05] backdrop-blur-xl dark:border-white/10 dark:bg-[#07111f]/85 dark:shadow-black/20 lg:flex lg:min-h-0 lg:flex-col">
          <QuizHeader quiz={runningQuiz} compact />

          <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">
                  Progress
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
                  {currentQuestionIndex + 1} / {runningQuiz.questions.length}
                </p>
              </div>
              <p className="pb-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                {progressPercent}%
              </p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-violet-300"
                style={{ width: progressPercent + "%" }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => requestAbortConfirmation("/practice")}
            className="mt-4 h-11 w-full rounded-md border border-red-200/80 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/15"
          >
            Abort Test
          </button>

          <div className="mt-5 flex-1 border-t border-slate-200/80 pt-5 dark:border-white/10 lg:min-h-0">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Question navigator
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                answered {Object.keys(answersByQuestionId).length}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-6 gap-2 lg:max-h-[390px] lg:grid-cols-5 lg:overflow-y-auto lg:pr-1">
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
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 lg:grid-cols-1">
              <LegendItem className="border-cyan-300 bg-slate-950 dark:bg-cyan-300" label="Current" />
              <LegendItem className="border-teal-400 bg-teal-100 dark:bg-teal-300/30" label="Answered" />
              <LegendItem className="border-amber-400 bg-amber-100 dark:bg-amber-300/30" label="Marked" />
              <LegendItem className="border-slate-300 bg-white dark:border-white/15 dark:bg-white/5" label="Unanswered" />
            </div>
          </div>
        </aside>

        <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-950/[0.05] backdrop-blur-xl dark:border-white/10 dark:bg-[#07111f]/88 dark:shadow-black/20 lg:flex lg:min-h-0 lg:flex-col">
          <div className="border-b border-slate-200/80 px-6 py-4 dark:border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Question {currentQuestionIndex + 1} of {runningQuiz.questions.length}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  {isMultipleAnswer ? "Multiple answers" : "Single answer"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {remainingSeconds !== null ? (
                  <p className="rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-900 dark:border-amber-300/25 dark:bg-amber-300/10 dark:text-amber-100">
                    {formatRemainingTime(remainingSeconds)} remaining
                  </p>
                ) : (
                  <p className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                    Untimed
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 px-6 py-7 lg:min-h-0 lg:overflow-y-auto sm:px-8">
            <h1 className="text-2xl font-semibold leading-snug tracking-normal text-slate-950 dark:text-white lg:text-3xl">
              {currentQuestion.question}
            </h1>
            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              {isMultipleAnswer ? "Select all that apply. Correctness is shown after submission." : "Select one answer. Correctness is shown after submission."}
            </p>

            <div className="mt-8 grid gap-3">
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = selectedOptionIndexes.includes(optionIndex);

                return (
                  <button
                    key={option + "-" + optionIndex}
                    type="button"
                    onClick={() => selectOption(optionIndex)}
                    aria-pressed={isSelected}
                    className={[
                      "grid min-h-[72px] grid-cols-[2.5rem_1fr] items-center gap-4 rounded-xl border px-4 py-3 text-left text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 sm:text-base",
                      getOptionClassName({ isSelected }),
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition",
                        isSelected
                          ? "border-cyan-400 bg-slate-950 text-white dark:border-cyan-300 dark:bg-cyan-300 dark:text-slate-950"
                          : "border-slate-300 bg-white text-slate-600 dark:border-white/15 dark:bg-white/[0.06] dark:text-slate-300",
                      ].join(" ")}
                    >
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span className="leading-7">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid min-h-[96px] gap-3 border-t border-slate-200/80 bg-slate-50/80 px-6 py-4 dark:border-white/10 dark:bg-white/[0.035] sm:grid-cols-[190px_1fr_180px] sm:items-center">
            <button
              type="button"
              onClick={toggleMarkedForReview}
              className={[
                "h-12 w-full rounded-md border px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2",
                isCurrentQuestionMarked
                  ? "border-amber-400 bg-amber-100 text-amber-950 hover:bg-amber-200 dark:border-amber-300/40 dark:bg-amber-300/15 dark:text-amber-100"
                  : "border-slate-300/80 bg-white/80 text-slate-700 hover:bg-white dark:border-white/15 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:bg-white/[0.1]",
              ].join(" ")}
            >
              {isCurrentQuestionMarked ? "Marked for Review" : "Mark for Review"}
            </button>
            <div className="hidden text-center text-sm font-medium text-slate-500 dark:text-slate-400 sm:block">
              Answers are saved as you move through the test.
            </div>
            {isLastQuestion ? (
              <button
                type="button"
                onClick={submitTest}
                className="h-12 w-full rounded-md bg-slate-950 px-5 text-sm font-semibold text-white shadow-xl shadow-cyan-500/15 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-50"
              >
                Submit Test
              </button>
            ) : (
              <button
                type="button"
                onClick={goToNextQuestion}
                className="h-12 w-full rounded-md bg-slate-950 px-5 text-sm font-semibold text-white shadow-xl shadow-cyan-500/15 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-50"
              >
                Next Question
              </button>
            )}
          </div>
        </div>
      </section>
      <AbortAttemptModal
        isOpen={isAbortModalOpen}
        onAbort={abortAttempt}
        onContinue={continueTest}
      />
    </>
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
    <section className="mx-auto w-full max-w-6xl rounded-[2rem] border border-slate-200/80 bg-white/75 p-6 shadow-2xl shadow-slate-950/[0.06] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-cyan-950/25 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div>
          <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-950 p-6 text-white shadow-2xl shadow-cyan-950/20 dark:border-white/10 dark:bg-[#07111f] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
              {quiz.practiceMode === "course" ? "Course Test" : "Chapter Practice"}
            </p>
            <p className="mt-4 text-sm font-medium text-slate-300">
              {quiz.course}
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
              {quiz.practiceMode === "course" ? "Configure Course Test" : quiz.chapterTitle}
            </h1>
            {quiz.practiceMode !== "course" ? (
              <p className="mt-3 text-sm font-medium text-slate-400">
                Chapter Practice
              </p>
            ) : null}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <SetupStat label="Available" value={totalAvailableQuestions} />
            <SetupStat label="Easy" value={difficultyMix.easy} />
            <SetupStat label="Moderate" value={difficultyMix.moderate} />
            <SetupStat label="Difficult" value={difficultyMix.difficult} />
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5 shadow-xl shadow-slate-950/[0.04] dark:border-white/10 dark:bg-white/[0.045]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">
            Session summary
          </p>
          <div className="mt-5 grid gap-3">
            <SummaryStat label="Questions" value={selectedQuestionCountLabel} />
            <SummaryStat label="Mode" value={setup.isTimed ? "Timed" : "Untimed"} />
            <SummaryStat
              label="Duration"
              value={setup.isTimed ? timedDurationMinutes + " minutes" : "No countdown"}
            />
          </div>
          <button
            type="button"
            onClick={onStart}
            className="mt-5 h-12 w-full rounded-md bg-slate-950 px-6 text-sm font-semibold text-white shadow-xl shadow-cyan-500/15 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-50"
          >
            Start quiz with {effectiveQuestionCount}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/70 p-5 shadow-lg shadow-slate-950/[0.04] dark:border-white/10 dark:bg-white/[0.045] sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
                Question count
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
                Choose session size
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                Selected: {selectedQuestionCountLabel}
              </p>
            </div>
            <label className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200">
              <input
                type="checkbox"
                checked={setup.isAllQuestions}
                onChange={(event) =>
                  updateSetup((currentSetup) => ({
                    ...currentSetup,
                    isAllQuestions: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-cyan-600"
              />
              Practice all questions
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {quickCounts.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQuestionCount(count)}
                className={[
                  "h-11 rounded-md border px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2",
                  !setup.isAllQuestions && setup.count === count
                    ? "border-cyan-300 bg-slate-950 text-white shadow-lg shadow-cyan-500/15 dark:border-cyan-200/35 dark:bg-cyan-300 dark:text-slate-950"
                    : "border-slate-300/80 bg-white/80 text-slate-700 hover:border-cyan-300 hover:bg-white dark:border-white/15 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:border-cyan-200/35 dark:hover:bg-white/[0.1]",
                ].join(" ")}
              >
                {count}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_110px] sm:items-center">
            <input
              type="range"
              min={5}
              max={60}
              value={setup.count}
              onChange={(event) => setQuestionCount(Number(event.target.value))}
              className="w-full accent-cyan-500"
            />
            <input
              type="number"
              min={5}
              max={60}
              value={setup.count}
              onChange={(event) => setQuestionCount(Number(event.target.value))}
              className="h-11 rounded-md border border-slate-300/80 bg-white/80 px-3 text-sm font-semibold text-slate-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:border-white/15 dark:bg-white/[0.06] dark:text-white"
            />
          </div>

          {shouldUseAllAvailable ? (
            <p className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100">
              Only {totalAvailableQuestions} available question
              {totalAvailableQuestions === 1 ? "" : "s"} will be used.
            </p>
          ) : null}
        </div>

        <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/70 p-5 shadow-lg shadow-slate-950/[0.04] dark:border-white/10 dark:bg-white/[0.045] sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-700 dark:text-violet-300">
            Test mode
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
            Pick a pace
          </h2>
          <div className="mt-5 grid gap-3">
            <ModeButton
              isActive={!setup.isTimed}
              label="Practice Mode"
              meta="Untimed"
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
              meta="2 min per question"
              onSelect={() =>
                updateSetup((currentSetup) => ({
                  ...currentSetup,
                  isTimed: true,
                }))
              }
            />
          </div>
          {setup.isTimed ? (
            <p className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50 p-3 text-sm font-medium text-amber-900 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100">
              Estimated duration: {timedDurationMinutes} minutes
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-sm font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300">
        Questions and answer options shuffle when the test starts. Course tests keep balanced chapter coverage where possible.
      </div>
    </section>
  );
}

function AbortAttemptModal({
  isOpen,
  onAbort,
  onContinue,
}: {
  isOpen: boolean;
  onAbort: () => void;
  onContinue: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-700 dark:text-red-300">
          Abort attempt
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
          Are you sure you want to abort this attempt?
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          This attempt will stop immediately and no quiz results will be shown.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onContinue}
            className="h-11 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-200"
          >
            Continue Test
          </button>
          <button
            type="button"
            onClick={onAbort}
            className="h-11 rounded-md bg-red-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:bg-red-600 dark:hover:bg-red-500"
          >
            Abort Attempt
          </button>
        </div>
      </div>
    </div>
  );
}

function SetupStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/75 p-3 dark:border-white/10 dark:bg-white/[0.06]">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
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
        "rounded-xl border p-4 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2",
        isActive
          ? "border-cyan-300 bg-cyan-50 text-cyan-950 shadow-cyan-500/10 dark:border-cyan-200/35 dark:bg-cyan-300/10 dark:text-cyan-100"
          : "border-slate-300/80 bg-white/80 text-slate-700 hover:border-cyan-300 hover:bg-white dark:border-white/15 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:border-cyan-200/35 dark:hover:bg-white/[0.1]",
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
        "rounded-[1.25rem] border p-5 shadow-lg shadow-slate-950/[0.04] dark:shadow-black/20",
        answeredCorrectly
          ? "border-teal-200/80 bg-teal-50/70 dark:border-teal-300/20 dark:bg-teal-300/[0.07]"
          : "border-red-200/80 bg-red-50/70 dark:border-red-300/20 dark:bg-red-300/[0.07]",
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">
              Question {questionIndex + 1}
            </span>
            <span className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">
              {normalizeDifficulty(question.difficulty)}
            </span>
          </div>
          <h3 className="mt-4 text-xl font-semibold leading-snug tracking-normal text-slate-950 dark:text-white">
            {question.question}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {isUnanswered ? <StatusBadge tone="unanswered">Unanswered</StatusBadge> : null}
          {isMarkedForReview ? <StatusBadge tone="marked">Marked for review</StatusBadge> : null}
          <StatusBadge tone={answeredCorrectly ? "correct" : "incorrect"}>
            {answeredCorrectly ? "Correct" : "Incorrect"}
          </StatusBadge>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        {question.options.map((option, optionIndex) => {
          const isSelected = selectedOptionIndexes.includes(optionIndex);
          const isCorrectOption = question.correctOptionIndexes.includes(optionIndex);

          return (
            <div
              key={question.id + "-" + optionIndex}
              className={[
                "rounded-xl border p-4 text-sm leading-6 shadow-sm",
                isCorrectOption
                  ? "border-teal-300/80 bg-teal-50 text-teal-950 dark:border-teal-300/30 dark:bg-teal-300/10 dark:text-teal-100"
                  : "border-slate-200/80 bg-white/80 text-slate-800 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200",
                isSelected && !isCorrectOption
                  ? "border-red-300/80 bg-red-50 text-red-950 dark:border-red-300/30 dark:bg-red-300/10 dark:text-red-100"
                  : "",
              ].join(" ")}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p>{option}</p>
                <div className="flex flex-wrap gap-2">
                  {isSelected ? <AnswerBadge tone="selected">Selected</AnswerBadge> : null}
                  {isCorrectOption ? <AnswerBadge tone="correct">Correct</AnswerBadge> : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <AnswerLine
          label={question.correctOptionIndexes.length > 1 ? "Your answers" : "Your answer"}
          value={userSelectedAnswer}
          tone={answeredCorrectly ? "correct" : "incorrect"}
        />
        <AnswerLine
          label={question.correctOptionIndexes.length > 1 ? "Correct answers" : "Correct answer"}
          value={correctAnswer}
          tone="correct"
        />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.05]">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Explanation
        </p>
        <p className="mt-2 text-base leading-7 text-slate-700 dark:text-slate-200">
          {question.explanation}
        </p>
      </div>
    </li>
  );
}

function ResultStat({
  label,
  tone = "neutral",
  value,
}: {
  label: string;
  tone?: "correct" | "incorrect" | "marked" | "neutral";
  value: string | number;
}) {
  const toneClassNames = {
    correct: "border-teal-200/80 bg-teal-50/80 text-teal-950 dark:border-teal-300/20 dark:bg-teal-300/10 dark:text-teal-100",
    incorrect: "border-red-200/80 bg-red-50/80 text-red-950 dark:border-red-300/20 dark:bg-red-300/10 dark:text-red-100",
    marked: "border-amber-200/80 bg-amber-50/80 text-amber-950 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100",
    neutral: "border-slate-200/80 bg-slate-50/80 text-slate-950 dark:border-white/10 dark:bg-white/[0.05] dark:text-white",
  };

  return (
    <div className={["rounded-xl border p-4", toneClassNames[tone]].join(" ")}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-70">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-normal">{value}</p>
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
        "rounded-xl border p-4",
        tone === "correct"
          ? "border-teal-300/80 bg-white/80 dark:border-teal-300/25 dark:bg-teal-300/10"
          : "border-red-300/80 bg-white/80 dark:border-red-300/25 dark:bg-red-300/10",
      ].join(" ")}
    >
      <p
        className={[
          "text-sm font-semibold",
          tone === "correct" ? "text-teal-700 dark:text-teal-200" : "text-red-700 dark:text-red-200",
        ].join(" ")}
      >
        {label}
      </p>
      <p className="mt-2 text-base leading-7 text-slate-800 dark:text-slate-100">
        {value}
      </p>
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
          ? "bg-teal-700 text-white dark:bg-teal-300 dark:text-slate-950"
          : "bg-slate-800 text-white dark:bg-white dark:text-slate-950",
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
    correct: "bg-teal-700 text-white dark:bg-teal-300 dark:text-slate-950",
    incorrect: "bg-red-700 text-white dark:bg-red-300 dark:text-slate-950",
    marked: "bg-amber-500 text-amber-950 dark:bg-amber-300 dark:text-slate-950",
    unanswered: "bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-950",
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
        "rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2",
        isActive
          ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
          : "text-slate-600 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white",
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
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">
        {quiz.practiceMode === "course" ? "Course Test" : "Chapter Practice"}
      </p>
      <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
        {quiz.course}
      </p>
      <h2
        className={[
          "mt-2 font-semibold tracking-normal text-slate-950 dark:text-white",
          compact ? "text-2xl leading-tight" : "text-3xl sm:text-4xl lg:text-3xl",
        ].join(" ")}
      >
        {quiz.practiceMode === "course" ? "Course Test" : quiz.chapterTitle}
      </h2>
      {quiz.practiceMode !== "course" ? (
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          {quiz.provider}
        </p>
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
    return "flex h-10 w-full items-center justify-center rounded-lg border border-amber-400 bg-slate-950 text-sm font-semibold text-white ring-2 ring-amber-300 transition focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 dark:bg-cyan-300 dark:text-slate-950";
  }

  if (isCurrent) {
    return "flex h-10 w-full items-center justify-center rounded-lg border border-cyan-300 bg-slate-950 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:bg-cyan-300 dark:text-slate-950";
  }

  if (isMarked) {
    return "flex h-10 w-full items-center justify-center rounded-lg border border-amber-400 bg-amber-100 text-sm font-semibold text-amber-950 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 dark:bg-amber-300/20 dark:text-amber-100";
  }

  if (isAnswered) {
    return "flex h-10 w-full items-center justify-center rounded-lg border border-teal-500 bg-teal-100 text-sm font-semibold text-teal-950 transition hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 dark:bg-teal-300/20 dark:text-teal-100";
  }

  return "flex h-10 w-full items-center justify-center rounded-lg border border-slate-300/80 bg-white/80 text-sm font-semibold text-slate-700 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:border-white/15 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:bg-white/[0.08]";
}

function getOptionClassName({ isSelected }: { isSelected: boolean }) {
  if (isSelected) {
    return "border-cyan-400 bg-cyan-50 text-cyan-950 shadow-lg shadow-cyan-500/10 dark:border-cyan-300/35 dark:bg-cyan-300/10 dark:text-cyan-100";
  }

  return "border-slate-200/80 bg-white/80 text-slate-800 hover:border-cyan-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.045] dark:text-slate-200 dark:hover:border-cyan-200/35 dark:hover:bg-white/[0.08]";
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
