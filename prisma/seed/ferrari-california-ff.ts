/**
 * Ferrari California T / FF seed module (US market).
 * Final US model year only — one representative trim each.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Years:
 * - California T → final MY 2018 (1 trim)
 * - California T Handling Speciale → final MY 2018 (1 trim)
 * - FF → final MY 2016 (1 trim)
 *
 * Exterior images (unique, HEAD-verified JPEGs):
 * - https://www.auto-data.net/images/f123/Ferrari-California-T.jpg
 * - https://www.auto-data.net/images/f0/file9073387.jpg
 * - https://www.auto-data.net/images/f95/Ferrari-FF.jpg
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

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

type ModelSlug = "ferrari-california-t" | "ferrari-ff";

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
  bodyStyle: "CABRIOLET" | "HATCHBACK";
  drivetrain: "RWD" | "AWD";
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
  destinationCents: number;
  destinationSourceUrl: string;
  destinationSourceTitle: string;
  specUrl: string;
  specTitle: string;
  specPublisher: string;
  priceUrl: string;
  priceTitle: string;
  pricePublisher: string;
};

const TRIMS: TrimSeed[] = [
  {
    slug: "2018-ferrari-california-t-us",
    name: "California T",
    modelSlug: "ferrari-california-t",
    modelName: "California T",
    year: 2018,
    generationCode: "F149",
    generationDisplayName: "California T (F149)",
    generationStartYear: 2014,
    generationEndYear: 2018,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f123/Ferrari-California-T.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-california-t-3.9-v8-560hp-21995",
    imageAlt: "2018 Ferrari California T convertible exterior",
    // EPA Auto (AM7) 3.9L Turbo SIDI id 38675 — 16/23/18
    epaId: "38675",
    engine: {
      slug: "ferrari-f154bb-v8-560",
      name: "3.9L twin-turbo V8 (F154BB)",
      code: "F154BB",
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
      // Car and Driver MY2018 exterior / tracks; curb 3,813 lb; trunk 12 cu ft.
      lengthIn: 179.9,
      widthIn: 75.2,
      heightIn: 52.0,
      wheelbaseIn: 105.1,
      frontTrackIn: 64.2,
      rearTrackIn: 63.2,
      curbWeightKg: lbsToKg(3813),
      cargoVolumeLiters: cuFtToLiters(12),
      seatingCapacity: 4,
    },
    performance: {
      // US SAE C&D 553 hp / 557 lb-ft; Ferrari 0–100 km/h 3.6 s; top 196 mph.
      powerHp: 553,
      torqueLbFt: 557,
      zeroToSixtySeconds: 3.6,
      topSpeedMph: 196,
    },
    fuelEconomy: { cityMpg: 16, highwayMpg: 23, combinedMpg: 18 },
    // Cars.com / CarBuzz published MSRP $202,723 (excl. destination fee row).
    baseMsrpCents: 20_272_300,
    destinationCents: FERRARI_DESTINATION_CENTS,
    destinationSourceUrl: "https://www.iseecars.com/cars/ferrari",
    destinationSourceTitle:
      "Ferrari US destination & handling $5,000 (FERRARI_DESTINATION_CENTS / iSeeCars Monroney-style)",
    specUrl:
      "https://www.caranddriver.com/ferrari/california-t/specs/2018/ferrari_california-t_california-t-convertible_2018",
    specTitle: "2018 Ferrari California T Convertible — Car and Driver specs",
    specPublisher: "Car and Driver",
    priceUrl: "https://www.cars.com/research/ferrari-california-2018/specs/",
    priceTitle: "2018 Ferrari California T — Cars.com specs & MSRP",
    pricePublisher: "Cars.com",
  },
  {
    slug: "2018-ferrari-california-t-handling-speciale-us",
    name: "California T Handling Speciale",
    modelSlug: "ferrari-california-t",
    modelName: "California T",
    year: 2018,
    generationCode: "F149",
    generationDisplayName: "California T (F149)",
    generationStartYear: 2014,
    generationEndYear: 2018,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    // Distinct blue press/show exterior (not the red f123 hero).
    imageUrl: "https://www.auto-data.net/images/f0/file9073387.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-california-t-generation-4555",
    imageAlt: "2018 Ferrari California T Handling Speciale convertible exterior",
    // Same EPA powertrain band as California T (package does not change FE).
    epaId: "38675",
    engine: {
      slug: "ferrari-f154bb-v8-560",
      name: "3.9L twin-turbo V8 (F154BB)",
      code: "F154BB",
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
      // Same shell as California T (C&D MY2018).
      lengthIn: 179.9,
      widthIn: 75.2,
      heightIn: 52.0,
      wheelbaseIn: 105.1,
      frontTrackIn: 64.2,
      rearTrackIn: 63.2,
      curbWeightKg: lbsToKg(3813),
      cargoVolumeLiters: cuFtToLiters(12),
      seatingCapacity: 4,
    },
    performance: {
      // Same 553/557 as base; C&D HS first-drive est. 0–60 3.3 s; top 196 mph.
      powerHp: 553,
      torqueLbFt: 557,
      zeroToSixtySeconds: 3.3,
      topSpeedMph: 196,
    },
    fuelEconomy: { cityMpg: 16, highwayMpg: 23, combinedMpg: 18 },
    // C&D / MotorTrend BASE PRICE $210,843 (= $202,723 + $8,120 HS package).
    baseMsrpCents: 21_084_300,
    destinationCents: FERRARI_DESTINATION_CENTS,
    destinationSourceUrl: "https://www.iseecars.com/cars/ferrari",
    destinationSourceTitle:
      "Ferrari US destination & handling $5,000 (FERRARI_DESTINATION_CENTS / iSeeCars Monroney-style)",
    specUrl:
      "https://www.caranddriver.com/reviews/a15101622/2017-ferrari-california-t-handling-speciale-first-drive-review/",
    specTitle:
      "2017 Ferrari California T Handling Speciale First Drive — Car and Driver",
    specPublisher: "Car and Driver",
    priceUrl:
      "https://www.caranddriver.com/reviews/a15101622/2017-ferrari-california-t-handling-speciale-first-drive-review/",
    priceTitle:
      "California T Handling Speciale base price $210,843 (Car and Driver)",
    pricePublisher: "Car and Driver",
  },
  {
    slug: "2016-ferrari-ff-us",
    name: "FF",
    modelSlug: "ferrari-ff",
    modelName: "FF",
    year: 2016,
    generationCode: "F151",
    generationDisplayName: "FF (F151)",
    generationStartYear: 2011,
    generationEndYear: 2016,
    bodyStyle: "HATCHBACK",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f95/Ferrari-FF.jpg",
    imagePageUrl: "https://www.auto-data.net/en/ferrari-ff-generation-1489",
    imageAlt: "2016 Ferrari FF shooting-brake exterior",
    // EPA Auto (AM7) 6.3L SIDI id 36960 — 11/17/13
    epaId: "36960",
    engine: {
      slug: "ferrari-f140eb-v12-660",
      name: "6.3L V12 naturally aspirated (F140EB)",
      code: "F140EB",
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
      // Car and Driver MY2016 exterior / tracks; curb 4,145 lb; cargo seat-up 15.9 cu ft.
      lengthIn: 193.2,
      widthIn: 76.9,
      heightIn: 54.3,
      wheelbaseIn: 117.7,
      frontTrackIn: 66.0,
      rearTrackIn: 65.4,
      curbWeightKg: lbsToKg(4145),
      cargoVolumeLiters: cuFtToLiters(15.9),
      seatingCapacity: 4,
    },
    performance: {
      // US SAE C&D 651 hp / 503 lb-ft; Ferrari 0–100 km/h 3.7 s; top 208 mph.
      powerHp: 651,
      torqueLbFt: 503,
      zeroToSixtySeconds: 3.7,
      topSpeedMph: 208,
    },
    fuelEconomy: { cityMpg: 11, highwayMpg: 17, combinedMpg: 13 },
    // Car and Driver MY2016 FF 2dr HB MSRP $303,750.
    baseMsrpCents: 30_375_000,
    destinationCents: FERRARI_DESTINATION_CENTS,
    destinationSourceUrl: "https://www.iseecars.com/cars/ferrari",
    destinationSourceTitle:
      "Ferrari US destination & handling $5,000 (FERRARI_DESTINATION_CENTS / iSeeCars Monroney-style)",
    specUrl: "https://www.caranddriver.com/ferrari/ff/specs",
    specTitle: "2016 Ferrari FF 2dr HB — Car and Driver specs",
    specPublisher: "Car and Driver",
    priceUrl: "https://www.caranddriver.com/ferrari/ff/specs",
    priceTitle: "2016 Ferrari FF MSRP — Car and Driver specs",
    pricePublisher: "Car and Driver",
  },
];

const STATIC_SKIPPED = [
  "California T MY 2015–2017: prefer final US MY 2018 (EPA 38675 / 38676)",
  "California T MY 2014: first US year of F149 — outside final-year scope",
  "California T Handling Speciale mid-years (MY 2016–2017): prefer final US MY 2018 package row",
  "California T EPA stop-start id 38676: same 3.9T/AM7 band as 38675 — base row covers FE",
  "FF MY 2012–2015: prefer final US MY 2016 (EPA 36960 / 36961)",
  "FF EPA stop-start id 36961: same 6.3 V12/AM7 band as 36960 — base row covers FE",
];

export async function seedFerrariCaliforniaFf(
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
        slug: `ferrari-california-ff-${trim.slug}-specs`,
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
        title: trim.priceTitle,
        publisher: trim.pricePublisher,
        url: trim.priceUrl,
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
          `Destination & handling $${(trim.destinationCents / 100).toFixed(0)}`,
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
