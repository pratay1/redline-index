/**
 * BMW 7 Series US MY 2025 seed module (740i Sedan, 740i xDrive Sedan).
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Sources:
 * - Press G70 launch: https://www.press.bmwgroup.com/usa/article/detail/T0382613EN_US/the-new-bmw-7-series
 * - Press summer 2023 (740i xDrive 0–60): https://www.press.bmwgroup.com/usa/article/detail/T0418502EN_US/bmw-model-updates-for-summer-2023
 * - EPA: 48190 (740i Sedan), 48191 (740i xDrive Sedan)
 * - MSRP: Edmunds 2025 7 Series ($97,300 / $100,300)
 */
import type { SeedCtx } from "./bmw-shared";
import {
  DESTINATION_CENTS,
  assertImageOk,
  ensureAudit,
  ensureImageSource,
  mediapoolUrl,
  upsertCitation,
} from "./bmw-shared";

const LBS_TO_KG = 0.45359237;
const CUFT_TO_L = 28.316846592;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

type TrimSeed = {
  slug: string;
  name: string;
  drivetrain: "RWD" | "AWD";
  dokNo: string;
  epaId: string;
  dimensions: {
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    wheelbaseIn: number;
    frontTrackIn: number;
    rearTrackIn: number;
    groundClearanceIn: number;
    curbWeightKg: number;
    cargoVolumeLiters: number;
    seatingCapacity: number;
  };
  performance: {
    powerHp: number;
    torqueLbFt: number;
    zeroToSixtySeconds: number;
    topSpeedMph: number;
  };
  fuelEconomy: {
    cityMpg: number;
    highwayMpg: number;
    combinedMpg: number;
  };
  baseMsrpCents: number;
  pressSourceSlug: string;
  priceSourceSlug: string;
};

const PRESS_SOURCES = [
  {
    slug: "bmw-2023-7-series-press-release",
    title: "The new BMW 7 Series.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0382613EN_US/the-new-bmw-7-series",
    publishedAt: new Date("2022-04-20T00:00:00.000Z"),
  },
  {
    slug: "bmw-summer-2023-model-updates-press-release",
    title: "BMW Model Updates for Summer 2023.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0418502EN_US/bmw-model-updates-for-summer-2023",
    publishedAt: new Date("2023-05-22T00:00:00.000Z"),
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "edmunds-2025-bmw-7-series-msrp",
    title: "2025 BMW 7 Series specs & features (base MSRP)",
    url: "https://www.edmunds.com/bmw/7-series/2025/features-specs/",
    type: "THIRD_PARTY" as const,
    publisher: "Edmunds",
  },
] as const;

const TRIMS: TrimSeed[] = [
  {
    slug: "2025-bmw-740i-us",
    name: "740i Sedan",
    drivetrain: "RWD",
    dokNo: "P90458916",
    epaId: "48190",
    dimensions: {
      lengthIn: 212.2,
      widthIn: 76.8,
      heightIn: 60.8,
      wheelbaseIn: 126.6,
      frontTrackIn: 65.6,
      rearTrackIn: 64.9,
      groundClearanceIn: 5.8,
      curbWeightKg: lbsToKg(4720),
      cargoVolumeLiters: cuFtToLiters(19.1),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 375,
      torqueLbFt: 383,
      zeroToSixtySeconds: 5.1,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 25, highwayMpg: 31, combinedMpg: 28 },
    baseMsrpCents: 9730000,
    pressSourceSlug: "bmw-summer-2023-model-updates-press-release",
    priceSourceSlug: "edmunds-2025-bmw-7-series-msrp",
  },
  {
    slug: "2025-bmw-740i-xdrive-us",
    name: "740i xDrive Sedan",
    drivetrain: "AWD",
    dokNo: "P90458917",
    epaId: "48191",
    dimensions: {
      lengthIn: 212.2,
      widthIn: 76.8,
      heightIn: 60.8,
      wheelbaseIn: 126.6,
      frontTrackIn: 65.6,
      rearTrackIn: 64.9,
      groundClearanceIn: 5.8,
      curbWeightKg: lbsToKg(4855),
      cargoVolumeLiters: cuFtToLiters(19.1),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 375,
      torqueLbFt: 383,
      zeroToSixtySeconds: 4.9,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 24, highwayMpg: 31, combinedMpg: 27 },
    baseMsrpCents: 10030000,
    pressSourceSlug: "bmw-summer-2023-model-updates-press-release",
    priceSourceSlug: "edmunds-2025-bmw-7-series-msrp",
  },
];

