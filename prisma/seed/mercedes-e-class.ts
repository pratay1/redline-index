/**
 * Mercedes-Benz E-Class (W214) US MY 2025 seed module.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Sources:
 * - EPA: 48498 (E350), 48499 (E350 4matic), 48185 (E450 4matic),
 *   48198 (E450 All-Terrain), 49019 (AMG E53 Hybrid 4matic Plus)
 * - MSRP / dims / performance: Edmunds 2025 E-Class features & specs;
 *   MBUSA model pages (track, 0–60); Car and Driver All-Terrain test
 * - Photos: Wikimedia Commons exteriors, Mercedes-Benz Media UK,
 *   Autoevolution AMG still, Car and Driver All-Terrain gallery
 */
import type { SeedCtx } from "./mercedes-shared";
import {
  MERCEDES_DESTINATION_CENTS,
  RESERVED_MERCEDES_IMAGE_URLS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureMercedesEngine,
  ensureMercedesManufacturer,
  upsertCitation,
} from "./mercedes-shared";

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
  bodyStyle: "SEDAN" | "WAGON";
  drivetrain: "RWD" | "AWD";
  imageUrl: string;
  imagePageUrl: string;
  imageSourceSlug: string;
  imageCredit: string;
  epaId: string;
  engineSlug:
    | "mercedes-m254-e350"
    | "mercedes-m256-e450"
    | "mercedes-m256-amg-e53-phev";
  dimensions: {
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    wheelbaseIn: number;
    frontTrackIn: number;
    rearTrackIn: number;
    groundClearanceIn?: number;
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
  fuelEconomy: FuelEconomySeed;
  baseMsrpCents: number;
  pressSourceSlug: string;
  priceSourceSlug: string;
};

const PRESS_SOURCES = [
  {
    slug: "edmunds-2025-mercedes-e-class-specs",
    title: "2025 Mercedes-Benz E-Class Specs & Features",
    url: "https://www.edmunds.com/mercedes-benz/e-class/2025/features-specs/",
    publisher: "Edmunds",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2025-mercedes-e-class-trims",
    title: "2025 Mercedes-Benz E-Class Trims Comparison",
    url: "https://www.edmunds.com/mercedes-benz/e-class/2025/trims/",
    publisher: "Edmunds",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "mbusa-2025-e350-sedan-specs",
    title: "Mercedes-Benz E 350 Sedan — dimensions & performance",
    url: "https://www.mbusa.com/en/vehicles/model/e-class/sedan/e350w",
    publisher: "Mercedes-Benz USA",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "mbusa-2025-e450-4matic-sedan-specs",
    title: "Mercedes-Benz E 450 4MATIC Sedan — dimensions & performance",
    url: "https://www.mbusa.com/en/vehicles/model/e-class/sedan/e450w4",
    publisher: "Mercedes-Benz USA",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "mbusa-2025-e450-all-terrain-specs",
    title: "Mercedes-Benz E 450 4MATIC All-Terrain Wagon — dimensions & performance",
    url: "https://www.mbusa.com/en/vehicles/model/e-class/wagon/e450s4",
    publisher: "Mercedes-Benz USA",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "mbusa-2025-amg-e53-hybrid-specs",
    title: "Mercedes-AMG E 53 HYBRID Sedan — dimensions & performance",
    url: "https://www.mbusa.com/en/vehicles/model/e-class/sedan/e53ew4",
    publisher: "Mercedes-Benz USA",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "caranddriver-2025-e450-all-terrain-test",
    title: "Tested: 2025 Mercedes-Benz E450 All-Terrain Wagon",
    url: "https://www.caranddriver.com/reviews/a69106509/2025-mercedes-benz-e450-all-terrain-test/",
    publisher: "Car and Driver",
    type: "THIRD_PARTY" as const,
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "edmunds-2025-mercedes-e-class-msrp",
    title: "2025 Mercedes-Benz E-Class base MSRP (features & specs)",
    url: "https://www.edmunds.com/mercedes-benz/e-class/2025/features-specs/",
    publisher: "Edmunds",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "epa-2025-mercedes-e-class-msrp",
    title: "2025 Mercedes-Benz E-Class EPA listings (MSRP)",
    url: "https://www.fueleconomy.gov/feg/PowerSearch.do?action=noform&baseModel=E-Class&make=Mercedes-Benz&year1=2025&year2=2025&srchtyp=ymm",
    publisher: "U.S. Department of Energy / EPA",
    type: "GOVERNMENT" as const,
  },
] as const;

