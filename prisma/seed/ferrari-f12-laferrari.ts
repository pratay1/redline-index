/**
 * Ferrari F12berlinetta / F12tdf / LaFerrari / LaFerrari Aperta US seed module.
 * Last US model year only — one complete trim each.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Years:
 * - F12berlinetta → final MY 2017 (EPA 37802)
 * - F12tdf → final MY 2017 (EPA 37605)
 * - LaFerrari coupe → final MY 2016 (EPA 35841 cert as 2014 LaFerrari Hybrid)
 * - LaFerrari Aperta → final MY 2018 (EPA 38047 cert as 2017; CarBuzz lists MY2018)
 *
 * Exterior images (unique auto-data.net JPEG; do not reuse across Ferrari modules):
 * - https://www.auto-data.net/images/f97/Ferrari-F12-Berlinetta.jpg
 * - https://www.auto-data.net/images/f101/Ferrari-F12tdf.jpg
 * - https://www.auto-data.net/images/f89/Ferrari-LaFerrari.jpg
 * - https://www.auto-data.net/images/f125/Ferrari-LaFerrari-Aperta.jpg
 */
import type { FuelType } from "../../src/generated/prisma/client";
import {
  assertImageUrlOk,
  ensureAudit,
  ensureFerrariEngine,
  ensureImageSource,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./ferrari-shared";

const MM_TO_IN = 0.0393700787;
const NM_TO_LBFT = 0.737562149;

function mmToIn(mm: number) {
  return Math.round(mm * MM_TO_IN * 10) / 10;
}

function nmToLbFt(nm: number) {
  return Math.round(nm * NM_TO_LBFT);
}

/** Approximate US SAE from Ferrari CV (matches GTC4Lusso 690 CV → 680 hp pattern). */
function cvToHp(cv: number) {
  return Math.round(cv * 0.9863);
}

type ModelSlug =
  | "ferrari-f12berlinetta"
  | "ferrari-f12tdf"
  | "ferrari-laferrari"
  | "ferrari-laferrari-aperta";

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
  bodyStyle: "COUPE" | "CABRIOLET";
  drivetrain: "RWD";
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
  epaId: string;
  /** Optional note when EPA model year differs from catalogue year. */
  epaNote?: string;
  engine: {
    slug: string;
    name: string;
    code: string;
    fuelType: FuelType;
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
    frontTrackIn?: number;
    rearTrackIn?: number;
    curbWeightKg: number;
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
    slug: "2017-ferrari-f12berlinetta-us",
    name: "F12berlinetta",
    modelSlug: "ferrari-f12berlinetta",
    modelName: "F12berlinetta",
    year: 2017,
    generationCode: "F152",
    generationDisplayName: "F12berlinetta (F152)",
    generationStartYear: 2012,
    generationEndYear: 2017,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f97/Ferrari-F12-Berlinetta.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-f12-berlinetta-6.3-v12-740hp-18348",
    imageAlt: "2017 Ferrari F12berlinetta coupe exterior",
    // EPA Auto (AM7) id 37802 — 12/16/13 (SIDI; stop-start).
    epaId: "37802",
    engine: {
      slug: "ferrari-f140fc-v12-740",
      name: "6.3L V12 naturally aspirated (F140FC)",
      code: "F140FC",
      fuelType: "PETROL",
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
      // Ferrari.com technical (mm→in); kerb 1630 kg (dry 1525).
      lengthIn: mmToIn(4618),
      widthIn: mmToIn(1942),
      heightIn: mmToIn(1273),
      wheelbaseIn: mmToIn(2720),
      frontTrackIn: mmToIn(1665),
      rearTrackIn: mmToIn(1618),
      curbWeightKg: 1630,
      seatingCapacity: 2,
    },
    performance: {
      // Ferrari 740 CV / 690 Nm; US SAE ~731 hp; 0–100 km/h 3.1 s; top >211 mph.
      powerHp: cvToHp(740),
      torqueLbFt: nmToLbFt(690),
      zeroToSixtySeconds: 3.1,
      topSpeedMph: 211,
    },
    fuelEconomy: { cityMpg: 12, highwayMpg: 16, combinedMpg: 13 },
    // CarGurus / Carfax / iSeeCars original MSRP $319,995; destination $3,750.
    baseMsrpCents: 31_999_500,
    destinationCents: 375_000,
    destinationSourceUrl:
      "https://www.iseecars.com/car/ferrari-f12berlinetta-price",
    destinationSourceTitle:
      "2017 Ferrari F12berlinetta destination charge $3,750 (iSeeCars)",
    specUrl: "https://www.ferrari.com/en-EN/auto/f12-berlinetta",
    specTitle: "Ferrari F12berlinetta technical details (Ferrari)",
    specPublisher: "Ferrari",
    priceUrl: "https://www.cargurus.com/research/2017-Ferrari-F12-Berlinetta-c26608",
    priceTitle: "2017 Ferrari F12 Berlinetta original MSRP (CarGurus)",
    pricePublisher: "CarGurus",
  },
  {
    slug: "2017-ferrari-f12tdf-us",
    name: "F12tdf",
    modelSlug: "ferrari-f12tdf",
    modelName: "F12tdf",
    year: 2017,
    generationCode: "F152-TDF",
    generationDisplayName: "F12tdf (F152)",
    generationStartYear: 2015,
    generationEndYear: 2017,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f101/Ferrari-F12tdf.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-f12tdf-6.3-v12-780hp-dct-22842",
    imageAlt: "2017 Ferrari F12tdf coupe exterior",
    // EPA Auto (AM7) id 37605 — 11/15/12.
    epaId: "37605",
    engine: {
      slug: "ferrari-f140fg-v12-780",
      name: "6.3L V12 naturally aspirated (F140FG)",
      code: "F140FG",
      fuelType: "PETROL",
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
      // Ferrari.com F12tdf technical; kerb 1520 kg (dry 1415).
      lengthIn: mmToIn(4656),
      widthIn: mmToIn(1961),
      heightIn: mmToIn(1273),
      wheelbaseIn: mmToIn(2720),
      frontTrackIn: mmToIn(1673),
      rearTrackIn: mmToIn(1648),
      curbWeightKg: 1520,
      seatingCapacity: 2,
    },
    performance: {
      // Ferrari 780 CV / 705 Nm; 0–100 km/h 2.9 s; top >340 km/h.
      powerHp: cvToHp(780),
      torqueLbFt: nmToLbFt(705),
      zeroToSixtySeconds: 2.9,
      topSpeedMph: 211,
    },
    fuelEconomy: { cityMpg: 11, highwayMpg: 15, combinedMpg: 12 },
    // MotorTrend MY2017 trim price $503,750 incl. dest $3,750 → base $500,000.
    baseMsrpCents: 50_000_000,
    destinationCents: 375_000,
    destinationSourceUrl:
      "https://www.iseecars.com/car/ferrari-f12berlinetta-price",
    destinationSourceTitle:
      "Ferrari North America destination $3,750 (iSeeCars F12 Monroney-era)",
    specUrl: "https://www.ferrari.com/en-EN/auto/f12tdf",
    specTitle: "Ferrari F12tdf technical details (Ferrari)",
    specPublisher: "Ferrari",
    priceUrl: "https://www.motortrend.com/cars/ferrari/f12berlinetta/2017",
    priceTitle: "2017 Ferrari F12 / F12tdf trims and pricing (MotorTrend)",
    pricePublisher: "MotorTrend",
  },
  {
    slug: "2016-ferrari-laferrari-us",
    name: "LaFerrari",
    modelSlug: "ferrari-laferrari",
    modelName: "LaFerrari",
    year: 2016,
    generationCode: "F150",
    generationDisplayName: "LaFerrari (F150)",
    generationStartYear: 2013,
    generationEndYear: 2016,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f89/Ferrari-LaFerrari.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-laferrari-6.3-v12-963hp-hybrid-dct-22008",
    imageAlt: "2016 Ferrari LaFerrari coupe exterior",
    // EPA lists only MY2014 "LaFerrari Hybrid" id 35841 — 12/16/14 (atvType Hybrid).
    epaId: "35841",
    epaNote:
      "EPA vehicle id 35841 is labelled 2014 LaFerrari Hybrid; identical HY-KERS powertrain through coupe end (MY2016). EPA did not re-list MY2015–2016.",
    engine: {
      slug: "ferrari-f140fe-v12-hykers",
      name: "6.3L V12 HY-KERS hybrid (F140FE)",
      code: "F140FE",
      fuelType: "HYBRID",
      displacementCc: 6262,
      cylinderCount: 12,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: "HY-KERS (120 kW / 163 CV electric motor; not plug-in)",
    },
    transmission: {
      slug: "ferrari-f1-dct-7",
      name: "7-speed F1 dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // Ferrari / auto-data mm→in; kerb auto-data 1430 kg.
      lengthIn: mmToIn(4702),
      widthIn: mmToIn(1992),
      heightIn: mmToIn(1116),
      wheelbaseIn: mmToIn(2650),
      curbWeightKg: 1430,
      seatingCapacity: 2,
    },
    performance: {
      // Ferrari system 963 CV / >900 Nm; 0–100 km/h <3 s; top 350 km/h.
      powerHp: cvToHp(963),
      torqueLbFt: nmToLbFt(900),
      zeroToSixtySeconds: 2.9,
      topSpeedMph: 217,
    },
    fuelEconomy: { cityMpg: 12, highwayMpg: 16, combinedMpg: 14 },
    // CarBuzz 2016 LaFerrari MSRP.
    baseMsrpCents: 141_636_200,
    destinationCents: 375_000,
    destinationSourceUrl:
      "https://www.iseecars.com/car/ferrari-f12berlinetta-price",
    destinationSourceTitle:
      "Ferrari North America destination $3,750 (iSeeCars contemporary Monroney)",
    specUrl: "https://www.ferrari.com/en-EN/auto/laferrari",
    specTitle: "Ferrari LaFerrari technical details (Ferrari)",
    specPublisher: "Ferrari",
    priceUrl: "https://carbuzz.com/cars/ferrari/laferrari/2016/",
    priceTitle: "2016 Ferrari LaFerrari pricing (CarBuzz)",
    pricePublisher: "CarBuzz",
  },
  {
    slug: "2018-ferrari-laferrari-aperta-us",
    name: "LaFerrari Aperta",
    modelSlug: "ferrari-laferrari-aperta",
    modelName: "LaFerrari Aperta",
    year: 2018,
    generationCode: "F150-Aperta",
    generationDisplayName: "LaFerrari Aperta (F150)",
    generationStartYear: 2016,
    generationEndYear: 2018,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    imageUrl:
      "https://www.auto-data.net/images/f125/Ferrari-LaFerrari-Aperta.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-laferrari-aperta-6.3-v12-963hp-hybrid-dct-32293",
    imageAlt: "2018 Ferrari LaFerrari Aperta open-top exterior",
    // EPA MY2017 LaFerrari Aperta Hybrid id 38047 — 12/15/13 (atvType Hybrid).
    epaId: "38047",
    epaNote:
      "EPA vehicle id 38047 is labelled 2017 LaFerrari Aperta; CarBuzz lists final US MY2018. Same HY-KERS powertrain. EPA drive field says PT4WD — manufacturer architecture is RWD.",
    engine: {
      slug: "ferrari-f140fe-v12-hykers",
      name: "6.3L V12 HY-KERS hybrid (F140FE)",
      code: "F140FE",
      fuelType: "HYBRID",
      displacementCc: 6262,
      cylinderCount: 12,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: "HY-KERS (120 kW / 163 CV electric motor; not plug-in)",
    },
    transmission: {
      slug: "ferrari-f1-dct-7",
      name: "7-speed F1 dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // Same shell as coupe (auto-data / Ferrari Aperta).
      lengthIn: mmToIn(4702),
      widthIn: mmToIn(1992),
      heightIn: mmToIn(1116),
      wheelbaseIn: mmToIn(2650),
      curbWeightKg: 1430,
      seatingCapacity: 2,
    },
    performance: {
      powerHp: cvToHp(963),
      torqueLbFt: nmToLbFt(900),
      zeroToSixtySeconds: 2.9,
      topSpeedMph: 217,
    },
    fuelEconomy: { cityMpg: 12, highwayMpg: 15, combinedMpg: 13 },
    // CarBuzz / NBC News contemporary MSRP ~$2.0–2.2M; use CarBuzz $2,000,000.
    baseMsrpCents: 200_000_000,
    destinationCents: 375_000,
    destinationSourceUrl:
      "https://www.iseecars.com/car/ferrari-f12berlinetta-price",
    destinationSourceTitle:
      "Ferrari North America destination $3,750 (iSeeCars contemporary Monroney)",
    specUrl:
      "https://www.auto-data.net/en/ferrari-laferrari-aperta-6.3-v12-963hp-hybrid-dct-32293",
    specTitle: "Ferrari LaFerrari Aperta 6.3 V12 Hybrid DCT (auto-data.net)",
    specPublisher: "auto-data.net",
    priceUrl: "https://carbuzz.com/cars/ferrari/laferrari-aperta/2018/",
    priceTitle: "2018 Ferrari LaFerrari Aperta pricing (CarBuzz)",
    pricePublisher: "CarBuzz",
  },
];

