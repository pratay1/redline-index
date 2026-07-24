/**
 * Ferrari F8 + SF90 US catalogue seed (final / preferred EPA years).
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Years:
 * - F8 Tributo / F8 Spider → final US MY 2023
 * - SF90 Stradale → MY2024 (no MY2025 EPA; coupe discontinued)
 * - SF90 Spider → MY2025 EPA
 * - SF90 XX Stradale / XX Spider → MY2025 EPA
 *
 * Sources: EPA fueleconomy.gov, Car and Driver, iSeeCars, MotorTrend, auto-data.net
 */
import type { FuelType } from "../../src/generated/prisma/client";
import {
  assertImageUrlOk,
  ensureAudit,
  ensureFerrariEngine,
  ensureImageSource,
  FERRARI_DESTINATION_CENTS,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./ferrari-shared";

const LBS_TO_KG = 0.45359237;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

type TrimSeed = {
  slug: string;
  name: string;
  year: number;
  modelSlug: string;
  modelName: string;
  generationCode: string;
  generationDisplayName: string;
  generationStartYear: number;
  generationEndYear: number | null;
  bodyStyle: "COUPE" | "ROADSTER";
  drivetrain: "RWD" | "AWD";
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
  epaId: string;
  fuelType: FuelType;
  engine: {
    slug: string;
    name: string;
    code: string;
    displacementCc: number;
    cylinderCount: number;
    induction: string;
    electrification: string | null;
  };
  transmission: {
    slug: string;
    name: string;
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
    electricRangeMiles: number | null;
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
  };
  description: string;
};

/**
 * Unique auto-data.net exteriors (HEAD 200 image/jpeg). One distinct hero per trim.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2023-ferrari-f8-tributo-us",
    name: "F8 Tributo",
    year: 2023,
    modelSlug: "ferrari-f8-tributo",
    modelName: "F8 Tributo",
    generationCode: "F8",
    generationDisplayName: "F8 Tributo (2019–2023)",
    generationStartYear: 2019,
    generationEndYear: 2023,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f109/Ferrari-F8-Tributo.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-f8-tributo-3.9-v8-720hp-f1-dct-36260",
    imageAlt: "Ferrari F8 Tributo coupe exterior",
    epaId: "45464",
    fuelType: "PETROL",
    engine: {
      slug: "ferrari-f154cg-f8",
      name: "F154 CG 3.9L twin-turbo V8",
      code: "F154CG",
      displacementCc: 3902,
      cylinderCount: 8,
      induction: "Twin-turbo",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-f1-dct-7-f8",
      name: "7-speed F1 dual-clutch automatic",
      gearCount: 7,
    },
    dimensions: {
      // Car and Driver 2023 F8 Tributo specs + auto-data tracks/cargo.
      lengthIn: 181.5,
      widthIn: 77.9,
      heightIn: 47.5,
      wheelbaseIn: 104.3,
      frontTrackIn: 66.0,
      rearTrackIn: 64.8,
      curbWeightKg: lbsToKg(3164),
      cargoVolumeLiters: 200,
      seatingCapacity: 2,
    },
    performance: {
      // C&D US: 711 hp / 567 lb-ft; 0–60 ~2.8 s; top 211 mph (auto-data / C&D).
      powerHp: 711,
      torqueLbFt: 567,
      zeroToSixtySeconds: 2.8,
      topSpeedMph: 211,
    },
    fuelEconomy: {
      // EPA id 45464 gas-only.
      cityMpg: 15,
      highwayMpg: 19,
      combinedMpg: 16,
      electricRangeMiles: null,
    },
    // iSeeCars Monroney-style base MSRP (excl. $5,000 destination).
    baseMsrpCents: 28_180_000,
    priceSource: {
      slug: "iseecars-2023-ferrari-f8-tributo-price",
      title: "2023 Ferrari F8 Tributo Price / Destination (iSeeCars)",
      url: "https://www.iseecars.com/car/ferrari-f8-tributo-price",
      publisher: "iSeeCars",
    },
    specSource: {
      slug: "caranddriver-2023-ferrari-f8-tributo-specs",
      title: "2023 Ferrari F8 Tributo Coupe Features and Specs — Car and Driver",
      url: "https://www.caranddriver.com/ferrari/f8-tributo-spider/specs/2023/ferrari_f8-tributo_ferrari-f8-tributo_2023",
    },
    description:
      "2023 Ferrari F8 Tributo coupe (US). Mid-engine twin-turbo V8, RWD, 7-speed F1 DCT. Final US catalogue year.",
  },
  {
    slug: "2023-ferrari-f8-spider-us",
    name: "F8 Spider",
    year: 2023,
    modelSlug: "ferrari-f8-spider",
    modelName: "F8 Spider",
    generationCode: "F8",
    generationDisplayName: "F8 Spider (2019–2023)",
    generationStartYear: 2019,
    generationEndYear: 2023,
    bodyStyle: "ROADSTER",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f31/Ferrari-F8-Spider.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-f8-spider-3.9-v8-720hp-f1-dct-39252",
    imageAlt: "Ferrari F8 Spider roadster exterior",
    epaId: "45465",
    fuelType: "PETROL",
    engine: {
      slug: "ferrari-f154cg-f8",
      name: "F154 CG 3.9L twin-turbo V8",
      code: "F154CG",
      displacementCc: 3902,
      cylinderCount: 8,
      induction: "Twin-turbo",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-f1-dct-7-f8",
      name: "7-speed F1 dual-clutch automatic",
      gearCount: 7,
    },
    dimensions: {
      // C&D / auto-data dims; curb C&D est for Spider.
      lengthIn: 181.5,
      widthIn: 77.9,
      heightIn: 47.5,
      wheelbaseIn: 104.3,
      frontTrackIn: 66.0,
      rearTrackIn: 64.8,
      curbWeightKg: lbsToKg(3550),
      cargoVolumeLiters: 200,
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 711,
      torqueLbFt: 567,
      zeroToSixtySeconds: 2.8,
      topSpeedMph: 211,
    },
    fuelEconomy: {
      // EPA id 45465 gas-only.
      cityMpg: 15,
      highwayMpg: 18,
      combinedMpg: 16,
      electricRangeMiles: null,
    },
    baseMsrpCents: 31_934_200,
    priceSource: {
      slug: "iseecars-2023-ferrari-f8-spider-price",
      title: "2023 Ferrari F8 Spider Price / Destination (iSeeCars)",
      url: "https://www.iseecars.com/car/ferrari-f8-spider-price",
      publisher: "iSeeCars",
    },
    specSource: {
      slug: "caranddriver-2023-ferrari-f8-spider-specs",
      title: "2023 Ferrari F8 Spider Convertible Features and Specs — Car and Driver",
      url: "https://www.caranddriver.com/ferrari/f8-tributo-spider/specs/2023/ferrari_f8-tributo_ferrari-f8-spider_2023",
    },
    description:
      "2023 Ferrari F8 Spider roadster (US). Mid-engine twin-turbo V8, RWD, 7-speed F1 DCT. Final US catalogue year.",
  },
  {
    slug: "2024-ferrari-sf90-stradale-us",
    name: "SF90 Stradale",
    year: 2024,
    modelSlug: "ferrari-sf90-stradale",
    modelName: "SF90 Stradale",
    generationCode: "SF90",
    generationDisplayName: "SF90 Stradale (2019–2024)",
    generationStartYear: 2019,
    generationEndYear: 2024,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f52/Ferrari-SF90-Stradale.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-sf90-stradale-4.0-v8-1000hp-plug-in-hybrid-automatic-37432",
    imageAlt: "Ferrari SF90 Stradale coupe exterior",
    epaId: "47494",
    fuelType: "PLUG_IN_HYBRID",
    engine: {
      slug: "ferrari-f154fa-sf90",
      name: "F154 FA 4.0L twin-turbo V8 + triple electric motors (PHEV)",
      code: "F154FA",
      displacementCc: 3990,
      cylinderCount: 8,
      induction: "Twin-turbo",
      electrification: "PHEV (99+99+150 kW PMSM; EPA)",
    },
    transmission: {
      slug: "ferrari-f1-dct-8-sf90",
      name: "8-speed F1 dual-clutch automatic",
      gearCount: 8,
    },
    dimensions: {
      // C&D 2024 SF90 Stradale specs; cargo ~3 cu ft (C&D) ≈ 85 L.
      lengthIn: 185.4,
      widthIn: 77.6,
      heightIn: 46.7,
      wheelbaseIn: 104.3,
      frontTrackIn: 66.1,
      rearTrackIn: 65.0,
      curbWeightKg: lbsToKg(3593),
      cargoVolumeLiters: 85,
      seatingCapacity: 2,
    },
    performance: {
      // Combined 986 hp / 590 lb-ft; Ferrari 0–60 claim 2.5 s; top 211 mph.
      powerHp: 986,
      torqueLbFt: 590,
      zeroToSixtySeconds: 2.5,
      topSpeedMph: 211,
    },
    fuelEconomy: {
      // EPA id 47494 gas-only city/hwy/comb; rangeA = 9 mi.
      cityMpg: 16,
      highwayMpg: 20,
      combinedMpg: 18,
      electricRangeMiles: 9,
    },
    // C&D 2024 MSRP (use as base; destination cited separately via iSeeCars/Ferrari $5,000).
    baseMsrpCents: 52_876_400,
    priceSource: {
      slug: "caranddriver-2024-ferrari-sf90-stradale-msrp",
      title: "2024 Ferrari SF90 Stradale Coupe Features and Specs — Car and Driver",
      url: "https://www.caranddriver.com/ferrari/sf90-stradale/specs/2024/ferrari_sf90-stradale_ferrari-sf90-stradale_2024",
      publisher: "Car and Driver",
    },
    specSource: {
      slug: "caranddriver-2024-ferrari-sf90-stradale-specs",
      title: "2024 Ferrari SF90 Stradale Coupe Features and Specs — Car and Driver",
      url: "https://www.caranddriver.com/ferrari/sf90-stradale/specs/2024/ferrari_sf90-stradale_ferrari-sf90-stradale_2024",
    },
    description:
      "2024 Ferrari SF90 Stradale PHEV coupe (US). Twin-turbo V8 + three motors, AWD, 8-speed F1 DCT. Last US EPA year for the standard coupe.",
  },
  {
    slug: "2025-ferrari-sf90-spider-us",
    name: "SF90 Spider",
    year: 2025,
    modelSlug: "ferrari-sf90-spider",
    modelName: "SF90 Spider",
    generationCode: "SF90",
    generationDisplayName: "SF90 Spider (2020–2025)",
    generationStartYear: 2020,
    generationEndYear: 2025,
    bodyStyle: "ROADSTER",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f41/Ferrari-SF90-Spider.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-sf90-spider-4.0-v8-1000hp-plug-in-hybrid-awd-f1-41753",
    imageAlt: "Ferrari SF90 Spider roadster exterior",
    epaId: "48660",
    fuelType: "PLUG_IN_HYBRID",
    engine: {
      slug: "ferrari-f154fa-sf90",
      name: "F154 FA 4.0L twin-turbo V8 + triple electric motors (PHEV)",
      code: "F154FA",
      displacementCc: 3990,
      cylinderCount: 8,
      induction: "Twin-turbo",
      electrification: "PHEV (99+150 kW PMSM; EPA MY2025 Spider)",
    },
    transmission: {
      slug: "ferrari-f1-dct-8-sf90",
      name: "8-speed F1 dual-clutch automatic",
      gearCount: 8,
    },
    dimensions: {
      // auto-data SF90 Spider + C&D 2025 Spider dims.
      lengthIn: 185.4,
      widthIn: 77.6,
      heightIn: 46.7,
      wheelbaseIn: 104.3,
      frontTrackIn: 66.1,
      rearTrackIn: 65.0,
      curbWeightKg: 1670,
      cargoVolumeLiters: 74,
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 986,
      torqueLbFt: 590,
      zeroToSixtySeconds: 2.5,
      topSpeedMph: 211,
    },
    fuelEconomy: {
      // EPA id 48660 gas-only; rangeA = 8 mi.
      cityMpg: 16,
      highwayMpg: 19,
      combinedMpg: 17,
      electricRangeMiles: 8,
    },
    baseMsrpCents: 57_243_900,
    priceSource: {
      slug: "iseecars-2025-ferrari-sf90-spider-price",
      title: "2025 Ferrari SF90 Spider Price / Destination (iSeeCars)",
      url: "https://www.iseecars.com/car/ferrari-sf90-spider-price",
      publisher: "iSeeCars",
    },
    specSource: {
      slug: "caranddriver-2025-ferrari-sf90-spider-specs",
      title: "2025 Ferrari SF90 Spider Convertible Features and Specs — Car and Driver",
      url: "https://www.caranddriver.com/ferrari/sf90-stradale/specs/2025/ferrari_sf90-stradale_ferrari-sf90-spider_2025",
    },
    description:
      "2025 Ferrari SF90 Spider PHEV roadster (US). Twin-turbo V8 + three motors, AWD, 8-speed F1 DCT.",
  },
  {
    slug: "2025-ferrari-sf90-xx-stradale-us",
    name: "SF90 XX Stradale",
    year: 2025,
    modelSlug: "ferrari-sf90-xx-stradale",
    modelName: "SF90 XX Stradale",
    generationCode: "SF90-XX",
    generationDisplayName: "SF90 XX Stradale (2023–)",
    generationStartYear: 2023,
    generationEndYear: null,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f53/Ferrari-SF90-XX-Stradale.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-sf90-xx-stradale-4.0-v8-1030hp-plug-in-hybrid-e4wd-f1-dct-48989",
    imageAlt: "Ferrari SF90 XX Stradale coupe exterior",
    epaId: "48662",
    fuelType: "PLUG_IN_HYBRID",
    engine: {
      slug: "ferrari-f154fb-sf90-xx",
      name: "F154 FB 4.0L twin-turbo V8 + triple electric motors (PHEV XX)",
      code: "F154FB",
      displacementCc: 3990,
      cylinderCount: 8,
      induction: "Twin-turbo",
      electrification: "PHEV XX (99+150 kW PMSM; EPA)",
    },
    transmission: {
      slug: "ferrari-f1-dct-8-sf90",
      name: "8-speed F1 dual-clutch automatic",
      gearCount: 8,
    },
    dimensions: {
      // auto-data / C&D XX Stradale; curb C&D est 3800 lb.
      lengthIn: 190.9,
      widthIn: 79.3,
      heightIn: 48.2,
      wheelbaseIn: 104.3,
      frontTrackIn: 66.3,
      rearTrackIn: 65.9,
      curbWeightKg: lbsToKg(3800),
      cargoVolumeLiters: 74,
      seatingCapacity: 2,
    },
    performance: {
      // Combined 1016 hp / 593 lb-ft; Ferrari 0–62 2.3 s ≈ 2.2–2.3 to 60; top ~199 mph.
      powerHp: 1016,
      torqueLbFt: 593,
      zeroToSixtySeconds: 2.3,
      topSpeedMph: 199,
    },
    fuelEconomy: {
      // EPA id 48662 gas-only; rangeA = 8 mi.
      cityMpg: 16,
      highwayMpg: 19,
      combinedMpg: 17,
      electricRangeMiles: 8,
    },
    baseMsrpCents: 89_000_000,
    priceSource: {
      slug: "caranddriver-ferrari-sf90-xx-stradale-base",
      title: "Ferrari SF90 XX Stradale drive — Car and Driver (base $890,000)",
      url: "https://www.caranddriver.com/reviews/a45807218/2024-ferrari-sf90-xx-stradale-drive/",
      publisher: "Car and Driver",
    },
    specSource: {
      slug: "auto-data-ferrari-sf90-xx-stradale-1030",
      title: "Ferrari SF90 XX Stradale 4.0 V8 (1030 Hp) PHEV — auto-data.net",
      url: "https://www.auto-data.net/en/ferrari-sf90-xx-stradale-4.0-v8-1030hp-plug-in-hybrid-e4wd-f1-dct-48989",
    },
    description:
      "2025 Ferrari SF90 XX Stradale limited-series PHEV coupe (US). Track-focused SF90 with 1016 hp combined output.",
  },
  {
    slug: "2025-ferrari-sf90-xx-spider-us",
    name: "SF90 XX Spider",
    year: 2025,
    modelSlug: "ferrari-sf90-xx-spider",
    modelName: "SF90 XX Spider",
    generationCode: "SF90-XX",
    generationDisplayName: "SF90 XX Spider (2023–)",
    generationStartYear: 2023,
    generationEndYear: null,
    bodyStyle: "ROADSTER",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f53/Ferrari-SF90-XX-Spider.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-sf90-xx-spider-4.0-v8-1030hp-plug-in-hybrid-e4wd-f1-dct-48990",
    imageAlt: "Ferrari SF90 XX Spider roadster exterior",
    epaId: "48661",
    fuelType: "PLUG_IN_HYBRID",
    engine: {
      slug: "ferrari-f154fb-sf90-xx",
      name: "F154 FB 4.0L twin-turbo V8 + triple electric motors (PHEV XX)",
      code: "F154FB",
      displacementCc: 3990,
      cylinderCount: 8,
      induction: "Twin-turbo",
      electrification: "PHEV XX (99+150 kW PMSM; EPA)",
    },
    transmission: {
      slug: "ferrari-f1-dct-8-sf90",
      name: "8-speed F1 dual-clutch automatic",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: 190.9,
      widthIn: 79.3,
      heightIn: 48.2,
      wheelbaseIn: 104.3,
      frontTrackIn: 66.3,
      rearTrackIn: 65.9,
      curbWeightKg: 1660,
      cargoVolumeLiters: 74,
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 1016,
      torqueLbFt: 593,
      zeroToSixtySeconds: 2.3,
      topSpeedMph: 199,
    },
    fuelEconomy: {
      // EPA id 48661 gas-only; rangeA = 8 mi.
      cityMpg: 16,
      highwayMpg: 19,
      combinedMpg: 17,
      electricRangeMiles: 8,
    },
    baseMsrpCents: 99_170_600,
    priceSource: {
      slug: "iseecars-2025-ferrari-sf90-xx-spider-price",
      title: "2025 Ferrari SF90 XX Spider Price / Destination (iSeeCars)",
      url: "https://www.iseecars.com/car/ferrari-sf90-spider-price",
      publisher: "iSeeCars",
    },
    specSource: {
      slug: "auto-data-ferrari-sf90-xx-spider-1030",
      title: "Ferrari SF90 XX Spider 4.0 V8 (1030 Hp) PHEV — auto-data.net",
      url: "https://www.auto-data.net/en/ferrari-sf90-xx-spider-4.0-v8-1030hp-plug-in-hybrid-e4wd-f1-dct-48990",
    },
    description:
      "2025 Ferrari SF90 XX Spider limited-series PHEV roadster (US). Open-top XX with 1016 hp combined output.",
  },
];

const STATIC_SKIPPED = [
  "F8 Tributo / Spider 2019–2022: US catalogue limited to final MY 2023 (EPA 45464 / 45465)",
  "2025 SF90 Stradale coupe: no MY2025 EPA listing; standard coupe discontinued for 2025 (C&D) — seeded last EPA year 2024 (id 47494)",
  "SF90 Stradale / Spider Assetto Fiorano: appearance/track package, same EPA powertrain — skipped",
  "SF90 XX 2023–2024 mid-years: US catalogue limited to MY2025 EPA (48662 / 48661)",
  "2024 SF90 Spider: superseded by MY2025 EPA id 48660",
];

const DESTINATION_SOURCE = {
  slug: "iseecars-ferrari-destination-5000",
  title: "Ferrari US destination charge $5,000 (iSeeCars Monroney)",
  url: "https://www.iseecars.com/car/ferrari-sf90-spider-price",
  type: "THIRD_PARTY" as const,
  publisher: "iSeeCars",
};

export async function seedFerrariF8Sf90(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  const destinationSource = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE.slug,
    title: DESTINATION_SOURCE.title,
    publisher: DESTINATION_SOURCE.publisher,
    url: DESTINATION_SOURCE.url,
    type: DESTINATION_SOURCE.type,
  });

  const claimedImages = new Set<string>();
  const modelCache = new Map<string, { id: string }>();
  const generationCache = new Map<string, { id: string }>();
  const modelYearCache = new Map<string, { id: string }>();

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

      let model = modelCache.get(trim.modelSlug);
      if (!model) {
        model = await prisma.vehicleModel.upsert({
          where: { slug: trim.modelSlug },
          create: {
            manufacturerId,
            name: trim.modelName,
            slug: trim.modelSlug,
          },
          update: { manufacturerId, name: trim.modelName },
        });
        modelCache.set(trim.modelSlug, model);
      }

      const genKey = `${model.id}:${trim.generationCode}`;
      let generation = generationCache.get(genKey);
      if (!generation) {
        generation = await prisma.vehicleGeneration.upsert({
          where: {
            modelId_code: { modelId: model.id, code: trim.generationCode },
          },
          create: {
            modelId: model.id,
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
        generationCache.set(genKey, generation);
      }

      const myKey = `${generation.id}:${trim.year}`;
      let modelYear = modelYearCache.get(myKey);
      if (!modelYear) {
        modelYear = await prisma.modelYear.upsert({
          where: {
            generationId_year: {
              generationId: generation.id,
              year: trim.year,
            },
          },
          create: { generationId: generation.id, year: trim.year },
          update: {},
        });
        modelYearCache.set(myKey, modelYear);
      }

      const engine = await ensureFerrariEngine(prisma, {
        manufacturerId,
        slug: trim.engine.slug,
        name: trim.engine.name,
        code: trim.engine.code,
        fuelType: trim.fuelType,
        displacementCc: trim.engine.displacementCc,
        cylinderCount: trim.engine.cylinderCount,
        configuration: "V",
        induction: trim.engine.induction,
        electrification: trim.engine.electrification ?? undefined,
      });

      const transmission = await prisma.transmission.upsert({
        where: { slug: trim.transmission.slug },
        create: {
          slug: trim.transmission.slug,
          name: trim.transmission.name,
          type: "DUAL_CLUTCH",
          gearCount: trim.transmission.gearCount,
        },
        update: {
          name: trim.transmission.name,
          type: "DUAL_CLUTCH",
          gearCount: trim.transmission.gearCount,
        },
      });

      const specSource = await upsertCatalogueSource(prisma, {
        slug: trim.specSource.slug,
        title: trim.specSource.title,
        publisher: "Car and Driver / auto-data.net",
        url: trim.specSource.url,
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
          modelYearId: modelYear.id,
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
          modelYearId: modelYear.id,
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

      const fuelEconomyCreate = {
        vehicleId: vehicle.id,
        cityMpg: trim.fuelEconomy.cityMpg,
        highwayMpg: trim.fuelEconomy.highwayMpg,
        combinedMpg: trim.fuelEconomy.combinedMpg,
        ...(trim.fuelEconomy.electricRangeMiles != null
          ? { electricRangeMiles: trim.fuelEconomy.electricRangeMiles }
          : { electricRangeMiles: null }),
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
            create: { vehicleId: vehicle.id, ...trim.performance },
            update: trim.performance,
          }),
          prisma.vehicleFuelEconomy.upsert({
            where: { vehicleId: vehicle.id },
            create: fuelEconomyCreate,
            update: {
              cityMpg: trim.fuelEconomy.cityMpg,
              highwayMpg: trim.fuelEconomy.highwayMpg,
              combinedMpg: trim.fuelEconomy.combinedMpg,
              electricRangeMiles: trim.fuelEconomy.electricRangeMiles,
            },
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
              amountCents: FERRARI_DESTINATION_CENTS,
              currency: "USD",
              effectiveAt: pricingDate,
            },
            update: {
              amountCents: FERRARI_DESTINATION_CENTS,
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

      const citations: Promise<unknown>[] = [
        upsertCitation(
          prisma,
          specSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "C&D / auto-data power, torque, 0–60, top speed",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "C&D / auto-data exterior dimensions, tracks, curb weight, cargo",
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
          `Base MSRP $${(trim.baseMsrpCents / 100).toLocaleString("en-US")} excluding destination`,
        ),
        upsertCitation(
          prisma,
          destinationSource.id,
          "VehiclePrice",
          destination.id,
          "amountCents",
          `US destination and handling $${(FERRARI_DESTINATION_CENTS / 100).toFixed(0)} (iSeeCars)`,
        ),
        upsertCitation(
          prisma,
          imageSource.id,
          "VehicleImage",
          image.id,
          "url",
          `auto-data.net exterior ${trim.imageUrl}`,
        ),
      ];

      if (trim.fuelEconomy.electricRangeMiles != null) {
        citations.push(
          upsertCitation(
            prisma,
            fuelSource.id,
            "VehicleFuelEconomy",
            fuelEconomy.id,
            "electricRangeMiles",
            `EPA vehicle id ${trim.epaId} (rangeA = ${trim.fuelEconomy.electricRangeMiles} mi)`,
          ),
        );
      }

      await Promise.all(citations);
      await ensureAudit(prisma, importerId, vehicle.id, trim.slug);

      const rangeNote =
        trim.fuelEconomy.electricRangeMiles != null
          ? ` | EV=${trim.fuelEconomy.electricRangeMiles}mi`
          : "";
      seeded.push(
        `${trim.slug} | EPA=${trim.epaId}${rangeNote} | image=${imageUrl}`,
      );
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      skipped.push(`${trim.slug}: ${reason}`);
    }
  }

  return { seeded, skipped };
}
