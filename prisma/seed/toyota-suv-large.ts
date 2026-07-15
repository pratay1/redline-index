/**
 * Toyota mid/large SUV seed module (US market).
 * Models: Highlander, Grand Highlander, 4Runner, Sequoia, Land Cruiser (250-series).
 * Prefer MY 2025 US trims with EPA + manufacturer/third-party citations.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Exterior images (unique; auto-data.net):
 * - https://www.auto-data.net/images/f41/Toyota-Highlander-IV.jpg
 * - https://www.auto-data.net/images/f41/Toyota-Highlander-IV_2.jpg
 * - https://www.auto-data.net/images/f111/Toyota-Grand-Highlander.jpg
 * - https://www.auto-data.net/images/f110/Toyota-Grand-Highlander_2.jpg
 * - https://www.auto-data.net/images/f98/Toyota-4Runner-VI.jpg
 * - https://www.auto-data.net/images/f112/Toyota-4Runner-VI.jpg
 * - https://www.auto-data.net/images/f88/Toyota-Sequoia-III-XK80.jpg
 * - https://www.auto-data.net/images/f120/Toyota-Sequoia-III-XK80_2.jpg
 * - https://www.auto-data.net/images/f108/Toyota-Land-Cruiser-J25.jpg
 * - https://www.auto-data.net/images/f41/Toyota-Land-Cruiser-J250.jpg
 */
import type { Drivetrain, FuelType, TransmissionType } from "../../src/generated/prisma/client";
import {
  TOYOTA_DPH_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureToyotaEngine,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./toyota-shared";

const LBS_TO_KG = 0.45359237;
const CUFT_TO_L = 28.316846592;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

type ModelSlug =
  | "toyota-highlander"
  | "toyota-grand-highlander"
  | "toyota-4runner"
  | "toyota-sequoia"
  | "toyota-land-cruiser";

type ModelName =
  | "Highlander"
  | "Grand Highlander"
  | "4Runner"
  | "Sequoia"
  | "Land Cruiser";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: ModelName;
  year: 2025;
  generationCode: string;
  generationLabel: string;
  generationStartYear: number;
  bodyStyle: "SUV";
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
    configuration: "Inline" | "V";
    induction: string;
    electrification: string | null;
  };
  transmission: {
    slug: string;
    name: string;
    type: TransmissionType;
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
  };
  /** BASE_MSRP in cents (excludes destination). */
  baseMsrpCents: number;
  destinationCents: number;
  destinationSourceSlug: string;
  specSourceSlug: string;
  priceSourceSlug: string;
};

