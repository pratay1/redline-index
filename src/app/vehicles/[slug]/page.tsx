import Image from "next/image";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Container } from "@/components/container";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
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
      <section className="border-line border-b">
        <Container className="py-8">
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
        </Container>
        <div className="border-line mx-auto grid max-w-7xl border-x lg:grid-cols-[minmax(0,0.9fr)_minmax(25rem,1.1fr)]">
          <Reveal className="flex flex-col justify-end px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-20">
            <p className="text-signal font-mono text-[0.66rem] tracking-[0.16em] uppercase">
              {vehicle.market} market · {humanize(vehicle.bodyStyle)}
            </p>
            <p className="text-muted mt-6 font-mono text-xs tracking-[0.12em] uppercase">
              {manufacturer.name} / {model.name} / {generation.code} / {modelYear.year}
            </p>
            <h1 className="mt-3 text-[clamp(3.25rem,8vw,6.5rem)] leading-[0.9] font-semibold tracking-[-0.035em] text-white">
              {vehicle.name}
            </h1>
            <div className="border-line mt-10 grid grid-cols-3 gap-4 border-t pt-6">
              <div>
                <p className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                  {performance?.powerHp ?? "—"}
                </p>
                <p className="text-muted mt-1 font-mono text-[0.58rem] tracking-[0.13em] uppercase">
                  Horsepower
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                  {performance?.zeroToSixtySeconds ?? "—"}
                </p>
                <p className="text-muted mt-1 font-mono text-[0.58rem] tracking-[0.13em] uppercase">
                  0–60 sec
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                  {formatEngineDisplacement(engine.displacementCc)}
                </p>
                <p className="text-muted mt-1 font-mono text-[0.58rem] tracking-[0.13em] uppercase">
                  Displacement
                </p>
              </div>
            </div>
          </Reveal>
          <div className="border-line relative min-h-[22rem] border-t lg:min-h-[38rem] lg:border-t-0 lg:border-l">
            {heroImage ? (
              <Image
                src={heroImage.url}
                alt={heroImage.alt}
                fill
                unoptimized
                preload
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="bg-surface-raised grid h-full place-items-center">
                <span className="font-mono text-[0.65rem] tracking-[0.14em] text-white/35 uppercase">
                  No official image available
                </span>
              </div>
            )}
            {heroImage ? (
              <div className="absolute inset-x-0 bottom-0 bg-[#080808] px-5 pt-14 pb-5 font-mono text-[0.58rem] tracking-[0.12em] text-white/70 uppercase">
                {heroImage.credit ?? "Image credit unavailable"}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <Container className="grid gap-14 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.65fr)] lg:gap-16">
        <div className="space-y-12">
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

        <aside className="border-line h-fit border-t pt-6 lg:sticky lg:top-24">
          <h2 className="text-signal font-mono text-[0.65rem] tracking-[0.14em] uppercase">
            Record context
          </h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Manufacturer</dt>
              <dd className="text-right text-white">{manufacturer.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Model</dt>
              <dd className="text-right text-white">{model.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Generation</dt>
              <dd className="text-right text-white">
                {generation.displayName ?? generation.code}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Model year</dt>
              <dd className="text-right text-white">{modelYear.year}</dd>
            </div>
          </dl>
          <section className="border-line mt-10 border-t pt-6">
            <h2 className="text-signal font-mono text-[0.65rem] tracking-[0.14em] uppercase">
              Sources
            </h2>
            {sources.length ? (
              <ul className="mt-5 space-y-5">
                {sources.map((source) => (
                  <li key={source.id}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-signal focus-visible:outline-signal block text-sm font-medium text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
                    >
                      {source.title}
                    </a>
                    <p className="text-muted mt-1 font-mono text-[0.58rem] tracking-[0.1em] uppercase">
                      {source.publisher} · {humanize(source.type)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted mt-4 text-sm">
                No sources are attached to this record yet.
              </p>
            )}
          </section>
        </aside>
      </Container>

      <section className="border-line border-t">
        <Container className="py-14 sm:py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[0.65rem] tracking-[0.14em] text-white/45 uppercase">
                Same year, same generation
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                Related trims
              </h2>
            </div>
            <Link
              href={`/manufacturers/${manufacturer.slug}/${model.slug}`}
              className="text-muted font-mono text-[0.64rem] tracking-[0.13em] uppercase transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Model record →
            </Link>
          </div>
          {relatedTrims.length ? (
            <Stagger
              className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
              delay={0.05}
            >
              {relatedTrims.map((relatedTrim) => (
                <StaggerItem key={relatedTrim.id}>
                  <VehicleCard vehicle={relatedTrim} />
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <div className="mt-8">
              <EmptyState
                eyebrow="No sibling trims"
                title="No other published trims match this model year yet."
                description="Additional verified trim records will appear here as they are indexed."
              />
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
