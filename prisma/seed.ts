import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { SeedCtx } from "./seed/bmw-shared";
import { seedBmw2Series } from "./seed/bmw-2-series";
import { seedBmw3Series } from "./seed/bmw-3-series";
import { seedBmw4Series } from "./seed/bmw-4-series";
import { seedBmw5Series } from "./seed/bmw-5-series";
import { seedBmw7Series } from "./seed/bmw-7-series";
import { seedBmwISeries } from "./seed/bmw-i-series";
import { seedBmwXSeries } from "./seed/bmw-x-series";
import { seedBmwZSeries } from "./seed/bmw-z-series";
import { seedMercedesACla } from "./seed/mercedes-a-cla";
import { seedMercedesAmgGt } from "./seed/mercedes-amg-gt";
import { seedMercedesCClass } from "./seed/mercedes-c-class";
import { seedMercedesEClass } from "./seed/mercedes-e-class";
import { seedMercedesEqCompact } from "./seed/mercedes-eq-compact";
import { seedMercedesEqFlagship } from "./seed/mercedes-eq-flagship";
import { seedMercedesGClass } from "./seed/mercedes-g-class";
import { seedMercedesGlaGlb } from "./seed/mercedes-gla-glb";
import { seedMercedesGlc } from "./seed/mercedes-glc";
import { seedMercedesGleGls } from "./seed/mercedes-gle-gls";
import { seedMercedesOther } from "./seed/mercedes-other";
import { seedMercedesRoadstersCle } from "./seed/mercedes-roadsters-cle";
import { seedMercedesSClass } from "./seed/mercedes-s-class";
import { ensureMercedesManufacturer } from "./seed/mercedes-shared";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString)
  throw new Error("Set DIRECT_URL or DATABASE_URL before running the seed script.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const PRICING_DATE = new Date("2024-05-29T00:00:00.000Z");

async function main() {
  const importer = await prisma.user.upsert({
    where: { clerkId: "system_redline_catalog_importer" },
    create: {
      clerkId: "system_redline_catalog_importer",
      name: "Redline Index catalog importer",
      role: "EDITOR",
    },
    update: { name: "Redline Index catalog importer", role: "EDITOR", deletedAt: null },
  });

  const bmw = await prisma.manufacturer.upsert({
    where: { slug: "bmw" },
    create: { name: "BMW", slug: "bmw", country: "Germany", foundedIn: 1916 },
    update: { name: "BMW", country: "Germany", foundedIn: 1916 },
  });

  const mercedes = await ensureMercedesManufacturer(prisma);

  const bmwCtx: SeedCtx = {
    prisma,
    importerId: importer.id,
    manufacturerId: bmw.id,
    pricingDate: PRICING_DATE,
  };

  const mercedesCtx: SeedCtx = {
    prisma,
    importerId: importer.id,
    manufacturerId: mercedes.id,
    pricingDate: PRICING_DATE,
  };

  // Hierarchy: Manufacturer → Model → Generation → Year → Trim (see CATALOGUE-HIERARCHY.md)
  const bmwJobs: Array<[string, () => Promise<{ seeded: string[]; skipped: string[] }>]> = [
    ["2", () => seedBmw2Series(bmwCtx)],
    ["3", () => seedBmw3Series(bmwCtx)],
    ["4", () => seedBmw4Series(bmwCtx)],
    ["5", () => seedBmw5Series(bmwCtx)],
    ["7", () => seedBmw7Series(bmwCtx)],
    ["i", () => seedBmwISeries(bmwCtx)],
    ["X", () => seedBmwXSeries(bmwCtx)],
    ["Z", () => seedBmwZSeries(bmwCtx)],
  ];

  for (const [name, run] of bmwJobs) {
    const result = await run();
    console.log(
      `BMW ${name} Series: seeded ${result.seeded.length}, skipped ${result.skipped.length}`,
    );
    if (result.seeded.length > 0) console.log(`  Seeded: ${result.seeded.join(", ")}`);
    if (result.skipped.length > 0) console.log(`  Skipped: ${result.skipped.join("; ")}`);
  }

  const mercedesJobs: Array<[string, () => Promise<{ seeded: string[]; skipped: string[] }>]> = [
    ["A/CLA", () => seedMercedesACla(mercedesCtx)],
    ["C-Class", () => seedMercedesCClass(mercedesCtx)],
    ["E-Class", () => seedMercedesEClass(mercedesCtx)],
    ["S/Maybach", () => seedMercedesSClass(mercedesCtx)],
    ["GLA/GLB", () => seedMercedesGlaGlb(mercedesCtx)],
    ["GLC", () => seedMercedesGlc(mercedesCtx)],
    ["GLE/GLS", () => seedMercedesGleGls(mercedesCtx)],
    ["G-Class", () => seedMercedesGClass(mercedesCtx)],
    ["SL/CLE", () => seedMercedesRoadstersCle(mercedesCtx)],
    ["AMG GT", () => seedMercedesAmgGt(mercedesCtx)],
    ["EQ compact", () => seedMercedesEqCompact(mercedesCtx)],
    ["EQ flagship", () => seedMercedesEqFlagship(mercedesCtx)],
    ["Other", () => seedMercedesOther(mercedesCtx)],
  ];

  for (const [name, run] of mercedesJobs) {
    const result = await run();
    console.log(
      `Mercedes ${name}: seeded ${result.seeded.length}, skipped ${result.skipped.length}`,
    );
    if (result.seeded.length > 0) console.log(`  Seeded: ${result.seeded.join(", ")}`);
    if (result.skipped.length > 0) console.log(`  Skipped: ${result.skipped.join("; ")}`);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
