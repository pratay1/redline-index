import type { Route } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { HomeHero } from "@/components/home-hero";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { SectionHeading } from "@/components/section-heading";
import { getHomepageData } from "@/features/catalog/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { vehicles, manufacturers, manufacturerCount, modelCount, vehicleCount } =
    await getHomepageData();
  const leadVehicle = vehicles[0];

  const featuredLabel = leadVehicle
    ? `${leadVehicle.modelYear.year} ${leadVehicle.modelYear.generation.model.manufacturer.name} ${leadVehicle.modelYear.generation.model.name} ${leadVehicle.name}`
    : undefined;

  return (
    <main>
      <HomeHero
        featuredHref={
          leadVehicle ? (`/vehicles/${leadVehicle.slug}` as Route) : undefined
        }
        featuredLabel={featuredLabel}
      />

      {/* Overlaps the hero fade so silk and content meet without a hard seam */}
      <div className="relative z-[1] -mt-16 sm:-mt-24">
      <section className="border-b border-white/10">
        <Container className="py-10 sm:py-12">
          <dl>
            <Stagger className="grid grid-cols-3 gap-6 sm:gap-10" delay={0.1}>
              {[
                [manufacturerCount, "Manufacturers"],
                [modelCount, "Models"],
                [vehicleCount, "Published trims"],
              ].map(([value, label]) => (
                <StaggerItem key={label as string}>
                  <div>
                    <dt className="font-mono text-[0.6rem] tracking-[0.14em] text-white/45 uppercase">
                      {label}
                    </dt>
                    <dd className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                      {value}
                    </dd>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </dl>
        </Container>
      </section>

      <section>
        <Container className="py-20 sm:py-24">
          <SectionHeading
            eyebrow="By marque"
            title="Manufacturers"
            action={
              <Link
                href="/manufacturers"
                className="font-mono text-[0.65rem] tracking-[0.13em] text-white/45 uppercase transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                View all →
              </Link>
            }
          />
          <Stagger
            className="mt-10 divide-y divide-white/10 border-y border-white/10"
            delay={0.05}
          >
            {manufacturers.map((manufacturer, index) => (
              <StaggerItem key={manufacturer.id}>
                <Link
                  href={`/manufacturers/${manufacturer.slug}`}
                  className="group grid gap-3 py-7 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:gap-8"
                >
                  <span className="font-mono text-[0.65rem] tracking-[0.14em] text-white/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                      {manufacturer.name}
                    </span>
                    <span className="mt-1 block text-sm text-white/50">
                      {[
                        manufacturer.country,
                        manufacturer.foundedIn
                          ? `Founded ${manufacturer.foundedIn}`
                          : undefined,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <span className="font-mono text-[0.64rem] tracking-[0.12em] text-white/45 uppercase transition-colors group-hover:text-white">
                    {manufacturer._count.models} model
                    {manufacturer._count.models === 1 ? "" : "s"} →
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>
      </div>
    </main>
  );
}