const SPEC_SOURCES = [
  {
    slug: "caranddriver-2025-toyota-highlander",
    title: "2025 Toyota Highlander Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/highlander-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "caranddriver-2025-toyota-highlander-hybrid",
    title: "2025 Toyota Highlander Hybrid Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/highlander-hybrid-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "edmunds-2025-toyota-highlander-le",
    title: "2025 Toyota Highlander LE Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/highlander/2025/st-402018191/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-highlander-hybrid-xle",
    title: "2025 Toyota Highlander Hybrid XLE Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/highlander-hybrid/2025/st-402018397/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2025-toyota-grand-highlander",
    title: "2025 Toyota Grand Highlander Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/grand-highlander-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "caranddriver-2025-toyota-grand-highlander-hybrid",
    title: "2025 Toyota Grand Highlander Hybrid Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/grand-highlander-hybrid-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "edmunds-2025-toyota-grand-highlander-le",
    title: "2025 Toyota Grand Highlander LE Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/grand-highlander/2025/st-402039717/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-grand-highlander-hybrid-max-platinum",
    title: "2025 Toyota Grand Highlander Hybrid MAX Platinum Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/grand-highlander-hybrid/2025/st-402058702/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "toyota-pressroom-2025-4runner",
    title: "The All-New 2025 Toyota 4Runner (Toyota USA Newsroom)",
    url: "https://pressroom.toyota.com/the-all-new-2025-toyota-4runner-the-icon-that-inspires-exploration/",
    publisher: "Toyota USA Newsroom",
  },
  {
    slug: "caranddriver-2025-toyota-4runner",
    title: "2025 Toyota 4Runner Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/4runner-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "caranddriver-2025-toyota-4runner-hybrid",
    title: "2025 Toyota 4Runner Hybrid Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/4runner-hybrid-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "motortrend-2025-toyota-4runner-sr5",
    title: "2025 Toyota 4Runner SR5 4x2 First Test Review (MotorTrend)",
    url: "https://www.motortrend.com/reviews/2025-toyota-4runner-sr5-4x2-first-test-review",
    publisher: "MotorTrend",
  },
  {
    slug: "edmunds-2025-toyota-4runner-sr5",
    title: "2025 Toyota 4Runner SR5 Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/4runner/2025/st-402064209/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2025-toyota-sequoia",
    title: "2025 Toyota Sequoia Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/sequoia-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "edmunds-2025-toyota-sequoia-capstone",
    title: "2025 Toyota Sequoia Capstone Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/sequoia/2025/st-402052387/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "cars-com-2025-toyota-sequoia-whats-new",
    title: "What’s New for the 2025 Toyota Sequoia (Cars.com)",
    url: "https://www.cars.com/articles/whats-new-for-the-2025-toyota-sequoia-492179/",
    publisher: "Cars.com",
  },
  {
    slug: "edmunds-2025-toyota-land-cruiser",
    title: "2025 Toyota Land Cruiser Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/land-cruiser/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "motortrend-2025-toyota-land-cruiser-1958",
    title: "2025 Toyota Land Cruiser 1958 First Test Review (MotorTrend)",
    url: "https://www.motortrend.com/reviews/2025-toyota-land-cruiser-1958-first-test-review",
    publisher: "MotorTrend",
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "edmunds-2025-toyota-highlander-le-price",
    title: "2025 Toyota Highlander LE Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/highlander/2025/st-402018191/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-highlander-hybrid-xle-price",
    title: "2025 Toyota Highlander Hybrid XLE Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/highlander-hybrid/2025/st-402018397/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-grand-highlander-le-price",
    title: "2025 Toyota Grand Highlander LE Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/grand-highlander/2025/st-402039717/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-grand-highlander-hybrid-max-platinum-price",
    title:
      "2025 Toyota Grand Highlander Hybrid MAX Platinum Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/grand-highlander-hybrid/2025/st-402058702/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "toyota-pressroom-2025-4runner-msrp",
    title: "2025 Toyota 4Runner MSRP starting $40,770 plus $1,450 DPH (Toyota USA Newsroom)",
    url: "https://pressroom.toyota.com/the-all-new-2025-toyota-4runner-the-icon-that-inspires-exploration/",
    publisher: "Toyota USA Newsroom",
  },
  {
    slug: "caranddriver-2025-toyota-4runner-trailhunter-price",
    title: "2025 Toyota 4Runner Trailhunter and TRD Pro pricing (Car and Driver)",
    url: "https://www.caranddriver.com/news/a63146403/2025-toyota-4runner-price/",
    publisher: "Car and Driver",
  },
  {
    slug: "edmunds-2025-toyota-sequoia-trims-price",
    title: "2025 Toyota Sequoia features-specs listing (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/sequoia/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-land-cruiser-price",
    title: "2025 Toyota Land Cruiser Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/land-cruiser/2025/features-specs/",
    publisher: "Edmunds",
  },
] as const;

const DESTINATION_SOURCES = [
  {
    slug: "toyota-pressroom-2025-4runner-dph-1450",
    title: "Toyota USA Delivery, Processing and Handling $1,450 (4Runner mid-SUV/van class)",
    url: "https://pressroom.toyota.com/the-all-new-2025-toyota-4runner-the-icon-that-inspires-exploration/",
    type: "PRESS_RELEASE" as const,
    publisher: "Toyota USA Newsroom",
  },
  {
    slug: "cars-com-2025-toyota-sequoia-dph-1945",
    title: "Toyota Sequoia destination charge $1,945 (Cars.com / manufacturer DPH schedule)",
    url: "https://www.cars.com/articles/whats-new-for-the-2025-toyota-sequoia-492179/",
    type: "THIRD_PARTY" as const,
    publisher: "Cars.com",
  },
] as const;

