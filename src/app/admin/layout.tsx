import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/features/auth/authorization";

const sections = [
  "trims",
  "manufacturers",
  "models",
  "generations",
  "model-years",
  "engines",
  "transmissions",
  "images",
  "sources",
];

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  try {
    await requireAdmin();
  } catch {
    notFound();
  }

  return (
    <section className="border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[13rem_1fr] lg:px-10">
        <aside className="rounded-2xl border border-line bg-[#0e0e0e] p-4">
          <p className="font-mono text-[0.65rem] tracking-[0.16em] text-white/45 uppercase">
            Editorial console
          </p>
          <nav aria-label="Admin navigation" className="mt-4 grid gap-1">
            {sections.map((section) => (
              <Link
                key={section}
                href={`/admin/${section}`}
                className="rounded-lg px-3 py-2 font-mono text-xs tracking-[0.1em] text-muted uppercase hover:bg-[#161616] hover:text-white"
              >
                {section.replaceAll("-", " ")}
              </Link>
            ))}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </section>
  );
}
