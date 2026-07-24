/**
 * Porsche Cayenne + Macan SUV seed module (US market).
 * Cayenne MY2025 (9YA facelift): Base, S, GTS, Turbo E-Hybrid.
 * Macan: final ICE MY2024 S/GTS + Macan Electric MY2025 (4 / 4S) with EPA.
 * Prefer unique auto-data.net exteriors (encyCARpedia CDN often blocked).
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Exterior images (unique):
 * - https://www.auto-data.net/images/f93/Porsche-Cayenne-III-facelift-2023.jpg
 * - https://www.auto-data.net/images/f40/Porsche-Cayenne-III-facelift-2023.jpg
 * - https://www.auto-data.net/images/f107/Porsche-Cayenne-III-facelift-2023.jpg
 * - https://www.auto-data.net/images/f82/Porsche-Cayenne-III-facelift-2023.jpg
 * - https://www.auto-data.net/images/f112/Porsche-Macan-facelift-2021.jpg
 * - https://www.auto-data.net/images/f122/Porsche-Macan-facelift-2021.jpg
 * - https://www.auto-data.net/images/f61/Porsche-Macan-II-Electric.jpg
 * - https://www.auto-data.net/images/f31/Porsche-Macan-II-Electric.jpg
 */
import type { FuelType } from "../../src/generated/prisma/client";
import {
  PORSCHE_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensurePorscheEngine,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./porsche-shared";

const LBS_TO_KG = 0.45359237;
const CUFT_TO_L = 28.316846592;

/** MY2025 Porsche US destination from Cayenne newsroom ($1,995). */
const PORSCHE_US_DESTINATION_CENTS = 199_500;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

type ModelSlug = "porsche-cayenne" | "porsche-macan" | "porsche-macan-electric";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: "Cayenne" | "Macan" | "Macan Electric";
  year: number;
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
    fuelType: FuelType;
    displacementCc?: number | null;
    cylinderCount?: number | null;
    configuration: string;
    induction?: string | null;
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
    electricRangeMiles?: number;
  };
  /** BASE_MSRP in cents (excludes destination). */
  baseMsrpCents: number;
  specSourceSlug: string;
  priceSourceSlug: string;
  destinationCents?: number;
};

const SPEC_SOURCES = [
  {
    slug: "caranddriver-2025-porsche-cayenne",
    title: "2025 Porsche Cayenne Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/porsche/cayenne-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "edmunds-2025-porsche-cayenne",
    title: "2025 Porsche Cayenne Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/porsche/cayenne/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-porsche-cayenne-s",
    title: "2025 Porsche Cayenne S Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/porsche/cayenne/2025/st-402035377/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-porsche-cayenne-trims",
    title: "2025 Porsche Cayenne Trims Comparison (Edmunds)",
    url: "https://www.edmunds.com/porsche/cayenne/2025/trims/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2025-porsche-cayenne-hybrid",
    title: "2025 Porsche Cayenne Hybrid Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/porsche/cayenne-hybrid-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "edmunds-2024-porsche-macan-s",
    title: "2024 Porsche Macan S Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/porsche/macan/2024/st-401999467/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2024-porsche-macan-gts",
    title: "2024 Porsche Macan GTS Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/porsche/macan/2024/st-401999468/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2025-porsche-macan-ev",
    title: "2025 Porsche Macan Electric Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/porsche/macan-ev-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "porsche-finder-macan-4-electric",
    title: "Porsche Macan 4 Electric specifications (Porsche Finder)",
    url: "https://finder.porsche.com/us/en-US/details/porsche-macan-4-electric-new-PEPX44",
    publisher: "Porsche",
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "porsche-newsroom-2025-cayenne-msrp",
    title:
      "Model year 2025 updates for Cayenne and the new Cayenne GTS (Porsche Newsroom USA) — MSRP excludes destination",
    url: "https://newsroom.porsche.com/en_US/2024/products/Model-year-2025-updates-for-Cayenne-and-the-new-Cayenne-GTS-36254.html",
    publisher: "Porsche Newsroom USA",
  },
  {
    slug: "edmunds-2024-porsche-macan-s-price",
    title: "2024 Porsche Macan S Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/porsche/macan/2024/st-401999467/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2024-porsche-macan-gts-price",
    title: "2024 Porsche Macan GTS Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/porsche/macan/2024/st-401999468/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-porsche-macan-electric-price",
    title: "2025 Porsche Macan Electric (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/porsche/macan/2025/electric/",
    publisher: "Edmunds",
  },
] as const;

