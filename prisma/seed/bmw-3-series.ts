/**
 * BMW 3 Series / M3 US MY 2025 seed module.
 * G20 core (330i / M340i) + G80 M3 trims.
 *
 * Sources:
 * - G20 press: https://www.press.bmwgroup.com/usa/article/detail/T0442407EN_US/the-new-2025-bmw-3-series
 * - M3 press: https://www.press.bmwgroup.com/usa/article/detail/T0442408EN_US/the-new-2025-bmw-m3
 * - EPA: 48163/48164 (330i), 48165/48166 (M340i), 47976–47978 (M3)
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

const PRICING_DATE = new Date("2024-05-28T00:00:00.000Z");

type G20CoreTrim = {
  slug: string;
  name: string;
  drivetrain: "RWD" | "AWD";
  engineSlug: "bmw-b48b20o2" | "bmw-b58b30m2";
  transmissionSlug: "bmw-8-speed-steptronic" | "bmw-8-speed-m-steptronic-drivelogic";
  imageDokNo: string;
  epaId: string;
  fuelSourceSlug: string;
  fuelSourceTitle: string;
  cityMpg: number;
  highwayMpg: number;
  combinedMpg: number;
  powerHp: number;
  torqueLbFt: number;
  zeroToSixtySeconds: number;
  topSpeedMph: number;
  baseMsrpCents: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  wheelbaseIn: number;
  frontTrackIn: number;
  rearTrackIn: number;
  groundClearanceIn: number;
  curbWeightKg: number;
  grossVehicleWeightKg: number;
  cargoVolumeLiters: number;
  seatingCapacity: number;
};

const G20_CORE_TRIMS: G20CoreTrim[] = [
  {
    slug: "2025-bmw-330i-us",
    name: "330i",
    drivetrain: "RWD",
    engineSlug: "bmw-b48b20o2",
    transmissionSlug: "bmw-8-speed-steptronic",
    imageDokNo: "P90549617",
    epaId: "48163",
    fuelSourceSlug: "epa-2025-bmw-330i-sedan",
    fuelSourceTitle: "2025 BMW 330i Sedan fuel economy data",
    cityMpg: 28,
    highwayMpg: 35,
    combinedMpg: 31,
    powerHp: 255,
    torqueLbFt: 295,
    zeroToSixtySeconds: 5.6,
    topSpeedMph: 130,
    baseMsrpCents: 4550000,
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
  {
    slug: "2025-bmw-330i-xdrive-us",
    name: "330i xDrive",
    drivetrain: "AWD",
    engineSlug: "bmw-b48b20o2",
    transmissionSlug: "bmw-8-speed-steptronic",
    imageDokNo: "P90549616",
    epaId: "48164",
    fuelSourceSlug: "epa-2025-bmw-330i-xdrive-sedan",
    fuelSourceTitle: "2025 BMW 330i xDrive Sedan fuel economy data",
    cityMpg: 26,
    highwayMpg: 34,
    combinedMpg: 29,
    powerHp: 255,
    torqueLbFt: 295,
    zeroToSixtySeconds: 5.4,
    topSpeedMph: 130,
    baseMsrpCents: 4750000,
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
  {
    slug: "2025-bmw-m340i-us",
    name: "M340i",
    drivetrain: "RWD",
    engineSlug: "bmw-b58b30m2",
    transmissionSlug: "bmw-8-speed-m-steptronic-drivelogic",
    imageDokNo: "P90549625",
    epaId: "48165",
    fuelSourceSlug: "epa-2025-bmw-m340i-sedan",
    fuelSourceTitle: "2025 BMW M340i Sedan fuel economy data",
    cityMpg: 27,
    highwayMpg: 33,
    combinedMpg: 29,
    powerHp: 386,
    torqueLbFt: 398,
    zeroToSixtySeconds: 4.4,
    topSpeedMph: 130,
    baseMsrpCents: 5960000,
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
  {
    slug: "2025-bmw-m340i-xdrive-us",
    name: "M340i xDrive",
    drivetrain: "AWD",
    engineSlug: "bmw-b58b30m2",
    transmissionSlug: "bmw-8-speed-m-steptronic-drivelogic",
    imageDokNo: "P90549626",
    epaId: "48166",
    fuelSourceSlug: "epa-2025-bmw-m340i-xdrive-sedan",
    fuelSourceTitle: "2025 BMW M340i xDrive Sedan fuel economy data",
    cityMpg: 23,
    highwayMpg: 31,
    combinedMpg: 26,
    powerHp: 386,
    torqueLbFt: 398,
    zeroToSixtySeconds: 4.1,
    topSpeedMph: 130,
    baseMsrpCents: 6160000,
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
];

type M3Trim = {
  slug: string;
  name: string;
  drivetrain: "RWD" | "AWD";
  transmissionSlug: "bmw-6-speed-manual" | "bmw-8-speed-m-steptronic-drivelogic";
  imageDokNo: string;
  epaId: string;
  cityMpg: number;
  highwayMpg: number;
  combinedMpg: number;
  powerHp: number;
  torqueLbFt: number;
  zeroToSixtySeconds: number;
  topSpeedMph: number;
  baseMsrpCents: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  wheelbaseIn: number;
  frontTrackIn: number;
  rearTrackIn: number;
  groundClearanceIn: number;
  curbWeightKg: number;
  grossVehicleWeightKg: number;
  cargoVolumeLiters: number;
  seatingCapacity: number;
};

/** US PressClub specs (lbs→kg rounded) + EPA fuel economy. */
const M3_TRIMS: M3Trim[] = [
  {
    slug: "2025-bmw-m3-us",
    name: "M3 Sedan",
    drivetrain: "RWD",
    transmissionSlug: "bmw-6-speed-manual",
    imageDokNo: "P90550995",
    epaId: "47976",
    cityMpg: 16,
    highwayMpg: 23,
    combinedMpg: 19,
    powerHp: 473,
    torqueLbFt: 406,
    zeroToSixtySeconds: 4.1,
    topSpeedMph: 155,
    baseMsrpCents: 7600000,
    lengthIn: 189.1,
    widthIn: 74.3,
    heightIn: 56.6,
    wheelbaseIn: 112.5,
    frontTrackIn: 63.7,
    rearTrackIn: 63.2,
    groundClearanceIn: 4.7,
    curbWeightKg: 1742,
    grossVehicleWeightKg: 2210,
    cargoVolumeLiters: 479,
    seatingCapacity: 5,
  },
  {
    slug: "2025-bmw-m3-competition-us",
    name: "M3 Competition",
    drivetrain: "RWD",
    transmissionSlug: "bmw-8-speed-m-steptronic-drivelogic",
    imageDokNo: "P90550998",
    epaId: "47977",
    cityMpg: 16,
    highwayMpg: 23,
    combinedMpg: 19,
    powerHp: 503,
    torqueLbFt: 479,
    zeroToSixtySeconds: 3.8,
    topSpeedMph: 155,
    baseMsrpCents: 8020000,
    lengthIn: 189.1,
    widthIn: 74.3,
    heightIn: 56.6,
    wheelbaseIn: 112.5,
    frontTrackIn: 63.7,
    rearTrackIn: 63.2,
    groundClearanceIn: 4.7,
    curbWeightKg: 1765,
    grossVehicleWeightKg: 2210,
    cargoVolumeLiters: 479,
    seatingCapacity: 5,
  },
  {
    slug: "2025-bmw-m3-competition-xdrive-us",
    name: "M3 Competition xDrive Sedan",
    drivetrain: "AWD",
    transmissionSlug: "bmw-8-speed-m-steptronic-drivelogic",
    imageDokNo: "P90551001",
    epaId: "47978",
    cityMpg: 16,
    highwayMpg: 23,
    combinedMpg: 18,
    powerHp: 523,
    torqueLbFt: 479,
    zeroToSixtySeconds: 3.4,
    topSpeedMph: 155,
    baseMsrpCents: 8530000,
    lengthIn: 189.1,
    widthIn: 74.3,
    heightIn: 56.6,
    wheelbaseIn: 112.5,
    frontTrackIn: 63.7,
    rearTrackIn: 63.2,
    groundClearanceIn: 4.8,
    curbWeightKg: 1810,
    grossVehicleWeightKg: 2260,
    cargoVolumeLiters: 479,
    seatingCapacity: 5,
  },
];

