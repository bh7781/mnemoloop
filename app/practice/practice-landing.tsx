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

const progressSteps = ["Area", "Source", "Mode", "Target", "Setup"];

const practiceModes = [
  {
    description: "Balanced recall across every generated chapter in a course.",
    label: "Full Course Test",
    meta: "Course-wide",
    type: "course" as const,
  },
  {
    description: "Pick a course first, then focus on one chapter at a time.",
    label: "Chapter-wise Practice",
    meta: "Focused loop",
    type: "chapter" as const,
  },
  {
    description: "Revisit missed and marked questions from earlier sessions.",
    label: "Weak Questions",
    meta: "Coming soon",
  },
  {
    description: "Practice concepts when they are ready for reinforcement.",
    label: "Due Review",
    meta: "Coming soon",
  },
];

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
        questionBank.relativePath.startsWith(selectedProviderKey + "/"),
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
  const activeStepIndex = getActiveStepIndex({
    selectedArea,
    selectedPracticeType,
    selectedProvider,
  });

  function selectArea(areaKey: string) {
    setSelectedAreaKey(areaKey);
    setSelectedProviderKey(null);
    setSelectedPracticeType(null);
    setSelectedCourseKey(null);
    scrollToSection("source-selection");
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
    <section className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/70 p-4 shadow-2xl shadow-slate-950/[0.06] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] dark:shadow-cyan-950/25 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-300/10" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-400/14" />
        <div className="absolute inset-0 opacity-[0.2] [background-image:linear-gradient(rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.1)_1px,transparent_1px)] [background-size:40px_40px] dark:opacity-[0.12] dark:[background-image:linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px)]" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="min-w-0">
          <PracticeHero />
          <ProgressIndicator activeStepIndex={activeStepIndex} />

          <div className="mt-8 grid gap-6">
            <KnowledgeAreaSelection
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
              <EmptyState />
            ) : selectedProvider && selectedPracticeType === "course" ? (
              <CourseTestOptions
                courseTests={courseTests}
                provider={selectedProvider}
              />
            ) : selectedProvider && selectedPracticeType === "chapter" ? (
              <ChapterPracticeOptions
                groupedQuestionBanks={groupedQuestionBanks}
                onSelectCourse={selectCourse}
                provider={selectedProvider}
                selectedCourseGroup={selectedCourseGroup}
                selectedCourseKey={selectedCourseKey}
              />
            ) : (
              <NextStepPrompt />
            )}
          </div>
        </div>

        <SelectionSummary
          onChangeArea={() => scrollToSection("knowledge-area")}
          onChangeMode={() => scrollToSection("practice-type")}
          onChangeSource={() => scrollToSection("source-selection")}
          selectedArea={selectedArea}
          selectedCourseGroup={selectedCourseGroup}
          selectedPracticeType={selectedPracticeType}
          selectedProvider={selectedProvider}
        />
      </div>
    </section>
  );
}

function PracticeHero() {
  return (
    <header className="rounded-[1.5rem] border border-slate-200/80 bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-cyan-950/20 dark:border-white/10 dark:bg-[#07111f] sm:px-8 sm:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Guided practice
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            What do you want to practice today?
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Choose a knowledge area and Mnemoloop will build a focused recall
            session.
          </p>
        </div>
        <div className="relative min-h-28 w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur sm:w-72">
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="relative grid gap-2 text-sm font-medium text-slate-300">
            <LoopLine label="Notes" tone="cyan" />
            <LoopLine label="Questions" tone="violet" />
            <LoopLine label="Recall loop" tone="teal" />
          </div>
        </div>
      </div>
    </header>
  );
}

function LoopLine({
  label,
  tone,
}: {
  label: string;
  tone: "cyan" | "teal" | "violet";
}) {
  const toneClassNames = {
    cyan: "from-cyan-300 to-cyan-100",
    teal: "from-teal-300 to-emerald-200",
    violet: "from-violet-300 to-fuchsia-200",
  };

  return (
    <div className="flex items-center gap-3">
      <span
        className={[
          "h-2.5 w-2.5 rounded-full bg-gradient-to-r shadow-[0_0_18px_rgba(34,211,238,0.65)]",
          toneClassNames[tone],
        ].join(" ")}
      />
      <span>{label}</span>
      <span className="h-px flex-1 bg-gradient-to-r from-white/30 to-transparent" />
    </div>
  );
}

