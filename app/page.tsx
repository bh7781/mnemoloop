import Link from "next/link";

const loopStages = [
  {
    label: "Notes",
    detail: "Course ideas become structured study material.",
    className:
      "left-4 top-8 border-cyan-300/40 bg-cyan-50/80 text-cyan-950 shadow-cyan-500/10 dark:bg-cyan-400/10 dark:text-cyan-50",
  },
  {
    label: "Questions",
    detail: "Generated prompts expose what actually stuck.",
    className:
      "right-4 top-20 border-violet-300/40 bg-violet-50/80 text-violet-950 shadow-violet-500/10 dark:bg-violet-400/10 dark:text-violet-50",
  },
  {
    label: "Practice",
    detail: "Active recall turns review into retrieval.",
    className:
      "right-8 bottom-24 border-teal-300/40 bg-teal-50/80 text-teal-950 shadow-teal-500/10 dark:bg-teal-400/10 dark:text-teal-50",
  },
  {
    label: "Retention",
    detail: "Weak areas loop back until they hold.",
    className:
      "left-8 bottom-10 border-fuchsia-300/40 bg-fuchsia-50/80 text-fuchsia-950 shadow-fuchsia-500/10 dark:bg-fuchsia-400/10 dark:text-fuchsia-50",
  },
];

const recallDots = ["Read", "Recall", "Refine", "Repeat"];

const processSteps = [
  {
    step: "01",
    title: "Add structured notes",
    description:
      "Keep markdown notes organized by course, chapter, and concept so review starts from real context.",
  },
  {
    step: "02",
    title: "Generate question banks",
    description:
      "Turn source material into prompts that test understanding instead of recognition.",
  },
  {
    step: "03",
    title: "Practice with active recall",
    description:
      "Answer before looking back, then use feedback to separate strong concepts from fragile ones.",
  },
  {
    step: "04",
    title: "Review weak areas",
    description:
      "Marked misses and uncertain answers become the next set of high-value review targets.",
  },
  {
    step: "05",
    title: "Reinforce over time",
    description:
      "Repeat the loop until ideas move from short-term familiarity into durable memory.",
  },
];

const learningPrinciples = [
  {
    title: "Active recall",
    description: "Practice retrieving answers before rereading notes.",
    accent: "from-cyan-300 to-teal-300",
  },
  {
    title: "Spaced repetition",
    description: "Bring concepts back after time has made recall harder.",
    accent: "from-teal-300 to-emerald-300",
  },
  {
    title: "Weak-area detection",
    description: "Use mistakes and uncertainty to focus the next session.",
    accent: "from-violet-300 to-fuchsia-300",
  },
  {
    title: "Retrieval practice",
    description: "Build memory through repeated testing, not passive review.",
    accent: "from-sky-300 to-violet-300",
  },
];

const practiceModes = [
  {
    title: "Chapter practice",
    description: "Focus on one chapter at a time when a topic needs a tight loop.",
    status: "Available",
  },
  {
    title: "Course tests",
    description: "Mix questions across a full course for broader retrieval practice.",
    status: "Available",
  },
  {
    title: "Timed mode",
    description: "Add pressure for exam-style sessions and faster recall.",
    status: "Coming soon",
  },
  {
    title: "Weak questions later",
    description: "Return to missed or uncertain questions without hunting for them.",
    status: "Coming soon",
  },
  {
    title: "Due reviews later",
    description: "See which concepts are ready for another memory-strengthening pass.",
    status: "Coming soon",
  },
];

