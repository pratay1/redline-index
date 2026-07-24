/**
 * Toyota sports coupe seed module (US market).
 * 86 (ZN6 facelift MY2020 last year), GR86 (ZN8 MY2025), GR Supra (A90).
 * Prefer EPA / Toyota eBrochure / Edmunds. Idempotent — safe to re-run.
 * Does not wire itself into prisma/seed.ts.
 *
 * Exterior images (unique, verified exteriors):
 * - https://c.encycarpedia.com/ci/9435.jpg
 * - https://c.encycarpedia.com/ci/12720.jpg
 * - https://www.auto-data.net/images/f50/Toyota-86-II.jpg
 * - https://c.encycarpedia.com/ci/11810.jpg
 * - https://c.encycarpedia.com/ci/11261.jpg
 * - https://c.encycarpedia.com/ci/13782.jpg
 */
import {
  TOYOTA_DPH_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureToyotaEngine,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./toyota-shared";

const LBS_TO_KG = 0.45359237;
const CUFT_TO_L = 28.316846592;
const MM_TO_IN = 1 / 25.4;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

function mmToIn(mm: number) {
  return Math.round(mm * MM_TO_IN * 10) / 10;
}

type ModelSlug = "toyota-86" | "toyota-gr86" | "toyota-gr-supra";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: string;
  year: number;
  generationCode: string;
  generationDisplayName: string;
  generationStartYear: number;
  bodyStyle: "COUPE";
  drivetrain: "RWD";
  imageUrl: string;
  imagePageUrl: string;
  imagePublisher: "encyCARpedia" | "auto-data.net";
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
    type: "MANUAL" | "AUTOMATIC";
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
  specUrl: string;
  specTitle: string;
  priceUrl: string;
  priceTitle: string;
};

