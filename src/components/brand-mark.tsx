import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
      aria-label="Redline Index home"
    >
      <span className="relative grid size-9 place-items-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 border border-signal/90 transition-colors duration-200 group-hover:bg-signal"
        />
        <span
          aria-hidden="true"
          className="absolute inset-[3px] border border-signal/40 transition-colors duration-200 group-hover:border-black/35"
        />
        {/* Corner ticks */}
        <span
          aria-hidden="true"
          className="absolute top-0 left-0 h-1.5 w-1.5 border-t border-l border-signal"
        />
        <span
          aria-hidden="true"
          className="absolute top-0 right-0 h-1.5 w-1.5 border-t border-r border-signal"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-1.5 w-1.5 border-b border-l border-signal"
        />
        <span
          aria-hidden="true"
          className="absolute right-0 bottom-0 h-1.5 w-1.5 border-r border-b border-signal"
        />
        <span className="relative font-mono text-[0.7rem] font-medium tracking-[0.08em] text-signal transition-colors duration-200 group-hover:text-black">
          RI
        </span>
      </span>

      <span className="hidden leading-none sm:block">
        <span className="block text-[0.78rem] font-semibold tracking-[0.18em] text-foreground uppercase transition-colors duration-200 group-hover:text-white">
          Redline
        </span>
        <span className="mt-1 block font-mono text-[0.58rem] tracking-[0.28em] text-muted uppercase transition-colors duration-200 group-hover:text-signal">
          Index
        </span>
      </span>
    </Link>
  );
}
