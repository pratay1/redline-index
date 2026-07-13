import Image from "next/image";
import Link from "next/link";
import { SearchForm } from "@/components/search-form";
import { SectionHeading } from "@/components/section-heading";
import { VehicleCard } from "@/components/vehicle-card";
import { getHomepageData } from "@/features/catalog/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { vehicles, manufacturers, manufacturerCount, modelCount, vehicleCount } =
    await getHomepageData();
  const leadVehicle = vehicles[0];
  const leadImage = leadVehicle?.images[0];

  return (
    <main>
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="grid-fade absolute inset-0 -z-20" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-[radial-gradient(ellipse_at_76%_40%,rgba(239,61,47,0.2),transparent_48%)]" />
        <div className="mx-auto grid min-h-[min(760px,calc(100dvh-4rem))] max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.8fr)] lg:px-10 lg:py-20">
          <div className="flex flex-col justify-end">
            <p className="font-mono text-[0.66rem] tracking-[0.18em] text-[var(--signal)] uppercase">
              A precise automotive record
            </p>
            <h1 className="mt-5 max-w-4xl text-[clamp(3.6rem,9vw,8.5rem)] leading-[0.82] font-semibold tracking-[-0.075em] text-white">
              Machines, <span className="text-white/35">indexed.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              A growing public record of manufacturer specifications, engineering
              detail, performance data, and the sources behind every number.
            </p>
            <div className="mt-9 max-w-2xl">
              <SearchForm />
            </div>
            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-5 border-t border-white/15 pt-5">
              {[
                [manufacturerCount, "Manufacturers"],
                [modelCount, "Models"],
                [vehicleCount, "Verified trims"],
              ].map(([value, label]) => (
                <div key={label as string}>
                  <dt className="font-mono text-[0.6rem] tracking-[0.12em] text-[var(--muted)] uppercase">
                    {label}
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative min-h-[22rem] border border-white/15 bg-[#0d0f11] lg:min-h-0">
            {leadVehicle && leadImage ? (
              <>
                <Image
                  src={leadImage.url}
                  alt={leadImage.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="font-mono text-[0.62rem] tracking-[0.14em] text-[var(--signal)] uppercase">
                    Featured record
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">
                    {leadVehicle.modelYear.year}{" "}
                    {leadVehicle.modelYear.generation.model.manufacturer.name}{" "}
                    {leadVehicle.modelYear.generation.model.name} {leadVehicle.name}
                  </p>
                  <Link
                    href={`/vehicles/${leadVehicle.slug}`}
                    className="mt-4 inline-block border-b border-white/70 pb-1 font-mono text-[0.64rem] tracking-[0.14em] text-white uppercase hover:border-[var(--signal)] hover:text-[var(--signal)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal)]"
                  >
                    Open record
                  </Link>
                </div>
              </>
            ) : (
              <div className="grid h-full place-items-center p-8 text-center">
                <p className="font-mono text-xs tracking-[0.14em] text-[var(--muted)] uppercase">
                  Catalogue entries will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <SectionHeading
          eyebrow="Start with the marque"
          title="Featured manufacturers"
          action={
            <Link
              href="/manufacturers"
              className="font-mono text-[0.65rem] tracking-[0.13em] text-[var(--muted)] uppercase hover:text-[var(--signal)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal)]"
            >
              See all manufacturers →
            </Link>
          }
        />
        <div className="mt-9 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {manufacturers.map((manufacturer, index) => (
            <Link
              key={manufacturer.id}
              href={`/manufacturers/${manufacturer.slug}`}
              className="group bg-[#0b0c0d] p-6 transition-colors hover:bg-[#151719] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--signal)]"
            >
              <p className="font-mono text-[0.62rem] tracking-[0.14em] text-[var(--signal)] uppercase">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-10 text-3xl font-semibold tracking-[-0.06em] text-white">
                {manufacturer.name}
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {[
                  manufacturer.country,
                  manufacturer.foundedIn
                    ? `Founded ${manufacturer.foundedIn}`
                    : undefined,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="mt-6 font-mono text-[0.62rem] tracking-[0.12em] text-white/60 uppercase group-hover:text-[var(--signal)]">
                {manufacturer._count.models} model
                {manufacturer._count.models === 1 ? "" : "s"} indexed →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0e1012]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <SectionHeading
            eyebrow="The latest records"
            title="Featured vehicles"
            action={
              <Link
                href="/browse"
                className="font-mono text-[0.65rem] tracking-[0.13em] text-[var(--muted)] uppercase hover:text-[var(--signal)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal)]"
              >
                Browse catalogue →
              </Link>
            }
          />
          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
