/**
 * Ferrari 812 family + Monza Icona US seed module.
 * Final US EPA years only (one trim each). Does not wire itself into prisma/seed.ts.
 *
 * Seeded:
 * - 2021 812 Superfast (EPA 42761) — last Superfast EPA year
 * - 2023 812 GTS (EPA 45466) — last GTS EPA year
 * - 2024 812 Competizione (EPA 47008)
 * - 2024 812 Competizione A (EPA 47009)
 * - 2023 Monza SP1 (EPA 45963) — last Monza EPA year
 * - 2023 Monza SP2 (EPA 45964)
 *
 * Sources: EPA fueleconomy.gov; Ferrari.com press; CarBuzz / Car and Driver / KBB pricing & dims.
 */
import type {
  BodyStyle,
  Drivetrain,
  FuelType,
  TransmissionType,
} from "../../src/generated/prisma/client";
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
const MM_TO_IN = 1 / 25.4;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

function mmToIn(mm: number) {
  return Math.round((mm * MM_TO_IN) * 10) / 10;
}

/** Unique auto-data.net exteriors (distinct folders/angles; HEAD-verified JPEG). */
const IMAGE_SUPERFAST =
  "https://www.auto-data.net/images/f42/Ferrari-812-Superfast.jpg";
const IMAGE_GTS = "https://www.auto-data.net/images/f89/Ferrari-812-GTS.jpg";
const IMAGE_COMPETIZIONE =
  "https://www.auto-data.net/images/f66/Ferrari-812-Competizione.jpg";
const IMAGE_COMPETIZIONE_A =
  "https://www.auto-data.net/images/f74/Ferrari-812-Competizione-A.jpg";
const IMAGE_MONZA_SP1 =
  "https://www.auto-data.net/images/f66/Ferrari-Monza-SP.jpg";
const IMAGE_MONZA_SP2 =
  "https://www.auto-data.net/images/f91/Ferrari-Monza-SP.jpg";

type ModelSlug = "ferrari-812" | "ferrari-monza";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: string;
  generationCode: string;
  generationLabel: string;
  generationStartYear: number;
  generationEndYear: number | null;
  year: number;
  bodyStyle: BodyStyle;
  drivetrain: Drivetrain;
  imageUrl: string;
  imageAlt: string;
  imagePageUrl: string;
  imageCredit: string;
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
  };
  transmissionSlug: string;
  transmissionName: string;
  transmissionType: TransmissionType;
  gearCount: number;
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
  baseMsrpCents: number;
  description: string;
  pressSource: {
    slug: string;
    title: string;
    url: string;
    publisher: string;
    type: "MANUFACTURER" | "PRESS_RELEASE" | "THIRD_PARTY";
  };
  priceSource: {
    slug: string;
    title: string;
    url: string;
    publisher: string;
    type: "THIRD_PARTY" | "PRESS_RELEASE" | "MANUFACTURER";
  };
};

