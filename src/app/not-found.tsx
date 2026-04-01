import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-display text-6xl font-bold text-[var(--brand-green)] sm:text-7xl">
        404
      </p>
      <h1 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
        The link may be broken or the page was removed. Use search or go back to the
        store.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-green)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 shadow-glow-mint"
        >
          <Home className="h-4 w-4" aria-hidden />
          Home
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--brand-green)]/40"
        >
          Browse kits
        </Link>
      </div>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--brand-green)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to FootXI
      </Link>
    </div>
  );
}
