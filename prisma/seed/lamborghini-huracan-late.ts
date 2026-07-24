/**
 * Lamborghini Huracán late variants (US market) — EVO family + STO / Tecnica / Sterrato.
 * Last US year per trim (one each). Idempotent — safe to re-run.
 * Does not wire itself into prisma/seed.ts.
 *
 * Seeded:
 * - 2022 Huracán EVO (AWD coupe) — EPA 44099
 * - 2022 Huracán EVO Spyder (AWD) — EPA 44098
 * - 2022 Huracán EVO RWD — EPA 44101
 * - 2022 Huracán EVO RWD Spyder — EPA 44100
 * - 2024 Huracán STO — EPA 46635 (Coupe 2WD)
 * - 2024 Huracán Tecnica — EPA 46635 (Coupe 2WD)
 * - 2024 Huracán Sterrato — EPA 46634
 *
 * Images: unique auto-data.net exteriors (EVO/STO/Tecnica/Sterrato filenames —
 * distinct from early LP 610-4 / Performante module assets).
 *
 * Sources: EPA fueleconomy.gov; iSeeCars Monroney MSRP/destination; Car and Driver /
 * CarBuzz / auto-data.net (dims, power, 0–60, cargo).
 */
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

const LBS_TO_KG = 0.45359237;
const MM_TO_IN = 1 / 25.4;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function mmToIn(mm: number) {
  return Math.round(mm * MM_TO_IN * 10) / 10;
}

type TrimSeed = {
  slug: string;
  name: string;
  year: 2022 | 2024;
  generationCode: string;
  generationDisplayName: string;
  generationStartYear: number;
  generationEndYear: number | null;
  bodyStyle: "COUPE" | "CABRIOLET";
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
  specUrl: string;
  specTitle: string;
  specPublisher: string;
};

