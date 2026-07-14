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

const bmw430iSourceData = {
  slug: "bmw-2025-4-series-coupe-press-release",
  title: "The new 2025 BMW 4 Series Coupe and Convertible.",
  publisher: "BMW Group",
  url: "https://www.press.bmwgroup.com/usa/article/detail/T0439311EN_US/the-new-2025-bmw-4-series-coupe-and-convertible",
  type: "PRESS_RELEASE" as const,
  publishedAt: new Date("2024-01-31T00:00:00.000Z"),
};

const bmw430iImageSource = {
  slug: "bmw-430i-coupe-image-p90390664",
  title: "BMW 430i Coupé, Mineral White Metallic (06/2020)",
  publisher: "BMW Group",
  url: "https://www.press.bmwgroup.com/usa/photo/detail/P90390664/BMW-430i-Coup%C3%A9-Mineral-white-metallic-Rim-19-Y-Spoke-783-06-2020",
  type: "MANUFACTURER" as const,
  publishedAt: new Date("2020-06-02T00:00:00.000Z"),
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
  const model4 = await prisma.vehicleModel.upsert({
    where: { slug: "bmw-4-series" },
    create: { manufacturerId: manufacturer.id, name: "4 Series", slug: "bmw-4-series" },
    update: { manufacturerId: manufacturer.id, name: "4 Series" },
  });
  const generation4 = await prisma.vehicleGeneration.upsert({
    where: { modelId_code: { modelId: model4.id, code: "G22" } },
    create: { modelId: model4.id, code: "G22", displayName: "Second generation (G22)" },
    update: { displayName: "Second generation (G22)" },
  });
  const modelYear4 = await prisma.modelYear.upsert({
    where: { generationId_year: { generationId: generation4.id, year: 2025 } },
    create: { generationId: generation4.id, year: 2025 },
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
  const bmw430iSource = await prisma.source.upsert({
    where: { slug: bmw430iSourceData.slug },
    create: bmw430iSourceData,
    update: bmw430iSourceData,
  });
  const bmw430iImageSourceRecord = await prisma.source.upsert({
    where: { slug: bmw430iImageSource.slug },
    create: bmw430iImageSource,
    update: bmw430iImageSource,
  });
  const officialImageIds = [
    "P90549616",
    "P90549617",
    "P90549625",
    "P90549626",
    "P90554821",
    "P90554870",
    "P90554902",
    "P90554915",
    "P90572308",
  ] as const;
  const officialImageSources = new Map(
    await Promise.all(
      officialImageIds.map(async (imageId) => {
        const imageSource = await prisma.source.upsert({
          where: { slug: `bmw-pressclub-image-${imageId.toLowerCase()}` },
          create: {
            slug: `bmw-pressclub-image-${imageId.toLowerCase()}`,
            title: `BMW PressClub vehicle image ${imageId}`,
            publisher: "BMW Group",
            url: `https://www.press.bmwgroup.com/usa/photo/detail/${imageId}`,
            type: "MANUFACTURER",
          },
          update: {
            title: `BMW PressClub vehicle image ${imageId}`,
            publisher: "BMW Group",
            url: `https://www.press.bmwgroup.com/usa/photo/detail/${imageId}`,
            type: "MANUFACTURER",
          },
        });
        return [imageId, imageSource] as const;
      }),
    ),
  );
  const getOfficialImageSource = (imageId: (typeof officialImageIds)[number]) => {
    const imageSource = officialImageSources.get(imageId);
    if (!imageSource) throw new Error(`Missing seeded image source for ${imageId}.`);
    return imageSource;
  };
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
  const bmw330iXdrive = await prisma.vehicle.upsert({
    where: { slug: "2025-bmw-330i-xdrive-us" },
    create: {
      slug: "2025-bmw-330i-xdrive-us",
      modelYearId: modelYear.id,
      name: "330i xDrive",
      market: "US",
      bodyStyle: "SEDAN",
      drivetrain: "AWD",
      engineId: b48.id,
      transmissionId: steptronic.id,
      status: "PUBLISHED",
      publishedAt: pricingDate,
      createdById: importer.id,
    },
    update: {
      modelYearId: modelYear.id,
      name: "330i xDrive",
      market: "US",
      bodyStyle: "SEDAN",
      drivetrain: "AWD",
      engineId: b48.id,
      transmissionId: steptronic.id,
      status: "PUBLISHED",
      publishedAt: pricingDate,
      createdById: importer.id,
    },
  });
  const bmwM340iXdrive = await prisma.vehicle.upsert({
    where: { slug: "2025-bmw-m340i-xdrive-us" },
    create: {
      slug: "2025-bmw-m340i-xdrive-us",
      modelYearId: modelYear.id,
      name: "M340i xDrive",
      market: "US",
      bodyStyle: "SEDAN",
      drivetrain: "AWD",
      engineId: b58.id,
      transmissionId: mSteptronic.id,
      status: "PUBLISHED",
      publishedAt: pricingDate,
      createdById: importer.id,
    },
    update: {
      modelYearId: modelYear.id,
      name: "M340i xDrive",
      market: "US",
      bodyStyle: "SEDAN",
      drivetrain: "AWD",
      engineId: b58.id,
      transmissionId: mSteptronic.id,
      status: "PUBLISHED",
      publishedAt: pricingDate,
      createdById: importer.id,
    },
  });
  const bmw430i = await prisma.vehicle.upsert({
    where: { slug: "2025-bmw-430i-coupe-us" },
    create: {
      slug: "2025-bmw-430i-coupe-us",
      modelYearId: modelYear4.id,
      name: "430i Coupe",
      market: "US",
      bodyStyle: "COUPE",
      drivetrain: "RWD",
      engineId: b48.id,
      transmissionId: steptronic.id,
      status: "PUBLISHED",
      publishedAt: pricingDate,
      createdById: importer.id,
    },
    update: {
      modelYearId: modelYear4.id,
      name: "430i Coupe",
      market: "US",
      bodyStyle: "COUPE",
      drivetrain: "RWD",
      engineId: b48.id,
      transmissionId: steptronic.id,
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
      sourceId: getOfficialImageSource("P90549617").id,
      url: "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90549617",
      alt: "2025 BMW 330i Sedan exterior",
      credit: "BMW Group",
      position: 0,
    },
    update: {
      sourceId: getOfficialImageSource("P90549617").id,
      url: "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90549617",
      alt: "2025 BMW 330i Sedan exterior",
      credit: "BMW Group",
    },
  });

  await prisma.vehicleImage.upsert({
    where: { vehicleId_position: { vehicleId: bmwM340i.id, position: 0 } },
    create: {
      vehicleId: bmwM340i.id,
      sourceId: getOfficialImageSource("P90549625").id,
      url: "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90549625",
      alt: "2025 BMW M340i Sedan exterior",
      credit: "BMW Group",
      position: 0,
    },
    update: {
      sourceId: getOfficialImageSource("P90549625").id,
      url: "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90549625",
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

  const additionalVehicles = [
    {
      vehicle: bmw330iXdrive,
      dimensions: {
        lengthIn: 185.9,
        widthIn: 71.9,
        heightIn: 57,
        wheelbaseIn: 112.5,
        frontTrackIn: 62.3,
        rearTrackIn: 61.7,
        groundClearanceIn: 5.4,
        curbWeightKg: 1702,
        grossVehicleWeightKg: 2210,
        cargoVolumeLiters: 479,
        seatingCapacity: 5,
      },
      performance: {
        powerHp: 255,
        torqueLbFt: 295,
        zeroToSixtySeconds: 5.4,
        topSpeedMph: 130,
      },
      fuelEconomy: { cityMpg: 26, highwayMpg: 34, combinedMpg: 29 },
      price: 4750000,
      image: {
        sourceId: getOfficialImageSource("P90549616").id,
        url: "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90549616",
        alt: "2025 BMW 330i xDrive Sedan exterior",
      },
      sourceId: source.id,
    },
    {
      vehicle: bmwM340iXdrive,
      dimensions: {
        lengthIn: 185.9,
        widthIn: 71.9,
        heightIn: 56.7,
        wheelbaseIn: 112.5,
        frontTrackIn: 62.3,
        rearTrackIn: 61.7,
        groundClearanceIn: 5.1,
        curbWeightKg: 1818,
        grossVehicleWeightKg: 2315,
        cargoVolumeLiters: 479,
        seatingCapacity: 5,
      },
      performance: {
        powerHp: 386,
        torqueLbFt: 398,
        zeroToSixtySeconds: 4.1,
        topSpeedMph: 130,
      },
      fuelEconomy: { cityMpg: 23, highwayMpg: 31, combinedMpg: 26 },
      price: 6160000,
      image: {
        sourceId: getOfficialImageSource("P90549626").id,
        url: "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90549626",
        alt: "2025 BMW M340i xDrive Sedan exterior",
      },
      sourceId: source.id,
    },
    {
      vehicle: bmw430i,
      dimensions: {
        lengthIn: 187.9,
        widthIn: 72.9,
        heightIn: 54.6,
        wheelbaseIn: 112.2,
        frontTrackIn: 62.8,
        rearTrackIn: 63.1,
        groundClearanceIn: 5.1,
        curbWeightKg: 1670,
        grossVehicleWeightKg: 2110,
        cargoVolumeLiters: 340,
        seatingCapacity: 4,
      },
      performance: {
        powerHp: 255,
        torqueLbFt: 295,
        zeroToSixtySeconds: 5.5,
        topSpeedMph: 130,
      },
      fuelEconomy: { cityMpg: 26, highwayMpg: 34, combinedMpg: 29 },
      price: 5070000,
      image: {
        sourceId: bmw430iImageSourceRecord.id,
        url: "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90390664",
        alt: "2025 BMW 430i Coupe exterior",
      },
      sourceId: bmw430iSource.id,
    },
  ];
  for (const entry of additionalVehicles) {
    await Promise.all([
      prisma.vehicleDimensions.upsert({
        where: { vehicleId: entry.vehicle.id },
        create: { vehicleId: entry.vehicle.id, ...entry.dimensions },
        update: entry.dimensions,
      }),
      prisma.vehiclePerformance.upsert({
        where: { vehicleId: entry.vehicle.id },
        create: { vehicleId: entry.vehicle.id, ...entry.performance },
        update: entry.performance,
      }),
      prisma.vehicleFuelEconomy.upsert({
        where: { vehicleId: entry.vehicle.id },
        create: { vehicleId: entry.vehicle.id, ...entry.fuelEconomy },
        update: entry.fuelEconomy,
      }),
      prisma.vehiclePrice.upsert({
        where: {
          vehicleId_market_type_effectiveAt: {
            vehicleId: entry.vehicle.id,
            market: "US",
            type: "BASE_MSRP",
            effectiveAt: pricingDate,
          },
        },
        create: {
          vehicleId: entry.vehicle.id,
          market: "US",
          type: "BASE_MSRP",
          amountCents: entry.price,
          effectiveAt: pricingDate,
        },
        update: { amountCents: entry.price },
      }),
      prisma.vehicleImage.upsert({
        where: { vehicleId_position: { vehicleId: entry.vehicle.id, position: 0 } },
        create: {
          vehicleId: entry.vehicle.id,
          ...entry.image,
          credit: "BMW Group",
          position: 0,
        },
        update: { ...entry.image, credit: "BMW Group" },
      }),
      upsertCitation(
        entry.sourceId,
        "Vehicle",
        entry.vehicle.id,
        "specifications",
        "Official specifications",
      ),
    ]);
  }

  const [x3Model, twoSeriesModel] = await Promise.all([
    prisma.vehicleModel.upsert({
      where: { slug: "bmw-x3" },
      create: { manufacturerId: manufacturer.id, name: "X3", slug: "bmw-x3" },
      update: { manufacturerId: manufacturer.id, name: "X3" },
    }),
    prisma.vehicleModel.upsert({
      where: { slug: "bmw-2-series" },
      create: {
        manufacturerId: manufacturer.id,
        name: "2 Series",
        slug: "bmw-2-series",
      },
      update: { manufacturerId: manufacturer.id, name: "2 Series" },
    }),
  ]);
  const [x3Generation, twoSeriesCoupeGeneration, twoSeriesGranCoupeGeneration] =
    await Promise.all([
      prisma.vehicleGeneration.upsert({
        where: { modelId_code: { modelId: x3Model.id, code: "G45" } },
        create: {
          modelId: x3Model.id,
          code: "G45",
          displayName: "Fourth generation (G45)",
        },
        update: { displayName: "Fourth generation (G45)" },
      }),
      prisma.vehicleGeneration.upsert({
        where: { modelId_code: { modelId: twoSeriesModel.id, code: "G42" } },
        create: {
          modelId: twoSeriesModel.id,
          code: "G42",
          displayName: "Second generation Coupe (G42)",
        },
        update: { displayName: "Second generation Coupe (G42)" },
      }),
      prisma.vehicleGeneration.upsert({
        where: { modelId_code: { modelId: twoSeriesModel.id, code: "F74" } },
        create: {
          modelId: twoSeriesModel.id,
          code: "F74",
          displayName: "Second generation Gran Coupe (F74)",
        },
        update: { displayName: "Second generation Gran Coupe (F74)" },
      }),
    ]);
  const [x3ModelYear, twoSeriesCoupeModelYear, twoSeriesGranCoupeModelYear] =
    await Promise.all([
      prisma.modelYear.upsert({
        where: { generationId_year: { generationId: x3Generation.id, year: 2025 } },
        create: { generationId: x3Generation.id, year: 2025 },
        update: {},
      }),
      prisma.modelYear.upsert({
        where: {
          generationId_year: { generationId: twoSeriesCoupeGeneration.id, year: 2025 },
        },
        create: { generationId: twoSeriesCoupeGeneration.id, year: 2025 },
        update: {},
      }),
      prisma.modelYear.upsert({
        where: {
          generationId_year: {
            generationId: twoSeriesGranCoupeGeneration.id,
            year: 2025,
          },
        },
        create: { generationId: twoSeriesGranCoupeGeneration.id, year: 2025 },
        update: {},
      }),
    ]);
  const [b48Coupe, b58Coupe, b48a, sportSteptronic, sevenSpeedDct] = await Promise.all([
    prisma.engine.upsert({
      where: { slug: "bmw-b48b20-230i" },
      create: {
        manufacturerId: manufacturer.id,
        slug: "bmw-b48b20-230i",
        name: "B48B20",
        code: "B48B20",
        fuelType: "PETROL",
        displacementCc: 1998,
        cylinderCount: 4,
        configuration: "Inline",
        induction: "Twin-scroll turbocharger",
      },
      update: {
        manufacturerId: manufacturer.id,
        name: "B48B20",
        code: "B48B20",
        fuelType: "PETROL",
        displacementCc: 1998,
        cylinderCount: 4,
        configuration: "Inline",
        induction: "Twin-scroll turbocharger",
        electrification: null,
      },
    }),
    prisma.engine.upsert({
      where: { slug: "bmw-b58b30-m240i" },
      create: {
        manufacturerId: manufacturer.id,
        slug: "bmw-b58b30-m240i",
        name: "B58B30",
        code: "B58B30",
        fuelType: "PETROL",
        displacementCc: 2998,
        cylinderCount: 6,
        configuration: "Inline",
        induction: "Twin-scroll turbocharger",
      },
      update: {
        manufacturerId: manufacturer.id,
        name: "B58B30",
        code: "B58B30",
        fuelType: "PETROL",
        displacementCc: 2998,
        cylinderCount: 6,
        configuration: "Inline",
        induction: "Twin-scroll turbocharger",
        electrification: null,
      },
    }),
    prisma.engine.upsert({
      where: { slug: "bmw-b48a20o2" },
      create: {
        manufacturerId: manufacturer.id,
        slug: "bmw-b48a20o2",
        name: "B48A20O2",
        code: "B48A20O2",
        fuelType: "PETROL",
        displacementCc: 1998,
        cylinderCount: 4,
        configuration: "Inline",
        induction: "Twin-scroll turbocharger",
      },
      update: {
        manufacturerId: manufacturer.id,
        name: "B48A20O2",
        code: "B48A20O2",
        fuelType: "PETROL",
        displacementCc: 1998,
        cylinderCount: 4,
        configuration: "Inline",
        induction: "Twin-scroll turbocharger",
        electrification: null,
      },
    }),
    prisma.transmission.upsert({
      where: { slug: "bmw-8-speed-sport-steptronic" },
      create: {
        slug: "bmw-8-speed-sport-steptronic",
        name: "8-speed Sport Steptronic",
        type: "AUTOMATIC",
        gearCount: 8,
      },
      update: { name: "8-speed Sport Steptronic", type: "AUTOMATIC", gearCount: 8 },
    }),
    prisma.transmission.upsert({
      where: { slug: "bmw-7-speed-dct-steptronic" },
      create: {
        slug: "bmw-7-speed-dct-steptronic",
        name: "7-speed DCT Steptronic",
        type: "DUAL_CLUTCH",
        gearCount: 7,
      },
      update: { name: "7-speed DCT Steptronic", type: "DUAL_CLUTCH", gearCount: 7 },
    }),
  ]);
  const extraSourceData = [
    {
      slug: "bmw-2025-x3-press-release",
      title: "The All-New 2025 BMW X3.",
      publisher: "BMW Group",
      url: "https://www.press.bmwgroup.com/usa/article/detail/T0443207EN_US/the-all-new-2025-bmw-x3",
      type: "PRESS_RELEASE" as const,
      publishedAt: new Date("2024-06-18T00:00:00.000Z"),
    },
    {
      slug: "bmw-2025-2-series-coupe-press-release",
      title: "The new 2025 BMW 2 Series Coupe.",
      publisher: "BMW Group",
      url: "https://www.press.bmwgroup.com/usa/article/attachment/T0443107EN_US/617995",
      type: "PRESS_RELEASE" as const,
      publishedAt: new Date("2024-06-12T00:00:00.000Z"),
    },
    {
      slug: "bmw-2025-2-series-gran-coupe-press-release",
      title: "The new 2025 BMW 2 Series Gran Coupe.",
      publisher: "BMW Group",
      url: "https://www.press.bmwgroup.com/usa/article/detail/T0445698EN_US/the-new-2025-bmw-2-series-gran-coupe",
      type: "PRESS_RELEASE" as const,
      publishedAt: new Date("2024-10-15T00:00:00.000Z"),
    },
    {
      slug: "epa-2025-bmw-x3-xdrive30i",
      title: "2025 BMW X3 xDrive30i fuel economy data",
      publisher: "U.S. Department of Energy and U.S. Environmental Protection Agency",
      url: "https://www.fueleconomy.gov/ws/rest/vehicle/48077",
      type: "GOVERNMENT" as const,
    },
    {
      slug: "epa-2025-bmw-x3-m50-xdrive",
      title: "2025 BMW X3 M50 xDrive fuel economy data",
      publisher: "U.S. Department of Energy and U.S. Environmental Protection Agency",
      url: "https://www.fueleconomy.gov/ws/rest/vehicle/48078",
      type: "GOVERNMENT" as const,
    },
    {
      slug: "epa-2025-bmw-230i-coupe",
      title: "2025 BMW 230i Coupe fuel economy data",
      publisher: "U.S. Department of Energy and U.S. Environmental Protection Agency",
      url: "https://www.fueleconomy.gov/ws/rest/vehicle/48151",
      type: "GOVERNMENT" as const,
    },
    {
      slug: "epa-2025-bmw-m240i-xdrive-coupe",
      title: "2025 BMW M240i xDrive Coupe fuel economy data",
      publisher: "U.S. Department of Energy and U.S. Environmental Protection Agency",
      url: "https://www.fueleconomy.gov/ws/rest/vehicle/48154",
      type: "GOVERNMENT" as const,
    },
    {
      slug: "epa-2025-bmw-228-xdrive-gran-coupe",
      title: "2025 BMW 228 xDrive Gran Coupe fuel economy data",
      publisher: "U.S. Department of Energy and U.S. Environmental Protection Agency",
      url: "https://www.fueleconomy.gov/ws/rest/vehicle/48841",
      type: "GOVERNMENT" as const,
    },
  ];
  const extraSources = new Map(
    await Promise.all(
      extraSourceData.map(async (sourceData) => {
        const source = await prisma.source.upsert({
          where: { slug: sourceData.slug },
          create: sourceData,
          update: sourceData,
        });
        return [sourceData.slug, source] as const;
      }),
    ),
  );
  const getExtraSource = (slug: string) => {
    const extraSource = extraSources.get(slug);
    if (!extraSource) throw new Error(`Missing seeded source for ${slug}.`);
    return extraSource;
  };
  const upsertPublishedVehicle = (data: {
    slug: string;
    modelYearId: string;
    name: string;
    bodyStyle: "COUPE" | "SEDAN" | "SUV";
    drivetrain: "RWD" | "AWD";
    engineId: string;
    transmissionId: string;
  }) =>
    prisma.vehicle.upsert({
      where: { slug: data.slug },
      create: {
        ...data,
        market: "US",
        status: "PUBLISHED",
        publishedAt: pricingDate,
        createdById: importer.id,
      },
      update: {
        ...data,
        market: "US",
        status: "PUBLISHED",
        publishedAt: pricingDate,
        createdById: importer.id,
      },
    });
  const [x3Thirty, x3M50, twoThirty, m240iXdrive, twoTwentyEight] = await Promise.all([
    upsertPublishedVehicle({
      slug: "2025-bmw-x3-30-xdrive-us",
      modelYearId: x3ModelYear.id,
      name: "X3 30 xDrive",
      bodyStyle: "SUV",
      drivetrain: "AWD",
      engineId: b48.id,
      transmissionId: steptronic.id,
    }),
    upsertPublishedVehicle({
      slug: "2025-bmw-x3-m50-xdrive-us",
      modelYearId: x3ModelYear.id,
      name: "X3 M50 xDrive",
      bodyStyle: "SUV",
      drivetrain: "AWD",
      engineId: b58.id,
      transmissionId: steptronic.id,
    }),
    upsertPublishedVehicle({
      slug: "2025-bmw-230i-coupe-us",
      modelYearId: twoSeriesCoupeModelYear.id,
      name: "230i Coupe",
      bodyStyle: "COUPE",
      drivetrain: "RWD",
      engineId: b48Coupe.id,
      transmissionId: sportSteptronic.id,
    }),
    upsertPublishedVehicle({
      slug: "2025-bmw-m240i-xdrive-coupe-us",
      modelYearId: twoSeriesCoupeModelYear.id,
      name: "M240i xDrive Coupe",
      bodyStyle: "COUPE",
      drivetrain: "AWD",
      engineId: b58Coupe.id,
      transmissionId: sportSteptronic.id,
    }),
    upsertPublishedVehicle({
      slug: "2025-bmw-228-xdrive-gran-coupe-us",
      modelYearId: twoSeriesGranCoupeModelYear.id,
      name: "228 xDrive Gran Coupe",
      bodyStyle: "SEDAN",
      drivetrain: "AWD",
      engineId: b48a.id,
      transmissionId: sevenSpeedDct.id,
    }),
  ]);
  const expandedVehicles = [
    {
      vehicle: x3Thirty,
      dimensions: {
        lengthIn: 187.2,
        widthIn: 75.6,
        heightIn: 65.4,
        wheelbaseIn: 112.8,
        frontTrackIn: 63.5,
        rearTrackIn: 65.3,
        groundClearanceIn: 8.5,
        curbWeightKg: 1894,
        grossVehicleWeightKg: 2500,
        cargoVolumeLiters: 892,
        seatingCapacity: 5,
      },
      performance: {
        powerHp: 255,
        torqueLbFt: 295,
        zeroToSixtySeconds: 6,
        topSpeedMph: 130,
      },
      fuelEconomy: { cityMpg: 27, highwayMpg: 33, combinedMpg: 29 },
      price: 4950000,
      imageId: "P90554821" as const,
      alt: "2025 BMW X3 30 xDrive exterior",
      specificationSourceSlug: "bmw-2025-x3-press-release",
      fuelSourceSlug: "epa-2025-bmw-x3-xdrive30i",
    },
    {
      vehicle: x3M50,
      dimensions: {
        lengthIn: 187.2,
        widthIn: 75.6,
        heightIn: 65.4,
        wheelbaseIn: 112.8,
        frontTrackIn: 63.9,
        rearTrackIn: 63.9,
        groundClearanceIn: 8.3,
        curbWeightKg: 2057,
        grossVehicleWeightKg: 2620,
        cargoVolumeLiters: 892,
        seatingCapacity: 5,
      },
      performance: {
        powerHp: 393,
        torqueLbFt: 428,
        zeroToSixtySeconds: 4.4,
        topSpeedMph: 130,
      },
      fuelEconomy: { cityMpg: 25, highwayMpg: 30, combinedMpg: 27 },
      price: 6410000,
      imageId: "P90554870" as const,
      alt: "2025 BMW X3 M50 xDrive exterior",
      specificationSourceSlug: "bmw-2025-x3-press-release",
      fuelSourceSlug: "epa-2025-bmw-x3-m50-xdrive",
    },
    {
      vehicle: twoThirty,
      dimensions: {
        lengthIn: 179,
        widthIn: 72.4,
        heightIn: 54.8,
        wheelbaseIn: 107.9,
        frontTrackIn: 62.4,
        rearTrackIn: 62.9,
        groundClearanceIn: 5,
        curbWeightKg: 1563,
        grossVehicleWeightKg: 1995,
        cargoVolumeLiters: 391,
        seatingCapacity: 4,
      },
      performance: {
        powerHp: 255,
        torqueLbFt: 295,
        zeroToSixtySeconds: 5.5,
        topSpeedMph: 130,
      },
      fuelEconomy: { cityMpg: 26, highwayMpg: 35, combinedMpg: 30 },
      price: 3920000,
      imageId: "P90554902" as const,
      alt: "2025 BMW 230i Coupe exterior",
      specificationSourceSlug: "bmw-2025-2-series-coupe-press-release",
      fuelSourceSlug: "epa-2025-bmw-230i-coupe",
    },
    {
      vehicle: m240iXdrive,
      dimensions: {
        lengthIn: 179,
        widthIn: 72.4,
        heightIn: 55.3,
        wheelbaseIn: 107.9,
        frontTrackIn: 62.2,
        rearTrackIn: 62.8,
        groundClearanceIn: 5,
        curbWeightKg: 1756,
        grossVehicleWeightKg: 2165,
        cargoVolumeLiters: 391,
        seatingCapacity: 4,
      },
      performance: {
        powerHp: 382,
        torqueLbFt: 369,
        zeroToSixtySeconds: 4.1,
        topSpeedMph: 130,
      },
      fuelEconomy: { cityMpg: 23, highwayMpg: 32, combinedMpg: 26 },
      price: 5210000,
      imageId: "P90554915" as const,
      alt: "2025 BMW M240i xDrive Coupe exterior",
      specificationSourceSlug: "bmw-2025-2-series-coupe-press-release",
      fuelSourceSlug: "epa-2025-bmw-m240i-xdrive-coupe",
    },
    {
      vehicle: twoTwentyEight,
      dimensions: {
        lengthIn: 179.2,
        widthIn: 70.9,
        heightIn: 56.9,
        wheelbaseIn: 105.1,
        frontTrackIn: 61.4,
        rearTrackIn: 61.4,
        groundClearanceIn: 5.7,
        curbWeightKg: 1603,
        grossVehicleWeightKg: 2075,
        cargoVolumeLiters: 340,
        seatingCapacity: 5,
      },
      performance: {
        powerHp: 241,
        torqueLbFt: 295,
        zeroToSixtySeconds: 5.8,
        topSpeedMph: 130,
      },
      fuelEconomy: { cityMpg: 26, highwayMpg: 38, combinedMpg: 30 },
      price: 4160000,
      imageId: "P90572308" as const,
      alt: "2025 BMW 228 xDrive Gran Coupe exterior",
      specificationSourceSlug: "bmw-2025-2-series-gran-coupe-press-release",
      fuelSourceSlug: "epa-2025-bmw-228-xdrive-gran-coupe",
    },
  ];
  for (const entry of expandedVehicles) {
    const [dimensions, performance, fuelEconomy, price] = await Promise.all([
      prisma.vehicleDimensions.upsert({
        where: { vehicleId: entry.vehicle.id },
        create: { vehicleId: entry.vehicle.id, ...entry.dimensions },
        update: entry.dimensions,
      }),
      prisma.vehiclePerformance.upsert({
        where: { vehicleId: entry.vehicle.id },
        create: { vehicleId: entry.vehicle.id, ...entry.performance },
        update: entry.performance,
      }),
      prisma.vehicleFuelEconomy.upsert({
        where: { vehicleId: entry.vehicle.id },
        create: { vehicleId: entry.vehicle.id, ...entry.fuelEconomy },
        update: entry.fuelEconomy,
      }),
      prisma.vehiclePrice.upsert({
        where: {
          vehicleId_market_type_effectiveAt: {
            vehicleId: entry.vehicle.id,
            market: "US",
            type: "BASE_MSRP",
            effectiveAt: pricingDate,
          },
        },
        create: {
          vehicleId: entry.vehicle.id,
          market: "US",
          type: "BASE_MSRP",
          amountCents: entry.price,
          effectiveAt: pricingDate,
        },
        update: { amountCents: entry.price },
      }),
      prisma.vehicleImage.upsert({
        where: { vehicleId_position: { vehicleId: entry.vehicle.id, position: 0 } },
        create: {
          vehicleId: entry.vehicle.id,
          sourceId: getOfficialImageSource(entry.imageId).id,
          url: `https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=${entry.imageId}`,
          alt: entry.alt,
          credit: "BMW Group",
          position: 0,
        },
        update: {
          sourceId: getOfficialImageSource(entry.imageId).id,
          url: `https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=${entry.imageId}`,
          alt: entry.alt,
          credit: "BMW Group",
        },
      }),
    ]);
    await Promise.all([
      upsertCitation(
        getExtraSource(entry.specificationSourceSlug).id,
        "VehicleDimensions",
        dimensions.id,
        "specifications",
        "Official specifications",
      ),
      upsertCitation(
        getExtraSource(entry.specificationSourceSlug).id,
        "VehiclePerformance",
        performance.id,
        "specifications",
        "Official specifications",
      ),
      upsertCitation(
        getExtraSource(entry.specificationSourceSlug).id,
        "VehiclePrice",
        price.id,
        "amountCents",
        "Base MSRP",
      ),
      upsertCitation(
        getExtraSource(entry.fuelSourceSlug).id,
        "VehicleFuelEconomy",
        fuelEconomy.id,
        "cityMpg",
        "EPA city estimate",
      ),
      upsertCitation(
        getExtraSource(entry.fuelSourceSlug).id,
        "VehicleFuelEconomy",
        fuelEconomy.id,
        "highwayMpg",
        "EPA highway estimate",
      ),
      upsertCitation(
        getExtraSource(entry.fuelSourceSlug).id,
        "VehicleFuelEconomy",
        fuelEconomy.id,
        "combinedMpg",
        "EPA combined estimate",
      ),
    ]);
  }

  for (const vehicle of [
    bmw330i,
    bmw330iXdrive,
    bmw430i,
    bmwM340i,
    bmwM340iXdrive,
    twoTwentyEight,
    twoThirty,
    m240iXdrive,
    x3Thirty,
    x3M50,
  ]) {
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
