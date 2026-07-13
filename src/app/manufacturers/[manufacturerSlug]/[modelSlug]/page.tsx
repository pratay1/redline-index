import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { VehicleCard } from "@/components/vehicle-card";
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
    <main className="mx-auto min-h-[70vh] max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
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
      <section className="mt-8 border-b border-white/15 pb-10 sm:pb-14">
        <p className="font-mono text-[0.65rem] tracking-[0.15em] text-[var(--signal)] uppercase">
          Model record
        </p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.065em] text-white sm:text-7xl">
          {record.manufacturer.name}{" "}
          <span className="text-white/40">{record.name}</span>
        </h1>
        <p className="mt-5 font-mono text-[0.65rem] tracking-[0.13em] text-[var(--muted)] uppercase">
          {record.generations.length} generation
          {record.generations.length === 1 ? "" : "s"} · {vehicleCount} published trim
          {vehicleCount === 1 ? "" : "s"}
        </p>
      </section>

      {record.generations.length ? (
        <div className="mt-12 space-y-14">
          {record.generations.map((generation) => (
            <section key={generation.id}>
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="font-mono text-[0.64rem] tracking-[0.14em] text-[var(--signal)] uppercase">
                    Generation
                  </p>
                  <h2 className="mt-1 text-3xl font-semibold tracking-[-0.05em] text-white">
                    {generation.displayName ?? generation.code}
                  </h2>
                </div>
                <span className="font-mono text-[0.64rem] tracking-[0.12em] text-[var(--muted)] uppercase">
                  Code {generation.code}
                </span>
              </div>
              {generation.modelYears.map((modelYear) => (
                <div key={modelYear.id} className="mt-8">
                  <h3 className="font-mono text-[0.7rem] tracking-[0.14em] text-white uppercase">
                    Model year {modelYear.year}
                  </h3>
                  <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {modelYear.vehicles.map((vehicle) => (
                      <VehicleCard key={vehicle.id} vehicle={vehicle} />
                    ))}
                  </div>
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
    </main>
  );
}
