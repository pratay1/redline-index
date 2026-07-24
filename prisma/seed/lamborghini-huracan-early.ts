/**
 * Lamborghini Huracán early (pre-EVO) US catalogue seed module.
 * Final US model year (~2019) only — one trim each for LP 610-4, LP 610-4 Spyder,
 * LP 580-2, LP 580-2 Spyder, Performante, Performante Spyder.
 * Prefer EPA / auto-data.net / Edmunds / CarBuzz. Idempotent — safe to re-run.
 * Does not wire itself into prisma/seed.ts.
 *
 * Exterior images (unique, verified exteriors — no interiors):
 * - https://www.auto-data.net/images/f114/Lamborghini-Huracan-LP-610-4_1.jpg
 * - https://www.auto-data.net/images/f85/Lamborghini-Huracan-LP-610-4-Spyder.jpg
 * - https://www.auto-data.net/images/f67/Lamborghini-Huracan-LP-580-2.jpg
 * - https://www.auto-data.net/images/f79/Lamborghini-Huracan-LP-580-2-Spyder_1.jpg
 * - https://www.auto-data.net/images/f95/Lamborghini-Huracan-Performante.jpg
 * - https://www.auto-data.net/images/f52/Lamborghini-Huracan-Performante-Spyder_1.jpg
 */
import type { Drivetrain, FuelType } from "../../src/generated/prisma/client";
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

const MM_TO_IN = 1 / 25.4;

function mmToIn(mm: number) {
  return Math.round(mm * MM_TO_IN * 10) / 10;
}

