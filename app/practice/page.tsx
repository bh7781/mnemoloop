import Link from "next/link";
import Quiz from "./quiz";
import {
  getCourseQuiz,
  getKnowledgeAreas,
  getQuestionBanks,
  getQuiz,
  type KnowledgeAreaSummary,
  type QuestionBankSummary,
} from "./question-data";

export type QuizQuestion = {
  difficulty?: string;
  id: string;
  question: string;
  options: string[];
  correctOptionIndexes: number[];
  explanation: string;
  sourceChapterId?: string;
  sourceChapterTitle?: string;
};

export type QuizData = {
  chapterId: string;
  chapterTitle: string;
  course: string;
  practiceMode?: "chapter" | "course";
  provider: string;
  questions: QuizQuestion[];
};

type PracticePageProps = {
  searchParams: Promise<{
    course?: string | string[];
    questions?: string | string[];
  }>;
};

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const { course, questions } = await searchParams;
  const questionPath = Array.isArray(questions) ? questions[0] : questions;
  const courseKey = Array.isArray(course) ? course[0] : course;

  if (!questionPath && !courseKey) {
    const [knowledgeAreas, questionBanks] = await Promise.all([
      getKnowledgeAreas(),
      getQuestionBanks(),
    ]);

    return (
      <main className="min-h-screen bg-slate-50 px-6 pb-10 pt-12 text-slate-950 dark:bg-[#0b1120] dark:text-white sm:pb-16">
        <PracticeSelection
          knowledgeAreas={knowledgeAreas}
          questionBanks={questionBanks}
        />
      </main>
    );
  }

  const quiz = questionPath
    ? await getQuiz(questionPath)
    : await getCourseQuiz(courseKey);

  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-10 pt-12 text-slate-950 dark:bg-[#0b1120] dark:text-white sm:pb-16">
      {quiz ? (
        <Quiz quiz={quiz} />
      ) : (
        <section className="mx-auto w-full max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
            Practice unavailable
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
            We could not load those questions.
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Try choosing one of the available generated question banks.
          </p>
          <Link
            href="/practice"
            className="mt-8 inline-flex rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
          >
            View practice options
          </Link>
        </section>
      )}
    </main>
  );
}

function PracticeSelection({
  knowledgeAreas,
  questionBanks,
}: {
  knowledgeAreas: KnowledgeAreaSummary[];
  questionBanks: QuestionBankSummary[];
}) {
  const groupedQuestionBanks = groupQuestionBanksByCourse(questionBanks);
  const courseTests = getCourseTests(groupedQuestionBanks);

  return (
    <section className="mx-auto w-full max-w-6xl">
      <GuidedPracticeEntry knowledgeAreas={knowledgeAreas} />

      {questionBanks.length === 0 ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
            No question banks available yet.
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
            Generate question banks for chapters, then return here to start practice.
          </p>
        </div>
      ) : (
        <div id="available-practice" className="mt-8 grid scroll-mt-20 gap-8">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
              Available options
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
              Choose a focused session
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Start with a full course test or drill into one chapter from the
              generated question banks.
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

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
              Chapter Practice
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
              Practice one chapter
            </h2>
            <div className="mt-5 grid gap-6">
              {groupedQuestionBanks.map(([course, banks]) => (
                <section key={course}>
                  <h3 className="text-lg font-semibold tracking-normal text-slate-900 dark:text-slate-100">
                    {course}
                  </h3>
                  <div className="mt-3 grid gap-4">
                    {banks.map((bank) => (
                      <QuestionBankCard key={bank.relativePath} questionBank={bank} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function GuidedPracticeEntry({
  knowledgeAreas,
}: {
  knowledgeAreas: KnowledgeAreaSummary[];
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
            Area selection currently takes you to the available generated
            practice options below.
          </p>
        </div>
      </div>

      <div className="grid gap-4 p-5 dark:bg-slate-900 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
        {knowledgeAreas.length > 0 ? (
          knowledgeAreas.map((knowledgeArea) => (
            <a
              key={knowledgeArea.key}
              href="#available-practice"
              className="group rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-700 dark:hover:bg-slate-900 dark:focus:ring-slate-200"
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
                Review generated chapter and course recall sessions for this
                area.
              </p>
            </a>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
            No generated knowledge areas are available yet.
          </div>
        )}
      </div>
    </section>
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

type CourseTestSummary = {
  chapterCount: number;
  course: string;
  courseKey: string;
  questionCount: number;
};

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
    questionCount: banks.reduce((total, bank) => total + bank.questionCount, 0),
  }));
}
