import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-5 py-16 text-center">
      <Reveal>
        <section className="max-w-xl border border-line bg-surface px-7 py-14 sm:px-12">
          <p className="font-mono text-[0.68rem] tracking-[0.18em] text-signal uppercase">
            404 / Record not found
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-[-0.035em] text-white sm:text-6xl">
            Off the index.
          </h1>
          <p className="mt-5 leading-7 text-muted">
            This address does not match a published Redline Index record. It may be
            unpublished, moved, or not yet catalogued.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="min-h-11 bg-signal px-5 py-3 font-mono text-[0.65rem] tracking-[0.13em] text-black uppercase transition-colors hover:bg-signal-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
            >
              Home
            </Link>
            <Link
              href="/search"
              className="min-h-11 border border-line px-5 py-3 font-mono text-[0.65rem] tracking-[0.13em] text-white uppercase transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
            >
              Search index
            </Link>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
