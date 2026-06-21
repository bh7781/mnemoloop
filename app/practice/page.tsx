import Link from "next/link";
import Quiz from "./quiz";
import {
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
};

export type QuizData = {
  chapterId: string;
  chapterTitle: string;
  course: string;
  provider: string;
  questions: QuizQuestion[];
};

type PracticePageProps = {
  searchParams: Promise<{
    questions?: string | string[];
  }>;
};

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const { questions } = await searchParams;
  const questionPath = Array.isArray(questions) ? questions[0] : questions;

  if (!questionPath) {
    const questionBanks = await getQuestionBanks();

    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950 sm:py-16">
        <PracticeSelection questionBanks={questionBanks} />
      </main>
    );
  }

  const quiz = await getQuiz(questionPath);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950 sm:py-16">
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

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
          Practice
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal text-slate-950">
          Practice
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Choose a chapter to practice generated questions.
        </p>
      </div>

      {questionBanks.length === 0 ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
            No question banks available yet.
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Generate question banks for chapters, then return here to start practice.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6">
          {groupedQuestionBanks.map(([course, banks]) => (
            <section
              key={course}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
                {course}
              </h2>
              <div className="mt-5 grid gap-4">
                {banks.map((bank) => (
                  <QuestionBankCard key={bank.relativePath} questionBank={bank} />
                ))}
              </div>
            </section>
          ))}
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
    <article className="rounded-md border border-slate-200 bg-slate-50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
          {questionBank.provider}
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-normal text-slate-950">
          {questionBank.chapterTitle}
        </h3>
        <div className="mt-3 flex flex-wrap gap-2 text-sm font-medium text-slate-600">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
            {questionBank.questionCount} questions
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
            Easy {questionBank.difficultyMix.easy}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
            Moderate {questionBank.difficultyMix.moderate}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
            Difficult {questionBank.difficultyMix.difficult}
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
