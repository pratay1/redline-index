export default function Home() {
  return (
    <main className="relative flex flex-1 overflow-hidden px-6 py-8 sm:px-12 lg:px-20">
      <div className="absolute inset-0 [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [background-size:48px_48px] opacity-30" />
      <div className="relative z-10 flex w-full flex-col justify-between border border-[var(--line)] p-6 sm:p-10">
        <header className="flex items-center justify-between text-xs font-medium tracking-[0.18em] text-[var(--muted)] uppercase">
          <span>Redline Index</span>
          <span>Est. 2026</span>
        </header>
        <section className="max-w-4xl py-24 sm:py-36">
          <p className="mb-6 font-mono text-xs tracking-[0.2em] text-[var(--signal)] uppercase">
            The automotive database
          </p>
          <h1 className="text-5xl font-semibold tracking-[-0.065em] text-balance sm:text-7xl lg:text-8xl">
            Every number has a story.
          </h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            Redline Index is building a precise, living record of the machines that move
            us—one verified vehicle at a time.
          </p>
        </section>
        <footer className="flex flex-col gap-3 border-t border-[var(--line)] pt-5 font-mono text-[11px] tracking-[0.14em] text-[var(--muted)] uppercase sm:flex-row sm:justify-between">
          <span>Database foundation in progress</span>
          <span>Search · Compare · Preserve</span>
        </footer>
      </div>
    </main>
  );
}
