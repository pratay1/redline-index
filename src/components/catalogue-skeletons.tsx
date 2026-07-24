import { Container } from "@/components/container";

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse bg-white/10 ${className}`}
    />
  );
}

function BreadcrumbSkeleton({ items = 2 }: { items?: number }) {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          {index > 0 ? <Skeleton className="h-px w-3 bg-white/20" /> : null}
          <Skeleton className={`h-2 ${index === items - 1 ? "w-16" : "w-10"}`} />
        </div>
      ))}
    </div>
  );
}

function PageHeadingSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:items-end">
      <div className="max-w-3xl">
        <Skeleton className="h-2 w-28" />
        <Skeleton className="mt-4 h-12 w-64 max-w-full sm:h-16 sm:w-[32rem]" />
        <Skeleton className="mt-6 h-4 w-full max-w-xl" />
        <Skeleton className="mt-3 h-4 w-3/4 max-w-md" />
      </div>
      {action ? (
        <div className="flex gap-2">
          <Skeleton className="h-11 flex-1 rounded-full" />
          <Skeleton className="h-11 w-24 rounded-full" />
        </div>
      ) : null}
    </div>
  );
}

export function VehicleCardSkeleton() {
  return (
    <article
      className="overflow-hidden rounded-2xl border border-white/12 bg-[#0e0e0e]"
      aria-hidden="true"
    >
      <Skeleton className="aspect-[16/10] w-full rounded-none bg-white/[0.07]" />
      <div className="p-5 sm:p-6">
        <Skeleton className="h-2 w-36" />
        <Skeleton className="mt-3 h-7 w-2/3" />
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
          {[0, 1, 2].map((item) => (
            <div key={item}>
              <Skeleton className="h-4 w-10" />
              <Skeleton className="mt-2 h-2 w-14" />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export function VehicleCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <VehicleCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function CataloguePageSkeleton({
  searchAction = false,
}: {
  searchAction?: boolean;
}) {
  return (
    <main className="min-h-[70vh]" aria-busy="true" aria-label="Loading catalogue">
      <Container className="py-10 sm:py-14">
        <BreadcrumbSkeleton />
        <PageHeadingSkeleton action={searchAction} />
        <section className="mt-16">
          <Skeleton className="h-2 w-40" />
          <Skeleton className="mt-4 h-9 w-60" />
          <VehicleCardGridSkeleton />
        </section>
      </Container>
    </main>
  );
}

export function ManufacturerIndexSkeleton() {
  return (
    <main className="min-h-[70vh]" aria-busy="true" aria-label="Loading manufacturers">
      <Container className="py-10 sm:py-14">
        <BreadcrumbSkeleton />
        <PageHeadingSkeleton />
        <div className="divide-line border-line mt-14 divide-y border-y">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="grid gap-4 py-7 sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:gap-6"
            >
              <Skeleton className="h-2 w-5" />
              <div>
                <Skeleton className="h-8 w-48 sm:h-10" />
                <Skeleton className="mt-3 h-3 w-32" />
              </div>
              <Skeleton className="h-2 w-16" />
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}

export function ManufacturerRecordSkeleton() {
  return (
    <main
      className="min-h-[70vh]"
      aria-busy="true"
      aria-label="Loading manufacturer record"
    >
      <Container className="py-10 sm:py-14">
        <BreadcrumbSkeleton items={3} />
        <section className="border-line mt-8 border-b pb-12 sm:pb-16">
          <Skeleton className="h-2 w-32" />
          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Skeleton className="h-16 w-72 max-w-full sm:h-24" />
              <Skeleton className="mt-5 h-4 w-40" />
            </div>
            <Skeleton className="h-2 w-28" />
          </div>
        </section>
        <section className="mt-14">
          <Skeleton className="h-2 w-24" />
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <article
                key={index}
                className="border-line border bg-[#0e0e0e] p-6 sm:p-8"
              >
                <Skeleton className="h-2 w-28" />
                <Skeleton className="mt-8 h-9 w-44" />
                <Skeleton className="mt-4 h-4 w-full" />
                <Skeleton className="mt-3 h-4 w-3/4" />
                <Skeleton className="mt-8 h-2 w-32" />
              </article>
            ))}
          </div>
        </section>
        <section className="border-line mt-20 border-t pt-12">
          <Skeleton className="h-2 w-28" />
          <VehicleCardGridSkeleton count={3} />
        </section>
      </Container>
    </main>
  );
}

export function ModelRecordSkeleton() {
  return (
    <main className="min-h-[70vh]" aria-busy="true" aria-label="Loading model record">
      <Container className="py-10 sm:py-14">
        <BreadcrumbSkeleton items={4} />
        <section className="border-line mt-8 border-b pb-12 sm:pb-16">
          <Skeleton className="h-2 w-24" />
          <Skeleton className="mt-5 h-14 w-[32rem] max-w-full sm:h-20" />
          <Skeleton className="mt-6 h-2 w-44" />
        </section>
        <section className="mt-14">
          <div className="border-line flex items-end justify-between border-b pb-4">
            <div>
              <Skeleton className="h-2 w-20" />
              <Skeleton className="mt-3 h-8 w-48" />
            </div>
            <Skeleton className="h-2 w-16" />
          </div>
          <Skeleton className="mt-8 h-3 w-28" />
          <VehicleCardGridSkeleton count={3} />
        </section>
      </Container>
    </main>
  );
}

function SpecificationGroupSkeleton({ rows }: { rows: number }) {
  return (
    <section>
      <Skeleton className="h-7 w-40" />
      <dl className="divide-line border-line mt-5 divide-y border-y">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-8 py-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </dl>
    </section>
  );
}

export function VehicleDetailSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading vehicle record">
      <section className="border-line border-b">
        <Container className="py-8">
          <BreadcrumbSkeleton items={5} />
        </Container>
        <div className="border-line mx-auto grid max-w-7xl border-x lg:mx-0 lg:max-w-none lg:grid-cols-[minmax(0,0.9fr)_minmax(25rem,1.1fr)] lg:border-x-0 lg:px-[50px]">
          <div className="flex flex-col justify-end px-5 py-10 sm:px-8 sm:py-14 lg:px-0 lg:py-20 lg:pr-10">
            <Skeleton className="h-2 w-28" />
            <Skeleton className="mt-7 h-3 w-64" />
            <Skeleton className="mt-4 h-16 w-80 max-w-full sm:h-24" />
            <div className="border-line mt-10 grid grid-cols-3 gap-4 border-t pt-6">
              {[0, 1, 2].map((item) => (
                <div key={item}>
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="mt-2 h-2 w-16" />
                </div>
              ))}
            </div>
          </div>
          <Skeleton className="border-line min-h-[22rem] rounded-none border-t bg-white/[0.07] lg:min-h-[38rem] lg:border-t-0 lg:border-l" />
        </div>
      </section>
      <Container className="grid gap-14 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.65fr)] lg:gap-16">
        <div className="space-y-12">
          <SpecificationGroupSkeleton rows={7} />
          <SpecificationGroupSkeleton rows={4} />
          <SpecificationGroupSkeleton rows={5} />
          <SpecificationGroupSkeleton rows={6} />
        </div>
        <aside className="border-line h-fit border-t pt-6">
          <Skeleton className="h-2 w-28" />
          <div className="mt-6 space-y-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
          <div className="border-line mt-10 border-t pt-6">
            <Skeleton className="h-2 w-16" />
            <Skeleton className="mt-5 h-3 w-full" />
            <Skeleton className="mt-3 h-3 w-3/4" />
          </div>
        </aside>
      </Container>
      <section className="border-line border-t">
        <Container className="py-14 sm:py-16">
          <Skeleton className="h-2 w-44" />
          <Skeleton className="mt-4 h-8 w-48" />
          <VehicleCardGridSkeleton count={3} />
        </Container>
      </section>
    </main>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading administration dashboard">
      <Skeleton className="h-2 w-24" />
      <Skeleton className="mt-4 h-10 w-80 max-w-full" />
      <Skeleton className="mt-5 h-4 w-full max-w-2xl" />
      <div className="border-line bg-line mt-10 grid gap-px overflow-hidden border sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-surface p-5">
            <Skeleton className="h-2 w-20" />
            <Skeleton className="mt-3 h-8 w-12" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-8 h-11 w-36" />
    </main>
  );
}

export function AdminListSkeleton({ title = "Catalogue records" }: { title?: string }) {
  return (
    <main aria-busy="true" aria-label={`Loading ${title.toLowerCase()}`}>
      <Skeleton className="h-2 w-24" />
      <Skeleton className="mt-4 h-10 w-48" />
      <Skeleton className="mt-7 h-10 w-full" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <article key={index} className="border-line bg-background border p-4">
            <Skeleton className="h-5 w-64 max-w-full" />
            <Skeleton className="mt-3 h-2 w-40" />
            <Skeleton className="mt-5 h-8 w-full" />
          </article>
        ))}
      </div>
    </main>
  );
}

export function TrimEditorSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading trim editor">
      <Skeleton className="h-2 w-20" />
      <Skeleton className="mt-4 h-10 w-64" />
      <div className="mt-10 space-y-8">
        {[
          ["General identity", 4],
          ["Market and powertrain", 4],
          ["Performance and dimensions", 6],
          ["Images and sources", 3],
        ].map(([label, fields]) => (
          <section
            key={label as string}
            className="border-line bg-background border p-5 sm:p-6"
          >
            <Skeleton className="h-5 w-44" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: fields as number }).map((_, index) => (
                <div key={index}>
                  <Skeleton className="h-2 w-20" />
                  <Skeleton className="mt-2 h-10 w-full" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
