import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-5 py-16 text-center">
      <section className="max-w-xl border border-white/15 bg-white/[0.02] px-7 py-12 sm:px-12">
        <p className="font-mono text-[0.68rem] tracking-[0.18em] text-[var(--signal)] uppercase">
          404 / Record not found
        </p>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.07em] text-white sm:text-6xl">
          Off the index.
        </h1>
        <p className="mt-5 leading-7 text-[var(--muted)]">
          This address does not match a published Redline Index record. It may be
          unpublished, moved, or not yet catalogued.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="bg-[var(--signal)] px-5 py-3 font-mono text-[0.65rem] tracking-[0.13em] text-black uppercase hover:bg-[#ff6858] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal)]"
          >
            Home
          </Link>
          <Link
            href="/search"
            className="border border-white/20 px-5 py-3 font-mono text-[0.65rem] tracking-[0.13em] text-white uppercase hover:border-[var(--signal)] hover:text-[var(--signal)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal)]"
          >
            Search index
          </Link>
        </div>
      </section>
    </main>
  );
}
