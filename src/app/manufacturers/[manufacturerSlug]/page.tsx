import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Container } from "@/components/container";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { VehicleCardGrid } from "@/components/vehicle-card-grid";
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

  const featuredVehicles = manufacturer.models.flatMap((model) =>
    model.generations.flatMap((generation) =>
      generation.modelYears.flatMap((modelYear) => modelYear.vehicles),
    ),
  );

  const vehicleCount = featuredVehicles.length;

  return (
    <main className="min-h-[70vh]">
      <Container className="py-10 sm:py-14">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Manufacturers", href: "/manufacturers" },
            { label: manufacturer.name },
          ]}
        />
        <Reveal>
          <section className="mt-8 border-b border-line pb-12 sm:pb-16">
            <p className="font-mono text-[0.65rem] tracking-[0.16em] text-signal uppercase">
              Manufacturer record
            </p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
              <div>
                <h1 className="text-[clamp(3.5rem,10vw,7rem)] font-semibold tracking-[-0.035em] text-white">
                  {manufacturer.name}
                </h1>
                <p className="mt-4 text-base text-muted">
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
        </Reveal>

        <section className="mt-14">
          <p className="font-mono text-[0.65rem] tracking-[0.14em] text-signal uppercase">
            Model line-up
          </p>
          {manufacturer.models.length ? (
            <Stagger className="mt-6 grid gap-4 lg:grid-cols-2" delay={0.05}>
              {manufacturer.models.map((model) => {
                const firstGeneration = model.generations[0];
                const trims = model.generations.flatMap((generation) =>
                  generation.modelYears.flatMap((modelYear) => modelYear.vehicles),
                );
                return (
                  <StaggerItem key={model.id}>
                    <Link
                      href={`/manufacturers/${manufacturer.slug}/${model.slug}`}
                      className="group block border border-line bg-[#0e0e0e] p-6 transition-[border-color,background-color] duration-300 hover:border-white/30 hover:bg-[#161616] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white sm:p-8"
                    >
                      <p className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                        {firstGeneration?.displayName ??
                          firstGeneration?.code ??
                          "Generation indexed"}
                      </p>
                      <h2 className="mt-8 text-4xl font-semibold tracking-[-0.03em] text-white">
                        {model.name}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-muted">
                        {trims.length} published trim{trims.length === 1 ? "" : "s"}{" "}
                        across {model.generations.length} documented generation
                        {model.generations.length === 1 ? "" : "s"}.
                      </p>
                      <span className="mt-8 inline-block font-mono text-[0.63rem] tracking-[0.13em] text-white/60 uppercase transition-colors group-hover:text-signal">
                        View model record →
                      </span>
                    </Link>
                  </StaggerItem>
                );
              })}
            </Stagger>
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

        {featuredVehicles.length ? (
          <section className="mt-20 border-t border-line pt-12">
            <p className="font-mono text-[0.65rem] tracking-[0.14em] text-signal uppercase">
              Featured records
            </p>
            <VehicleCardGrid
              vehicles={featuredVehicles}
              className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
              delay={0.05}
            />
          </section>
        ) : null}
      </Container>
    </main>
  );
}
