import { Container } from "@/components/container";
import { AnimatedShaderBackground } from "@/components/ui/animated-shader-background";

export default function Loading() {
  return (
    <main
      data-racing
      className="relative min-h-[calc(100svh-4.25rem)] bg-[#050403]"
      aria-busy="true"
      aria-label="Loading Racing"
    >
      <AnimatedShaderBackground fixed />
      <Container className="relative z-10 grid min-h-[calc(100svh-4.25rem)] place-items-center content-center px-0 pt-10 pb-28 sm:pt-14 sm:pb-36">
        <section className="w-full max-w-2xl -translate-y-12 px-7 py-10 text-center sm:-translate-y-16 sm:px-12 sm:py-14">
          <div className="mx-auto h-2 w-40 animate-pulse bg-white/15" />
          <div className="mx-auto mt-6 h-14 w-72 max-w-full animate-pulse bg-white/15 sm:h-20 sm:w-96" />
          <div className="mx-auto mt-7 h-4 w-full max-w-xl animate-pulse bg-white/15" />
          <div className="mx-auto mt-3 h-4 w-2/3 max-w-sm animate-pulse bg-white/15" />
        </section>
      </Container>
    </main>
  );
}
