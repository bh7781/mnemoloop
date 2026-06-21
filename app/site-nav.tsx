import Link from "next/link";
import ThemeToggle from "./theme-toggle";

export default function SiteNav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 py-4 sm:px-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-slate-200 bg-white/90 px-4 py-2 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <Link
          href="/"
          className="text-sm font-semibold tracking-normal text-slate-950 dark:text-white"
        >
          Mnemoloop
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/content"
            className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Content
          </Link>
          <Link
            href="/practice"
            className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Practice
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
