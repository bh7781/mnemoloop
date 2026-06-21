import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export type Course = {
  title: string;
  pathSegments: string[];
  category: string;
  provider: string;
  chapterCount: number;
};

export type Chapter = {
  title: string;
  fileName: string;
  slug: string;
};

export type CourseDetail = Course & {
  chapters: Chapter[];
};

export type ChapterDetail = Chapter & {
  content: string;
  course: Course;
};

const contentDirectory = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  "content",
);

export function formatTitle(value: string) {
  return value
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+-/, "")
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function readMatterValue(data: Record<string, unknown>, key: string) {
  const value = data[key];

  return typeof value === "string" ? value.trim() : undefined;
}

function getCoursePath(segments: string[]) {
  const coursePath = path.resolve(contentDirectory, ...segments);
  const relativePath = path.relative(contentDirectory, coursePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return coursePath;
}

function getContentFilePath(directory: string, fileName: string) {
  const filePath = path.resolve(directory, fileName);
  const relativePath = path.relative(contentDirectory, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return filePath;
}

async function getMarkdownFiles(directory: string) {
  const entries = await readdir(directory, { withFileTypes: true });

  return {
    entries,
    markdownFiles: entries
      .filter(
        (entry) =>
          entry.isFile() &&
          (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")),
      )
      .sort((first, second) => first.name.localeCompare(second.name)),
  };
}

async function buildCourse(
  directory: string,
  segments: string[],
): Promise<CourseDetail> {
  const { markdownFiles } = await getMarkdownFiles(directory);
  const firstChapter = await readFile(
    getContentFilePath(directory, markdownFiles[0].name) || "",
    "utf8",
  );
  const firstChapterMatter = matter(firstChapter);
  const courseName = readMatterValue(firstChapterMatter.data, "course_name");
  const [category = "content", provider = "local"] = segments;
  const slug = segments.at(-1) || directory;
  const chapters = await Promise.all(
    markdownFiles.map(async (file) => {
      const filePath = getContentFilePath(directory, file.name);

      if (!filePath) {
        return {
          title: formatTitle(file.name),
          fileName: file.name,
          slug: path.parse(file.name).name,
        };
      }

      const markdown = await readFile(filePath, "utf8");
      const chapterMatter = matter(markdown);

      return {
        title:
          readMatterValue(chapterMatter.data, "title") ||
          readMatterValue(chapterMatter.data, "chapter") ||
          formatTitle(file.name),
        fileName: file.name,
        slug: path.parse(file.name).name,
      };
    }),
  );

  return {
    title: courseName || formatTitle(slug),
    pathSegments: segments,
    category: formatTitle(category),
    provider: formatTitle(provider),
    chapterCount: markdownFiles.length,
    chapters,
  };
}

async function findCourseDirectories(
  directory: string,
  segments: string[] = [],
): Promise<Course[]> {
  let content;

  try {
    content = await getMarkdownFiles(directory);
  } catch {
    return [];
  }

  if (content.markdownFiles.length > 0) {
    const course = await buildCourse(directory, segments);

    return [
      {
        title: course.title,
        pathSegments: course.pathSegments,
        category: course.category,
        provider: course.provider,
        chapterCount: course.chapterCount,
      },
    ];
  }

  const childCourses = await Promise.all(
    content.entries
      .filter((entry) => entry.isDirectory())
      .map((entry) =>
        findCourseDirectories(path.resolve(directory, entry.name), [
          ...segments,
          entry.name,
        ]),
      ),
  );

  return childCourses.flat();
}

export async function getCourses() {
  return findCourseDirectories(contentDirectory);
}

export async function getCourseByPath(segments: string[]) {
  const coursePath = getCoursePath(segments);

  if (!coursePath) {
    return null;
  }

  try {
    const { markdownFiles } = await getMarkdownFiles(coursePath);

    if (markdownFiles.length === 0) {
      return null;
    }

    return buildCourse(coursePath, segments);
  } catch {
    return null;
  }
}

export async function getChapterByPath(
  courseSegments: string[],
  chapterSlug: string,
) {
  const coursePath = getCoursePath(courseSegments);

  if (!coursePath) {
    return null;
  }

  try {
    const course = await buildCourse(coursePath, courseSegments);
    const chapter = course.chapters.find(
      (courseChapter) => courseChapter.slug === chapterSlug,
    );

    if (!chapter) {
      return null;
    }

    const chapterPath = getContentFilePath(coursePath, chapter.fileName);

    if (!chapterPath) {
      return null;
    }

    const markdown = await readFile(chapterPath, "utf8");
    const chapterMatter = matter(markdown);

    return {
      ...chapter,
      title:
        readMatterValue(chapterMatter.data, "title") ||
        readMatterValue(chapterMatter.data, "chapter") ||
        chapter.title,
      content: chapterMatter.content,
      course: {
        title: course.title,
        pathSegments: course.pathSegments,
        category: course.category,
        provider: course.provider,
        chapterCount: course.chapterCount,
      },
    };
  } catch {
    return null;
  }
}
