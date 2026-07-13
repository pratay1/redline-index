import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Container } from "@/components/container";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { PageHeader } from "@/components/page-header";
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
    <main className="min-h-[70vh]">
      <Container className="py-10 sm:py-14">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Browse" }]} />
        <Reveal>
          <PageHeader
            eyebrow="Public catalogue"
            title="Browse vehicles"
            description="Every listed trim is tied to a specific market, model year, powertrain, and source trail."
            action={<SearchForm compact />}
          />
        </Reveal>
        <div className="mt-16">
          <SectionHeading
            eyebrow={`${vehicles.length} published record${vehicles.length === 1 ? "" : "s"}`}
            title="Current index"
          />
          {vehicles.length ? (
            <Stagger className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3" delay={0.05}>
              {vehicles.map((vehicle) => (
                <StaggerItem key={vehicle.id}>
                  <VehicleCard vehicle={vehicle} />
                </StaggerItem>
              ))}
            </Stagger>
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
      </Container>
    </main>
  );
}