const TRIMS: TrimSeed[] = [
  {
    slug: "2020-toyota-86-gt-us",
    name: "86 GT",
    modelSlug: "toyota-86",
    modelName: "86",
    year: 2020,
    generationCode: "ZN6-FL",
    generationDisplayName: "ZN6 facelift (2017–2020)",
    generationStartYear: 2017,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: "https://c.encycarpedia.com/ci/9435.jpg",
    imagePageUrl: "https://www.encycarpedia.com/us/toyota/17-gt86-coupe",
    imagePublisher: "encyCARpedia",
    imageAlt: "2020 Toyota 86 GT coupe exterior",
    // EPA Manual 6-spd id 41950 — 21/28/24
    epaId: "41950",
    engine: {
      slug: "toyota-fa20-205",
      name: "2.0L Flat-4 (FA20)",
      code: "FA20",
      displacementCc: 1998,
      cylinderCount: 4,
      configuration: "Boxer",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "toyota-6mt-86",
      name: "6-speed close-ratio manual",
      type: "MANUAL",
      gearCount: 6,
    },
    dimensions: {
      // Toyota MY20 86 eBrochure exterior / tracks / cargo; GT manual curb.
      lengthIn: 166.7,
      widthIn: 69.9,
      heightIn: 52.0,
      wheelbaseIn: 101.2,
      frontTrackIn: 59.8,
      rearTrackIn: 60.6,
      curbWeightKg: lbsToKg(2817),
      cargoVolumeLiters: cuFtToLiters(6.9),
      seatingCapacity: 4,
    },
    performance: {
      // Toyota MY20 brochure (manual); 0–60 / top Car and Driver 86 GT test.
      powerHp: 205,
      torqueLbFt: 156,
      zeroToSixtySeconds: 6.2,
      topSpeedMph: 135,
    },
    fuelEconomy: { cityMpg: 21, highwayMpg: 28, combinedMpg: 24 },
    // Edmunds GT 6M base MSRP excl. destination.
    baseMsrpCents: 3_019_000,
    specUrl:
      "https://www.toyota.com/content/dam/toyota/brochures/pdf/2020/86_ebrochure.pdf",
    specTitle: "2020 Toyota 86 eBrochure (Toyota)",
    priceUrl: "https://www.edmunds.com/toyota/86/2020/features-specs/",
    priceTitle: "2020 Toyota 86 Specs & Features (Edmunds)",
  },
  {
    slug: "2025-toyota-gr86-base-us",
    name: "GR86",
    modelSlug: "toyota-gr86",
    modelName: "GR86",
    year: 2025,
    generationCode: "ZN8",
    generationDisplayName: "ZN8 / second generation (2022–)",
    generationStartYear: 2022,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: "https://c.encycarpedia.com/ci/12720.jpg",
    imagePageUrl: "https://www.encycarpedia.com/us/toyota/22-gr-86-coupe",
    imagePublisher: "encyCARpedia",
    imageAlt: "2025 Toyota GR86 Base coupe exterior",
    // EPA Automatic (S6) id 48822 — 21/30/24
    epaId: "48822",
    engine: {
      slug: "toyota-fa24-228",
      name: "2.4L Flat-4 (FA24)",
      code: "FA24",
      displacementCc: 2387,
      cylinderCount: 4,
      configuration: "Boxer",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "toyota-ect-i-6-gr86",
      name: "6-speed ECT-i automatic with paddle shifters",
      type: "AUTOMATIC",
      gearCount: 6,
    },
    dimensions: {
      // Toyota MY25 GR86 eBrochure (mm → in); Base automatic curb.
      lengthIn: mmToIn(4265),
      widthIn: mmToIn(1775),
      heightIn: mmToIn(1310),
      wheelbaseIn: mmToIn(2575),
      frontTrackIn: mmToIn(1520),
      rearTrackIn: mmToIn(1550),
      curbWeightKg: lbsToKg(2851),
      cargoVolumeLiters: cuFtToLiters(6.26),
      seatingCapacity: 4,
    },
    performance: {
      // Toyota MY25 eBrochure (AT 0–60 / top speed).
      powerHp: 228,
      torqueLbFt: 184,
      zeroToSixtySeconds: 6.6,
      topSpeedMph: 134,
    },
    fuelEconomy: { cityMpg: 21, highwayMpg: 30, combinedMpg: 24 },
    // Edmunds Base starting MSRP excl. destination.
    baseMsrpCents: 3_159_500,
    specUrl:
      "https://www.toyota.com/content/dam/toyota/brochures/pdf/2025/gr86_ebrochure.pdf",
    specTitle: "2025 Toyota GR86 eBrochure (Toyota)",
    priceUrl: "https://www.edmunds.com/toyota/gr86/2025/trims/",
    priceTitle: "2025 Toyota GR86 Trims Comparison (Edmunds)",
  },
  {
    slug: "2025-toyota-gr86-premium-us",
    name: "GR86 Premium",
    modelSlug: "toyota-gr86",
    modelName: "GR86",
    year: 2025,
    generationCode: "ZN8",
    generationDisplayName: "ZN8 / second generation (2022–)",
    generationStartYear: 2022,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f50/Toyota-86-II.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-86-ii-gr-2.4-d-4s-235hp-automatic-43106",
    imagePublisher: "auto-data.net",
    imageAlt: "2025 Toyota GR86 Premium coupe exterior",
    // Same Automatic (S6) EPA id as Base — 21/30/24
    epaId: "48822",
    engine: {
      slug: "toyota-fa24-228",
      name: "2.4L Flat-4 (FA24)",
      code: "FA24",
      displacementCc: 2387,
      cylinderCount: 4,
      configuration: "Boxer",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "toyota-ect-i-6-gr86",
      name: "6-speed ECT-i automatic with paddle shifters",
      type: "AUTOMATIC",
      gearCount: 6,
    },
    dimensions: {
      // Toyota MY25 GR86 eBrochure; Premium automatic curb.
      lengthIn: mmToIn(4265),
      widthIn: mmToIn(1775),
      heightIn: mmToIn(1310),
      wheelbaseIn: mmToIn(2575),
      frontTrackIn: mmToIn(1520),
      rearTrackIn: mmToIn(1550),
      curbWeightKg: lbsToKg(2868),
      cargoVolumeLiters: cuFtToLiters(6.26),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 228,
      torqueLbFt: 184,
      zeroToSixtySeconds: 6.6,
      topSpeedMph: 134,
    },
    fuelEconomy: { cityMpg: 21, highwayMpg: 30, combinedMpg: 24 },
    // Edmunds Premium starting MSRP excl. destination.
    baseMsrpCents: 3_419_500,
    specUrl:
      "https://www.toyota.com/content/dam/toyota/brochures/pdf/2025/gr86_ebrochure.pdf",
    specTitle: "2025 Toyota GR86 eBrochure (Toyota)",
    priceUrl: "https://www.edmunds.com/toyota/gr86/2025/trims/",
    priceTitle: "2025 Toyota GR86 Trims Comparison (Edmunds)",
  },
  {
    slug: "2024-toyota-gr-supra-20-us",
    name: "GR Supra 2.0",
    modelSlug: "toyota-gr-supra",
    modelName: "GR Supra",
    year: 2024,
    generationCode: "A90",
    generationDisplayName: "A90 / fifth generation (2019–)",
    generationStartYear: 2019,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: "https://c.encycarpedia.com/ci/11810.jpg",
    imagePageUrl: "https://www.encycarpedia.com/us/toyota/20-gr-supra-2-0-coupe",
    imagePublisher: "encyCARpedia",
    imageAlt: "2024 Toyota GR Supra 2.0 coupe exterior",
    // EPA Automatic (S8) turbo 2.0 id 46636 — 25/31/27
    epaId: "46636",
    engine: {
      slug: "toyota-b48-255",
      name: "2.0L I4 twin-scroll turbo (B48)",
      code: "B48",
      displacementCc: 1998,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "toyota-zf-8hp-supra",
      name: "8-speed automatic with paddle shifters",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // Toyota MY24 GR Supra eBrochure (2.0 column).
      lengthIn: 172.5,
      widthIn: 73.0,
      heightIn: 51.1,
      wheelbaseIn: 97.2,
      frontTrackIn: 62.8,
      rearTrackIn: 62.6,
      curbWeightKg: lbsToKg(3181),
      cargoVolumeLiters: cuFtToLiters(10.2),
      seatingCapacity: 2,
    },
    performance: {
      // Toyota MY24 eBrochure 2.0.
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.0,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 25, highwayMpg: 31, combinedMpg: 27 },
    // Edmunds 2.0 base MSRP excl. destination.
    baseMsrpCents: 4_644_000,
    specUrl:
      "https://www.toyota.com/content/dam/toyota/brochures/pdf/2024/grsupra_ebrochure.pdf",
    specTitle: "2024 Toyota GR Supra eBrochure (Toyota)",
    priceUrl: "https://www.edmunds.com/toyota/gr-supra/2024/features-specs/",
    priceTitle: "2024 Toyota GR Supra Specs & Features (Edmunds)",
  },
  {
    slug: "2025-toyota-gr-supra-30-us",
    name: "GR Supra 3.0",
    modelSlug: "toyota-gr-supra",
    modelName: "GR Supra",
    year: 2025,
    generationCode: "A90",
    generationDisplayName: "A90 / fifth generation (2019–)",
    generationStartYear: 2019,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: "https://c.encycarpedia.com/ci/11261.jpg",
    imagePageUrl: "https://www.encycarpedia.com/us/toyota/19-gr-supra-3-0l-coupe",
    imagePublisher: "encyCARpedia",
    imageAlt: "2025 Toyota GR Supra 3.0 coupe exterior",
    // EPA Automatic (S8) turbo 3.0 id 47967 — 23/31/26
    epaId: "47967",
    engine: {
      slug: "toyota-b58-382",
      name: "3.0L I6 twin-scroll turbo (B58)",
      code: "B58",
      displacementCc: 2998,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "toyota-zf-8hp-supra",
      name: "8-speed automatic with paddle shifters",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // Toyota MY25 GR Supra eBrochure.
      lengthIn: 172.5,
      widthIn: 73.0,
      heightIn: 50.9,
      wheelbaseIn: 97.2,
      frontTrackIn: 62.8,
      rearTrackIn: 62.6,
      curbWeightKg: lbsToKg(3400),
      cargoVolumeLiters: cuFtToLiters(10.2),
      seatingCapacity: 2,
    },
    performance: {
      // Toyota MY25 eBrochure (AT 0–60 / electronic top).
      powerHp: 382,
      torqueLbFt: 368,
      zeroToSixtySeconds: 3.9,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 23, highwayMpg: 31, combinedMpg: 26 },
    // Edmunds 3.0 starting MSRP excl. destination.
    baseMsrpCents: 5_738_500,
    specUrl:
      "https://www.toyota.com/content/dam/toyota/brochures/pdf/2025/grsupra_ebrochure.pdf",
    specTitle: "2025 Toyota GR Supra eBrochure (Toyota)",
    priceUrl: "https://www.edmunds.com/toyota/gr-supra/2025/trims/",
    priceTitle: "2025 Toyota GR Supra Trims Comparison (Edmunds)",
  },
  {
    slug: "2025-toyota-gr-supra-30-premium-us",
    name: "GR Supra 3.0 Premium",
    modelSlug: "toyota-gr-supra",
    modelName: "GR Supra",
    year: 2025,
    generationCode: "A90",
    generationDisplayName: "A90 / fifth generation (2019–)",
    generationStartYear: 2019,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: "https://c.encycarpedia.com/ci/13782.jpg",
    imagePageUrl:
      "https://www.encycarpedia.com/us/toyota/22-gr-supra-3-0-6mt-coupe",
    imagePublisher: "encyCARpedia",
    imageAlt: "2025 Toyota GR Supra 3.0 Premium coupe exterior",
    // Same Automatic (S8) EPA id as 3.0 — 23/31/26
    epaId: "47967",
    engine: {
      slug: "toyota-b58-382",
      name: "3.0L I6 twin-scroll turbo (B58)",
      code: "B58",
      displacementCc: 2998,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "toyota-zf-8hp-supra",
      name: "8-speed automatic with paddle shifters",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: 172.5,
      widthIn: 73.0,
      heightIn: 50.9,
      wheelbaseIn: 97.2,
      frontTrackIn: 62.8,
      rearTrackIn: 62.6,
      curbWeightKg: lbsToKg(3400),
      cargoVolumeLiters: cuFtToLiters(10.2),
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 382,
      torqueLbFt: 368,
      zeroToSixtySeconds: 3.9,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 23, highwayMpg: 31, combinedMpg: 26 },
    // Edmunds 3.0 Premium starting MSRP excl. destination.
    baseMsrpCents: 6_053_500,
    specUrl:
      "https://www.toyota.com/content/dam/toyota/brochures/pdf/2025/grsupra_ebrochure.pdf",
    specTitle: "2025 Toyota GR Supra eBrochure (Toyota)",
    priceUrl: "https://www.edmunds.com/toyota/gr-supra/2025/trims/",
    priceTitle: "2025 Toyota GR Supra Trims Comparison (Edmunds)",
  },
];

