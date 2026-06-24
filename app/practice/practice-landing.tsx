"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  KnowledgeAreaSummary,
  PracticeProviderSummary,
  QuestionBankSummary,
} from "./question-data";

type PracticeLandingProps = {
  knowledgeAreas: KnowledgeAreaSummary[];
  questionBanks: QuestionBankSummary[];
};

type CourseTestSummary = {
  chapterCount: number;
  course: string;
  courseKey: string;
  difficultyMix: DifficultyMix;
  questionCount: number;
};

type DifficultyMix = {
  difficult: number;
  easy: number;
  moderate: number;
};

type PracticeType = "chapter" | "course";

export default function PracticeLanding({
  knowledgeAreas,
  questionBanks,
}: PracticeLandingProps) {
  const [selectedAreaKey, setSelectedAreaKey] = useState<string | null>(null);
  const [selectedProviderKey, setSelectedProviderKey] = useState<string | null>(
    null,
  );
  const [selectedPracticeType, setSelectedPracticeType] =
    useState<PracticeType | null>(null);
  const [selectedCourseKey, setSelectedCourseKey] = useState<string | null>(null);
  const selectedArea =
    knowledgeAreas.find((knowledgeArea) => knowledgeArea.key === selectedAreaKey) ??
    null;
  const selectedProvider =
    selectedArea?.providers.find(
      (provider) => provider.key === selectedProviderKey,
    ) ?? null;
  const filteredQuestionBanks = selectedProviderKey
    ? questionBanks.filter((questionBank) =>
        questionBank.relativePath.startsWith(`${selectedProviderKey}/`),
      )
    : [];
  const groupedQuestionBanks = useMemo(
    () => groupQuestionBanksByCourse(filteredQuestionBanks),
    [filteredQuestionBanks],
  );
  const courseTests = useMemo(
    () => getCourseTests(groupedQuestionBanks),
    [groupedQuestionBanks],
  );
  const selectedCourseGroup =
    groupedQuestionBanks.find(
      ([, banks]) => banks[0]?.courseKey === selectedCourseKey,
    ) ?? null;

  function selectArea(areaKey: string) {
    setSelectedAreaKey(areaKey);
    setSelectedProviderKey(null);
    setSelectedPracticeType(null);
    setSelectedCourseKey(null);
  }

  function selectProvider(provider: PracticeProviderSummary) {
    setSelectedProviderKey(provider.key);
    setSelectedPracticeType(null);
    setSelectedCourseKey(null);
    scrollToSection("practice-type");
  }

  function selectPracticeType(practiceType: PracticeType) {
    setSelectedPracticeType(practiceType);
    setSelectedCourseKey(null);
    scrollToSection("available-practice");
  }

  function selectCourse(courseKey: string) {
    setSelectedCourseKey(courseKey);
    scrollToSection("chapter-options");
  }

  function scrollToSection(sectionId: string) {
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <GuidedPracticeEntry
        knowledgeAreas={knowledgeAreas}
        onSelectArea={selectArea}
        selectedAreaKey={selectedAreaKey}
      />

      {selectedArea ? (
        <ProviderSelection
          onSelectProvider={selectProvider}
          providers={selectedArea.providers}
          selectedProviderKey={selectedProviderKey}
        />
      ) : null}

      {selectedProvider ? (
        <PracticeTypeSelection
          onSelectPracticeType={selectPracticeType}
          selectedPracticeType={selectedPracticeType}
        />
      ) : null}

      {questionBanks.length === 0 ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
            No question banks available yet.
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
            Generate question banks for chapters, then return here to start practice.
          </p>
        </div>
      ) : selectedProvider && selectedPracticeType === "course" ? (
        <CourseTestOptions courseTests={courseTests} provider={selectedProvider} />
      ) : selectedProvider && selectedPracticeType === "chapter" ? (
        <ChapterPracticeOptions
          groupedQuestionBanks={groupedQuestionBanks}
          onSelectCourse={selectCourse}
          provider={selectedProvider}
          selectedCourseGroup={selectedCourseGroup}
          selectedCourseKey={selectedCourseKey}
        />
      ) : (
        <div
          id="available-practice"
          className="mt-8 scroll-mt-20 rounded-lg border border-dashed border-slate-300 bg-white/70 p-6 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
        >
          Choose a knowledge area, source, and practice type to reveal matching
          course and chapter options.
        </div>
      )}
    </section>
  );
}

