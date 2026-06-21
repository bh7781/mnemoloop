import Link from "next/link";
import Quiz from "./quiz";
import { getQuiz } from "./question-data";

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
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
            Try opening practice from a chapter with generated questions.
          </p>
          <Link
            href="/practice"
            className="mt-8 inline-flex rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
          >
            Open sample quiz
          </Link>
        </section>
      )}
    </main>
  );
}
