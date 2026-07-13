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
    <section className="border-t border-line pt-6">
      <h2 className="font-mono text-[0.65rem] tracking-[0.14em] text-signal uppercase">
        {title}
      </h2>
      <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {populatedItems.map((item) => (
          <div key={item.label} className="border-b border-line/80 pb-4">
            <dt className="font-mono text-[0.6rem] tracking-[0.12em] text-muted uppercase">
              {item.label}
            </dt>
            <dd className="mt-1.5 text-sm font-medium text-white">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