const STATIC_SKIPPED = [
  "2020 Toyota 86 Base / Hakone Edition: GT seeded as last-year representative (Toyota MY20 brochure + Edmunds)",
  "2020 Toyota 86 automatic: manual row uses full EPA id 41950 and 205 hp brochure ratings; auto skipped to avoid duplicate trim rows",
  "2025 Toyota GR86 manual / Hakone Edition: Base + Premium automatic seeded with EPA id 48822; manuals (EPA 48821) skipped to avoid transmission duplicates",
  "2025 Toyota GR Supra 2.0: US retail lineup dropped the four-cylinder for MY2025 (Edmunds); last retail MY2024 2.0 seeded (EPA 46636). EPA still lists id 47966",
  "2025 Toyota GR Supra 3.0 / 3.0 Premium manual: 8AT seeded with EPA id 47967; MT (EPA 47968) skipped to avoid duplicate trim rows",
  "MY 2017–2019 86 / MY 2022–2024 GR86 / prior Supra years: prefer last-year 86, MY2025 GR86, and MY2025 Supra 3.0 family",
];

const DESTINATION_SOURCE = {
  slug: "toyota-dph-passenger-car-aug-2024",
  title:
    "Toyota Delivery, Processing & Handling — passenger cars $1,135 (Aug 2024+)",
  url: "https://www.toyota.com/content/dam/toyota/brochures/pdf/2025/gr86_ebrochure.pdf",
  type: "MANUFACTURER" as const,
  publisher: "Toyota",
};

