import fs from "fs";

const seed = fs.readFileSync("prisma/seed.ts", "utf8");

const helpersStart = seed.indexOf("const sourceData = {");
const mainStart = seed.indexOf("async function main() {");
const seriesCtxStart = seed.indexOf("  const seriesCtx = {");

if (helpersStart < 0 || mainStart < 0 || seriesCtxStart < 0) {
  throw new Error("markers not found");
}

const helpers = seed.slice(helpersStart, mainStart);
let body = seed.slice(mainStart + "async function main() {".length, seriesCtxStart);

body = body
  .replace(/^\n  const importer = await prisma\.user\.upsert\(\{[\s\S]*?\n  \}\);\n/, "\n")
  .replace(
    /  const manufacturer = await prisma\.manufacturer\.upsert\(\{[\s\S]*?\n  \}\);\n/,
    "  const manufacturer = { id: manufacturerId };\n  const importer = { id: importerId };\n",
  )
  .replace(
    /  const pricingDate = new Date\("2024-05-29T00:00:00\.000Z"\);\n/,
    '  const pricingDate = ctxPricingDate ?? new Date("2024-05-29T00:00:00.000Z");\n',
  );

// Keep local upsertCitation with prisma from closure — leave helpers as-is but
// they need to be inside the function OR we redefine upsertCitation to use outer prisma.
// Put helpers inside the exported function after prisma binding.

const file = `/**
 * Former inline catalogue from prisma/seed.ts (pre-series-module vehicles).
 * Owns 3/4 core, full 2 Series, X3/X5 core, and i4 eDrive40.
 */
import type { SeedCtx } from "./bmw-shared";

export async function seedBmwBaseCatalogue(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const prisma = ctx.prisma;
  const importerId = ctx.importerId;
  const manufacturerId = ctx.manufacturerId;
  const ctxPricingDate = ctx.pricingDate;

${helpers}

${body}
  return {
    seeded: [
      "2025-bmw-330i-us",
      "2025-bmw-m340i-us",
      "2025-bmw-330i-xdrive-us",
      "2025-bmw-m340i-xdrive-us",
      "2025-bmw-430i-coupe-us",
      "2025-bmw-x3-30-xdrive-us",
      "2025-bmw-x3-m50-xdrive-us",
      "2025-bmw-x5-xdrive40i-us",
      "2025-bmw-i4-edrive40-us",
      "2025-bmw-230i-coupe-us",
      "2025-bmw-m240i-xdrive-coupe-us",
      "2025-bmw-228-xdrive-gran-coupe-us",
      "2025-bmw-228-gran-coupe-us",
      "2025-bmw-m235-xdrive-gran-coupe-us",
      "2025-bmw-230i-xdrive-coupe-us",
      "2025-bmw-m240i-coupe-us",
      "2025-bmw-m2-coupe-us",
    ],
    skipped: [],
  };
}
`;

fs.writeFileSync("prisma/seed/bmw-base-catalogue.ts", file);
console.log("wrote prisma/seed/bmw-base-catalogue.ts", file.length, "chars");
