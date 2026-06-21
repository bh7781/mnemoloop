import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import matter from "gray-matter";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_MODEL = "claude-haiku-4-5";
const REQUIRED_QUESTION_COUNT = 12;

const contentDirectory = path.join(process.cwd(), "content");
const questionsDirectory = path.join(process.cwd(), "generated", "questions");
const questionGenerationSkillPath = path.join(
  process.cwd(),
  "skills",
  "question-generation",
  "SKILL.md",
);

type CliOptions = {
  generate: boolean;
  chapter?: string;
  limit?: number;
};

type QuestionBankStatus = {
  markdownPath: string;
  questionPath: string;
  exists: boolean;
};

type ChapterMetadata = {
  chapterId: string;
  chapterTitle: string;
  course: string;
  provider: string;
};

type GenerationContext = {
  anthropic: Anthropic;
  questionGenerationRules: string;
};

type GenerateChapterOptions = {
  allowOverwrite: boolean;
  context: GenerationContext;
  markdownPath: string;
};

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options.generate) {
    await runDryRun();
    return;
  }

  if (options.chapter && options.limit !== undefined) {
    throw new Error("Use either --chapter or --limit, not both.");
  }

  if (options.chapter) {
    await generateQuestionsForChapter(options.chapter);
    return;
  }

  if (options.limit !== undefined) {
    await generateMissingQuestionBanks(options.limit);
    return;
  }

  throw new Error(
    "Generation mode requires --chapter content/path/to/chapter.md or --limit <number>.",
  );
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = { generate: false };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--generate") {
      options.generate = true;
      continue;
    }

    if (arg === "--chapter") {
      const chapter = args[index + 1];
      if (!chapter) {
        throw new Error("--chapter requires a markdown file path.");
      }
      options.chapter = chapter;
      index += 1;
      continue;
    }

    if (arg === "--limit") {
      const limitValue = args[index + 1];
      if (!limitValue) {
        throw new Error("--limit requires a positive number.");
      }

      options.limit = parseLimit(limitValue);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function parseLimit(limitValue: string) {
  const limit = Number(limitValue);

  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("--limit must be a positive integer.");
  }

  return limit;
}

async function runDryRun() {
  const statuses = await getQuestionBankStatuses();
  printSummary(statuses);
}

async function generateQuestionsForChapter(chapterArg: string) {
  const markdownPath = getSafeMarkdownPath(chapterArg);
  const context = await createGenerationContext();

  await generateQuestionBankForMarkdown({
    allowOverwrite: true,
    context,
    markdownPath,
  });
}

async function generateMissingQuestionBanks(limit: number) {
  const statuses = await getQuestionBankStatuses();
  const existing = statuses.filter((status) => status.exists);
  const missing = statuses.filter((status) => !status.exists);
  const selected = missing.slice(0, limit);

  console.log("Question generation batch");
  console.log("");
  console.log(`Total markdown chapters found: ${statuses.length}`);
  console.log(`Question banks already existing: ${existing.length}`);
  console.log(`Question banks missing: ${missing.length}`);
  console.log(`Generation limit: ${limit}`);
  console.log("");

  if (selected.length === 0) {
    console.log("No missing question banks to generate.");
    return;
  }

  console.log("Chapters selected for generation:");
  for (const status of selected) {
    console.log(`- ${toProjectRelativePath(status.markdownPath)}`);
  }
  console.log("");

  const context = await createGenerationContext();
  let successCount = 0;
  let failureCount = 0;

  for (const [index, status] of selected.entries()) {
    console.log(
      `[${index + 1}/${selected.length}] Generating ${toProjectRelativePath(
        status.markdownPath,
      )}`,
    );

    try {
      await generateQuestionBankForMarkdown({
        allowOverwrite: false,
        context,
        markdownPath: status.markdownPath,
      });
      successCount += 1;
      console.log(
        `[success] ${toProjectRelativePath(status.questionPath)}`,
      );
    } catch (error) {
      failureCount += 1;
      console.error(
        `[failed] ${toProjectRelativePath(status.markdownPath)}`,
      );
      console.error(error instanceof Error ? error.message : error);
    }

    console.log("");
  }

  console.log("Batch generation complete");
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failureCount}`);
}

async function createGenerationContext(): Promise<GenerationContext> {
  const questionGenerationRules = await readQuestionGenerationSkill();
  config({ path: path.join(process.cwd(), ".env.local"), quiet: true });
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY was not found in .env.local.");
  }

  return {
    anthropic: new Anthropic({ apiKey }),
    questionGenerationRules,
  };
}

async function generateQuestionBankForMarkdown({
  allowOverwrite,
  context,
  markdownPath,
}: GenerateChapterOptions) {
  const markdown = await readFile(markdownPath, "utf8");
  const sourceMarkdownPath = toProjectRelativePath(markdownPath);
  const parsedMarkdown = matter(markdown);
  const metadata = getChapterMetadata(markdownPath, parsedMarkdown.data);
  const outputPath = getQuestionBankPath(markdownPath);

  if (!allowOverwrite && (await fileExists(outputPath))) {
    console.log(`Skipped existing question bank: ${toProjectRelativePath(outputPath)}`);
    return;
  }

  console.log("Generating question bank");
  console.log(`Chapter: ${sourceMarkdownPath}`);
  console.log(`Output: ${toProjectRelativePath(outputPath)}`);
  console.log(`Model: ${DEFAULT_MODEL}`);
  console.log("Using question generation skill: skills/question-generation/SKILL.md");
  console.log("");

  const response = await context.anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 6000,
    temperature: 0.2,
    system: getSystemPrompt(),
    messages: [
      {
        role: "user",
        content: getUserPrompt(
          metadata,
          parsedMarkdown.content,
          context.questionGenerationRules,
          sourceMarkdownPath,
        ),
      },
    ],
  });

  const responseText = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
  const generatedQuiz = parseGeneratedJson(responseText);
  const validationErrors = validateGeneratedQuiz(generatedQuiz, metadata);

  if (validationErrors.length > 0) {
    throw new Error(
      [
        "Generated JSON failed validation. Existing file was not overwritten.",
        ...validationErrors.map((error) => `- ${error}`),
      ].join("\n"),
    );
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(generatedQuiz, null, 2)}\n`);

  console.log("Question bank generated successfully.");
  console.log(`Wrote ${toProjectRelativePath(outputPath)}`);
}

