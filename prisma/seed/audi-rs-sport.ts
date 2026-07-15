/**
 * Audi RS + sport legacy seed module (US market).
 * RS 3 / RS 5 Sportback / RS 6 Avant / RS 7 / RS Q8 / RS e-tron GT;
 * last US TT (2023) and R8 (2023). Idempotent — safe to re-run.
 * Does not wire itself into prisma/seed.ts.
 */
import type {
  BodyStyle,
  Drivetrain,
  FuelType,
  TransmissionType,
} from "../../src/generated/prisma/client";
import {
  AUDI_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureAudiEngine,
  ensureImageSource,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./audi-shared";

const LBS_TO_KG = 0.45359237;
const CUFT_TO_L = 28.316846592;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

/** Unique encyCARpedia exteriors (`c.encycarpedia.com/ci/{id}.jpg`). */
const IMAGE_RS3 = "https://c.encycarpedia.com/ci/13762.jpg";
const IMAGE_RS5 = "https://c.encycarpedia.com/ci/11858.jpg";
const IMAGE_RS6 = "https://c.encycarpedia.com/ci/13069.jpg";
const IMAGE_RS7 = "https://c.encycarpedia.com/ci/11657.jpg";
const IMAGE_RS_Q8 = "https://c.encycarpedia.com/ci/13688.jpg";
const IMAGE_RS_ETRON_GT = "https://c.encycarpedia.com/ci/13675.jpg";
const IMAGE_TT = "https://c.encycarpedia.com/ci/11256.jpg";
const IMAGE_R8 = "https://c.encycarpedia.com/ci/11189.jpg";

type ModelKey =
  | "audi-rs3"
  | "audi-rs5"
  | "audi-rs6"
  | "audi-rs7"
  | "audi-rs-q8"
  | "audi-rs-e-tron-gt"
  | "audi-tt"
  | "audi-r8";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelKey;
  modelName: string;
  generationCode: string;
  generationLabel: string;
  generationStartYear: number;
  year: number;
  bodyStyle: BodyStyle;
  drivetrain: Drivetrain;
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
  epaId: string;
  engine: {
    slug: string;
    name: string;
    code: string | null;
    fuelType: FuelType;
    displacementCc: number | null;
    cylinderCount: number | null;
    configuration: string;
    induction: string | null;
    electrification: string | null;
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
    frontTrackIn?: number;
    rearTrackIn?: number;
    curbWeightKg: number;
    cargoVolumeLiters: number;
    seatingCapacity: number;
  };
  performance: {
    powerHp: number;
    torqueLbFt: number;
    zeroToSixtySeconds: number;
    quarterMileSeconds?: number;
    topSpeedMph: number;
  };
  fuelEconomy: {
    cityMpg: number;
    highwayMpg: number;
    combinedMpg: number;
    electricRangeMiles?: number;
  };
  /** BASE_MSRP in cents (excludes destination). */
  baseMsrpCents: number;
  pressSource: {
    slug: string;
    title: string;
    url: string;
    type: "MANUFACTURER" | "PRESS_RELEASE" | "THIRD_PARTY";
    publisher: string;
  };
  priceSource: {
    slug: string;
    title: string;
    url: string;
    type: "THIRD_PARTY" | "MANUFACTURER" | "PRESS_RELEASE";
    publisher: string;
  };
};

