import Link from "next/link";
import { getCourses } from "./content-data";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const courses = await getCourses();

  return (
    <main className="min-h-screen bg-white px-6 py-16 text-slate-950">
      <section className="mx-auto w-full max-w-5xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
          Mnemoloop
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
              Content Library
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Browse the local markdown courses currently available in the
              project content folder.
            </p>
          </div>
          <p className="text-sm font-medium text-slate-500">
            {courses.length} {courses.length === 1 ? "course" : "courses"}
          </p>
        </div>

        {courses.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {courses.map((course) => (
              <Link
                key={course.pathSegments.join("/")}
                href={`/content/${course.pathSegments.join("/")}`}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
                  <span>{course.category}</span>
                  <span className="text-slate-300">/</span>
                  <span>{course.provider}</span>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-slate-950">
                  {course.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {course.chapterCount}{" "}
                  {course.chapterCount === 1 ? "chapter" : "chapters"} stored
                  as markdown.
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600">
            No markdown courses were found in the content folder.
          </div>
        )}
      </section>
    </main>
  );
}
