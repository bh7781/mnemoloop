import Link from "next/link";
import { getQuestionBanks } from "../practice/question-data";
import { getCourses, type Course } from "./content-data";

export const dynamic = "force-dynamic";

type CourseStats = {
  questionBankCount: number;
  totalQuestions: number;
};

export default async function ContentPage() {
  const [courses, questionBanks] = await Promise.all([
    getCourses(),
    getQuestionBanks(),
  ]);
  const courseStats = getCourseStats(questionBanks);
  const areas = getKnowledgeAreas(courses);
  const totalQuestionBanks = Array.from(courseStats.values()).reduce(
    (total, stats) => total + stats.questionBankCount,
    0,
  );
  const totalQuestions = Array.from(courseStats.values()).reduce(
    (total, stats) => total + stats.totalQuestions,
    0,
  );

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f7fbff] px-6 pb-16 pt-12 text-slate-950 dark:bg-[#050812] dark:text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.22),transparent_28%),radial-gradient(circle_at_86%_18%,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_48%_90%,rgba(20,184,166,0.14),transparent_36%)] dark:bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_84%_12%,rgba(168,85,247,0.16),transparent_34%),radial-gradient(circle_at_50%_92%,rgba(20,184,166,0.09),transparent_38%)]" />
        <div className="absolute inset-0 opacity-[0.2] [background-image:linear-gradient(rgba(15,23,42,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.09)_1px,transparent_1px)] [background-size:44px_44px] dark:opacity-[0.12] dark:[background-image:linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px)]" />
      </div>

      <section className="mx-auto w-full max-w-7xl">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/70 p-6 shadow-2xl shadow-slate-950/[0.06] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] dark:shadow-cyan-950/25 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
                Mnemoloop knowledge base
              </p>
              <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-normal text-slate-950 dark:text-white sm:text-6xl">
                Content Library
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Browse structured notes and launch active recall practice from each chapter.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-200/80 bg-slate-950/[0.03] p-3 dark:border-white/10 dark:bg-white/[0.045]">
              <LibraryStat label="Courses" value={courses.length} />
              <LibraryStat label="Banks" value={totalQuestionBanks} />
              <LibraryStat label="Questions" value={totalQuestions} />
            </div>
          </div>
        </div>

        {areas.length > 0 ? (
          <section className="mt-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
                  Knowledge areas
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
                  Start from a domain
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                New top-level folders appear here automatically as the library grows.
              </p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {areas.map((area) => (
                <article
                  key={area.label}
                  className="rounded-xl border border-slate-200/80 bg-white/65 p-5 shadow-lg shadow-slate-950/[0.04] backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/60 hover:bg-white dark:border-white/10 dark:bg-white/[0.045] dark:shadow-black/20 dark:hover:border-cyan-200/35"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">
                    Area
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
                    {area.label}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {area.courseCount} {area.courseCount === 1 ? "course" : "courses"}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-700 dark:text-violet-300">
                Courses
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
                Available learning paths
              </h2>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {courses.length} {courses.length === 1 ? "course" : "courses"}
            </p>
          </div>

          {courses.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => {
                const pathKey = course.pathSegments.join("/");
                const stats = courseStats.get(pathKey) ?? {
                  questionBankCount: 0,
                  totalQuestions: 0,
                };

                return (
                  <Link
                    key={pathKey}
                    href={"/content/" + pathKey}
                    className="group rounded-xl border border-slate-200/80 bg-white/70 p-5 shadow-lg shadow-slate-950/[0.04] backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/60 hover:bg-white hover:shadow-xl hover:shadow-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:border-white/10 dark:bg-white/[0.045] dark:shadow-black/20 dark:hover:border-cyan-200/35 dark:hover:bg-white/[0.07]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">
                          <span>{course.category}</span>
                          <span className="text-slate-300 dark:text-slate-600">/</span>
                          <span>{course.provider}</span>
                        </div>
                        <h3 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
                          {course.title}
                        </h3>
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-lg text-slate-500 transition group-hover:border-cyan-300 group-hover:text-cyan-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300 dark:group-hover:border-cyan-200/35 dark:group-hover:text-cyan-200">
                        -&gt;
                      </span>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                      <MetricPill label="chapters" value={course.chapterCount} />
                      <MetricPill label="question banks" value={stats.questionBankCount} />
                      <MetricPill label="questions" value={stats.totalQuestions} />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
              No markdown courses were found in the content folder.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function LibraryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/70 p-4 text-center dark:border-white/10 dark:bg-white/[0.06]">
      <p className="text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 dark:border-white/10 dark:bg-white/[0.06]">
      {value} {label}
    </span>
  );
}

function getCourseStats(questionBanks: Awaited<ReturnType<typeof getQuestionBanks>>) {
  const stats = new Map<string, CourseStats>();

  for (const bank of questionBanks) {
    const current = stats.get(bank.courseKey) ?? {
      questionBankCount: 0,
      totalQuestions: 0,
    };

    current.questionBankCount += 1;
    current.totalQuestions += bank.questionCount;
    stats.set(bank.courseKey, current);
  }

  return stats;
}

function getKnowledgeAreas(courses: Course[]) {
  const areaMap = new Map<string, number>();

  for (const course of courses) {
    areaMap.set(course.category, (areaMap.get(course.category) ?? 0) + 1);
  }

  return Array.from(areaMap.entries())
    .map(([label, courseCount]) => ({ label, courseCount }))
    .sort((left, right) => left.label.localeCompare(right.label));
}
