/**
 * Audi Q-line ICE SUV seed module (US market).
 * Models: Q3, Q5, Q7, Q8 (current gens). Skips Q2 (not US) and all e-tron variants.
 * Prefer MY 2025 US trims with EPA + manufacturer/third-party citations.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Exterior images (unique; auto-data.net fallback — encyCARpedia CDN blocked):
 * - https://www.auto-data.net/images/f20/Audi-Q3-II.jpg
 * - https://www.auto-data.net/images/f49/Audi-Q3-F3.jpg
 * - https://www.auto-data.net/images/f63/Audi-Q5-III.jpg
 * - https://www.auto-data.net/images/f107/Audi-Q5-III-GU.jpg
 * - https://www.auto-data.net/images/f83/Audi-Q7-Typ-4M-facelift-2024.jpg
 * - https://www.auto-data.net/images/f10/Audi-Q7-Typ-4M-facelift-2019.jpg
 * - https://www.auto-data.net/images/f71/Audi-Q8-facelift-2023.jpg
 * - https://www.auto-data.net/images/f71/Audi-Q8-facelift-2023_2.jpg
 */
import {
  AUDI_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureAudiEngine,
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

type ModelSlug = "audi-q3" | "audi-q5" | "audi-q7" | "audi-q8";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: "Q3" | "Q5" | "Q7" | "Q8";
  year: 2025;
  generationCode: string;
  generationLabel: string;
  generationStartYear: number;
  bodyStyle: "SUV";
  drivetrain: "AWD";
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
    configuration: "Inline" | "V";
    induction: string;
    electrification: string | null;
  };
  transmission: {
    slug: string;
    name: string;
    type: "AUTOMATIC" | "DUAL_CLUTCH";
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
  };
  fuelEconomy: {
    cityMpg: number;
    highwayMpg: number;
    combinedMpg: number;
  };
  /** BASE_MSRP in cents (excludes destination). */
  baseMsrpCents: number;
  specSourceSlug: string;
  priceSourceSlug: string;
};

const SPEC_SOURCES = [
  {
    slug: "caranddriver-2025-audi-q3",
    title: "2025 Audi Q3 Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/audi/q3-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "iseecars-2025-audi-q3-dimensions",
    title: "2025 Audi Q3 Dimensions (iSeeCars)",
    url: "https://www.iseecars.com/car/2025-audi-q3-dimensions",
    publisher: "iSeeCars",
  },
  {
    slug: "caranddriver-2025-audi-q5",
    title: "2025 Audi Q5 / Q5 Sportback Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/audi/q5-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "caranddriver-2026-audi-q5-specs",
    title: "2026 Audi Q5 Premium 2.0 TFSI quattro Features and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/audi/q5/specs",
    publisher: "Car and Driver",
  },
  {
    slug: "caranddriver-2025-audi-q7",
    title: "2025 Audi Q7 Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/audi/q7-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "caranddriver-2026-audi-q7-specs",
    title: "2026 Audi Q7 Premium 55 quattro Features and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/audi/q7/specs",
    publisher: "Car and Driver",
  },
  {
    slug: "caranddriver-2025-audi-q8",
    title: "2025 Audi Q8 Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/audi/q8-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "caranddriver-2026-audi-q8-specs",
    title: "2026 Audi Q8 Prestige Features and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/audi/q8/specs",
    publisher: "Car and Driver",
  },
  {
    slug: "kbb-2025-audi-q7-45-premium",
    title: "2025 Audi Q7 45 TFSI Premium (Kelley Blue Book)",
    url: "https://www.kbb.com/audi/q7/2025/45-tfsi-premium/",
    publisher: "Kelley Blue Book",
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "edmunds-2025-audi-q3-trims",
    title: "2025 Audi Q3 Trims Comparison (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/audi/q3/2025/trims/",
    publisher: "Edmunds",
  },
  {
    slug: "audiworld-2025-audi-q5-buyers-guide",
    title: "2025 Audi Q5 & Q5 Sportback Buyer's Guide (Audiworld) — MSRP excl. $1,295 destination",
    url: "https://www.audiworld.com/how-tos/slideshows/2025-audi-q5-q5-sportback-buyer-s-guide-every-model-package-explained-990681",
    publisher: "Audiworld",
  },
  {
    slug: "edmunds-2025-audi-q7-premium",
    title: "2025 Audi Q7 Premium Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/audi/q7/2025/st-402029130/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-audi-q7-premium-plus",
    title: "2025 Audi Q7 Premium Plus Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/audi/q7/2025/st-402031072/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-audi-q8-premium",
    title: "2025 Audi Q8 Premium Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/audi/q8/2025/st-402039840/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2025-audi-q8-pricing",
    title: "2025 Audi Q8 Pricing (Car and Driver)",
    url: "https://www.caranddriver.com/audi/q8-2025",
    publisher: "Car and Driver",
  },
] as const;

