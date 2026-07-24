import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Container } from "@/components/container";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { VehicleCardGrid } from "@/components/vehicle-card-grid";
import { getModelByManufacturerAndSlug } from "@/features/catalog/queries";
import { parsePublicSlug } from "@/features/catalog/validation";

type Props = { params: Promise<{ manufacturerSlug: string; modelSlug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { manufacturerSlug, modelSlug } = await params;
  const manufacturer = parsePublicSlug(manufacturerSlug);
  const model = parsePublicSlug(modelSlug);
  if (!manufacturer.success || !model.success) return { title: "Model not found" };
  const record = await getModelByManufacturerAndSlug(manufacturer.data, model.data);
  return record
    ? {
        title: `${record.manufacturer.name} ${record.name}`,
        description: `Generations, model years, and trims for the ${record.manufacturer.name} ${record.name}.`,
      }
    : { title: "Model not found" };
}

export default async function ModelPage({ params }: Props) {
  const { manufacturerSlug, modelSlug } = await params;
  const manufacturer = parsePublicSlug(manufacturerSlug);
  const model = parsePublicSlug(modelSlug);
  if (!manufacturer.success || !model.success) notFound();
  const record = await getModelByManufacturerAndSlug(manufacturer.data, model.data);
  if (!record) notFound();

  const vehicleCount = record.generations.reduce(
    (total, generation) =>
      total +
      generation.modelYears.reduce(
        (yearTotal, modelYear) => yearTotal + modelYear.vehicles.length,
        0,
      ),
    0,
  );

  return (
    <main className="min-h-[70vh]">
      <Container className="py-10 sm:py-14">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Manufacturers", href: "/manufacturers" },
            {
              label: record.manufacturer.name,
              href: `/manufacturers/${record.manufacturer.slug}` as Route,
            },
            { label: record.name },
          ]}
        />
        <Reveal>
          <section className="mt-8 border-b border-line pb-12 sm:pb-16">
            <p className="font-mono text-[0.65rem] tracking-[0.16em] text-signal uppercase">
              Model record
            </p>
            <h1 className="mt-4 text-[clamp(2.75rem,8vw,5.5rem)] font-semibold tracking-[-0.035em] text-white">
              {record.manufacturer.name}{" "}
              <span className="text-white/40">{record.name}</span>
            </h1>
            <p className="mt-5 font-mono text-[0.65rem] tracking-[0.13em] text-muted uppercase">
              {record.generations.length} generation
              {record.generations.length === 1 ? "" : "s"} · {vehicleCount} published
              trim{vehicleCount === 1 ? "" : "s"}
            </p>
          </section>
        </Reveal>

        {record.generations.length ? (
          <div className="mt-14 space-y-16">
            {record.generations.map((generation) => (
              <section key={generation.id}>
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
                  <div>
                    <p className="font-mono text-[0.64rem] tracking-[0.14em] text-signal uppercase">
                      Generation
                    </p>
                    <h2 className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-white">
                      {generation.displayName ?? generation.code}
                    </h2>
                  </div>
                  <span className="font-mono text-[0.64rem] tracking-[0.12em] text-muted uppercase">
                    Code {generation.code}
                  </span>
                </div>
                {generation.modelYears.map((modelYear) => (
                  <div key={modelYear.id} className="mt-8">
                    <h3 className="font-mono text-[0.7rem] tracking-[0.14em] text-white uppercase">
                      Model year {modelYear.year}
                    </h3>
                    <VehicleCardGrid
                      vehicles={modelYear.vehicles}
                      className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                      delay={0.04}
                    />
                  </div>
                ))}
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-12">
            <EmptyState
              eyebrow="No published generations"
              title="This model has no visible generation records yet."
              description="Generations and trims become public as their source data is verified."
            />
          </div>
        )}
      </Container>
    </main>
  );
}