export async function seedBmw7Series(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const effectiveAt = pricingDate;
  const seeded: string[] = [];
  const skipped: string[] = [];

  const model = await prisma.vehicleModel.upsert({
    where: { slug: "bmw-7-series" },
    create: {
      manufacturerId,
      name: "7 Series",
      slug: "bmw-7-series",
    },
    update: { manufacturerId, name: "7 Series" },
  });

  const generation = await prisma.vehicleGeneration.upsert({
    where: {
      modelId_code: { modelId: model.id, code: "G70" },
    },
    create: {
      modelId: model.id,
      code: "G70",
      displayName: "Seventh generation (G70)",
      startYear: 2023,
    },
    update: {
      displayName: "Seventh generation (G70)",
      startYear: 2023,
    },
  });

  const modelYear = await prisma.modelYear.upsert({
    where: {
      generationId_year: { generationId: generation.id, year: 2025 },
    },
    create: { generationId: generation.id, year: 2025 },
    update: {},
  });

  const engine = await prisma.engine.upsert({
    where: { slug: "bmw-b58tu2" },
    create: {
      manufacturerId,
      slug: "bmw-b58tu2",
      name: "B58TU2",
      code: "B58TU2",
      fuelType: "PETROL",
      displacementCc: 2998,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "TwinPower Turbo",
      electrification: "48V mild hybrid",
    },
    update: {
      manufacturerId,
      name: "B58TU2",
      code: "B58TU2",
      fuelType: "PETROL",
      displacementCc: 2998,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "TwinPower Turbo",
      electrification: "48V mild hybrid",
    },
  });

  const transmission = await prisma.transmission.upsert({
    where: { slug: "bmw-8-speed-steptronic" },
    create: {
      slug: "bmw-8-speed-steptronic",
      name: "8-speed Steptronic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    update: { name: "8-speed Steptronic", type: "AUTOMATIC", gearCount: 8 },
  });

  const pressSources = new Map<string, { id: string }>();
  for (const sourceData of PRESS_SOURCES) {
    const source = await prisma.source.upsert({
      where: { slug: sourceData.slug },
      create: {
        slug: sourceData.slug,
        title: sourceData.title,
        publisher: "BMW Group",
        url: sourceData.url,
        type: "PRESS_RELEASE",
        publishedAt: sourceData.publishedAt,
      },
      update: {
        title: sourceData.title,
        publisher: "BMW Group",
        url: sourceData.url,
        type: "PRESS_RELEASE",
        publishedAt: sourceData.publishedAt,
      },
    });
    pressSources.set(sourceData.slug, source);
  }

  const priceSources = new Map<string, { id: string }>();
  for (const sourceData of PRICE_SOURCES) {
    const source = await prisma.source.upsert({
      where: { slug: sourceData.slug },
      create: {
        slug: sourceData.slug,
        title: sourceData.title,
        publisher: sourceData.publisher,
        url: sourceData.url,
        type: sourceData.type,
      },
      update: {
        title: sourceData.title,
        publisher: sourceData.publisher,
        url: sourceData.url,
        type: sourceData.type,
      },
    });
    priceSources.set(sourceData.slug, source);
  }

  for (const trim of TRIMS) {
    const existing = await prisma.vehicle.findUnique({
      where: { slug: trim.slug },
      include: {
        dimensions: true,
        performance: true,
        fuelEconomy: true,
        prices: true,
        images: true,
      },
    });

    if (
      existing?.dimensions &&
      existing.performance &&
      existing.fuelEconomy &&
      existing.prices.length >= 2 &&
      existing.images.length >= 1
    ) {
      skipped.push(`${trim.slug} (already complete)`);
      continue;
    }

    const pressSource = pressSources.get(trim.pressSourceSlug);
    const priceSource = priceSources.get(trim.priceSourceSlug);
    if (!pressSource || !priceSource) {
      skipped.push(`${trim.slug} (missing source wiring)`);
      continue;
    }

    await assertImageOk(trim.dokNo);
    const imageSource = await ensureImageSource(prisma, trim.dokNo);
    const imageUrl = mediapoolUrl(trim.dokNo);

    const fuelSource = await prisma.source.upsert({
      where: {
        slug: `epa-2025-bmw-${trim.slug.replace(/^2025-bmw-/, "").replace(/-us$/, "")}`,
      },
      create: {
        slug: `epa-2025-bmw-${trim.slug.replace(/^2025-bmw-/, "").replace(/-us$/, "")}`,
        title: `2025 BMW ${trim.name} fuel economy data`,
        publisher:
          "U.S. Department of Energy and U.S. Environmental Protection Agency",
        url: `https://www.fueleconomy.gov/ws/rest/vehicle/${trim.epaId}`,
        type: "GOVERNMENT",
      },
      update: {
        title: `2025 BMW ${trim.name} fuel economy data`,
        publisher:
          "U.S. Department of Energy and U.S. Environmental Protection Agency",
        url: `https://www.fueleconomy.gov/ws/rest/vehicle/${trim.epaId}`,
        type: "GOVERNMENT",
      },
    });

    const vehicle = await prisma.vehicle.upsert({
      where: { slug: trim.slug },
      create: {
        slug: trim.slug,
        modelYearId: modelYear.id,
        name: trim.name,
        market: "US",
        bodyStyle: "SEDAN",
        drivetrain: trim.drivetrain,
        engineId: engine.id,
        transmissionId: transmission.id,
        status: "PUBLISHED",
        publishedAt: effectiveAt,
        createdById: importerId,
      },
      update: {
        modelYearId: modelYear.id,
        name: trim.name,
        market: "US",
        bodyStyle: "SEDAN",
        drivetrain: trim.drivetrain,
        engineId: engine.id,
        transmissionId: transmission.id,
        status: "PUBLISHED",
        publishedAt: effectiveAt,
        createdById: importerId,
      },
    });

    const dimensionsData = {
      lengthIn: trim.dimensions.lengthIn,
      widthIn: trim.dimensions.widthIn,
      heightIn: trim.dimensions.heightIn,
      wheelbaseIn: trim.dimensions.wheelbaseIn,
      frontTrackIn: trim.dimensions.frontTrackIn,
      rearTrackIn: trim.dimensions.rearTrackIn,
      groundClearanceIn: trim.dimensions.groundClearanceIn,
      curbWeightKg: trim.dimensions.curbWeightKg,
      cargoVolumeLiters: trim.dimensions.cargoVolumeLiters,
      seatingCapacity: trim.dimensions.seatingCapacity,
    };

    const performanceData = {
      powerHp: trim.performance.powerHp,
      torqueLbFt: trim.performance.torqueLbFt,
      zeroToSixtySeconds: trim.performance.zeroToSixtySeconds,
      topSpeedMph: trim.performance.topSpeedMph,
    };

    const fuelData = {
      cityMpg: trim.fuelEconomy.cityMpg,
      highwayMpg: trim.fuelEconomy.highwayMpg,
      combinedMpg: trim.fuelEconomy.combinedMpg,
    };

    const [dimensions, performance, fuelEconomy, basePrice, destinationPrice, image] =
      await Promise.all([
        prisma.vehicleDimensions.upsert({
          where: { vehicleId: vehicle.id },
          create: { vehicleId: vehicle.id, ...dimensionsData },
          update: dimensionsData,
        }),
        prisma.vehiclePerformance.upsert({
          where: { vehicleId: vehicle.id },
          create: { vehicleId: vehicle.id, ...performanceData },
          update: performanceData,
        }),
        prisma.vehicleFuelEconomy.upsert({
          where: { vehicleId: vehicle.id },
          create: { vehicleId: vehicle.id, ...fuelData },
          update: fuelData,
        }),
        prisma.vehiclePrice.upsert({
          where: {
            vehicleId_market_type_effectiveAt: {
              vehicleId: vehicle.id,
              market: "US",
              type: "BASE_MSRP",
              effectiveAt,
            },
          },
          create: {
            vehicleId: vehicle.id,
            market: "US",
            type: "BASE_MSRP",
            amountCents: trim.baseMsrpCents,
            currency: "USD",
            effectiveAt,
          },
          update: { amountCents: trim.baseMsrpCents, currency: "USD" },
        }),
        prisma.vehiclePrice.upsert({
          where: {
            vehicleId_market_type_effectiveAt: {
              vehicleId: vehicle.id,
              market: "US",
              type: "DESTINATION_FEE",
              effectiveAt,
            },
          },
          create: {
            vehicleId: vehicle.id,
            market: "US",
            type: "DESTINATION_FEE",
            amountCents: DESTINATION_CENTS,
            currency: "USD",
            effectiveAt,
          },
          update: { amountCents: DESTINATION_CENTS, currency: "USD" },
        }),
        prisma.vehicleImage.upsert({
          where: { vehicleId_position: { vehicleId: vehicle.id, position: 0 } },
          create: {
            vehicleId: vehicle.id,
            sourceId: imageSource.id,
            url: imageUrl,
            alt: `2025 BMW ${trim.name} exterior`,
            credit: "BMW Group",
            position: 0,
          },
          update: {
            sourceId: imageSource.id,
            url: imageUrl,
            alt: `2025 BMW ${trim.name} exterior`,
            credit: "BMW Group",
          },
        }),
      ]);

    await Promise.all([
      upsertCitation(
        prisma,
        pressSources.get("bmw-2023-7-series-press-release")!.id,
        "VehicleDimensions",
        dimensions.id,
        "specifications",
        "Exterior dimensions / luggage capacity",
      ),
      upsertCitation(
        prisma,
        pressSource.id,
        "VehiclePerformance",
        performance.id,
        "specifications",
        "Power / torque / 0-60",
      ),
      upsertCitation(
        prisma,
        priceSource.id,
        "VehiclePrice",
        basePrice.id,
        "amountCents",
        "Base MSRP",
      ),
      upsertCitation(
        prisma,
        pressSources.get("bmw-2023-7-series-press-release")!.id,
        "VehiclePrice",
        destinationPrice.id,
        "amountCents",
        "Destination and handling",
      ),
      upsertCitation(
        prisma,
        fuelSource.id,
        "VehicleFuelEconomy",
        fuelEconomy.id,
        "cityMpg",
        "EPA city estimate",
      ),
      upsertCitation(
        prisma,
        fuelSource.id,
        "VehicleFuelEconomy",
        fuelEconomy.id,
        "highwayMpg",
        "EPA highway estimate",
      ),
      upsertCitation(
        prisma,
        fuelSource.id,
        "VehicleFuelEconomy",
        fuelEconomy.id,
        "combinedMpg",
        "EPA combined estimate",
      ),
      upsertCitation(
        prisma,
        imageSource.id,
        "VehicleImage",
        image.id,
        "url",
        `PressClub image ${trim.dokNo}`,
      ),
    ]);

    await ensureAudit(prisma, importerId, vehicle.id, trim.slug);
    seeded.push(
      `${trim.slug} | dokNo=${trim.dokNo} | EPA=${trim.epaId} | image=${mediapoolUrl(trim.dokNo)}`,
    );
  }

  return { seeded, skipped };
}