async function readQuestionGenerationSkill() {
  try {
    return await readFile(questionGenerationSkillPath, "utf8");
  } catch {
    throw new Error(
      "Question generation skill file is missing: skills/question-generation/SKILL.md",
    );
  }
}

async function getQuestionBankStatuses() {
  const markdownPaths = await findMarkdownChapters(contentDirectory);

  return Promise.all(
    markdownPaths.map(async (markdownPath) => {
      const questionPath = getQuestionBankPath(markdownPath);

      return {
        markdownPath,
        questionPath,
        exists: await fileExists(questionPath),
      };
    }),
  );
}

async function findMarkdownChapters(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const markdownPaths = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return findMarkdownChapters(entryPath);
      }

      if (isChapterMarkdown(entry.name)) {
        return [entryPath];
      }

      return [];
    }),
  );

  return markdownPaths.flat().sort((left, right) => left.localeCompare(right));
}

function getSafeMarkdownPath(chapterArg: string) {
  const markdownPath = path.resolve(process.cwd(), chapterArg);
  const relativePath = path.relative(contentDirectory, markdownPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("--chapter must point to a markdown file under content/.");
  }

  if (!isChapterMarkdown(path.basename(markdownPath))) {
    throw new Error("--chapter must point to a non-README .md file.");
  }

  return markdownPath;
}

