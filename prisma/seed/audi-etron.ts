/**
 * Audi e-tron / EV seed (Q4 / Q6 / Q8 e-tron / e-tron GT / RS e-tron GT).
 * US-market MY2025 seeded from EPA + Edmunds / Cars.com / Audi media.
 * Idempotent upserts. Prefer unique exteriors; do not reuse RESERVED_AUDI_IMAGE_URLS.
 * Do not wire into prisma/seed.ts here.
 */
import type { BodyStyle, Drivetrain } from "../../src/generated/prisma/client";
import {
  AUDI_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureAudiEngine,
  ensureImageSource,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./audi-shared";

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
  curbWeightKg?: number;
  cargoVolumeLiters?: number;
  seatingCapacity: number;
};

type Perf = {
  powerHp: number;
  torqueLbFt: number;
  zeroToSixtySeconds: number;
  topSpeedMph: number;
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
  engineConfiguration: string;
  engineElectrification: string;
  /** When set, uses two-speed automatic (e-tron GT family). */
  twoSpeedTransmission?: boolean;
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
  imageCredit: string;
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

/** Unique auto-data.net exterior stills — color/angle differ per trim. */
const IMG = {
  q4_45: "https://www.auto-data.net/images/f113/Audi-Q4-e-tron.jpg",
  q4_55: "https://www.auto-data.net/images/f116/Audi-Q4-e-tron.jpg",
  q6_ultra: "https://www.auto-data.net/images/f80/Audi-Q6-e-tron.jpg",
  q6_quattro: "https://www.auto-data.net/images/f83/Audi-Q6-e-tron.jpg",
  q8: "https://www.auto-data.net/images/f50/Audi-Q8-e-tron.jpg",
  sEtronGt: "https://www.auto-data.net/images/f37/Audi-S-e-tron-GT.jpg",
} as const;

const Q4_DIMS_BASE: Dims = {
  lengthIn: 180.7,
  widthIn: 73.4,
  heightIn: 64.7,
  wheelbaseIn: 108.7,
  cargoVolumeLiters: cuFtToL(24.8),
  seatingCapacity: 5,
};

const Q6_DIMS_BASE: Dims = {
  lengthIn: 187.8,
  widthIn: 76.3,
  heightIn: 66.6,
  wheelbaseIn: 113.7,
  cargoVolumeLiters: cuFtToL(30.2),
  seatingCapacity: 5,
};

const Q8_DIMS: Dims = {
  lengthIn: 193.0,
  widthIn: 76.2,
  heightIn: 65.5,
  wheelbaseIn: 115.3,
  curbWeightKg: lbsToKg(5798),
  cargoVolumeLiters: cuFtToL(28.5),
  seatingCapacity: 5,
};

const ETRON_GT_DIMS: Dims = {
  lengthIn: 197.0,
  widthIn: 77.3,
  heightIn: 54.9,
  wheelbaseIn: 114.2,
  curbWeightKg: lbsToKg(5126),
  cargoVolumeLiters: cuFtToL(11.0),
  seatingCapacity: 5,
};

const TRIMS: TrimDef[] = [
  // —— Legacy e-tron SUV name (renamed Q8 e-tron for MY2023+) ——
  {
    slug: "2022-audi-e-tron-suv-us",
    name: "e-tron",
    year: 2022,
    modelSlug: "audi-e-tron",
    modelName: "e-tron",
    generationCode: "GE",
    generationDisplay: "GE e-tron SUV",
    generationStart: 2019,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "audi-etron-dual-asm",
    engineName: "Dual asynchronous motors",
    engineCode: "ETRON-DUAL-ASM",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "Dual asynchronous motors (quattro)",
    imageUrl: IMG.q8,
    imagePageUrl: "https://www.auto-data.net/en/audi-q8-e-tron-generation-8939",
    imageAlt: "Audi e-tron SUV exterior",
    imageCredit: "auto-data.net",
    msrpCents: 0,
    dimensions: { ...Q8_DIMS },
    performance: { powerHp: 0, torqueLbFt: 0, zeroToSixtySeconds: 0, topSpeedMph: 0 },
    fuelEconomy: { cityMpg: 0, highwayMpg: 0, combinedMpg: 0, electricRangeMiles: 0 },
    epaId: "",
    epaTitle: "",
    specSourceSlug: "edmunds-2025-q8-etron",
    skipReason:
      "Former e-tron SUV renamed Q8 e-tron for MY2023+; seeding current Q8 e-tron instead of last e-tron SUV year",
  },

  // —— Q4 e-tron 2025 US ——
  {
    slug: "2025-audi-q4-45-e-tron-premium-us",
    name: "Q4 45 e-tron Premium",
    year: 2025,
    modelSlug: "audi-q4-e-tron",
    modelName: "Q4 e-tron",
    generationCode: "F4",
    generationDisplay: "F4 Q4 e-tron",
    generationStart: 2021,
    bodyStyle: "SUV",
    drivetrain: "RWD",
    engineSlug: "audi-q4-210kw-pmsm",
    engineName: "210 kW PMSM",
    engineCode: "Q4-210KW-PMSM",
    engineConfiguration: "Single electric motor",
    engineElectrification: "210 kW PMSM 3-Phase (EPA); rear-mounted",
    imageUrl: IMG.q4_45,
    imagePageUrl: "https://www.auto-data.net/en/audi-q4-e-tron-generation-8870",
    imageAlt: "2025 Audi Q4 45 e-tron exterior",
    imageCredit: "auto-data.net",
    msrpCents: 4980000,
    dimensions: {
      ...Q4_DIMS_BASE,
      curbWeightKg: lbsToKg(4685),
    },
    performance: {
      powerHp: 282,
      torqueLbFt: 402,
      zeroToSixtySeconds: 6.3,
      topSpeedMph: 112,
    },
    fuelEconomy: {
      cityMpg: 125,
      highwayMpg: 104,
      combinedMpg: 115,
      electricRangeMiles: 288,
    },
    epaId: "48296",
    epaTitle: "2025 Audi Q4 45 e-tron fuel economy data",
    specSourceSlug: "edmunds-2025-q4-etron",
  },
  {
    slug: "2025-audi-q4-55-e-tron-quattro-premium-us",
    name: "Q4 55 e-tron quattro Premium",
    year: 2025,
    modelSlug: "audi-q4-e-tron",
    modelName: "Q4 e-tron",
    generationCode: "F4",
    generationDisplay: "F4 Q4 e-tron",
    generationStart: 2021,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "audi-q4-250kw-dual-asm-pmsm",
    engineName: "250 kW dual motor (ASM/PMSM)",
    engineCode: "Q4-250KW-DUAL",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "80 and 170 kW Asynchron 3-Phase (EPA); front ASM / rear PMSM, 250 kW combined boost",
    imageUrl: IMG.q4_55,
    imagePageUrl: "https://www.auto-data.net/en/audi-q4-e-tron-generation-8870",
    imageAlt: "2025 Audi Q4 55 e-tron quattro exterior",
    imageCredit: "auto-data.net",
    msrpCents: 5520000,
    dimensions: {
      ...Q4_DIMS_BASE,
      curbWeightKg: lbsToKg(4850),
    },
    performance: {
      powerHp: 335,
      torqueLbFt: 402,
      zeroToSixtySeconds: 5.0,
      topSpeedMph: 112,
    },
    fuelEconomy: {
      cityMpg: 107,
      highwayMpg: 92,
      combinedMpg: 100,
      electricRangeMiles: 258,
    },
    epaId: "48681",
    epaTitle: "2025 Audi Q4 55 e-tron quattro fuel economy data",
    specSourceSlug: "edmunds-2025-q4-etron",
  },

  // —— Q6 e-tron 2025 US ——
  {
    slug: "2025-audi-q6-e-tron-ultra-us",
    name: "Q6 e-tron ultra",
    year: 2025,
    modelSlug: "audi-q6-e-tron",
    modelName: "Q6 e-tron",
    generationCode: "GF",
    generationDisplay: "GF Q6 e-tron",
    generationStart: 2024,
    bodyStyle: "SUV",
    drivetrain: "RWD",
    engineSlug: "audi-q6-225kw-pmsm-ecca",
    engineName: "225 kW PMSM ECCA",
    engineCode: "Q6-225KW-PMSM-ECCA",
    engineConfiguration: "Single electric motor",
    engineElectrification: "225 kW PMSM ECCA 3-Phase (EPA); rear-mounted, 240 kW boost",
    imageUrl: IMG.q6_ultra,
    imagePageUrl: "https://www.auto-data.net/en/audi-q6-e-tron-generation-9407",
    imageAlt: "2025 Audi Q6 e-tron ultra exterior",
    imageCredit: "auto-data.net",
    msrpCents: 6380000,
    dimensions: {
      ...Q6_DIMS_BASE,
      curbWeightKg: lbsToKg(4982),
    },
    performance: {
      powerHp: 322,
      torqueLbFt: 358,
      zeroToSixtySeconds: 6.3,
      topSpeedMph: 130,
    },
    fuelEconomy: {
      cityMpg: 112,
      highwayMpg: 96,
      combinedMpg: 104,
      electricRangeMiles: 321,
    },
    epaId: "48685",
    epaTitle: "2025 Audi Q6 e-tron ultra fuel economy data",
    specSourceSlug: "edmunds-2025-q6-etron",
  },
  {
    slug: "2025-audi-q6-e-tron-quattro-premium-us",
    name: "Q6 e-tron quattro Premium",
    year: 2025,
    modelSlug: "audi-q6-e-tron",
    modelName: "Q6 e-tron",
    generationCode: "GF",
    generationDisplay: "GF Q6 e-tron",
    generationStart: 2024,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "audi-q6-340kw-dual-pmsm-ecca",
    engineName: "340 kW dual motor (PMSM ECCA)",
    engineCode: "Q6-340KW-DUAL-ECCA",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "140 and 280 kW PMSM ECCA 3-Phase (EPA); 315 kW nominal / 340 kW launch control",
    imageUrl: IMG.q6_quattro,
    imagePageUrl: "https://www.auto-data.net/en/audi-q6-e-tron-generation-9407",
    imageAlt: "2025 Audi Q6 e-tron quattro exterior",
    imageCredit: "auto-data.net",
    msrpCents: 6580000,
    dimensions: {
      ...Q6_DIMS_BASE,
      curbWeightKg: lbsToKg(5269),
    },
    performance: {
      powerHp: 456,
      torqueLbFt: 631,
      zeroToSixtySeconds: 4.9,
      topSpeedMph: 130,
    },
    fuelEconomy: {
      cityMpg: 105,
      highwayMpg: 93,
      combinedMpg: 99,
      electricRangeMiles: 307,
    },
    epaId: "48297",
    epaTitle: "2025 Audi Q6 e-tron quattro (19 inch wheels) fuel economy data",
    specSourceSlug: "edmunds-2025-q6-etron",
  },

  // —— Q8 e-tron 2025 US ——
  {
    slug: "2025-audi-q8-e-tron-quattro-premium-us",
    name: "Q8 e-tron quattro Premium",
    year: 2025,
    modelSlug: "audi-q8-e-tron",
    modelName: "Q8 e-tron",
    generationCode: "GE",
    generationDisplay: "GE Q8 e-tron",
    generationStart: 2023,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "audi-q8-etron-dual-asm",
    engineName: "Dual asynchronous motors",
    engineCode: "Q8-ETRON-DUAL-ASM",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "141 and 172 kW Asynchron 3-Phase (EPA); 355 hp / 402 hp Sport boost",
    imageUrl: IMG.q8,
    imagePageUrl: "https://www.auto-data.net/en/audi-q8-e-tron-generation-8939",
    imageAlt: "2025 Audi Q8 e-tron quattro exterior",
    imageCredit: "auto-data.net",
    msrpCents: 7480000,
    dimensions: Q8_DIMS,
    performance: {
      powerHp: 402,
      torqueLbFt: 490,
      zeroToSixtySeconds: 5.4,
      topSpeedMph: 124,
    },
    fuelEconomy: {
      cityMpg: 77,
      highwayMpg: 80,
      combinedMpg: 78,
      electricRangeMiles: 272,
    },
    epaId: "48299",
    epaTitle: "2025 Audi Q8 e-tron quattro (20 inch wheels) fuel economy data",
    specSourceSlug: "edmunds-2025-q8-etron",
  },

  // —— S e-tron GT 2025 US (e-tron GT line) ——
  {
    slug: "2025-audi-s-e-tron-gt-premium-plus-us",
    name: "S e-tron GT Premium Plus",
    year: 2025,
    modelSlug: "audi-e-tron-gt",
    modelName: "e-tron GT",
    generationCode: "FW",
    generationDisplay: "FW e-tron GT",
    generationStart: 2021,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    engineSlug: "audi-s-etron-gt-dual-psm",
    engineName: "Dual PSM (S e-tron GT)",
    engineCode: "S-ETRON-GT-DUAL-PSM",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "176, 176 and 415 kW PSM 3-Phase (EPA); 670 hp launch control",
    twoSpeedTransmission: true,
    imageUrl: IMG.sEtronGt,
    imagePageUrl: "https://www.auto-data.net/en/audi-e-tron-gt-generation-7548",
    imageAlt: "2025 Audi S e-tron GT exterior",
    imageCredit: "auto-data.net",
    msrpCents: 12550000,
    dimensions: ETRON_GT_DIMS,
    performance: {
      powerHp: 670,
      torqueLbFt: 529,
      zeroToSixtySeconds: 3.3,
      topSpeedMph: 152,
    },
    fuelEconomy: {
      cityMpg: 91,
      highwayMpg: 88,
      combinedMpg: 90,
      electricRangeMiles: 300,
    },
    epaId: "48688",
    epaTitle: "2025 Audi S e-tron GT (20 inch wheels) fuel economy data",
    specSourceSlug: "edmunds-2025-s-etron-gt",
  },

  // RS e-tron GT is seeded in audi-rs-sport.ts (avoid duplicate slug).
];

const SPEC_SOURCES = [
  {
    slug: "edmunds-2025-q4-etron",
    title: "2025 Audi Q4 e-tron — Edmunds specifications & MSRP",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/audi/q4-e-tron/2025/features-specs/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2025-q6-etron",
    title: "2025 Audi Q6 e-tron — Edmunds specifications & MSRP",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/audi/q6-e-tron/2025/features-specs/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2025-q8-etron",
    title: "2025 Audi Q8 e-tron — Cars.com / Edmunds specifications & MSRP",
    publisher: "Cars.com / Edmunds",
    url: "https://www.cars.com/research/audi-q8_e_tron-2025/specs/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2025-s-etron-gt",
    title: "2025 Audi S e-tron GT — Edmunds specifications & MSRP",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/audi/s-e-tron-gt/2025/features-specs/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "audi-destination-fee",
    title: "Audi of America destination and handling",
    publisher: "Audi of America",
    url: "https://www.audiusa.com/",
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
    publisher: trim.imageCredit === "auto-data.net" ? "auto-data.net" : "encyCARpedia",
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

  const engine = await ensureAudiEngine(prisma, {
    manufacturerId,
    slug: trim.engineSlug,
    name: trim.engineName,
    code: trim.engineCode,
    fuelType: "ELECTRIC",
    configuration: trim.engineConfiguration,
    electrification: trim.engineElectrification,
    displacementCc: null,
    cylinderCount: null,
    induction: null,
  });

  const transmission = trim.twoSpeedTransmission
    ? await prisma.transmission.upsert({
        where: { slug: "audi-two-speed-automatic" },
        create: {
          slug: "audi-two-speed-automatic",
          name: "Two-speed automatic",
          type: "AUTOMATIC",
          gearCount: 2,
        },
        update: {
          name: "Two-speed automatic",
          type: "AUTOMATIC",
          gearCount: 2,
        },
      })
    : await prisma.transmission.upsert({
        where: { slug: "audi-single-speed-automatic" },
        create: {
          slug: "audi-single-speed-automatic",
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
        amountCents: AUDI_DESTINATION_CENTS,
        currency: "USD",
        effectiveAt: pricingDate,
      },
      update: {
        amountCents: AUDI_DESTINATION_CENTS,
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
      credit: trim.imageCredit,
      position: 0,
    },
    update: {
      sourceId: imageSource.id,
      url: trim.imageUrl,
      alt: trim.imageAlt,
      credit: trim.imageCredit,
    },
  });

  const epaSlug = `epa-${trim.year}-audi-${trim.slug
    .replace(/^\d{4}-audi-/, "")
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
  const destSource = sourceBySlug.get("audi-destination-fee") ?? specSource;

  await Promise.all([
    upsertCitation(
      prisma,
      specSource.id,
      "VehicleDimensions",
      dimensions.id,
      "specifications",
      "Exterior dimensions / curb weight / cargo",
    ),
    upsertCitation(
      prisma,
      specSource.id,
      "VehiclePerformance",
      performance.id,
      "specifications",
      "Power / torque / 0-60",
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

export async function seedAudiEtron(
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