const STATIC_SKIPPED = [
  "F12berlinetta MY 2012–2016: prefer final US MY 2017 (EPA 37802)",
  "F12berlinetta EPA id 37705 (no stop-start): prefer 37802 stop-start row",
  "F12tdf MY 2015–2016: prefer final US MY 2017 (EPA 37605)",
  "LaFerrari coupe MY 2013–2015: prefer final US MY 2016; EPA only certifies 2014 Hybrid id 35841",
  "LaFerrari Aperta MY 2016–2017: prefer final US MY 2018 (CarBuzz); EPA cert year 2017 id 38047",
  "LaFerrari / Aperta are HYBRID (HY-KERS), not PLUG_IN_HYBRID — no AC charge capability on EPA record",
];

export async function seedFerrariF12LaFerrari(
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
        fuelType: trim.engine.fuelType,
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
        slug: `ferrari-f12-laferrari-${trim.slug}-specs`,
        title: trim.specTitle,
        publisher: trim.specPublisher,
        url: trim.specUrl,
        type:
          trim.specPublisher === "Ferrari" ? "MANUFACTURER" : "THIRD_PARTY",
      });

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-${trim.year}-${trim.slug}`,
        title: `EPA Fuel Economy — Ferrari ${trim.name} (id ${trim.epaId})`,
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

      const fuelLocator = trim.epaNote
        ? `EPA vehicle id ${trim.epaId}. ${trim.epaNote}`
        : `EPA vehicle id ${trim.epaId}`;

      await Promise.all([
        upsertCitation(
          prisma,
          specSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "Power, torque, 0–60 mph, and top speed from Ferrari / cited catalogue",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Exterior dimensions, tracks, curb weight",
        ),
        upsertCitation(
          prisma,
          fuelSource.id,
          "VehicleFuelEconomy",
          fuelEconomy.id,
          "cityMpg",
          fuelLocator,
        ),
        upsertCitation(
          prisma,
          fuelSource.id,
          "VehicleFuelEconomy",
          fuelEconomy.id,
          "highwayMpg",
          fuelLocator,
        ),
        upsertCitation(
          prisma,
          fuelSource.id,
          "VehicleFuelEconomy",
          fuelEconomy.id,
          "combinedMpg",
          fuelLocator,
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