function isChapterMarkdown(fileName: string) {
  return (
    fileName.toLowerCase().endsWith(".md") &&
    fileName.toLowerCase() !== "readme.md"
  );
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

function getChapterMetadata(
  markdownPath: string,
  frontmatter: Record<string, unknown>,
): ChapterMetadata {
  const relativePath = path.relative(contentDirectory, markdownPath);
  const segments = relativePath.split(path.sep);

  return {
    chapterId: getString(frontmatter.id) ?? path.parse(markdownPath).name,
    chapterTitle:
      getString(frontmatter.chapter) ??
      getString(frontmatter.title) ??
      path.parse(markdownPath).name,
    course:
      getString(frontmatter.course_name) ??
      getString(frontmatter.course) ??
      titleCaseSlug(segments.at(-2) ?? ""),
    provider:
      getString(frontmatter.provider) ??
      titleCaseSlug(segments.at(1) ?? "unknown-provider"),
  };
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

function getSystemPrompt() {
  return [
    "You generate certification-prep quiz question banks from source course markdown.",
    "Use only the provided source content. Do not invent unsupported facts.",
    "Apply the provided question generation rules, including source-path-specific style rules.",
    "Return only valid JSON. Do not include markdown fences, comments, or prose outside the JSON object.",
  ].join(" ");
}

function getUserPrompt(
  metadata: ChapterMetadata,
  chapterContent: string,
  questionGenerationRules: string,
  sourceMarkdownPath: string,
) {
  return `Create exactly ${REQUIRED_QUESTION_COUNT} quiz questions for this chapter.

The following question generation rules are mandatory. Follow them even if they conflict with weaker wording elsewhere in this prompt:

${questionGenerationRules}

Source markdown path:
${sourceMarkdownPath}

Apply the context-specific rules from the question generation skill based on the source markdown path above. For example, paths under content/ai/anthropic-academy/ should use Claude Certified Architect - Foundations (CCA-F) certification style where relevant, while future source paths should use their own appropriate style.

Question requirements:
- Generate exactly 12 questions:
  - Questions 1-3 must have difficulty "easy"
  - Questions 4-9 must have difficulty "moderate"
  - Questions 10-12 must have difficulty "difficult"
- Do not use "medium"; only use "moderate".
- Use multiple-correct questions only when the concept naturally supports multiple correct answers; do not require a fixed minimum count.
- Every question must be based only on the source markdown content below.
- Do not include Mnemoloop-specific questions.
- Do not include questions unrelated to this chapter.
- Do not invent concepts unsupported by the chapter.
- Every question must have exactly 4 options.
- Explanations should teach why the answer is correct and why common distractors are wrong when useful.

Use this exact JSON schema:
{
  "chapterId": "...",
  "chapterTitle": "...",
  "course": "...",
  "provider": "...",
  "questions": [
    {
      "id": "...",
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctOptionIndexes": [0],
      "explanation": "...",
      "difficulty": "easy | moderate | difficult",
      "questionType": "single-correct | multiple-correct",
      "concepts": ["..."]
    }
  ]
}

Metadata to use exactly:
- chapterId: ${metadata.chapterId}
- chapterTitle: ${metadata.chapterTitle}
- course: ${metadata.course}
- provider: ${metadata.provider}

ID format:
- Use ${metadata.chapterId}-q001 through ${metadata.chapterId}-q012.

Schema rules:
- correctOptionIndexes must always be an array.
- For single-correct questions, correctOptionIndexes must contain exactly one index.
- For multiple-correct questions, correctOptionIndexes must contain at least two indexes.
- Correct option indexes must refer to the zero-based indexes of the options array.
- difficulty must be exactly one of: easy, moderate, difficult.
- questionType must be exactly one of: single-correct, multiple-correct.

Source markdown content:
${chapterContent}`;
}

function parseGeneratedJson(responseText: string): unknown {
  try {
    return JSON.parse(responseText);
  } catch {
    const start = responseText.indexOf("{");
    const end = responseText.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Anthropic response did not contain a JSON object.");
    }

    return JSON.parse(responseText.slice(start, end + 1));
  }
}

function validateGeneratedQuiz(
  value: unknown,
  metadata: ChapterMetadata,
): string[] {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return ["Generated output must be a JSON object."];
  }

  validateStringField(value, "chapterId", errors);
  validateStringField(value, "chapterTitle", errors);
  validateStringField(value, "course", errors);
  validateStringField(value, "provider", errors);

  if (value.chapterId !== metadata.chapterId) {
    errors.push(`chapterId must be "${metadata.chapterId}".`);
  }

  if (value.chapterTitle !== metadata.chapterTitle) {
    errors.push(`chapterTitle must be "${metadata.chapterTitle}".`);
  }

  if (value.course !== metadata.course) {
    errors.push(`course must be "${metadata.course}".`);
  }

  if (value.provider !== metadata.provider) {
    errors.push(`provider must be "${metadata.provider}".`);
  }

  if (!Array.isArray(value.questions)) {
    errors.push("questions must be an array.");
    return errors;
  }

  if (value.questions.length !== REQUIRED_QUESTION_COUNT) {
    errors.push(`questions must contain exactly ${REQUIRED_QUESTION_COUNT} items.`);
  }

  const difficultyCounts = getDifficultyCounts(value.questions);

  value.questions.forEach((question, questionIndex) => {
    if (!isRecord(question)) {
      errors.push(`questions[${questionIndex}] must be an object.`);
      return;
    }

    validateQuestion(question, questionIndex, errors);

  });

  if (difficultyCounts.easy !== 3) {
    errors.push("questions must include exactly 3 easy questions.");
  }

  if (difficultyCounts.moderate !== 6) {
    errors.push("questions must include exactly 6 moderate questions.");
  }

  if (difficultyCounts.difficult !== 3) {
    errors.push("questions must include exactly 3 difficult questions.");
  }

  if (
    difficultyCounts.easy !== 3 ||
    difficultyCounts.moderate !== 6 ||
    difficultyCounts.difficult !== 3
  ) {
    errors.push(
      `actual difficulty counts found: easy=${difficultyCounts.easy}, moderate=${difficultyCounts.moderate}, difficult=${difficultyCounts.difficult}, other=${formatOtherDifficultyCounts(difficultyCounts.other)}.`,
    );
  }

  return errors;
}

