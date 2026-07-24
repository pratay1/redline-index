import "dotenv/config";
import { stat } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const catalogImagePattern =
  /^\/catalog-images\/[a-z0-9][a-z0-9._-]*\.(?:avif|gif|jpe?g|png|svg|webp)$/i;

async function fileExists(filePath: string) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function citationCount(targets: { entityType: string; entityId: string }[]) {
  if (!targets.length) return 0;
  return prisma.sourceCitation.count({ where: { OR: targets } });
}

async function main() {
  const vehicles = await prisma.vehicle.findMany({
    select: {
      id: true,
      slug: true,
      status: true,
      modelYearId: true,
      engineId: true,
      transmissionId: true,
      dimensions: { select: { id: true } },
      performance: { select: { id: true } },
      fuelEconomy: { select: { id: true } },
      prices: { select: { id: true } },
      images: { select: { id: true, sourceId: true, url: true } },
    },
    orderBy: { slug: "asc" },
  });

  const publishedVehicles = vehicles.filter((vehicle) => vehicle.status === "PUBLISHED");
  const missingImages: string[] = [];
  const missingImageSources: string[] = [];
  const missingImageCitations: string[] = [];
  const missingLocalImageFiles: { slug: string; url: string }[] = [];
  const missingSpecCitations: string[] = [];
  const missingImagesByStatus: Record<string, string[]> = {};

  for (const vehicle of vehicles) {
    if (!vehicle.images.length) {
      missingImages.push(vehicle.slug);
      const statusGaps = missingImagesByStatus[vehicle.status] ?? [];
      statusGaps.push(vehicle.slug);
      missingImagesByStatus[vehicle.status] = statusGaps;
    }

    if (
      vehicle.status === "PUBLISHED" &&
      (!vehicle.images.length || vehicle.images.some((image) => !image.sourceId))
    ) {
      missingImageSources.push(vehicle.slug);
    }

    if (vehicle.status === "PUBLISHED") {
      for (const image of vehicle.images) {
        const isLocalCatalogPath = catalogImagePattern.test(image.url);
        const hasLocalFile =
          isLocalCatalogPath &&
          (await fileExists(path.join(process.cwd(), "public", image.url)));
        if (!hasLocalFile) {
          missingLocalImageFiles.push({ slug: vehicle.slug, url: image.url });
          break;
        }
      }
    }

    const imageCitationTargets = vehicle.images.map((image) => ({
      entityType: "VehicleImage",
      entityId: image.id,
    }));
    if (
      vehicle.status === "PUBLISHED" &&
      vehicle.images.length &&
      (await citationCount(imageCitationTargets)) === 0
    ) {
      missingImageCitations.push(vehicle.slug);
    }

    const specCitationTargets = [
      { entityType: "Vehicle", entityId: vehicle.id },
      { entityType: "ModelYear", entityId: vehicle.modelYearId },
      { entityType: "Engine", entityId: vehicle.engineId },
      { entityType: "Transmission", entityId: vehicle.transmissionId },
      ...(vehicle.dimensions
        ? [{ entityType: "VehicleDimensions", entityId: vehicle.dimensions.id }]
        : []),
      ...(vehicle.performance
        ? [{ entityType: "VehiclePerformance", entityId: vehicle.performance.id }]
        : []),
      ...(vehicle.fuelEconomy
        ? [{ entityType: "VehicleFuelEconomy", entityId: vehicle.fuelEconomy.id }]
        : []),
      ...vehicle.prices.map((price) => ({
        entityType: "VehiclePrice",
        entityId: price.id,
      })),
    ];

    if (
      vehicle.status === "PUBLISHED" &&
      (await citationCount(specCitationTargets)) === 0
    ) {
      missingSpecCitations.push(vehicle.slug);
    }
  }

  console.log(
    JSON.stringify(
      {
        totalVehicles: vehicles.length,
        totalPublishedVehicles: publishedVehicles.length,
        missingImages,
        missingImagesByStatus,
        missingImageSources,
        missingImageCitations,
        missingLocalImageFiles,
        missingSpecCitations,
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
