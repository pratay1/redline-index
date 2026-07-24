import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function lbsToKg(lbs: number) {
  return Math.round(lbs / 2.2046226218);
}

/** Classic power-to-weight ET estimate when magazine times aren't stored. */
function estimateQuarterMile(opts: {
  zeroToSixtySeconds?: number | null;
  powerHp?: number | null;
  curbWeightKg?: number | null;
}) {
  const { zeroToSixtySeconds, powerHp, curbWeightKg } = opts;
  if (powerHp && curbWeightKg && powerHp > 0 && curbWeightKg > 0) {
    const weightLbs = curbWeightKg * 2.2046226218;
    const et = 5.825 * Math.pow(weightLbs / powerHp, 1 / 3);
    return Math.round(et * 10) / 10;
  }
  if (zeroToSixtySeconds != null && zeroToSixtySeconds > 0) {
    return Math.round((zeroToSixtySeconds * 1.12 + 7.65) * 10) / 10;
  }
  return null;
}

async function main() {
  // --- EV engine configuration (Layout value box) ---
  const evEngines = await prisma.engine.findMany({
    where: { fuelType: "ELECTRIC", OR: [{ configuration: null }, { configuration: "" }] },
    include: {
      vehicles: {
        where: { status: "PUBLISHED" },
        select: { drivetrain: true, name: true, slug: true },
        take: 3,
      },
    },
  });

  for (const engine of evEngines) {
    const sample = engine.vehicles[0];
    const name = `${engine.name} ${sample?.name ?? ""} ${sample?.slug ?? ""}`.toLowerCase();
    const awd =
      sample?.drivetrain === "AWD" ||
      sample?.drivetrain === "FOUR_WD" ||
      name.includes("xdrive") ||
      name.includes("4matic") ||
      name.includes("m60") ||
      name.includes("m70") ||
      name.includes("580") ||
      name.includes("500") ||
      name.includes("680") ||
      name.includes("53");
    const configuration = awd ? "Dual electric motors" : "Single electric motor";
    await prisma.engine.update({
      where: { id: engine.id },
      data: { configuration },
    });
    console.log(`engine ${engine.slug}: ${configuration}`);
  }

  // --- Targeted performance / dimensions / range fills ---
  const targeted: Array<{
    slug: string;
    performance?: {
      zeroToSixtySeconds?: number;
      topSpeedMph?: number;
    };
    dimensions?: { curbWeightKg?: number };
    fuelEconomy?: { electricRangeMiles?: number };
  }> = [
    {
      slug: "2023-mercedes-metris-cargo-126-us",
      performance: { zeroToSixtySeconds: 7.9, topSpeedMph: 118 },
    },
    {
      slug: "2023-mercedes-metris-passenger-us",
      performance: { zeroToSixtySeconds: 7.9, topSpeedMph: 118 },
    },
    // CLA / GLA top speeds (electronically limited; common published figures)
    { slug: "2025-mercedes-cla-250-us", performance: { topSpeedMph: 130 } },
    { slug: "2025-mercedes-cla-250-4matic-us", performance: { topSpeedMph: 130 } },
    { slug: "2025-mercedes-amg-cla-35-us", performance: { topSpeedMph: 155 } },
    { slug: "2025-mercedes-amg-cla-45-s-us", performance: { topSpeedMph: 168 } },
    { slug: "2025-mercedes-gla-250-us", performance: { topSpeedMph: 130 } },
    { slug: "2025-mercedes-amg-gla-35-us", performance: { topSpeedMph: 155 } },
    // Curb weights (kg) from published curb weight lbs
    {
      slug: "2025-bmw-i7-xdrive60-us",
      dimensions: { curbWeightKg: lbsToKg(5975) },
    },
    {
      slug: "2026-bmw-i4-m60-us",
      dimensions: { curbWeightKg: lbsToKg(5029) },
    },
    {
      slug: "2025-mercedes-amg-gle-53-4matic-plus-us",
      dimensions: { curbWeightKg: lbsToKg(5280) },
    },
    {
      slug: "2025-mercedes-amg-gle-63-s-4matic-plus-us",
      dimensions: { curbWeightKg: lbsToKg(5567) },
    },
    {
      slug: "2025-mercedes-amg-gls-63-4matic-plus-us",
      dimensions: { curbWeightKg: lbsToKg(6019) },
    },
    {
      slug: "2025-mercedes-glc-350e-us",
      dimensions: { curbWeightKg: lbsToKg(5027) },
    },
    {
      slug: "2025-mercedes-gle-450-4matic-us",
      dimensions: { curbWeightKg: lbsToKg(5060) },
    },
    {
      slug: "2025-mercedes-gle-580-4matic-us",
      dimensions: { curbWeightKg: lbsToKg(5368) },
    },
    {
      slug: "2025-mercedes-gls-450-4matic-us",
      dimensions: { curbWeightKg: lbsToKg(5589) },
    },
    {
      slug: "2025-mercedes-gls-580-4matic-us",
      dimensions: { curbWeightKg: lbsToKg(5875) },
    },
    {
      slug: "2025-mercedes-maybach-gls-600-4matic-us",
      dimensions: { curbWeightKg: lbsToKg(6271) },
    },
    {
      slug: "2025-mercedes-amg-sl-63-s-e-performance-us",
      fuelEconomy: { electricRangeMiles: 11 },
    },
  ];

  for (const row of targeted) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { slug: row.slug },
      select: { id: true },
    });
    if (!vehicle) {
      console.warn(`missing vehicle ${row.slug}`);
      continue;
    }
    if (row.performance) {
      await prisma.vehiclePerformance.upsert({
        where: { vehicleId: vehicle.id },
        create: { vehicleId: vehicle.id, ...row.performance },
        update: row.performance,
      });
    }
    if (row.dimensions) {
      await prisma.vehicleDimensions.upsert({
        where: { vehicleId: vehicle.id },
        create: { vehicleId: vehicle.id, ...row.dimensions },
        update: row.dimensions,
      });
    }
    if (row.fuelEconomy) {
      await prisma.vehicleFuelEconomy.upsert({
        where: { vehicleId: vehicle.id },
        create: { vehicleId: vehicle.id, ...row.fuelEconomy },
        update: row.fuelEconomy,
      });
    }
    console.log(`updated ${row.slug}`);
  }

  // --- Quarter-mile for every published vehicle still missing it ---
  const vehicles = await prisma.vehicle.findMany({
    where: { status: "PUBLISHED" },
    include: { performance: true, dimensions: true },
  });

  let qmFilled = 0;
  for (const vehicle of vehicles) {
    if (!vehicle.performance) continue;
    if (vehicle.performance.quarterMileSeconds != null) continue;
    const et = estimateQuarterMile({
      zeroToSixtySeconds: vehicle.performance.zeroToSixtySeconds,
      powerHp: vehicle.performance.powerHp,
      curbWeightKg: vehicle.dimensions?.curbWeightKg,
    });
    if (et == null) {
      console.warn(`could not estimate QM for ${vehicle.slug}`);
      continue;
    }
    await prisma.vehiclePerformance.update({
      where: { vehicleId: vehicle.id },
      data: { quarterMileSeconds: et },
    });
    qmFilled++;
  }
  console.log(`quarter-mile filled: ${qmFilled}`);
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
