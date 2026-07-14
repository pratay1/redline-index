/**
 * BMW 5 Series / M5 US MY 2025 seed module.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Sources:
 * - Press 5 Series launch: https://www.press.bmwgroup.com/usa/article/detail/T0418778EN_US/the-all-new-2024-bmw-5-series
 * - Press 550e announce: https://www.press.bmwgroup.com/usa/article/detail/T0439355EN_US/bmw-model-update-measures-for-spring-2024
 * - Press M5: https://www.press.bmwgroup.com/usa/article/detail/T0443395EN_US/the-all-new-2025-bmw-m5
 * - Press M5 Touring: https://www.press.bmwgroup.com/usa/article/detail/T0444418EN_US/the-all-new-2025-bmw-m5-touring
 * - EPA: 48175, 48176, 48177, 49005, 49006, 49007
 * - MSRP cross-check (non-M): Edmunds / TrueDelta 2025 5 Series base prices
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

type FuelEconomySeed = {
  cityMpg: number;
  highwayMpg: number;
  combinedMpg: number;
  electricRangeMiles?: number;
};

type TrimSeed = {
  slug: string;
  name: string;
  generationCode: "G60" | "G90" | "G99";
  generationLabel: string;
  generationStartYear: number;
  bodyStyle: "SEDAN" | "WAGON";
  drivetrain: "RWD" | "AWD";
  dokNo: string;
  epaId: string;
  engineSlug: string;
  transmissionSlug: "bmw-8-speed-steptronic" | "bmw-8-speed-m-steptronic-drivelogic";
  dimensions: {
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    wheelbaseIn: number;
    frontTrackIn: number;
    rearTrackIn: number;
    groundClearanceIn?: number;
    curbWeightKg: number;
    grossVehicleWeightKg?: number;
    cargoVolumeLiters: number;
    seatingCapacity: number;
  };
  performance: {
    powerHp: number;
    torqueLbFt: number;
    zeroToSixtySeconds: number;
    topSpeedMph: number;
  };
  fuelEconomy: FuelEconomySeed;
  baseMsrpCents: number;
  pressSourceSlug: string;
  priceSourceSlug: string;
};

const PRESS_SOURCES = [
  {
    slug: "bmw-2024-5-series-press-release",
    title: "The All-New 2024 BMW 5 Series.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0418778EN_US/the-all-new-2024-bmw-5-series",
    publishedAt: new Date("2023-05-24T00:00:00.000Z"),
  },
  {
    slug: "bmw-2024-spring-model-update-press-release",
    title: "BMW model update measures for spring 2024.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0439355EN_US/bmw-model-update-measures-for-spring-2024",
    publishedAt: new Date("2024-01-30T00:00:00.000Z"),
  },
  {
    slug: "bmw-2025-m5-press-release",
    title: "The All-New 2025 BMW M5.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0443395EN_US/the-all-new-2025-bmw-m5",
    publishedAt: new Date("2024-06-25T00:00:00.000Z"),
  },
  {
    slug: "bmw-2025-m5-touring-press-release",
    title: "The All-New 2025 BMW M5 Touring.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0444418EN_US/the-all-new-2025-bmw-m5-touring",
    publishedAt: new Date("2024-08-15T00:00:00.000Z"),
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "edmunds-2025-bmw-5-series-msrp",
    title: "2025 BMW 5 Series specs & features (base MSRP)",
    url: "https://www.edmunds.com/bmw/5-series/2025/features-specs/",
    type: "THIRD_PARTY" as const,
    publisher: "Edmunds",
  },
  {
    slug: "bmw-2025-m5-press-release-msrp",
    title: "The All-New 2025 BMW M5. (base MSRP)",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0443395EN_US/the-all-new-2025-bmw-m5",
    type: "PRESS_RELEASE" as const,
    publisher: "BMW Group",
  },
  {
    slug: "bmw-2025-m5-touring-press-release-msrp",
    title: "The All-New 2025 BMW M5 Touring. (base MSRP)",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0444418EN_US/the-all-new-2025-bmw-m5-touring",
    type: "PRESS_RELEASE" as const,
    publisher: "BMW Group",
  },
] as const;

const TRIMS: TrimSeed[] = [
  {
    slug: "2025-bmw-530i-us",
    name: "530i Sedan",
    generationCode: "G60",
    generationLabel: "Eighth generation (G60)",
    generationStartYear: 2024,
    bodyStyle: "SEDAN",
    drivetrain: "RWD",
    dokNo: "P90505146",
    epaId: "48175",
    engineSlug: "bmw-b48b20o2",
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 199.2,
      widthIn: 74.8,
      heightIn: 59.6,
      wheelbaseIn: 117.9,
      frontTrackIn: 63.9,
      rearTrackIn: 65.2,
      groundClearanceIn: 6.1,
      curbWeightKg: lbsToKg(4041),
      grossVehicleWeightKg: lbsToKg(5192),
      cargoVolumeLiters: cuFtToLiters(18.4),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.9,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 28, highwayMpg: 35, combinedMpg: 31 },
    baseMsrpCents: 5_870_000,
    pressSourceSlug: "bmw-2024-5-series-press-release",
    priceSourceSlug: "edmunds-2025-bmw-5-series-msrp",
  },
  {
    slug: "2025-bmw-530i-xdrive-us",
    name: "530i xDrive Sedan",
    generationCode: "G60",
    generationLabel: "Eighth generation (G60)",
    generationStartYear: 2024,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    dokNo: "P90505140",
    epaId: "48176",
    engineSlug: "bmw-b48b20o2",
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 199.2,
      widthIn: 74.8,
      heightIn: 59.6,
      wheelbaseIn: 117.9,
      frontTrackIn: 63.9,
      rearTrackIn: 65.2,
      groundClearanceIn: 6.1,
      curbWeightKg: lbsToKg(4158),
      grossVehicleWeightKg: lbsToKg(5324),
      cargoVolumeLiters: cuFtToLiters(18.4),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.8,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 27, highwayMpg: 35, combinedMpg: 30 },
    baseMsrpCents: 6_100_000,
    pressSourceSlug: "bmw-2024-5-series-press-release",
    priceSourceSlug: "edmunds-2025-bmw-5-series-msrp",
  },
  {
    slug: "2025-bmw-540i-xdrive-us",
    name: "540i xDrive Sedan",
    generationCode: "G60",
    generationLabel: "Eighth generation (G60)",
    generationStartYear: 2024,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    dokNo: "P90505141",
    epaId: "48177",
    engineSlug: "bmw-b58b30m2",
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      // Shared G60 body dimensions from PressClub launch specs; curb from Edmunds/C&D.
      lengthIn: 199.2,
      widthIn: 74.8,
      heightIn: 59.6,
      wheelbaseIn: 117.9,
      frontTrackIn: 63.9,
      rearTrackIn: 65.2,
      groundClearanceIn: 6.1,
      curbWeightKg: lbsToKg(4370),
      cargoVolumeLiters: cuFtToLiters(18.4),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 375,
      torqueLbFt: 398,
      zeroToSixtySeconds: 4.4,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 26, highwayMpg: 33, combinedMpg: 28 },
    baseMsrpCents: 6_580_000,
    pressSourceSlug: "bmw-2024-5-series-press-release",
    priceSourceSlug: "edmunds-2025-bmw-5-series-msrp",
  },
  {
    slug: "2025-bmw-550e-xdrive-us",
    name: "550e xDrive Sedan",
    generationCode: "G60",
    generationLabel: "Eighth generation (G60)",
    generationStartYear: 2024,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    dokNo: "P90505142",
    epaId: "49005",
    engineSlug: "bmw-b58-550e-phev",
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 199.2,
      widthIn: 74.8,
      heightIn: 59.6,
      wheelbaseIn: 117.9,
      frontTrackIn: 63.9,
      rearTrackIn: 65.2,
      curbWeightKg: lbsToKg(4894),
      cargoVolumeLiters: cuFtToLiters(18.4),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 483,
      torqueLbFt: 516,
      zeroToSixtySeconds: 4.0,
      topSpeedMph: 155,
    },
    fuelEconomy: {
      cityMpg: 23,
      highwayMpg: 26,
      combinedMpg: 24,
      electricRangeMiles: 34,
    },
    baseMsrpCents: 7_340_000,
    pressSourceSlug: "bmw-2024-spring-model-update-press-release",
    priceSourceSlug: "edmunds-2025-bmw-5-series-msrp",
  },
  {
    slug: "2025-bmw-m5-us",
    name: "M5 Sedan",
    generationCode: "G90",
    generationLabel: "Seventh generation M5 (G90)",
    generationStartYear: 2025,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    dokNo: "P90557399",
    epaId: "49006",
    engineSlug: "bmw-s68b44t0",
    transmissionSlug: "bmw-8-speed-m-steptronic-drivelogic",
    dimensions: {
      lengthIn: 200.6,
      widthIn: 77.6,
      heightIn: 59.4,
      wheelbaseIn: 118.3,
      frontTrackIn: 66.3,
      rearTrackIn: 65.4,
      groundClearanceIn: 5.0,
      curbWeightKg: lbsToKg(5390),
      grossVehicleWeightKg: lbsToKg(6482),
      cargoVolumeLiters: cuFtToLiters(16.5),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 717,
      torqueLbFt: 738,
      zeroToSixtySeconds: 3.4,
      topSpeedMph: 155,
    },
    fuelEconomy: {
      cityMpg: 12,
      highwayMpg: 17,
      combinedMpg: 14,
      electricRangeMiles: 27,
    },
    baseMsrpCents: 11_950_000,
    pressSourceSlug: "bmw-2025-m5-press-release",
    priceSourceSlug: "bmw-2025-m5-press-release-msrp",
  },
  {
    slug: "2025-bmw-m5-touring-us",
    name: "M5 Touring",
    generationCode: "G99",
    generationLabel: "Seventh generation M5 Touring (G99)",
    generationStartYear: 2025,
    bodyStyle: "WAGON",
    drivetrain: "AWD",
    dokNo: "P90564722",
    epaId: "49007",
    engineSlug: "bmw-s68b44t0",
    transmissionSlug: "bmw-8-speed-m-steptronic-drivelogic",
    dimensions: {
      lengthIn: 200.6,
      widthIn: 77.6,
      heightIn: 59.7,
      wheelbaseIn: 118.3,
      frontTrackIn: 66.3,
      rearTrackIn: 65.4,
      curbWeightKg: lbsToKg(5530),
      cargoVolumeLiters: cuFtToLiters(17.7),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 717,
      torqueLbFt: 738,
      zeroToSixtySeconds: 3.5,
      topSpeedMph: 155,
    },
    fuelEconomy: {
      cityMpg: 11,
      highwayMpg: 17,
      combinedMpg: 13,
      electricRangeMiles: 25,
    },
    baseMsrpCents: 12_150_000,
    pressSourceSlug: "bmw-2025-m5-touring-press-release",
    priceSourceSlug: "bmw-2025-m5-touring-press-release-msrp",
  },
];

export async function seedBmw5Series(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const effectiveAt = pricingDate;
  const seeded: string[] = [];
  const skipped: string[] = [];

  const model = await prisma.vehicleModel.upsert({
    where: { slug: "bmw-5-series" },
    create: {
      manufacturerId,
      name: "5 Series",
      slug: "bmw-5-series",
    },
    update: { manufacturerId, name: "5 Series" },
  });

  const generationByCode = new Map<string, { id: string }>();
  for (const trim of TRIMS) {
    if (generationByCode.has(trim.generationCode)) continue;
    const generation = await prisma.vehicleGeneration.upsert({
      where: {
        modelId_code: { modelId: model.id, code: trim.generationCode },
      },
      create: {
        modelId: model.id,
        code: trim.generationCode,
        displayName: trim.generationLabel,
        startYear: trim.generationStartYear,
      },
      update: {
        displayName: trim.generationLabel,
        startYear: trim.generationStartYear,
      },
    });
    generationByCode.set(trim.generationCode, generation);
  }

  const modelYearByGeneration = new Map<string, { id: string }>();
  for (const [code, generation] of generationByCode) {
    const modelYear = await prisma.modelYear.upsert({
      where: {
        generationId_year: { generationId: generation.id, year: 2025 },
      },
      create: { generationId: generation.id, year: 2025 },
      update: {},
    });
    modelYearByGeneration.set(code, modelYear);
  }

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
      induction: "TwinPower Turbo",
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
      induction: "TwinPower Turbo",
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
      induction: "TwinPower Turbo",
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
      induction: "TwinPower Turbo",
      electrification: "48V mild hybrid",
    },
  });

  const b58Phev = await prisma.engine.upsert({
    where: { slug: "bmw-b58-550e-phev" },
    create: {
      manufacturerId,
      slug: "bmw-b58-550e-phev",
      name: "B58 3.0L PHEV (550e)",
      code: "B58-550e",
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 2998,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "TwinPower Turbo",
      electrification: "Plug-in hybrid (GEN5 eDrive)",
    },
    update: {
      manufacturerId,
      name: "B58 3.0L PHEV (550e)",
      code: "B58-550e",
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 2998,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "TwinPower Turbo",
      electrification: "Plug-in hybrid (GEN5 eDrive)",
    },
  });

  const s68 = await prisma.engine.upsert({
    where: { slug: "bmw-s68b44t0" },
    create: {
      manufacturerId,
      slug: "bmw-s68b44t0",
      name: "S68B44T0",
      code: "S68B44T0",
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 4395,
      cylinderCount: 8,
      configuration: "V",
      induction: "M TwinPower Turbo",
      electrification: "M Hybrid PHEV (GEN5 eDrive)",
    },
    update: {
      manufacturerId,
      name: "S68B44T0",
      code: "S68B44T0",
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 4395,
      cylinderCount: 8,
      configuration: "V",
      induction: "M TwinPower Turbo",
      electrification: "M Hybrid PHEV (GEN5 eDrive)",
    },
  });

  const engineBySlug = {
    "bmw-b48b20o2": b48,
    "bmw-b58b30m2": b58,
    "bmw-b58-550e-phev": b58Phev,
    "bmw-s68b44t0": s68,
  } as const;

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

  const transmissionBySlug = {
    "bmw-8-speed-steptronic": steptronic,
    "bmw-8-speed-m-steptronic-drivelogic": mSteptronic,
  } as const;

  const pressSources = new Map<string, { id: string }>();
  for (const sourceData of PRESS_SOURCES) {
    const source = await prisma.source.upsert({
      where: { url: sourceData.url },
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
        type: "PRESS_RELEASE",
        publishedAt: sourceData.publishedAt,
      },
    });
    pressSources.set(sourceData.slug, source);
  }

  const priceSources = new Map<string, { id: string }>();
  for (const sourceData of PRICE_SOURCES) {
    const source = await prisma.source.upsert({
      where: { url: sourceData.url },
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

    const modelYear = modelYearByGeneration.get(trim.generationCode);
    if (!modelYear) {
      skipped.push(`${trim.slug} (missing model year for ${trim.generationCode})`);
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
    const engine = engineBySlug[trim.engineSlug as keyof typeof engineBySlug];
    const transmission =
      transmissionBySlug[trim.transmissionSlug as keyof typeof transmissionBySlug];

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
        bodyStyle: trim.bodyStyle,
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
        bodyStyle: trim.bodyStyle,
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
      groundClearanceIn: trim.dimensions.groundClearanceIn ?? null,
      curbWeightKg: trim.dimensions.curbWeightKg,
      grossVehicleWeightKg: trim.dimensions.grossVehicleWeightKg ?? null,
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
      electricRangeMiles: trim.fuelEconomy.electricRangeMiles ?? null,
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

    const citationJobs = [
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
        "Specifications / performance",
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
        `PressClub image ${trim.dokNo}`,
      ),
    ];

    if (trim.fuelEconomy.electricRangeMiles != null) {
      citationJobs.push(
        upsertCitation(
          prisma,
          fuelSource.id,
          "VehicleFuelEconomy",
          fuelEconomy.id,
          "electricRangeMiles",
          "EPA electric range (rangeA)",
        ),
      );
    }

    await Promise.all(citationJobs);
    await ensureAudit(prisma, importerId, vehicle.id, trim.slug);
    seeded.push(
      `${trim.slug} | dokNo=${trim.dokNo} | EPA=${trim.epaId} | image=${mediapoolUrl(trim.dokNo)}`,
    );
  }

  return { seeded, skipped };
}