const TRIMS: TrimSeed[] = [
  {
    slug: "2021-ferrari-812-superfast-us",
    name: "812 Superfast",
    modelSlug: "ferrari-812",
    modelName: "812",
    generationCode: "F152M",
    generationLabel: "812 Superfast / GTS / Competizione (F152M)",
    generationStartYear: 2017,
    generationEndYear: 2024,
    year: 2021,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: IMAGE_SUPERFAST,
    imageAlt: "Ferrari 812 Superfast coupe exterior (front three-quarter)",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-812-superfast-6.5-v12-800hp-dct-29728",
    imageCredit: "auto-data.net",
    epaId: "42761",
    engine: {
      slug: "ferrari-f140ga-812",
      name: "F140GA 6.5L naturally aspirated V12",
      code: "F140GA",
      fuelType: "PETROL",
      displacementCc: 6496,
      cylinderCount: 12,
      configuration: "V",
      induction: "Naturally aspirated",
    },
    transmissionSlug: "ferrari-f1-dct-7-812",
    transmissionName: "7-speed F1 dual-clutch automatic (AM7)",
    transmissionType: "DUAL_CLUTCH",
    gearCount: 7,
    dimensions: {
      // CarBuzz 2021 Superfast US dims / curb.
      lengthIn: 183.4,
      widthIn: 77.6,
      heightIn: 50.2,
      wheelbaseIn: 107.1,
      frontTrackIn: 65.8,
      rearTrackIn: 64.8,
      curbWeightKg: lbsToKg(3593),
      cargoVolumeLiters: 320, // Ferrari family luggage figure (liters)
      seatingCapacity: 2,
    },
    performance: {
      // Ferrari 800 cv / Car and Driver: 789 hp, 530 lb-ft; C/D tested 0–60 2.8 s; top 211 mph.
      powerHp: 789,
      torqueLbFt: 530,
      zeroToSixtySeconds: 2.8,
      topSpeedMph: 211,
    },
    fuelEconomy: { cityMpg: 12, highwayMpg: 16, combinedMpg: 13 },
    baseMsrpCents: 33_500_000, // CarBuzz 2021 base MSRP $335,000
    description:
      "2021 Ferrari 812 Superfast (US). Front-engine NA V12 coupe; final Superfast EPA model year.",
    pressSource: {
      slug: "caranddriver-2021-ferrari-812-superfast-gts",
      title: "2021 Ferrari 812 Superfast / GTS Review, Pricing, and Specs",
      url: "https://www.caranddriver.com/ferrari/812-superfast-2021",
      publisher: "Car and Driver",
      type: "THIRD_PARTY",
    },
    priceSource: {
      slug: "carbuzz-2021-ferrari-812-superfast",
      title: "2021 Ferrari 812 Superfast Pricing, Photos & Specs (CarBuzz)",
      url: "https://carbuzz.com/cars/ferrari/812-superfast/2021/",
      publisher: "CarBuzz",
      type: "THIRD_PARTY",
    },
  },
  {
    slug: "2023-ferrari-812-gts-us",
    name: "812 GTS",
    modelSlug: "ferrari-812",
    modelName: "812",
    generationCode: "F152M",
    generationLabel: "812 Superfast / GTS / Competizione (F152M)",
    generationStartYear: 2017,
    generationEndYear: 2024,
    year: 2023,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    imageUrl: IMAGE_GTS,
    imageAlt: "Ferrari 812 GTS convertible exterior (front three-quarter)",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-812-gts-6.5-v12-800hp-dct-39253",
    imageCredit: "auto-data.net",
    epaId: "45466",
    engine: {
      slug: "ferrari-f140ga-812",
      name: "F140GA 6.5L naturally aspirated V12",
      code: "F140GA",
      fuelType: "PETROL",
      displacementCc: 6496,
      cylinderCount: 12,
      configuration: "V",
      induction: "Naturally aspirated",
    },
    transmissionSlug: "ferrari-f1-dct-7-812",
    transmissionName: "7-speed F1 dual-clutch automatic (AM7)",
    transmissionType: "DUAL_CLUTCH",
    gearCount: 7,
    dimensions: {
      // Car and Driver / CarBuzz 812 GTS.
      lengthIn: 184.8,
      widthIn: 77.6,
      heightIn: 50.2,
      wheelbaseIn: 107.1,
      frontTrackIn: 65.8,
      rearTrackIn: 64.8,
      curbWeightKg: lbsToKg(3627), // KBB curb
      cargoVolumeLiters: cuFtToLiters(7), // C/D trunk ~7 cu ft
      seatingCapacity: 2,
    },
    performance: {
      // Same V12 as Superfast; C/D est 0–60 ~2.9 s for GTS.
      powerHp: 789,
      torqueLbFt: 530,
      zeroToSixtySeconds: 2.9,
      topSpeedMph: 211,
    },
    fuelEconomy: { cityMpg: 12, highwayMpg: 15, combinedMpg: 13 },
    baseMsrpCents: 42_981_500, // Cars.com / CarBuzz 2023 Convertible MSRP $429,815
    description:
      "2023 Ferrari 812 GTS (US). Retractable-hardtop V12 convertible; final GTS EPA model year.",
    pressSource: {
      slug: "caranddriver-2023-ferrari-812-gts",
      title: "2023 Ferrari 812GTS Review, Pricing, and Specs",
      url: "https://www.caranddriver.com/ferrari/812-2023",
      publisher: "Car and Driver",
      type: "THIRD_PARTY",
    },
    priceSource: {
      slug: "carbuzz-2023-ferrari-812-gts",
      title: "2023 Ferrari 812 GTS Pricing, Photos & Specs (CarBuzz)",
      url: "https://carbuzz.com/cars/ferrari/812-gts/2023/",
      publisher: "CarBuzz",
      type: "THIRD_PARTY",
    },
  },
  {
    slug: "2024-ferrari-812-competizione-us",
    name: "812 Competizione",
    modelSlug: "ferrari-812",
    modelName: "812",
    generationCode: "F152M",
    generationLabel: "812 Superfast / GTS / Competizione (F152M)",
    generationStartYear: 2017,
    generationEndYear: 2024,
    year: 2024,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: IMAGE_COMPETIZIONE,
    imageAlt: "Ferrari 812 Competizione coupe exterior (side profile)",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-812-competizione-generation-8535",
    imageCredit: "auto-data.net",
    epaId: "47008",
    engine: {
      slug: "ferrari-f140hb-812-competizione",
      name: "F140HB 6.5L naturally aspirated V12 (830 cv)",
      code: "F140HB",
      fuelType: "PETROL",
      displacementCc: 6496,
      cylinderCount: 12,
      configuration: "V",
      induction: "Naturally aspirated",
    },
    transmissionSlug: "ferrari-f1-dct-7-812",
    transmissionName: "7-speed F1 dual-clutch automatic (AM7)",
    transmissionType: "DUAL_CLUTCH",
    gearCount: 7,
    dimensions: {
      // Ferrari press / dealer tech sheet (mm → in); dry weight 1487 kg.
      lengthIn: mmToIn(4696),
      widthIn: mmToIn(1971),
      heightIn: mmToIn(1276),
      wheelbaseIn: mmToIn(2720),
      frontTrackIn: mmToIn(1672),
      rearTrackIn: mmToIn(1645),
      curbWeightKg: 1487, // Ferrari dry weight (kg)
      cargoVolumeLiters: cuFtToLiters(5), // EPA lv2 = 5 cu ft
      seatingCapacity: 2,
    },
    performance: {
      // Ferrari 830 cv ≈ 819 hp; torque 692 Nm ≈ 510 lb-ft; 0–100 km/h 2.85 s → ~2.8 to 60; top 211 mph.
      powerHp: 819,
      torqueLbFt: 510,
      zeroToSixtySeconds: 2.8,
      topSpeedMph: 211,
    },
    fuelEconomy: { cityMpg: 12, highwayMpg: 16, combinedMpg: 14 },
    baseMsrpCents: 60_674_800, // KBB 2024 starting sticker $606,748
    description:
      "2024 Ferrari 812 Competizione (US). Limited-series track-focused V12 berlinetta; final Competizione EPA year.",
    pressSource: {
      slug: "ferrari-812-competizione-official",
      title: "Ferrari 812 Competizione — official",
      url: "https://www.ferrari.com/en-US/auto/812-competizione",
      publisher: "Ferrari",
      type: "MANUFACTURER",
    },
    priceSource: {
      slug: "kbb-2024-ferrari-812-competizione",
      title: "2024 Ferrari 812 Competizione (Kelley Blue Book)",
      url: "https://www.kbb.com/ferrari/812-competizione/",
      publisher: "Kelley Blue Book",
      type: "THIRD_PARTY",
    },
  },
  {
    slug: "2024-ferrari-812-competizione-a-us",
    name: "812 Competizione A",
    modelSlug: "ferrari-812",
    modelName: "812",
    generationCode: "F152M",
    generationLabel: "812 Superfast / GTS / Competizione (F152M)",
    generationStartYear: 2017,
    generationEndYear: 2024,
    year: 2024,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    imageUrl: IMAGE_COMPETIZIONE_A,
    imageAlt: "Ferrari 812 Competizione A targa exterior (front three-quarter)",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-812-competizione-a-generation-10914",
    imageCredit: "auto-data.net",
    epaId: "47009",
    engine: {
      slug: "ferrari-f140hb-812-competizione",
      name: "F140HB 6.5L naturally aspirated V12 (830 cv)",
      code: "F140HB",
      fuelType: "PETROL",
      displacementCc: 6496,
      cylinderCount: 12,
      configuration: "V",
      induction: "Naturally aspirated",
    },
    transmissionSlug: "ferrari-f1-dct-7-812",
    transmissionName: "7-speed F1 dual-clutch automatic (AM7)",
    transmissionType: "DUAL_CLUTCH",
    gearCount: 7,
    dimensions: {
      // Same chassis dims as Competizione (Ferrari Competizione A tech sheet).
      lengthIn: mmToIn(4696),
      widthIn: mmToIn(1971),
      heightIn: mmToIn(1276),
      wheelbaseIn: mmToIn(2720),
      frontTrackIn: mmToIn(1672),
      rearTrackIn: mmToIn(1645),
      curbWeightKg: 1487, // Ferrari dry weight (shared Competizione figure)
      cargoVolumeLiters: cuFtToLiters(5), // EPA lv2 = 5 cu ft
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 819,
      torqueLbFt: 510,
      zeroToSixtySeconds: 2.85,
      topSpeedMph: 211,
    },
    fuelEconomy: { cityMpg: 12, highwayMpg: 16, combinedMpg: 14 },
    baseMsrpCents: 67_200_000, // CarBuzz Competizione A MSRP ~$672,000
    description:
      "2024 Ferrari 812 Competizione A (US). Limited-series Targa-top V12; final Competizione A EPA year.",
    pressSource: {
      slug: "ferrari-812-competizione-a-official",
      title: "Ferrari 812 Competizione A — official",
      url: "https://www.ferrari.com/en-US/auto/812-competizione-a",
      publisher: "Ferrari",
      type: "MANUFACTURER",
    },
    priceSource: {
      slug: "carbuzz-ferrari-812-competizione-vs-a",
      title: "Ferrari 812 Competizione vs Competizione A (CarBuzz)",
      url: "https://carbuzz.com/compare/ferrari-812-competizione-vs-ferrari-812-competizione-a/",
      publisher: "CarBuzz",
      type: "THIRD_PARTY",
    },
  },
  {
    slug: "2023-ferrari-monza-sp1-us",
    name: "Monza SP1",
    modelSlug: "ferrari-monza",
    modelName: "Monza",
    generationCode: "F175",
    generationLabel: "Monza SP Icona (F175)",
    generationStartYear: 2019,
    generationEndYear: 2023,
    year: 2023,
    bodyStyle: "ROADSTER",
    drivetrain: "RWD",
    imageUrl: IMAGE_MONZA_SP1,
    imageAlt: "Ferrari Monza SP1 barchetta exterior",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-monza-sp-sp1-6.5-v12-810hp-automatic-34276",
    imageCredit: "auto-data.net",
    epaId: "45963",
    engine: {
      slug: "ferrari-f140gc-monza",
      name: "F140GC 6.5L naturally aspirated V12 (810 cv)",
      code: "F140GC",
      fuelType: "PETROL",
      displacementCc: 6496,
      cylinderCount: 12,
      configuration: "V",
      induction: "Naturally aspirated",
    },
    transmissionSlug: "ferrari-f1-dct-7-812",
    transmissionName: "7-speed F1 dual-clutch automatic (AM7)",
    transmissionType: "DUAL_CLUTCH",
    gearCount: 7,
    dimensions: {
      // Ferrari.com Monza SP1 technical details (mm → in).
      lengthIn: mmToIn(4657),
      widthIn: mmToIn(1996),
      heightIn: mmToIn(1155),
      wheelbaseIn: mmToIn(2720),
      frontTrackIn: mmToIn(1688),
      rearTrackIn: mmToIn(1678),
      curbWeightKg: 1500, // Ferrari dry weight ~1500 kg (SP1)
      cargoVolumeLiters: cuFtToLiters(3), // EPA lv2 = 3 cu ft
      seatingCapacity: 1,
    },
    performance: {
      // Ferrari: 810 cv, 719 Nm, 0–100 km/h 2.9 s, >300 km/h.
      powerHp: 799,
      torqueLbFt: 530,
      zeroToSixtySeconds: 2.9,
      topSpeedMph: 186,
    },
    fuelEconomy: { cityMpg: 12, highwayMpg: 15, combinedMpg: 13 },
    baseMsrpCents: 180_000_000, // CarBuzz Icona estimate ~$1.8M (no official US Monroney)
    description:
      "2023 Ferrari Monza SP1 (US EPA). Single-seat Icona barchetta; final Monza SP1 EPA year.",
    pressSource: {
      slug: "ferrari-monza-sp1-official",
      title: "Ferrari Monza SP1 — official",
      url: "https://www.ferrari.com/en-EN/auto/monza-sp1",
      publisher: "Ferrari",
      type: "MANUFACTURER",
    },
    priceSource: {
      slug: "carbuzz-2023-ferrari-monza-sp1",
      title: "2023 Ferrari Monza SP1 Pricing, Photos & Specs (CarBuzz)",
      url: "https://carbuzz.com/cars/ferrari/monza-sp1/2023/",
      publisher: "CarBuzz",
      type: "THIRD_PARTY",
    },
  },
  {
    slug: "2023-ferrari-monza-sp2-us",
    name: "Monza SP2",
    modelSlug: "ferrari-monza",
    modelName: "Monza",
    generationCode: "F175",
    generationLabel: "Monza SP Icona (F175)",
    generationStartYear: 2019,
    generationEndYear: 2023,
    year: 2023,
    bodyStyle: "ROADSTER",
    drivetrain: "RWD",
    imageUrl: IMAGE_MONZA_SP2,
    imageAlt: "Ferrari Monza SP2 barchetta exterior (front three-quarter)",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-monza-sp-sp2-6.5-v12-810hp-automatic-34277",
    imageCredit: "auto-data.net",
    epaId: "45964",
    engine: {
      slug: "ferrari-f140gc-monza",
      name: "F140GC 6.5L naturally aspirated V12 (810 cv)",
      code: "F140GC",
      fuelType: "PETROL",
      displacementCc: 6496,
      cylinderCount: 12,
      configuration: "V",
      induction: "Naturally aspirated",
    },
    transmissionSlug: "ferrari-f1-dct-7-812",
    transmissionName: "7-speed F1 dual-clutch automatic (AM7)",
    transmissionType: "DUAL_CLUTCH",
    gearCount: 7,
    dimensions: {
      lengthIn: mmToIn(4657),
      widthIn: mmToIn(1996),
      heightIn: mmToIn(1155),
      wheelbaseIn: mmToIn(2720),
      frontTrackIn: mmToIn(1688),
      rearTrackIn: mmToIn(1678),
      curbWeightKg: 1520, // Ferrari / Wikipedia dry ~1520 kg (SP2)
      cargoVolumeLiters: cuFtToLiters(3), // EPA lv2 = 3 cu ft
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 799,
      torqueLbFt: 530,
      zeroToSixtySeconds: 2.9,
      topSpeedMph: 186,
    },
    fuelEconomy: { cityMpg: 12, highwayMpg: 15, combinedMpg: 13 },
    baseMsrpCents: 180_000_000, // CarBuzz Icona estimate ~$1.8M
    description:
      "2023 Ferrari Monza SP2 (US EPA). Two-seat Icona barchetta; final Monza SP2 EPA year.",
    pressSource: {
      slug: "ferrari-monza-sp2-official",
      title: "Ferrari Monza SP2 — official",
      url: "https://www.ferrari.com/en-EN/auto/monza-sp2",
      publisher: "Ferrari",
      type: "MANUFACTURER",
    },
    priceSource: {
      slug: "carbuzz-2023-ferrari-monza-sp2",
      title: "2023 Ferrari Monza SP2 Pricing, Photos & Specs (CarBuzz)",
      url: "https://carbuzz.com/cars/ferrari/monza-sp2/2023/",
      publisher: "CarBuzz",
      type: "THIRD_PARTY",
    },
  },
];

