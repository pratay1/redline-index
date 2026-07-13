import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString)
  throw new Error("Set DIRECT_URL or DATABASE_URL before running the seed script.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const sourceData = {
  slug: "bmw-2025-3-series-press-release",
  title: "The new 2025 BMW 3 Series.",
  publisher: "BMW Group",
  url: "https://www.press.bmwgroup.com/usa/article/detail/T0442407EN_US/the-new-2025-bmw-3-series",
  type: "PRESS_RELEASE" as const,
  publishedAt: new Date("2024-05-29T00:00:00.000Z"),
};

const bmw330iFuelEconomySourceData = {
  slug: "epa-2025-bmw-330i-sedan",
  title: "2025 BMW 330i Sedan fuel economy data",
  publisher: "U.S. Department of Energy and U.S. Environmental Protection Agency",
  url: "https://www.fueleconomy.gov/ws/rest/vehicle/48163",
  type: "GOVERNMENT" as const,
};

const bmwM340iFuelEconomySourceData = {
  slug: "epa-2025-bmw-m340i-sedan",
  title: "2025 BMW M340i Sedan fuel economy data",
  publisher: "U.S. Department of Energy and U.S. Environmental Protection Agency",
  url: "https://www.fueleconomy.gov/ws/rest/vehicle/48165",
  type: "GOVERNMENT" as const,
};

const bmw330iImageSource = {
  slug: "bmw-2025-330i-exterior-image-p90549617",
  title: "The new BMW 330i Sedan – Exterior (05/2024)",
  publisher: "BMW Group",
  url: "https://www.press.bmwgroup.com/usa/photo/detail/P90549617/The-new-BMW-330i-Sedan-%E2%80%93-Exterior-05-2024",
  type: "MANUFACTURER" as const,
  publishedAt: new Date("2024-05-23T00:00:00.000Z"),
};

const bmwM340iImageSource = {
  slug: "bmw-m340i-exterior-image-p90479559",
  title: "The new BMW M340i xDrive – Exterior (09/2022)",
  publisher: "BMW Group",
  url: "https://www.press.bmwgroup.com/usa/photo/detail/P90479559/The-new-BMW-M340i-xDrive-09-2022",
  type: "MANUFACTURER" as const,
  publishedAt: new Date("2022-09-20T00:00:00.000Z"),
};

