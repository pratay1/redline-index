import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { VehicleCard } from "@/components/vehicle-card";
import { getManufacturerBySlug } from "@/features/catalog/queries";
import { parsePublicSlug } from "@/features/catalog/validation";

type Props = { params: Promise<{ manufacturerSlug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parsedSlug = parsePublicSlug((await params).manufacturerSlug);
  if (!parsedSlug.success) return { title: "Manufacturer not found" };
  const manufacturer = await getManufacturerBySlug(parsedSlug.data);
  return manufacturer
    ? {
        title: manufacturer.name,
        description: `Models, generations, and published vehicle records from ${manufacturer.name}.`,
      }
    : { title: "Manufacturer not found" };
}

export default async function ManufacturerPage({ params }: Props) {
  const parsedSlug = parsePublicSlug((await params).manufacturerSlug);
  if (!parsedSlug.success) notFound();
  const manufacturer = await getManufacturerBySlug(parsedSlug.data);
  if (!manufacturer) notFound();

  const vehicleCount = manufacturer.models.reduce(
    (total, model) =>
      total +
      model.generations.reduce(
        (generationTotal, generation) =>
          generationTotal +
          generation.modelYears.reduce(
            (yearTotal, modelYear) => yearTotal + modelYear.vehicles.length,
            0,
          ),
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
          { label: manufacturer.name },
        ]}
      />
      <section className="mt-8 border-b border-white/15 pb-10 sm:pb-14">
        <p className="font-mono text-[0.65rem] tracking-[0.15em] text-[var(--signal)] uppercase">
          Manufacturer record
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-6xl font-semibold tracking-[-0.07em] text-white sm:text-8xl">
              {manufacturer.name}
            </h1>
            <p className="mt-4 text-base text-[var(--muted)]">
              {[
                manufacturer.country,
                manufacturer.foundedIn
                  ? `Established ${manufacturer.foundedIn}`
                  : undefined,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <p className="font-mono text-[0.66rem] tracking-[0.14em] text-white/65 uppercase">
            {vehicleCount} published trim{vehicleCount === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      <section className="mt-12">
        <p className="font-mono text-[0.65rem] tracking-[0.14em] text-[var(--signal)] uppercase">
          Model line-up
        </p>
        {manufacturer.models.length ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {manufacturer.models.map((model) => {
              const firstGeneration = model.generations[0];
              const trims = model.generations.flatMap((generation) =>
                generation.modelYears.flatMap((modelYear) => modelYear.vehicles),
              );
              return (
                <Link
                  key={model.id}
                  href={`/manufacturers/${manufacturer.slug}/${model.slug}`}
                  className="group border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-[var(--signal)] hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--signal)] sm:p-8"
                >
                  <p className="font-mono text-[0.62rem] tracking-[0.14em] text-[var(--muted)] uppercase">
                    {firstGeneration?.displayName ??
                      firstGeneration?.code ??
                      "Generation indexed"}
                  </p>
                  <h2 className="mt-7 text-4xl font-semibold tracking-[-0.06em] text-white">
                    {model.name}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {trims.length} published trim{trims.length === 1 ? "" : "s"} across{" "}
                    {model.generations.length} documented generation
                    {model.generations.length === 1 ? "" : "s"}.
                  </p>
                  <span className="mt-8 inline-block font-mono text-[0.63rem] tracking-[0.13em] text-white/65 uppercase group-hover:text-[var(--signal)]">
                    View model record →
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              eyebrow="No models"
              title="No published models are available for this manufacturer."
              description="Published model records will appear when their vehicle data is ready."
            />
          </div>
        )}
      </section>

      {manufacturer.models.flatMap((model) =>
        model.generations.flatMap((generation) =>
          generation.modelYears.flatMap((modelYear) => modelYear.vehicles),
        ),
      ).length ? (
        <section className="mt-16 border-t border-white/15 pt-10">
          <p className="font-mono text-[0.65rem] tracking-[0.14em] text-[var(--signal)] uppercase">
            Featured records
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {manufacturer.models
              .flatMap((model) =>
                model.generations.flatMap((generation) =>
                  generation.modelYears.flatMap((modelYear) => modelYear.vehicles),
                ),
              )
              .map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
