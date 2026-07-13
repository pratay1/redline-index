import Image from "next/image";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { SpecificationGroup } from "@/components/specification-group";
import { VehicleCard } from "@/components/vehicle-card";
import { getVehicleBySlug } from "@/features/catalog/queries";
import { parsePublicSlug } from "@/features/catalog/validation";
import {
  formatEngineDisplacement,
  formatMoney,
  formatNumber,
  humanize,
} from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parsedSlug = parsePublicSlug((await params).slug);
  if (!parsedSlug.success) return { title: "Vehicle not found" };
  const detail = await getVehicleBySlug(parsedSlug.data);
  if (!detail) return { title: "Vehicle not found" };
  const { vehicle } = detail;
  const model = vehicle.modelYear.generation.model;
  return {
    title: `${vehicle.modelYear.year} ${model.manufacturer.name} ${model.name} ${vehicle.name}`,
    description: `Specifications, performance, dimensions, pricing, and sources for the ${vehicle.modelYear.year} ${model.manufacturer.name} ${model.name} ${vehicle.name}.`,
  };
}

export default async function VehicleDetailPage({ params }: Props) {
  const parsedSlug = parsePublicSlug((await params).slug);
  if (!parsedSlug.success) notFound();
  const detail = await getVehicleBySlug(parsedSlug.data);
  if (!detail) notFound();

  const { vehicle, sources, relatedTrims } = detail;
  const {
    modelYear,
    engine,
    transmission,
    dimensions,
    performance,
    fuelEconomy,
    prices,
  } = vehicle;
  const { generation } = modelYear;
  const { model } = generation;
  const { manufacturer } = model;
  const heroImage = vehicle.images[0];

  return (
    <main>
      <section className="border-b border-white/10 bg-[#0d0f11]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Manufacturers", href: "/manufacturers" },
              {
                label: manufacturer.name,
                href: `/manufacturers/${manufacturer.slug}` as Route,
              },
              {
                label: model.name,
                href: `/manufacturers/${manufacturer.slug}/${model.slug}` as Route,
              },
              { label: vehicle.name },
            ]}
          />
        </div>
        <div className="mx-auto grid max-w-7xl border-x border-white/10 lg:grid-cols-[minmax(0,0.9fr)_minmax(25rem,1.1fr)]">
          <div className="flex flex-col justify-end px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-20">
            <p className="font-mono text-[0.66rem] tracking-[0.16em] text-[var(--signal)] uppercase">
              {vehicle.market} market · {humanize(vehicle.bodyStyle)}
            </p>
            <p className="mt-6 font-mono text-xs tracking-[0.12em] text-[var(--muted)] uppercase">
              {manufacturer.name} / {model.name} / {generation.code} / {modelYear.year}
            </p>
            <h1 className="mt-3 text-[clamp(3.5rem,8vw,7rem)] leading-[0.86] font-semibold tracking-[-0.075em] text-white">
              {vehicle.name}
            </h1>
            <div className="mt-9 grid grid-cols-3 gap-4 border-t border-white/15 pt-5">
              <div>
                <p className="text-2xl font-semibold tracking-[-0.04em] text-white">
                  {performance?.powerHp ?? "—"}
                </p>
                <p className="mt-1 font-mono text-[0.58rem] tracking-[0.13em] text-[var(--muted)] uppercase">
                  Horsepower
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-[-0.04em] text-white">
                  {performance?.zeroToSixtySeconds ?? "—"}
                </p>
                <p className="mt-1 font-mono text-[0.58rem] tracking-[0.13em] text-[var(--muted)] uppercase">
                  0–60 sec
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-[-0.04em] text-white">
                  {formatEngineDisplacement(engine.displacementCc)}
                </p>
                <p className="mt-1 font-mono text-[0.58rem] tracking-[0.13em] text-[var(--muted)] uppercase">
                  Displacement
                </p>
              </div>
            </div>
          </div>
          <div className="relative min-h-[22rem] border-t border-white/10 lg:min-h-[38rem] lg:border-t-0 lg:border-l">
            {heroImage ? (
              <Image
                src={heroImage.url}
                alt={heroImage.alt}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_50%_30%,#34373a,transparent_55%)]">
                <span className="font-mono text-[0.65rem] tracking-[0.14em] text-white/35 uppercase">
                  No official image available
                </span>
              </div>
            )}
            {heroImage ? (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-5 pt-16 pb-5 font-mono text-[0.58rem] tracking-[0.12em] text-white/65 uppercase">
                {heroImage.credit ?? "Image credit unavailable"}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.65fr)] lg:px-10">
        <div className="space-y-11">
          <SpecificationGroup
            title="Powertrain"
            items={[
              { label: "Engine", value: engine.name },
              { label: "Engine code", value: engine.code },
              {
                label: "Layout",
                value:
                  [
                    engine.configuration,
                    engine.cylinderCount
                      ? `${engine.cylinderCount} cylinders`
                      : undefined,
                  ]
                    .filter(Boolean)
                    .join(" · ") || null,
              },
              {
                label: "Displacement",
                value: formatEngineDisplacement(engine.displacementCc),
              },
              { label: "Induction", value: engine.induction },
              { label: "Electrification", value: engine.electrification },
              { label: "Fuel", value: humanize(engine.fuelType) },
            ]}
          />
          <SpecificationGroup
            title="Transmission & drive"
            items={[
              { label: "Transmission", value: transmission.name },
              { label: "Type", value: humanize(transmission.type) },
              {
                label: "Gears",
                value: transmission.gearCount
                  ? `${transmission.gearCount}-speed`
                  : null,
              },
              { label: "Drivetrain", value: humanize(vehicle.drivetrain) },
            ]}
          />
          <SpecificationGroup
            title="Performance"
            items={[
              { label: "Power", value: formatNumber(performance?.powerHp, "hp") },
              {
                label: "Torque",
                value: formatNumber(performance?.torqueLbFt, "lb-ft"),
              },
              {
                label: "0–60 mph",
                value: performance?.zeroToSixtySeconds
                  ? `${performance.zeroToSixtySeconds} sec`
                  : "—",
              },
              {
                label: "Quarter mile",
                value: performance?.quarterMileSeconds
                  ? `${performance.quarterMileSeconds} sec`
                  : "—",
              },
              {
                label: "Top speed",
                value: formatNumber(performance?.topSpeedMph, "mph"),
              },
            ]}
          />
          <SpecificationGroup
            title="Dimensions"
            items={[
              { label: "Length", value: formatNumber(dimensions?.lengthIn, "in") },
              { label: "Width", value: formatNumber(dimensions?.widthIn, "in") },
              { label: "Height", value: formatNumber(dimensions?.heightIn, "in") },
              {
                label: "Wheelbase",
                value: formatNumber(dimensions?.wheelbaseIn, "in"),
              },
              {
                label: "Curb weight",
                value: formatNumber(dimensions?.curbWeightKg, "kg"),
              },
              {
                label: "Seating",
                value: dimensions?.seatingCapacity
                  ? `${dimensions.seatingCapacity} seats`
                  : "—",
              },
            ]}
          />
          <SpecificationGroup
            title="Fuel economy"
            items={[
              { label: "City", value: formatNumber(fuelEconomy?.cityMpg, "mpg") },
              { label: "Highway", value: formatNumber(fuelEconomy?.highwayMpg, "mpg") },
              {
                label: "Combined",
                value: formatNumber(fuelEconomy?.combinedMpg, "mpg"),
              },
              {
                label: "Electric range",
                value: formatNumber(fuelEconomy?.electricRangeMiles, "mi"),
              },
            ]}
          />
          <SpecificationGroup
            title="Pricing"
            items={prices.map((price) => ({
              label: `${humanize(price.type)} · ${price.market}`,
              value: formatMoney(price.amountCents, price.currency),
            }))}
          />
        </div>

        <aside className="h-fit border-t border-white/15 pt-5 lg:sticky lg:top-6">
          <h2 className="font-mono text-[0.65rem] tracking-[0.14em] text-[var(--signal)] uppercase">
            Record context
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Manufacturer</dt>
              <dd className="text-right text-white">{manufacturer.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Model</dt>
              <dd className="text-right text-white">{model.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Generation</dt>
              <dd className="text-right text-white">
                {generation.displayName ?? generation.code}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Model year</dt>
              <dd className="text-right text-white">{modelYear.year}</dd>
            </div>
          </dl>
          <section className="mt-9 border-t border-white/10 pt-5">
            <h2 className="font-mono text-[0.65rem] tracking-[0.14em] text-[var(--signal)] uppercase">
              Sources
            </h2>
            {sources.length ? (
              <ul className="mt-4 space-y-4">
                {sources.map((source) => (
                  <li key={source.id}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm font-medium text-white hover:text-[var(--signal)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal)]"
                    >
                      {source.title}
                    </a>
                    <p className="mt-1 font-mono text-[0.58rem] tracking-[0.1em] text-[var(--muted)] uppercase">
                      {source.publisher} · {humanize(source.type)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-[var(--muted)]">
                No sources are attached to this record yet.
              </p>
            )}
          </section>
        </aside>
      </div>

      <section className="border-t border-white/10 bg-[#0e1012]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[0.65rem] tracking-[0.14em] text-[var(--signal)] uppercase">
                Same year, same generation
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
                Related trims
              </h2>
            </div>
            <Link
              href={`/manufacturers/${manufacturer.slug}/${model.slug}`}
              className="font-mono text-[0.64rem] tracking-[0.13em] text-[var(--muted)] uppercase hover:text-[var(--signal)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal)]"
            >
              Model record →
            </Link>
          </div>
          {relatedTrims.length ? (
            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {relatedTrims.map((relatedTrim) => (
                <VehicleCard key={relatedTrim.id} vehicle={relatedTrim} />
              ))}
            </div>
          ) : (
            <div className="mt-7">
              <EmptyState
                eyebrow="No sibling trims"
                title="No other published trims match this model year yet."
                description="Additional verified trim records will appear here as they are indexed."
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
