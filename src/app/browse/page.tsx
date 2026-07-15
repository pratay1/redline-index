import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Container } from "@/components/container";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/page-header";
import { SearchForm } from "@/components/search-form";
import { SectionHeading } from "@/components/section-heading";
import { VehicleCardGrid } from "@/components/vehicle-card-grid";
import { getFastestVehiclePerModel } from "@/features/catalog/queries";

export const metadata: Metadata = {
  title: "Browse vehicles",
  description:
    "Browse the quickest published trim for every model in the Redline Index catalogue, ranked by 0–60 time.",
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
            description="The quickest published trim from each model, ranked by recorded 0–60 time."
            action={<SearchForm compact />}
          />
        </Reveal>
        <div className="mt-16">
          <SectionHeading
            eyebrow={`${vehicles.length} model${vehicles.length === 1 ? "" : "s"} · quickest 0–60 first`}
            title="Quickest by model"
          />
          {vehicles.length ? (
            <VehicleCardGrid vehicles={vehicles} />
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