function ProgressIndicator({ activeStepIndex }: { activeStepIndex: number }) {
  return (
    <nav
      aria-label="Practice setup progress"
      className="mt-6 rounded-2xl border border-slate-200/80 bg-white/65 p-3 shadow-lg shadow-slate-950/[0.04] backdrop-blur dark:border-white/10 dark:bg-white/[0.045]"
    >
      <ol className="grid gap-2 sm:grid-cols-5">
        {progressSteps.map((step, index) => {
          const isDone = index < activeStepIndex;
          const isActive = index === activeStepIndex;

          return (
            <li key={step}>
              <div
                className={[
                  "flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 transition",
                  isActive
                    ? "border-cyan-300/70 bg-cyan-100/70 text-cyan-950 shadow-lg shadow-cyan-500/10 dark:border-cyan-200/35 dark:bg-cyan-300/10 dark:text-cyan-100"
                    : isDone
                      ? "border-teal-300/50 bg-teal-100/60 text-teal-950 dark:border-teal-200/25 dark:bg-teal-300/10 dark:text-teal-100"
                      : "border-slate-200/80 bg-slate-50/80 text-slate-500 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-400",
                ].join(" ")}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/80 text-xs font-semibold shadow-sm dark:bg-white/10">
                  {isDone ? "Done" : index + 1}
                </span>
                <span className="text-sm font-semibold">{step}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function KnowledgeAreaSelection({
  knowledgeAreas,
  onSelectArea,
  selectedAreaKey,
}: {
  knowledgeAreas: KnowledgeAreaSummary[];
  onSelectArea: (areaKey: string) => void;
  selectedAreaKey: string | null;
}) {
  return (
    <section id="knowledge-area" className="scroll-mt-20">
      <SectionHeader
        eyebrow="Step 1"
        title="Choose a knowledge area"
        description="Start broad. Mnemoloop will narrow the session as you choose a source and practice mode."
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {knowledgeAreas.length > 0 ? (
          knowledgeAreas.map((knowledgeArea) => {
            const isSelected = selectedAreaKey === knowledgeArea.key;

            return (
              <button
                key={knowledgeArea.key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectArea(knowledgeArea.key)}
                className={getSelectableCardClassName(isSelected)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-800 dark:bg-cyan-300/10 dark:text-cyan-200">
                      Knowledge area
                    </span>
                    <h2 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
                      {knowledgeArea.label}
                    </h2>
                  </div>
                  <ArrowBadge isSelected={isSelected} />
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Practice generated recall sessions from this folder.
                </p>
                <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_14px_rgba(45,212,191,0.75)]" />
                  {knowledgeArea.providers.length} source
                  {knowledgeArea.providers.length === 1 ? "" : "s"}
                </div>
              </button>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-5 text-sm font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
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
    <section id="source-selection" className="scroll-mt-20">
      <SectionHeader
        eyebrow="Step 2"
        title="Pick the source"
        description="Choose the question collection Mnemoloop should use for this recall session."
      />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {providers.length > 0 ? (
          providers.map((provider) => {
            const isSelected = selectedProviderKey === provider.key;

            return (
              <button
                key={provider.key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectProvider(provider)}
                className={getSelectableCardClassName(isSelected)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {provider.subtitle ? (
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-violet-700 dark:text-violet-300">
                        {provider.subtitle}
                      </p>
                    ) : null}
                    <h3 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
                      {provider.label}
                    </h3>
                  </div>
                  <ArrowBadge isSelected={isSelected} />
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Reveal the courses and chapters with generated question banks.
                </p>
              </button>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-5 text-sm font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
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
    <section id="practice-type" className="scroll-mt-20">
      <SectionHeader
        eyebrow="Step 3"
        title="How would you like to practice?"
        description="Choose the shape of the recall session before selecting a course or chapter."
      />
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {practiceModes.map((mode) => {
          const practiceType = "type" in mode ? mode.type : null;
          const isDisabled = practiceType === null;
          const isSelected = practiceType === selectedPracticeType;

          return (
            <button
              key={mode.label}
              type="button"
              disabled={isDisabled}
              aria-pressed={isSelected}
              onClick={
                practiceType ? () => onSelectPracticeType(practiceType) : undefined
              }
              className={getModeCardClassName({ isDisabled, isSelected })}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold tracking-normal text-slate-950 dark:text-white">
                  {mode.label}
                </h3>
                <span
                  className={[
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    isDisabled
                      ? "bg-violet-100 text-violet-800 dark:bg-violet-300/10 dark:text-violet-200"
                      : "bg-teal-100 text-teal-800 dark:bg-teal-300/10 dark:text-teal-200",
                  ].join(" ")}
                >
                  {mode.meta}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {mode.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
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
    <section id="available-practice" className="scroll-mt-20">
      <SectionHeader
        eyebrow="Step 4A"
        title="Choose a course test"
        description={
          "Start a full course test from " +
          provider.label +
          ". Each option opens the existing setup screen."
        }
      />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {courseTests.map((courseTest) => (
          <CourseTestCard key={courseTest.courseKey} courseTest={courseTest} />
        ))}
      </div>
      {courseTests.length === 0 ? <NoMatches /> : null}
    </section>
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
    <section id="available-practice" className="grid scroll-mt-20 gap-6">
      <div>
        <SectionHeader
          eyebrow="Step 4B"
          title="Choose a course"
          description={
            "Start with a course from " +
            provider.label +
            ", then pick the chapter you want to reinforce."
          }
        />
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
        {courseTests.length === 0 ? <NoMatches /> : null}
      </div>

      {selectedCourseGroup ? (
        <section id="chapter-options" className="scroll-mt-20">
          <SectionHeader
            eyebrow="Target"
            title="Choose a chapter"
            description="Each chapter opens the existing quiz setup screen with the same count, timer, shuffle, and sampling behavior."
          />
          <div className="mt-5 grid gap-4">
            {selectedCourseGroup[1].map((bank) => (
              <QuestionBankCard key={bank.relativePath} questionBank={bank} />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

function CourseTestCard({ courseTest }: { courseTest: CourseTestSummary }) {
  return (
    <article className="group rounded-xl border border-slate-200/80 bg-white/70 p-5 shadow-lg shadow-slate-950/[0.04] transition hover:-translate-y-1 hover:border-cyan-300/60 hover:bg-white dark:border-white/10 dark:bg-white/[0.045] dark:shadow-black/20 dark:hover:border-cyan-200/35 dark:hover:bg-white/[0.07]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">
            Full course
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
            {courseTest.course}
          </h3>
          <StatsRow
            chapterCount={courseTest.chapterCount}
            difficultyMix={courseTest.difficultyMix}
            questionCount={courseTest.questionCount}
          />
        </div>
        <Link
          href={"/practice?course=" + encodeURIComponent(courseTest.courseKey)}
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-500/15 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-50"
        >
          Configure Course Test
        </Link>
      </div>
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
      aria-pressed={isSelected}
      onClick={onSelect}
      className={getSelectableCardClassName(isSelected)}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">
            Course
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
            {courseTest.course}
          </h3>
        </div>
        <ArrowBadge isSelected={isSelected} />
      </div>
      <StatsRow
        chapterCount={courseTest.chapterCount}
        difficultyMix={courseTest.difficultyMix}
        questionCount={courseTest.questionCount}
      />
    </button>
  );
}

function QuestionBankCard({
  questionBank,
}: {
  questionBank: QuestionBankSummary;
}) {
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white/70 p-5 shadow-lg shadow-slate-950/[0.04] transition hover:-translate-y-1 hover:border-teal-300/60 hover:bg-white dark:border-white/10 dark:bg-white/[0.045] dark:shadow-black/20 dark:hover:border-teal-200/35 dark:hover:bg-white/[0.07] sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
          Chapter practice
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
          {questionBank.chapterTitle}
        </h3>
        <StatsRow
          difficultyMix={questionBank.difficultyMix}
          questionCount={questionBank.questionCount}
        />
      </div>
      <Link
        href={"/practice?questions=" + encodeURIComponent(questionBank.relativePath)}
        className="mt-5 inline-flex shrink-0 items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-teal-500/15 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-50 sm:mt-0"
      >
        Configure Chapter Practice
      </Link>
    </article>
  );
}

function SelectionSummary({
  onChangeArea,
  onChangeMode,
  onChangeSource,
  selectedArea,
  selectedCourseGroup,
  selectedPracticeType,
  selectedProvider,
}: {
  onChangeArea: () => void;
  onChangeMode: () => void;
  onChangeSource: () => void;
  selectedArea: KnowledgeAreaSummary | null;
  selectedCourseGroup: [string, QuestionBankSummary[]] | null;
  selectedPracticeType: PracticeType | null;
  selectedProvider: PracticeProviderSummary | null;
}) {
  const practiceTypeLabel = selectedPracticeType
    ? selectedPracticeType === "course"
      ? "Full Course Test"
      : "Chapter-wise Practice"
    : null;

  return (
    <aside className="lg:sticky lg:top-20">
      <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-5 shadow-xl shadow-slate-950/[0.05] backdrop-blur-xl dark:border-white/10 dark:bg-[#07111f]/80 dark:shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">
          Session summary
        </p>
        <div className="mt-5 grid gap-3">
          <SummaryRow
            label="Area"
            onChange={selectedArea ? onChangeArea : undefined}
            value={selectedArea?.label ?? "Choose area"}
          />
          <SummaryRow
            label="Source"
            onChange={selectedProvider ? onChangeSource : undefined}
            value={selectedProvider?.label ?? "Choose source"}
          />
          <SummaryRow
            label="Practice type"
            onChange={practiceTypeLabel ? onChangeMode : undefined}
            value={practiceTypeLabel ?? "Choose mode"}
          />
          <SummaryRow
            label="Target"
            value={
              selectedCourseGroup?.[0] ??
              (selectedPracticeType === "course" ? "Choose course" : "Choose target")
            }
          />
        </div>
        <div className="mt-5 rounded-xl border border-cyan-200/60 bg-cyan-50/70 p-4 text-sm leading-6 text-cyan-950 dark:border-cyan-200/15 dark:bg-cyan-300/10 dark:text-cyan-100">
          Your setup screen appears after you choose a course test or chapter.
        </div>
      </div>
    </aside>
  );
}

function SummaryRow({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange?: () => void;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
        {onChange ? (
          <button
            type="button"
            onClick={onChange}
            className="text-xs font-semibold text-cyan-700 transition hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-100"
          >
            Change
          </button>
        ) : null}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function SectionHeader({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </div>
  );
}

function StatsRow({
  chapterCount,
  difficultyMix,
  questionCount,
}: {
  chapterCount?: number;
  difficultyMix: DifficultyMix;
  questionCount: number;
}) {
  return (
    <div className="mt-5 flex flex-wrap gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
      {typeof chapterCount === "number" ? (
        <MetricPill label="chapters" value={chapterCount} />
      ) : null}
      <MetricPill label="questions" value={questionCount} />
      <DifficultyPill label="easy" value={difficultyMix.easy} />
      <DifficultyPill label="moderate" value={difficultyMix.moderate} />
      <DifficultyPill label="difficult" value={difficultyMix.difficult} />
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 dark:border-white/10 dark:bg-white/[0.06]">
      {value} {label}
    </span>
  );
}

function DifficultyPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 dark:border-white/10 dark:bg-white/[0.06]">
      {label} {value}
    </span>
  );
}

function ArrowBadge({ isSelected }: { isSelected: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={[
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg transition",
        isSelected
          ? "border-cyan-300 bg-cyan-200/70 text-cyan-950 dark:border-cyan-200/40 dark:bg-cyan-300/20 dark:text-cyan-100"
          : "border-slate-200 bg-white/80 text-slate-500 group-hover:border-cyan-300 group-hover:text-cyan-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300 dark:group-hover:border-cyan-200/35 dark:group-hover:text-cyan-200",
      ].join(" ")}
    >
      -&gt;
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
      No question banks available yet. Generate question banks for chapters, then
      return here to start practice.
    </div>
  );
}

function NextStepPrompt() {
  return (
    <div
      id="available-practice"
      className="scroll-mt-20 rounded-xl border border-dashed border-slate-300 bg-white/55 p-6 text-sm font-medium text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300"
    >
      Choose a knowledge area, source, and practice type to reveal matching
      course and chapter options.
    </div>
  );
}

function NoMatches() {
  return (
    <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white/60 p-5 text-sm font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
      No generated question banks match this selection yet.
    </div>
  );
}

function getSelectableCardClassName(isSelected: boolean) {
  return [
    "group rounded-xl border p-5 text-left shadow-lg transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:focus:ring-cyan-200",
    isSelected
      ? "border-cyan-300/80 bg-cyan-50/80 shadow-cyan-500/10 dark:border-cyan-200/35 dark:bg-cyan-300/10 dark:shadow-cyan-950/25"
      : "border-slate-200/80 bg-white/65 shadow-slate-950/[0.04] hover:-translate-y-1 hover:border-cyan-300/60 hover:bg-white dark:border-white/10 dark:bg-white/[0.045] dark:shadow-black/20 dark:hover:border-cyan-200/35 dark:hover:bg-white/[0.07]",
  ].join(" ");
}

function getModeCardClassName({
  isDisabled,
  isSelected,
}: {
  isDisabled: boolean;
  isSelected: boolean;
}) {
  if (isDisabled) {
    return "rounded-xl border border-violet-200/70 bg-violet-50/50 p-5 text-left text-slate-500 opacity-80 shadow-sm dark:border-violet-200/10 dark:bg-violet-300/[0.055] dark:text-slate-400";
  }

  return getSelectableCardClassName(isSelected);
}

function getActiveStepIndex({
  selectedArea,
  selectedPracticeType,
  selectedProvider,
}: {
  selectedArea: KnowledgeAreaSummary | null;
  selectedPracticeType: PracticeType | null;
  selectedProvider: PracticeProviderSummary | null;
}) {
  if (!selectedArea) {
    return 0;
  }

  if (!selectedProvider) {
    return 1;
  }

  if (!selectedPracticeType) {
    return 2;
  }

  return 3;
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
