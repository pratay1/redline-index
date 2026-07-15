"use client";

import dynamic from "next/dynamic";
import type { Route } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const Beams = dynamic(
  () => import("@/components/ui/ethereal-beams").then((m) => m.Beams),
  { ssr: false, loading: () => <div className="h-full w-full bg-black" /> },
);

type EtherealBeamsHeroProps = {
  featuredHref?: Route;
  featuredLabel?: string;
};

/**
 * Redline homepage hero — ethereal 3D beams with concise product copy.
 */
export default function EtherealBeamsHero({
  featuredHref,
  featuredLabel,
}: EtherealBeamsHeroProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate -mt-[4.25rem] min-h-dvh w-full overflow-visible">
      {/* Solid black through most of the first screen so the bars read */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[calc(100dvh-3rem)] bg-[#000000]"
        aria-hidden="true"
      />

      {/* Beams fill the first screen; shine is cut as they leave the hero */}
      <div
        className="absolute inset-x-0 top-0 z-0 h-[calc(100dvh+20rem)] opacity-80 [mask-image:linear-gradient(to_bottom,black_0%,black_calc(100%-22rem),rgba(0,0,0,0.35)_calc(100%-16rem),rgba(0,0,0,0.08)_calc(100%-9rem),transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_calc(100%-22rem),rgba(0,0,0,0.35)_calc(100%-16rem),rgba(0,0,0,0.08)_calc(100%-9rem),transparent_100%)]"
        aria-hidden="true"
      >
        {reduceMotion ? (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,#141414_0%,#000_72%)]" />
        ) : (
          <Beams
            beamWidth={2.5}
            beamHeight={18}
            beamNumber={15}
            lightColor="#c8c8c8"
            speed={2.5}
            noiseIntensity={1.7}
            scale={0.15}
            rotation={43}
          />
        )}
      </div>

      {/* Readability veil — softens shine without killing the glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[calc(100dvh-4rem)] bg-[linear-gradient(180deg,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.34)_45%,rgba(0,0,0,0.12)_80%,rgba(0,0,0,0)_100%)]"
        aria-hidden="true"
      />

      {/* Matte the fade zone so beams don't keep shining under the hero */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[78dvh] z-[2] h-[calc(22dvh+20rem)] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.55)_22%,rgba(0,0,0,0.92)_48%,rgba(3,3,3,0.75)_72%,rgba(3,3,3,0)_100%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-7xl flex-col justify-center px-5 pt-36 pb-24 sm:px-8 sm:pt-44 sm:pb-28 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h1
            className="mb-6 text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.04em] text-white"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            The exact trim.
            <br />
            <span className="text-white/45">Nothing vague.</span>
          </motion.h1>

          <motion.p
            className="mx-auto mb-10 max-w-lg text-base leading-7 text-white/65 sm:text-lg sm:leading-8"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            Horsepower, dimensions, MSRP, and fuel economy tied to the market,
            model year, and sources that back them up.
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-3 sm:flex-row"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href="/browse"
              className="group relative inline-flex min-h-12 items-center overflow-hidden rounded-full bg-white px-8 text-sm font-medium text-black transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <span className="relative z-10 inline-flex items-center">
                Browse the index
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-0 -top-2 -bottom-2 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
              />
            </Link>
            <Link
              href="/search"
              className="inline-flex min-h-12 items-center rounded-full border border-white/20 bg-[#121212] px-8 text-sm font-medium text-white transition-colors hover:border-white/35 hover:bg-[#1a1a1a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Search by trim
            </Link>
          </motion.div>

          {featuredHref && featuredLabel ? (
            <motion.div
              className="mt-10"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.28 }}
            >
              <Link
                href={featuredHref}
                className="font-mono text-[0.62rem] tracking-[0.14em] text-white/45 uppercase transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Start with · {featuredLabel} →
              </Link>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
