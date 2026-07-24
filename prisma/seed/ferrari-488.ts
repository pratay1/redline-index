/**
 * Ferrari 488 family seed module (US market).
 * Final US years only — one complete trim each:
 * - 488 GTB (MY2019)
 * - 488 Spider (MY2019; last US year — not offered for MY2020)
 * - 488 Pista (MY2020)
 * - 488 Pista Spider (MY2020)
 * Mid-years intentionally STATIC_SKIPPED. Idempotent — safe to re-run.
 * Does not wire itself into prisma/seed.ts.
 *
 * Exterior images (unique, HEAD-verified exteriors — no interiors):
 * - https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/2017_Ferrari_488_GTB_Automatic_3.9_Front.jpg/1280px-2017_Ferrari_488_GTB_Automatic_3.9_Front.jpg
 * - https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/2018_Ferrari_488_Spider.jpg/1280px-2018_Ferrari_488_Spider.jpg
 * - https://www.motortrend.com/uploads/sites/11/2018/06/2019-Ferrari-488-Pista-09-1.jpg
 * - https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Ferrari_488_pista_spider_-_Exterior.jpg/1280px-Ferrari_488_pista_spider_-_Exterior.jpg
 */
import {
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

type ModelSlug =
  | "ferrari-488-gtb"
  | "ferrari-488-spider"
  | "ferrari-488-pista"
  | "ferrari-488-pista-spider";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: string;
  year: number;
  generationCode: string;
  generationDisplayName: string;
  generationStartYear: number;
  generationEndYear: number;
  bodyStyle: "COUPE" | "CABRIOLET";
  drivetrain: "RWD";
  imageUrl: string;
  imagePageUrl: string;
  imagePublisher: string;
  imageAlt: string;
  imageCredit: string;
  epaId: string;
  description: string;
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
  /** Period destination & handling in cents (iSeeCars Monroney). */
  destinationCents: number;
  specUrl: string;
  specTitle: string;
  priceUrl: string;
  priceTitle: string;
};

