/**
 * Mercedes-Benz EQ compact EV seed (EQA / EQB / EQC).
 * US-market EQB MY2025 seeded from EPA + MBUSA. EQA/EQC skipped (no US EPA).
 * Idempotent upserts. Do not reuse RESERVED_MERCEDES_IMAGE_URLS.
 */
import type { BodyStyle, Drivetrain } from "../../src/generated/prisma/client";
import {
  MERCEDES_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureMercedesEngine,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./mercedes-shared";

type FuelEco = {
  cityMpg: number;
  highwayMpg: number;
  combinedMpg: number;
  electricRangeMiles: number;
};

type Dims = {
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  wheelbaseIn: number;
  frontTrackIn?: number;
  rearTrackIn?: number;
  curbWeightKg?: number;
  cargoVolumeLiters?: number;
  seatingCapacity: number;
};

type Perf = {
  powerHp: number;
  torqueLbFt: number;
  zeroToSixtySeconds: number;
  topSpeedMph?: number;
};

type TrimDef = {
  slug: string;
  name: string;
  year: number;
  modelSlug: string;
  modelName: string;
  generationCode: string;
  generationDisplay: string;
  generationStart: number;
  bodyStyle: BodyStyle;
  drivetrain: Drivetrain;
  engineSlug: string;
  engineName: string;
  engineCode: string;
  engineElectrification: string;
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
  msrpCents: number;
  dimensions: Dims;
  performance: Perf;
  fuelEconomy: FuelEco;
  epaId: string;
  epaTitle: string;
  specSourceSlug: string;
  skipReason?: string;
};

const LBS_TO_KG = 0.45359237;
const CUFT_TO_L = 28.3168466;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToL(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

const EQB_DIMS_BASE = {
  lengthIn: 184.4,
  widthIn: 72.2,
  heightIn: 65.6,
  wheelbaseIn: 111.4,
  frontTrackIn: 62.5,
  rearTrackIn: 62.5,
  cargoVolumeLiters: cuFtToL(25.9),
  seatingCapacity: 5,
} as const;

/** Official MBUSA exterior studio stills — unique color/angle per trim. */
const IMG = {
  eqb250:
    "https://www.mbusa.com/content/dam/mb-nafta/us/global-nav-new/vehicles/MY25-EQB250W-Resized.png",
  eqb300:
    "https://www.mbusa.com/content/dam/mb-nafta/us/global-nav-new/vehicles/MY25-EQB300W4-Resized.png",
  eqb350:
    "https://www.mbusa.com/content/dam/mb-nafta/us/global-nav-new/vehicles/MY25-EQB350W4-Resized.png",
} as const;

const TRIMS: TrimDef[] = [
  // —— EQA (never US / no EPA) ——
  {
    slug: "2025-mercedes-eqa-250-us",
    name: "EQA 250",
    year: 2025,
    modelSlug: "mercedes-eqa",
    modelName: "EQA",
    generationCode: "H243",
    generationDisplay: "H243 EQA",
    generationStart: 2021,
    bodyStyle: "SUV",
    drivetrain: "FWD",
    engineSlug: "mercedes-eqa-250-asm",
    engineName: "EQA 250 ASM",
    engineCode: "EQA-250-ASM",
    engineElectrification: "Front asynchronous motor",
    imageUrl: IMG.eqb250,
    imagePageUrl: "https://www.mbusa.com/en/vehicles/class/eqb/suv",
    imageAlt: "Mercedes-Benz EQA 250 exterior",
    msrpCents: 0,
    dimensions: { ...EQB_DIMS_BASE },
    performance: { powerHp: 0, torqueLbFt: 0, zeroToSixtySeconds: 0 },
    fuelEconomy: { cityMpg: 0, highwayMpg: 0, combinedMpg: 0, electricRangeMiles: 0 },
    epaId: "",
    epaTitle: "",
    specSourceSlug: "mbusa-2025-eqb-250-plus",
    skipReason: "EQA never offered in US market; no EPA listings 2019–2026",
  },
  {
    slug: "2025-mercedes-eqa-300-us",
    name: "EQA 300",
    year: 2025,
    modelSlug: "mercedes-eqa",
    modelName: "EQA",
    generationCode: "H243",
    generationDisplay: "H243 EQA",
    generationStart: 2021,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "mercedes-eqa-300-dual",
    engineName: "EQA 300 dual motor",
    engineCode: "EQA-300-DUAL",
    engineElectrification: "Dual electric motors (4MATIC)",
    imageUrl: IMG.eqb300,
    imagePageUrl: "https://www.mbusa.com/en/vehicles/class/eqb/suv",
    imageAlt: "Mercedes-Benz EQA 300 exterior",
    msrpCents: 0,
    dimensions: { ...EQB_DIMS_BASE },
    performance: { powerHp: 0, torqueLbFt: 0, zeroToSixtySeconds: 0 },
    fuelEconomy: { cityMpg: 0, highwayMpg: 0, combinedMpg: 0, electricRangeMiles: 0 },
    epaId: "",
    epaTitle: "",
    specSourceSlug: "mbusa-2025-eqb-300-4matic",
    skipReason: "EQA never offered in US market; no EPA listings 2019–2026",
  },
  {
    slug: "2025-mercedes-eqa-350-us",
    name: "EQA 350",
    year: 2025,
    modelSlug: "mercedes-eqa",
    modelName: "EQA",
    generationCode: "H243",
    generationDisplay: "H243 EQA",
    generationStart: 2021,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "mercedes-eqa-350-dual",
    engineName: "EQA 350 dual motor",
    engineCode: "EQA-350-DUAL",
    engineElectrification: "Dual electric motors (4MATIC)",
    imageUrl: IMG.eqb350,
    imagePageUrl: "https://www.mbusa.com/en/vehicles/class/eqb/suv",
    imageAlt: "Mercedes-Benz EQA 350 exterior",
    msrpCents: 0,
    dimensions: { ...EQB_DIMS_BASE },
    performance: { powerHp: 0, torqueLbFt: 0, zeroToSixtySeconds: 0 },
    fuelEconomy: { cityMpg: 0, highwayMpg: 0, combinedMpg: 0, electricRangeMiles: 0 },
    epaId: "",
    epaTitle: "",
    specSourceSlug: "mbusa-2025-eqb-350-4matic",
    skipReason: "EQA never offered in US market; no EPA listings 2019–2026",
  },

  // —— EQB 2025 US ——
  {
    slug: "2025-mercedes-eqb-250-plus-us",
    name: "EQB 250+",
    year: 2025,
    modelSlug: "mercedes-eqb",
    modelName: "EQB",
    generationCode: "X243",
    generationDisplay: "X243 EQB",
    generationStart: 2021,
    bodyStyle: "SUV",
    drivetrain: "FWD",
    engineSlug: "mercedes-eqb-250-plus-140kw-asm",
    engineName: "140 kW ASM",
    engineCode: "EQB-250P-140KW-ASM",
    engineElectrification: "140 kW ACPM 3-Phase (EPA); front-mounted ASM",
    imageUrl: IMG.eqb250,
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/eqb/suv/eqb250w",
    imageAlt: "2025 Mercedes-Benz EQB 250+ exterior, Iridium Silver",
    msrpCents: 5305000,
    dimensions: {
      ...EQB_DIMS_BASE,
      curbWeightKg: lbsToKg(4652),
    },
    performance: {
      powerHp: 188,
      torqueLbFt: 284,
      zeroToSixtySeconds: 8.5,
      topSpeedMph: 99,
    },
    fuelEconomy: {
      cityMpg: 114,
      highwayMpg: 100,
      combinedMpg: 107,
      electricRangeMiles: 251,
    },
    epaId: "49116",
    epaTitle: "2025 Mercedes-Benz EQB 250 Plus fuel economy data",
    specSourceSlug: "mbusa-2025-eqb-250-plus",
  },
  {
    slug: "2025-mercedes-eqb-300-4matic-us",
    name: "EQB 300 4MATIC",
    year: 2025,
    modelSlug: "mercedes-eqb",
    modelName: "EQB",
    generationCode: "X243",
    generationDisplay: "X243 EQB",
    generationStart: 2021,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "mercedes-eqb-300-168kw-dual",
    engineName: "168 kW dual motor (ASM/PSM)",
    engineCode: "EQB-300-168KW-DUAL",
    engineElectrification: "72 and 96 kW ACPM 3-Phase (EPA); front ASM / rear PSM",
    imageUrl: IMG.eqb300,
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/eqb/suv/eqb300w4",
    imageAlt: "2025 Mercedes-Benz EQB 300 4MATIC exterior, Polar White",
    msrpCents: 5720000,
    dimensions: {
      ...EQB_DIMS_BASE,
      curbWeightKg: lbsToKg(4796),
    },
    performance: {
      powerHp: 225,
      torqueLbFt: 288,
      zeroToSixtySeconds: 7.6,
      topSpeedMph: 99,
    },
    fuelEconomy: {
      cityMpg: 89,
      highwayMpg: 85,
      combinedMpg: 87,
      electricRangeMiles: 205,
    },
    epaId: "49117",
    epaTitle: "2025 Mercedes-Benz EQB 300 4matic fuel economy data",
    specSourceSlug: "mbusa-2025-eqb-300-4matic",
  },
  {
    slug: "2025-mercedes-eqb-350-4matic-us",
    name: "EQB 350 4MATIC",
    year: 2025,
    modelSlug: "mercedes-eqb",
    modelName: "EQB",
    generationCode: "X243",
    generationDisplay: "X243 EQB",
    generationStart: 2021,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "mercedes-eqb-350-215kw-dual",
    engineName: "215 kW dual motor (ASM/PSM)",
    engineCode: "EQB-350-215KW-DUAL",
    engineElectrification: "72 and 96 kW ACPM 3-Phase (EPA); front ASM / rear PSM 215 kW combined",
    imageUrl: IMG.eqb350,
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/eqb/suv/eqb350w4",
    imageAlt: "2025 Mercedes-Benz EQB 350 4MATIC exterior, Denim Blue",
    msrpCents: 6085000,
    dimensions: {
      ...EQB_DIMS_BASE,
      curbWeightKg: lbsToKg(4828),
    },
    performance: {
      powerHp: 288,
      torqueLbFt: 383,
      zeroToSixtySeconds: 5.8,
      topSpeedMph: 99,
    },
    fuelEconomy: {
      cityMpg: 89,
      highwayMpg: 85,
      combinedMpg: 87,
      electricRangeMiles: 207,
    },
    epaId: "49118",
    epaTitle: "2025 Mercedes-Benz EQB 350 4matic fuel economy data",
    specSourceSlug: "mbusa-2025-eqb-350-4matic",
  },

  // —— EQC (US launch cancelled / no EPA) ——
  {
    slug: "2020-mercedes-eqc-400-4matic-us",
    name: "EQC 400 4MATIC",
    year: 2020,
    modelSlug: "mercedes-eqc",
    modelName: "EQC",
    generationCode: "N293",
    generationDisplay: "N293 EQC",
    generationStart: 2019,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "mercedes-eqc-400-dual-im",
    engineName: "EQC 400 dual induction",
    engineCode: "EQC-400-DUAL-IM",
    engineElectrification: "Dual induction motors, 300 kW combined",
    imageUrl: IMG.eqb250,
    imagePageUrl: "https://www.mbusa.com/en/vehicles/class/eqb/suv",
    imageAlt: "Mercedes-Benz EQC 400 4MATIC exterior",
    msrpCents: 0,
    dimensions: { ...EQB_DIMS_BASE },
    performance: { powerHp: 0, torqueLbFt: 0, zeroToSixtySeconds: 0 },
    fuelEconomy: { cityMpg: 0, highwayMpg: 0, combinedMpg: 0, electricRangeMiles: 0 },
    epaId: "",
    epaTitle: "",
    specSourceSlug: "mbusa-2025-eqb-250-plus",
    skipReason:
      "EQC US launch cancelled; never EPA-certified for US market (no EPA listings 2019–2026)",
  },
];

const SPEC_SOURCES = [
  {
    slug: "mbusa-2025-eqb-250-plus",
    title: "2025 Mercedes-Benz EQB 250+ SUV — specifications",
    publisher: "Mercedes-Benz USA",
    url: "https://www.mbusa.com/en/vehicles/model/eqb/suv/eqb250w",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "mbusa-2025-eqb-300-4matic",
    title: "2025 Mercedes-Benz EQB 300 4MATIC SUV — specifications",
    publisher: "Mercedes-Benz USA",
    url: "https://www.mbusa.com/en/vehicles/model/eqb/suv/eqb300w4",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "mbusa-2025-eqb-350-4matic",
    title: "2025 Mercedes-Benz EQB 350 4MATIC SUV — specifications",
    publisher: "Mercedes-Benz USA",
    url: "https://www.mbusa.com/en/vehicles/model/eqb/suv/eqb350w4",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "mbusa-destination-fee",
    title: "Mercedes-Benz USA destination and handling",
    publisher: "Mercedes-Benz USA",
    url: "https://www.mbusa.com/en/vehicles",
    type: "MANUFACTURER" as const,
  },
];

async function seedOne(ctx: SeedCtx, trim: TrimDef, sourceBySlug: Map<string, { id: string }>) {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;

  await assertImageUrlOk(trim.imageUrl);
  const imageSource = await ensureImageSource(prisma, {
    slug: `img-${trim.slug}`,
    title: trim.imageAlt,
    pageUrl: trim.imagePageUrl,
  });

  const model = await prisma.vehicleModel.upsert({
    where: { slug: trim.modelSlug },
    create: {
      manufacturerId,
      name: trim.modelName,
      slug: trim.modelSlug,
    },
    update: { manufacturerId, name: trim.modelName },
  });

  const generation = await prisma.vehicleGeneration.upsert({
    where: { modelId_code: { modelId: model.id, code: trim.generationCode } },
    create: {
      modelId: model.id,
      code: trim.generationCode,
      displayName: trim.generationDisplay,
      startYear: trim.generationStart,
    },
    update: {
      displayName: trim.generationDisplay,
      startYear: trim.generationStart,
    },
  });

  const modelYear = await prisma.modelYear.upsert({
    where: { generationId_year: { generationId: generation.id, year: trim.year } },
    create: { generationId: generation.id, year: trim.year },
    update: {},
  });

  const engine = await ensureMercedesEngine(prisma, {
    manufacturerId,
    slug: trim.engineSlug,
    name: trim.engineName,
    code: trim.engineCode,
    fuelType: "ELECTRIC",
    electrification: trim.engineElectrification,
    displacementCc: null,
    cylinderCount: null,
    configuration: null,
    induction: null,
  });

  const transmission = await prisma.transmission.upsert({
    where: { slug: "mercedes-single-speed-automatic" },
    create: {
      slug: "mercedes-single-speed-automatic",
      name: "Single-speed automatic",
      type: "SINGLE_SPEED",
      gearCount: 1,
    },
    update: {
      name: "Single-speed automatic",
      type: "SINGLE_SPEED",
      gearCount: 1,
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
      publishedAt: pricingDate,
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
      publishedAt: pricingDate,
    },
  });

  const [dimensions, performance, fuelEconomy, price, destination] = await Promise.all([
    prisma.vehicleDimensions.upsert({
      where: { vehicleId: vehicle.id },
      create: { vehicleId: vehicle.id, ...trim.dimensions },
      update: trim.dimensions,
    }),
    prisma.vehiclePerformance.upsert({
      where: { vehicleId: vehicle.id },
      create: { vehicleId: vehicle.id, ...trim.performance },
      update: trim.performance,
    }),
    prisma.vehicleFuelEconomy.upsert({
      where: { vehicleId: vehicle.id },
      create: { vehicleId: vehicle.id, ...trim.fuelEconomy },
      update: trim.fuelEconomy,
    }),
    prisma.vehiclePrice.upsert({
      where: {
        vehicleId_market_type_effectiveAt: {
          vehicleId: vehicle.id,
          market: "US",
          type: "BASE_MSRP",
          effectiveAt: pricingDate,
        },
      },
      create: {
        vehicleId: vehicle.id,
        market: "US",
        type: "BASE_MSRP",
        amountCents: trim.msrpCents,
        currency: "USD",
        effectiveAt: pricingDate,
      },
      update: { amountCents: trim.msrpCents, currency: "USD" },
    }),
    prisma.vehiclePrice.upsert({
      where: {
        vehicleId_market_type_effectiveAt: {
          vehicleId: vehicle.id,
          market: "US",
          type: "DESTINATION_FEE",
          effectiveAt: pricingDate,
        },
      },
      create: {
        vehicleId: vehicle.id,
        market: "US",
        type: "DESTINATION_FEE",
        amountCents: MERCEDES_DESTINATION_CENTS,
        currency: "USD",
        effectiveAt: pricingDate,
      },
      update: {
        amountCents: MERCEDES_DESTINATION_CENTS,
        currency: "USD",
      },
    }),
  ]);

  await prisma.vehicleImage.upsert({
    where: { vehicleId_position: { vehicleId: vehicle.id, position: 0 } },
    create: {
      vehicleId: vehicle.id,
      sourceId: imageSource.id,
      url: trim.imageUrl,
      alt: trim.imageAlt,
      credit: "Mercedes-Benz USA",
      position: 0,
    },
    update: {
      sourceId: imageSource.id,
      url: trim.imageUrl,
      alt: trim.imageAlt,
      credit: "Mercedes-Benz USA",
    },
  });

  const epaSlug = `epa-${trim.year}-mercedes-${trim.slug
    .replace(/^\d{4}-mercedes-/, "")
    .replace(/-us$/, "")}`;
  const epaSource = await upsertCatalogueSource(prisma, {
    slug: epaSlug,
    title: trim.epaTitle,
    publisher: "U.S. Department of Energy and U.S. Environmental Protection Agency",
    url: `https://www.fueleconomy.gov/ws/rest/vehicle/${trim.epaId}`,
    type: "GOVERNMENT",
  });

  const specSource = sourceBySlug.get(trim.specSourceSlug);
  if (!specSource) throw new Error(`Missing spec source ${trim.specSourceSlug}`);
  const destSource = sourceBySlug.get("mbusa-destination-fee") ?? specSource;

  await Promise.all([
    upsertCitation(
      prisma,
      specSource.id,
      "VehicleDimensions",
      dimensions.id,
      "specifications",
      "MBUSA exterior dimensions / curb weight / cargo",
    ),
    upsertCitation(
      prisma,
      specSource.id,
      "VehiclePerformance",
      performance.id,
      "specifications",
      "MBUSA power / torque / 0-60",
    ),
    upsertCitation(prisma, specSource.id, "VehiclePrice", price.id, "amountCents", "Base MSRP"),
    upsertCitation(
      prisma,
      destSource.id,
      "VehiclePrice",
      destination.id,
      "amountCents",
      "Destination and handling",
    ),
    upsertCitation(
      prisma,
      epaSource.id,
      "VehicleFuelEconomy",
      fuelEconomy.id,
      "combinedMpg",
      "EPA combined MPGe",
    ),
    upsertCitation(
      prisma,
      epaSource.id,
      "VehicleFuelEconomy",
      fuelEconomy.id,
      "electricRangeMiles",
      "EPA electric range",
    ),
  ]);

  await ensureAudit(prisma, importerId, vehicle.id, trim.slug);
  return trim.slug;
}

export async function seedMercedesEqCompact(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const seeded: string[] = [];
  const skipped: string[] = [];

  const sourceBySlug = new Map<string, { id: string }>();
  for (const src of SPEC_SOURCES) {
    const row = await upsertCatalogueSource(ctx.prisma, src);
    sourceBySlug.set(src.slug, { id: row.id });
  }

  for (const trim of TRIMS) {
    if (trim.skipReason) {
      skipped.push(`${trim.slug}: ${trim.skipReason}`);
      continue;
    }
    try {
      const slug = await seedOne(ctx, trim, sourceBySlug);
      seeded.push(slug);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      skipped.push(`${trim.slug}: ${message}`);
    }
  }

  return { seeded, skipped };
}