/**
 * Unique late-variant exteriors (HEAD 200 image/jpeg).
 * Avoid LP 610-4 / Performante / early-module filenames.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2022-lamborghini-huracan-evo-us",
    name: "Huracán EVO",
    year: 2022,
    generationCode: "LB724",
    generationDisplayName: "Huracán (LB724)",
    generationStartYear: 2014,
    generationEndYear: 2024,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f10/Lamborghini-Huracan-EVO_1.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-evo-facelift-2019-5.2-v10-640hp-awd-ldf-35384",
    imageAlt: "2022 Lamborghini Huracán EVO coupe exterior",
    epaId: "44099",
    engine: {
      slug: "lamborghini-l539-640ps",
      name: "5.2L V10 naturally aspirated (640 PS)",
      code: "L539-640PS",
      displacementCc: 5204,
      cylinderCount: 10,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "lamborghini-ldf-7",
      name: "7-speed LDF dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // Car and Driver 2022 EVO Coupe AWD; tracks auto-data 1668/1620 mm.
      lengthIn: 175.6,
      widthIn: 76.1,
      heightIn: 45.9,
      wheelbaseIn: 103.1,
      frontTrackIn: 65.7,
      rearTrackIn: 63.8,
      curbWeightKg: 1422, // auto-data kerb (OEM dry-style figure)
      cargoVolumeLiters: 100, // auto-data trunk minimum
      seatingCapacity: 2,
    },
    performance: {
      // C&D US SAE 630 hp / 442 lb-ft; 0–60 auto-data calc from OEM 0–100.
      powerHp: 630,
      torqueLbFt: 442,
      zeroToSixtySeconds: 2.8,
      topSpeedMph: 202,
    },
    // EPA Coupe AWD id 44099 — 13/18/15.
    fuelEconomy: { cityMpg: 13, highwayMpg: 18, combinedMpg: 15 },
    // iSeeCars 2022 AWD EVO Coupe MSRP excl. destination.
    baseMsrpCents: 26_127_400,
    specUrl:
      "https://www.caranddriver.com/lamborghini/huracan/specs/2022/lamborghini_huracan_lamborghini-huracan-evo_2022",
    specTitle: "2022 Lamborghini Huracán EVO Coupe AWD — Car and Driver specs",
    specPublisher: "Car and Driver",
  },
  {
    slug: "2022-lamborghini-huracan-evo-spyder-us",
    name: "Huracán EVO Spyder",
    year: 2022,
    generationCode: "LB724",
    generationDisplayName: "Huracán (LB724)",
    generationStartYear: 2014,
    generationEndYear: 2024,
    bodyStyle: "CABRIOLET",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f71/Lamborghini-Huracan-EVO-Spyder-II.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-evo-spyder-facelift-2019-5.2-v10-640hp-awd-dct-36232",
    imageAlt: "2022 Lamborghini Huracán EVO Spyder exterior",
    epaId: "44098",
    engine: {
      slug: "lamborghini-l539-640ps",
      name: "5.2L V10 naturally aspirated (640 PS)",
      code: "L539-640PS",
      displacementCc: 5204,
      cylinderCount: 10,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "lamborghini-ldf-7",
      name: "7-speed LDF dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // Length/width/tracks shared with EVO coupe; height auto-data 1180 mm.
      lengthIn: 175.6,
      widthIn: 76.1,
      heightIn: mmToIn(1180),
      wheelbaseIn: 103.1,
      frontTrackIn: 65.7,
      rearTrackIn: 63.8,
      curbWeightKg: 1542, // auto-data kerb
      cargoVolumeLiters: 100,
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 630,
      torqueLbFt: 442,
      zeroToSixtySeconds: 2.9,
      topSpeedMph: 202,
    },
    // EPA Spyder AWD id 44098 — 13/18/15.
    fuelEconomy: { cityMpg: 13, highwayMpg: 18, combinedMpg: 15 },
    // iSeeCars 2022 AWD EVO Spyder MSRP excl. destination.
    baseMsrpCents: 29_369_500,
    specUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-evo-spyder-facelift-2019-5.2-v10-640hp-awd-dct-36232",
    specTitle:
      "Lamborghini Huracán EVO Spyder 5.2 V10 AWD — auto-data.net specs",
    specPublisher: "auto-data.net",
  },
  {
    slug: "2022-lamborghini-huracan-evo-rwd-us",
    name: "Huracán EVO RWD",
    year: 2022,
    generationCode: "LB724",
    generationDisplayName: "Huracán (LB724)",
    generationStartYear: 2014,
    generationEndYear: 2024,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl:
      "https://www.auto-data.net/images/f112/Lamborghini-Huracan-EVO-II.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-evo-facelift-2019-5.2-v10-610hp-ldf-38622",
    imageAlt: "2022 Lamborghini Huracán EVO RWD coupe exterior",
    epaId: "44101",
    engine: {
      slug: "lamborghini-l539-610ps",
      name: "5.2L V10 naturally aspirated (610 PS)",
      code: "L539-610PS",
      displacementCc: 5204,
      cylinderCount: 10,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "lamborghini-ldf-7",
      name: "7-speed LDF dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // Shared EVO coupe shell; kerb auto-data RWD.
      lengthIn: 175.6,
      widthIn: 76.1,
      heightIn: 45.9,
      wheelbaseIn: 103.1,
      frontTrackIn: 65.7,
      rearTrackIn: 63.8,
      curbWeightKg: 1389,
      cargoVolumeLiters: 100,
      seatingCapacity: 2,
    },
    performance: {
      // US SAE ~602 hp / 413 lb-ft (610 PS / 560 Nm).
      powerHp: 602,
      torqueLbFt: 413,
      zeroToSixtySeconds: 3.1,
      topSpeedMph: 202,
    },
    // EPA Coupe RWD id 44101 — 13/18/15.
    fuelEconomy: { cityMpg: 13, highwayMpg: 18, combinedMpg: 15 },
    // iSeeCars 2022 EVO Coupe (RWD) MSRP excl. destination.
    baseMsrpCents: 20_940_900,
    specUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-evo-facelift-2019-5.2-v10-610hp-ldf-38622",
    specTitle: "Lamborghini Huracán EVO 5.2 V10 RWD — auto-data.net specs",
    specPublisher: "auto-data.net",
  },
  {
    slug: "2022-lamborghini-huracan-evo-rwd-spyder-us",
    name: "Huracán EVO RWD Spyder",
    year: 2022,
    generationCode: "LB724",
    generationDisplayName: "Huracán (LB724)",
    generationStartYear: 2014,
    generationEndYear: 2024,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    imageUrl:
      "https://www.auto-data.net/images/f45/Lamborghini-Huracan-EVO-Spyder-II.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-evo-spyder-facelift-2019-5.2-v10-610hp-ldf-41720",
    imageAlt: "2022 Lamborghini Huracán EVO RWD Spyder exterior",
    epaId: "44100",
    engine: {
      slug: "lamborghini-l539-610ps",
      name: "5.2L V10 naturally aspirated (610 PS)",
      code: "L539-610PS",
      displacementCc: 5204,
      cylinderCount: 10,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "lamborghini-ldf-7",
      name: "7-speed LDF dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      lengthIn: 175.6,
      widthIn: 76.1,
      heightIn: mmToIn(1180),
      wheelbaseIn: 103.1,
      frontTrackIn: 65.7,
      rearTrackIn: 63.8,
      curbWeightKg: 1509,
      cargoVolumeLiters: 100,
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 602,
      torqueLbFt: 413,
      zeroToSixtySeconds: 3.3,
      topSpeedMph: 201,
    },
    // EPA Spyder RWD id 44100 — 13/18/15.
    fuelEconomy: { cityMpg: 13, highwayMpg: 18, combinedMpg: 15 },
    // iSeeCars 2022 EVO Spyder (RWD) MSRP excl. destination.
    baseMsrpCents: 23_026_600,
    specUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-evo-spyder-facelift-2019-5.2-v10-610hp-ldf-41720",
    specTitle:
      "Lamborghini Huracán EVO Spyder 5.2 V10 RWD — auto-data.net specs",
    specPublisher: "auto-data.net",
  },
  {
    slug: "2024-lamborghini-huracan-sto-us",
    name: "Huracán STO",
    year: 2024,
    generationCode: "LB724",
    generationDisplayName: "Huracán (LB724)",
    generationStartYear: 2014,
    generationEndYear: 2024,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl:
      "https://www.auto-data.net/images/f106/Lamborghini-Huracan-STO-facelift-2020.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-sto-facelift-2020-5.2-v10-640hp-ldf-41726",
    imageAlt: "2024 Lamborghini Huracán STO coupe exterior",
    epaId: "46635",
    engine: {
      slug: "lamborghini-l539-640ps",
      name: "5.2L V10 naturally aspirated (640 PS)",
      code: "L539-640PS",
      displacementCc: 5204,
      cylinderCount: 10,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "lamborghini-ldf-7",
      name: "7-speed LDF dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // Car and Driver 2024 STO Coupe.
      lengthIn: 179.1,
      widthIn: 76.6,
      heightIn: 48.0,
      wheelbaseIn: 103.2,
      frontTrackIn: 66.5,
      rearTrackIn: 65.0,
      curbWeightKg: lbsToKg(3172), // C&D base curb
      cargoVolumeLiters: 38, // auto-data / dealer 38 L (~1.3 cu ft)
      seatingCapacity: 2,
    },
    performance: {
      // C&D / dealer US SAE 630 hp / 416 lb-ft; 0–60 auto-data calc.
      powerHp: 630,
      torqueLbFt: 416,
      zeroToSixtySeconds: 2.9,
      topSpeedMph: 193,
    },
    // EPA Coupe 2WD id 46635 — 13/18/15 (shared Tecnica powertrain FE).
    fuelEconomy: { cityMpg: 13, highwayMpg: 18, combinedMpg: 15 },
    // iSeeCars 2024 STO Coupe MSRP excl. destination.
    baseMsrpCents: 34_108_300,
    specUrl:
      "https://www.caranddriver.com/lamborghini/huracan/specs/2024/lamborghini_huracan_lamborghini-huracan-sto_2024",
    specTitle: "2024 Lamborghini Huracán STO Coupe — Car and Driver specs",
    specPublisher: "Car and Driver",
  },
  {
    slug: "2024-lamborghini-huracan-tecnica-us",
    name: "Huracán Tecnica",
    year: 2024,
    generationCode: "LB724",
    generationDisplayName: "Huracán (LB724)",
    generationStartYear: 2014,
    generationEndYear: 2024,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl:
      "https://www.auto-data.net/images/f90/Lamborghini-Huracan-Tecnica-facelift-2022_2.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-tecnica-facelift-2022-5.2-v10-640hp-ldf-45665",
    imageAlt: "2024 Lamborghini Huracán Tecnica coupe exterior",
    epaId: "46635",
    engine: {
      slug: "lamborghini-l539-640ps",
      name: "5.2L V10 naturally aspirated (640 PS)",
      code: "L539-640PS",
      displacementCc: 5204,
      cylinderCount: 10,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "lamborghini-ldf-7",
      name: "7-speed LDF dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // CarBuzz / auto-data Tecnica (4567×1933×1165 mm, tracks 1668/1624).
      lengthIn: mmToIn(4567),
      widthIn: mmToIn(1933),
      heightIn: mmToIn(1165),
      wheelbaseIn: mmToIn(2620),
      frontTrackIn: mmToIn(1668),
      rearTrackIn: mmToIn(1624),
      curbWeightKg: 1379, // auto-data kerb (OEM dry-style)
      cargoVolumeLiters: 100, // auto-data / CarBuzz ~3.5 cu ft
      seatingCapacity: 2,
    },
    performance: {
      // CarBuzz / KBB ~631 hp / 417 lb-ft; 0–60 auto-data calc.
      powerHp: 631,
      torqueLbFt: 417,
      zeroToSixtySeconds: 3.0,
      topSpeedMph: 202,
    },
    // EPA Coupe 2WD id 46635 — 13/18/15.
    fuelEconomy: { cityMpg: 13, highwayMpg: 18, combinedMpg: 15 },
    // iSeeCars 2024 Tecnica Coupe MSRP excl. destination.
    baseMsrpCents: 24_617_000,
    specUrl: "https://carbuzz.com/cars/lamborghini/huracan-tecnica/2024/",
    specTitle: "2024 Lamborghini Huracán Tecnica — CarBuzz pricing & specs",
    specPublisher: "CarBuzz",
  },
  {
    slug: "2024-lamborghini-huracan-sterrato-us",
    name: "Huracán Sterrato",
    year: 2024,
    generationCode: "LB724",
    generationDisplayName: "Huracán (LB724)",
    generationStartYear: 2014,
    generationEndYear: 2024,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f63/Lamborghini-Huracan-Sterrato.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-sterrato-facelift-2023-5.2-v10-610hp-awd-ldf-46947",
    imageAlt: "2024 Lamborghini Huracán Sterrato coupe exterior",
    epaId: "46634",
    engine: {
      slug: "lamborghini-l539-610ps",
      name: "5.2L V10 naturally aspirated (610 PS)",
      code: "L539-610PS",
      displacementCc: 5204,
      cylinderCount: 10,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "lamborghini-ldf-7",
      name: "7-speed LDF dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // auto-data Sterrato 4525×1956×1248 mm, WB 2629, tracks 1698/1654.
      lengthIn: mmToIn(4525),
      widthIn: mmToIn(1956),
      heightIn: mmToIn(1248),
      wheelbaseIn: mmToIn(2629),
      frontTrackIn: mmToIn(1698),
      rearTrackIn: mmToIn(1654),
      curbWeightKg: 1470,
      cargoVolumeLiters: 100,
      seatingCapacity: 2,
    },
    performance: {
      // US SAE ~602 hp / 413 lb-ft; top 162 mph; 0–60 auto-data calc.
      powerHp: 602,
      torqueLbFt: 413,
      zeroToSixtySeconds: 3.2,
      topSpeedMph: 162,
    },
    // EPA Sterrato id 46634 — 13/18/15.
    fuelEconomy: { cityMpg: 13, highwayMpg: 18, combinedMpg: 15 },
    // iSeeCars 2024 AWD Sterrato Coupe MSRP excl. destination.
    baseMsrpCents: 27_317_700,
    specUrl:
      "https://www.auto-data.net/en/lamborghini-huracan-sterrato-facelift-2023-5.2-v10-610hp-awd-ldf-46947",
    specTitle:
      "Lamborghini Huracán Sterrato 5.2 V10 AWD — auto-data.net specs",
    specPublisher: "auto-data.net",
  },
];

const STATIC_SKIPPED = [
  "LP 610-4 / LP 580-2 / Performante (coupe & Spyder): early Huracán module",
  "MY 2019–2021 EVO / mid-years: prefer last US EVO year 2022",
  "MY 2023 EVO coupe / RWD carryover: last full EVO coupe year seeded as 2022",
  "2023–2024 EVO Spyder AWD (EPA 46633): still listed in 2024; skipped to keep EVO Spyder at final ~2022 with coupe family",
  "Huracán Tecnica Spyder / STO anniversary specials: not separate complete US catalogue trims here",
  "Pre-facelift Super Trofeo race cars: competition variants, not street EPA catalogue",
];

/** Matches LAMBORGHINI_DESTINATION_CENTS.sportsCar ($3,695). */
const DESTINATION_SOURCE = {
  slug: "iseecars-2024-lamborghini-huracan-destination",
  title: "2024 Lamborghini Huracan destination charge $3,695 (iSeeCars)",
  url: "https://www.iseecars.com/car/2024-lamborghini-huracan-price",
  type: "THIRD_PARTY" as const,
  publisher: "iSeeCars",
};

