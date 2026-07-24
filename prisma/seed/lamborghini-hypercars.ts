/**
 * Lamborghini limited hypercars seed module (US market).
 * Last US model year only — one trim each where EPA + retail MSRP exist.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Seeded:
 * - Veneno Roadster → MY 2015 (EPA 35255)
 * - Sián FKP 37 → final US MY 2021 (EPA 43757) — HYBRID (48V supercapacitor)
 * - Sián Roadster → MY 2021 (EPA 43758) — HYBRID
 * - Countach LPI 800-4 → MY 2022 (EPA 45025) — HYBRID
 *
 * Skipped (STATIC_SKIPPED): Centenario coupe/roadster — no EPA listing.
 */
import type { BodyStyle, FuelType } from "../../src/generated/prisma/client";
import {
  LAMBORGHINI_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureLamborghiniEngine,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./lamborghini-shared";

const MM_TO_IN = 0.0393700787;
const NM_TO_LBFT = 0.737562149;

function mmToIn(mm: number) {
  return Math.round(mm * MM_TO_IN * 10) / 10;
}

function nmToLbFt(nm: number) {
  return Math.round(nm * NM_TO_LBFT);
}

type ModelSlug =
  | "lamborghini-veneno"
  | "lamborghini-sian"
  | "lamborghini-countach-lpi";

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
  bodyStyle: BodyStyle;
  drivetrain: "AWD";
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
  epaId: string;
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
  };
  dimensions: {
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    wheelbaseIn: number;
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
  priceSource: {
    slug: string;
    title: string;
    url: string;
    publisher: string;
  };
  specSource: {
    slug: string;
    title: string;
    url: string;
    publisher: string;
  };
  description: string;
};

