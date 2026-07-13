export default function Home() {
  return (
    <main className="relative flex min-h-dvh overflow-hidden px-4 py-4 sm:px-12 sm:py-8 lg:px-20">
      <div className="absolute inset-0 [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [background-size:48px_48px] opacity-30" />
      <div className="relative z-10 flex w-full min-w-0 flex-col justify-between border border-[var(--line)] p-5 sm:p-10">
        <header className="flex w-full min-w-0 items-center justify-between gap-4 text-[10px] font-medium tracking-[0.14em] text-[var(--muted)] uppercase sm:text-xs sm:tracking-[0.18em]">
          <span className="shrink-0">Redline Index</span>
          <span className="shrink-0">Est. 2026</span>
        </header>
        <section className="w-full max-w-4xl min-w-0 py-16 sm:py-28 lg:py-36">
          <p className="mb-5 font-mono text-[11px] tracking-[0.16em] text-[var(--signal)] uppercase sm:mb-6 sm:text-xs sm:tracking-[0.2em]">
            The automotive database
          </p>
          <h1 className="max-w-none min-w-0 text-[clamp(2.75rem,12vw,8rem)] leading-[0.92] font-semibold tracking-[-0.065em] text-balance break-words sm:max-w-[12ch]">
            Every number has a story.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-pretty break-words text-[var(--muted)] sm:mt-8 sm:text-lg">
            Redline Index is building a precise, living record of the machines that move
            us—one verified vehicle at a time.
          </p>
        </section>
        <footer className="flex w-full min-w-0 flex-col gap-2 border-t border-[var(--line)] pt-4 font-mono text-[10px] leading-5 tracking-[0.12em] text-[var(--muted)] uppercase sm:flex-row sm:justify-between sm:gap-3 sm:pt-5 sm:text-[11px] sm:tracking-[0.14em]">
          <span>Database foundation in progress</span>
          <span>Search · Compare · Preserve</span>
        </footer>
      </div>
    </main>
  );
}
