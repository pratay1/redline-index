/**
 * Mercedes-Benz C-Class (W206) US MY 2025 seed module.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Sources:
 * - MBUSA C 300: https://www.mbusa.com/en/vehicles/model/c-class/sedan/c300w
 * - MBUSA C 300 4MATIC: https://www.mbusa.com/en/vehicles/model/c-class/sedan/c300w4
 * - MBUSA AMG C 43: https://www.mbusa.com/en/vehicles/model/c-class/sedan/c43w4
 * - MBUSA AMG C 63 S E PERFORMANCE: https://www.mbusa.com/en/vehicles/model/c-class/sedan/c63w4se
 * - EPA: 47992 (C300), 47993 (C300 4matic), 48171 (AMG C43), 49018 (AMG C63 S E Performance)
 * - MSRP: EPA / US News 2025 C-Class base prices (destination separate)
 */
import type { SeedCtx } from "./mercedes-shared";
import {
  MERCEDES_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureMercedesEngine,
  upsertCatalogueSource,
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

/** Unique exterior stills — Mojave Silver vs Graphite Grey (Commons); AMG COSY (MBUSA). */
const IMAGE_C300 =
  "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/c-class/dimensions/2026-C300-SEDAN-SFB-DR.png";
const IMAGE_C300_4MATIC =
  "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/c-class/dimensions/2026-C300-4M-SEDAN-SFB-DR.png";
const IMAGE_AMG_C43 =
  "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/c-class/class-page/series-ncm/2026-C-SEDAN-HC-D.jpg";
const IMAGE_AMG_C63 =
  "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/c-class/class-page/series-ncm/2026-C-SEDAN-EH-1.jpg";

type FuelEconomySeed = {
  cityMpg: number;
  highwayMpg: number;
  combinedMpg: number;
  electricRangeMiles?: number;
};

type TrimSeed = {
  slug: string;
  name: string;
  bodyStyle: "SEDAN";
  drivetrain: "RWD" | "AWD";
  imageUrl: string;
  imagePageUrl: string;
  imageCredit: string;
  epaId: string;
  engineSlug: string;
  transmissionSlug: "mercedes-9g-tronic" | "mercedes-amg-speedshift-mct-9";
  dimensions: {
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    wheelbaseIn: number;
    frontTrackIn: number;
    rearTrackIn: number;
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
    slug: "mbusa-2025-c-300-sedan",
    title: "2025 Mercedes-Benz C 300 Sedan — MBUSA specifications",
    url: "https://www.mbusa.com/en/vehicles/model/c-class/sedan/c300w",
    publisher: "Mercedes-Benz USA",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "mbusa-2025-c-300-4matic-sedan",
    title: "2025 Mercedes-Benz C 300 4MATIC Sedan — MBUSA specifications",
    url: "https://www.mbusa.com/en/vehicles/model/c-class/sedan/c300w4",
    publisher: "Mercedes-Benz USA",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "mbusa-2025-amg-c-43-sedan",
    title: "2025 Mercedes-AMG C 43 Sedan — MBUSA specifications",
    url: "https://www.mbusa.com/en/vehicles/model/c-class/sedan/c43w4",
    publisher: "Mercedes-Benz USA",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "mbusa-2025-amg-c-63-s-e-performance-sedan",
    title: "2025 Mercedes-AMG C 63 S E PERFORMANCE Sedan — MBUSA specifications",
    url: "https://www.mbusa.com/en/vehicles/model/c-class/sedan/c63w4se",
    publisher: "Mercedes-Benz USA",
    type: "MANUFACTURER" as const,
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "usnews-2025-mercedes-c-class-msrp",
    title: "2025 Mercedes-Benz C-Class Prices (base MSRP)",
    url: "https://cars.usnews.com/cars-trucks/mercedes-benz/c-class/prices",
    publisher: "U.S. News & World Report",
    type: "THIRD_PARTY" as const,
  },
] as const;

const TRIMS: TrimSeed[] = [
  {
    slug: "2025-mercedes-c-300-us",
    name: "C 300 Sedan",
    bodyStyle: "SEDAN",
    drivetrain: "RWD",
    imageUrl: IMAGE_C300,
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:Mercedes-Benz_W206_C_300_AMG_Line_Mojave_Silver_(1).jpg",
    imageCredit: "Damian B Oh / Wikimedia Commons",
    epaId: "47992",
    engineSlug: "mercedes-m254-c300",
    transmissionSlug: "mercedes-9g-tronic",
    dimensions: {
      lengthIn: 187.0,
      widthIn: 74.4,
      heightIn: 56.6,
      wheelbaseIn: 112.8,
      frontTrackIn: 62.3,
      rearTrackIn: 62.8,
      curbWeightKg: lbsToKg(3825),
      cargoVolumeLiters: cuFtToLiters(11.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 6.0,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 25, highwayMpg: 35, combinedMpg: 29 },
    baseMsrpCents: 4_845_000,
    pressSourceSlug: "mbusa-2025-c-300-sedan",
    priceSourceSlug: "usnews-2025-mercedes-c-class-msrp",
  },
  {
    slug: "2025-mercedes-c-300-4matic-us",
    name: "C 300 4MATIC Sedan",
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    imageUrl: IMAGE_C300_4MATIC,
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:Mercedes-Benz_W206_C_300_4MATIC_AMG_Line_Graphite_Grey_(2).jpg",
    imageCredit: "Damian B Oh / Wikimedia Commons",
    epaId: "47993",
    engineSlug: "mercedes-m254-c300",
    transmissionSlug: "mercedes-9g-tronic",
    dimensions: {
      lengthIn: 187.0,
      widthIn: 74.4,
      heightIn: 56.6,
      wheelbaseIn: 112.8,
      frontTrackIn: 62.3,
      rearTrackIn: 62.8,
      curbWeightKg: lbsToKg(3957),
      cargoVolumeLiters: cuFtToLiters(11.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 6.0,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 24, highwayMpg: 33, combinedMpg: 27 },
    baseMsrpCents: 5_045_000,
    pressSourceSlug: "mbusa-2025-c-300-4matic-sedan",
    priceSourceSlug: "usnews-2025-mercedes-c-class-msrp",
  },
  {
    slug: "2025-mercedes-amg-c-43-us",
    name: "AMG C 43 Sedan",
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    imageUrl: IMAGE_AMG_C43,
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/c-class/sedan/c43w4",
    imageCredit: "Mercedes-Benz USA",
    epaId: "48171",
    engineSlug: "mercedes-m139l-amg-c43",
    transmissionSlug: "mercedes-amg-speedshift-mct-9",
    dimensions: {
      lengthIn: 188.6,
      widthIn: 74.4,
      heightIn: 57.1,
      wheelbaseIn: 112.8,
      frontTrackIn: 62.6,
      rearTrackIn: 63.1,
      curbWeightKg: lbsToKg(4165),
      cargoVolumeLiters: cuFtToLiters(11.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 416,
      torqueLbFt: 369,
      zeroToSixtySeconds: 4.3,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 19, highwayMpg: 27, combinedMpg: 22 },
    baseMsrpCents: 6_250_000,
    pressSourceSlug: "mbusa-2025-amg-c-43-sedan",
    priceSourceSlug: "usnews-2025-mercedes-c-class-msrp",
  },
  {
    slug: "2025-mercedes-amg-c-63-s-e-performance-us",
    name: "AMG C 63 S E PERFORMANCE Sedan",
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    imageUrl: IMAGE_AMG_C63,
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/c-class/sedan/c63w4se",
    imageCredit: "Mercedes-Benz USA",
    epaId: "49018",
    engineSlug: "mercedes-m139l-amg-c63-phev",
    transmissionSlug: "mercedes-amg-speedshift-mct-9",
    dimensions: {
      lengthIn: 190.6,
      widthIn: 74.4,
      heightIn: 57.4,
      wheelbaseIn: 113.1,
      frontTrackIn: 64.9,
      rearTrackIn: 61.9,
      curbWeightKg: lbsToKg(4817),
      cargoVolumeLiters: cuFtToLiters(11.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 671,
      torqueLbFt: 752,
      zeroToSixtySeconds: 3.3,
      topSpeedMph: 155,
    },
    fuelEconomy: {
      cityMpg: 19,
      highwayMpg: 22,
      combinedMpg: 20,
      electricRangeMiles: 1,
    },
    baseMsrpCents: 8_605_000,
    pressSourceSlug: "mbusa-2025-amg-c-63-s-e-performance-sedan",
    priceSourceSlug: "usnews-2025-mercedes-c-class-msrp",
  },
];

const SKIPPED_UNSOURCED = [
  "C 180 (EU-only; not offered US MY 2025)",
  "C 200 (EU-only; not offered US MY 2025)",
  "C 220d (EU diesel; not offered US MY 2025)",
  "C 250 (not offered US MY 2025 / unsourced)",
  "C 300e (EU PHEV; not offered US MY 2025 W206)",
  "C 350e (EU PHEV; not offered US MY 2025 W206)",
  "C 350 (discontinued / not US MY 2025)",
  "C 400 (discontinued / not US MY 2025)",
  "C 43 AMG (deduped → AMG C 43 US naming)",
  "C 450 AMG (prior generation / discontinued)",
  "AMG C 63 (US MY 2025 is AMG C 63 S E PERFORMANCE only)",
];

export async function seedMercedesCClass(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const effectiveAt = pricingDate;
  const seeded: string[] = [];
  const skipped: string[] = [...SKIPPED_UNSOURCED];

  const model = await prisma.vehicleModel.upsert({
    where: { slug: "mercedes-c-class" },
    create: {
      manufacturerId,
      name: "C-Class",
      slug: "mercedes-c-class",
    },
    update: { manufacturerId, name: "C-Class" },
  });

  const generation = await prisma.vehicleGeneration.upsert({
    where: {
      modelId_code: { modelId: model.id, code: "W206" },
    },
    create: {
      modelId: model.id,
      code: "W206",
      displayName: "Sixth generation (W206)",
      startYear: 2022,
    },
    update: {
      displayName: "Sixth generation (W206)",
      startYear: 2022,
    },
  });

  const modelYear = await prisma.modelYear.upsert({
    where: {
      generationId_year: { generationId: generation.id, year: 2025 },
    },
    create: { generationId: generation.id, year: 2025 },
    update: {},
  });

  const m254 = await ensureMercedesEngine(prisma, {
    manufacturerId,
    slug: "mercedes-m254-c300",
    name: "M254 2.0L turbo mild hybrid (C 300)",
    code: "M254",
    fuelType: "PETROL",
    displacementCc: 1991,
    cylinderCount: 4,
    configuration: "Inline",
    induction: "Turbocharged",
    electrification: "48V mild hybrid (ISG)",
  });

  const m139C43 = await ensureMercedesEngine(prisma, {
    manufacturerId,
    slug: "mercedes-m139l-amg-c43",
    name: "AMG M139L 2.0L with electric exhaust-gas turbocharger",
    code: "M139L",
    fuelType: "PETROL",
    displacementCc: 1991,
    cylinderCount: 4,
    configuration: "Inline",
    induction: "Electric exhaust-gas turbocharger",
    electrification: "48V mild hybrid assist",
  });

  const m139C63 = await ensureMercedesEngine(prisma, {
    manufacturerId,
    slug: "mercedes-m139l-amg-c63-phev",
    name: "AMG M139L 2.0L PHEV + rear 150 kW motor (C 63 S E PERFORMANCE)",
    code: "M139L-PHEV",
    fuelType: "PLUG_IN_HYBRID",
    displacementCc: 1991,
    cylinderCount: 4,
    configuration: "Inline",
    induction: "Electric exhaust-gas turbocharger",
    electrification: "PHEV (rear 150 kW PMSM)",
  });

  const engineBySlug = {
    "mercedes-m254-c300": m254,
    "mercedes-m139l-amg-c43": m139C43,
    "mercedes-m139l-amg-c63-phev": m139C63,
  } as const;

  const nineG = await prisma.transmission.upsert({
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

  const amgMct = await prisma.transmission.upsert({
    where: { slug: "mercedes-amg-speedshift-mct-9" },
    create: {
      slug: "mercedes-amg-speedshift-mct-9",
      name: "AMG SPEEDSHIFT MCT 9-speed",
      type: "AUTOMATIC",
      gearCount: 9,
    },
    update: {
      name: "AMG SPEEDSHIFT MCT 9-speed",
      type: "AUTOMATIC",
      gearCount: 9,
    },
  });

  const transmissionBySlug = {
    "mercedes-9g-tronic": nineG,
    "mercedes-amg-speedshift-mct-9": amgMct,
  } as const;

  const pressSources = new Map<string, { id: string }>();
  for (const sourceData of PRESS_SOURCES) {
    const source = await upsertCatalogueSource(prisma, {
      slug: sourceData.slug,
      title: sourceData.title,
      publisher: sourceData.publisher,
      url: sourceData.url,
      type: sourceData.type,
    });
    pressSources.set(sourceData.slug, source);
  }

  const priceSources = new Map<string, { id: string }>();
  for (const sourceData of PRICE_SOURCES) {
    const source = await upsertCatalogueSource(prisma, {
      slug: sourceData.slug,
      title: sourceData.title,
      publisher: sourceData.publisher,
      url: sourceData.url,
      type: sourceData.type,
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
    const imageSource = await ensureImageSource(prisma, {
      slug: `img-${trim.slug}`,
      title: `2025 Mercedes-Benz ${trim.name} exterior`,
      pageUrl: trim.imagePageUrl,
    });

    const engine = engineBySlug[trim.engineSlug as keyof typeof engineBySlug];
    const transmission =
      transmissionBySlug[trim.transmissionSlug as keyof typeof transmissionBySlug];

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
      groundClearanceIn: null as number | null,
      curbWeightKg: trim.dimensions.curbWeightKg,
      grossVehicleWeightKg: null as number | null,
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
        "MBUSA exterior dimensions / curb weight",
      ),
      upsertCitation(
        prisma,
        pressSource.id,
        "VehiclePerformance",
        performance.id,
        "specifications",
        "MBUSA power / torque / 0-60",
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
        "Exterior image",
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