const STATIC_SKIPPED = [
  "2018–2020 812 Superfast: US catalogue limited to final EPA year 2021 (id 42761); earlier years omitted by design",
  "2022–2023 812 Superfast: no EPA model rows after MY2021 (user ~2023 approx.; last cert year is 2021)",
  "2021–2022 812 GTS: mid-years omitted; seeded final EPA year 2023 (id 45466) only (user ~2024 approx.)",
  "2022–2023 812 Competizione / Competizione A: mid-years omitted; seeded final EPA year 2024 only",
  "2019–2022 Monza SP1/SP2: mid-years omitted; seeded final EPA year 2023 (ids 45963/45964; user ~2022 approx.)",
];

const DESTINATION_SOURCE = {
  slug: "ferrari-us-destination-fee-812-monza",
  title: "Ferrari of North America destination & handling (catalogue default)",
  url: "https://www.iseecars.com/car/ferrari-296-gtb-price",
  type: "THIRD_PARTY" as const,
  publisher: "iSeeCars / Ferrari NA pattern",
};

export async function seedFerrari812Monza(
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

  const transmissionCache = new Map<string, string>();
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
        where: {
          modelId_code: { modelId: model.id, code: trim.generationCode },
        },
        create: {
          modelId: model.id,
          code: trim.generationCode,
          displayName: trim.generationLabel,
          startYear: trim.generationStartYear,
          endYear: trim.generationEndYear ?? undefined,
        },
        update: {
          displayName: trim.generationLabel,
          startYear: trim.generationStartYear,
          endYear: trim.generationEndYear ?? undefined,
        },
      });

      const modelYear = await prisma.modelYear.upsert({
        where: {
          generationId_year: {
            generationId: generation.id,
            year: trim.year,
          },
        },
        create: { generationId: generation.id, year: trim.year },
        update: {},
      });

      let transmissionId = transmissionCache.get(trim.transmissionSlug);
      if (!transmissionId) {
        const transmission = await prisma.transmission.upsert({
          where: { slug: trim.transmissionSlug },
          create: {
            slug: trim.transmissionSlug,
            name: trim.transmissionName,
            type: trim.transmissionType,
            gearCount: trim.gearCount,
          },
          update: {
            name: trim.transmissionName,
            type: trim.transmissionType,
            gearCount: trim.gearCount,
          },
        });
        transmissionId = transmission.id;
        transmissionCache.set(trim.transmissionSlug, transmissionId);
      }

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
      });

      const pressSource = await upsertCatalogueSource(prisma, {
        slug: trim.pressSource.slug,
        title: trim.pressSource.title,
        publisher: trim.pressSource.publisher,
        url: trim.pressSource.url,
        type: trim.pressSource.type,
      });

      const priceSource = await upsertCatalogueSource(prisma, {
        slug: trim.priceSource.slug,
        title: trim.priceSource.title,
        publisher: trim.priceSource.publisher,
        url: trim.priceSource.url,
        type: trim.priceSource.type,
      });

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-${trim.year}-${trim.slug}`,
        title: `EPA Fuel Economy — ${trim.year} Ferrari ${trim.name}`,
        publisher: "U.S. EPA / fueleconomy.gov",
        url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
        type: "GOVERNMENT",
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
          transmissionId,
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
          transmissionId,
          description: trim.description,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
      });

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
            create: {
              vehicleId: vehicle.id,
              cityMpg: trim.fuelEconomy.cityMpg,
              highwayMpg: trim.fuelEconomy.highwayMpg,
              combinedMpg: trim.fuelEconomy.combinedMpg,
            },
            update: {
              cityMpg: trim.fuelEconomy.cityMpg,
              highwayMpg: trim.fuelEconomy.highwayMpg,
              combinedMpg: trim.fuelEconomy.combinedMpg,
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
          pressSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          `${trim.pressSource.publisher} / Ferrari power, torque, 0–60, top speed`,
        ),
        upsertCitation(
          prisma,
          pressSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          `${trim.pressSource.publisher} exterior dimensions / weight / cargo`,
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
          `Base MSRP from ${trim.priceSource.publisher}`,
        ),
        upsertCitation(
          prisma,
          destinationSource.id,
          "VehiclePrice",
          destination.id,
          "amountCents",
          `Ferrari NA destination default $${(FERRARI_DESTINATION_CENTS / 100).toFixed(0)} (FERRARI_DESTINATION_CENTS)`,
        ),
        upsertCitation(
          prisma,
          imageSource.id,
          "VehicleImage",
          image.id,
          "url",
          `auto-data.net exterior: ${trim.imagePageUrl}`,
        ),
      ]);

      await ensureAudit(prisma, importerId, vehicle.id, trim.slug);
      seeded.push(
        `${trim.slug} | EPA=${trim.epaId} | image=${imageUrl}`,
      );
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      skipped.push(`${trim.slug}: ${reason}`);
    }
  }

  return { seeded, skipped };
}
