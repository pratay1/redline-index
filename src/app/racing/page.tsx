import type { Metadata } from "next";
import { Container } from "@/components/container";
import { AnimatedShaderBackground } from "@/components/ui/animated-shader-background";

export const metadata: Metadata = {
  title: "Racing | Redline Index",
  description: "Redline Index racing coverage is coming soon.",
};

export default function RacingPage() {
  return (
    <main data-racing className="relative bg-[#050403]">
      <AnimatedShaderBackground fixed />
      <Container className="relative z-10 grid min-h-[calc(100svh-4.25rem)] place-items-center content-center px-0 pt-10 pb-28 sm:pt-14 sm:pb-36">
        <section
          className="w-full max-w-2xl -translate-y-12 px-7 py-10 text-center sm:-translate-y-16 sm:px-12 sm:py-14"
          aria-labelledby="racing-title"
        >
          <p className="font-mono text-[0.65rem] tracking-[0.2em] text-white/45 uppercase">
            Redline Index / Racing
          </p>
          <h1
            id="racing-title"
            className="mt-5 overflow-visible py-[0.12em] font-sans text-5xl leading-[1.15] font-bold tracking-[0.04em] text-white [text-shadow:0_2px_28px_rgb(255_255_255_/_0.18)] sm:text-7xl sm:leading-[1.12]"
          >
            Coming soon.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/65 sm:mt-6 sm:text-lg">
            Race cars, competition history, and the engineering behind them are
            on the way.
          </p>
        </section>
      </Container>
    </main>
  );
}
