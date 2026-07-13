import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 font-mono text-[0.62rem] tracking-[0.12em] text-[var(--muted)] uppercase sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <p>Redline Index · Verified vehicle records, built to last.</p>
        <div className="flex gap-5">
          <Link
            href="/manufacturers"
            className="hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal)]"
          >
            Manufacturers
          </Link>
          <Link
            href="/search"
            className="hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal)]"
          >
            Search
          </Link>
        </div>
      </div>
    </footer>
  );
}
