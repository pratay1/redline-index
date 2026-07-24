import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

/** Fields shown as value boxes on the vehicle detail page. */
const UI_FIELDS = {
  engine: ["code", "configuration", "cylinderCount", "displacementCc", "induction", "electrification"] as const,
  transmission: ["gearCount"] as const,
  performance: [
    "powerHp",
    "torqueLbFt",
    "zeroToSixtySeconds",
    "quarterMileSeconds",
    "topSpeedMph",
  ] as const,
  dimensions: [
    "lengthIn",
    "widthIn",
    "heightIn",
    "wheelbaseIn",
    "curbWeightKg",
    "seatingCapacity",
  ] as const,
  fuelEconomy: [
    "cityMpg",
    "highwayMpg",
    "combinedMpg",
    "electricRangeMiles",
  ] as const,
};

async function main() {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: "PUBLISHED" },
    include: {
      modelYear: {
        include: {
          generation: {
            include: { model: { include: { manufacturer: true } } },
          },
        },
      },
      engine: true,
      transmission: true,
      dimensions: true,
      performance: true,
      fuelEconomy: true,
      prices: { where: { type: "BASE_MSRP" } },
      images: true,
    },
    orderBy: { slug: "asc" },
  });

  type Gap = {
    id: string;
    slug: string;
    label: string;
    year: number;
    manufacturer: string;
    model: string;
    name: string;
    fuelType: string;
    misses: string[];
  };

  const gaps: Gap[] = [];
  const freq: Record<string, number> = {};

  for (const v of vehicles) {
    const manufacturer = v.modelYear.generation.model.manufacturer.name;
    const model = v.modelYear.generation.model.name;
    const label = `${v.modelYear.year} ${manufacturer} ${model} ${v.name}`;
    const misses: string[] = [];

    for (const key of UI_FIELDS.engine) {
      const val = v.engine[key];
      // electrification only expected for hybrid/electric/PHEV
      if (key === "electrification") {
        const electricish = ["ELECTRIC", "HYBRID", "PLUG_IN_HYBRID", "HYDROGEN"].includes(
          v.engine.fuelType,
        );
        if (electricish && (val == null || val === "")) misses.push(`engine.${key}`);
        continue;
      }
      // induction N/A for pure EV
      if (key === "induction" && v.engine.fuelType === "ELECTRIC") continue;
      if (key === "displacementCc" && v.engine.fuelType === "ELECTRIC") continue;
      if (key === "cylinderCount" && v.engine.fuelType === "ELECTRIC") continue;
      if (key === "configuration" && v.engine.fuelType === "ELECTRIC") {
        if (val == null || val === "") misses.push(`engine.${key}`);
        continue;
      }
      if (val == null || val === "") misses.push(`engine.${key}`);
    }

    for (const key of UI_FIELDS.transmission) {
      if (v.transmission[key] == null) misses.push(`transmission.${key}`);
    }

    if (!v.performance) misses.push("performance:ROW");
    else {
      for (const key of UI_FIELDS.performance) {
        if (v.performance[key] == null) misses.push(`performance.${key}`);
      }
    }

    if (!v.dimensions) misses.push("dimensions:ROW");
    else {
      for (const key of UI_FIELDS.dimensions) {
        if (v.dimensions[key] == null) misses.push(`dimensions.${key}`);
      }
    }

    if (!v.fuelEconomy) misses.push("fuelEconomy:ROW");
    else {
      for (const key of UI_FIELDS.fuelEconomy) {
        if (key === "electricRangeMiles") {
          const needsRange = ["ELECTRIC", "PLUG_IN_HYBRID"].includes(v.engine.fuelType);
          if (needsRange && v.fuelEconomy[key] == null) misses.push(`fuelEconomy.${key}`);
          continue;
        }
        // ICE/hybrid should have mpg; pure EV may use MPGe stored in same fields or be empty
        if (v.engine.fuelType === "ELECTRIC") {
          if (v.fuelEconomy[key] == null) misses.push(`fuelEconomy.${key}`);
          continue;
        }
        if (v.fuelEconomy[key] == null) misses.push(`fuelEconomy.${key}`);
      }
    }

    if (!v.prices.length) misses.push("price.BASE_MSRP");
    if (!v.images.length) misses.push("image");

    if (misses.length) {
      gaps.push({
        id: v.id,
        slug: v.slug,
        label,
        year: v.modelYear.year,
        manufacturer,
        model,
        name: v.name,
        fuelType: v.engine.fuelType,
        misses,
      });
      for (const m of misses) freq[m] = (freq[m] ?? 0) + 1;
    }
  }

  console.log(JSON.stringify({ total: vehicles.length, withGaps: gaps.length, freq, gaps }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
