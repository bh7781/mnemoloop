import { access, readdir } from "node:fs/promises";
import path from "node:path";

const contentDirectory = path.join(process.cwd(), "content");
const questionsDirectory = path.join(process.cwd(), "generated", "questions");

type QuestionBankStatus = {
  markdownPath: string;
  questionPath: string;
  exists: boolean;
};

async function main() {
  const markdownPaths = await findMarkdownChapters(contentDirectory);
  const statuses = await Promise.all(
    markdownPaths.map(async (markdownPath) => {
      const questionPath = getQuestionBankPath(markdownPath);

      return {
        markdownPath,
        questionPath,
        exists: await fileExists(questionPath),
      };
    }),
  );

  printSummary(statuses);
}

async function findMarkdownChapters(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const markdownPaths = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return findMarkdownChapters(entryPath);
      }

      if (
        entry.isFile() &&
        entry.name.toLowerCase().endsWith(".md") &&
        entry.name.toLowerCase() !== "readme.md"
      ) {
        return [entryPath];
      }

      return [];
    }),
  );

  return markdownPaths.flat().sort((left, right) => left.localeCompare(right));
}

function getQuestionBankPath(markdownPath: string) {
  const relativeMarkdownPath = path.relative(contentDirectory, markdownPath);
  const parsedPath = path.parse(relativeMarkdownPath);
  const questionBankRelativePath = path.join(
    parsedPath.dir,
    `${parsedPath.name}.questions.json`,
  );

  return path.join(questionsDirectory, questionBankRelativePath);
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function printSummary(statuses: QuestionBankStatus[]) {
  const existing = statuses.filter((status) => status.exists);
  const missing = statuses.filter((status) => !status.exists);

  console.log("Question generation dry run");
  console.log("");
  console.log(`Total markdown chapters found: ${statuses.length}`);
  console.log(`Question banks already existing: ${existing.length}`);
  console.log(`Question banks missing: ${missing.length}`);
  console.log("");

  if (missing.length === 0) {
    console.log("No missing question banks.");
    return;
  }

  console.log("Missing question bank paths:");
  for (const status of missing) {
    console.log(`- ${toProjectRelativePath(status.questionPath)}`);
  }
}

function toProjectRelativePath(filePath: string) {
  return path.relative(process.cwd(), filePath).split(path.sep).join("/");
}

main().catch((error: unknown) => {
  console.error("Failed to scan question banks.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
