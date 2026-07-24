"use client";

import type { Route } from "next";
import EtherealBeamsHero from "@/components/ui/ethereal-beams-hero";

type HomeHeroProps = {
  featuredHref?: Route;
  featuredLabel?: string;
};

export function HomeHero({ featuredHref, featuredLabel }: HomeHeroProps) {
  return (
    <EtherealBeamsHero
      featuredHref={featuredHref}
      featuredLabel={featuredLabel}
    />
  );
}
