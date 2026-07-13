export default function Loading() {
  return (
    <main
      className="mx-auto min-h-[70vh] max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10"
      aria-label="Loading page"
      aria-busy="true"
    >
      <div className="h-3 w-32 animate-pulse bg-white/10" />
      <div className="mt-8 h-16 max-w-xl animate-pulse bg-white/10" />
      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-80 animate-pulse border border-white/10 bg-white/[0.03]"
          />
        ))}
      </div>
    </main>
  );
}
