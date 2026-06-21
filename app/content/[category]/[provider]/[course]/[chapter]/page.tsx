import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getChapterByPath } from "../../../../content-data";

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
  const courseHref = `/content/${coursePath.join("/")}`;

  if (!chapterDetail) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-6 py-16 text-slate-950">
      <article className="mx-auto w-full max-w-3xl">
        <Link
          href={courseHref}
          className="text-sm font-semibold text-teal-700 transition hover:text-teal-900 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
        >
          Back to {chapterDetail.course.title}
        </Link>

        <header className="mt-8 border-b border-slate-200 pb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
            <span>{chapterDetail.course.category}</span>
            <span className="text-slate-300">/</span>
            <span>{chapterDetail.course.provider}</span>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500">
            {chapterDetail.course.title}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">
            {chapterDetail.title}
          </h1>
        </header>

        <div className="mt-10">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="mt-10 text-3xl font-semibold tracking-normal text-slate-950">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="mt-10 text-2xl font-semibold tracking-normal text-slate-950">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mt-8 text-xl font-semibold text-slate-950">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="mt-6 text-lg font-semibold text-slate-950">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="mt-4 text-base leading-8 text-slate-700">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-8 text-slate-700">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="mt-4 list-decimal space-y-2 pl-6 text-base leading-8 text-slate-700">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="pl-1">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="mt-6 border-l-4 border-teal-600 bg-teal-50 px-5 py-4 text-slate-700">
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="font-medium text-teal-700 underline decoration-teal-300 underline-offset-4 hover:text-teal-900"
                >
                  {children}
                </a>
              ),
              table: ({ children }) => (
                <table className="mt-6 w-full border-collapse text-left text-sm">
                  {children}
                </table>
              ),
              th: ({ children }) => (
                <th className="border border-slate-300 bg-slate-100 px-3 py-2 font-semibold text-slate-950">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-slate-200 px-3 py-2 text-slate-700">
                  {children}
                </td>
              ),
              pre: ({ children }) => (
                <pre className="mt-6 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-7 text-slate-100">
                  {children}
                </pre>
              ),
              code: ({ className, children }) => (
                <code
                  className={
                    className ||
                    "rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-900"
                  }
                >
                  {children}
                </code>
              ),
              hr: () => <hr className="my-10 border-slate-200" />,
            }}
          >
            {chapterDetail.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