/**
 * Unique auto-data.net exteriors (HEAD-verified JPEG).
 * Distinct cars / colors / angles; no interiors.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2015-lamborghini-veneno-roadster-us",
    name: "Veneno Roadster",
    modelSlug: "lamborghini-veneno",
    modelName: "Veneno",
    year: 2015,
    generationCode: "Veneno",
    generationDisplayName: "Veneno (2013–2015)",
    generationStartYear: 2013,
    generationEndYear: 2015,
    bodyStyle: "ROADSTER",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f126/Lamborghini-Veneno-Roadster.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-veneno-lp-750-4-roadster-generation-8341",
    imageAlt: "2015 Lamborghini Veneno Roadster exterior",
    epaId: "35255",
    engine: {
      slug: "lamborghini-l539-veneno-v12",
      name: "6.5L V12 naturally aspirated (L539 Veneno)",
      code: "L539-VENENO",
      fuelType: "PETROL",
      displacementCc: 6498,
      cylinderCount: 12,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "lamborghini-isr-7",
      name: "7-speed ISR automated manual",
    },
    dimensions: {
      // Wikipedia / Lamborghini (mm → in); dry weight 1,490 kg (roadster).
      lengthIn: mmToIn(5020),
      widthIn: mmToIn(2075),
      heightIn: mmToIn(1165),
      wheelbaseIn: mmToIn(2700),
      curbWeightKg: 1490,
      seatingCapacity: 2,
    },
    performance: {
      // 750 PS ≈ 740 hp; 690 Nm; 0–60 ~2.8 s; 221 mph (Wikipedia / Lamborghini).
      powerHp: 740,
      torqueLbFt: nmToLbFt(690),
      zeroToSixtySeconds: 2.8,
      topSpeedMph: 221,
    },
    // EPA id 35255 — Premium, AWD, Auto (AM-S7): 11/17/13.
    fuelEconomy: { cityMpg: 11, highwayMpg: 17, combinedMpg: 13 },
    // Car and Driver / Autoblog: ~$4.5M (≈ €3.3M excl. tax).
    baseMsrpCents: 450_000_000,
    priceSource: {
      slug: "caranddriver-veneno-roadster-price",
      title: "Lamborghini Veneno Roadster — $4.5 million (Car and Driver)",
      url: "https://www.caranddriver.com/news/a15112638/lamborghini-veneno-roadster-photos-and-info-news/",
      publisher: "Car and Driver",
    },
    specSource: {
      slug: "wikipedia-lamborghini-veneno",
      title: "Lamborghini Veneno — specifications (Wikipedia)",
      url: "https://en.wikipedia.org/wiki/Lamborghini_Veneno",
      publisher: "Wikipedia",
    },
    description:
      "2015 Lamborghini Veneno Roadster (US). Mid-engine 6.5L V12, AWD, 7-speed ISR; limited to nine units.",
  },
  {
    slug: "2021-lamborghini-sian-fkp-37-us",
    name: "Sián FKP 37",
    modelSlug: "lamborghini-sian",
    modelName: "Sián",
    year: 2021,
    generationCode: "Sián",
    generationDisplayName: "Sián FKP 37 / Roadster (2020–2022)",
    generationStartYear: 2020,
    generationEndYear: 2022,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f33/Lamborghini-Sian-FKP-37.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-sian-fkp-37-generation-7281",
    imageAlt: "2021 Lamborghini Sián FKP 37 coupe exterior",
    epaId: "43757",
    engine: {
      slug: "lamborghini-l539-sian-hybrid-v12",
      name: "6.5L V12 + 48V e-motor supercapacitor hybrid (L539 Sián)",
      code: "L539-SIAN-HYBRID",
      fuelType: "HYBRID",
      displacementCc: 6498,
      cylinderCount: 12,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: "48V mild hybrid (supercapacitor; +34 hp e-motor)",
    },
    transmission: {
      slug: "lamborghini-isr-7",
      name: "7-speed ISR automated manual",
    },
    dimensions: {
      // Lamborghini dealer tech specs / Wikipedia (mm → in); dry weight 1,595 kg.
      lengthIn: mmToIn(4979),
      widthIn: mmToIn(2080),
      heightIn: mmToIn(1134),
      wheelbaseIn: mmToIn(2700),
      curbWeightKg: 1595,
      seatingCapacity: 2,
    },
    performance: {
      // 819 CV ≈ 808 hp SAE combined; 720 Nm; 0–62 <2.8 s; 355 km/h.
      powerHp: 808,
      torqueLbFt: nmToLbFt(720),
      zeroToSixtySeconds: 2.8,
      topSpeedMph: 221,
    },
    // EPA id 43757 (2021 Aventador Sian Coupe): 8/14/10.
    fuelEconomy: { cityMpg: 8, highwayMpg: 14, combinedMpg: 10 },
    // CarGurus / CarWeek original MSRP $3,600,000.
    baseMsrpCents: 360_000_000,
    priceSource: {
      slug: "cargurus-2020-lamborghini-sian-pricing",
      title: "2020 Lamborghini Sián FKP 37 Coupe MSRP $3,600,000 (CarGurus)",
      url: "https://www.cargurus.ca/research/2020-Lamborghini-Sian-c32913",
      publisher: "CarGurus",
    },
    specSource: {
      slug: "lamborghini-sian-fkp-37-tech-specs",
      title: "Sián FKP 37 technical specifications (Lamborghini dealer)",
      url: "https://lamborghini-dubai.com/en/models/limited-series/sian-fkp-37",
      publisher: "Lamborghini",
    },
    description:
      "2021 Lamborghini Sián FKP 37 (US). Mid-engine 6.5L V12 + 48V supercapacitor hybrid, AWD, 7-speed ISR.",
  },
  {
    slug: "2021-lamborghini-sian-roadster-us",
    name: "Sián Roadster",
    modelSlug: "lamborghini-sian",
    modelName: "Sián",
    year: 2021,
    generationCode: "Sián",
    generationDisplayName: "Sián FKP 37 / Roadster (2020–2022)",
    generationStartYear: 2020,
    generationEndYear: 2022,
    bodyStyle: "ROADSTER",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f110/Lamborghini-Sian-Roadster.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-sian-roadster-generation-9600",
    imageAlt: "2021 Lamborghini Sián Roadster exterior",
    epaId: "43758",
    engine: {
      slug: "lamborghini-l539-sian-hybrid-v12",
      name: "6.5L V12 + 48V e-motor supercapacitor hybrid (L539 Sián)",
      code: "L539-SIAN-HYBRID",
      fuelType: "HYBRID",
      displacementCc: 6498,
      cylinderCount: 12,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: "48V mild hybrid (supercapacitor; +34 hp e-motor)",
    },
    transmission: {
      slug: "lamborghini-isr-7",
      name: "7-speed ISR automated manual",
    },
    dimensions: {
      // Lamborghini UAE tech specs; dry weight 1,645 kg; height 1,158 mm.
      lengthIn: mmToIn(4979),
      widthIn: mmToIn(2080),
      heightIn: mmToIn(1158),
      wheelbaseIn: mmToIn(2700),
      curbWeightKg: 1645,
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 808,
      torqueLbFt: nmToLbFt(720),
      zeroToSixtySeconds: 2.8,
      topSpeedMph: 217,
    },
    // EPA id 43758 (2021 Aventador Sian Roadster): 8/14/10.
    fuelEconomy: { cityMpg: 8, highwayMpg: 14, combinedMpg: 10 },
    // CarGurus / CarWeek original MSRP $3,800,000.
    baseMsrpCents: 380_000_000,
    priceSource: {
      slug: "cargurus-2020-lamborghini-sian-roadster-pricing",
      title: "2020 Lamborghini Sián Roadster MSRP $3,800,000 (CarGurus)",
      url: "https://www.cargurus.ca/research/2020-Lamborghini-Sian-c32913",
      publisher: "CarGurus",
    },
    specSource: {
      slug: "lamborghini-sian-roadster-tech-specs",
      title: "Sián Roadster technical specifications (Lamborghini dealer)",
      url: "https://www.lamborghini-abudhabi.com/en/models/limited-series/sian-roadster",
      publisher: "Lamborghini",
    },
    description:
      "2021 Lamborghini Sián Roadster (US). Mid-engine 6.5L V12 + 48V supercapacitor hybrid, AWD, 7-speed ISR.",
  },
  {
    slug: "2022-lamborghini-countach-lpi-800-4-us",
    name: "Countach LPI 800-4",
    modelSlug: "lamborghini-countach-lpi",
    modelName: "Countach LPI",
    year: 2022,
    generationCode: "LPI-800-4",
    generationDisplayName: "Countach LPI 800-4 (2022)",
    generationStartYear: 2022,
    generationEndYear: 2022,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f71/Lamborghini-Countach-LPI-800-4_2.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-countach-lpi-800-4-6.5-v12-819hp-mild-hybrid-4wd-isr-44290",
    imageAlt: "2022 Lamborghini Countach LPI 800-4 exterior",
    epaId: "45025",
    engine: {
      slug: "lamborghini-l539-countach-hybrid-v12",
      name: "6.5L V12 + 48V e-motor supercapacitor hybrid (L539 Countach LPI)",
      code: "L539-COUNTACH-LPI",
      fuelType: "HYBRID",
      displacementCc: 6498,
      cylinderCount: 12,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: "48V mild hybrid (supercapacitor; +34 hp e-motor)",
    },
    transmission: {
      slug: "lamborghini-isr-7",
      name: "7-speed ISR automated manual",
    },
    dimensions: {
      // Wikipedia / Lamborghini (mm → in); dry weight 1,595 kg.
      lengthIn: mmToIn(4870),
      widthIn: mmToIn(2099),
      heightIn: mmToIn(1139),
      wheelbaseIn: mmToIn(2700),
      curbWeightKg: 1595,
      seatingCapacity: 2,
    },
    performance: {
      // 814 PS ≈ 803 hp SAE combined; torque shared with Sián architecture.
      powerHp: 803,
      torqueLbFt: nmToLbFt(720),
      zeroToSixtySeconds: 2.8,
      topSpeedMph: 221,
    },
    // EPA id 45025 (2022 Aventador Countach): 9/16/11.
    fuelEconomy: { cityMpg: 9, highwayMpg: 16, combinedMpg: 11 },
    // iSeeCars / CarBuzz / Carscoops: $2,640,000.
    baseMsrpCents: 264_000_000,
    priceSource: {
      slug: "iseecars-2022-lamborghini-countach-price",
      title: "2022 Lamborghini Countach LPI 800-4 MSRP $2,640,000 (iSeeCars)",
      url: "https://www.iseecars.com/car/lamborghini-countach-price",
      publisher: "iSeeCars",
    },
    specSource: {
      slug: "wikipedia-lamborghini-countach-lpi-800-4",
      title: "Lamborghini Countach LPI 800-4 — specifications (Wikipedia)",
      url: "https://en.wikipedia.org/wiki/Lamborghini_Countach_LPI_800-4",
      publisher: "Wikipedia",
    },
    description:
      "2022 Lamborghini Countach LPI 800-4 (US). Mid-engine 6.5L V12 + 48V supercapacitor hybrid, AWD, 7-speed ISR; 112 units.",
  },
];

const STATIC_SKIPPED = [
  "Centenario LP 770-4 Coupe (2017–2018 final US): no fueleconomy.gov EPA vehicle listing for any model year — incomplete FE record, skipped",
  "Centenario LP 770-4 Roadster (final US): no fueleconomy.gov EPA vehicle listing — incomplete FE record, skipped",
  "Veneno Coupe (3 customer cars): not requested; US EPA lists Veneno Roadster only (id 35255)",
  "Sián FKP 37 MY 2020: prefer final US MY 2021 (EPA 43757)",
  "Sián Roadster MY 2020: prefer US MY 2021 (EPA 43758)",
];

export async function seedLamborghiniHypercars(
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

  const destinationSource = await upsertCatalogueSource(prisma, {
    slug: "lamborghini-sports-car-destination-iseecars",
    title: "Lamborghini sports-car destination & handling (iSeeCars / Monroney)",
    publisher: "iSeeCars",
    url: "https://www.iseecars.com/car/lamborghini-huracan-price",
    type: "THIRD_PARTY",
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
        slug: `auto-data-image-${trim.slug}`,
        title: `${trim.name} exterior (auto-data.net)`,
        pageUrl: trim.imagePageUrl,
        publisher: "auto-data.net",
      });

      const modelYearId = await ensureModelYear(trim);

      const engine = await ensureLamborghiniEngine(prisma, {
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
          type: "AUTOMATIC",
          gearCount: 7,
        },
        update: {
          name: trim.transmission.name,
          type: "AUTOMATIC",
          gearCount: 7,
        },
      });

      const specSource = await upsertCatalogueSource(prisma, {
        slug: trim.specSource.slug,
        title: trim.specSource.title,
        publisher: trim.specSource.publisher,
        url: trim.specSource.url,
        type:
          trim.specSource.publisher === "Lamborghini"
            ? "MANUFACTURER"
            : "THIRD_PARTY",
      });

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-${trim.year}-${trim.slug}`,
        title: `EPA Fuel Economy — ${trim.year} Lamborghini ${trim.name}`,
        publisher: "U.S. EPA",
        url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
        type: "GOVERNMENT",
      });

      const priceSource = await upsertCatalogueSource(prisma, {
        slug: trim.priceSource.slug,
        title: trim.priceSource.title,
        publisher: trim.priceSource.publisher,
        url: trim.priceSource.url,
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

      const destinationCents = LAMBORGHINI_DESTINATION_CENTS.sportsCar;

      const [dimensions, performance, fuelEconomy, price, destination, image] =
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
          `${trim.specSource.publisher} power, torque, 0–60, top speed`,
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          `${trim.specSource.publisher} exterior dimensions / dry weight`,
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
          trim.priceSource.title,
        ),
        upsertCitation(
          prisma,
          destinationSource.id,
          "VehiclePrice",
          destination.id,
          "amountCents",
          `US Lamborghini sports-car destination $${(destinationCents / 100).toFixed(0)}`,
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
      seeded.push(
        `${trim.slug} | EPA=${trim.epaId} | fuel=${trim.engine.fuelType} | image=${imageUrl}`,
      );
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      skipped.push(`${trim.slug}: ${reason}`);
    }
  }

  return { seeded, skipped };
}
