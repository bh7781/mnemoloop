import Link from "next/link";

const featureCards = [
  {
    description: "Move through organized course notes and chapter summaries.",
    title: "Read notes",
  },
  {
    description: "Use generated questions to test recall after each chapter.",
    title: "Practice questions",
  },
  {
    description: "Mark uncertain answers so weak areas are easier to revisit.",
    title: "Review weak areas later",
  },
  {
    description: "Turn passive reading into repeatable active recall loops.",
    title: "Build long-term memory",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-16 pt-32 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-400">
            Mnemoloop
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight tracking-normal sm:text-6xl">
            Turn learning into durable memory.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Read structured notes, practice generated questions, and keep track
            of the ideas that need another pass.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/content"
              className="inline-flex rounded-md bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Open Content Library
            </Link>
            <Link
              href="/practice"
              className="inline-flex rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-200"
            >
              Start Practice
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-4 sm:grid-cols-2">
            {featureCards.map((feature) => (
              <article
                key={feature.title}
                className="rounded-md border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950"
              >
                <h2 className="text-lg font-semibold tracking-normal text-slate-950 dark:text-white">
                  {feature.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
