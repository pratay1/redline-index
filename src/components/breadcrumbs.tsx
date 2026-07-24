import Link from "next/link";
import type { Route } from "next";

type Breadcrumb = { label: string; href?: Route };

export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="font-mono text-[0.62rem] tracking-[0.12em] text-muted uppercase"
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden="true" className="text-white/25">
                /
              </span>
            ) : null}
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-white/75">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
