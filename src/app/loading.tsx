import { Container } from "@/components/container";

export default function Loading() {
  return (
    <main
      className="min-h-[70vh]"
      aria-label="Loading page"
      aria-busy="true"
    >
      <Container className="py-10 sm:py-14">
        <div className="h-3 w-32 animate-pulse bg-line" />
        <div className="mt-8 h-14 max-w-xl animate-pulse bg-line" />
        <div className="mt-4 h-4 max-w-md animate-pulse bg-line/70" />
        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-80 animate-pulse border border-line bg-surface"
            />
          ))}
        </div>
      </Container>
    </main>
  );
}
