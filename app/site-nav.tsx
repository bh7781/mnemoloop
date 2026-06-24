import Link from "next/link";
import ThemeToggle from "./theme-toggle";

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-700 dark:bg-[#0b1120]/85 sm:px-6">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between">
        <Link
          href="/"
          className="text-sm font-semibold tracking-normal text-slate-950 transition hover:text-teal-700 dark:text-white dark:hover:text-teal-400"
        >
          Mnemoloop
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/content"
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Content
          </Link>
          <Link
            href="/practice"
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Practice
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