/**
 * MY 2025 US mid/large SUV trims with full sourced specs.
 * Cargo = seats-up (behind last occupied row) volume where cited.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2025-toyota-highlander-le-us",
    name: "Highlander LE",
    modelSlug: "toyota-highlander",
    modelName: "Highlander",
    year: 2025,
    generationCode: "XU70",
    generationLabel: "Fourth generation (XU70)",
    generationStartYear: 2020,
    bodyStyle: "SUV",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f41/Toyota-Highlander-IV.jpg",
    imagePageUrl: "https://www.auto-data.net/en/toyota-highlander-iv-generation-7495",
    imageAlt: "2025 Toyota Highlander LE exterior",
    epaId: "48912",
    engine: {
      slug: "toyota-t24a-fts-265",
      name: "2.4L Inline-4 turbo i-FORCE",
      code: "T24A-FTS",
      fuelType: "PETROL",
      displacementCc: 2393,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "toyota-direct-shift-8",
      name: "8-speed Direct Shift automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // Edmunds Highlander LE FWD
      lengthIn: 194.9,
      widthIn: 76.0,
      heightIn: 68.1,
      wheelbaseIn: 112.2,
      curbWeightKg: lbsToKg(4155),
      cargoVolumeLiters: cuFtToLiters(16.0),
      seatingCapacity: 8,
    },
    performance: {
      powerHp: 265,
      torqueLbFt: 310,
      // C&D instrumented (AWD gas Highlander)
      zeroToSixtySeconds: 7.2,
    },
    // EPA id 48912
    fuelEconomy: { cityMpg: 22, highwayMpg: 29, combinedMpg: 25 },
    // Edmunds LE FWD $39,820 excl. destination
    baseMsrpCents: 3_982_000,
    destinationCents: TOYOTA_DPH_CENTS.midSuvVan,
    destinationSourceSlug: "toyota-pressroom-2025-4runner-dph-1450",
    specSourceSlug: "caranddriver-2025-toyota-highlander",
    priceSourceSlug: "edmunds-2025-toyota-highlander-le-price",
  },
  {
    slug: "2025-toyota-highlander-hybrid-xle-us",
    name: "Highlander Hybrid XLE",
    modelSlug: "toyota-highlander",
    modelName: "Highlander",
    year: 2025,
    generationCode: "XU70",
    generationLabel: "Fourth generation (XU70)",
    generationStartYear: 2020,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f41/Toyota-Highlander-IV_2.jpg",
    imagePageUrl: "https://www.auto-data.net/en/toyota-highlander-iv-generation-7495",
    imageAlt: "2025 Toyota Highlander Hybrid XLE exterior",
    epaId: "48981",
    engine: {
      slug: "toyota-a25a-fxs-highlander-hybrid",
      name: "2.5L Inline-4 hybrid",
      code: "A25A-FXS",
      fuelType: "HYBRID",
      displacementCc: 2487,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "Full hybrid",
    },
    transmission: {
      slug: "toyota-ecvt-highlander",
      name: "Electronically controlled CVT (eCVT)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Edmunds / KBB Hybrid XLE AWD
      lengthIn: 194.9,
      widthIn: 76.0,
      heightIn: 68.1,
      wheelbaseIn: 112.2,
      curbWeightKg: lbsToKg(4515),
      cargoVolumeLiters: cuFtToLiters(16.0),
      seatingCapacity: 8,
    },
    performance: {
      powerHp: 243,
      // KBB / Edmunds ICE torque @ 4400 rpm
      torqueLbFt: 175,
      // C&D: Hybrid trails gas by 0.1 s → 7.3
      zeroToSixtySeconds: 7.3,
    },
    // EPA id 48981
    fuelEconomy: { cityMpg: 35, highwayMpg: 35, combinedMpg: 35 },
    // Edmunds Hybrid XLE AWD $46,820 excl. destination
    baseMsrpCents: 4_682_000,
    destinationCents: TOYOTA_DPH_CENTS.midSuvVan,
    destinationSourceSlug: "toyota-pressroom-2025-4runner-dph-1450",
    specSourceSlug: "caranddriver-2025-toyota-highlander-hybrid",
    priceSourceSlug: "edmunds-2025-toyota-highlander-hybrid-xle-price",
  },
  {
    slug: "2025-toyota-grand-highlander-le-us",
    name: "Grand Highlander LE",
    modelSlug: "toyota-grand-highlander",
    modelName: "Grand Highlander",
    year: 2025,
    generationCode: "AS10",
    generationLabel: "First generation (AS10)",
    generationStartYear: 2024,
    bodyStyle: "SUV",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f111/Toyota-Grand-Highlander.jpg",
    imagePageUrl: "https://www.auto-data.net/en/toyota-grand-highlander-generation-9831",
    imageAlt: "2025 Toyota Grand Highlander LE exterior",
    epaId: "48949",
    engine: {
      slug: "toyota-t24a-fts-265",
      name: "2.4L Inline-4 turbo i-FORCE",
      code: "T24A-FTS",
      fuelType: "PETROL",
      displacementCc: 2393,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "toyota-direct-shift-8",
      name: "8-speed Direct Shift automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // Edmunds Grand Highlander LE FWD
      lengthIn: 201.4,
      widthIn: 78.3,
      heightIn: 70.1,
      wheelbaseIn: 116.1,
      curbWeightKg: lbsToKg(4290),
      cargoVolumeLiters: cuFtToLiters(20.6),
      seatingCapacity: 8,
    },
    performance: {
      powerHp: 265,
      torqueLbFt: 310,
      // Edmunds manufacturer 0–60 / C&D gas family ~7.0–7.5
      zeroToSixtySeconds: 7.5,
    },
    // EPA id 48949 (LE/XLE FWD)
    fuelEconomy: { cityMpg: 21, highwayMpg: 28, combinedMpg: 24 },
    // Edmunds LE FWD $40,860 excl. destination
    baseMsrpCents: 4_086_000,
    destinationCents: TOYOTA_DPH_CENTS.midSuvVan,
    destinationSourceSlug: "toyota-pressroom-2025-4runner-dph-1450",
    specSourceSlug: "edmunds-2025-toyota-grand-highlander-le",
    priceSourceSlug: "edmunds-2025-toyota-grand-highlander-le-price",
  },
  {
    slug: "2025-toyota-grand-highlander-hybrid-max-platinum-us",
    name: "Grand Highlander Hybrid MAX Platinum",
    modelSlug: "toyota-grand-highlander",
    modelName: "Grand Highlander",
    year: 2025,
    generationCode: "AS10",
    generationLabel: "First generation (AS10)",
    generationStartYear: 2024,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f110/Toyota-Grand-Highlander_2.jpg",
    imagePageUrl: "https://www.auto-data.net/en/toyota-grand-highlander-generation-9831",
    imageAlt: "2025 Toyota Grand Highlander Hybrid MAX Platinum exterior",
    epaId: "48973",
    engine: {
      slug: "toyota-t24a-fts-hybrid-max-362",
      name: "2.4L Inline-4 turbo Hybrid MAX",
      code: "T24A-FTS-MAX",
      fuelType: "HYBRID",
      displacementCc: 2393,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: "Full hybrid (Hybrid MAX)",
    },
    transmission: {
      slug: "toyota-ect-i-6-hybrid-max",
      name: "6-speed automatic (Hybrid MAX)",
      type: "AUTOMATIC",
      gearCount: 6,
    },
    dimensions: {
      // Edmunds Hybrid MAX Platinum
      lengthIn: 201.4,
      widthIn: 78.3,
      heightIn: 70.1,
      wheelbaseIn: 116.1,
      curbWeightKg: lbsToKg(4905),
      cargoVolumeLiters: cuFtToLiters(20.6),
      seatingCapacity: 7,
    },
    performance: {
      powerHp: 362,
      torqueLbFt: 400,
      // C&D instrumented Hybrid MAX
      zeroToSixtySeconds: 5.6,
    },
    // EPA id 48973 (2.4 turbo Hybrid AWD / MAX)
    fuelEconomy: { cityMpg: 26, highwayMpg: 27, combinedMpg: 27 },
    // Edmunds MAX Platinum $58,775 excl. destination
    baseMsrpCents: 5_877_500,
    destinationCents: TOYOTA_DPH_CENTS.midSuvVan,
    destinationSourceSlug: "toyota-pressroom-2025-4runner-dph-1450",
    specSourceSlug: "edmunds-2025-toyota-grand-highlander-hybrid-max-platinum",
    priceSourceSlug: "edmunds-2025-toyota-grand-highlander-hybrid-max-platinum-price",
  },
  {
    slug: "2025-toyota-4runner-sr5-us",
    name: "4Runner SR5",
    modelSlug: "toyota-4runner",
    modelName: "4Runner",
    year: 2025,
    generationCode: "N280",
    generationLabel: "Sixth generation (N280)",
    generationStartYear: 2025,
    bodyStyle: "SUV",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f98/Toyota-4Runner-VI.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-4runner-vi-2.4-i-force-max-326hp-hybrid-4wd-ect-i-53428",
    imageAlt: "2025 Toyota 4Runner SR5 exterior",
    epaId: "48951",
    engine: {
      slug: "toyota-t24a-fts-278",
      name: "2.4L Inline-4 turbo i-FORCE",
      code: "T24A-FTS-278",
      fuelType: "PETROL",
      displacementCc: 2393,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "toyota-ect-i-8-4runner",
      name: "8-speed ECT-i automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // MotorTrend SR5 4x2 / Toyota product info
      lengthIn: 194.9,
      widthIn: 77.9,
      heightIn: 72.6,
      wheelbaseIn: 112.2,
      curbWeightKg: lbsToKg(4455),
      cargoVolumeLiters: cuFtToLiters(48.4),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 278,
      torqueLbFt: 317,
      // MotorTrend SR5 4x2 instrumented
      zeroToSixtySeconds: 7.3,
    },
    // EPA id 48951 (2WD; 20/26/22)
    fuelEconomy: { cityMpg: 20, highwayMpg: 26, combinedMpg: 22 },
    // Toyota pressroom SR5 $40,770 excl. $1,450 DPH
    baseMsrpCents: 4_077_000,
    destinationCents: TOYOTA_DPH_CENTS.midSuvVan,
    destinationSourceSlug: "toyota-pressroom-2025-4runner-dph-1450",
    specSourceSlug: "motortrend-2025-toyota-4runner-sr5",
    priceSourceSlug: "toyota-pressroom-2025-4runner-msrp",
  },
  {
    slug: "2025-toyota-4runner-trailhunter-us",
    name: "4Runner Trailhunter",
    modelSlug: "toyota-4runner",
    modelName: "4Runner",
    year: 2025,
    generationCode: "N280",
    generationLabel: "Sixth generation (N280)",
    generationStartYear: 2025,
    bodyStyle: "SUV",
    drivetrain: "FOUR_WD",
    imageUrl: "https://www.auto-data.net/images/f112/Toyota-4Runner-VI.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-4runner-vi-2.4-i-force-max-326hp-hybrid-4wd-ect-i-53428",
    imageAlt: "2025 Toyota 4Runner Trailhunter exterior",
    epaId: "49062",
    engine: {
      slug: "toyota-t24a-fts-hybrid-max-326",
      name: "2.4L Inline-4 turbo i-FORCE MAX hybrid",
      code: "T24A-FTS-MAX-326",
      fuelType: "HYBRID",
      displacementCc: 2393,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: "Full hybrid (i-FORCE MAX)",
    },
    transmission: {
      slug: "toyota-ect-i-8-4runner",
      name: "8-speed ECT-i automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // Toyota product info PRO/TH width/height; curb Trailhunter hybrid
      lengthIn: 194.9,
      widthIn: 79.9,
      heightIn: 74.0,
      wheelbaseIn: 112.2,
      curbWeightKg: lbsToKg(5500),
      cargoVolumeLiters: cuFtToLiters(48.4),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 326,
      torqueLbFt: 465,
      // C&D Trailhunter instrumented (RWD test mode 6.7; cite published)
      zeroToSixtySeconds: 6.7,
    },
    // EPA hybrid 4WD band 23/24/23 (ids 49062/49063)
    fuelEconomy: { cityMpg: 23, highwayMpg: 24, combinedMpg: 23 },
    // C&D $68,350 incl. $1,450 → $66,900 excl. destination
    baseMsrpCents: 6_690_000,
    destinationCents: TOYOTA_DPH_CENTS.midSuvVan,
    destinationSourceSlug: "toyota-pressroom-2025-4runner-dph-1450",
    specSourceSlug: "caranddriver-2025-toyota-4runner-hybrid",
    priceSourceSlug: "caranddriver-2025-toyota-4runner-trailhunter-price",
  },
  {
    slug: "2025-toyota-sequoia-sr5-us",
    name: "Sequoia SR5",
    modelSlug: "toyota-sequoia",
    modelName: "Sequoia",
    year: 2025,
    generationCode: "XK80",
    generationLabel: "Third generation (XK80)",
    generationStartYear: 2023,
    bodyStyle: "SUV",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f88/Toyota-Sequoia-III-XK80.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-sequoia-iii-xk80-3.5-v6-i-force-max-437hp-hybrid-2wd-ect-i-46037",
    imageAlt: "2025 Toyota Sequoia SR5 exterior",
    epaId: "48553",
    engine: {
      slug: "toyota-v35a-fts-sequoia-hybrid",
      name: "3.4L V6 twin-turbo i-FORCE MAX hybrid",
      code: "V35A-FTS",
      fuelType: "HYBRID",
      displacementCc: 3445,
      cylinderCount: 6,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: "Full hybrid (i-FORCE MAX)",
    },
    transmission: {
      slug: "toyota-ect-i-10-sequoia",
      name: "10-speed ECT-i automatic",
      type: "AUTOMATIC",
      gearCount: 10,
    },
    dimensions: {
      // C&D / Toyota brochure family dims; SR5 4x2 curb from brochure
      lengthIn: 208.1,
      widthIn: 79.6,
      heightIn: 74.5,
      wheelbaseIn: 122.0,
      curbWeightKg: lbsToKg(5620),
      cargoVolumeLiters: cuFtToLiters(22.3),
      seatingCapacity: 8,
    },
    performance: {
      powerHp: 437,
      torqueLbFt: 583,
      // C&D Capstone instrumented family (same powertrain)
      zeroToSixtySeconds: 5.6,
    },
    // EPA id 48553 (2WD)
    fuelEconomy: { cityMpg: 21, highwayMpg: 24, combinedMpg: 22 },
    // Edmunds SR5 $62,425 excl. destination
    baseMsrpCents: 6_242_500,
    destinationCents: TOYOTA_DPH_CENTS.largePickupSuv,
    destinationSourceSlug: "cars-com-2025-toyota-sequoia-dph-1945",
    specSourceSlug: "caranddriver-2025-toyota-sequoia",
    priceSourceSlug: "edmunds-2025-toyota-sequoia-trims-price",
  },
  {
    slug: "2025-toyota-sequoia-capstone-us",
    name: "Sequoia Capstone",
    modelSlug: "toyota-sequoia",
    modelName: "Sequoia",
    year: 2025,
    generationCode: "XK80",
    generationLabel: "Third generation (XK80)",
    generationStartYear: 2023,
    bodyStyle: "SUV",
    drivetrain: "FOUR_WD",
    imageUrl: "https://www.auto-data.net/images/f120/Toyota-Sequoia-III-XK80_2.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-sequoia-iii-xk80-3.5-v6-i-force-max-437hp-hybrid-2wd-ect-i-46037",
    imageAlt: "2025 Toyota Sequoia Capstone exterior",
    epaId: "48575",
    engine: {
      slug: "toyota-v35a-fts-sequoia-hybrid",
      name: "3.4L V6 twin-turbo i-FORCE MAX hybrid",
      code: "V35A-FTS",
      fuelType: "HYBRID",
      displacementCc: 3445,
      cylinderCount: 6,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: "Full hybrid (i-FORCE MAX)",
    },
    transmission: {
      slug: "toyota-ect-i-10-sequoia",
      name: "10-speed ECT-i automatic",
      type: "AUTOMATIC",
      gearCount: 10,
    },
    dimensions: {
      // Edmunds Capstone 4WD
      lengthIn: 208.1,
      widthIn: 79.6,
      heightIn: 74.5,
      wheelbaseIn: 122.0,
      curbWeightKg: lbsToKg(6185),
      cargoVolumeLiters: cuFtToLiters(22.3),
      seatingCapacity: 7,
    },
    performance: {
      powerHp: 437,
      torqueLbFt: 583,
      // C&D instrumented Capstone
      zeroToSixtySeconds: 5.6,
    },
    // EPA id 48575 (4WD)
    fuelEconomy: { cityMpg: 19, highwayMpg: 22, combinedMpg: 20 },
    // Edmunds Capstone $83,915 excl. destination
    baseMsrpCents: 8_391_500,
    destinationCents: TOYOTA_DPH_CENTS.largePickupSuv,
    destinationSourceSlug: "cars-com-2025-toyota-sequoia-dph-1945",
    specSourceSlug: "edmunds-2025-toyota-sequoia-capstone",
    priceSourceSlug: "edmunds-2025-toyota-sequoia-trims-price",
  },
  {
    slug: "2025-toyota-land-cruiser-1958-us",
    name: "Land Cruiser 1958",
    modelSlug: "toyota-land-cruiser",
    modelName: "Land Cruiser",
    year: 2025,
    generationCode: "J250",
    generationLabel: "250 Series (J250)",
    generationStartYear: 2024,
    bodyStyle: "SUV",
    drivetrain: "FOUR_WD",
    imageUrl: "https://www.auto-data.net/images/f108/Toyota-Land-Cruiser-J25.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-land-cruiser-j250-2.4-i-force-max-326hp-full-hybrid-4wd-ect-i-51279",
    imageAlt: "2025 Toyota Land Cruiser 1958 exterior",
    epaId: "48977",
    engine: {
      slug: "toyota-t24a-fts-hybrid-max-326",
      name: "2.4L Inline-4 turbo i-FORCE MAX hybrid",
      code: "T24A-FTS-MAX-326",
      fuelType: "HYBRID",
      displacementCc: 2393,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: "Full hybrid (i-FORCE MAX)",
    },
    transmission: {
      slug: "toyota-ect-i-8-land-cruiser",
      name: "8-speed ECT-i automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // Edmunds Land Cruiser / 1958
      lengthIn: 196.4,
      widthIn: 77.9,
      heightIn: 75.7,
      wheelbaseIn: 112.2,
      curbWeightKg: lbsToKg(5360),
      cargoVolumeLiters: cuFtToLiters(46.2),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 326,
      torqueLbFt: 465,
      // MotorTrend 1958 instrumented
      zeroToSixtySeconds: 8.1,
    },
    // EPA id 48977
    fuelEconomy: { cityMpg: 22, highwayMpg: 25, combinedMpg: 23 },
    // Edmunds 1958 $56,700 excl. destination
    baseMsrpCents: 5_670_000,
    destinationCents: TOYOTA_DPH_CENTS.midSuvVan,
    destinationSourceSlug: "toyota-pressroom-2025-4runner-dph-1450",
    specSourceSlug: "motortrend-2025-toyota-land-cruiser-1958",
    priceSourceSlug: "edmunds-2025-toyota-land-cruiser-price",
  },
  {
    slug: "2025-toyota-land-cruiser-us",
    name: "Land Cruiser",
    modelSlug: "toyota-land-cruiser",
    modelName: "Land Cruiser",
    year: 2025,
    generationCode: "J250",
    generationLabel: "250 Series (J250)",
    generationStartYear: 2024,
    bodyStyle: "SUV",
    drivetrain: "FOUR_WD",
    imageUrl: "https://www.auto-data.net/images/f41/Toyota-Land-Cruiser-J250.jpg",
    imagePageUrl: "https://www.auto-data.net/en/toyota-land-cruiser-j250-generation-9905",
    imageAlt: "2025 Toyota Land Cruiser exterior",
    epaId: "48977",
    engine: {
      slug: "toyota-t24a-fts-hybrid-max-326",
      name: "2.4L Inline-4 turbo i-FORCE MAX hybrid",
      code: "T24A-FTS-MAX-326",
      fuelType: "HYBRID",
      displacementCc: 2393,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: "Full hybrid (i-FORCE MAX)",
    },
    transmission: {
      slug: "toyota-ect-i-8-land-cruiser",
      name: "8-speed ECT-i automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // Edmunds / KBB Land Cruiser trim (slightly heavier)
      lengthIn: 196.4,
      widthIn: 77.9,
      heightIn: 76.1,
      wheelbaseIn: 112.2,
      curbWeightKg: lbsToKg(5445),
      cargoVolumeLiters: cuFtToLiters(46.2),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 326,
      torqueLbFt: 465,
      // Same powertrain as 1958; MotorTrend family ~8.1
      zeroToSixtySeconds: 8.1,
    },
    // EPA id 48977
    fuelEconomy: { cityMpg: 22, highwayMpg: 25, combinedMpg: 23 },
    // Edmunds Land Cruiser trim $61,470 excl. destination
    baseMsrpCents: 6_147_000,
    destinationCents: TOYOTA_DPH_CENTS.midSuvVan,
    destinationSourceSlug: "toyota-pressroom-2025-4runner-dph-1450",
    specSourceSlug: "edmunds-2025-toyota-land-cruiser",
    priceSourceSlug: "edmunds-2025-toyota-land-cruiser-price",
  },
];

const STATIC_SKIPPED = [
  "Highlander Hybrid LE: discontinued for MY2025 (gas LE + Hybrid XLE seeded)",
  "4Runner TRD Pro: Trailhunter seeded as MY2025 hybrid flagship peer (same MSRP band)",
  "Sequoia Platinum Hybrid: Capstone seeded as top luxury hybrid peer",
  "Land Cruiser 200-series (2015–2021): optional late year skipped — incomplete unique exterior + full US MY pack in this pass",
  "Pre-2025 mid/large SUV years: module focuses on fully sourceable MY2025 US trims",
];

const MODEL_DEFS: { slug: ModelSlug; name: ModelName }[] = [
  { slug: "toyota-highlander", name: "Highlander" },
  { slug: "toyota-grand-highlander", name: "Grand Highlander" },
  { slug: "toyota-4runner", name: "4Runner" },
  { slug: "toyota-sequoia", name: "Sequoia" },
  { slug: "toyota-land-cruiser", name: "Land Cruiser" },
];

export async function seedToyotaSuvLarge(
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

  const destinationSources = new Map<string, { id: string }>();
  for (const sourceData of DESTINATION_SOURCES) {
    const source = await upsertCatalogueSource(prisma, {
      slug: sourceData.slug,
      title: sourceData.title,
      publisher: sourceData.publisher,
      url: sourceData.url,
      type: sourceData.type,
    });
    destinationSources.set(sourceData.slug, source);
  }

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

      const engine = await ensureToyotaEngine(prisma, {
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
      const destinationSource = destinationSources.get(trim.destinationSourceSlug);
      if (!destinationSource) {
        throw new Error(`Missing destination source ${trim.destinationSourceSlug}`);
      }

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-2025-${trim.slug}`,
        title: `EPA Fuel Economy — 2025 Toyota ${trim.name}`,
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
          description: `2025 Toyota ${trim.name} SUV (US).`,
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
          description: `2025 Toyota ${trim.name} SUV (US).`,
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
          `Delivery, processing and handling $${(trim.destinationCents / 100).toFixed(0)}`,
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
