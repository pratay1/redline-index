import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3 text-[0.69rem] font-semibold tracking-[0.16em] text-white uppercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal)]"
      aria-label="Redline Index home"
    >
      <span className="relative grid size-7 place-items-center border border-[var(--signal)] text-[0.62rem] text-[var(--signal)] group-hover:bg-[var(--signal)] group-hover:text-black before:absolute before:inset-1 before:border before:border-[var(--signal)]/40">
        RI
      </span>
      <span>Redline Index</span>
    </Link>
  );
}
