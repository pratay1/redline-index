import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      href="/"
      className="group relative inline-flex items-baseline gap-[0.35em] py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      aria-label="Redline Index home"
    >
      <span className="font-[family-name:var(--font-syne)] text-[1.2rem] leading-none font-bold tracking-[-0.045em] text-white sm:text-[1.35rem]">
        Redline
      </span>
      <span
        aria-hidden="true"
        className="mx-[0.05em] self-center font-[family-name:var(--font-syne)] text-[0.95rem] font-light leading-none text-white/25 sm:text-[1.05rem]"
      >
        /
      </span>
      <span className="relative font-[family-name:var(--font-syne)] text-[1.2rem] leading-none font-semibold tracking-[-0.04em] text-brand sm:text-[1.35rem]">
        Index
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-[0.22em] h-px origin-left scale-x-75 bg-brand/80 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
        />
      </span>
    </Link>
  );
}
