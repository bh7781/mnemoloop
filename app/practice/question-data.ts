import "server-only";

import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { QuizData } from "./page";

const questionsDirectory = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  "generated",
  "questions",
);

export type QuestionBankSummary = {
  chapterTitle: string;
  course: string;
  courseKey: string;
  difficultyMix: {
    difficult: number;
    easy: number;
    moderate: number;
  };
  provider: string;
  questionCount: number;
  relativePath: string;
};

export type KnowledgeAreaSummary = {
  key: string;
  label: string;
};

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

export async function getKnowledgeAreas() {
  let entries;

  try {
    entries = await readdir(questionsDirectory, { withFileTypes: true });
  } catch {
    return [];
  }

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      key: entry.name,
      label: formatKnowledgeAreaLabel(entry.name),
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
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

export async function getQuiz(relativeQuestionPath: string | undefined) {
  if (!relativeQuestionPath) {
    return null;
  }

  const questionPath = getSafeQuestionPath(relativeQuestionPath);

  if (!questionPath) {
    return null;
  }

  try {
    const file = await readFile(questionPath, "utf8");
    const quiz = normalizeQuiz(JSON.parse(file));

    return {
      ...quiz,
      practiceMode: "chapter" as const,
      questions: quiz.questions.map((question) => ({
        ...question,
        sourceChapterId: quiz.chapterId,
        sourceChapterTitle: quiz.chapterTitle,
      })),
    };
  } catch {
    return null;
  }
}

export async function getCourseQuiz(courseKey: string | undefined) {
  if (!courseKey) {
    return null;
  }

  const questionBanks = await getQuestionBanks();
  const courseQuestionBanks = questionBanks.filter(
    (questionBank) => questionBank.courseKey === courseKey,
  );

  if (courseQuestionBanks.length === 0) {
    return null;
  }

  const quizzes = await Promise.all(
    courseQuestionBanks.map((questionBank) => getQuiz(questionBank.relativePath)),
  );
  const validQuizzes = quizzes.filter(
    (quiz): quiz is NonNullable<(typeof quizzes)[number]> => quiz !== null,
  );

  if (validQuizzes.length === 0) {
    return null;
  }

  const firstQuiz = validQuizzes[0];

  return {
    chapterId: `${courseKey}-course-test`,
    chapterTitle: "Course Test",
    course: firstQuiz.course,
    practiceMode: "course" as const,
    provider: firstQuiz.provider,
    questions: validQuizzes.flatMap((quiz) => quiz.questions),
  };
}

export async function getQuestionBanks() {
  const questionPaths = await findQuestionFiles(questionsDirectory);
  const summaries = await Promise.all(
    questionPaths.map(async (questionPath) => {
      try {
        const file = await readFile(questionPath, "utf8");
        const quiz = normalizeQuiz(JSON.parse(file));
        const relativePath = path
          .relative(questionsDirectory, questionPath)
          .split(path.sep)
          .join("/");

        return {
          chapterTitle: quiz.chapterTitle,
          course: quiz.course,
          courseKey: getCourseKey(relativePath),
          difficultyMix: getDifficultyMix(quiz),
          provider: quiz.provider,
          questionCount: quiz.questions.length,
          relativePath,
        } satisfies QuestionBankSummary;
      } catch {
        return null;
      }
    }),
  );

  return summaries
    .filter((summary): summary is QuestionBankSummary => summary !== null)
    .sort((left, right) => {
      const courseComparison = left.course.localeCompare(right.course);

      if (courseComparison !== 0) {
        return courseComparison;
      }

      return left.chapterTitle.localeCompare(right.chapterTitle);
    });
}

function getCourseKey(relativeQuestionPath: string) {
  const segments = relativeQuestionPath.split("/");

  return segments.slice(0, 3).join("/");
}

async function findQuestionFiles(directory: string): Promise<string[]> {
  let entries;

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }

  const questionPaths = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return findQuestionFiles(entryPath);
      }

      if (entry.isFile() && entry.name.endsWith(".questions.json")) {
        return [entryPath];
      }

      return [];
    }),
  );

  return questionPaths.flat();
}

function getDifficultyMix(quiz: QuizData) {
  const difficultyMix = {
    difficult: 0,
    easy: 0,
    moderate: 0,
  };

  for (const question of quiz.questions) {
    difficultyMix[normalizeDifficulty(question.difficulty)] += 1;
  }

  return difficultyMix;
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

function formatKnowledgeAreaLabel(folderName: string) {
  if (folderName.length <= 3) {
    return folderName.toUpperCase();
  }

  return folderName
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
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
