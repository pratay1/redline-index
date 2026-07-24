/**
 * Ferrari GTC4Lusso / Portofino / Roma seed module (US market).
 * Last/current US model year only — one representative trim each.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Years:
 * - GTC4Lusso / GTC4Lusso T → final MY 2020
 * - Portofino → final MY 2021
 * - Portofino M → final MY 2023
 * - Roma coupe → final MY 2024 (no 2025 coupe EPA)
 * - Roma Spider → current MY 2026 (latest EPA)
 */
import {
  FERRARI_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureFerrariEngine,
  ensureImageSource,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./ferrari-shared";

const LBS_TO_KG = 0.45359237;
const CUFT_TO_L = 28.316846592;
const MM_TO_IN = 0.0393700787;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

function mmToIn(mm: number) {
  return Math.round(mm * MM_TO_IN * 10) / 10;
}

type ModelSlug =
  | "ferrari-gtc4lusso"
  | "ferrari-portofino"
  | "ferrari-portofino-m"
  | "ferrari-roma"
  | "ferrari-roma-spider";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: string;
  year: number;
  generationCode: string;
  generationDisplayName: string;
  generationStartYear: number;
  generationEndYear: number | null;
  bodyStyle: "HATCHBACK" | "CABRIOLET" | "COUPE";
  drivetrain: "AWD" | "RWD";
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
  epaId: string;
  engine: {
    slug: string;
    name: string;
    code: string;
    displacementCc: number;
    cylinderCount: number;
    configuration: string;
    induction: string;
    electrification: string | null;
  };
  transmission: {
    slug: string;
    name: string;
    type: "DUAL_CLUTCH";
    gearCount: number;
  };
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
  fuelEconomy: {
    cityMpg: number;
    highwayMpg: number;
    combinedMpg: number;
  };
  /** BASE_MSRP in cents (excludes destination). */
  baseMsrpCents: number;
  /** Destination & handling in cents (period-accurate when cited). */
  destinationCents: number;
  destinationSourceUrl: string;
  destinationSourceTitle: string;
  specUrl: string;
  specTitle: string;
  specPublisher: string;
};

