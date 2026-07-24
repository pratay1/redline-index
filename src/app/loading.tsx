import { Container } from "@/components/container";

export default function Loading() {
  return (
    <main className="min-h-[70vh]" aria-label="Loading Redline Index" aria-busy="true">
      <section className="border-b border-white/10 bg-[#080808]">
        <Container className="py-16 sm:py-24">
          <div className="max-w-3xl">
            <div className="h-2 w-28 animate-pulse bg-white/10" />
            <div className="mt-6 h-16 w-full max-w-2xl animate-pulse bg-white/10 sm:h-24" />
            <div className="mt-6 h-4 w-full max-w-xl animate-pulse bg-white/10" />
            <div className="mt-3 h-4 w-3/4 max-w-md animate-pulse bg-white/10" />
            <div className="mt-10 flex gap-2">
              <div className="h-12 flex-1 animate-pulse rounded-full bg-white/10" />
              <div className="h-12 w-24 animate-pulse rounded-full bg-white/10" />
            </div>
          </div>
        </Container>
      </section>
      <Container className="py-10 sm:py-12">
        <div className="grid grid-cols-3 gap-6 sm:gap-10">
          {[0, 1, 2].map((index) => (
            <div key={index}>
              <div className="h-2 w-20 animate-pulse bg-white/10" />
              <div className="mt-3 h-8 w-12 animate-pulse bg-white/10" />
            </div>
          ))}
        </div>
      </Container>
      <Container className="py-14 sm:py-20">
        <div className="h-2 w-20 animate-pulse bg-white/10" />
        <div className="mt-4 h-9 w-48 animate-pulse bg-white/10" />
        <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="grid gap-3 py-7 sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:gap-8"
            >
              <div className="h-2 w-5 animate-pulse bg-white/10" />
              <div>
                <div className="h-8 w-44 animate-pulse bg-white/10 sm:h-10" />
                <div className="mt-3 h-3 w-32 animate-pulse bg-white/10" />
              </div>
              <div className="h-2 w-16 animate-pulse bg-white/10" />
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