const TRIMS: TrimSeed[] = [
  {
    slug: "2025-audi-rs3-sedan-us",
    name: "RS 3",
    modelSlug: "audi-rs3",
    modelName: "RS 3",
    generationCode: "8Y",
    generationLabel: "Second generation (8Y)",
    generationStartYear: 2021,
    year: 2025,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    imageUrl: IMAGE_RS3,
    imagePageUrl: "https://www.encycarpedia.com/us/audi/24-rs-3-sedan",
    imageAlt: "2025 Audi RS 3 Sedan exterior",
    epaId: "49136",
    engine: {
      slug: "audi-ea855-rs3-394",
      name: "2.5L TFSI inline-5 turbo",
      code: "DNWA",
      fuelType: "PETROL",
      displacementCc: 2480,
      cylinderCount: 5,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmissionSlug: "audi-s-tronic-7",
    transmissionName: "7-speed S tronic dual-clutch",
    transmissionType: "DUAL_CLUTCH",
    gearCount: 7,
    dimensions: {
      lengthIn: 178.8,
      widthIn: 72.9,
      heightIn: 55.6,
      wheelbaseIn: 103.6,
      frontTrackIn: 62.7,
      rearTrackIn: 60.0,
      curbWeightKg: lbsToKg(3627),
      cargoVolumeLiters: cuFtToLiters(11.3),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 394,
      torqueLbFt: 369,
      zeroToSixtySeconds: 3.2,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 20, highwayMpg: 29, combinedMpg: 23 },
    // C&D base $64,695 includes ~$1,295 destination → exclude destination.
    baseMsrpCents: 6_340_000,
    pressSource: {
      slug: "cd-2025-audi-rs3-specs",
      title: "2025 Audi RS3 2.5 TFSI Features and Specs (Car and Driver)",
      url: "https://www.caranddriver.com/audi/rs3/specs/2025/audi_rs3_audi-rs3_2025",
      type: "THIRD_PARTY",
      publisher: "Car and Driver",
    },
    priceSource: {
      slug: "cd-2025-audi-rs3-review",
      title: "2025 Audi RS3 Review, Pricing, and Specs (Car and Driver)",
      url: "https://www.caranddriver.com/audi/rs3-2025",
      type: "THIRD_PARTY",
      publisher: "Car and Driver",
    },
  },
  {
    slug: "2025-audi-rs5-sportback-us",
    name: "RS 5 Sportback",
    modelSlug: "audi-rs5",
    modelName: "RS 5",
    generationCode: "F5",
    generationLabel: "Second generation (F5 / B9)",
    generationStartYear: 2017,
    year: 2025,
    bodyStyle: "HATCHBACK",
    drivetrain: "AWD",
    imageUrl: IMAGE_RS5,
    imagePageUrl: "https://www.encycarpedia.com/us/audi/20-rs5-sportback-coupe",
    imageAlt: "2025 Audi RS 5 Sportback exterior",
    epaId: "48006",
    engine: {
      slug: "audi-ea839-rs5-444",
      name: "2.9L TFSI V6 twin-turbo",
      code: "DECA",
      fuelType: "PETROL",
      displacementCc: 2894,
      cylinderCount: 6,
      configuration: "V",
      induction: "Twin-turbo",
      electrification: null,
    },
    transmissionSlug: "audi-tiptronic-8",
    transmissionName: "8-speed Tiptronic automatic",
    transmissionType: "AUTOMATIC",
    gearCount: 8,
    dimensions: {
      lengthIn: 188.3,
      widthIn: 73.5,
      heightIn: 55.1,
      wheelbaseIn: 111.3,
      frontTrackIn: 62.9,
      rearTrackIn: 62.5,
      curbWeightKg: lbsToKg(4079),
      cargoVolumeLiters: cuFtToLiters(21.8),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 444,
      torqueLbFt: 442,
      zeroToSixtySeconds: 3.3,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 18, highwayMpg: 25, combinedMpg: 20 },
    baseMsrpCents: 7_990_000,
    pressSource: {
      slug: "cd-2025-audi-rs5-sportback-specs",
      title: "2025 Audi RS5 Sportback 2.9 TFSI Features and Specs (Car and Driver)",
      url: "https://www.caranddriver.com/audi/rs5-sportback/specs",
      type: "THIRD_PARTY",
      publisher: "Car and Driver",
    },
    priceSource: {
      slug: "cd-2025-audi-rs5-sportback-review",
      title: "2025 Audi RS5 Sportback Review, Pricing, and Specs (Car and Driver)",
      url: "https://www.caranddriver.com/audi/rs5-sportback",
      type: "THIRD_PARTY",
      publisher: "Car and Driver",
    },
  },
  {
    slug: "2025-audi-rs6-avant-performance-us",
    name: "RS 6 Avant Performance",
    modelSlug: "audi-rs6",
    modelName: "RS 6",
    generationCode: "C8",
    generationLabel: "Fourth generation (C8)",
    generationStartYear: 2019,
    year: 2025,
    bodyStyle: "WAGON",
    drivetrain: "AWD",
    imageUrl: IMAGE_RS6,
    imagePageUrl: "https://www.encycarpedia.com/us/audi/23-rs-6-avant-performance-wagon",
    imageAlt: "2025 Audi RS 6 Avant Performance exterior",
    epaId: "48051",
    engine: {
      slug: "audi-ea825-rs6-621",
      name: "4.0L TFSI V8 twin-turbo mild hybrid",
      code: "DWWA",
      fuelType: "PETROL",
      displacementCc: 3996,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbo",
      electrification: "48V mild hybrid",
    },
    transmissionSlug: "audi-tiptronic-8",
    transmissionName: "8-speed Tiptronic automatic",
    transmissionType: "AUTOMATIC",
    gearCount: 8,
    dimensions: {
      lengthIn: 196.7,
      widthIn: 76.8,
      heightIn: 58.6,
      wheelbaseIn: 115.3,
      frontTrackIn: 65.7,
      rearTrackIn: 65.0,
      curbWeightKg: lbsToKg(4982),
      cargoVolumeLiters: cuFtToLiters(30.0),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 621,
      torqueLbFt: 627,
      zeroToSixtySeconds: 3.3,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 14, highwayMpg: 21, combinedMpg: 17 },
    baseMsrpCents: 12_660_000,
    pressSource: {
      slug: "cd-2025-audi-rs6-avant-review",
      title: "2025 Audi RS6 Avant Review, Pricing, and Specs (Car and Driver)",
      url: "https://www.caranddriver.com/audi/rs6-avant-2025",
      type: "THIRD_PARTY",
      publisher: "Car and Driver",
    },
    priceSource: {
      slug: "edmunds-2025-audi-rs6-performance-specs",
      title: "2025 Audi RS 6 performance Specs & Features (Edmunds)",
      url: "https://www.edmunds.com/audi/rs-6/2025/st-402059644/features-specs/",
      type: "THIRD_PARTY",
      publisher: "Edmunds",
    },
  },
  {
    slug: "2025-audi-rs7-performance-us",
    name: "RS 7 Performance",
    modelSlug: "audi-rs7",
    modelName: "RS 7",
    generationCode: "C8",
    generationLabel: "Second generation (C8)",
    generationStartYear: 2019,
    year: 2025,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl: IMAGE_RS7,
    imagePageUrl: "https://www.encycarpedia.com/us/audi/19-rs7-sportback-coupe",
    imageAlt: "2025 Audi RS 7 Performance Sportback exterior",
    epaId: "48007",
    engine: {
      slug: "audi-ea825-rs7-621",
      name: "4.0L TFSI V8 twin-turbo mild hybrid",
      code: "DWWA",
      fuelType: "PETROL",
      displacementCc: 3996,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbo",
      electrification: "48V mild hybrid",
    },
    transmissionSlug: "audi-tiptronic-8",
    transmissionName: "8-speed Tiptronic automatic",
    transmissionType: "AUTOMATIC",
    gearCount: 8,
    dimensions: {
      lengthIn: 197.2,
      widthIn: 76.8,
      heightIn: 55.9,
      wheelbaseIn: 115.3,
      frontTrackIn: 65.7,
      rearTrackIn: 65.0,
      curbWeightKg: lbsToKg(4830),
      cargoVolumeLiters: cuFtToLiters(24.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 621,
      torqueLbFt: 627,
      zeroToSixtySeconds: 2.9,
      quarterMileSeconds: 11.1,
      topSpeedMph: 190,
    },
    fuelEconomy: { cityMpg: 14, highwayMpg: 21, combinedMpg: 17 },
    baseMsrpCents: 12_990_000,
    pressSource: {
      slug: "cd-2025-audi-rs7-review",
      title: "2025 Audi RS7 Review, Pricing, and Specs (Car and Driver)",
      url: "https://www.caranddriver.com/audi/rs7-2025",
      type: "THIRD_PARTY",
      publisher: "Car and Driver",
    },
    priceSource: {
      slug: "cd-2025-audi-rs7-review-price",
      title: "2025 Audi RS7 Review, Pricing, and Specs (Car and Driver)",
      url: "https://www.caranddriver.com/audi/rs7-2025",
      type: "THIRD_PARTY",
      publisher: "Car and Driver",
    },
  },
  {
    slug: "2025-audi-rs-q8-performance-us",
    name: "RS Q8 Performance",
    modelSlug: "audi-rs-q8",
    modelName: "RS Q8",
    generationCode: "4M",
    generationLabel: "First generation (4M)",
    generationStartYear: 2020,
    year: 2025,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: IMAGE_RS_Q8,
    imagePageUrl: "https://www.encycarpedia.com/us/audi/24-rs-q8-performance-suv",
    imageAlt: "2025 Audi RS Q8 Performance exterior",
    epaId: "48115",
    engine: {
      slug: "audi-ea825-rs-q8-631",
      name: "4.0L TFSI V8 twin-turbo mild hybrid",
      code: "DCUE",
      fuelType: "PETROL",
      displacementCc: 3996,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbo",
      electrification: "48V mild hybrid",
    },
    transmissionSlug: "audi-tiptronic-8",
    transmissionName: "8-speed Tiptronic automatic",
    transmissionType: "AUTOMATIC",
    gearCount: 8,
    dimensions: {
      lengthIn: 197.7,
      widthIn: 79.0,
      heightIn: 67.5,
      wheelbaseIn: 117.9,
      frontTrackIn: 66.6,
      rearTrackIn: 66.7,
      curbWeightKg: lbsToKg(5394),
      cargoVolumeLiters: cuFtToLiters(30.5),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 631,
      torqueLbFt: 627,
      zeroToSixtySeconds: 3.1,
      quarterMileSeconds: 11.5,
      topSpeedMph: 190,
    },
    fuelEconomy: { cityMpg: 14, highwayMpg: 20, combinedMpg: 16 },
    // Audi USA starting MSRP $136,200 excludes destination.
    baseMsrpCents: 13_620_000,
    pressSource: {
      slug: "cd-2025-audi-rs-q8-review",
      title: "2025 Audi RS Q8 Review, Pricing, and Specs (Car and Driver)",
      url: "https://www.caranddriver.com/audi/rs-q8-2025",
      type: "THIRD_PARTY",
      publisher: "Car and Driver",
    },
    priceSource: {
      slug: "audiusa-2025-rs-q8-msrp",
      title: "2025 Audi RS Q8 Performance MSRP disclaimer (Audi USA)",
      url: "https://www.audiusa.com/en/models/q8/rsq8/2025/overview/layer/clickable-disclaimer-msrp/",
      type: "MANUFACTURER",
      publisher: "Audi USA",
    },
  },
  {
    slug: "2025-audi-rs-e-tron-gt-performance-us",
    name: "RS e-tron GT Performance",
    modelSlug: "audi-rs-e-tron-gt",
    modelName: "RS e-tron GT",
    generationCode: "FW",
    generationLabel: "First generation (FW)",
    generationStartYear: 2021,
    year: 2025,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    imageUrl: IMAGE_RS_ETRON_GT,
    imagePageUrl: "https://www.encycarpedia.com/us/audi/24-rs-e-tron-gt-performance-sedan",
    imageAlt: "2025 Audi RS e-tron GT Performance exterior",
    epaId: "48993",
    engine: {
      slug: "audi-rs-e-tron-gt-perf-dual-motor",
      name: "Dual permanent-magnet synchronous motors",
      code: null,
      fuelType: "ELECTRIC",
      displacementCc: null,
      cylinderCount: null,
      configuration: "Dual electric motors",
      induction: null,
      electrification: "Battery electric (launch-control boost)",
    },
    transmissionSlug: "audi-single-speed-ev",
    transmissionName: "Single-speed automatic",
    transmissionType: "SINGLE_SPEED",
    gearCount: 1,
    dimensions: {
      lengthIn: 196.7,
      widthIn: 77.3,
      heightIn: 54.9,
      wheelbaseIn: 114.2,
      // Track widths not listed on C&D / Edmunds US spec sheets used here.
      curbWeightKg: lbsToKg(5169),
      cargoVolumeLiters: cuFtToLiters(9.0),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 912,
      torqueLbFt: 757,
      zeroToSixtySeconds: 2.1,
      quarterMileSeconds: 9.8,
      topSpeedMph: 155,
    },
    fuelEconomy: {
      cityMpg: 85,
      highwayMpg: 82,
      combinedMpg: 84,
      electricRangeMiles: 278,
    },
    baseMsrpCents: 16_700_000,
    pressSource: {
      slug: "cd-2025-audi-rs-e-tron-gt-performance-test",
      title: "2025 Audi RS e-tron GT Performance Test (Car and Driver)",
      url: "https://www.caranddriver.com/reviews/a64342917/2025-audi-rs-e-tron-gt-performance-drive/",
      type: "THIRD_PARTY",
      publisher: "Car and Driver",
    },
    priceSource: {
      slug: "edmunds-2025-audi-rs-e-tron-gt-performance-specs",
      title: "2025 Audi RS e-tron GT performance Specs & Features (Edmunds)",
      url: "https://www.edmunds.com/audi/rs-e-tron-gt/2025/st-402063397/features-specs/",
      type: "THIRD_PARTY",
      publisher: "Edmunds",
    },
  },
  {
    slug: "2023-audi-tt-coupe-45-tfsi-us",
    name: "TT Coupe 45 TFSI",
    modelSlug: "audi-tt",
    modelName: "TT",
    generationCode: "8S",
    generationLabel: "Third generation (8S / FV)",
    generationStartYear: 2014,
    year: 2023,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl: IMAGE_TT,
    imagePageUrl: "https://www.encycarpedia.com/us/audi/19-tt-coupe-45-tfsi-quattro",
    imageAlt: "2023 Audi TT Coupe exterior",
    epaId: "45473",
    engine: {
      slug: "audi-ea888-tt-228",
      name: "2.0L TFSI inline-4 turbo",
      code: "DNUA",
      fuelType: "PETROL",
      displacementCc: 1984,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmissionSlug: "audi-s-tronic-7",
    transmissionName: "7-speed S tronic dual-clutch",
    transmissionType: "DUAL_CLUTCH",
    gearCount: 7,
    dimensions: {
      lengthIn: 165.0,
      widthIn: 72.1,
      heightIn: 53.3,
      wheelbaseIn: 98.6,
      frontTrackIn: 61.9,
      rearTrackIn: 61.1,
      curbWeightKg: lbsToKg(3197),
      cargoVolumeLiters: cuFtToLiters(10.8),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 228,
      torqueLbFt: 258,
      zeroToSixtySeconds: 5.2,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 23, highwayMpg: 30, combinedMpg: 25 },
    baseMsrpCents: 5_200_000,
    pressSource: {
      slug: "cd-2023-audi-tt-specs",
      title: "2023 Audi TT Coupe 45 TFSI Features and Specs (Car and Driver)",
      url: "https://www.caranddriver.com/audi/tt/specs",
      type: "THIRD_PARTY",
      publisher: "Car and Driver",
    },
    priceSource: {
      slug: "usnews-2023-audi-tt-performance",
      title: "2023 Audi TT Performance (U.S. News)",
      url: "https://cars.usnews.com/cars-trucks/audi/tt/performance",
      type: "THIRD_PARTY",
      publisher: "U.S. News & World Report",
    },
  },
  {
    slug: "2023-audi-r8-coupe-v10-performance-quattro-us",
    name: "R8 Coupe V10 performance quattro",
    modelSlug: "audi-r8",
    modelName: "R8",
    generationCode: "4S",
    generationLabel: "Second generation (4S)",
    generationStartYear: 2015,
    year: 2023,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl: IMAGE_R8,
    imagePageUrl: "https://www.encycarpedia.com/us/audi/19-r8-coupe-v10-performance-quattro",
    imageAlt: "2023 Audi R8 Coupe V10 performance quattro exterior",
    epaId: "45643",
    engine: {
      slug: "audi-5-2-fsi-r8-602",
      name: "5.2L FSI V10",
      code: "CSPA",
      fuelType: "PETROL",
      displacementCc: 5204,
      cylinderCount: 10,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmissionSlug: "audi-s-tronic-7",
    transmissionName: "7-speed S tronic dual-clutch",
    transmissionType: "DUAL_CLUTCH",
    gearCount: 7,
    dimensions: {
      lengthIn: 174.4,
      widthIn: 76.4,
      heightIn: 48.7,
      wheelbaseIn: 104.3,
      frontTrackIn: 64.8,
      rearTrackIn: 63.0,
      curbWeightKg: lbsToKg(3638),
      cargoVolumeLiters: cuFtToLiters(4.0),
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 602,
      torqueLbFt: 413,
      zeroToSixtySeconds: 3.1,
      topSpeedMph: 205,
    },
    fuelEconomy: { cityMpg: 13, highwayMpg: 18, combinedMpg: 15 },
    baseMsrpCents: 21_200_000,
    pressSource: {
      slug: "cd-2023-audi-r8-specs",
      title: "2023 Audi R8 V10 performance quattro Features and Specs (Car and Driver)",
      url: "https://www.caranddriver.com/audi/r8/specs",
      type: "THIRD_PARTY",
      publisher: "Car and Driver",
    },
    priceSource: {
      slug: "audi-mediacenter-r8-engine",
      title: "Audi R8 engine — performance figures (Audi MediaCenter)",
      url: "https://www.audi-mediacenter.com/en/the-audi-r8-until-2024-updated-dynamics-for-the-high-performance-sports-car-11734/engine-11738",
      type: "MANUFACTURER",
      publisher: "Audi MediaCenter",
    },
  },
];

const STATIC_SKIPPED = [
  "RS 4 Avant: not offered in US (no EPA listing 2015–present)",
  "RS Q3: not offered in US (no EPA listing)",
  "TT RS Coupe: last US EPA year 2022; skipped in favor of final MY 2023 TT Coupe",
  "R8 Spyder / R8 RWD / R8 GT: incomplete unique exterior + full US catalogue package in this module; Coupe V10 performance quattro seeded",
  "RS 5 Coupe: US MY 2025 EPA lists RS 5 Sportback only",
];

const DESTINATION_SOURCE = {
  slug: "audiusa-destination-handling-2025",
  title: "Audi USA destination and handling — $1,295 (MSRP disclaimers)",
  url: "https://www.audiusa.com/en/models/q8/rsq8/2025/overview/layer/clickable-disclaimer-msrp/",
  type: "MANUFACTURER" as const,
  publisher: "Audi USA",
};

const MODEL_DEFS: Array<{
  slug: ModelKey;
  name: string;
}> = [
  { slug: "audi-rs3", name: "RS 3" },
  { slug: "audi-rs5", name: "RS 5" },
  { slug: "audi-rs6", name: "RS 6" },
  { slug: "audi-rs7", name: "RS 7" },
  { slug: "audi-rs-q8", name: "RS Q8" },
  { slug: "audi-rs-e-tron-gt", name: "RS e-tron GT" },
  { slug: "audi-tt", name: "TT" },
  { slug: "audi-r8", name: "R8" },
];

export async function seedAudiRsSport(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  const modelIds = new Map<ModelKey, string>();
  for (const def of MODEL_DEFS) {
    const model = await prisma.vehicleModel.upsert({
      where: { slug: def.slug },
      create: {
        manufacturerId,
        name: def.name,
        slug: def.slug,
      },
      update: { manufacturerId, name: def.name },
    });
    modelIds.set(def.slug, model.id);
  }

  const destinationSource = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE.slug,
    title: DESTINATION_SOURCE.title,
    publisher: DESTINATION_SOURCE.publisher,
    url: DESTINATION_SOURCE.url,
    type: DESTINATION_SOURCE.type,
  });

  const claimedImages = new Set<string>();
  const generationCache = new Map<string, string>();
  const modelYearCache = new Map<string, string>();

  for (const trim of TRIMS) {
    try {
      if (claimedImages.has(trim.imageUrl)) {
        throw new Error(`Duplicate image URL within module: ${trim.imageUrl}`);
      }
      claimedImages.add(trim.imageUrl);

      const imageUrl = await assertImageUrlOk(trim.imageUrl);
      const imageSource = await ensureImageSource(prisma, {
        slug: `encycarpedia-image-${trim.slug}`,
        title: `${trim.name} exterior (encyCARpedia)`,
        pageUrl: trim.imagePageUrl,
        publisher: "encyCARpedia",
      });

      const modelId = modelIds.get(trim.modelSlug);
      if (!modelId) throw new Error(`Missing model id for ${trim.modelSlug}`);

      const genKey = `${trim.modelSlug}:${trim.generationCode}`;
      let generationId = generationCache.get(genKey);
      if (!generationId) {
        const generation = await prisma.vehicleGeneration.upsert({
          where: {
            modelId_code: { modelId, code: trim.generationCode },
          },
          create: {
            modelId,
            code: trim.generationCode,
            displayName: trim.generationLabel,
            startYear: trim.generationStartYear,
          },
          update: {
            displayName: trim.generationLabel,
            startYear: trim.generationStartYear,
          },
        });
        generationId = generation.id;
        generationCache.set(genKey, generationId);
      }

      const myKey = `${generationId}:${trim.year}`;
      let modelYearId = modelYearCache.get(myKey);
      if (!modelYearId) {
        const modelYear = await prisma.modelYear.upsert({
          where: {
            generationId_year: { generationId, year: trim.year },
          },
          create: { generationId, year: trim.year },
          update: {},
        });
        modelYearId = modelYear.id;
        modelYearCache.set(myKey, modelYearId);
      }

      const engine = await ensureAudiEngine(prisma, {
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

      const specSource = await upsertCatalogueSource(prisma, {
        slug: trim.pressSource.slug,
        title: trim.pressSource.title,
        publisher: trim.pressSource.publisher,
        url: trim.pressSource.url,
        type: trim.pressSource.type,
      });

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-${trim.year}-${trim.slug}`,
        title: `EPA Fuel Economy — ${trim.year} Audi ${trim.name}`,
        publisher: "U.S. EPA",
        url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
        type: "GOVERNMENT",
      });

      const priceSource = await upsertCatalogueSource(prisma, {
        slug: trim.priceSource.slug,
        title: trim.priceSource.title,
        publisher: trim.priceSource.publisher,
        url: trim.priceSource.url,
        type: trim.priceSource.type,
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
          description: `${trim.year} Audi ${trim.name} (US).`,
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
          description: `${trim.year} Audi ${trim.name} (US).`,
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
              amountCents: AUDI_DESTINATION_CENTS,
              currency: "USD",
              effectiveAt: pricingDate,
            },
            update: {
              amountCents: AUDI_DESTINATION_CENTS,
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
              credit: "encyCARpedia",
              position: 0,
            },
            update: {
              sourceId: imageSource.id,
              url: imageUrl,
              alt: trim.imageAlt,
              credit: "encyCARpedia",
            },
          }),
        ]);

      const fuelCitations = [
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
          trim.engine.fuelType === "ELECTRIC"
            ? `EPA vehicle id ${trim.epaId} (combined MPGe)`
            : `EPA vehicle id ${trim.epaId}`,
        ),
      ];
      if (trim.fuelEconomy.electricRangeMiles != null) {
        fuelCitations.push(
          upsertCitation(
            prisma,
            fuelSource.id,
            "VehicleFuelEconomy",
            fuelEconomy.id,
            "electricRangeMiles",
            `EPA vehicle id ${trim.epaId}`,
          ),
        );
      }

      await Promise.all([
        upsertCitation(
          prisma,
          specSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "Power, torque, 0–60 mph, and top speed",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Exterior dimensions, tracks, curb weight, cargo",
        ),
        ...fuelCitations,
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
          `Destination and handling $${(AUDI_DESTINATION_CENTS / 100).toFixed(0)}`,
        ),
        upsertCitation(
          prisma,
          imageSource.id,
          "VehicleImage",
          image.id,
          "url",
          "encyCARpedia exterior asset",
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
