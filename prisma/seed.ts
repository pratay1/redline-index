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

  const manufacturer = await prisma.manufacturer.upsert({
    where: { slug: "bmw" },
    create: { name: "BMW", slug: "bmw", country: "Germany", foundedIn: 1916 },
    update: { name: "BMW", country: "Germany", foundedIn: 1916 },
  });

  const seriesCtx: SeedCtx = {
    prisma,
    importerId: importer.id,
    manufacturerId: manufacturer.id,
    pricingDate: PRICING_DATE,
  };

  const seriesJobs: Array<[string, () => Promise<{ seeded: string[]; skipped: string[] }>]> = [
    ["2", () => seedBmw2Series(seriesCtx)],
    ["3", () => seedBmw3Series(seriesCtx)],
    ["4", () => seedBmw4Series(seriesCtx)],
    ["5", () => seedBmw5Series(seriesCtx)],
    ["7", () => seedBmw7Series(seriesCtx)],
    ["i", () => seedBmwISeries(seriesCtx)],
    ["X", () => seedBmwXSeries(seriesCtx)],
    ["Z", () => seedBmwZSeries(seriesCtx)],
  ];

  for (const [name, run] of seriesJobs) {
    const result = await run();
    console.log(
      `BMW ${name} Series module: seeded ${result.seeded.length}, skipped ${result.skipped.length}`,
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
