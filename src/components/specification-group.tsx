import type { ReactNode } from "react";

type Specification = { label: string; value: ReactNode };

export function SpecificationGroup({
  title,
  items,
}: {
  title: string;
  items: Specification[];
}) {
  const populatedItems = items.filter(
    (item) => item.value !== null && item.value !== undefined && item.value !== "",
  );
  if (!populatedItems.length) return null;

  return (
    <section className="border-t border-white/15 pt-5">
      <h2 className="font-mono text-[0.65rem] tracking-[0.14em] text-[var(--signal)] uppercase">
        {title}
      </h2>
      <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {populatedItems.map((item) => (
          <div key={item.label} className="border-b border-white/10 pb-3">
            <dt className="font-mono text-[0.6rem] tracking-[0.12em] text-[var(--muted)] uppercase">
              {item.label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-white">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
