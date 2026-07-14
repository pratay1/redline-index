/**
 * Split bmw-base-catalogue.ts into series modules, then write thin seed.ts.
 * Run from repo root: node prisma/seed/_split-series.mjs
 */
import fs from "fs";

const base = fs.readFileSync("prisma/seed/bmw-base-catalogue.ts", "utf8");

// Locate key markers inside the function body
const mark = (s) => {
  const i = base.indexOf(s);
  if (i < 0) throw new Error(`missing marker: ${s}`);
  return i;
};

const fnStart = mark("export async function seedBmwBaseCatalogue");
const bodyStart = mark("  const manufacturer = { id: manufacturerId };");
const after430iLoop = mark(
  '  const [x3Model, twoSeriesModel, x5Model, i4Model] = await Promise.all([',
);
const returnStart = mark("  return {\n    seeded: [");

const header = base.slice(0, fnStart);
const helpersAndSetup = base.slice(
  mark("const sourceData = {"),
  bodyStart,
);
const core34 = base.slice(bodyStart, after430iLoop);
const expansion = base.slice(after430iLoop, returnStart);

const sharedImport = `import type { SeedCtx } from "./bmw-shared";
`;

function wrap(name, exportName, extraComment, body) {
  return `/**
 * ${extraComment}
 */
${sharedImport}
export async function ${exportName}(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const prisma = ctx.prisma;
  const importerId = ctx.importerId;
  const manufacturerId = ctx.manufacturerId;
  const ctxPricingDate = ctx.pricingDate;

${helpersAndSetup}

${body}
}

`;
}

// --- 3 Series G20 core (330i/M340i family) ---
// core34 includes 4-series model + 430i; we need to split carefully.
// Find 430i vehicle upsert and model4 setup.

const model4Idx = core34.indexOf("  const model4 = await prisma.vehicleModel.upsert({");
const bmw430iIdx = core34.indexOf('  const bmw430i = await prisma.vehicle.upsert({');
const additionalVehiclesIdx = core34.indexOf("  const additionalVehicles = [");

if (model4Idx < 0 || bmw430iIdx < 0 || additionalVehiclesIdx < 0) {
  throw new Error("3/4 split markers missing in core34");
}

// 3-series needs: model/gen/year, engines b48/b58, transmissions, sources (not 430i),
// vehicles 330i/M340i/xDrives, their specs, additionalVehicles entries for xDrives only,
// audit for 3-series only.

// Simpler approach: keep ONE file `bmw-core-3-4.ts`? User wants respective.
// Write full core34 into BOTH and filter vehicles — too messy.

// Practical split:
// 1. bmw-3-series-core.ts = everything in core34 EXCEPT model4/generation4/modelYear4,
//    bmw430i vehicle, bmw430i sources usage in additionalVehicles 430i entry,
//    and 430i-only source upserts.
// 2. bmw-4-series-core.ts = 430i only with shared engines.

// For reliability: write three files from the FULL base catalogue function,
// each filtering which vehicles to seed — still runs shared setup. Wasteful but correct.
// Even better: keep base as internal, export thin series functions that call filtered logic.

console.log("core34 length", core34.length, "expansion", expansion.length);

// Final strategy for this script:
// Create series files that import and call portions:
// - Move entire base to stay as bmw-base-catalogue.ts temporarily
// - Create bmw-2-series.ts that ONLY has expansion filtered for 2-series
// - Patch existing modules to remove ALREADY_SEEDED skips (they'll no-op on complete)
// - seed.ts calls: 2 (new from expansion), base? 

// ABORT complex split — instead rename base into series-owned files by
// writing the COMPLETE base body into:
//   seedBmw2Series, seedBmw3Core, ... each file contains FULL base but
//   only audits/returns its series — STILL seeds everything = BAD duplicate work if all called.

// CORRECT approach: one orchestrated split of expansion array by vehicle slug prefix.

const thinSeed = `import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedBmw2Series } from "./seed/bmw-2-series";
import { seedBmw3Series } from "./seed/bmw-3-series";
import { seedBmw4Series } from "./seed/bmw-4-series";
import { seedBmw5Series } from "./seed/bmw-5-series";
import { seedBmw7Series } from "./seed/bmw-7-series";
import { seedBmwISeries } from "./seed/bmw-i-series";
import { seedBmwXSeries } from "./seed/bmw-x-series";
import { seedBmwZSeries } from "./seed/bmw-z-series";
import { seedBmwBaseCatalogue } from "./seed/bmw-base-catalogue";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString)
  throw new Error("Set DIRECT_URL or DATABASE_URL before running the seed script.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

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

  const seriesCtx = {
    prisma,
    importerId: importer.id,
    manufacturerId: manufacturer.id,
    pricingDate: new Date("2024-05-29T00:00:00.000Z"),
  };

  // Base catalogue owns vehicles formerly inlined in seed.ts (2/3/4/X/i cores).
  const base = await seedBmwBaseCatalogue(seriesCtx);
  console.log(
    \`BMW base catalogue: seeded \${base.seeded.length}, skipped \${base.skipped.length}\`,
  );

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
      \`BMW \${name} Series module: seeded \${result.seeded.length}, skipped \${result.skipped.length}\`,
    );
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
`;

// Don't write thin seed yet — first create real bmw-2-series and fold base into series.
console.log("Preparing proper series split instead of thin+base...");

// Rewrite plan: rename bmw-base-catalogue → keep as internal helper parts.
// Create bmw-2-series.ts as a stub that returns skipped until we extract.
// Actually write the thin seed NOW so seed.ts is slim, and rename base to
// be imported only — then create bmw-2-series that extracts 2-series from base
// by moving code.

fs.writeFileSync("prisma/seed.ts", thinSeed);
console.log("wrote thin prisma/seed.ts");

// Create bmw-2-series.ts stub that no-ops (vehicles live in base for now)
const twoSeriesStub = `/**
 * BMW 2 Series / M2 US MY 2025 seed module.
 * Core trims currently seeded via bmw-base-catalogue.ts (extracted from former seed.ts).
 * This module is the series entrypoint; expand here when adding new 2 Series trims.
 */
import type { SeedCtx } from "./bmw-shared";

export async function seedBmw2Series(
  _ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  return {
    seeded: [],
    skipped: [
      "2025-bmw-230i-coupe-us (owned by bmw-base-catalogue)",
      "2025-bmw-230i-xdrive-coupe-us (owned by bmw-base-catalogue)",
      "2025-bmw-m240i-coupe-us (owned by bmw-base-catalogue)",
      "2025-bmw-m240i-xdrive-coupe-us (owned by bmw-base-catalogue)",
      "2025-bmw-228-gran-coupe-us (owned by bmw-base-catalogue)",
      "2025-bmw-228-xdrive-gran-coupe-us (owned by bmw-base-catalogue)",
      "2025-bmw-m235-xdrive-gran-coupe-us (owned by bmw-base-catalogue)",
      "2025-bmw-m2-coupe-us (owned by bmw-base-catalogue)",
    ],
  };
}
`;
fs.writeFileSync("prisma/seed/bmw-2-series.ts", twoSeriesStub);
console.log("wrote stub bmw-2-series.ts — will replace with real extraction");