const MODEL_SLUG = "lamborghini-huracan";
const MODEL_NAME = "Huracán";

export async function seedLamborghiniHuracanLate(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  const model = await prisma.vehicleModel.upsert({
    where: { slug: MODEL_SLUG },
    create: {
      manufacturerId,
      name: MODEL_NAME,
      slug: MODEL_SLUG,
    },
    update: { manufacturerId, name: MODEL_NAME },
  });

  const generationCache = new Map<
    string,
    { id: string; years: Map<number, string> }
  >();

  async function ensureModelYear(trim: TrimSeed) {
    let genEntry = generationCache.get(trim.generationCode);
    if (!genEntry) {
      const generation = await prisma.vehicleGeneration.upsert({
        where: {
          modelId_code: {
            modelId: model.id,
            code: trim.generationCode,
          },
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
      genEntry = { id: generation.id, years: new Map() };
      generationCache.set(trim.generationCode, genEntry);
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

  const destinationCents = LAMBORGHINI_DESTINATION_CENTS.sportsCar;
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
        slug: `lamborghini-huracan-late-${trim.slug}-specs`,
        title: trim.specTitle,
        publisher: trim.specPublisher,
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
        slug: `iseecars-price-${trim.slug}`,
        title: `${trim.year} Lamborghini Huracan MSRP (iSeeCars)`,
        publisher: "iSeeCars",
        url:
          trim.year === 2022
            ? "https://www.iseecars.com/car/2022-lamborghini-huracan-price"
            : "https://www.iseecars.com/car/2024-lamborghini-huracan-price",
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
          "Power, torque, 0–60 mph, and top speed from cited catalogue / OEM-derived specs",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Exterior dimensions, tracks, curb/kerb weight, cargo",
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
          `Base MSRP excluding destination (${trim.year} US iSeeCars)`,
        ),
        upsertCitation(
          prisma,
          destinationSource.id,
          "VehiclePrice",
          destination.id,
          "amountCents",
          `Destination and handling $${(destinationCents / 100).toFixed(0)}`,
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
