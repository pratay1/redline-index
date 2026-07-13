import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { SearchForm } from "@/components/search-form";
import { SectionHeading } from "@/components/section-heading";
import { VehicleCard } from "@/components/vehicle-card";
import { getPublishedVehicleCards } from "@/features/catalog/queries";

export const metadata: Metadata = {
  title: "Browse vehicles",
  description: "Browse verified vehicle records in the Redline Index catalogue.",
};

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const vehicles = await getPublishedVehicleCards();

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Browse" }]} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
        <div>
          <p className="font-mono text-[0.65rem] tracking-[0.15em] text-[var(--signal)] uppercase">
            Public catalogue
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.065em] text-white sm:text-6xl">
            Browse vehicles
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-[var(--muted)]">
            Every listed trim is tied to a specific market, model year, powertrain, and
            source trail.
          </p>
        </div>
        <SearchForm compact />
      </div>
      <div className="mt-14">
        <SectionHeading
          eyebrow={`${vehicles.length} published record${vehicles.length === 1 ? "" : "s"}`}
          title="Current index"
        />
        {vehicles.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              eyebrow="No records yet"
              title="The catalogue is waiting for its first verified entry."
              description="Published vehicle records will appear here as the index grows."
            />
          </div>
        )}
      </div>
    </main>
  );
}
