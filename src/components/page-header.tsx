import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:items-end">
      <div className="max-w-3xl">
        <p className="font-mono text-[0.65rem] tracking-[0.16em] text-white/45 uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-[clamp(2.75rem,7vw,4.75rem)] leading-[0.92] font-semibold tracking-[-0.035em] text-white">
          {title}
        </h1>
        {description ? (
          <div className="mt-5 max-w-xl text-base leading-7 text-muted">{description}</div>
        ) : null}
      </div>
      {action ? <div className="w-full">{action}</div> : null}
    </div>
  );
}
