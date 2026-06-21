import { readFile } from "node:fs/promises";
import path from "node:path";
import Quiz from "./quiz";

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

const sampleQuestionPath = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  "generated",
  "questions",
  "ai",
  "anthropic-academy",
  "1-claude-101",
  "s1c1-what-is-claude.questions.json",
);

async function getSampleQuiz(): Promise<QuizData> {
  const file = await readFile(sampleQuestionPath, "utf8");

  return JSON.parse(file) as QuizData;
}

export default async function PracticePage() {
  const quiz = await getSampleQuiz();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950 sm:py-16">
      <Quiz quiz={quiz} />
    </main>
  );
}
