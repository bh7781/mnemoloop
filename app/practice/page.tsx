import Link from "next/link";
import Quiz from "./quiz";
import {
  getCourseQuiz,
  getKnowledgeAreas,
  getQuestionBanks,
  getQuiz,
} from "./question-data";
import PracticeLanding from "./practice-landing";

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
        <PracticeLanding
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
