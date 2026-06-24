import Link from "next/link";
import ThemeToggle from "./theme-toggle";

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 px-3 backdrop-blur-md dark:border-slate-700 dark:bg-[#0b1120]/90 sm:px-6">
      <nav className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-3">
        <Link
          href="/"
          className="shrink-0 text-sm font-semibold tracking-normal text-slate-950 transition hover:text-teal-700 dark:text-white dark:hover:text-teal-300"
        >
          Mnemoloop
        </Link>
        <div className="flex min-w-0 items-center gap-1">
          <div className="flex items-center gap-0.5 rounded-md border border-slate-200 bg-slate-50/70 p-0.5 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <Link
              href="/"
              className="rounded px-1.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white sm:px-2.5 sm:text-sm"
            >
              Home
            </Link>
            <Link
              href="/content"
              className="rounded px-1.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white sm:px-2.5 sm:text-sm"
            >
              Content
            </Link>
            <Link
              href="/practice"
              className="rounded px-1.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white sm:px-2.5 sm:text-sm"
            >
              Practice
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
