import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getChapterByPath } from "../../../../content-data";
import { getQuestionBanks } from "../../../../../practice/question-data";

export const dynamic = "force-dynamic";

type ChapterPageProps = {
  params: Promise<{
    category: string;
    provider: string;
    course: string;
    chapter: string;
  }>;
};

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { category, provider, course: courseSlug, chapter } = await params;
  const coursePath = [category, provider, courseSlug];
  const chapterDetail = await getChapterByPath(coursePath, chapter);
  const courseHref = "/content/" + coursePath.join("/");
  const questionRelativePath = coursePath.join("/") + "/" + chapter + ".questions.json";

  if (!chapterDetail) {
    notFound();
  }

  const questionBanks = await getQuestionBanks();
  const questionBank = questionBanks.find(
    (bank) => bank.relativePath === questionRelativePath,
  );
  const practiceHref = "/practice?questions=" + encodeURIComponent(questionRelativePath);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f7fbff] px-6 pb-16 pt-12 text-slate-950 dark:bg-[#050812] dark:text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(34,211,238,0.19),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(168,85,247,0.16),transparent_34%),radial-gradient(circle_at_50%_94%,rgba(20,184,166,0.12),transparent_38%)] dark:bg-[radial-gradient(circle_at_16%_8%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(168,85,247,0.14),transparent_34%),radial-gradient(circle_at_50%_94%,rgba(20,184,166,0.08),transparent_38%)]" />
      </div>

      <article className="mx-auto w-full max-w-5xl">
        <Link
          href={courseHref}
          className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-cyan-300 hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:border-cyan-200/35 dark:hover:text-cyan-200"
        >
          Back to {chapterDetail.course.title}
        </Link>

        <header className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/75 shadow-2xl shadow-slate-950/[0.06] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-cyan-950/25">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_320px] lg:p-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">
                <span>{chapterDetail.course.category}</span>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span>{chapterDetail.course.provider}</span>
              </div>
              <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                {chapterDetail.course.title}
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 dark:text-white sm:text-5xl">
                {chapterDetail.title}
              </h1>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-950/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.045]">
              {questionBank ? (
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
                    Recall ready
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
                    {questionBank.questionCount}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                    generated questions
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 dark:border-white/10 dark:bg-white/[0.06]">
                      easy {questionBank.difficultyMix.easy}
                    </span>
                    <span className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 dark:border-white/10 dark:bg-white/[0.06]">
                      moderate {questionBank.difficultyMix.moderate}
                    </span>
                    <span className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 dark:border-white/10 dark:bg-white/[0.06]">
                      difficult {questionBank.difficultyMix.difficult}
                    </span>
                  </div>
                  <Link
                    href={practiceHref}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-teal-500/15 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-50"
                  >
                    Practice this chapter
                  </Link>
                </div>
              ) : (
                <div className="rounded-xl border border-violet-200/70 bg-violet-50/60 p-4 text-sm leading-6 text-violet-950 dark:border-violet-200/10 dark:bg-violet-300/[0.055] dark:text-violet-100">
                  <p className="font-semibold">Questions are not generated for this chapter yet.</p>
                  <p className="mt-2 text-violet-800 dark:text-violet-200/80">
                    You can still read the notes and generate practice questions later.
                  </p>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="mt-10 rounded-[2rem] border border-slate-200/80 bg-white/85 shadow-2xl shadow-slate-950/[0.05] backdrop-blur-xl dark:border-white/10 dark:bg-[#07111f]/88 dark:shadow-black/25">
          <div className="border-b border-slate-200/80 px-6 py-4 dark:border-white/10 sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">
              Reading notes
            </p>
          </div>
          <div className="mx-auto max-w-3xl px-6 py-8 sm:px-8 lg:py-10">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="mt-12 text-4xl font-semibold leading-tight tracking-normal text-slate-950 first:mt-0 dark:text-white">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mt-12 border-t border-slate-200/80 pt-8 text-3xl font-semibold leading-tight tracking-normal text-slate-950 dark:border-white/10 dark:text-slate-50">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mt-9 text-2xl font-semibold leading-snug tracking-normal text-slate-950 dark:text-slate-100">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="mt-7 text-xl font-semibold text-slate-950 dark:text-slate-100">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="mt-5 text-base leading-8 text-slate-700 dark:text-slate-200">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mt-5 list-disc space-y-2 pl-6 text-base leading-8 text-slate-700 marker:text-cyan-600 dark:text-slate-200 dark:marker:text-cyan-300">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mt-5 list-decimal space-y-2 pl-6 text-base leading-8 text-slate-700 marker:text-cyan-600 dark:text-slate-200 dark:marker:text-cyan-300">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="pl-1">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="mt-7 rounded-r-xl border-l-4 border-cyan-500 bg-cyan-50/80 px-5 py-4 text-slate-700 dark:border-cyan-300 dark:bg-cyan-300/10 dark:text-slate-100">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="font-semibold text-cyan-700 underline decoration-cyan-300 underline-offset-4 transition hover:text-cyan-900 dark:text-cyan-300 dark:decoration-cyan-500 dark:hover:text-cyan-200"
                  >
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <div className="mt-7 overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                    <table className="w-full min-w-[640px] border-collapse text-left text-sm text-slate-700 dark:text-slate-200">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border-b border-slate-200 bg-slate-100 px-4 py-3 font-semibold text-slate-950 dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border-b border-slate-200 px-4 py-3 align-top text-slate-700 dark:border-white/10 dark:text-slate-200">
                    {children}
                  </td>
                ),
                pre: ({ children }) => (
                  <pre className="mt-7 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-7 text-slate-100 shadow-lg ring-1 ring-slate-800 dark:bg-black/70 dark:ring-white/10">
                    {children}
                  </pre>
                ),
                code: ({ className, children }) => (
                  <code
                    className={
                      className ||
                      "rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-sm font-medium text-slate-900 dark:bg-white/10 dark:text-slate-100"
                    }
                  >
                    {children}
                  </code>
                ),
                hr: () => <hr className="my-10 border-slate-200 dark:border-white/10" />,
              }}
            >
              {chapterDetail.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>
    </main>
  );
}
