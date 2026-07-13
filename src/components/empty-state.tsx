import Link from "next/link";
import type { Route } from "next";

type EmptyStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  href?: Route;
  linkLabel?: string;
};

export function EmptyState({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: EmptyStateProps) {
  return (
    <section className="border border-dashed border-white/20 bg-white/[0.02] px-6 py-14 text-center sm:px-10">
      <p className="font-mono text-[0.65rem] tracking-[0.14em] text-[var(--signal)] uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>
      {href && linkLabel ? (
        <Link
          href={href}
          className="mt-6 inline-block border-b border-[var(--signal)] pb-1 font-mono text-[0.65rem] tracking-[0.13em] text-white uppercase hover:text-[var(--signal)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal)]"
        >
          {linkLabel}
        </Link>
      ) : null}
    </section>
  );
}
