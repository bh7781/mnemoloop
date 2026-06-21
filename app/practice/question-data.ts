import "server-only";

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import type { QuizData } from "./page";

const questionsDirectory = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  "generated",
  "questions",
);

export const sampleQuestionRelativePath =
  "ai/anthropic-academy/1-claude-101/s1c1-what-is-claude.questions.json";

function getSafeQuestionPath(relativeQuestionPath: string) {
  const segments = relativeQuestionPath.split("/");

  if (
    segments.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    return null;
  }

  const questionPath = path.resolve(questionsDirectory, ...segments);
  const relativePath = path.relative(questionsDirectory, questionPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return questionPath;
}

export async function questionFileExists(relativeQuestionPath: string) {
  const questionPath = getSafeQuestionPath(relativeQuestionPath);

  if (!questionPath) {
    return false;
  }

  try {
    await access(questionPath);
    return true;
  } catch {
    return false;
  }
}

export async function getQuiz(relativeQuestionPath = sampleQuestionRelativePath) {
  const questionPath = getSafeQuestionPath(relativeQuestionPath);

  if (!questionPath) {
    return null;
  }

  try {
    const file = await readFile(questionPath, "utf8");

    return normalizeQuiz(JSON.parse(file));
  } catch {
    return null;
  }
}

type RawQuizQuestion = Omit<QuizData["questions"][number], "correctOptionIndexes"> & {
  correctOptionIndex?: number;
  correctOptionIndexes?: number[];
};

type RawQuizData = Omit<QuizData, "questions"> & {
  questions: RawQuizQuestion[];
};

function normalizeQuiz(rawQuiz: RawQuizData): QuizData {
  return {
    ...rawQuiz,
    questions: rawQuiz.questions.map((question) => {
      const correctOptionIndexes = Array.isArray(question.correctOptionIndexes)
        ? question.correctOptionIndexes
        : [question.correctOptionIndex].filter(
            (index): index is number => typeof index === "number",
          );
      const normalizedQuestion = { ...question };
      delete normalizedQuestion.correctOptionIndex;

      return {
        ...normalizedQuestion,
        correctOptionIndexes,
      };
    }),
  };
}
