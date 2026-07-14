import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [manufacturers, models, trims, drafts, sources] = await Promise.all([prisma.manufacturer.count(), prisma.vehicleModel.count(), prisma.vehicle.count(), prisma.vehicle.count({ where: { status: "DRAFT" } }), prisma.source.count()]);
  const stats = [[manufacturers, "Manufacturers"], [models, "Models"], [trims, "Trims"], [drafts, "Drafts"], [sources, "Sources"]];
  return <main><p className="font-mono text-[0.65rem] tracking-[0.16em] text-signal uppercase">Redline Index</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Catalogue administration</h1><p className="mt-4 max-w-2xl text-muted">Manage structured automotive records. Every change is authenticated, validated, and recorded in the audit log.</p><dl className="mt-10 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 xl:grid-cols-5">{stats.map(([value, label]) => <div key={String(label)} className="bg-surface p-5"><dt className="font-mono text-[0.62rem] tracking-[0.12em] text-muted uppercase">{label}</dt><dd className="mt-2 text-3xl font-semibold text-white">{value}</dd></div>)}</dl><Link href="/admin/trims/new" className="mt-8 inline-flex min-h-11 items-center bg-signal px-5 font-mono text-xs tracking-[0.12em] text-black uppercase">Create trim</Link></main>;
}