type ModelSlug = "lamborghini-huracan";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: string;
  year: number;
  generationCode: string;
  generationDisplayName: string;
  generationStartYear: number;
  bodyStyle: "COUPE" | "CABRIOLET";
  drivetrain: Drivetrain;
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
    /** Manufacturer 0–100 km/h (equals 0–62 mph claim). */
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
    slug: "2019-lamborghini-huracan-lp-610-4-us",
    name: "Huracán LP 610-4",
    modelSlug: "lamborghini-huracan",
    modelName: "Huracán",
    year: 2019,
    generationCode: "LP610-4",
    generationDisplayName: "LP 610-4 (2014–2019)",
    generationStartYear: 2014,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f114/Lamborghini-Huracan-LP-610-4_1.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-lp-610-4-5.2-v10-610hp-awd-ldf-22766",
    imageAlt: "2019 Lamborghini Huracán LP 610-4 coupe exterior",
    // EPA Huracan AWD Automatic (AM-S7) — 13/18/15
    epaId: "40988",
    engine: {
      slug: "lamborghini-csjb-52-v10",
      name: "5.2L V10 (CSJB)",
      code: "CSJB",
      fuelType: "PETROL",
      displacementCc: 5204,
      cylinderCount: 10,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "lamborghini-ldf-7",
      name: "7-speed Lamborghini Doppia Frizione (LDF)",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // auto-data.net LP 610-4 AWD LDF (mm→in); kerb as published (OEM dry).
      lengthIn: mmToIn(4459),
      widthIn: mmToIn(1924),
      heightIn: mmToIn(1165),
      wheelbaseIn: mmToIn(2620),
      frontTrackIn: mmToIn(1668),
      rearTrackIn: mmToIn(1620),
      curbWeightKg: 1422,
      // Front trunk ~3.5 cu ft (CarBuzz 2019 Huracán) → 100 L.
      cargoVolumeLiters: 100,
      seatingCapacity: 2,
    },
    performance: {
      // US SAE hp/torque (Edmunds); 0–100 km/h / top (auto-data / OEM).
      powerHp: 602,
      torqueLbFt: 413,
      zeroToSixtySeconds: 3.2,
      topSpeedMph: 202,
    },
    fuelEconomy: { cityMpg: 13, highwayMpg: 18, combinedMpg: 15 },
    // CarBuzz / CarHP 2019 LP 610-4 starting MSRP excl. destination.
    baseMsrpCents: 24_247_400,
    specUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-lp-610-4-5.2-v10-610hp-awd-ldf-22766",
    specTitle:
      "Lamborghini Huracan LP 610-4 5.2 V10 (610 Hp) AWD LDF (auto-data.net)",
    priceUrl: "https://carbuzz.com/cars/lamborghini/huracan/2019/",
    priceTitle: "2019 Lamborghini Huracan Pricing (CarBuzz)",
  },
  {
    slug: "2019-lamborghini-huracan-lp-610-4-spyder-us",
    name: "Huracán LP 610-4 Spyder",
    modelSlug: "lamborghini-huracan",
    modelName: "Huracán",
    year: 2019,
    generationCode: "LP610-4-Spyder",
    generationDisplayName: "LP 610-4 Spyder (2016–2019)",
    generationStartYear: 2016,
    bodyStyle: "CABRIOLET",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f85/Lamborghini-Huracan-LP-610-4-Spyder.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-lp-610-4-spyder-5.2-v10-610hp-awd-ldf-22770",
    imageAlt: "2019 Lamborghini Huracán LP 610-4 Spyder exterior",
    // EPA Huracan Spyder AWD Automatic (AM-S7) — 13/18/15
    epaId: "40987",
    engine: {
      slug: "lamborghini-csjb-52-v10",
      name: "5.2L V10 (CSJB)",
      code: "CSJB",
      fuelType: "PETROL",
      displacementCc: 5204,
      cylinderCount: 10,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "lamborghini-ldf-7",
      name: "7-speed Lamborghini Doppia Frizione (LDF)",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      lengthIn: mmToIn(4459),
      widthIn: mmToIn(1924),
      heightIn: mmToIn(1180),
      wheelbaseIn: mmToIn(2620),
      frontTrackIn: mmToIn(1668),
      rearTrackIn: mmToIn(1620),
      curbWeightKg: 1542,
      cargoVolumeLiters: 100,
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 602,
      torqueLbFt: 413,
      zeroToSixtySeconds: 3.4,
      topSpeedMph: 201,
    },
    fuelEconomy: { cityMpg: 13, highwayMpg: 18, combinedMpg: 15 },
    // Edmunds 2019 Spyder AWD starting MSRP excl. destination.
    baseMsrpCents: 26_632_500,
    specUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-lp-610-4-spyder-5.2-v10-610hp-awd-ldf-22770",
    specTitle:
      "Lamborghini Huracan LP 610-4 Spyder 5.2 V10 (610 Hp) AWD LDF (auto-data.net)",
    priceUrl: "https://www.edmunds.com/lamborghini/huracan/2019/features-specs/",
    priceTitle: "2019 Lamborghini Huracan Specs & Features (Edmunds)",
  },
  {
    slug: "2019-lamborghini-huracan-lp-580-2-us",
    name: "Huracán LP 580-2",
    modelSlug: "lamborghini-huracan",
    modelName: "Huracán",
    year: 2019,
    generationCode: "LP580-2",
    generationDisplayName: "LP 580-2 (2015–2019)",
    generationStartYear: 2015,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl:
      "https://www.auto-data.net/images/f67/Lamborghini-Huracan-LP-580-2.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-lp-580-2-5.2-v10-580hp-ldf-22773",
    imageAlt: "2019 Lamborghini Huracán LP 580-2 coupe exterior",
    // EPA Huracan 2WD Automatic (AM-S7) — 13/18/15
    epaId: "40990",
    engine: {
      slug: "lamborghini-csjb-52-v10",
      name: "5.2L V10 (CSJB)",
      code: "CSJB",
      fuelType: "PETROL",
      displacementCc: 5204,
      cylinderCount: 10,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "lamborghini-ldf-7",
      name: "7-speed Lamborghini Doppia Frizione (LDF)",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      lengthIn: mmToIn(4459),
      widthIn: mmToIn(1924),
      heightIn: mmToIn(1165),
      wheelbaseIn: mmToIn(2620),
      frontTrackIn: mmToIn(1668),
      rearTrackIn: mmToIn(1620),
      curbWeightKg: 1389,
      cargoVolumeLiters: 100,
      seatingCapacity: 2,
    },
    performance: {
      // US SAE (Edmunds RWD coupe); 0–100 / top (auto-data / OEM).
      powerHp: 571,
      torqueLbFt: 398,
      zeroToSixtySeconds: 3.4,
      topSpeedMph: 199,
    },
    fuelEconomy: { cityMpg: 13, highwayMpg: 18, combinedMpg: 15 },
    // Edmunds / iSeeCars 2019 LP 580-2 coupe MSRP excl. destination.
    baseMsrpCents: 20_367_400,
    specUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-lp-580-2-5.2-v10-580hp-ldf-22773",
    specTitle:
      "Lamborghini Huracan LP 580-2 5.2 V10 (580 Hp) LDF (auto-data.net)",
    priceUrl: "https://www.edmunds.com/lamborghini/huracan/2019/features-specs/",
    priceTitle: "2019 Lamborghini Huracan Specs & Features (Edmunds)",
  },
  {
    slug: "2019-lamborghini-huracan-lp-580-2-spyder-us",
    name: "Huracán LP 580-2 Spyder",
    modelSlug: "lamborghini-huracan",
    modelName: "Huracán",
    year: 2019,
    generationCode: "LP580-2-Spyder",
    generationDisplayName: "LP 580-2 Spyder (2016–2019)",
    generationStartYear: 2016,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    imageUrl:
      "https://www.auto-data.net/images/f79/Lamborghini-Huracan-LP-580-2-Spyder_1.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-lp-580-2-spyder-5.2-v10-580hp-ldf-31117",
    imageAlt: "2019 Lamborghini Huracán LP 580-2 Spyder exterior",
    // EPA Huracan Spyder 2WD Automatic (AM-S7) — 13/18/15
    epaId: "40989",
    engine: {
      slug: "lamborghini-csjb-52-v10",
      name: "5.2L V10 (CSJB)",
      code: "CSJB",
      fuelType: "PETROL",
      displacementCc: 5204,
      cylinderCount: 10,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "lamborghini-ldf-7",
      name: "7-speed Lamborghini Doppia Frizione (LDF)",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      lengthIn: mmToIn(4459),
      widthIn: mmToIn(1924),
      heightIn: mmToIn(1180),
      wheelbaseIn: mmToIn(2620),
      frontTrackIn: mmToIn(1668),
      rearTrackIn: mmToIn(1620),
      curbWeightKg: 1509,
      cargoVolumeLiters: 100,
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 571,
      torqueLbFt: 398,
      zeroToSixtySeconds: 3.6,
      topSpeedMph: 198,
    },
    fuelEconomy: { cityMpg: 13, highwayMpg: 18, combinedMpg: 15 },
    // Edmunds / iSeeCars 2019 LP 580-2 Spyder MSRP excl. destination.
    baseMsrpCents: 22_365_400,
    specUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-lp-580-2-spyder-5.2-v10-580hp-ldf-31117",
    specTitle:
      "Lamborghini Huracan LP 580-2 Spyder 5.2 V10 (580 Hp) LDF (auto-data.net)",
    priceUrl: "https://www.edmunds.com/lamborghini/huracan/2019/features-specs/",
    priceTitle: "2019 Lamborghini Huracan Specs & Features (Edmunds)",
  },
  {
    slug: "2019-lamborghini-huracan-performante-us",
    name: "Huracán Performante",
    modelSlug: "lamborghini-huracan",
    modelName: "Huracán",
    year: 2019,
    generationCode: "Performante",
    generationDisplayName: "Performante (2017–2019)",
    generationStartYear: 2017,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f95/Lamborghini-Huracan-Performante.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-performante-5.2-v10-640hp-awd-automatic-30149",
    imageAlt: "2019 Lamborghini Huracán Performante coupe exterior",
    // Same EPA AWD coupe id as LP 610-4 — 13/18/15
    epaId: "40988",
    engine: {
      slug: "lamborghini-csj-52-v10",
      name: "5.2L V10 (CSJ)",
      code: "CSJ",
      fuelType: "PETROL",
      displacementCc: 5204,
      cylinderCount: 10,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "lamborghini-ldf-7",
      name: "7-speed Lamborghini Doppia Frizione (LDF)",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // auto-data Performante coupe; tracks from Spyder/platform (same 1668/1620).
      lengthIn: mmToIn(4506),
      widthIn: mmToIn(1924),
      heightIn: mmToIn(1165),
      wheelbaseIn: mmToIn(2620),
      frontTrackIn: mmToIn(1668),
      rearTrackIn: mmToIn(1620),
      curbWeightKg: 1382,
      cargoVolumeLiters: 100,
      seatingCapacity: 2,
    },
    performance: {
      // US SAE ~631 hp / 443 lb-ft (Edmunds/KBB); 0–100 OEM 2.9 s; top 325 km/h.
      powerHp: 631,
      torqueLbFt: 443,
      zeroToSixtySeconds: 2.9,
      topSpeedMph: 202,
    },
    fuelEconomy: { cityMpg: 13, highwayMpg: 18, combinedMpg: 15 },
    // Edmunds / iSeeCars 2019 Performante coupe MSRP excl. destination.
    baseMsrpCents: 28_104_800,
    specUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-performante-5.2-v10-640hp-awd-automatic-30149",
    specTitle:
      "Lamborghini Huracan Performante 5.2 V10 (640 Hp) AWD Automatic (auto-data.net)",
    priceUrl: "https://www.edmunds.com/lamborghini/huracan/2019/features-specs/",
    priceTitle: "2019 Lamborghini Huracan Specs & Features (Edmunds)",
  },
  {
    slug: "2019-lamborghini-huracan-performante-spyder-us",
    name: "Huracán Performante Spyder",
    modelSlug: "lamborghini-huracan",
    modelName: "Huracán",
    year: 2019,
    generationCode: "Performante-Spyder",
    generationDisplayName: "Performante Spyder (2018–2019)",
    generationStartYear: 2018,
    bodyStyle: "CABRIOLET",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f52/Lamborghini-Huracan-Performante-Spyder_1.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-performante-spyder-5.2-v10-640hp-awd-automatic-32811",
    imageAlt: "2019 Lamborghini Huracán Performante Spyder exterior",
    // EPA Huracan Spyder AWD — 13/18/15
    epaId: "40987",
    engine: {
      slug: "lamborghini-csj-52-v10",
      name: "5.2L V10 (CSJ)",
      code: "CSJ",
      fuelType: "PETROL",
      displacementCc: 5204,
      cylinderCount: 10,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "lamborghini-ldf-7",
      name: "7-speed Lamborghini Doppia Frizione (LDF)",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      lengthIn: mmToIn(4506),
      widthIn: mmToIn(1924),
      heightIn: mmToIn(1180),
      wheelbaseIn: mmToIn(2620),
      frontTrackIn: mmToIn(1668),
      rearTrackIn: mmToIn(1620),
      curbWeightKg: 1507,
      cargoVolumeLiters: 100,
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 631,
      torqueLbFt: 443,
      zeroToSixtySeconds: 3.1,
      topSpeedMph: 202,
    },
    fuelEconomy: { cityMpg: 13, highwayMpg: 18, combinedMpg: 15 },
    // Edmunds / iSeeCars 2019 Performante Spyder MSRP excl. destination.
    baseMsrpCents: 30_885_900,
    specUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-performante-spyder-5.2-v10-640hp-awd-automatic-32811",
    specTitle:
      "Lamborghini Huracan Performante Spyder 5.2 V10 (640 Hp) AWD Automatic (auto-data.net)",
    priceUrl: "https://www.edmunds.com/lamborghini/huracan/2019/features-specs/",
    priceTitle: "2019 Lamborghini Huracan Specs & Features (Edmunds)",
  },
];