function getDifficultyCounts(questions: unknown[]) {
  const counts: {
    easy: number;
    moderate: number;
    difficult: number;
    other: Record<string, number>;
  } = {
    easy: 0,
    moderate: 0,
    difficult: 0,
    other: {},
  };

  for (const question of questions) {
    if (!isRecord(question)) {
      counts.other["<invalid question>"] =
        (counts.other["<invalid question>"] ?? 0) + 1;
      continue;
    }

    if (
      question.difficulty === "easy" ||
      question.difficulty === "moderate" ||
      question.difficulty === "difficult"
    ) {
      counts[question.difficulty] += 1;
      continue;
    }

    const difficulty =
      typeof question.difficulty === "string"
        ? question.difficulty
        : "<missing or invalid>";
    counts.other[difficulty] = (counts.other[difficulty] ?? 0) + 1;
  }

  return counts;
}

function formatOtherDifficultyCounts(otherCounts: Record<string, number>) {
  const entries = Object.entries(otherCounts);

  if (entries.length === 0) {
    return "0";
  }

  return entries
    .map(([difficulty, count]) => `${difficulty}=${count}`)
    .join(", ");
}

function validateQuestion(
  question: Record<string, unknown>,
  questionIndex: number,
  errors: string[],
) {
  const label = `questions[${questionIndex}]`;

  validateStringField(question, "id", errors, label);
  validateStringField(question, "question", errors, label);
  validateStringField(question, "explanation", errors, label);

  if (
    question.difficulty !== "easy" &&
    question.difficulty !== "moderate" &&
    question.difficulty !== "difficult"
  ) {
    errors.push(`${label}.difficulty must be easy, moderate, or difficult.`);
  }

  if (
    question.questionType !== "single-correct" &&
    question.questionType !== "multiple-correct"
  ) {
    errors.push(
      `${label}.questionType must be single-correct or multiple-correct.`,
    );
  }

  if (!isStringArray(question.options)) {
    errors.push(`${label}.options must be an array of strings.`);
  } else if (question.options.length !== 4) {
    errors.push(`${label}.options must contain exactly 4 items.`);
  }

  if (!isNumberArray(question.correctOptionIndexes)) {
    errors.push(`${label}.correctOptionIndexes must be an array of numbers.`);
  } else {
    const uniqueIndexes = new Set(question.correctOptionIndexes);

    if (uniqueIndexes.size !== question.correctOptionIndexes.length) {
      errors.push(`${label}.correctOptionIndexes must not contain duplicates.`);
    }

    for (const optionIndex of question.correctOptionIndexes) {
      if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex > 3) {
        errors.push(
          `${label}.correctOptionIndexes contains invalid option index ${optionIndex}.`,
        );
      }
    }

    if (
      question.questionType === "single-correct" &&
      question.correctOptionIndexes.length !== 1
    ) {
      errors.push(
        `${label}.single-correct questions must have exactly one correctOptionIndexes item.`,
      );
    }

    if (
      question.questionType === "multiple-correct" &&
      question.correctOptionIndexes.length < 2
    ) {
      errors.push(
        `${label}.multiple-correct questions must have at least two correctOptionIndexes items.`,
      );
    }
  }

  if (!isStringArray(question.concepts)) {
    errors.push(`${label}.concepts must be an array of strings.`);
  }
}

function validateStringField(
  value: Record<string, unknown>,
  fieldName: string,
  errors: string[],
  parentLabel?: string,
) {
  if (typeof value[fieldName] !== "string" || value[fieldName].trim() === "") {
    errors.push(
      `${parentLabel ? `${parentLabel}.` : ""}${fieldName} must be a non-empty string.`,
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.trim() !== "")
  );
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : undefined;
}

function titleCaseSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function toProjectRelativePath(filePath: string) {
  return path.relative(process.cwd(), filePath).split(path.sep).join("/");
}

main().catch((error: unknown) => {
  console.error("Question generation failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