const TRIMS: TrimSeed[] = [
  {
    slug: "2019-ferrari-488-gtb-us",
    name: "488 GTB",
    modelSlug: "ferrari-488-gtb",
    modelName: "488 GTB",
    year: 2019,
    generationCode: "F142M",
    generationDisplayName: "F142M (2015–2019)",
    generationStartYear: 2015,
    generationEndYear: 2019,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/2017_Ferrari_488_GTB_Automatic_3.9_Front.jpg/1280px-2017_Ferrari_488_GTB_Automatic_3.9_Front.jpg",
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:2017_Ferrari_488_GTB_Automatic_3.9_Front.jpg",
    imagePublisher: "Wikimedia Commons",
    imageAlt: "2019 Ferrari 488 GTB coupe exterior (Rosso Corsa, showroom)",
    imageCredit: "Vauxford / Wikimedia Commons",
    // EPA Auto (AM7) SIDI; Stop-Start id 40081 — 16/22/18
    epaId: "40081",
    description:
      "2019 Ferrari 488 GTB (US). Final US model year for the mid-engine twin-turbo V8 berlinetta before the F8 Tributo.",
    engine: {
      slug: "ferrari-f154cb-488",
      name: "3.9L twin-turbo V8 (F154CB)",
      code: "F154CB",
      displacementCc: 3902,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbo",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-7dct-f1-488",
      name: "7-speed dual-clutch F1 DCT",
    },
    dimensions: {
      // Edmunds MY2019 488 GTB features/specs; tracks Ferrari technical (mm→in).
      lengthIn: 179.8,
      widthIn: 76.9,
      heightIn: 47.8,
      wheelbaseIn: 104.3,
      frontTrackIn: mmToIn(1679),
      rearTrackIn: mmToIn(1647),
      curbWeightKg: lbsToKg(3252),
      cargoVolumeLiters: cuFtToLiters(8.1),
      seatingCapacity: 2,
    },
    performance: {
      // Edmunds 661 hp / 561 lb-ft; Ferrari 0–100 km/h 3.0 s / 330 km/h top.
      powerHp: 661,
      torqueLbFt: 561,
      zeroToSixtySeconds: 3.0,
      topSpeedMph: 205,
    },
    fuelEconomy: { cityMpg: 16, highwayMpg: 22, combinedMpg: 18 },
    // iSeeCars / EPA band MSRP $262,647 excl. destination.
    baseMsrpCents: 26_264_700,
    destinationCents: 375_000,
    specUrl: "https://www.edmunds.com/ferrari/488-gtb/2019/features-specs/",
    specTitle: "2019 Ferrari 488 GTB Specs & Features (Edmunds)",
    priceUrl: "https://www.iseecars.com/car/ferrari-488-gtb-price",
    priceTitle: "2019 Ferrari 488 GTB Price / Destination (iSeeCars)",
  },
  {
    slug: "2019-ferrari-488-spider-us",
    name: "488 Spider",
    modelSlug: "ferrari-488-spider",
    modelName: "488 Spider",
    year: 2019,
    generationCode: "F142M",
    generationDisplayName: "F142M Spider (2016–2019)",
    generationStartYear: 2016,
    generationEndYear: 2019,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/2018_Ferrari_488_Spider.jpg/1280px-2018_Ferrari_488_Spider.jpg",
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:2018_Ferrari_488_Spider.jpg",
    imagePublisher: "Wikimedia Commons",
    imageAlt: "2019 Ferrari 488 Spider retractable-hardtop exterior",
    imageCredit: "Wikimedia Commons",
    // EPA Auto (AM7) SIDI; Stop-Start id 40082 — 16/22/18
    epaId: "40082",
    description:
      "2019 Ferrari 488 Spider (US). Final US model year for the folding-hardtop Spider; MY2020 488 lineup was Pista-only.",
    engine: {
      slug: "ferrari-f154cb-488",
      name: "3.9L twin-turbo V8 (F154CB)",
      code: "F154CB",
      displacementCc: 3902,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbo",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-7dct-f1-488",
      name: "7-speed dual-clutch F1 DCT",
    },
    dimensions: {
      // Edmunds MY2019 488 Spider; tracks shared with GTB (Ferrari technical).
      lengthIn: 179.8,
      widthIn: 76.9,
      heightIn: 47.7,
      wheelbaseIn: 104.3,
      frontTrackIn: mmToIn(1679),
      rearTrackIn: mmToIn(1647),
      curbWeightKg: lbsToKg(3362),
      cargoVolumeLiters: cuFtToLiters(8.1),
      seatingCapacity: 2,
    },
    performance: {
      // Edmunds 661 hp / 561 lb-ft; Ferrari Spider top 325 km/h; 0–100 3.0 s.
      powerHp: 661,
      torqueLbFt: 561,
      zeroToSixtySeconds: 3.0,
      topSpeedMph: 202,
    },
    fuelEconomy: { cityMpg: 16, highwayMpg: 22, combinedMpg: 18 },
    // iSeeCars / EPA band MSRP $291,627 excl. destination.
    baseMsrpCents: 29_162_700,
    destinationCents: 375_000,
    specUrl: "https://www.edmunds.com/ferrari/488-spider/2019/features-specs/",
    specTitle: "2019 Ferrari 488 Spider Specs & Features (Edmunds)",
    priceUrl: "https://www.iseecars.com/car/ferrari-488-spider-price",
    priceTitle: "2019 Ferrari 488 Spider Price / Destination (iSeeCars)",
  },
  {
    slug: "2020-ferrari-488-pista-us",
    name: "488 Pista",
    modelSlug: "ferrari-488-pista",
    modelName: "488 Pista",
    year: 2020,
    generationCode: "F142M",
    generationDisplayName: "F142M Pista (2019–2020)",
    generationStartYear: 2019,
    generationEndYear: 2020,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl:
      "https://www.motortrend.com/uploads/sites/11/2018/06/2019-Ferrari-488-Pista-09-1.jpg",
    imagePageUrl:
      "https://www.motortrend.com/features/2019-ferrari-488-pista-photo-gallery",
    imagePublisher: "MotorTrend",
    imageAlt: "2020 Ferrari 488 Pista coupe exterior (Rosso Corsa, S-Duct)",
    imageCredit: "MotorTrend",
    // EPA Auto (AM7) id 41688 — 15/20/17
    epaId: "41688",
    description:
      "2020 Ferrari 488 Pista (US). Final US model year for the track-focused special-series coupe (720 CV / 711 hp twin-turbo V8).",
    engine: {
      slug: "ferrari-f154cr-488-pista",
      name: "3.9L twin-turbo V8 (F154CR)",
      code: "F154CR",
      displacementCc: 3902,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbo",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-7dct-f1-488",
      name: "7-speed dual-clutch F1 DCT",
    },
    dimensions: {
      // Car and Driver MY2020 488 Pista Coupe specs.
      lengthIn: 181.3,
      widthIn: 77.8,
      heightIn: 47.5,
      wheelbaseIn: 104.3,
      frontTrackIn: 66.1,
      rearTrackIn: 64.9,
      curbWeightKg: lbsToKg(3054),
      cargoVolumeLiters: cuFtToLiters(8.1),
      seatingCapacity: 2,
    },
    performance: {
      // C&D / MotorTrend 711 hp / 567–568 lb-ft; ~2.8 s 0–60; 211 mph top.
      powerHp: 711,
      torqueLbFt: 568,
      zeroToSixtySeconds: 2.8,
      topSpeedMph: 211,
    },
    fuelEconomy: { cityMpg: 15, highwayMpg: 20, combinedMpg: 17 },
    // iSeeCars MSRP $345,300 excl. destination ($3,950 dest.; $1,000 GGT separate).
    baseMsrpCents: 34_530_000,
    destinationCents: 395_000,
    specUrl:
      "https://www.caranddriver.com/ferrari/488/specs/2020/ferrari_488gtb_ferrari-488-pista_2020",
    specTitle: "2020 Ferrari 488 Pista Coupe Specs (Car and Driver)",
    priceUrl: "https://www.iseecars.com/car/ferrari-488-pista-price",
    priceTitle: "2020 Ferrari 488 Pista Price / Destination (iSeeCars)",
  },
  {
    slug: "2020-ferrari-488-pista-spider-us",
    name: "488 Pista Spider",
    modelSlug: "ferrari-488-pista-spider",
    modelName: "488 Pista Spider",
    year: 2020,
    generationCode: "F142M",
    generationDisplayName: "F142M Pista Spider (2019–2020)",
    generationStartYear: 2019,
    generationEndYear: 2020,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Ferrari_488_pista_spider_-_Exterior.jpg/1280px-Ferrari_488_pista_spider_-_Exterior.jpg",
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:Ferrari_488_pista_spider_-_Exterior.jpg",
    imagePublisher: "Wikimedia Commons",
    imageAlt: "2020 Ferrari 488 Pista Spider exterior (open-top, coastal road)",
    imageCredit: "Ferrari / Wikimedia Commons",
    // EPA Auto (AM7) id 41689 — 15/19/17
    epaId: "41689",
    description:
      "2020 Ferrari 488 Pista Spider (US). Final US model year for the folding-hardtop Pista Spider special series.",
    engine: {
      slug: "ferrari-f154cr-488-pista",
      name: "3.9L twin-turbo V8 (F154CR)",
      code: "F154CR",
      displacementCc: 3902,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbo",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-7dct-f1-488",
      name: "7-speed dual-clutch F1 DCT",
    },
    dimensions: {
      // Cars.com / CarBuzz MY2020 Pista Spider; Ferrari kerb 1,485 kg ≈ 3,274 lb.
      lengthIn: 181.3,
      widthIn: 77.8,
      heightIn: 47.5,
      wheelbaseIn: 104.3,
      frontTrackIn: 66.1,
      rearTrackIn: 64.9,
      curbWeightKg: lbsToKg(3274),
      cargoVolumeLiters: cuFtToLiters(8.1),
      seatingCapacity: 2,
    },
    performance: {
      // Same F154CR output as Pista coupe; Ferrari 0–100 km/h 2.85 s / 340 km/h.
      powerHp: 711,
      torqueLbFt: 568,
      zeroToSixtySeconds: 2.85,
      topSpeedMph: 211,
    },
    fuelEconomy: { cityMpg: 15, highwayMpg: 19, combinedMpg: 17 },
    // iSeeCars MSRP $350,000 excl. destination ($3,750).
    baseMsrpCents: 35_000_000,
    destinationCents: 375_000,
    specUrl:
      "https://www.caranddriver.com/ferrari/488/specs/2020/ferrari_488gtb_ferrari-488-pista-spider_2020",
    specTitle: "2020 Ferrari 488 Pista Spider Specs (Car and Driver)",
    priceUrl: "https://www.iseecars.com/car/ferrari-488-pista-spider-price",
    priceTitle: "2020 Ferrari 488 Pista Spider Price / Destination (iSeeCars)",
  },
];