const STATIC_SKIPPED = [
  "MY2014–2018 Huracán LP 610-4 coupe: final US MY2019 seeded (EPA 40988)",
  "MY2016–2018 Huracán LP 610-4 Spyder: final US MY2019 seeded (EPA 40987)",
  "MY2015–2018 Huracán LP 580-2 coupe: final US MY2019 seeded (EPA 40990)",
  "MY2016–2018 Huracán LP 580-2 Spyder: final US MY2019 seeded (EPA 40989)",
  "MY2017–2018 Huracán Performante coupe: final US MY2019 seeded (EPA 40988)",
  "MY2018 Huracán Performante Spyder: final US MY2019 seeded (EPA 40987)",
  "Huracán Super Trofeo / race variants: not US retail catalogue trims",
  "Huracán Avio and other Ad Personam special editions: appearance packages skipped",
];

const DESTINATION_SOURCE = {
  slug: "lamborghini-destination-sports-car-iseecars-2019",
  title:
    "Lamborghini US destination & handling — sports cars $3,695 (iSeeCars Monroney-style)",
  url: "https://www.iseecars.com/car/2019-lamborghini-huracan-price",
  type: "THIRD_PARTY" as const,
  publisher: "iSeeCars",
};

export async function seedLamborghiniHuracanEarly(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];
  const destinationCents = LAMBORGHINI_DESTINATION_CENTS.sportsCar;

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
        slug: `lamborghini-huracan-early-${trim.slug}-specs`,
        title: trim.specTitle,
        publisher: "auto-data.net",
        url: trim.specUrl,
        type: "THIRD_PARTY",
      });

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-${trim.year}-${trim.slug}`,
        title: `EPA Fuel Economy — ${trim.year} Lamborghini ${trim.name}`,
        publisher: "U.S. EPA",
        url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
        type: "GOVERNMENT",
      });

      const priceSource = await upsertCatalogueSource(prisma, {
        slug: `price-${trim.slug}`,
        title: trim.priceTitle,
        publisher: trim.priceUrl.includes("carbuzz") ? "CarBuzz" : "Edmunds",
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
          description: `${trim.year} Lamborghini ${trim.name} (US).`,
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
          description: `${trim.year} Lamborghini ${trim.name} (US).`,
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
          "Power/torque (US SAE), 0–100 km/h claim, and top speed from auto-data / Edmunds",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Exterior dimensions, tracks, kerb weight, cargo from auto-data.net",
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
          `Destination & handling $${(destinationCents / 100).toFixed(0)}`,
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
