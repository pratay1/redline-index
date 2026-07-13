import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { SearchForm } from "@/components/search-form";
import { VehicleCard } from "@/components/vehicle-card";
import { searchPublishedVehicles } from "@/features/catalog/queries";
import { parseSearchTerm } from "@/features/catalog/validation";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search manufacturers, models, generations, model years, and trims in Redline Index.",
};

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: Props) {
  const query = parseSearchTerm((await searchParams).q);
  const vehicles = query ? await searchPublishedVehicles(query) : [];

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <section className="mt-8 max-w-4xl">
        <p className="font-mono text-[0.65rem] tracking-[0.15em] text-[var(--signal)] uppercase">
          Search the index
        </p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.065em] text-white sm:text-6xl">
          Find the exact record.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
          Search by manufacturer, model, generation code, model year, or trim. Results
          are drawn directly from published database records.
        </p>
        <div className="mt-8">
          <SearchForm defaultValue={query ?? ""} />
        </div>
      </section>
      <section className="mt-14">
        {!query ? (
          <EmptyState
            eyebrow="Search ready"
            title="Start with a marque, a model, or a year."
            description="Try BMW, 3 Series, G20, 2025, 330i, or M340i."
          />
        ) : vehicles.length ? (
          <>
            <p className="font-mono text-[0.65rem] tracking-[0.14em] text-[var(--muted)] uppercase">
              {vehicles.length} result{vehicles.length === 1 ? "" : "s"} for{" "}
              <span className="text-white">“{query}”</span>
            </p>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            eyebrow="No matching records"
            title={`Nothing indexed for “${query}”.`}
            description="Try a broader term, check a spelling, or browse the catalogue to see the currently published records."
            href="/browse"
            linkLabel="Browse records"
          />
        )}
      </section>
    </main>
  );
}
