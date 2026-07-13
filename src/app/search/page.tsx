import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Container } from "@/components/container";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { PageHeader } from "@/components/page-header";
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
    <main className="min-h-[70vh]">
      <Container className="py-10 sm:py-14">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
        <Reveal>
          <PageHeader
            eyebrow="Search the index"
            title="Find the exact record."
            description="Search by manufacturer, model, generation code, model year, or trim. Results are drawn directly from published database records."
          />
        </Reveal>
        <Reveal delay={0.08} className="mt-8 max-w-3xl">
          <SearchForm defaultValue={query ?? ""} />
        </Reveal>
        <section className="mt-14">
          {!query ? (
            <EmptyState
              eyebrow="Search ready"
              title="Start with a marque, a model, or a year."
              description="Try BMW, 3 Series, G20, 2025, 330i, or M340i."
            />
          ) : vehicles.length ? (
            <>
              <p className="font-mono text-[0.65rem] tracking-[0.14em] text-muted uppercase">
                {vehicles.length} result{vehicles.length === 1 ? "" : "s"} for{" "}
                <span className="text-white">“{query}”</span>
              </p>
              <Stagger
                className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                delay={0.04}
              >
                {vehicles.map((vehicle) => (
                  <StaggerItem key={vehicle.id}>
                    <VehicleCard vehicle={vehicle} />
                  </StaggerItem>
                ))}
              </Stagger>
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
      </Container>
    </main>
  );
}