/** Shared W214 sedan footprint (MBUSA / Edmunds). */
const SEDAN_TRACK = { frontTrackIn: 64.1, rearTrackIn: 64.7 } as const;

const TRIMS: TrimSeed[] = [
  {
    slug: "2025-mercedes-e-350-us",
    name: "E 350",
    bodyStyle: "SEDAN",
    drivetrain: "RWD",
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my25/e-class/e-sedan/dimensions/2025-E350-SEDAN-SFB-DR.png",
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:Mercedes-Benz_W214_1X7A1841.jpg",
    imageSourceSlug: "commons-mercedes-w214-1x7a1841",
    imageCredit: "Alexander-93 / Wikimedia Commons",
    epaId: "48498",
    engineSlug: "mercedes-m254-e350",
    dimensions: {
      lengthIn: 194.9,
      widthIn: 74.0,
      heightIn: 57.9,
      wheelbaseIn: 116.6,
      ...SEDAN_TRACK,
      curbWeightKg: lbsToKg(4134),
      cargoVolumeLiters: cuFtToLiters(12.7),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 6.1,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 25, highwayMpg: 33, combinedMpg: 28 },
    baseMsrpCents: 6_245_000,
    pressSourceSlug: "mbusa-2025-e350-sedan-specs",
    priceSourceSlug: "edmunds-2025-mercedes-e-class-msrp",
  },
  {
    slug: "2025-mercedes-e-350-4matic-us",
    name: "E 350 4MATIC",
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my25/e-class/e-sedan/dimensions/2025-E350-4M-SEDAN-SFB-DR.png",
    imagePageUrl:
      "https://mercedes-benz-media.co.uk/en-gb/models/all-models-saloons-e-class-saloon",
    imageSourceSlug: "mb-media-uk-e-class-saloon-hero-45223",
    imageCredit: "Mercedes-Benz",
    epaId: "48499",
    engineSlug: "mercedes-m254-e350",
    dimensions: {
      lengthIn: 194.9,
      widthIn: 74.0,
      heightIn: 57.9,
      wheelbaseIn: 116.6,
      ...SEDAN_TRACK,
      curbWeightKg: lbsToKg(4189),
      cargoVolumeLiters: cuFtToLiters(12.7),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 6.1,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 24, highwayMpg: 33, combinedMpg: 27 },
    baseMsrpCents: 6_495_000,
    pressSourceSlug: "edmunds-2025-mercedes-e-class-specs",
    priceSourceSlug: "edmunds-2025-mercedes-e-class-msrp",
  },
  {
    slug: "2025-mercedes-e-450-4matic-us",
    name: "E 450 4MATIC",
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/e-class/e-sedan/dimensions/2026-E450-4M-SEDAN-SFB-DR.png",
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:Mercedes-Benz_W214_E_450_4MATIC_EXCLUSIVE_Graphite_Grey_(1).jpg",
    imageSourceSlug: "commons-mercedes-w214-e450-graphite-grey-1",
    imageCredit: "Wikimedia Commons",
    epaId: "48185",
    engineSlug: "mercedes-m256-e450",
    dimensions: {
      lengthIn: 194.9,
      widthIn: 74.0,
      heightIn: 57.9,
      wheelbaseIn: 116.6,
      ...SEDAN_TRACK,
      curbWeightKg: lbsToKg(4376),
      cargoVolumeLiters: cuFtToLiters(12.7),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 375,
      torqueLbFt: 369,
      zeroToSixtySeconds: 4.4,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 22, highwayMpg: 31, combinedMpg: 25 },
    baseMsrpCents: 7_085_000,
    pressSourceSlug: "mbusa-2025-e450-4matic-sedan-specs",
    priceSourceSlug: "edmunds-2025-mercedes-e-class-msrp",
  },
  {
    slug: "2025-mercedes-e-450-4matic-all-terrain-us",
    name: "E 450 4MATIC All-Terrain",
    bodyStyle: "WAGON",
    drivetrain: "AWD",
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/e-class/e-sedan/class-page/series-(ncm)/2026-E-SEDAN-HC-M.jpg",
    imagePageUrl:
      "https://www.caranddriver.com/photos/g68903946/2025-mercedes-benz-e450-wagon-test-exterior-gallery/",
    imageSourceSlug: "caranddriver-2025-e450-all-terrain-exterior-353",
    imageCredit: "Car and Driver / Hearst Autos",
    epaId: "48198",
    engineSlug: "mercedes-m256-e450",
    dimensions: {
      lengthIn: 194.9,
      widthIn: 74.4,
      heightIn: 58.9,
      wheelbaseIn: 116.6,
      ...SEDAN_TRACK,
      groundClearanceIn: 6.4,
      curbWeightKg: lbsToKg(4575),
      cargoVolumeLiters: cuFtToLiters(33.1),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 375,
      torqueLbFt: 369,
      zeroToSixtySeconds: 4.6,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 22, highwayMpg: 31, combinedMpg: 25 },
    baseMsrpCents: 7_610_000,
    pressSourceSlug: "mbusa-2025-e450-all-terrain-specs",
    priceSourceSlug: "edmunds-2025-mercedes-e-class-msrp",
  },
  {
    slug: "2025-mercedes-amg-e-53-us",
    name: "AMG E 53 HYBRID 4MATIC+",
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/e-class/e-sedan/class-page/series-(ncm)/2026-E-SEDAN-EH-1.jpg",
    imagePageUrl: "https://www.autoevolution.com/cars/mercedes-amg-e53-hybrid-2024.html",
    imageSourceSlug: "autoevolution-mercedes-amg-e53-hybrid-2024-main",
    imageCredit: "Autoevolution / Mercedes-Benz",
    epaId: "49019",
    engineSlug: "mercedes-m256-amg-e53-phev",
    dimensions: {
      lengthIn: 194.9,
      widthIn: 74.0,
      heightIn: 57.9,
      wheelbaseIn: 116.6,
      ...SEDAN_TRACK,
      curbWeightKg: lbsToKg(4244),
      cargoVolumeLiters: cuFtToLiters(13.1),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 577,
      torqueLbFt: 553,
      zeroToSixtySeconds: 3.9,
      topSpeedMph: 155,
    },
    fuelEconomy: {
      cityMpg: 21,
      highwayMpg: 26,
      combinedMpg: 23,
      electricRangeMiles: 43,
    },
    baseMsrpCents: 8_800_000,
    pressSourceSlug: "mbusa-2025-amg-e53-hybrid-specs",
    priceSourceSlug: "edmunds-2025-mercedes-e-class-msrp",
  },
];