export default function Home() {
  return (
    <main className="relative isolate min-h-[calc(100vh-3rem)] overflow-hidden bg-[#f7fbff] px-6 py-12 text-slate-950 dark:bg-[#050812] dark:text-white sm:py-16">
      <style>{`
        @keyframes mnemoFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -14px, 0); }
        }

        @keyframes mnemoFloatReverse {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, 12px, 0); }
        }

        @keyframes mnemoOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes mnemoGlow {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.06); }
        }

        .mnemo-glow {
          animation: mnemoGlow 8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .mnemo-float,
          .mnemo-float-reverse,
          .mnemo-orbit,
          .mnemo-glow {
            animation: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.24),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(168,85,247,0.22),transparent_30%),radial-gradient(circle_at_50%_88%,rgba(20,184,166,0.18),transparent_34%)] dark:bg-[radial-gradient(circle_at_12%_8%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(168,85,247,0.22),transparent_32%),radial-gradient(circle_at_52%_90%,rgba(20,184,166,0.12),transparent_36%)]" />
        <div className="absolute inset-0 opacity-[0.28] [background-image:linear-gradient(rgba(15,23,42,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.09)_1px,transparent_1px)] [background-size:44px_44px] dark:opacity-[0.18] dark:[background-image:linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,251,255,0.22),rgba(247,251,255,0.92)_72%)] dark:bg-[linear-gradient(180deg,rgba(5,8,18,0.08),rgba(5,8,18,0.86)_76%)]" />
      </div>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/70 px-3 py-2 shadow-sm shadow-slate-950/5 backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-cyan-500/10">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white shadow-lg shadow-cyan-500/20 dark:bg-white dark:text-slate-950">
              M
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.9)]" />
            </span>
            <span className="bg-gradient-to-r from-slate-950 via-cyan-700 to-violet-700 bg-clip-text text-2xl font-semibold tracking-normal text-transparent dark:from-white dark:via-cyan-200 dark:to-violet-200 sm:text-3xl">
              Mnemoloop
            </span>
          </div>

          <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
            Turn knowledge into{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-teal-400 to-violet-500 bg-clip-text text-transparent dark:from-cyan-200 dark:via-teal-200 dark:to-violet-300">
              long-term memory.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
            Read your notes, practice generated questions, and reinforce weak
            areas through active recall loops.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/practice"
              className="inline-flex items-center justify-center rounded-md bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#f7fbff] dark:bg-white dark:text-slate-950 dark:shadow-cyan-400/20 dark:hover:bg-cyan-50 dark:focus:ring-cyan-200 dark:focus:ring-offset-[#050812]"
            >
              Start Practice
            </Link>
            <Link
              href="/content"
              className="inline-flex items-center justify-center rounded-md border border-slate-300/80 bg-white/70 px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm shadow-slate-950/5 backdrop-blur transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-[#f7fbff] dark:border-white/15 dark:bg-white/[0.06] dark:text-slate-100 dark:hover:border-cyan-200/40 dark:hover:bg-white/[0.1] dark:focus:ring-cyan-200 dark:focus:ring-offset-[#050812]"
            >
              Open Content Library
            </Link>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
            <div className="rounded-md border border-slate-200/80 bg-white/60 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
              <strong className="block text-base text-slate-950 dark:text-white">
                Notes in
              </strong>
              Structured context
            </div>
            <div className="rounded-md border border-slate-200/80 bg-white/60 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
              <strong className="block text-base text-slate-950 dark:text-white">
                Recall out
              </strong>
              Generated practice
            </div>
            <div className="rounded-md border border-slate-200/80 bg-white/60 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
              <strong className="block text-base text-slate-950 dark:text-white">
                Loops keep
              </strong>
              Memory durable
            </div>
          </div>
        </div>

        <div className="relative mx-auto h-[520px] w-full max-w-[620px]">
          <div className="mnemo-glow absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-300/15" />
          <div className="mnemo-glow absolute right-10 top-16 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl [animation-delay:1.8s] dark:bg-violet-400/18" />

          <div className="absolute inset-4 rounded-[2rem] border border-slate-200/80 bg-white/60 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] dark:shadow-cyan-950/40" />
          <div className="absolute inset-10 rounded-full border border-dashed border-slate-300/90 dark:border-cyan-200/20" />
          <div className="mnemo-orbit absolute inset-16 rounded-full border border-cyan-400/40 shadow-[0_0_34px_rgba(34,211,238,0.18)] [animation:mnemoOrbit_26s_linear_infinite]">
            <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.95)]" />
            <span className="absolute bottom-6 right-8 h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_20px_rgba(196,181,253,0.85)]" />
          </div>

          <div className="absolute left-1/2 top-1/2 z-10 w-52 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/50 bg-slate-950 p-4 text-white shadow-2xl shadow-cyan-500/20 dark:border-white/10 dark:bg-[#07111f]">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                Recall
              </span>
              <span className="h-2.5 w-2.5 rounded-full bg-teal-300 shadow-[0_0_18px_rgba(45,212,191,0.9)]" />
            </div>
            <div className="space-y-2">
              <div className="h-2.5 rounded-full bg-white/80" />
              <div className="h-2.5 w-4/5 rounded-full bg-cyan-200/80" />
              <div className="h-2.5 w-3/5 rounded-full bg-violet-200/70" />
            </div>
            <div className="mt-5 grid grid-cols-4 gap-1.5">
              {recallDots.map((item) => (
                <span
                  key={item}
                  className="h-1.5 rounded-full bg-gradient-to-r from-cyan-300 to-violet-300"
                  title={item}
                />
              ))}
            </div>
          </div>

          {loopStages.map((stage, index) => (
            <article
              key={stage.label}
              className={`mnemo-float absolute z-20 w-44 rounded-xl border p-4 shadow-2xl backdrop-blur-xl ${stage.className}`}
              style={{
                animation:
                  index % 2 === 0
                    ? "mnemoFloat 7s ease-in-out infinite"
                    : "mnemoFloatReverse 8s ease-in-out infinite",
                animationDelay: `${index * 0.7}s`,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-current opacity-80 shadow-[0_0_16px_currentColor]" />
                <h2 className="text-base font-semibold tracking-normal">
                  {stage.label}
                </h2>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                {stage.detail}
              </p>
            </article>
          ))}

          <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg shadow-slate-950/10 backdrop-blur dark:border-white/10 dark:bg-white/[0.08] dark:text-slate-200">
            <span className="h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_16px_rgba(45,212,191,0.9)]" />
            Next loop: weak concepts return first
          </div>
        </div>
      </section>
      <section className="mx-auto mt-24 w-full max-w-7xl sm:mt-32">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
              How Mnemoloop works
            </p>
            <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 dark:text-white sm:text-5xl">
              A learning loop built around retrieval.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Mnemoloop moves notes through generated questions, practice tests,
              weak-area review, and repeated reinforcement so studying has a
              clear next step.
            </p>
          </div>
          <div className="relative rounded-[1.5rem] border border-slate-200/80 bg-white/55 p-5 shadow-2xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-cyan-950/25">
            <div className="absolute inset-x-8 top-1/2 hidden h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent lg:block" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {processSteps.map((item) => (
                <article
                  key={item.step}
                  className="group relative rounded-xl border border-slate-200/80 bg-slate-950/[0.03] p-4 shadow-lg shadow-slate-950/[0.03] transition hover:-translate-y-1 hover:border-cyan-300/60 hover:bg-white/75 dark:border-white/10 dark:bg-white/[0.045] dark:shadow-black/20 dark:hover:border-cyan-200/35 dark:hover:bg-white/[0.07]"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="rounded-full border border-cyan-300/50 bg-cyan-100/70 px-2.5 py-1 text-xs font-semibold text-cyan-800 dark:border-cyan-200/20 dark:bg-cyan-300/10 dark:text-cyan-200">
                      {item.step}
                    </span>
                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-cyan-300 to-violet-300 shadow-[0_0_18px_rgba(34,211,238,0.65)]" />
                  </div>
                  <h3 className="text-base font-semibold tracking-normal text-slate-950 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-7xl sm:mt-32">
        <div className="rounded-[2rem] border border-slate-200/80 bg-slate-950/[0.03] p-6 shadow-2xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] dark:shadow-violet-950/20 sm:p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
                Built for durable learning
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-slate-950 dark:text-white sm:text-5xl">
                Designed around how memory actually strengthens.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
                The product flow nudges you away from passive rereading and
                toward recall sessions that reveal what needs another loop.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {learningPrinciples.map((principle) => (
                <article
                  key={principle.title}
                  className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white/65 p-5 shadow-lg shadow-slate-950/[0.04] transition hover:-translate-y-1 dark:border-white/10 dark:bg-[#09111f]/75 dark:shadow-black/20"
                >
                  <div
                    className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${principle.accent}`}
                  />
                  <div
                    className={`mb-5 h-10 w-10 rounded-lg bg-gradient-to-br ${principle.accent} opacity-90 shadow-lg shadow-cyan-500/10`}
                  />
                  <h3 className="text-lg font-semibold tracking-normal text-slate-950 dark:text-white">
                    {principle.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {principle.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-7xl sm:mt-32">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">
              Practice your way
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 dark:text-white sm:text-5xl">
              From focused chapters to deeper review sessions.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Current modes help you start practicing now. Planned modes extend
            the same loop into timed tests, weak-question queues, and due
            reviews.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {practiceModes.map((mode) => {
            const isAvailable = mode.status === "Available";

            return (
              <article
                key={mode.title}
                className="rounded-xl border border-slate-200/80 bg-white/60 p-5 shadow-lg shadow-slate-950/[0.04] transition hover:-translate-y-1 hover:border-violet-300/60 dark:border-white/10 dark:bg-white/[0.045] dark:shadow-black/20 dark:hover:border-violet-200/35"
              >
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    isAvailable
                      ? "bg-teal-100 text-teal-800 dark:bg-teal-300/10 dark:text-teal-200"
                      : "bg-violet-100 text-violet-800 dark:bg-violet-300/10 dark:text-violet-200"
                  }`}
                >
                  {mode.status}
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-normal text-slate-950 dark:text-white">
                  {mode.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {mode.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-7xl pb-8 sm:mt-32">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-950 px-6 py-12 text-white shadow-2xl shadow-cyan-950/20 dark:border-white/10 dark:bg-[#07111f] sm:px-10 lg:px-14">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute -bottom-28 left-8 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
                Close the loop
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
                Start building memory loops from your notes.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                Move from reading to recall, then let weak areas guide the next
                focused practice session.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                href="/practice"
                className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-xl shadow-cyan-400/20 transition hover:-translate-y-0.5 hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Start Practice
              </Link>
              <Link
                href="/content"
                className="inline-flex items-center justify-center rounded-md border border-white/15 bg-white/[0.07] px-6 py-3.5 text-sm font-semibold text-white shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-200/40 hover:bg-white/[0.12] focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Open Content Library
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
