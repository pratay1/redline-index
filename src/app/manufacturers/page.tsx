import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Container } from "@/components/container";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { PageHeader } from "@/components/page-header";
import { getManufacturerIndex } from "@/features/catalog/queries";

export const metadata: Metadata = {
  title: "Manufacturers",
  description: "Browse automotive manufacturers indexed by Redline Index.",
};

export const dynamic = "force-dynamic";

export default async function ManufacturersPage() {
  const manufacturers = await getManufacturerIndex();

  return (
    <main className="min-h-[70vh]">
      <Container className="py-10 sm:py-14">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Manufacturers" }]}
        />
        <Reveal>
          <PageHeader
            eyebrow="The marques"
            title="Manufacturers"
            description="Start with the maker, then follow the lineage through models, generations, and exact trim specifications."
          />
        </Reveal>
        {manufacturers.length ? (
          <Stagger className="mt-14 divide-y divide-line border-y border-line" delay={0.05}>
            {manufacturers.map((manufacturer, index) => (
              <StaggerItem key={manufacturer.id}>
                <Link
                  href={`/manufacturers/${manufacturer.slug}`}
                  className="group grid gap-4 py-7 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:gap-6"
                >
                  <span className="font-mono text-[0.65rem] tracking-[0.13em] text-signal">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                      {manufacturer.name}
                    </span>
                    <span className="mt-1 block text-sm text-muted">
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
                  <span className="font-mono text-[0.64rem] tracking-[0.12em] text-white/55 uppercase transition-colors group-hover:text-signal">
                    {manufacturer._count.models} models →
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <div className="mt-12">
            <EmptyState
              eyebrow="No manufacturers"
              title="No published manufacturer records are available."
              description="Manufacturers become visible here when they have published vehicle records."
            />
          </div>
        )}
      </Container>
    </main>
  );
}
