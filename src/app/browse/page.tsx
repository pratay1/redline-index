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
import { getFastestVehiclePerModel } from "@/features/catalog/queries";

export const metadata: Metadata = {
  title: "Browse vehicles",
  description:
    "Browse the fastest published trim for every model in the Redline Index catalogue.",
};

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const vehicles = await getFastestVehiclePerModel();

  return (
    <main className="min-h-[70vh]">
      <Container className="py-10 sm:py-14">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Browse" }]} />
        <Reveal>
          <PageHeader
            eyebrow="Public catalogue"
            title="Browse vehicles"
            description="The fastest published trim from each model, ranked by recorded top speed."
            action={<SearchForm compact />}
          />
        </Reveal>
        <div className="mt-16">
          <SectionHeading
            eyebrow={`${vehicles.length} model${vehicles.length === 1 ? "" : "s"} · highest top speed first`}
            title="Fastest by model"
          />
          {vehicles.length ? (
            <Stagger
              className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
              delay={0.05}
            >
              {vehicles.map((vehicle) => (
                <StaggerItem key={vehicle.id}>
                  <VehicleCard vehicle={vehicle} showTopSpeed />
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <div className="mt-8">
              <EmptyState
                eyebrow="No records yet"
                title="No ranked vehicles are available yet."
                description="Published records with verified performance data will appear here as the index grows."
              />
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
