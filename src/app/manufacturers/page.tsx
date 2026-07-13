import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { getManufacturerIndex } from "@/features/catalog/queries";

export const metadata: Metadata = {
  title: "Manufacturers",
  description: "Browse automotive manufacturers indexed by Redline Index.",
};

export const dynamic = "force-dynamic";

export default async function ManufacturersPage() {
  const manufacturers = await getManufacturerIndex();

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Manufacturers" }]} />
      <section className="mt-8 max-w-3xl">
        <p className="font-mono text-[0.65rem] tracking-[0.15em] text-[var(--signal)] uppercase">
          The marques
        </p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.065em] text-white sm:text-6xl">
          Manufacturers
        </h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          Start with the maker, then follow the lineage through models, generations, and
          exact trim specifications.
        </p>
      </section>
      {manufacturers.length ? (
        <ol className="mt-14 border-t border-white/15">
          {manufacturers.map((manufacturer, index) => (
            <li key={manufacturer.id} className="border-b border-white/10">
              <Link
                href={`/manufacturers/${manufacturer.slug}`}
                className="group grid gap-4 py-7 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--signal)] sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:gap-6"
              >
                <span className="font-mono text-[0.65rem] tracking-[0.13em] text-[var(--signal)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block text-3xl font-semibold tracking-[-0.055em] text-white sm:text-4xl">
                    {manufacturer.name}
                  </span>
                  <span className="mt-1 block text-sm text-[var(--muted)]">
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
                <span className="font-mono text-[0.64rem] tracking-[0.12em] text-white/60 uppercase group-hover:text-[var(--signal)]">
                  {manufacturer._count.models} models →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-12">
          <EmptyState
            eyebrow="No manufacturers"
            title="No published manufacturer records are available."
            description="Manufacturers become visible here when they have published vehicle records."
          />
        </div>
      )}
    </main>
  );
}