async function upsertCitation(
  sourceId: string,
  entityType: string,
  entityId: string,
  fieldName: string,
  locator: string,
) {
  await prisma.sourceCitation.upsert({
    where: {
      sourceId_entityType_entityId_fieldName: {
        sourceId,
        entityType,
        entityId,
        fieldName,
      },
    },
    create: { sourceId, entityType, entityId, fieldName, locator },
    update: { locator },
  });
}

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
  const model = await prisma.vehicleModel.upsert({
    where: { slug: "bmw-3-series" },
    create: { manufacturerId: manufacturer.id, name: "3 Series", slug: "bmw-3-series" },
    update: { manufacturerId: manufacturer.id, name: "3 Series" },
  });
  const generation = await prisma.vehicleGeneration.upsert({
    where: { modelId_code: { modelId: model.id, code: "G20" } },
    create: { modelId: model.id, code: "G20", displayName: "Seventh generation (G20)" },
    update: { displayName: "Seventh generation (G20)" },
  });
  const modelYear = await prisma.modelYear.upsert({
    where: { generationId_year: { generationId: generation.id, year: 2025 } },
    create: { generationId: generation.id, year: 2025 },
    update: {},
  });
  const b48 = await prisma.engine.upsert({
    where: { slug: "bmw-b48b20o2" },
    create: {
      manufacturerId: manufacturer.id,
      slug: "bmw-b48b20o2",
      name: "B48B20O2",
      code: "B48B20O2",
      fuelType: "PETROL",
      displacementCc: 1998,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Twin-scroll turbocharger",
      electrification: "48V mild hybrid",
    },
    update: {
      manufacturerId: manufacturer.id,
      name: "B48B20O2",
      code: "B48B20O2",
      fuelType: "PETROL",
      displacementCc: 1998,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Twin-scroll turbocharger",
      electrification: "48V mild hybrid",
    },
  });
  const b58 = await prisma.engine.upsert({
    where: { slug: "bmw-b58b30m2" },
    create: {
      manufacturerId: manufacturer.id,
      slug: "bmw-b58b30m2",
      name: "B58B30M2",
      code: "B58B30M2",
      fuelType: "PETROL",
      displacementCc: 2998,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Twin-scroll turbocharger",
      electrification: "48V mild hybrid",
    },
    update: {
      manufacturerId: manufacturer.id,
      name: "B58B30M2",
      code: "B58B30M2",
      fuelType: "PETROL",
      displacementCc: 2998,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Twin-scroll turbocharger",
      electrification: "48V mild hybrid",
    },
  });
  const steptronic = await prisma.transmission.upsert({
    where: { slug: "bmw-8-speed-steptronic" },
    create: {
      slug: "bmw-8-speed-steptronic",
      name: "8-speed Steptronic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    update: { name: "8-speed Steptronic", type: "AUTOMATIC", gearCount: 8 },
  });
  const mSteptronic = await prisma.transmission.upsert({
    where: { slug: "bmw-8-speed-m-steptronic-drivelogic" },
    create: {
      slug: "bmw-8-speed-m-steptronic-drivelogic",
      name: "8-speed M Steptronic with Drivelogic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    update: {
      name: "8-speed M Steptronic with Drivelogic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
  });
  const source = await prisma.source.upsert({
    where: { slug: sourceData.slug },
    create: sourceData,
    update: sourceData,
  });
  const bmw330iFuelEconomySource = await prisma.source.upsert({
    where: { slug: bmw330iFuelEconomySourceData.slug },
    create: bmw330iFuelEconomySourceData,
    update: bmw330iFuelEconomySourceData,
  });
  const bmwM340iFuelEconomySource = await prisma.source.upsert({
    where: { slug: bmwM340iFuelEconomySourceData.slug },
    create: bmwM340iFuelEconomySourceData,
    update: bmwM340iFuelEconomySourceData,
  });
  const bmw330iImageSourceRecord = await prisma.source.upsert({
    where: { slug: bmw330iImageSource.slug },
    create: bmw330iImageSource,
    update: bmw330iImageSource,
  });
  const bmwM340iImageSourceRecord = await prisma.source.upsert({
    where: { slug: bmwM340iImageSource.slug },
    create: bmwM340iImageSource,
    update: bmwM340iImageSource,
  });
  const pricingDate = new Date("2024-05-29T00:00:00.000Z");

  const bmw330i = await prisma.vehicle.upsert({
    where: { slug: "2025-bmw-330i-us" },
    create: {
      slug: "2025-bmw-330i-us",
      modelYearId: modelYear.id,
      name: "330i",
      market: "US",
      bodyStyle: "SEDAN",
      drivetrain: "RWD",
      engineId: b48.id,
      transmissionId: steptronic.id,
      status: "PUBLISHED",
      publishedAt: pricingDate,
      createdById: importer.id,
    },
    update: {
      modelYearId: modelYear.id,
      name: "330i",
      market: "US",
      bodyStyle: "SEDAN",
      drivetrain: "RWD",
      engineId: b48.id,
      transmissionId: steptronic.id,
      status: "PUBLISHED",
      publishedAt: pricingDate,
      createdById: importer.id,
    },
  });
  const bmwM340i = await prisma.vehicle.upsert({
    where: { slug: "2025-bmw-m340i-us" },
    create: {
      slug: "2025-bmw-m340i-us",
      modelYearId: modelYear.id,
      name: "M340i",
      market: "US",
      bodyStyle: "SEDAN",
      drivetrain: "RWD",
      engineId: b58.id,
      transmissionId: mSteptronic.id,
      status: "PUBLISHED",
      publishedAt: pricingDate,
      createdById: importer.id,
    },
    update: {
      modelYearId: modelYear.id,
      name: "M340i",
      market: "US",
      bodyStyle: "SEDAN",
      drivetrain: "RWD",
      engineId: b58.id,
      transmissionId: mSteptronic.id,
      status: "PUBLISHED",
      publishedAt: pricingDate,
      createdById: importer.id,
    },
  });

  const [
    dimensions330i,
    performance330i,
    price330i,
    dimensionsM340i,
    performanceM340i,
    priceM340i,
  ] = await Promise.all([
    prisma.vehicleDimensions.upsert({
      where: { vehicleId: bmw330i.id },
      create: {
        vehicleId: bmw330i.id,
        lengthIn: 185.9,
        widthIn: 71.9,
        heightIn: 56.8,
        wheelbaseIn: 112.5,
        frontTrackIn: 62.3,
        rearTrackIn: 61.7,
        groundClearanceIn: 5.7,
        curbWeightKg: 1653,
        grossVehicleWeightKg: 2140,
        cargoVolumeLiters: 479,
        seatingCapacity: 5,
      },
      update: {
        lengthIn: 185.9,
        widthIn: 71.9,
        heightIn: 56.8,
        wheelbaseIn: 112.5,
        frontTrackIn: 62.3,
        rearTrackIn: 61.7,
        groundClearanceIn: 5.7,
        curbWeightKg: 1653,
        grossVehicleWeightKg: 2140,
        cargoVolumeLiters: 479,
        seatingCapacity: 5,
      },
    }),
    prisma.vehiclePerformance.upsert({
      where: { vehicleId: bmw330i.id },
      create: {
        vehicleId: bmw330i.id,
        powerHp: 255,
        torqueLbFt: 295,
        zeroToSixtySeconds: 5.6,
        topSpeedMph: 130,
      },
      update: {
        powerHp: 255,
        torqueLbFt: 295,
        zeroToSixtySeconds: 5.6,
        topSpeedMph: 130,
      },
    }),
    prisma.vehiclePrice.upsert({
      where: {
        vehicleId_market_type_effectiveAt: {
          vehicleId: bmw330i.id,
          market: "US",
          type: "BASE_MSRP",
          effectiveAt: pricingDate,
        },
      },
      create: {
        vehicleId: bmw330i.id,
        market: "US",
        type: "BASE_MSRP",
        amountCents: 4550000,
        effectiveAt: pricingDate,
      },
      update: { amountCents: 4550000 },
    }),
    prisma.vehicleDimensions.upsert({
      where: { vehicleId: bmwM340i.id },
      create: {
        vehicleId: bmwM340i.id,
        lengthIn: 185.9,
        widthIn: 71.9,
        heightIn: 56.4,
        wheelbaseIn: 112.5,
        frontTrackIn: 62.3,
        rearTrackIn: 61.7,
        groundClearanceIn: 5.3,
        curbWeightKg: 1767,
        grossVehicleWeightKg: 2260,
        cargoVolumeLiters: 479,
        seatingCapacity: 5,
      },
      update: {
        lengthIn: 185.9,
        widthIn: 71.9,
        heightIn: 56.4,
        wheelbaseIn: 112.5,
        frontTrackIn: 62.3,
        rearTrackIn: 61.7,
        groundClearanceIn: 5.3,
        curbWeightKg: 1767,
        grossVehicleWeightKg: 2260,
        cargoVolumeLiters: 479,
        seatingCapacity: 5,
      },
    }),
    prisma.vehiclePerformance.upsert({
      where: { vehicleId: bmwM340i.id },
      create: {
        vehicleId: bmwM340i.id,
        powerHp: 386,
        torqueLbFt: 398,
        zeroToSixtySeconds: 4.4,
        topSpeedMph: 130,
      },
      update: {
        powerHp: 386,
        torqueLbFt: 398,
        zeroToSixtySeconds: 4.4,
        topSpeedMph: 130,
      },
    }),
    prisma.vehiclePrice.upsert({
      where: {
        vehicleId_market_type_effectiveAt: {
          vehicleId: bmwM340i.id,
          market: "US",
          type: "BASE_MSRP",
          effectiveAt: pricingDate,
        },
      },
      create: {
        vehicleId: bmwM340i.id,
        market: "US",
        type: "BASE_MSRP",
        amountCents: 5960000,
        effectiveAt: pricingDate,
      },
      update: { amountCents: 5960000 },
    }),
  ]);

  const [fuelEconomy330i, fuelEconomyM340i] = await Promise.all([
    prisma.vehicleFuelEconomy.upsert({
      where: { vehicleId: bmw330i.id },
      create: { vehicleId: bmw330i.id, cityMpg: 28, highwayMpg: 35, combinedMpg: 31 },
      update: { cityMpg: 28, highwayMpg: 35, combinedMpg: 31 },
    }),
    prisma.vehicleFuelEconomy.upsert({
      where: { vehicleId: bmwM340i.id },
      create: { vehicleId: bmwM340i.id, cityMpg: 27, highwayMpg: 33, combinedMpg: 29 },
      update: { cityMpg: 27, highwayMpg: 33, combinedMpg: 29 },
    }),
  ]);

  await prisma.vehicleImage.upsert({
    where: { vehicleId_position: { vehicleId: bmw330i.id, position: 0 } },
    create: {
      vehicleId: bmw330i.id,
      sourceId: bmw330iImageSourceRecord.id,
      url: "https://mediapool.bmwgroup.com/cache/P9/202405/P90549617/P90549617-the-new-bmw-330i-sedan-exterior-05-2024-2250px.jpg",
      alt: "2025 BMW 330i Sedan exterior",
      credit: "BMW Group",
      position: 0,
    },
    update: {
      sourceId: bmw330iImageSourceRecord.id,
      url: "https://mediapool.bmwgroup.com/cache/P9/202405/P90549617/P90549617-the-new-bmw-330i-sedan-exterior-05-2024-2250px.jpg",
      alt: "2025 BMW 330i Sedan exterior",
      credit: "BMW Group",
    },
  });

  await prisma.vehicleImage.upsert({
    where: { vehicleId_position: { vehicleId: bmwM340i.id, position: 0 } },
    create: {
      vehicleId: bmwM340i.id,
      sourceId: bmwM340iImageSourceRecord.id,
      url: "https://mediapool.bmwgroup.com/cache/P9/202209/P90479559/P90479559-the-new-bmw-m340i-xdrive-09-2022-2250px.jpg",
      alt: "2025 BMW M340i Sedan exterior",
      credit: "BMW Group",
      position: 0,
    },
    update: {
      sourceId: bmwM340iImageSourceRecord.id,
      url: "https://mediapool.bmwgroup.com/cache/P9/202209/P90479559/P90479559-the-new-bmw-m340i-xdrive-09-2022-2250px.jpg",
      alt: "2025 BMW M340i Sedan exterior",
      credit: "BMW Group",
    },
  });

  await Promise.all([
    upsertCitation(
      source.id,
      "ModelYear",
      modelYear.id,
      "year",
      "2025 model announcement",
    ),
    upsertCitation(
      source.id,
      "Engine",
      b48.id,
      "specifications",
      "Specifications: 330i",
    ),
    upsertCitation(
      source.id,
      "Engine",
      b58.id,
      "specifications",
      "Specifications: M340i",
    ),
    upsertCitation(
      source.id,
      "VehicleDimensions",
      dimensions330i.id,
      "specifications",
      "Specifications: 330i",
    ),
    upsertCitation(
      source.id,
      "VehiclePerformance",
      performance330i.id,
      "specifications",
      "Specifications: 330i",
    ),
    upsertCitation(source.id, "VehiclePrice", price330i.id, "amountCents", "Base MSRP"),
    upsertCitation(
      source.id,
      "VehicleDimensions",
      dimensionsM340i.id,
      "specifications",
      "Specifications: M340i",
    ),
    upsertCitation(
      source.id,
      "VehiclePerformance",
      performanceM340i.id,
      "specifications",
      "Specifications: M340i",
    ),
    upsertCitation(
      source.id,
      "VehiclePrice",
      priceM340i.id,
      "amountCents",
      "Base MSRP",
    ),
    upsertCitation(
      bmw330iFuelEconomySource.id,
      "VehicleFuelEconomy",
      fuelEconomy330i.id,
      "cityMpg",
      "EPA city estimate",
    ),
    upsertCitation(
      bmw330iFuelEconomySource.id,
      "VehicleFuelEconomy",
      fuelEconomy330i.id,
      "highwayMpg",
      "EPA highway estimate",
    ),
    upsertCitation(
      bmw330iFuelEconomySource.id,
      "VehicleFuelEconomy",
      fuelEconomy330i.id,
      "combinedMpg",
      "EPA combined estimate",
    ),
    upsertCitation(
      bmwM340iFuelEconomySource.id,
      "VehicleFuelEconomy",
      fuelEconomyM340i.id,
      "cityMpg",
      "EPA city estimate",
    ),
    upsertCitation(
      bmwM340iFuelEconomySource.id,
      "VehicleFuelEconomy",
      fuelEconomyM340i.id,
      "highwayMpg",
      "EPA highway estimate",
    ),
    upsertCitation(
      bmwM340iFuelEconomySource.id,
      "VehicleFuelEconomy",
      fuelEconomyM340i.id,
      "combinedMpg",
      "EPA combined estimate",
    ),
  ]);

  for (const vehicle of [bmw330i, bmwM340i]) {
    const existingAuditLog = await prisma.auditLog.findFirst({
      where: {
        actorId: importer.id,
        action: "vehicle.seeded",
        entityType: "Vehicle",
        entityId: vehicle.id,
      },
      select: { id: true },
    });
    if (!existingAuditLog)
      await prisma.auditLog.create({
        data: {
          actorId: importer.id,
          action: "vehicle.seeded",
          entityType: "Vehicle",
          entityId: vehicle.id,
          metadata: { source: "prisma/seed.ts", vehicleSlug: vehicle.slug },
        },
      });
  }

  console.log(
    "Seeded BMW 3 Series (G20), model year 2025, with complete available source data.",
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
