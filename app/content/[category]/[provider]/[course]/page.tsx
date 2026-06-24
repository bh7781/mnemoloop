import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseByPath } from "../../../content-data";

export const dynamic = "force-dynamic";

type CoursePageProps = {
  params: Promise<{
    category: string;
    provider: string;
    course: string;
  }>;
};

export default async function CoursePage({ params }: CoursePageProps) {
  const { category, provider, course: courseSlug } = await params;
  const coursePath = [category, provider, courseSlug];
  const course = await getCourseByPath(coursePath);

  if (!course) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-6 pb-16 pt-12 text-slate-950 dark:bg-[#0b1120] dark:text-white">
      <section className="mx-auto w-full max-w-4xl">
        <Link
          href="/content"
          className="text-sm font-semibold text-teal-700 transition hover:text-teal-900 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
        >
          Back to Content Library
        </Link>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
              <span>{course.category}</span>
              <span className="text-slate-300">/</span>
              <span>{course.provider}</span>
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-5xl">
              {course.title}
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-500">
            {course.chapterCount}{" "}
            {course.chapterCount === 1 ? "chapter" : "chapters"}
          </p>
        </div>

        <ol className="mt-10 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {course.chapters.map((chapter, index) => (
            <li key={chapter.slug}>
              <Link
                href={`/content/${coursePath.join("/")}/${chapter.slug}`}
                className="block p-5 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-inset dark:hover:bg-slate-800"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Chapter {index + 1}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                  {chapter.title}
                </h2>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
