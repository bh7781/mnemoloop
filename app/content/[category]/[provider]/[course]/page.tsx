import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuestionBanks } from "../../../../practice/question-data";
import { getCourseByPath, type Chapter } from "../../../content-data";

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

  const courseKey = coursePath.join("/");
  const questionBanks = await getQuestionBanks();
  const courseQuestionBanks = questionBanks.filter(
    (bank) => bank.courseKey === courseKey,
  );
  const questionStatsByPath = new Map(
    courseQuestionBanks.map((bank) => [bank.relativePath, bank]),
  );
  const totalQuestions = courseQuestionBanks.reduce(
    (total, bank) => total + bank.questionCount,
    0,
  );
  const coursePracticeHref = "/practice?course=" + encodeURIComponent(courseKey);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f7fbff] px-6 pb-16 pt-12 text-slate-950 dark:bg-[#050812] dark:text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(34,211,238,0.2),transparent_30%),radial-gradient(circle_at_84%_12%,rgba(168,85,247,0.17),transparent_32%),radial-gradient(circle_at_50%_92%,rgba(20,184,166,0.13),transparent_36%)] dark:bg-[radial-gradient(circle_at_16%_8%,rgba(34,211,238,0.13),transparent_30%),radial-gradient(circle_at_84%_12%,rgba(168,85,247,0.15),transparent_34%),radial-gradient(circle_at_50%_92%,rgba(20,184,166,0.08),transparent_38%)]" />
      </div>

      <section className="mx-auto w-full max-w-7xl">
        <Link
          href="/content"
          className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-cyan-300 hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:border-cyan-200/35 dark:hover:text-cyan-200"
        >
          Back to Content Library
        </Link>

        <div className="mt-8 rounded-[2rem] border border-slate-200/80 bg-white/70 p-6 shadow-2xl shadow-slate-950/[0.06] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] dark:shadow-cyan-950/25 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">
                <span>{course.category}</span>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span>{course.provider}</span>
              </div>
              <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-tight tracking-normal text-slate-950 dark:text-white sm:text-6xl">
                {course.title}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Move through the chapters, then launch active recall when a question bank is available.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-200/80 bg-slate-950/[0.03] p-3 dark:border-white/10 dark:bg-white/[0.045]">
              <DashboardStat label="Chapters" value={course.chapterCount} />
              <DashboardStat label="Banks" value={courseQuestionBanks.length} />
              <DashboardStat label="Questions" value={totalQuestions} />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {courseQuestionBanks.length > 0 ? (
              <Link
                href={coursePracticeHref}
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-500/15 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-50"
              >
                Start Course Test
              </Link>
            ) : null}
            <Link
              href="/content"
              className="inline-flex items-center justify-center rounded-md border border-slate-300/80 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:border-white/15 dark:bg-white/[0.06] dark:text-slate-100 dark:hover:border-cyan-200/40 dark:hover:bg-white/[0.1]"
            >
              Back to Content Library
            </Link>
          </div>
        </div>

        <section className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
                Course chapters
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
                Read, then reinforce
              </h2>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {courseQuestionBanks.length} of {course.chapterCount} chapters have questions
            </p>
          </div>

          <ol className="mt-6 grid gap-4">
            {course.chapters.map((chapter, index) => {
              const questionPath = courseKey + "/" + chapter.slug + ".questions.json";
              const questionBank = questionStatsByPath.get(questionPath);
              const chapterHref = "/content/" + courseKey + "/" + chapter.slug;
              const practiceHref = "/practice?questions=" + encodeURIComponent(questionPath);

              return (
                <li key={chapter.slug}>
                  <article className="rounded-xl border border-slate-200/80 bg-white/70 p-5 shadow-lg shadow-slate-950/[0.04] backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/60 hover:bg-white dark:border-white/10 dark:bg-white/[0.045] dark:shadow-black/20 dark:hover:border-cyan-200/35 dark:hover:bg-white/[0.07]">
                    <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-400">
                            {getChapterLabel(chapter, index)}
                          </span>
                          {questionBank ? (
                            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800 dark:bg-teal-300/10 dark:text-teal-200">
                              Questions available
                            </span>
                          ) : (
                            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-300/10 dark:text-violet-200">
                              Questions not generated yet
                            </span>
                          )}
                        </div>
                        <h3 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
                          {chapter.title}
                        </h3>
                        <div className="mt-4 flex flex-wrap gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                          {questionBank ? (
                            <>
                              <MetricPill label="questions" value={questionBank.questionCount} />
                              <MetricPill label="easy" value={questionBank.difficultyMix.easy} />
                              <MetricPill label="moderate" value={questionBank.difficultyMix.moderate} />
                              <MetricPill label="difficult" value={questionBank.difficultyMix.difficult} />
                            </>
                          ) : (
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              Read the chapter now; practice can be added after generation.
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                        <Link
                          href={chapterHref}
                          className="inline-flex items-center justify-center rounded-md border border-slate-300/80 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-cyan-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:border-white/15 dark:bg-white/[0.06] dark:text-slate-100 dark:hover:border-cyan-200/40 dark:hover:bg-white/[0.1]"
                        >
                          Read Chapter
                        </Link>
                        {questionBank ? (
                          <Link
                            href={practiceHref}
                            className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-teal-500/15 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-50"
                          >
                            Practice
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </section>
      </section>
    </main>
  );
}

function DashboardStat({ label, value }: { label: string; value: number }) {
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

function getChapterLabel(chapter: Chapter, index: number) {
  const sectionMatch = chapter.slug.match(/^s(\d+)c(\d+)/i);

  if (sectionMatch) {
    return "Section " + sectionMatch[1] + "." + sectionMatch[2];
  }

  const leadingNumber = chapter.slug.match(/^(\d+)/);

  if (leadingNumber) {
    return "Chapter " + leadingNumber[1];
  }

  return "Chapter " + (index + 1);
}
