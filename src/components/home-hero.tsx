"use client";

import type { Route } from "next";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { WireframeCar } from "@/components/wireframe-car";

type HomeHeroProps = {
  featuredHref?: Route;
  featuredLabel?: string;
};

export function HomeHero({ featuredHref, featuredLabel }: HomeHeroProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-background">
      <div className="relative mx-auto min-h-[min(88dvh,52rem)] max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-14">
        <div className="relative z-10 grid max-w-xl gap-6 lg:max-w-2xl">
          <motion.p
            className="font-mono text-[0.65rem] tracking-[0.18em] text-signal uppercase"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            Verified automotive index
          </motion.p>

          <motion.h1
            className="text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] font-extrabold tracking-[-0.03em] text-foreground uppercase"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            Machines
            <br />
            indexed.
          </motion.h1>

          <motion.p
            className="max-w-md text-base leading-7 text-muted"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
          >
            Manufacturer specifications, engineering detail, and the sources behind
            every number—built for enthusiasts who care about the exact trim.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-3 pt-1"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href="/browse"
              className="inline-flex min-h-11 items-center bg-foreground px-6 font-mono text-[0.65rem] tracking-[0.14em] text-background uppercase transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
            >
              Browse catalogue
            </Link>
            <Link
              href="/search"
              className="inline-flex min-h-11 items-center border border-line px-5 font-mono text-[0.65rem] tracking-[0.14em] text-foreground uppercase transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
            >
              Search index
            </Link>
          </motion.div>

          {featuredHref && featuredLabel ? (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.35 }}
            >
              <Link
                href={featuredHref}
                className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase transition-colors hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
              >
                Featured · {featuredLabel} →
              </Link>
            </motion.div>
          ) : null}
        </div>

        <motion.div
          className="pointer-events-none relative mt-8 w-full max-w-4xl lg:pointer-events-auto lg:absolute lg:top-8 lg:right-0 lg:mt-0 lg:w-[68%]"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <WireframeCar />
        </motion.div>
      </div>
    </section>
  );
}
