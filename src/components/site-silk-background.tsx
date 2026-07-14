"use client";

import dynamic from "next/dynamic";

const SilkBackground = dynamic(
  () =>
    import("@/components/ui/silk-background-animation").then(
      (m) => m.SilkBackground,
    ),
  { ssr: false },
);

/** Client island so the root layout can stay a Server Component. */
export function SiteSilkBackground() {
  return <SilkBackground />;
}