const DESTINATION_SOURCE_1995 = {
  slug: "porsche-newsroom-2025-cayenne-destination-1995",
  title:
    "Porsche USA destination, processing and handling $1,995 (Cayenne MY2025 newsroom)",
  url: "https://newsroom.porsche.com/en_US/2024/products/Model-year-2025-updates-for-Cayenne-and-the-new-Cayenne-GTS-36254.html",
  type: "PRESS_RELEASE" as const,
  publisher: "Porsche Newsroom USA",
};

/** Shared catalogue default for earlier MY destination when newsroom $1,995 does not apply. */
const DESTINATION_SOURCE_1650 = {
  slug: "porsche-us-destination-1650",
  title: "Porsche USA destination & handling $1,650 (catalogue default)",
  url: "https://www.porsche.com/usa/",
  type: "MANUFACTURER" as const,
  publisher: "Porsche Cars North America",
};

/**
 * Sourced US trims only. Skip incomplete / out-of-scope variants via STATIC_SKIPPED.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2025-porsche-cayenne-us",
    name: "Cayenne",
    modelSlug: "porsche-cayenne",
    modelName: "Cayenne",
    year: 2025,
    generationCode: "9YA",
    generationLabel: "Third generation (9YA facelift 2023)",
    generationStartYear: 2018,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f93/Porsche-Cayenne-III-facelift-2023.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/porsche-cayenne-iii-facelift-2023-generation-9439",
    imageAlt: "2025 Porsche Cayenne exterior",
    epaId: "48571",
    engine: {
      slug: "porsche-cayenne-3-0t-v6",
      name: "3.0L V6 turbo",
      code: "CAYENNE-3.0T-V6",
      fuelType: "PETROL",
      displacementCc: 2995,
      cylinderCount: 6,
      configuration: "V",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "porsche-tiptronic-s-8",
      name: "8-speed Tiptronic S automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // Edmunds 2025 Cayenne / trims; width without mirrors
      lengthIn: 194.1,
      widthIn: 78.1,
      heightIn: 66.9,
      wheelbaseIn: 114.0,
      curbWeightKg: lbsToKg(4678),
      cargoVolumeLiters: cuFtToLiters(27.3),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 348,
      torqueLbFt: 368,
      // C&D instrumented
      zeroToSixtySeconds: 4.7,
    },
    // EPA id 48571
    fuelEconomy: { cityMpg: 17, highwayMpg: 23, combinedMpg: 19 },
    // Porsche Newsroom: $84,700 excl. destination
    baseMsrpCents: 8_470_000,
    specSourceSlug: "edmunds-2025-porsche-cayenne",
    priceSourceSlug: "porsche-newsroom-2025-cayenne-msrp",
    destinationCents: PORSCHE_US_DESTINATION_CENTS,
  },
  {
    slug: "2025-porsche-cayenne-s-us",
    name: "Cayenne S",
    modelSlug: "porsche-cayenne",
    modelName: "Cayenne",
    year: 2025,
    generationCode: "9YA",
    generationLabel: "Third generation (9YA facelift 2023)",
    generationStartYear: 2018,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f40/Porsche-Cayenne-III-facelift-2023.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/porsche-cayenne-iii-facelift-2023-generation-9439",
    imageAlt: "2025 Porsche Cayenne S exterior",
    epaId: "48970",
    engine: {
      slug: "porsche-cayenne-4-0tt-v8-s",
      name: "4.0L V8 twin-turbo",
      code: "CAYENNE-4.0TT-V8-S",
      fuelType: "PETROL",
      displacementCc: 3996,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "porsche-tiptronic-s-8",
      name: "8-speed Tiptronic S automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: 194.1,
      widthIn: 78.1,
      heightIn: 66.8,
      wheelbaseIn: 114.0,
      curbWeightKg: lbsToKg(4874),
      cargoVolumeLiters: cuFtToLiters(27.3),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 468,
      torqueLbFt: 442,
      // Edmunds manufacturer 0–60
      zeroToSixtySeconds: 4.7,
    },
    // EPA id 48970
    fuelEconomy: { cityMpg: 16, highwayMpg: 21, combinedMpg: 18 },
    baseMsrpCents: 10_160_000,
    specSourceSlug: "edmunds-2025-porsche-cayenne-s",
    priceSourceSlug: "porsche-newsroom-2025-cayenne-msrp",
    destinationCents: PORSCHE_US_DESTINATION_CENTS,
  },
  {
    slug: "2025-porsche-cayenne-gts-us",
    name: "Cayenne GTS",
    modelSlug: "porsche-cayenne",
    modelName: "Cayenne",
    year: 2025,
    generationCode: "9YA",
    generationLabel: "Third generation (9YA facelift 2023)",
    generationStartYear: 2018,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f107/Porsche-Cayenne-III-facelift-2023.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/porsche-cayenne-iii-facelift-2023-generation-9439",
    imageAlt: "2025 Porsche Cayenne GTS exterior",
    epaId: "48650",
    engine: {
      slug: "porsche-cayenne-4-0tt-v8-gts",
      name: "4.0L V8 twin-turbo",
      code: "CAYENNE-4.0TT-V8-GTS",
      fuelType: "PETROL",
      displacementCc: 3995,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "porsche-tiptronic-s-8",
      name: "8-speed Tiptronic S automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // Edmunds trims (height/cargo); C&D GTS length/wheelbase family
      lengthIn: 194.1,
      widthIn: 78.1,
      heightIn: 65.9,
      wheelbaseIn: 114.0,
      curbWeightKg: lbsToKg(4956),
      cargoVolumeLiters: cuFtToLiters(27.3),
      seatingCapacity: 5,
    },
    performance: {
      // C&D instrumented sheet / Edmunds GTS (493 hp, 487 lb-ft)
      powerHp: 493,
      torqueLbFt: 486,
      // Porsche Newsroom manufacturer claim
      zeroToSixtySeconds: 4.2,
    },
    // EPA id 48650
    fuelEconomy: { cityMpg: 15, highwayMpg: 22, combinedMpg: 18 },
    baseMsrpCents: 12_490_000,
    specSourceSlug: "caranddriver-2025-porsche-cayenne",
    priceSourceSlug: "porsche-newsroom-2025-cayenne-msrp",
    destinationCents: PORSCHE_US_DESTINATION_CENTS,
  },
  {
    slug: "2025-porsche-cayenne-turbo-e-hybrid-us",
    name: "Cayenne Turbo E-Hybrid",
    modelSlug: "porsche-cayenne",
    modelName: "Cayenne",
    year: 2025,
    generationCode: "9YA",
    generationLabel: "Third generation (9YA facelift 2023)",
    generationStartYear: 2018,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f82/Porsche-Cayenne-III-facelift-2023.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/porsche-cayenne-iii-facelift-2023-generation-9439",
    imageAlt: "2025 Porsche Cayenne Turbo E-Hybrid exterior",
    epaId: "49027",
    engine: {
      slug: "porsche-cayenne-4-0tt-v8-turbo-e-hybrid",
      name: "4.0L V8 twin-turbo plug-in hybrid",
      code: "CAYENNE-4.0TT-V8-TEH",
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 3996,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: "PHEV (130 kW DC brushless motor; EPA)",
    },
    transmission: {
      slug: "porsche-tiptronic-s-8",
      name: "8-speed Tiptronic S automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: 194.1,
      widthIn: 78.6,
      heightIn: 66.3,
      wheelbaseIn: 114.0,
      curbWeightKg: lbsToKg(5664),
      cargoVolumeLiters: cuFtToLiters(21.9),
      seatingCapacity: 5,
    },
    performance: {
      // C&D / Porsche: combined 729 hp, 700 lb-ft; 0–60 with Sport Chrono
      powerHp: 729,
      torqueLbFt: 700,
      zeroToSixtySeconds: 3.5,
    },
    // EPA id 49027 — gas-only city/hwy/comb + electric range (rangeA)
    fuelEconomy: {
      cityMpg: 21,
      highwayMpg: 23,
      combinedMpg: 22,
      electricRangeMiles: 24,
    },
    baseMsrpCents: 15_700_000,
    specSourceSlug: "caranddriver-2025-porsche-cayenne-hybrid",
    priceSourceSlug: "porsche-newsroom-2025-cayenne-msrp",
    destinationCents: PORSCHE_US_DESTINATION_CENTS,
  },
  {
    slug: "2024-porsche-macan-s-us",
    name: "Macan S",
    modelSlug: "porsche-macan",
    modelName: "Macan",
    year: 2024,
    generationCode: "95B",
    generationLabel: "First generation (95B facelift 2021)",
    generationStartYear: 2014,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f112/Porsche-Macan-facelift-2021.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/porsche-macan-i-95b-facelift-2021-generation-8506",
    imageAlt: "2024 Porsche Macan S exterior",
    epaId: "47158",
    engine: {
      slug: "porsche-macan-2-9tt-v6-s",
      name: "2.9L V6 twin-turbo",
      code: "MACAN-2.9TT-V6-S",
      fuelType: "PETROL",
      displacementCc: 2894,
      cylinderCount: 6,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "porsche-pdk-7",
      name: "7-speed PDK dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      lengthIn: 186.1,
      widthIn: 76.1,
      heightIn: 63.8,
      wheelbaseIn: 110.5,
      curbWeightKg: lbsToKg(4350),
      cargoVolumeLiters: cuFtToLiters(17.2),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 375,
      torqueLbFt: 383,
      zeroToSixtySeconds: 4.6,
    },
    // EPA id 47158
    fuelEconomy: { cityMpg: 17, highwayMpg: 23, combinedMpg: 19 },
    baseMsrpCents: 7_230_000,
    specSourceSlug: "edmunds-2024-porsche-macan-s",
    priceSourceSlug: "edmunds-2024-porsche-macan-s-price",
    destinationCents: PORSCHE_DESTINATION_CENTS,
  },
  {
    slug: "2024-porsche-macan-gts-us",
    name: "Macan GTS",
    modelSlug: "porsche-macan",
    modelName: "Macan",
    year: 2024,
    generationCode: "95B",
    generationLabel: "First generation (95B facelift 2021)",
    generationStartYear: 2014,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f122/Porsche-Macan-facelift-2021.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/porsche-macan-i-95b-facelift-2021-generation-8506",
    imageAlt: "2024 Porsche Macan GTS exterior",
    epaId: "47160",
    engine: {
      slug: "porsche-macan-2-9tt-v6-gts",
      name: "2.9L V6 twin-turbo",
      code: "MACAN-2.9TT-V6-GTS",
      fuelType: "PETROL",
      displacementCc: 2894,
      cylinderCount: 6,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "porsche-pdk-7",
      name: "7-speed PDK dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      lengthIn: 186.1,
      widthIn: 76.1,
      heightIn: 62.8,
      wheelbaseIn: 110.5,
      curbWeightKg: lbsToKg(4400),
      cargoVolumeLiters: cuFtToLiters(17.2),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 434,
      torqueLbFt: 405,
      zeroToSixtySeconds: 4.3,
    },
    // EPA id 47160
    fuelEconomy: { cityMpg: 17, highwayMpg: 22, combinedMpg: 19 },
    baseMsrpCents: 8_680_000,
    specSourceSlug: "edmunds-2024-porsche-macan-gts",
    priceSourceSlug: "edmunds-2024-porsche-macan-gts-price",
    destinationCents: PORSCHE_DESTINATION_CENTS,
  },
  {
    slug: "2025-porsche-macan-4-electric-us",
    name: "Macan 4 Electric",
    modelSlug: "porsche-macan-electric",
    modelName: "Macan Electric",
    year: 2025,
    generationCode: "PPE",
    generationLabel: "Second generation Electric (PPE)",
    generationStartYear: 2024,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f61/Porsche-Macan-II-Electric.jpg",
    imagePageUrl: "https://www.auto-data.net/en/porsche-macan-ii-electric-generation-9853",
    imageAlt: "2025 Porsche Macan 4 Electric exterior",
    epaId: "48727",
    engine: {
      slug: "porsche-macan-4-dual-pmsm",
      name: "Dual permanent-magnet synchronous motors",
      code: "MACAN-4-DUAL-PMSM",
      fuelType: "ELECTRIC",
      displacementCc: null,
      cylinderCount: null,
      configuration: "Dual electric motors",
      induction: null,
      electrification: "175/175/495 kW ACPM (EPA); Launch Control overboost",
    },
    transmission: {
      slug: "porsche-single-speed-automatic",
      name: "Single-speed automatic",
      type: "AUTOMATIC",
      gearCount: 1,
    },
    dimensions: {
      // Porsche Finder / C&D Macan Electric family
      lengthIn: 188.4,
      widthIn: 76.3,
      heightIn: 63.8,
      wheelbaseIn: 113.9,
      curbWeightKg: lbsToKg(5137),
      cargoVolumeLiters: cuFtToLiters(18),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 402,
      torqueLbFt: 479,
      zeroToSixtySeconds: 4.9,
    },
    // EPA id 48727 — MPGe + range
    fuelEconomy: {
      cityMpg: 107,
      highwayMpg: 89,
      combinedMpg: 98,
      electricRangeMiles: 308,
    },
    baseMsrpCents: 7_880_000,
    specSourceSlug: "porsche-finder-macan-4-electric",
    priceSourceSlug: "edmunds-2025-porsche-macan-electric-price",
    destinationCents: PORSCHE_US_DESTINATION_CENTS,
  },
  {
    slug: "2025-porsche-macan-4s-electric-us",
    name: "Macan 4S Electric",
    modelSlug: "porsche-macan-electric",
    modelName: "Macan Electric",
    year: 2025,
    generationCode: "PPE",
    generationLabel: "Second generation Electric (PPE)",
    generationStartYear: 2024,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f31/Porsche-Macan-II-Electric.jpg",
    imagePageUrl: "https://www.auto-data.net/en/porsche-macan-ii-electric-generation-9853",
    imageAlt: "2025 Porsche Macan 4S Electric exterior",
    epaId: "48728",
    engine: {
      slug: "porsche-macan-4s-dual-pmsm",
      name: "Dual permanent-magnet synchronous motors",
      code: "MACAN-4S-DUAL-PMSM",
      fuelType: "ELECTRIC",
      displacementCc: null,
      cylinderCount: null,
      configuration: "Dual electric motors",
      induction: null,
      electrification: "Dual PMSM; Launch Control overboost (EPA / C&D)",
    },
    transmission: {
      slug: "porsche-single-speed-automatic",
      name: "Single-speed automatic",
      type: "AUTOMATIC",
      gearCount: 1,
    },
    dimensions: {
      lengthIn: 188.4,
      widthIn: 76.3,
      heightIn: 63.8,
      wheelbaseIn: 113.9,
      curbWeightKg: lbsToKg(5341),
      cargoVolumeLiters: cuFtToLiters(18),
      seatingCapacity: 5,
    },
    performance: {
      // C&D 4S instrumented sheet
      powerHp: 509,
      torqueLbFt: 604,
      zeroToSixtySeconds: 3.9,
    },
    // EPA id 48728 — MPGe + range
    fuelEconomy: {
      cityMpg: 98,
      highwayMpg: 83,
      combinedMpg: 91,
      electricRangeMiles: 288,
    },
    baseMsrpCents: 8_490_000,
    specSourceSlug: "caranddriver-2025-porsche-macan-ev",
    priceSourceSlug: "edmunds-2025-porsche-macan-electric-price",
    destinationCents: PORSCHE_US_DESTINATION_CENTS,
  },
];

const STATIC_SKIPPED = [
  "Cayenne Coupe / Turbo GT Coupe: coupe body out of scope for this SUV module",
  "Cayenne E-Hybrid / S E-Hybrid: PHEV mid-trims deferred; Turbo E-Hybrid seeded as flagship PHEV",
  "Macan / Macan T ICE: base/T incomplete relative to S/GTS final ICE focus",
  "Macan Electric RWD base / Turbo Electric: optional; 4 and 4S seeded with full EPA",
  "Cayenne Electric (IV): not yet US EPA-complete for this seed pass",
];

const MODEL_DEFS: {
  slug: ModelSlug;
  name: "Cayenne" | "Macan" | "Macan Electric";
}[] = [
  { slug: "porsche-cayenne", name: "Cayenne" },
  { slug: "porsche-macan", name: "Macan" },
  { slug: "porsche-macan-electric", name: "Macan Electric" },
];

export async function seedPorscheSuv(
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

  const destinationSource1995 = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE_1995.slug,
    title: DESTINATION_SOURCE_1995.title,
    publisher: DESTINATION_SOURCE_1995.publisher,
    url: DESTINATION_SOURCE_1995.url,
    type: DESTINATION_SOURCE_1995.type,
  });
  const destinationSource1650 = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE_1650.slug,
    title: DESTINATION_SOURCE_1650.title,
    publisher: DESTINATION_SOURCE_1650.publisher,
    url: DESTINATION_SOURCE_1650.url,
    type: DESTINATION_SOURCE_1650.type,
  });

  const specSources = new Map<string, { id: string }>();
  for (const sourceData of SPEC_SOURCES) {
    const source = await upsertCatalogueSource(prisma, {
      slug: sourceData.slug,
      title: sourceData.title,
      publisher: sourceData.publisher,
      url: sourceData.url,
      type:
        sourceData.slug === "porsche-finder-macan-4-electric"
          ? "MANUFACTURER"
          : "THIRD_PARTY",
    });
    specSources.set(sourceData.slug, source);
  }

  const priceSources = new Map<string, { id: string }>();
  for (const sourceData of PRICE_SOURCES) {
    const source = await upsertCatalogueSource(prisma, {
      slug: sourceData.slug,
      title: sourceData.title,
      publisher: sourceData.publisher,
      url: sourceData.url,
      type: sourceData.slug.startsWith("porsche-newsroom")
        ? "PRESS_RELEASE"
        : "THIRD_PARTY",
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

      const engine = await ensurePorscheEngine(prisma, {
        manufacturerId,
        slug: trim.engine.slug,
        name: trim.engine.name,
        code: trim.engine.code,
        fuelType: trim.engine.fuelType,
        displacementCc: trim.engine.displacementCc ?? null,
        cylinderCount: trim.engine.cylinderCount ?? null,
        configuration: trim.engine.configuration,
        induction: trim.engine.induction ?? null,
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
        slug: `epa-${trim.year}-${trim.slug}`,
        title: `EPA Fuel Economy — ${trim.year} Porsche ${trim.name}`,
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
          description: `${trim.year} Porsche ${trim.name} SUV (US).`,
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
          description: `${trim.year} Porsche ${trim.name} SUV (US).`,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
      });

      const destinationCents =
        trim.destinationCents ?? PORSCHE_US_DESTINATION_CENTS;
      const destinationSource =
        destinationCents === PORSCHE_DESTINATION_CENTS
          ? destinationSource1650
          : destinationSource1995;

      const fuelEconomyData = {
        cityMpg: trim.fuelEconomy.cityMpg,
        highwayMpg: trim.fuelEconomy.highwayMpg,
        combinedMpg: trim.fuelEconomy.combinedMpg,
        electricRangeMiles: trim.fuelEconomy.electricRangeMiles ?? null,
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
            create: { vehicleId: vehicle.id, ...fuelEconomyData },
            update: fuelEconomyData,
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

      const citationTasks = [
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
          `Base MSRP excluding destination (${trim.year} US)`,
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
      ];

      if (trim.fuelEconomy.electricRangeMiles != null) {
        citationTasks.push(
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

      await Promise.all(citationTasks);
      await ensureAudit(prisma, importerId, vehicle.id, trim.slug);
      seeded.push(`${trim.slug} | EPA=${trim.epaId} | image=${imageUrl}`);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      skipped.push(`${trim.slug}: ${reason}`);
    }
  }

  return { seeded, skipped };
}
