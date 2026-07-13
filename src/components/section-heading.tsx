import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[0.65rem] tracking-[0.16em] text-signal uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
