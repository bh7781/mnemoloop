import Link from "next/link";
import Quiz from "./quiz";
import {
  getCourseQuiz,
  getQuestionBanks,
  getQuiz,
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
    const questionBanks = await getQuestionBanks();

    return (
      <main className="min-h-screen bg-slate-50 px-6 pb-10 pt-12 text-slate-950 dark:bg-[#0b1120] dark:text-white sm:pb-16">
        <PracticeSelection questionBanks={questionBanks} />
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
  questionBanks,
}: {
  questionBanks: QuestionBankSummary[];
}) {
  const groupedQuestionBanks = groupQuestionBanksByCourse(questionBanks);
  const courseTests = getCourseTests(groupedQuestionBanks);

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
          Practice
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal text-slate-950 dark:text-white">
          Practice
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Choose a chapter or take a full course test from generated questions.
        </p>
      </div>

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
        <div className="mt-6 grid gap-8">
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
