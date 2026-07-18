/**
 * Tesla current US model-line seed module.
 *
 * Scope: one complete representative MY2026 trim for each current Tesla model
 * line with EPA fuel-economy data and a unique exterior image.
 */
import type { BodyStyle, Drivetrain } from "../../src/generated/prisma/client";
import {
  TESLA_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureTeslaEngine,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./tesla-shared";

const CUFT_TO_L = 28.316846592;

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

type Dims = {
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  wheelbaseIn: number;
  groundClearanceIn?: number;
  cargoVolumeLiters?: number;
  seatingCapacity: number;
};

type Perf = {
  powerHp: number;
  torqueLbFt?: number;
  zeroToSixtySeconds: number;
  topSpeedMph: number;
};

type FuelEco = {
  cityMpg: number;
  highwayMpg: number;
  combinedMpg: number;
  electricRangeMiles: number;
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
  priceSourceSlug: string;
};

const IMG = {
  model3: "https://www.auto-data.net/images/f49/Tesla-Model-3-facelift-2023.jpg",
  modelY: "https://www.auto-data.net/images/f109/Tesla-Model-Y-facelift-2025.jpg",
  modelS: "https://www.auto-data.net/images/f46/Tesla-Model-S-facelift-2021.jpg",
  modelX: "https://www.auto-data.net/images/f88/Tesla-Model-X_2.jpg",
  cybertruck: "https://www.auto-data.net/images/f44/Tesla-Cybertruck.jpg",
} as const;

const TRIMS: TrimDef[] = [
  {
    slug: "2026-tesla-model-3-standard-rwd-us",
    name: "Model 3 Standard RWD",
    year: 2026,
    modelSlug: "tesla-model-3",
    modelName: "Model 3",
    generationCode: "Highland",
    generationDisplay: "Highland facelift",
    generationStart: 2024,
    bodyStyle: "SEDAN",
    drivetrain: "RWD",
    engineSlug: "tesla-model-3-rwd-pmsm",
    engineName: "Rear permanent-magnet synchronous motor",
    engineCode: "MODEL3-RWD-PMSM",
    engineConfiguration: "Single electric motor",
    engineElectrification: "Rear permanent-magnet motor",
    imageUrl: IMG.model3,
    imagePageUrl:
      "https://www.auto-data.net/en/tesla-model-3-highland-facelift-2023-generation-9666",
    imageAlt: "2026 Tesla Model 3 exterior",
    msrpCents: 3699000,
    dimensions: {
      lengthIn: 185.8,
      widthIn: 72.8,
      heightIn: 56.7,
      wheelbaseIn: 113.2,
      cargoVolumeLiters: cuFtToLiters(24.1),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 283,
      torqueLbFt: 310,
      zeroToSixtySeconds: 5.8,
      topSpeedMph: 125,
    },
    fuelEconomy: {
      cityMpg: 147,
      highwayMpg: 130,
      combinedMpg: 139,
      electricRangeMiles: 321,
    },
    epaId: "50251",
    epaTitle: "2026 Tesla Model 3 Standard RWD fuel economy data",
    specSourceSlug: "edmunds-2026-model-3-standard",
    priceSourceSlug: "edmunds-2026-model-3",
  },
  {
    slug: "2026-tesla-model-y-standard-rwd-us",
    name: "Model Y Standard RWD",
    year: 2026,
    modelSlug: "tesla-model-y",
    modelName: "Model Y",
    generationCode: "Juniper",
    generationDisplay: "Juniper facelift",
    generationStart: 2025,
    bodyStyle: "SUV",
    drivetrain: "RWD",
    engineSlug: "tesla-model-y-rwd-pmsm",
    engineName: "Rear permanent-magnet synchronous motor",
    engineCode: "MODELY-RWD-PMSM",
    engineConfiguration: "Single electric motor",
    engineElectrification: "Rear permanent-magnet motor",
    imageUrl: IMG.modelY,
    imagePageUrl:
      "https://www.auto-data.net/en/tesla-model-y-juniper-facelift-2025-generation-10390",
    imageAlt: "2026 Tesla Model Y exterior",
    msrpCents: 3999000,
    dimensions: {
      lengthIn: 188.8,
      widthIn: 75.6,
      heightIn: 63.9,
      wheelbaseIn: 113.8,
      cargoVolumeLiters: cuFtToLiters(76.2),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 299,
      zeroToSixtySeconds: 6.8,
      topSpeedMph: 125,
    },
    fuelEconomy: {
      cityMpg: 148,
      highwayMpg: 129,
      combinedMpg: 138,
      electricRangeMiles: 321,
    },
    epaId: "50040",
    epaTitle: "2026 Tesla Model Y Standard RWD (18in wheels) fuel economy data",
    specSourceSlug: "caranddriver-2026-model-y",
    priceSourceSlug: "tesla-2026-model-y",
  },
  {
    slug: "2026-tesla-model-s-awd-us",
    name: "Model S AWD",
    year: 2026,
    modelSlug: "tesla-model-s",
    modelName: "Model S",
    generationCode: "Palladium",
    generationDisplay: "Palladium facelift",
    generationStart: 2021,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    engineSlug: "tesla-model-s-dual-motor",
    engineName: "Dual motor all-wheel drive",
    engineCode: "MODELS-DUAL-MOTOR",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "Front and rear electric motors",
    imageUrl: IMG.modelS,
    imagePageUrl:
      "https://www.auto-data.net/en/tesla-model-s-facelift-2021-generation-8165",
    imageAlt: "2026 Tesla Model S exterior",
    msrpCents: 9499000,
    dimensions: {
      lengthIn: 197.7,
      widthIn: 78.2,
      heightIn: 56.3,
      wheelbaseIn: 116.5,
      groundClearanceIn: 4.6,
      cargoVolumeLiters: cuFtToLiters(28.2),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 670,
      zeroToSixtySeconds: 3.1,
      topSpeedMph: 149,
    },
    fuelEconomy: {
      cityMpg: 132,
      highwayMpg: 116,
      combinedMpg: 124,
      electricRangeMiles: 410,
    },
    epaId: "49741",
    epaTitle: "2026 Tesla Model S fuel economy data",
    specSourceSlug: "caranddriver-2026-model-s-specs",
    priceSourceSlug: "edmunds-2026-model-s",
  },
  {
    slug: "2026-tesla-model-x-awd-us",
    name: "Model X AWD",
    year: 2026,
    modelSlug: "tesla-model-x",
    modelName: "Model X",
    generationCode: "Palladium",
    generationDisplay: "Palladium facelift",
    generationStart: 2021,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "tesla-model-x-dual-motor",
    engineName: "Dual motor all-wheel drive",
    engineCode: "MODELX-DUAL-MOTOR",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "Front and rear electric motors",
    imageUrl: IMG.modelX,
    imagePageUrl: "https://www.auto-data.net/en/tesla-model-x-generation-4104",
    imageAlt: "2026 Tesla Model X exterior",
    msrpCents: 9999000,
    dimensions: {
      lengthIn: 199.1,
      widthIn: 78.9,
      heightIn: 66.1,
      wheelbaseIn: 116.7,
      groundClearanceIn: 5.8,
      cargoVolumeLiters: cuFtToLiters(43.5),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 670,
      zeroToSixtySeconds: 3.8,
      topSpeedMph: 149,
    },
    fuelEconomy: {
      cityMpg: 110,
      highwayMpg: 99,
      combinedMpg: 105,
      electricRangeMiles: 352,
    },
    epaId: "49745",
    epaTitle: "2026 Tesla Model X fuel economy data",
    specSourceSlug: "edmunds-2026-model-x-specs",
    priceSourceSlug: "edmunds-2026-model-x",
  },
  {
    slug: "2026-tesla-cybertruck-dual-motor-awd-us",
    name: "Cybertruck Dual Motor AWD",
    year: 2026,
    modelSlug: "tesla-cybertruck",
    modelName: "Cybertruck",
    generationCode: "Cybertruck",
    generationDisplay: "First generation",
    generationStart: 2024,
    bodyStyle: "TRUCK",
    drivetrain: "AWD",
    engineSlug: "tesla-cybertruck-dual-motor",
    engineName: "Dual motor all-wheel drive",
    engineCode: "CYBERTRUCK-DUAL-MOTOR",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "Front and rear electric motors",
    imageUrl: IMG.cybertruck,
    imagePageUrl: "https://www.auto-data.net/en/tesla-cybertruck-generation-8588",
    imageAlt: "2026 Tesla Cybertruck exterior",
    msrpCents: 6999000,
    dimensions: {
      lengthIn: 223.7,
      widthIn: 80.0,
      heightIn: 68.5,
      wheelbaseIn: 143.1,
      groundClearanceIn: 16.0,
      cargoVolumeLiters: cuFtToLiters(67.0),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 600,
      zeroToSixtySeconds: 4.1,
      topSpeedMph: 112,
    },
    fuelEconomy: {
      cityMpg: 87,
      highwayMpg: 70,
      combinedMpg: 78,
      electricRangeMiles: 325,
    },
    epaId: "50460",
    epaTitle: "2026 Tesla Cybertruck Dual Motor AWD fuel economy data",
    specSourceSlug: "autodata-cybertruck",
    priceSourceSlug: "edmunds-2026-cybertruck",
  },
];

const SPEC_SOURCES = [
  {
    slug: "edmunds-2026-model-3",
    title: "2026 Tesla Model 3 — Edmunds pricing and specifications",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/tesla/model-3/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2026-model-3-standard",
    title: "2026 Tesla Model 3 Standard — Edmunds specs",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/tesla/model-3/2026/standard/st-402057159/features-specs/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "tesla-2026-model-y",
    title: "Model Y — Tesla pricing and specifications",
    publisher: "Tesla",
    url: "https://www.tesla.com/modely",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "caranddriver-2026-model-y",
    title: "2026 Tesla Model Y — Car and Driver review, pricing, and specs",
    publisher: "Car and Driver",
    url: "https://www.caranddriver.com/tesla/model-y",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2026-model-s",
    title: "2026 Tesla Model S — Edmunds pricing and specifications",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/tesla/model-s/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "caranddriver-2026-model-s-specs",
    title: "2026 Tesla Model S — Car and Driver specifications",
    publisher: "Car and Driver",
    url: "https://www.caranddriver.com/tesla/model-s/specs",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2026-model-x",
    title: "2026 Tesla Model X — Edmunds pricing and specifications",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/tesla/model-x/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2026-model-x-specs",
    title: "2026 Tesla Model X — Edmunds detailed specs",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/tesla/model-x/2026/features-specs/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2026-cybertruck",
    title: "2026 Tesla Cybertruck — Edmunds pricing and specifications",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/tesla/cybertruck/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "autodata-cybertruck",
    title: "Tesla Cybertruck technical specifications",
    publisher: "auto-data.net",
    url: "https://www.auto-data.net/en/tesla-cybertruck-generation-8588",
    type: "THIRD_PARTY" as const,
  },
];

const STATIC_SKIPPED = [
  "Model 3 Premium RWD/AWD and Performance: omitted to keep one complete representative trim per current Tesla model line.",
  "Model Y Long Range AWD/RWD, Performance, and Standard AWD: omitted to keep one complete representative trim per current Tesla model line.",
  "Model S Plaid and Model X Plaid: EPA records exist, but base AWD trims represent their model lines for this seed pass.",
  "Cybertruck Cyberbeast and Premium AWD: omitted to keep one complete representative trim per current Tesla model line.",
  "Roadster and Cybercab: not current US production catalogue trims with complete EPA/pricing records.",
];

async function seedOne(
  ctx: SeedCtx,
  trim: TrimDef,
  sourceBySlug: Map<string, { id: string }>,
) {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;

  await assertImageUrlOk(trim.imageUrl);
  const imageSource = await ensureImageSource(prisma, {
    slug: `img-${trim.slug}`,
    title: trim.imageAlt,
    pageUrl: trim.imagePageUrl,
    publisher: "auto-data.net",
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
    where: {
      generationId_year: { generationId: generation.id, year: trim.year },
    },
    create: { generationId: generation.id, year: trim.year },
    update: {},
  });

  const engine = await ensureTeslaEngine(prisma, {
    manufacturerId,
    slug: trim.engineSlug,
    name: trim.engineName,
    code: trim.engineCode,
    fuelType: "ELECTRIC",
    configuration: trim.engineConfiguration,
    electrification: trim.engineElectrification,
  });

  const transmission = await prisma.transmission.upsert({
    where: { slug: "tesla-single-speed-automatic" },
    create: {
      slug: "tesla-single-speed-automatic",
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
      description: `${trim.year} Tesla ${trim.name} (US).`,
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
      description: `${trim.year} Tesla ${trim.name} (US).`,
      status: "PUBLISHED",
      publishedAt: pricingDate,
    },
  });

  const [dimensions, performance, fuelEconomy, price, destination] =
    await Promise.all([
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
          amountCents: TESLA_DESTINATION_CENTS,
          currency: "USD",
          effectiveAt: pricingDate,
        },
        update: {
          amountCents: TESLA_DESTINATION_CENTS,
          currency: "USD",
        },
      }),
    ]);

  const image = await prisma.vehicleImage.upsert({
    where: { vehicleId_position: { vehicleId: vehicle.id, position: 0 } },
    create: {
      vehicleId: vehicle.id,
      sourceId: imageSource.id,
      url: trim.imageUrl,
      alt: trim.imageAlt,
      credit: "auto-data.net",
      position: 0,
    },
    update: {
      sourceId: imageSource.id,
      url: trim.imageUrl,
      alt: trim.imageAlt,
      credit: "auto-data.net",
    },
  });

  const epaSource = await upsertCatalogueSource(prisma, {
    slug: `epa-${trim.slug.replace(/-us$/, "")}`,
    title: trim.epaTitle,
    publisher: "U.S. Department of Energy and U.S. Environmental Protection Agency",
    url: `https://www.fueleconomy.gov/ws/rest/vehicle/${trim.epaId}`,
    type: "GOVERNMENT",
  });

  const specSource = sourceBySlug.get(trim.specSourceSlug);
  if (!specSource) throw new Error(`Missing spec source ${trim.specSourceSlug}`);
  const priceSource = sourceBySlug.get(trim.priceSourceSlug);
  if (!priceSource) throw new Error(`Missing price source ${trim.priceSourceSlug}`);

  await Promise.all([
    upsertCitation(
      prisma,
      specSource.id,
      "VehicleDimensions",
      dimensions.id,
      "specifications",
      "Exterior dimensions / cargo / seating",
    ),
    upsertCitation(
      prisma,
      specSource.id,
      "VehiclePerformance",
      performance.id,
      "specifications",
      "Power / 0-60 / top speed",
    ),
    upsertCitation(
      prisma,
      priceSource.id,
      "VehiclePrice",
      price.id,
      "amountCents",
      "Base MSRP excluding destination/order fees",
    ),
    upsertCitation(
      prisma,
      priceSource.id,
      "VehiclePrice",
      destination.id,
      "amountCents",
      `Destination fee $${(TESLA_DESTINATION_CENTS / 100).toFixed(0)}`,
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
      "cityMpg",
      `EPA vehicle id ${trim.epaId}`,
    ),
    upsertCitation(
      prisma,
      epaSource.id,
      "VehicleFuelEconomy",
      fuelEconomy.id,
      "highwayMpg",
      `EPA vehicle id ${trim.epaId}`,
    ),
    upsertCitation(
      prisma,
      epaSource.id,
      "VehicleFuelEconomy",
      fuelEconomy.id,
      "electricRangeMiles",
      "EPA electric range",
    ),
    upsertCitation(
      prisma,
      imageSource.id,
      "VehicleImage",
      image.id,
      "url",
      "auto-data.net exterior asset",
    ),
  ]);

  await ensureAudit(prisma, importerId, vehicle.id, trim.slug);
  return trim.slug;
}

export async function seedTeslaCurrentLineup(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  const sourceBySlug = new Map<string, { id: string }>();
  for (const src of SPEC_SOURCES) {
    const row = await upsertCatalogueSource(ctx.prisma, src);
    sourceBySlug.set(src.slug, { id: row.id });
  }

  const claimedImages = new Set<string>();

  for (const trim of TRIMS) {
    try {
      if (claimedImages.has(trim.imageUrl)) {
        throw new Error(`Duplicate image URL within module: ${trim.imageUrl}`);
      }
      claimedImages.add(trim.imageUrl);
      const slug = await seedOne(ctx, trim, sourceBySlug);
      seeded.push(slug);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      skipped.push(`${trim.slug}: ${message}`);
    }
  }

  return { seeded, skipped };
}
