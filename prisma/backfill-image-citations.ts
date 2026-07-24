import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const images = await prisma.vehicleImage.findMany({
    where: {
      sourceId: { not: null },
      source: { isNot: null },
      vehicle: { status: "PUBLISHED" },
    },
    include: {
      source: true,
      vehicle: { select: { slug: true } },
    },
    orderBy: [{ vehicle: { slug: "asc" } }, { position: "asc" }],
  });

  const backfilled: string[] = [];

  for (const image of images) {
    if (!image.sourceId || !image.source) continue;

    const existing = await prisma.sourceCitation.findFirst({
      where: {
        entityType: "VehicleImage",
        entityId: image.id,
        fieldName: "url",
      },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.sourceCitation.create({
      data: {
        sourceId: image.sourceId,
        entityType: "VehicleImage",
        entityId: image.id,
        fieldName: "url",
        locator: "Exterior image source",
        note: image.credit ?? image.source.publisher,
      },
    });
    backfilled.push(image.vehicle.slug);
  }

  console.log(
    JSON.stringify(
      {
        checkedImages: images.length,
        backfilledImageCitations: backfilled.length,
        backfilled,
      },
      null,
      2,
    ),
  );
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