function GuidedPracticeEntry({
  knowledgeAreas,
  onSelectArea,
  selectedAreaKey,
}: {
  knowledgeAreas: KnowledgeAreaSummary[];
  onSelectArea: (areaKey: string) => void;
  selectedAreaKey: string | null;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="bg-gradient-to-br from-white via-teal-50/70 to-slate-100 px-6 py-8 dark:from-slate-900 dark:via-teal-950/30 dark:to-slate-950 sm:px-8 sm:py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
          Practice
        </p>
        <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-5xl">
              What do you want to practice today?
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-200">
              Choose a knowledge area and Mnemoloop will build a focused recall
              session.
            </p>
          </div>
          <p className="rounded-lg border border-white/70 bg-white/70 p-4 text-sm font-medium leading-6 text-slate-600 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
            Start with a broad area, then choose the source you want to practice
            from.
          </p>
        </div>
      </div>

      <div className="grid gap-4 p-5 dark:bg-slate-900 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
        {knowledgeAreas.length > 0 ? (
          knowledgeAreas.map((knowledgeArea) => {
            const isSelected = selectedAreaKey === knowledgeArea.key;

            return (
              <button
                key={knowledgeArea.key}
                type="button"
                onClick={() => onSelectArea(knowledgeArea.key)}
                className={[
                  "group rounded-lg border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:hover:border-teal-700 dark:hover:bg-slate-900 dark:focus:ring-slate-200",
                  isSelected
                    ? "border-teal-300 bg-teal-50 dark:border-teal-700 dark:bg-teal-950/30"
                    : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
                      Knowledge area
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
                      {knowledgeArea.label}
                    </h2>
                  </div>
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-lg text-slate-500 transition group-hover:border-teal-300 group-hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:group-hover:border-teal-700 dark:group-hover:text-teal-300"
                  >
                    -&gt;
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Review generated recall sessions for this area.
                </p>
              </button>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
            No generated knowledge areas are available yet.
          </div>
        )}
      </div>
    </section>
  );
}

function ProviderSelection({
  onSelectProvider,
  providers,
  selectedProviderKey,
}: {
  onSelectProvider: (provider: PracticeProviderSummary) => void;
  providers: PracticeProviderSummary[];
  selectedProviderKey: string | null;
}) {
  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
        Source
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
        Choose your practice source
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {providers.length > 0 ? (
          providers.map((provider) => {
            const isSelected = selectedProviderKey === provider.key;

            return (
              <button
                key={provider.key}
                type="button"
                onClick={() => onSelectProvider(provider)}
                className={[
                  "rounded-lg border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:hover:border-teal-700 dark:hover:bg-slate-900 dark:focus:ring-slate-200",
                  isSelected
                    ? "border-teal-300 bg-teal-50 dark:border-teal-700 dark:bg-teal-950/30"
                    : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950",
                ].join(" ")}
              >
                {provider.subtitle ? (
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    {provider.subtitle}
                  </p>
                ) : null}
                <h3 className="mt-2 text-xl font-semibold tracking-normal text-slate-950 dark:text-white">
                  {provider.label}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Reveal generated course and chapter practice options.
                </p>
              </button>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
            No practice sources are available for this area yet.
          </div>
        )}
      </div>
    </section>
  );
}

function PracticeTypeSelection({
  onSelectPracticeType,
  selectedPracticeType,
}: {
  onSelectPracticeType: (practiceType: PracticeType) => void;
  selectedPracticeType: PracticeType | null;
}) {
  return (
    <section
      id="practice-type"
      className="mt-8 scroll-mt-20 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
        Practice type
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
        How would you like to practice?
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PracticeTypeCard
          description="Take a balanced test across the selected course."
          isSelected={selectedPracticeType === "course"}
          label="Full Course Test"
          onSelect={() => onSelectPracticeType("course")}
        />
        <PracticeTypeCard
          description="Pick a course, then practice one chapter at a time."
          isSelected={selectedPracticeType === "chapter"}
          label="Chapter-wise Practice"
          onSelect={() => onSelectPracticeType("chapter")}
        />
        <PracticeTypeCard
          description="Coming Soon"
          disabled
          label="Weak Questions"
        />
        <PracticeTypeCard
          description="Coming Soon"
          disabled
          label="Due Review"
        />
      </div>
    </section>
  );
}

function PracticeTypeCard({
  description,
  disabled = false,
  isSelected = false,
  label,
  onSelect,
}: {
  description: string;
  disabled?: boolean;
  isSelected?: boolean;
  label: string;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={[
        "rounded-lg border p-5 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-slate-200",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-75 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-500"
          : "hover:-translate-y-0.5 hover:border-teal-300 hover:bg-white hover:shadow-md dark:hover:border-teal-700 dark:hover:bg-slate-900",
        isSelected
          ? "border-teal-300 bg-teal-50 dark:border-teal-700 dark:bg-teal-950/30"
          : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950",
      ].join(" ")}
    >
      <h3 className="text-lg font-semibold tracking-normal text-slate-950 dark:text-white">
        {label}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </button>
  );
}

function CourseTestOptions({
  courseTests,
  provider,
}: {
  courseTests: CourseTestSummary[];
  provider: PracticeProviderSummary;
}) {
  return (
    <div id="available-practice" className="mt-8 grid scroll-mt-20 gap-8">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
          Available options
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
          {provider.label}
        </h2>
        {provider.subtitle ? (
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            {provider.subtitle}
          </p>
        ) : null}
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Start a full course test from this source. Each course will open the
          existing quiz setup screen.
        </p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
              Course Test
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
              Test an entire course
            </h2>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Combines all generated chapter question banks.
          </p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {courseTests.map((courseTest) => (
            <CourseTestCard key={courseTest.courseKey} courseTest={courseTest} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ChapterPracticeOptions({
  groupedQuestionBanks,
  onSelectCourse,
  provider,
  selectedCourseGroup,
  selectedCourseKey,
}: {
  groupedQuestionBanks: Array<[string, QuestionBankSummary[]]>;
  onSelectCourse: (courseKey: string) => void;
  provider: PracticeProviderSummary;
  selectedCourseGroup: [string, QuestionBankSummary[]] | null;
  selectedCourseKey: string | null;
}) {
  const courseTests = getCourseTests(groupedQuestionBanks);

  return (
    <div id="available-practice" className="mt-8 grid scroll-mt-20 gap-8">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
          Chapter-wise Practice
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
          {provider.label}
        </h2>
        {provider.subtitle ? (
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            {provider.subtitle}
          </p>
        ) : null}
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Choose a course first, then start practice from an individual chapter.
        </p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
          Courses
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
          Choose a course
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {courseTests.map((courseTest) => (
            <CourseSelectionCard
              courseTest={courseTest}
              isSelected={selectedCourseKey === courseTest.courseKey}
              key={courseTest.courseKey}
              onSelect={() => onSelectCourse(courseTest.courseKey)}
            />
          ))}
        </div>
      </section>

      {selectedCourseGroup ? (
        <section
          id="chapter-options"
          className="scroll-mt-20 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
            Chapters
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
            {selectedCourseGroup[0]}
          </h2>
          <div className="mt-5 grid gap-4">
            {selectedCourseGroup[1].map((bank) => (
              <QuestionBankCard key={bank.relativePath} questionBank={bank} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function QuestionBankCard({
  questionBank,
}: {
  questionBank: QuestionBankSummary;
}) {
  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-teal-200 hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-900 dark:hover:bg-slate-900 sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
          {questionBank.provider}
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-normal text-slate-950 dark:text-white">
          {questionBank.chapterTitle}
        </h3>
        <div className="mt-3 flex flex-wrap gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-900">
            {questionBank.questionCount} questions
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-900">
            easy {questionBank.difficultyMix.easy}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-900">
            moderate {questionBank.difficultyMix.moderate}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-900">
            difficult {questionBank.difficultyMix.difficult}
          </span>
        </div>
      </div>
      <Link
        href={`/practice?questions=${encodeURIComponent(questionBank.relativePath)}`}
        className="mt-5 inline-flex rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 sm:mt-0"
      >
        Start Practice
      </Link>
    </article>
  );
}

function CourseTestCard({ courseTest }: { courseTest: CourseTestSummary }) {
  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-5 transition hover:border-teal-200 hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-900 dark:hover:bg-slate-900">
      <h3 className="text-xl font-semibold tracking-normal text-slate-950 dark:text-white">
        {courseTest.course}
      </h3>
      <div className="mt-3 flex flex-wrap gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-900">
          {courseTest.chapterCount} chapters
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-900">
          {courseTest.questionCount} questions
        </span>
        <DifficultyPill label="easy" value={courseTest.difficultyMix.easy} />
        <DifficultyPill
          label="moderate"
          value={courseTest.difficultyMix.moderate}
        />
        <DifficultyPill
          label="difficult"
          value={courseTest.difficultyMix.difficult}
        />
      </div>
      <Link
        href={`/practice?course=${encodeURIComponent(courseTest.courseKey)}`}
        className="mt-5 inline-flex rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
      >
        Start Course Test
      </Link>
    </article>
  );
}

function CourseSelectionCard({
  courseTest,
  isSelected,
  onSelect,
}: {
  courseTest: CourseTestSummary;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "rounded-md border p-5 text-left shadow-sm transition hover:border-teal-200 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:hover:border-teal-900 dark:hover:bg-slate-900 dark:focus:ring-slate-200",
        isSelected
          ? "border-teal-300 bg-teal-50 dark:border-teal-700 dark:bg-teal-950/30"
          : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950",
      ].join(" ")}
    >
      <h3 className="text-xl font-semibold tracking-normal text-slate-950 dark:text-white">
        {courseTest.course}
      </h3>
      <div className="mt-3 flex flex-wrap gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-900">
          {courseTest.chapterCount} chapters
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-900">
          {courseTest.questionCount} questions
        </span>
        <DifficultyPill label="easy" value={courseTest.difficultyMix.easy} />
        <DifficultyPill
          label="moderate"
          value={courseTest.difficultyMix.moderate}
        />
        <DifficultyPill
          label="difficult"
          value={courseTest.difficultyMix.difficult}
        />
      </div>
    </button>
  );
}

function DifficultyPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-900">
      {label} {value}
    </span>
  );
}

function groupQuestionBanksByCourse(questionBanks: QuestionBankSummary[]) {
  const groupedQuestionBanks = new Map<string, QuestionBankSummary[]>();

  for (const questionBank of questionBanks) {
    const courseQuestionBanks =
      groupedQuestionBanks.get(questionBank.course) ?? [];

    courseQuestionBanks.push(questionBank);
    groupedQuestionBanks.set(questionBank.course, courseQuestionBanks);
  }

  return Array.from(groupedQuestionBanks.entries());
}

function getCourseTests(
  groupedQuestionBanks: Array<[string, QuestionBankSummary[]]>,
): CourseTestSummary[] {
  return groupedQuestionBanks.map(([course, banks]) => ({
    chapterCount: banks.length,
    course,
    courseKey: banks[0]?.courseKey ?? "",
    difficultyMix: banks.reduce(
      (difficultyMix, bank) => ({
        difficult: difficultyMix.difficult + bank.difficultyMix.difficult,
        easy: difficultyMix.easy + bank.difficultyMix.easy,
        moderate: difficultyMix.moderate + bank.difficultyMix.moderate,
      }),
      {
        difficult: 0,
        easy: 0,
        moderate: 0,
      },
    ),
    questionCount: banks.reduce((total, bank) => total + bank.questionCount, 0),
  }));
}