const SKIPPED_TRIMS = [
  "E 200 (EU-only; not offered US MY 2025)",
  "E 220d (EU diesel; not offered US MY 2025)",
  "E 250 (not offered US MY 2025)",
  "E 300 (EU-market naming; not offered US MY 2025)",
  "E 350e (EU PHEV naming; US MY 2025 PHEV is AMG E 53 HYBRID)",
  "E 400 (discontinued / not offered US MY 2025 W214)",
  "AMG E 43 (prior generation; not offered US MY 2025 W214)",
  "AMG E 63 (not offered US MY 2025 W214)",
  "AMG E 63 S (not offered US MY 2025 W214)",
] as const;

export async function seedMercedesEClass(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, pricingDate } = ctx;
  const effectiveAt = pricingDate;
  const seeded: string[] = [];
  const skipped: string[] = [...SKIPPED_TRIMS];

  const manufacturer = await ensureMercedesManufacturer(prisma);
  const manufacturerId = manufacturer.id;

  const model = await prisma.vehicleModel.upsert({
    where: { slug: "mercedes-e-class" },
    create: {
      manufacturerId,
      name: "E-Class",
      slug: "mercedes-e-class",
    },
    update: { manufacturerId, name: "E-Class" },
  });

  const generation = await prisma.vehicleGeneration.upsert({
    where: { modelId_code: { modelId: model.id, code: "W214" } },
    create: {
      modelId: model.id,
      code: "W214",
      displayName: "Sixth generation (W214)",
      startYear: 2023,
    },
    update: {
      displayName: "Sixth generation (W214)",
      startYear: 2023,
    },
  });

  const modelYear = await prisma.modelYear.upsert({
    where: { generationId_year: { generationId: generation.id, year: 2025 } },
    create: { generationId: generation.id, year: 2025 },
    update: {},
  });

  const m254 = await ensureMercedesEngine(prisma, {
    manufacturerId,
    slug: "mercedes-m254-e350",
    name: "M254 2.0L turbo I4 mild hybrid",
    code: "M254",
    fuelType: "PETROL",
    displacementCc: 1999,
    cylinderCount: 4,
    configuration: "Inline",
    induction: "Turbocharged",
    electrification: "48V mild hybrid",
  });

  const m256 = await ensureMercedesEngine(prisma, {
    manufacturerId,
    slug: "mercedes-m256-e450",
    name: "M256 3.0L turbo I6 mild hybrid",
    code: "M256",
    fuelType: "PETROL",
    displacementCc: 2999,
    cylinderCount: 6,
    configuration: "Inline",
    induction: "Turbocharged / electric auxiliary compressor",
    electrification: "48V mild hybrid",
  });

  const m256Phev = await ensureMercedesEngine(prisma, {
    manufacturerId,
    slug: "mercedes-m256-amg-e53-phev",
    name: "AMG M256 3.0L turbo I6 PHEV",
    code: "M256-AMG-E53",
    fuelType: "PLUG_IN_HYBRID",
    displacementCc: 2999,
    cylinderCount: 6,
    configuration: "Inline",
    induction: "Turbocharged",
    electrification: "Plug-in hybrid (AMG E 53 HYBRID)",
  });

  const engineBySlug = {
    "mercedes-m254-e350": m254,
    "mercedes-m256-e450": m256,
    "mercedes-m256-amg-e53-phev": m256Phev,
  } as const;

  const transmission = await prisma.transmission.upsert({
    where: { slug: "mercedes-9g-tronic" },
    create: {
      slug: "mercedes-9g-tronic",
      name: "9G-TRONIC 9-speed automatic",
      type: "AUTOMATIC",
      gearCount: 9,
    },
    update: {
      name: "9G-TRONIC 9-speed automatic",
      type: "AUTOMATIC",
      gearCount: 9,
    },
  });

  const pressSources = new Map<string, { id: string }>();
  for (const sourceData of PRESS_SOURCES) {
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

    const pressSource = pressSources.get(trim.pressSourceSlug);
    const priceSource = priceSources.get(trim.priceSourceSlug);
    if (!pressSource || !priceSource) {
      skipped.push(`${trim.slug} (missing source wiring)`);
      continue;
    }

    await assertImageUrlOk(trim.imageUrl);
    RESERVED_MERCEDES_IMAGE_URLS.add(trim.imageUrl);

    const imageSource = await ensureImageSource(prisma, {
      slug: trim.imageSourceSlug,
      title: `2025 Mercedes-Benz ${trim.name} exterior`,
      pageUrl: trim.imagePageUrl,
    });

    const engine = engineBySlug[trim.engineSlug];

    const fuelSource = await prisma.source.upsert({
      where: {
        slug: `epa-2025-mercedes-${trim.slug.replace(/^2025-mercedes-/, "").replace(/-us$/, "")}`,
      },
      create: {
        slug: `epa-2025-mercedes-${trim.slug.replace(/^2025-mercedes-/, "").replace(/-us$/, "")}`,
        title: `2025 Mercedes-Benz ${trim.name} fuel economy data`,
        publisher:
          "U.S. Department of Energy and U.S. Environmental Protection Agency",
        url: `https://www.fueleconomy.gov/ws/rest/vehicle/${trim.epaId}`,
        type: "GOVERNMENT",
      },
      update: {
        title: `2025 Mercedes-Benz ${trim.name} fuel economy data`,
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
      grossVehicleWeightKg: null,
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
            amountCents: MERCEDES_DESTINATION_CENTS,
            currency: "USD",
            effectiveAt,
          },
          update: {
            amountCents: MERCEDES_DESTINATION_CENTS,
            currency: "USD",
          },
        }),
        prisma.vehicleImage.upsert({
          where: { vehicleId_position: { vehicleId: vehicle.id, position: 0 } },
          create: {
            vehicleId: vehicle.id,
            sourceId: imageSource.id,
            url: trim.imageUrl,
            alt: `2025 Mercedes-Benz ${trim.name} exterior`,
            credit: trim.imageCredit,
            position: 0,
          },
          update: {
            sourceId: imageSource.id,
            url: trim.imageUrl,
            alt: `2025 Mercedes-Benz ${trim.name} exterior`,
            credit: trim.imageCredit,
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
        trim.imagePageUrl,
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
      `${trim.slug} | EPA=${trim.epaId} | image=${trim.imageUrl}`,
    );
  }

  return { seeded, skipped };
}
