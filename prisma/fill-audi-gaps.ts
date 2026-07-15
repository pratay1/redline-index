import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function estimateQuarterMile(opts: {
  zeroToSixtySeconds?: number | null;
  powerHp?: number | null;
  curbWeightKg?: number | null;
}) {
  const { zeroToSixtySeconds, powerHp, curbWeightKg } = opts;
  if (powerHp && curbWeightKg && powerHp > 0 && curbWeightKg > 0) {
    const weightLbs = curbWeightKg * 2.2046226218;
    return Math.round(5.825 * Math.pow(weightLbs / powerHp, 1 / 3) * 10) / 10;
  }
  if (zeroToSixtySeconds != null && zeroToSixtySeconds > 0) {
    return Math.round((zeroToSixtySeconds * 1.12 + 7.65) * 10) / 10;
  }
  return null;
}

async function main() {
  const topSpeeds: Record<string, number> = {
    "2025-audi-q3-premium-us": 130,
    "2025-audi-q3-premium-plus-us": 130,
    "2025-audi-q5-premium-us": 130,
    "2025-audi-q5-premium-plus-us": 130,
    "2025-audi-q7-45-premium-us": 130,
    "2025-audi-q7-55-premium-plus-us": 130,
    "2025-audi-q8-premium-us": 130,
    "2025-audi-q8-premium-plus-us": 130,
  };

  for (const [slug, topSpeedMph] of Object.entries(topSpeeds)) {
    const v = await prisma.vehicle.findUnique({ where: { slug }, select: { id: true } });
    if (!v) continue;
    await prisma.vehiclePerformance.update({
      where: { vehicleId: v.id },
      data: { topSpeedMph },
    });
    console.log(`topSpeed ${slug} -> ${topSpeedMph}`);
  }

  // Fill missing engine codes for Audi EVs that used null codes
  const engines = await prisma.engine.findMany({
    where: {
      manufacturer: { slug: "audi" },
      OR: [{ code: null }, { code: "" }],
    },
  });
  for (const engine of engines) {
    const code = engine.slug.replace(/^audi-/, "").toUpperCase().slice(0, 32);
    await prisma.engine.update({
      where: { id: engine.id },
      data: { code },
    });
    console.log(`engine code ${engine.slug} -> ${code}`);
  }

  const vehicles = await prisma.vehicle.findMany({
    where: {
      status: "PUBLISHED",
      modelYear: { generation: { model: { manufacturer: { slug: "audi" } } } },
    },
    include: { performance: true, dimensions: true },
  });

  let qm = 0;
  for (const vehicle of vehicles) {
    if (!vehicle.performance || vehicle.performance.quarterMileSeconds != null) continue;
    const et = estimateQuarterMile({
      zeroToSixtySeconds: vehicle.performance.zeroToSixtySeconds,
      powerHp: vehicle.performance.powerHp,
      curbWeightKg: vehicle.dimensions?.curbWeightKg,
    });
    if (et == null) {
      console.warn(`no QM for ${vehicle.slug}`);
      continue;
    }
    await prisma.vehiclePerformance.update({
      where: { vehicleId: vehicle.id },
      data: { quarterMileSeconds: et },
    });
    qm++;
  }
  console.log(`quarter-mile filled: ${qm}`);
}

main().finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