/**
 * Unique auto-data.net exteriors (HEAD-verified JPEG; distinct folders / angles).
 * Do not reuse across Ferrari series modules.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2020-ferrari-gtc4lusso-us",
    name: "GTC4Lusso",
    modelSlug: "ferrari-gtc4lusso",
    modelName: "GTC4Lusso",
    year: 2020,
    generationCode: "F151M",
    generationDisplayName: "GTC4Lusso (F151M)",
    generationStartYear: 2016,
    generationEndYear: 2020,
    bodyStyle: "HATCHBACK",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f88/Ferrari-GTC4Lusso.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-gtc4lusso-6.3-v12-690hp-dct-22970",
    imageAlt: "2020 Ferrari GTC4Lusso shooting-brake exterior",
    epaId: "41691",
    engine: {
      slug: "ferrari-f140ed-v12",
      name: "6.3L V12 naturally aspirated (F140ED)",
      code: "F140ED",
      displacementCc: 6262,
      cylinderCount: 12,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-f1-dct-7",
      name: "7-speed F1 dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // Ferrari / auto-data mm→in; curb Cars.com/CarBuzz 4,233 lb; cargo 15.9 cu ft.
      lengthIn: mmToIn(4922),
      widthIn: mmToIn(1980),
      heightIn: mmToIn(1383),
      wheelbaseIn: mmToIn(2990),
      frontTrackIn: mmToIn(1674),
      rearTrackIn: mmToIn(1668),
      curbWeightKg: lbsToKg(4233),
      cargoVolumeLiters: cuFtToLiters(15.9),
      seatingCapacity: 4,
    },
    performance: {
      // US SAE Car and Driver / CarBuzz 680 hp / 514 lb-ft; Ferrari 0–100 km/h 3.4 s; top 208 mph.
      powerHp: 680,
      torqueLbFt: 514,
      zeroToSixtySeconds: 3.4,
      topSpeedMph: 208,
    },
    // EPA Auto (AM7) id 41691 — 12/17/13.
    fuelEconomy: { cityMpg: 12, highwayMpg: 17, combinedMpg: 13 },
    // iSeeCars MSRP excl. destination; destination $3,750.
    baseMsrpCents: 30_165_000,
    destinationCents: 375_000,
    destinationSourceUrl: "https://www.iseecars.com/car/ferrari-gtc4lusso-price",
    destinationSourceTitle:
      "2020 Ferrari GTC4Lusso destination charge $3,750 (iSeeCars)",
    specUrl: "https://www.caranddriver.com/ferrari/gtc4lusso/specs",
    specTitle: "2020 Ferrari GTC4Lusso AWD — Car and Driver specs",
    specPublisher: "Car and Driver",
  },
  {
    slug: "2020-ferrari-gtc4lusso-t-us",
    name: "GTC4Lusso T",
    modelSlug: "ferrari-gtc4lusso",
    modelName: "GTC4Lusso",
    year: 2020,
    generationCode: "F151M",
    generationDisplayName: "GTC4Lusso (F151M)",
    generationStartYear: 2016,
    generationEndYear: 2020,
    bodyStyle: "HATCHBACK",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f74/Ferrari-GTC4Lusso-T.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-gtc4lusso-t-3.9-v8-610hp-29049",
    imageAlt: "2020 Ferrari GTC4Lusso T shooting-brake exterior",
    epaId: "41692",
    engine: {
      slug: "ferrari-f154bd-v8-610",
      name: "3.9L twin-turbo V8 (F154BD)",
      code: "F154BD",
      displacementCc: 3855,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-f1-dct-7",
      name: "7-speed F1 dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // Same shell as V12; curb CarBuzz 4,112 lb; cargo 15.9 cu ft.
      lengthIn: 193.8,
      widthIn: 78.0,
      heightIn: 54.5,
      wheelbaseIn: 117.7,
      frontTrackIn: 65.9,
      rearTrackIn: 65.7,
      curbWeightKg: lbsToKg(4112),
      cargoVolumeLiters: cuFtToLiters(15.9),
      seatingCapacity: 4,
    },
    performance: {
      // US SAE CarBuzz/C&D 602 hp / 561 lb-ft; Ferrari 0–100 km/h 3.5 s; top ~199 mph.
      powerHp: 602,
      torqueLbFt: 561,
      zeroToSixtySeconds: 3.5,
      topSpeedMph: 199,
    },
    // EPA Auto (AM7) id 41692 — 15/21/17.
    fuelEconomy: { cityMpg: 15, highwayMpg: 21, combinedMpg: 17 },
    baseMsrpCents: 25_966_000,
    destinationCents: 375_000,
    destinationSourceUrl:
      "https://www.iseecars.com/car/ferrari-gtc4lusso-t-price",
    destinationSourceTitle:
      "2020 Ferrari GTC4Lusso T destination charge $3,750 (iSeeCars)",
    specUrl:
      "https://carbuzz.com/cars/ferrari/gtc4lusso-t/2020/specs-and-trims/",
    specTitle: "2020 Ferrari GTC4Lusso T — CarBuzz specs & trims",
    specPublisher: "CarBuzz",
  },
  {
    slug: "2021-ferrari-portofino-us",
    name: "Portofino",
    modelSlug: "ferrari-portofino",
    modelName: "Portofino",
    year: 2021,
    generationCode: "F164",
    generationDisplayName: "Portofino (F164)",
    generationStartYear: 2018,
    generationEndYear: 2021,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f70/Ferrari-Portofino.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-portofino-3.9-v8-600hp-27951",
    imageAlt: "2021 Ferrari Portofino convertible exterior",
    epaId: "42770",
    engine: {
      slug: "ferrari-f154be-v8-600",
      name: "3.9L twin-turbo V8 (F154BE)",
      code: "F154BE",
      displacementCc: 3855,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-f1-dct-7",
      name: "7-speed F1 dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // CarBuzz / Cars.com exterior; tracks CarBuzz; cargo 10.3 cu ft.
      lengthIn: 180.6,
      widthIn: 76.3,
      heightIn: 51.9,
      wheelbaseIn: 105.1,
      frontTrackIn: 64.3,
      rearTrackIn: 64.4,
      curbWeightKg: lbsToKg(3669),
      cargoVolumeLiters: cuFtToLiters(10.3),
      seatingCapacity: 4,
    },
    performance: {
      // US SAE CarBuzz 591 hp / 561 lb-ft; Ferrari 0–100 km/h 3.5 s; top ~199 mph.
      powerHp: 591,
      torqueLbFt: 561,
      zeroToSixtySeconds: 3.5,
      topSpeedMph: 199,
    },
    // EPA Auto (AM7) id 42770 — 16/22/18.
    fuelEconomy: { cityMpg: 16, highwayMpg: 22, combinedMpg: 18 },
    // Cars.com / CarBuzz MSRP; destination $3,950 (CarBuzz / iSeeCars).
    baseMsrpCents: 21_305_400,
    destinationCents: 395_000,
    destinationSourceUrl: "https://www.iseecars.com/car/ferrari-portofino-price",
    destinationSourceTitle:
      "2021 Ferrari Portofino destination charge $3,950 (iSeeCars)",
    specUrl: "https://carbuzz.com/cars/ferrari/portofino/2021/specs-and-trims/",
    specTitle: "2021 Ferrari Portofino — CarBuzz specs & trims",
    specPublisher: "CarBuzz",
  },
  {
    slug: "2023-ferrari-portofino-m-us",
    name: "Portofino M",
    modelSlug: "ferrari-portofino-m",
    modelName: "Portofino M",
    year: 2023,
    generationCode: "F164M",
    generationDisplayName: "Portofino M (F164M)",
    generationStartYear: 2021,
    generationEndYear: 2023,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f73/Ferrari-Portofino-M.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-portofino-m-3.9-v8-620hp-41724",
    imageAlt: "2023 Ferrari Portofino M convertible exterior",
    epaId: "45469",
    engine: {
      slug: "ferrari-f154bh-v8-620",
      name: "3.9L twin-turbo V8 (F154BH)",
      code: "F154BH",
      displacementCc: 3855,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-f1-dct-8",
      name: "8-speed F1 dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 8,
    },
    dimensions: {
      // KBB / CarBuzz dims; cargo 10.3 cu ft.
      lengthIn: 180.9,
      widthIn: 76.3,
      heightIn: 51.9,
      wheelbaseIn: 105.1,
      frontTrackIn: 64.3,
      rearTrackIn: 64.4,
      curbWeightKg: lbsToKg(3668),
      cargoVolumeLiters: cuFtToLiters(10.3),
      seatingCapacity: 4,
    },
    performance: {
      // US SAE C&D/TrueCar 612 hp / 561 lb-ft; Ferrari ~3.45 s 0–100; top >199 mph.
      powerHp: 612,
      torqueLbFt: 561,
      zeroToSixtySeconds: 3.5,
      topSpeedMph: 199,
    },
    // EPA Auto (AM8) id 45469 — 16/23/19.
    fuelEconomy: { cityMpg: 16, highwayMpg: 23, combinedMpg: 19 },
    // TrueCar / Car and Driver starting MSRP.
    baseMsrpCents: 25_005_200,
    destinationCents: FERRARI_DESTINATION_CENTS,
    destinationSourceUrl:
      "https://www.iseecars.com/car/ferrari-portofino-m-price",
    destinationSourceTitle:
      "Ferrari North America destination ~$5,000 (iSeeCars / MY2023+ Monroney-style)",
    specUrl: "https://www.caranddriver.com/ferrari/portofino/specs",
    specTitle: "2023 Ferrari Portofino M — Car and Driver specs",
    specPublisher: "Car and Driver",
  },
  {
    slug: "2024-ferrari-roma-us",
    name: "Roma",
    modelSlug: "ferrari-roma",
    modelName: "Roma",
    year: 2024,
    generationCode: "F169",
    generationDisplayName: "Roma (F169)",
    generationStartYear: 2020,
    generationEndYear: 2024,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f71/Ferrari-Roma.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-roma-3.9-v8-620hp-f1-dct-41340",
    imageAlt: "2024 Ferrari Roma coupe exterior",
    epaId: "47048",
    engine: {
      slug: "ferrari-f154bh-v8-620",
      name: "3.9L twin-turbo V8 (F154BH)",
      code: "F154BH",
      displacementCc: 3855,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-f1-dct-8",
      name: "8-speed F1 dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 8,
    },
    dimensions: {
      // Cars.com / CarBuzz / KBB; tracks CarBuzz; cargo ~10 cu ft.
      lengthIn: 183.3,
      widthIn: 77.7,
      heightIn: 51.2,
      wheelbaseIn: 105.1,
      frontTrackIn: 65.0,
      rearTrackIn: 66.1,
      curbWeightKg: lbsToKg(3461),
      cargoVolumeLiters: cuFtToLiters(10.0),
      seatingCapacity: 4,
    },
    performance: {
      // US SAE ~611–612 hp / 561 lb-ft; Ferrari 0–100 km/h 3.4 s; top 199 mph.
      powerHp: 612,
      torqueLbFt: 561,
      zeroToSixtySeconds: 3.4,
      topSpeedMph: 199,
    },
    // EPA Auto (AM8) id 47048 — 17/22/19.
    fuelEconomy: { cityMpg: 17, highwayMpg: 22, combinedMpg: 19 },
    // Cars.com / CarBuzz base MSRP excl. destination.
    baseMsrpCents: 24_335_800,
    destinationCents: FERRARI_DESTINATION_CENTS,
    destinationSourceUrl: "https://www.iseecars.com/car/ferrari-roma-price",
    destinationSourceTitle:
      "Ferrari North America destination charge $5,000 (iSeeCars Monroney-style)",
    specUrl: "https://www.cars.com/research/ferrari-roma-2024/specs/",
    specTitle: "2024 Ferrari Roma — Cars.com specs & dimensions",
    specPublisher: "Cars.com",
  },
  {
    slug: "2026-ferrari-roma-spider-us",
    name: "Roma Spider",
    modelSlug: "ferrari-roma-spider",
    modelName: "Roma Spider",
    year: 2026,
    generationCode: "F169",
    generationDisplayName: "Roma Spider (F169)",
    generationStartYear: 2023,
    generationEndYear: 2026,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f72/Ferrari-Roma-Spider.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-roma-spider-3.9-v8-620hp-f1-dct-9403",
    imageAlt: "2026 Ferrari Roma Spider convertible exterior",
    epaId: "49781",
    engine: {
      slug: "ferrari-f154bh-v8-620",
      name: "3.9L twin-turbo V8 (F154BH)",
      code: "F154BH",
      displacementCc: 3855,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-f1-dct-8",
      name: "8-speed F1 dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 8,
    },
    dimensions: {
      // Ferrari / guideautoweb / dealer; height soft-top; boot 255 L top-up.
      lengthIn: 183.3,
      widthIn: 77.7,
      heightIn: 51.4,
      wheelbaseIn: 105.1,
      frontTrackIn: 65.0,
      rearTrackIn: 66.1,
      curbWeightKg: lbsToKg(3646),
      cargoVolumeLiters: 255,
      seatingCapacity: 4,
    },
    performance: {
      // US SAE 612 hp / 561 lb-ft; Ferrari 0–100 km/h 3.4 s; top 199 mph.
      powerHp: 612,
      torqueLbFt: 561,
      zeroToSixtySeconds: 3.4,
      topSpeedMph: 199,
    },
    // EPA Auto (AM8) id 49781 — 17/22/19.
    fuelEconomy: { cityMpg: 17, highwayMpg: 22, combinedMpg: 19 },
    // iSeeCars 2026 Roma convertible MSRP excl. destination $5,000.
    baseMsrpCents: 27_496_500,
    destinationCents: FERRARI_DESTINATION_CENTS,
    destinationSourceUrl: "https://www.iseecars.com/car/ferrari-roma-price",
    destinationSourceTitle:
      "2026 Ferrari Roma Spider destination charge $5,000 (iSeeCars)",
    specUrl: "https://www.caranddriver.com/ferrari/roma",
    specTitle: "2026 Ferrari Roma Spider — Car and Driver review & specs",
    specPublisher: "Car and Driver",
  },
];

const STATIC_SKIPPED = [
  "GTC4Lusso MY 2017–2019: prefer final US MY 2020 (EPA 41691 / 41692)",
  "GTC4Lusso T MY 2017–2019: prefer final US MY 2020",
  "Portofino MY 2018–2020: prefer final pre-M US MY 2021 (EPA 42770)",
  "Portofino M MY 2021–2022: prefer final US MY 2023 (EPA 45469)",
  "Roma coupe MY 2021–2023: prefer final US coupe MY 2024 (EPA 47048); no 2025 coupe EPA",
  "Roma Spider MY 2023–2025: prefer latest US MY 2026 (EPA 49781)",
  "Ferrari Amalfi / Amalfi Spider: Roma successor — outside this module scope",
];

export async function seedFerrariGtc4PortofinoRoma(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  type GenEntry = { id: string; years: Map<number, string> };
  type ModelEntry = { id: string; generations: Map<string, GenEntry> };
  const modelCache = new Map<ModelSlug, ModelEntry>();

  async function ensureModelYear(trim: TrimSeed): Promise<string> {
    let modelEntry = modelCache.get(trim.modelSlug);
    if (!modelEntry) {
      const model = await prisma.vehicleModel.upsert({
        where: { slug: trim.modelSlug },
        create: {
          manufacturerId,
          name: trim.modelName,
          slug: trim.modelSlug,
        },
        update: { manufacturerId, name: trim.modelName },
      });
      modelEntry = { id: model.id, generations: new Map() };
      modelCache.set(trim.modelSlug, modelEntry);
    }

    let genEntry = modelEntry.generations.get(trim.generationCode);
    if (!genEntry) {
      const generation = await prisma.vehicleGeneration.upsert({
        where: {
          modelId_code: {
            modelId: modelEntry.id,
            code: trim.generationCode,
          },
        },
        create: {
          modelId: modelEntry.id,
          code: trim.generationCode,
          displayName: trim.generationDisplayName,
          startYear: trim.generationStartYear,
          endYear: trim.generationEndYear ?? undefined,
        },
        update: {
          displayName: trim.generationDisplayName,
          startYear: trim.generationStartYear,
          endYear: trim.generationEndYear ?? undefined,
        },
      });
      genEntry = { id: generation.id, years: new Map() };
      modelEntry.generations.set(trim.generationCode, genEntry);
    }

    let modelYearId = genEntry.years.get(trim.year);
    if (!modelYearId) {
      const modelYear = await prisma.modelYear.upsert({
        where: {
          generationId_year: {
            generationId: genEntry.id,
            year: trim.year,
          },
        },
        create: { generationId: genEntry.id, year: trim.year },
        update: {},
      });
      modelYearId = modelYear.id;
      genEntry.years.set(trim.year, modelYearId);
    }

    return modelYearId;
  }

  const claimedImages = new Set<string>();

  for (const trim of TRIMS) {
    try {
      if (claimedImages.has(trim.imageUrl)) {
        throw new Error(`Duplicate image URL within module: ${trim.imageUrl}`);
      }
      claimedImages.add(trim.imageUrl);

      const imageUrl = await assertImageUrlOk(trim.imageUrl);
      const imageSource = await ensureImageSource(prisma, {
        slug: `auto-data-image-${trim.slug}`,
        title: `${trim.name} exterior (auto-data.net)`,
        pageUrl: trim.imagePageUrl,
        publisher: "auto-data.net",
      });

      const modelYearId = await ensureModelYear(trim);

      const engine = await ensureFerrariEngine(prisma, {
        manufacturerId,
        slug: trim.engine.slug,
        name: trim.engine.name,
        code: trim.engine.code,
        fuelType: "PETROL",
        displacementCc: trim.engine.displacementCc,
        cylinderCount: trim.engine.cylinderCount,
        configuration: trim.engine.configuration,
        induction: trim.engine.induction,
        electrification: trim.engine.electrification,
      });

      const transmission = await prisma.transmission.upsert({
        where: { slug: trim.transmission.slug },
        create: {
          slug: trim.transmission.slug,
          name: trim.transmission.name,
          type: trim.transmission.type,
          gearCount: trim.transmission.gearCount,
        },
        update: {
          name: trim.transmission.name,
          type: trim.transmission.type,
          gearCount: trim.transmission.gearCount,
        },
      });

      const specSource = await upsertCatalogueSource(prisma, {
        slug: `ferrari-gtc4-portofino-roma-${trim.slug}-specs`,
        title: trim.specTitle,
        publisher: trim.specPublisher,
        url: trim.specUrl,
        type: "THIRD_PARTY",
      });

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-${trim.year}-${trim.slug}`,
        title: `EPA Fuel Economy — ${trim.year} Ferrari ${trim.name}`,
        publisher: "U.S. EPA",
        url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
        type: "GOVERNMENT",
      });

      const priceSource = await upsertCatalogueSource(prisma, {
        slug: `price-${trim.slug}`,
        title: trim.specTitle,
        publisher: trim.specPublisher,
        url: trim.specUrl,
        type: "THIRD_PARTY",
      });

      const destinationSource = await upsertCatalogueSource(prisma, {
        slug: `destination-${trim.slug}`,
        title: trim.destinationSourceTitle,
        publisher: "iSeeCars",
        url: trim.destinationSourceUrl,
        type: "THIRD_PARTY",
      });

      const vehicle = await prisma.vehicle.upsert({
        where: { slug: trim.slug },
        create: {
          slug: trim.slug,
          modelYearId,
          name: trim.name,
          market: "US",
          bodyStyle: trim.bodyStyle,
          drivetrain: trim.drivetrain,
          engineId: engine.id,
          transmissionId: transmission.id,
          description: `${trim.year} Ferrari ${trim.name} (US).`,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
        update: {
          modelYearId,
          name: trim.name,
          market: "US",
          bodyStyle: trim.bodyStyle,
          drivetrain: trim.drivetrain,
          engineId: engine.id,
          transmissionId: transmission.id,
          description: `${trim.year} Ferrari ${trim.name} (US).`,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
      });

      const performanceData = {
        powerHp: trim.performance.powerHp,
        torqueLbFt: trim.performance.torqueLbFt,
        zeroToSixtySeconds: trim.performance.zeroToSixtySeconds,
        topSpeedMph: trim.performance.topSpeedMph,
      };

      const [dimensions, performance, fuelEconomy, price, destination, image] =
        await Promise.all([
          prisma.vehicleDimensions.upsert({
            where: { vehicleId: vehicle.id },
            create: { vehicleId: vehicle.id, ...trim.dimensions },
            update: trim.dimensions,
          }),
          prisma.vehiclePerformance.upsert({
            where: { vehicleId: vehicle.id },
            create: { vehicleId: vehicle.id, ...performanceData },
            update: performanceData,
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
              amountCents: trim.baseMsrpCents,
              currency: "USD",
              effectiveAt: pricingDate,
            },
            update: {
              amountCents: trim.baseMsrpCents,
              currency: "USD",
            },
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
              amountCents: trim.destinationCents,
              currency: "USD",
              effectiveAt: pricingDate,
            },
            update: {
              amountCents: trim.destinationCents,
              currency: "USD",
            },
          }),
          prisma.vehicleImage.upsert({
            where: {
              vehicleId_position: { vehicleId: vehicle.id, position: 0 },
            },
            create: {
              vehicleId: vehicle.id,
              sourceId: imageSource.id,
              url: imageUrl,
              alt: trim.imageAlt,
              credit: "auto-data.net",
              position: 0,
            },
            update: {
              sourceId: imageSource.id,
              url: imageUrl,
              alt: trim.imageAlt,
              credit: "auto-data.net",
            },
          }),
        ]);

      await Promise.all([
        upsertCitation(
          prisma,
          specSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "Power, torque, 0–60 mph, and top speed from cited catalogue / press",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Exterior dimensions, tracks, curb weight, cargo",
        ),
        upsertCitation(
          prisma,
          fuelSource.id,
          "VehicleFuelEconomy",
          fuelEconomy.id,
          "cityMpg",
          `EPA vehicle id ${trim.epaId}`,
        ),
        upsertCitation(
          prisma,
          fuelSource.id,
          "VehicleFuelEconomy",
          fuelEconomy.id,
          "highwayMpg",
          `EPA vehicle id ${trim.epaId}`,
        ),
        upsertCitation(
          prisma,
          fuelSource.id,
          "VehicleFuelEconomy",
          fuelEconomy.id,
          "combinedMpg",
          `EPA vehicle id ${trim.epaId}`,
        ),
        upsertCitation(
          prisma,
          priceSource.id,
          "VehiclePrice",
          price.id,
          "amountCents",
          `Base MSRP excluding destination (${trim.year} US)`,
        ),
        upsertCitation(
          prisma,
          destinationSource.id,
          "VehiclePrice",
          destination.id,
          "amountCents",
          `Destination and handling $${(trim.destinationCents / 100).toFixed(0)}`,
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
      seeded.push(`${trim.slug} | EPA=${trim.epaId} | image=${imageUrl}`);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      skipped.push(`${trim.slug}: ${reason}`);
    }
  }

  return { seeded, skipped };
}
