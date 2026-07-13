import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
      aria-label="Redline Index home"
    >
      <span className="relative inline-flex items-baseline gap-2 py-1 text-[0.9rem] leading-none font-extrabold tracking-[0.14em] uppercase sm:text-[1rem]">
        <span
          className="text-foreground transition-colors duration-200 group-hover:text-white"
        >
          Redline
        </span>
        <span className="text-signal transition-colors duration-200 group-hover:text-white">
          Index
        </span>
        <span
          aria-hidden="true"
          className="bg-signal absolute right-0 -bottom-0.5 h-px w-8 origin-right transition-transform duration-200 group-hover:scale-x-150"
        />
      </span>
    </Link>
  );
}
