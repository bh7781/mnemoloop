import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-16 text-slate-950">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
          Mnemoloop
        </p>
        <h1 className="text-4xl font-semibold tracking-normal sm:text-6xl">
          Turn knowledge into long-term memory
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          Mnemoloop helps learners retain knowledge through active recall,
          spaced repetition, and AI-powered reinforcement.
        </p>
        <Link
          href="/content"
          className="mt-10 rounded-md bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
        >
          Open Content Library
        </Link>
        <p className="mt-4 text-sm font-medium text-slate-500">
          Browse notes and practice generated questions
        </p>
      </section>
    </main>
  );
}
