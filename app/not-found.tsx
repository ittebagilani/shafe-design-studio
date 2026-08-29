import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grain grid min-h-screen place-items-center bg-cream px-6 text-center">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-clay">404</p>
        <h1 className="mt-4 font-display text-4xl text-ink md:text-6xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-umber/80">
          The page you're looking for doesn't exist, or has moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-terracotta px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-colors hover:bg-clay"
          >
            Back home
          </Link>
          <Link
            href="/projects"
            className="rounded-lg border border-umber/25 px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-umber transition-colors hover:border-terracotta hover:text-terracotta"
          >
            See our work
          </Link>
        </div>
      </div>
    </div>
  );
}