const STATIC_SKIPPED = [
  "2015–2018 Ferrari 488 GTB: mid-years skipped — final US MY2019 seeded (EPA id 40081)",
  "2016–2018 Ferrari 488 Spider: mid-years skipped — final US MY2019 seeded (EPA id 40082)",
  "2019 Ferrari 488 Pista / 488 Pista Spider: prior US year skipped — final MY2020 seeded (EPA ids 41688 / 41689)",
  "2020 Ferrari 488 GTB / 488 Spider: not offered in US MY2020 (Pista / Pista Spider only)",
  "EPA non–stop-start GTB/Spider variants (ids 40067 / 40068, city 15): Stop-Start rows seeded instead",
];

export async function seedFerrari488(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

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
          endYear: trim.generationEndYear,
        },
        update: {
          displayName: trim.generationDisplayName,
          startYear: trim.generationStartYear,
          endYear: trim.generationEndYear,
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
        slug: `image-${trim.slug}`,
        title: `${trim.name} exterior (${trim.imagePublisher})`,
        pageUrl: trim.imagePageUrl,
        publisher: trim.imagePublisher,
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
          type: "DUAL_CLUTCH",
          gearCount: 7,
        },
        update: {
          name: trim.transmission.name,
          type: "DUAL_CLUTCH",
          gearCount: 7,
        },
      });

      const specSource = await upsertCatalogueSource(prisma, {
        slug: `ferrari-488-${trim.slug}-specs`,
        title: trim.specTitle,
        publisher: trim.specUrl.includes("edmunds")
          ? "Edmunds"
          : "Car and Driver",
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
        slug: `iseecars-price-${trim.slug}`,
        title: trim.priceTitle,
        publisher: "iSeeCars",
        url: trim.priceUrl,
        type: "THIRD_PARTY",
      });

      const destinationSource = await upsertCatalogueSource(prisma, {
        slug: `iseecars-dest-${trim.slug}`,
        title: trim.priceTitle,
        publisher: "iSeeCars",
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
          description: trim.description,
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
          description: trim.description,
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
              credit: trim.imageCredit,
              position: 0,
            },
            update: {
              sourceId: imageSource.id,
              url: imageUrl,
              alt: trim.imageAlt,
              credit: trim.imageCredit,
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
          "Power, torque, 0–60 mph, and top speed from cited Edmunds / Car and Driver / Ferrari claims",
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
          `Base MSRP excluding destination (${trim.year} US, iSeeCars)`,
        ),
        upsertCitation(
          prisma,
          destinationSource.id,
          "VehiclePrice",
          destination.id,
          "amountCents",
          `US destination and handling $${(trim.destinationCents / 100).toFixed(0)} (iSeeCars)`,
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