const DESTINATION_SOURCE = {
  slug: "audi-us-2025-destination-1295",
  title: "Audi USA destination charge $1,295 (dealer/manufacturer MSRP footnotes)",
  url: "https://www.audibedford.com/2025-audi-q7-review-specs-features-bedford-oh.htm",
  type: "THIRD_PARTY" as const,
  publisher: "Audi Bedford (Audi USA pricing footnote)",
};

/**
 * MY 2025 US ICE Q-line trims with full sourced specs.
 * Quattro = AWD. Cargo = seats-up volume.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2025-audi-q3-premium-us",
    name: "Q3 45 TFSI Premium",
    modelSlug: "audi-q3",
    modelName: "Q3",
    year: 2025,
    generationCode: "F3",
    generationLabel: "Second generation (F3)",
    generationStartYear: 2019,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f20/Audi-Q3-II.jpg",
    imagePageUrl: "https://www.auto-data.net/en/audi-q3-ii-f3-generation-6419",
    imageAlt: "2025 Audi Q3 45 TFSI Premium exterior",
    epaId: "48260",
    engine: {
      slug: "audi-ea888-q3-45",
      name: "2.0L Inline-4 turbo TFSI",
      code: "EA888-Q3-45",
      displacementCc: 1984,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "audi-tiptronic-8",
      name: "8-speed Tiptronic automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // Car and Driver 2025 Q3; tracks iSeeCars 45 TFSI
      lengthIn: 176.6,
      widthIn: 72.8,
      heightIn: 64.1,
      wheelbaseIn: 105.5,
      frontTrackIn: 62.2,
      rearTrackIn: 61.9,
      curbWeightKg: lbsToKg(3915),
      cargoVolumeLiters: cuFtToLiters(23.7),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 228,
      torqueLbFt: 251,
      // Manufacturer estimate (KBB / Audi)
      zeroToSixtySeconds: 7.1,
    },
    // EPA id 48260
    fuelEconomy: { cityMpg: 22, highwayMpg: 29, combinedMpg: 25 },
    // Edmunds Premium $39,800 excl. destination
    baseMsrpCents: 3980000,
    specSourceSlug: "caranddriver-2025-audi-q3",
    priceSourceSlug: "edmunds-2025-audi-q3-trims",
  },
  {
    slug: "2025-audi-q3-premium-plus-us",
    name: "Q3 45 TFSI Premium Plus",
    modelSlug: "audi-q3",
    modelName: "Q3",
    year: 2025,
    generationCode: "F3",
    generationLabel: "Second generation (F3)",
    generationStartYear: 2019,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f49/Audi-Q3-F3.jpg",
    imagePageUrl: "https://www.auto-data.net/en/audi-q3-ii-f3-generation-6419",
    imageAlt: "2025 Audi Q3 45 TFSI Premium Plus exterior",
    epaId: "48260",
    engine: {
      slug: "audi-ea888-q3-45",
      name: "2.0L Inline-4 turbo TFSI",
      code: "EA888-Q3-45",
      displacementCc: 1984,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "audi-tiptronic-8",
      name: "8-speed Tiptronic automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: 176.6,
      widthIn: 72.8,
      heightIn: 64.1,
      wheelbaseIn: 105.5,
      frontTrackIn: 62.2,
      rearTrackIn: 61.9,
      curbWeightKg: lbsToKg(3902),
      cargoVolumeLiters: cuFtToLiters(23.7),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 228,
      torqueLbFt: 251,
      zeroToSixtySeconds: 7.1,
    },
    fuelEconomy: { cityMpg: 22, highwayMpg: 29, combinedMpg: 25 },
    // Edmunds Premium Plus $42,600 excl. destination
    baseMsrpCents: 4260000,
    specSourceSlug: "caranddriver-2025-audi-q3",
    priceSourceSlug: "edmunds-2025-audi-q3-trims",
  },
  {
    slug: "2025-audi-q5-premium-us",
    name: "Q5 Premium",
    modelSlug: "audi-q5",
    modelName: "Q5",
    year: 2025,
    generationCode: "GU",
    generationLabel: "Third generation (GU)",
    generationStartYear: 2025,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f63/Audi-Q5-III.jpg",
    imagePageUrl: "https://www.auto-data.net/en/audi-q5-iii-gu-generation-10153",
    imageAlt: "2025 Audi Q5 Premium exterior",
    epaId: "49051",
    engine: {
      slug: "audi-ea888-q5-268",
      name: "2.0L Inline-4 turbo TFSI",
      code: "EA888-Q5-268",
      displacementCc: 1984,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "audi-s-tronic-7",
      name: "7-speed S tronic dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // C&D / C&D specs sheet (tracks, cargo, curb)
      lengthIn: 185.7,
      widthIn: 74.8,
      heightIn: 65.7,
      wheelbaseIn: 110.9,
      frontTrackIn: 63.6,
      rearTrackIn: 63.3,
      curbWeightKg: lbsToKg(4244),
      cargoVolumeLiters: cuFtToLiters(27.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 268,
      torqueLbFt: 295,
      // C&D instrumented / auto-data 0–60
      zeroToSixtySeconds: 5.8,
    },
    // EPA id 49051 (new-gen TFSI quattro)
    fuelEconomy: { cityMpg: 22, highwayMpg: 30, combinedMpg: 25 },
    // Audiworld / dealer: Premium $52,200 excl. $1,295 destination
    baseMsrpCents: 5220000,
    specSourceSlug: "caranddriver-2025-audi-q5",
    priceSourceSlug: "audiworld-2025-audi-q5-buyers-guide",
  },
  {
    slug: "2025-audi-q5-premium-plus-us",
    name: "Q5 Premium Plus",
    modelSlug: "audi-q5",
    modelName: "Q5",
    year: 2025,
    generationCode: "GU",
    generationLabel: "Third generation (GU)",
    generationStartYear: 2025,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f107/Audi-Q5-III-GU.jpg",
    imagePageUrl: "https://www.auto-data.net/en/audi-q5-iii-gu-generation-10153",
    imageAlt: "2025 Audi Q5 Premium Plus exterior",
    epaId: "49051",
    engine: {
      slug: "audi-ea888-q5-268",
      name: "2.0L Inline-4 turbo TFSI",
      code: "EA888-Q5-268",
      displacementCc: 1984,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "audi-s-tronic-7",
      name: "7-speed S tronic dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      lengthIn: 185.7,
      widthIn: 74.8,
      heightIn: 65.7,
      wheelbaseIn: 110.9,
      frontTrackIn: 63.6,
      rearTrackIn: 63.3,
      curbWeightKg: lbsToKg(4244),
      cargoVolumeLiters: cuFtToLiters(27.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 268,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.8,
    },
    fuelEconomy: { cityMpg: 22, highwayMpg: 30, combinedMpg: 25 },
    // Audiworld: Premium Plus $56,700 excl. destination
    baseMsrpCents: 5670000,
    specSourceSlug: "caranddriver-2026-audi-q5-specs",
    priceSourceSlug: "audiworld-2025-audi-q5-buyers-guide",
  },
  {
    slug: "2025-audi-q7-45-premium-us",
    name: "Q7 45 TFSI Premium",
    modelSlug: "audi-q7",
    modelName: "Q7",
    year: 2025,
    generationCode: "4M",
    generationLabel: "Second generation (4M)",
    generationStartYear: 2015,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f83/Audi-Q7-Typ-4M-facelift-2024.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/audi-q7-ii-typ-4m-facelift-2024-generation-9859",
    imageAlt: "2025 Audi Q7 45 TFSI Premium exterior",
    epaId: "47804",
    engine: {
      slug: "audi-ea888-q7-45",
      name: "2.0L Inline-4 turbo TFSI mild hybrid",
      code: "EA888-Q7-45",
      displacementCc: 1984,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: "12V mild hybrid",
    },
    transmission: {
      slug: "audi-tiptronic-8",
      name: "8-speed Tiptronic automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // C&D Q7 specs / review family dimensions
      lengthIn: 199.3,
      widthIn: 77.6,
      heightIn: 68.5,
      wheelbaseIn: 117.9,
      frontTrackIn: 66.1,
      rearTrackIn: 66.6,
      curbWeightKg: lbsToKg(4949),
      cargoVolumeLiters: cuFtToLiters(14.2),
      seatingCapacity: 7,
    },
    performance: {
      powerHp: 261,
      torqueLbFt: 273,
      // Manufacturer / KBB
      zeroToSixtySeconds: 6.7,
    },
    // EPA id 47804
    fuelEconomy: { cityMpg: 20, highwayMpg: 26, combinedMpg: 22 },
    // Edmunds / Audi Bedford: $60,500 excl. destination
    baseMsrpCents: 6050000,
    specSourceSlug: "kbb-2025-audi-q7-45-premium",
    priceSourceSlug: "edmunds-2025-audi-q7-premium",
  },
  {
    slug: "2025-audi-q7-55-premium-plus-us",
    name: "Q7 55 TFSI Premium Plus",
    modelSlug: "audi-q7",
    modelName: "Q7",
    year: 2025,
    generationCode: "4M",
    generationLabel: "Second generation (4M)",
    generationStartYear: 2015,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f10/Audi-Q7-Typ-4M-facelift-2019.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/audi-q7-ii-typ-4m-facelift-2019-generation-7195",
    imageAlt: "2025 Audi Q7 55 TFSI Premium Plus exterior",
    epaId: "47805",
    engine: {
      slug: "audi-ea839-q7-55",
      name: "3.0L V6 turbo TFSI mild hybrid",
      code: "EA839-Q7-55",
      displacementCc: 2995,
      cylinderCount: 6,
      configuration: "V",
      induction: "Turbocharger",
      electrification: "48V mild hybrid",
    },
    transmission: {
      slug: "audi-tiptronic-8",
      name: "8-speed Tiptronic automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: 199.3,
      widthIn: 77.6,
      heightIn: 68.5,
      wheelbaseIn: 117.9,
      frontTrackIn: 66.1,
      rearTrackIn: 66.6,
      curbWeightKg: lbsToKg(5004),
      cargoVolumeLiters: cuFtToLiters(14.2),
      seatingCapacity: 7,
    },
    performance: {
      powerHp: 335,
      torqueLbFt: 369,
      // Manufacturer estimate (KBB / C&D)
      zeroToSixtySeconds: 5.5,
    },
    // EPA id 47805
    fuelEconomy: { cityMpg: 18, highwayMpg: 23, combinedMpg: 20 },
    // Edmunds Premium Plus $64,300 excl. destination
    baseMsrpCents: 6430000,
    specSourceSlug: "caranddriver-2026-audi-q7-specs",
    priceSourceSlug: "edmunds-2025-audi-q7-premium-plus",
  },
  {
    slug: "2025-audi-q8-premium-us",
    name: "Q8 55 TFSI Premium",
    modelSlug: "audi-q8",
    modelName: "Q8",
    year: 2025,
    generationCode: "4M",
    generationLabel: "First generation (4M)",
    generationStartYear: 2019,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f71/Audi-Q8-facelift-2023.jpg",
    imagePageUrl: "https://www.auto-data.net/en/audi-q8-4m-facelift-2023-generation-9637",
    imageAlt: "2025 Audi Q8 55 TFSI Premium exterior",
    epaId: "48286",
    engine: {
      slug: "audi-ea839-q8-55",
      name: "3.0L V6 turbo TFSI mild hybrid",
      code: "EA839-Q8-55",
      displacementCc: 2995,
      cylinderCount: 6,
      configuration: "V",
      induction: "Turbocharger",
      electrification: "48V mild hybrid",
    },
    transmission: {
      slug: "audi-tiptronic-8",
      name: "8-speed Tiptronic automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // C&D specs
      lengthIn: 196.6,
      widthIn: 78.5,
      heightIn: 67.2,
      wheelbaseIn: 117.9,
      frontTrackIn: 66.1,
      rearTrackIn: 66.6,
      curbWeightKg: lbsToKg(5027),
      cargoVolumeLiters: cuFtToLiters(30.5),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 335,
      torqueLbFt: 369,
      // C&D instrumented
      zeroToSixtySeconds: 5.3,
    },
    // EPA id 48286
    fuelEconomy: { cityMpg: 17, highwayMpg: 23, combinedMpg: 19 },
    // Edmunds Premium $74,400 excl. destination
    baseMsrpCents: 7440000,
    specSourceSlug: "caranddriver-2026-audi-q8-specs",
    priceSourceSlug: "edmunds-2025-audi-q8-premium",
  },
  {
    slug: "2025-audi-q8-premium-plus-us",
    name: "Q8 55 TFSI Premium Plus",
    modelSlug: "audi-q8",
    modelName: "Q8",
    year: 2025,
    generationCode: "4M",
    generationLabel: "First generation (4M)",
    generationStartYear: 2019,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f71/Audi-Q8-facelift-2023_2.jpg",
    imagePageUrl: "https://www.auto-data.net/en/audi-q8-4m-facelift-2023-generation-9637",
    imageAlt: "2025 Audi Q8 55 TFSI Premium Plus exterior",
    epaId: "48286",
    engine: {
      slug: "audi-ea839-q8-55",
      name: "3.0L V6 turbo TFSI mild hybrid",
      code: "EA839-Q8-55",
      displacementCc: 2995,
      cylinderCount: 6,
      configuration: "V",
      induction: "Turbocharger",
      electrification: "48V mild hybrid",
    },
    transmission: {
      slug: "audi-tiptronic-8",
      name: "8-speed Tiptronic automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: 196.6,
      widthIn: 78.5,
      heightIn: 67.2,
      wheelbaseIn: 117.9,
      frontTrackIn: 66.1,
      rearTrackIn: 66.6,
      curbWeightKg: lbsToKg(5027),
      cargoVolumeLiters: cuFtToLiters(30.5),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 335,
      torqueLbFt: 369,
      zeroToSixtySeconds: 5.3,
    },
    fuelEconomy: { cityMpg: 17, highwayMpg: 23, combinedMpg: 19 },
    // Edmunds Premium Plus ~$78,500 excl. destination
    baseMsrpCents: 7850000,
    specSourceSlug: "caranddriver-2025-audi-q8",
    priceSourceSlug: "caranddriver-2025-audi-q8-pricing",
  },
];

const STATIC_SKIPPED = [
  "Q2: not offered in the US market",
  "Q3 Sportback: body style out of scope for this ICE SUV module",
  "Q5 Sportback: body style out of scope for this ICE SUV module",
  "Q5 40 TFSI (outgoing FY gen): incomplete MY 2025.5 new-gen focus; use GU TFSI trims",
  "Q5 55 TFSI e / PHEV: e-tron / PHEV reserved for separate module",
  "Q4 e-tron / Q6 e-tron / Q8 e-tron: e-tron reserved for separate module",
  "SQ5 / SQ7 / SQ8 / RS Q8: performance variants out of scope for base Q-line seed",
];

const MODEL_DEFS: {
  slug: ModelSlug;
  name: "Q3" | "Q5" | "Q7" | "Q8";
}[] = [
  { slug: "audi-q3", name: "Q3" },
  { slug: "audi-q5", name: "Q5" },
  { slug: "audi-q7", name: "Q7" },
  { slug: "audi-q8", name: "Q8" },
];

export async function seedAudiQLine(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  const models = new Map<ModelSlug, { id: string }>();
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
    models.set(def.slug, model);
  }

  const destinationSource = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE.slug,
    title: DESTINATION_SOURCE.title,
    publisher: DESTINATION_SOURCE.publisher,
    url: DESTINATION_SOURCE.url,
    type: DESTINATION_SOURCE.type,
  });

  const specSources = new Map<string, { id: string }>();
  for (const sourceData of SPEC_SOURCES) {
    const source = await upsertCatalogueSource(prisma, {
      slug: sourceData.slug,
      title: sourceData.title,
      publisher: sourceData.publisher,
      url: sourceData.url,
      type: "THIRD_PARTY",
    });
    specSources.set(sourceData.slug, source);
  }

  // Track widths for Q3 cited separately from C&D body dims
  const q3TrackSource = await upsertCatalogueSource(prisma, {
    slug: "iseecars-2025-audi-q3-dimensions",
    title: "2025 Audi Q3 Dimensions (iSeeCars)",
    publisher: "iSeeCars",
    url: "https://www.iseecars.com/car/2025-audi-q3-dimensions",
    type: "THIRD_PARTY",
  });
  specSources.set("iseecars-2025-audi-q3-dimensions", q3TrackSource);

  const priceSources = new Map<string, { id: string }>();
  for (const sourceData of PRICE_SOURCES) {
    const source = await upsertCatalogueSource(prisma, {
      slug: sourceData.slug,
      title: sourceData.title,
      publisher: sourceData.publisher,
      url: sourceData.url,
      type: "THIRD_PARTY",
    });
    priceSources.set(sourceData.slug, source);
  }

  const claimedImages = new Set<string>();
  const generationCache = new Map<string, { id: string }>();
  const yearCache = new Map<string, { id: string }>();
  const transmissionCache = new Map<string, { id: string }>();

  for (const trim of TRIMS) {
    try {
      if (claimedImages.has(trim.imageUrl)) {
        throw new Error(`Duplicate image URL within module: ${trim.imageUrl}`);
      }
      claimedImages.add(trim.imageUrl);

      const imageUrl = await assertImageUrlOk(trim.imageUrl);
      const imageSource = await ensureImageSource(prisma, {
        slug: `autodata-image-${trim.slug}`,
        title: `${trim.name} exterior (auto-data.net)`,
        pageUrl: trim.imagePageUrl,
        publisher: "auto-data.net",
      });

      const model = models.get(trim.modelSlug);
      if (!model) throw new Error(`Missing model ${trim.modelSlug}`);

      const genKey = `${trim.modelSlug}:${trim.generationCode}`;
      let generation = generationCache.get(genKey);
      if (!generation) {
        generation = await prisma.vehicleGeneration.upsert({
          where: {
            modelId_code: { modelId: model.id, code: trim.generationCode },
          },
          create: {
            modelId: model.id,
            code: trim.generationCode,
            displayName: trim.generationLabel,
            startYear: trim.generationStartYear,
          },
          update: {
            displayName: trim.generationLabel,
            startYear: trim.generationStartYear,
          },
        });
        generationCache.set(genKey, generation);
      }

      const yearKey = `${generation.id}:${trim.year}`;
      let modelYear = yearCache.get(yearKey);
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
        yearCache.set(yearKey, modelYear);
      }

      const engine = await ensureAudiEngine(prisma, {
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

      let transmission = transmissionCache.get(trim.transmission.slug);
      if (!transmission) {
        transmission = await prisma.transmission.upsert({
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
        transmissionCache.set(trim.transmission.slug, transmission);
      }

      const specSource = specSources.get(trim.specSourceSlug);
      if (!specSource) {
        throw new Error(`Missing spec source ${trim.specSourceSlug}`);
      }
      const priceSource = priceSources.get(trim.priceSourceSlug);
      if (!priceSource) {
        throw new Error(`Missing price source ${trim.priceSourceSlug}`);
      }

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-2025-${trim.slug}`,
        title: `EPA Fuel Economy — 2025 Audi ${trim.name}`,
        publisher: "U.S. EPA",
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
          transmissionId: transmission.id,
          description: `2025 Audi ${trim.name} SUV (US).`,
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
          description: `2025 Audi ${trim.name} SUV (US).`,
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
          "Power, torque, and 0–60 mph",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Exterior dimensions, curb weight, cargo",
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
          "Base MSRP excluding destination (2025 US)",
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
          "auto-data.net exterior asset",
        ),
      ]);

      if (trim.modelSlug === "audi-q3") {
        await upsertCitation(
          prisma,
          q3TrackSource.id,
          "VehicleDimensions",
          dimensions.id,
          "frontTrackIn",
          "iSeeCars front/rear track (45 TFSI)",
        );
      }

      await ensureAudit(prisma, importerId, vehicle.id, trim.slug);
      seeded.push(`${trim.slug} | EPA=${trim.epaId} | image=${imageUrl}`);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      skipped.push(`${trim.slug}: ${reason}`);
    }
  }

  return { seeded, skipped };
}