export async function seedBmw3Series(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const effectiveAt = pricingDate ?? PRICING_DATE;
  const seeded: string[] = [];
  const skipped: string[] = [];

  const model = await prisma.vehicleModel.upsert({
    where: { slug: "bmw-3-series" },
    create: {
      manufacturerId,
      name: "3 Series",
      slug: "bmw-3-series",
    },
    update: { manufacturerId, name: "3 Series" },
  });

  const g20Generation = await prisma.vehicleGeneration.upsert({
    where: { modelId_code: { modelId: model.id, code: "G20" } },
    create: {
      modelId: model.id,
      code: "G20",
      displayName: "Seventh generation (G20)",
      startYear: 2019,
    },
    update: { displayName: "Seventh generation (G20)", startYear: 2019 },
  });

  const g20ModelYear = await prisma.modelYear.upsert({
    where: {
      generationId_year: { generationId: g20Generation.id, year: 2025 },
    },
    create: { generationId: g20Generation.id, year: 2025 },
    update: {},
  });

  const b48 = await prisma.engine.upsert({
    where: { slug: "bmw-b48b20o2" },
    create: {
      manufacturerId,
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
      manufacturerId,
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
      manufacturerId,
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
      manufacturerId,
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

  const g20PressSource = await prisma.source.upsert({
    where: { slug: "bmw-2025-3-series-press-release" },
    create: {
      slug: "bmw-2025-3-series-press-release",
      title: "The new 2025 BMW 3 Series.",
      publisher: "BMW Group",
      url: "https://www.press.bmwgroup.com/usa/article/detail/T0442407EN_US/the-new-2025-bmw-3-series",
      type: "PRESS_RELEASE",
      publishedAt: new Date("2024-05-29T00:00:00.000Z"),
    },
    update: {
      title: "The new 2025 BMW 3 Series.",
      publisher: "BMW Group",
      url: "https://www.press.bmwgroup.com/usa/article/detail/T0442407EN_US/the-new-2025-bmw-3-series",
      type: "PRESS_RELEASE",
      publishedAt: new Date("2024-05-29T00:00:00.000Z"),
    },
  });

  const engineBySlug = {
    "bmw-b48b20o2": b48,
    "bmw-b58b30m2": b58,
  } as const;

  for (const trim of G20_CORE_TRIMS) {
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

    await assertImageOk(trim.imageDokNo);
    const imageSource = await ensureImageSource(prisma, trim.imageDokNo);
    const imageUrl = mediapoolUrl(trim.imageDokNo);
    const engine = engineBySlug[trim.engineSlug];
    const transmission =
      trim.transmissionSlug === "bmw-8-speed-steptronic" ? steptronic : mSteptronic;

    const fuelSource = await prisma.source.upsert({
      where: { slug: trim.fuelSourceSlug },
      create: {
        slug: trim.fuelSourceSlug,
        title: trim.fuelSourceTitle,
        publisher: "U.S. Department of Energy and U.S. Environmental Protection Agency",
        url: `https://www.fueleconomy.gov/ws/rest/vehicle/${trim.epaId}`,
        type: "GOVERNMENT",
      },
      update: {
        title: trim.fuelSourceTitle,
        publisher: "U.S. Department of Energy and U.S. Environmental Protection Agency",
        url: `https://www.fueleconomy.gov/ws/rest/vehicle/${trim.epaId}`,
        type: "GOVERNMENT",
      },
    });

    const vehicle = await prisma.vehicle.upsert({
      where: { slug: trim.slug },
      create: {
        slug: trim.slug,
        modelYearId: g20ModelYear.id,
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
        modelYearId: g20ModelYear.id,
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
      lengthIn: trim.lengthIn,
      widthIn: trim.widthIn,
      heightIn: trim.heightIn,
      wheelbaseIn: trim.wheelbaseIn,
      frontTrackIn: trim.frontTrackIn,
      rearTrackIn: trim.rearTrackIn,
      groundClearanceIn: trim.groundClearanceIn,
      curbWeightKg: trim.curbWeightKg,
      grossVehicleWeightKg: trim.grossVehicleWeightKg,
      cargoVolumeLiters: trim.cargoVolumeLiters,
      seatingCapacity: trim.seatingCapacity,
    };

    const performanceData = {
      powerHp: trim.powerHp,
      torqueLbFt: trim.torqueLbFt,
      zeroToSixtySeconds: trim.zeroToSixtySeconds,
      topSpeedMph: trim.topSpeedMph,
    };

    const fuelData = {
      cityMpg: trim.cityMpg,
      highwayMpg: trim.highwayMpg,
      combinedMpg: trim.combinedMpg,
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
            alt: `2025 BMW ${trim.name} Sedan exterior`,
            credit: "BMW Group",
            position: 0,
          },
          update: {
            sourceId: imageSource.id,
            url: imageUrl,
            alt: `2025 BMW ${trim.name} Sedan exterior`,
            credit: "BMW Group",
          },
        }),
      ]);

    await Promise.all([
      upsertCitation(
        prisma,
        g20PressSource.id,
        "VehicleDimensions",
        dimensions.id,
        "specifications",
        `Specifications: ${trim.name}`,
      ),
      upsertCitation(
        prisma,
        g20PressSource.id,
        "VehiclePerformance",
        performance.id,
        "specifications",
        `Specifications: ${trim.name}`,
      ),
      upsertCitation(
        prisma,
        g20PressSource.id,
        "VehiclePrice",
        basePrice.id,
        "amountCents",
        "Base MSRP",
      ),
      upsertCitation(
        prisma,
        g20PressSource.id,
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
        `PressClub image ${trim.imageDokNo}`,
      ),
    ]);

    await ensureAudit(prisma, importerId, vehicle.id, trim.slug);
    seeded.push(trim.slug);
  }

  const generation = await prisma.vehicleGeneration.upsert({
    where: { modelId_code: { modelId: model.id, code: "G80" } },
    create: {
      modelId: model.id,
      code: "G80",
      displayName: "Sixth generation M3 (G80)",
      startYear: 2021,
    },
    update: { displayName: "Sixth generation M3 (G80)", startYear: 2021 },
  });

  const modelYear = await prisma.modelYear.upsert({
    where: { generationId_year: { generationId: generation.id, year: 2025 } },
    create: { generationId: generation.id, year: 2025 },
    update: {},
  });

  const engine = await prisma.engine.upsert({
    where: { slug: "bmw-s58b30t0" },
    create: {
      manufacturerId,
      slug: "bmw-s58b30t0",
      name: "S58B30T0",
      code: "S58B30T0",
      fuelType: "PETROL",
      displacementCc: 2993,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Twin mono-scroll turbochargers",
    },
    update: {
      manufacturerId,
      name: "S58B30T0",
      code: "S58B30T0",
      fuelType: "PETROL",
      displacementCc: 2993,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Twin mono-scroll turbochargers",
    },
  });

  const manual6 = await prisma.transmission.upsert({
    where: { slug: "bmw-6-speed-manual" },
    create: {
      slug: "bmw-6-speed-manual",
      name: "6-speed manual",
      type: "MANUAL",
      gearCount: 6,
    },
    update: { name: "6-speed manual", type: "MANUAL", gearCount: 6 },
  });

  const transmissionBySlug = {
    "bmw-6-speed-manual": manual6,
    "bmw-8-speed-m-steptronic-drivelogic": mSteptronic,
  } as const;

  const pressSource = await prisma.source.upsert({
    where: { slug: "bmw-2025-m3-press-release" },
    create: {
      slug: "bmw-2025-m3-press-release",
      title: "The new 2025 BMW M3.",
      publisher: "BMW Group",
      url: "https://www.press.bmwgroup.com/usa/article/detail/T0442408EN_US/the-new-2025-bmw-m3",
      type: "PRESS_RELEASE",
      publishedAt: PRICING_DATE,
    },
    update: {
      title: "The new 2025 BMW M3.",
      publisher: "BMW Group",
      url: "https://www.press.bmwgroup.com/usa/article/detail/T0442408EN_US/the-new-2025-bmw-m3",
      type: "PRESS_RELEASE",
      publishedAt: PRICING_DATE,
    },
  });

  for (const trim of M3_TRIMS) {
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

    await assertImageOk(trim.imageDokNo);
    const imageSource = await ensureImageSource(prisma, trim.imageDokNo);
    const imageUrl = mediapoolUrl(trim.imageDokNo);
    const transmission = transmissionBySlug[trim.transmissionSlug];

    const fuelSource = await prisma.source.upsert({
      where: { slug: `epa-2025-bmw-${trim.slug.replace(/^2025-bmw-/, "").replace(/-us$/, "")}` },
      create: {
        slug: `epa-2025-bmw-${trim.slug.replace(/^2025-bmw-/, "").replace(/-us$/, "")}`,
        title: `2025 BMW ${trim.name} fuel economy data`,
        publisher: "U.S. Department of Energy and U.S. Environmental Protection Agency",
        url: `https://www.fueleconomy.gov/ws/rest/vehicle/${trim.epaId}`,
        type: "GOVERNMENT",
      },
      update: {
        title: `2025 BMW ${trim.name} fuel economy data`,
        publisher: "U.S. Department of Energy and U.S. Environmental Protection Agency",
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
      lengthIn: trim.lengthIn,
      widthIn: trim.widthIn,
      heightIn: trim.heightIn,
      wheelbaseIn: trim.wheelbaseIn,
      frontTrackIn: trim.frontTrackIn,
      rearTrackIn: trim.rearTrackIn,
      groundClearanceIn: trim.groundClearanceIn,
      curbWeightKg: trim.curbWeightKg,
      grossVehicleWeightKg: trim.grossVehicleWeightKg,
      cargoVolumeLiters: trim.cargoVolumeLiters,
      seatingCapacity: trim.seatingCapacity,
    };

    const performanceData = {
      powerHp: trim.powerHp,
      torqueLbFt: trim.torqueLbFt,
      zeroToSixtySeconds: trim.zeroToSixtySeconds,
      topSpeedMph: trim.topSpeedMph,
    };

    const fuelData = {
      cityMpg: trim.cityMpg,
      highwayMpg: trim.highwayMpg,
      combinedMpg: trim.combinedMpg,
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
        pressSource.id,
        "VehicleDimensions",
        dimensions.id,
        "specifications",
        "Specifications",
      ),
      upsertCitation(
        prisma,
        pressSource.id,
        "VehiclePerformance",
        performance.id,
        "specifications",
        "Specifications",
      ),
      upsertCitation(
        prisma,
        pressSource.id,
        "VehiclePrice",
        basePrice.id,
        "amountCents",
        "Base MSRP",
      ),
      upsertCitation(
        prisma,
        pressSource.id,
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
        `PressClub image ${trim.imageDokNo}`,
      ),
    ]);

    await ensureAudit(prisma, importerId, vehicle.id, trim.slug);
    seeded.push(trim.slug);
  }

  return { seeded, skipped };
}