export async function seedToyotaSports(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];
  const destinationCents = TOYOTA_DPH_CENTS.passengerCar;

  const modelCache = new Map<
    ModelSlug,
    {
      id: string;
      generations: Map<string, { id: string; years: Map<number, string> }>;
    }
  >();

  async function ensureModelYear(trim: TrimSeed) {
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
        },
        update: {
          displayName: trim.generationDisplayName,
          startYear: trim.generationStartYear,
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

  const destinationSource = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE.slug,
    title: DESTINATION_SOURCE.title,
    publisher: DESTINATION_SOURCE.publisher,
    url: DESTINATION_SOURCE.url,
    type: DESTINATION_SOURCE.type,
  });

  const claimedImages = new Set<string>();

  for (const trim of TRIMS) {
    try {
      if (claimedImages.has(trim.imageUrl)) {
        throw new Error(`Duplicate image URL within module: ${trim.imageUrl}`);
      }
      claimedImages.add(trim.imageUrl);

      const imageUrl = await assertImageUrlOk(trim.imageUrl);
      const imageSource = await ensureImageSource(prisma, {
        slug: `image-${trim.slug}`,
        title: `${trim.name} exterior (${trim.imagePublisher})`,
        pageUrl: trim.imagePageUrl,
        publisher: trim.imagePublisher,
      });

      const modelYearId = await ensureModelYear(trim);

      const engine = await ensureToyotaEngine(prisma, {
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
        slug: `toyota-sports-${trim.slug}-specs`,
        title: trim.specTitle,
        publisher: "Toyota",
        url: trim.specUrl,
        type: "MANUFACTURER",
      });

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-${trim.year}-${trim.slug}`,
        title: `EPA Fuel Economy — ${trim.year} Toyota ${trim.name}`,
        publisher: "U.S. EPA",
        url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
        type: "GOVERNMENT",
      });

      const priceSource = await upsertCatalogueSource(prisma, {
        slug: `edmunds-price-${trim.slug}`,
        title: trim.priceTitle,
        publisher: "Edmunds",
        url: trim.priceUrl,
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
          description: `${trim.year} Toyota ${trim.name} (US).`,
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
          description: `${trim.year} Toyota ${trim.name} (US).`,
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
              amountCents: destinationCents,
              currency: "USD",
              effectiveAt: pricingDate,
            },
            update: {
              amountCents: destinationCents,
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
              credit: trim.imagePublisher,
              position: 0,
            },
            update: {
              sourceId: imageSource.id,
              url: imageUrl,
              alt: trim.imageAlt,
              credit: trim.imagePublisher,
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
          "Power, torque, 0–60 mph, and top speed from Toyota eBrochure / cited test",
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
          `Delivery, Processing & Handling $${(destinationCents / 100).toFixed(0)}`,
        ),
        upsertCitation(
          prisma,
          imageSource.id,
          "VehicleImage",
          image.id,
          "url",
          `${trim.imagePublisher} exterior asset`,
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
