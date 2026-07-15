/**
 * Toyota sedans & hatchbacks seed module (US market).
 * Corolla LE + Hybrid LE, Corolla Hatchback XSE, GR Corolla Core, Camry LE +
 * XSE Hybrid, Avalon Hybrid Limited (final MY2022), Prius LE + Limited,
 * Prius Plug-in Hybrid XSE, Mirai XLE, Yaris hatch/sedan LE (final), Yaris iA
 * (2017). Prefer unique auto-data.net exteriors. Idempotent — safe to re-run.
 * Does not wire itself into prisma/seed.ts.
 *
 * Exterior images (unique):
 * - https://www.auto-data.net/images/f45/Toyota-Corolla-XII-E210-facelift-2022.jpg
 * - https://www.auto-data.net/images/f101/Toyota-Corolla-XII-E210-facelift-2022.jpg
 * - https://www.auto-data.net/images/f101/Toyota-Corolla-Hatchback-XII-E210.jpg
 * - https://www.auto-data.net/images/f63/Toyota-Corolla-Hatchback-XII-E210-facelift-2022_4.jpg
 * - https://www.auto-data.net/images/f77/Toyota-Camry-IX-XV80.jpg
 * - https://www.auto-data.net/images/f45/Toyota-Camry-IX-XV80.jpg
 * - https://www.auto-data.net/images/f30/toyota-avalon-v-xx50.jpg
 * - https://www.auto-data.net/images/f118/Toyota-Prius-V-XW60.jpg
 * - https://www.auto-data.net/images/f120/Toyota-Prius-V-XW60.jpg
 * - https://www.auto-data.net/images/f119/Toyota-Prius-V-XW60.jpg
 * - https://www.auto-data.net/images/f34/Toyota-Mirai-II.jpg
 * - https://www.auto-data.net/images/f35/Mazda-2-III-DJ-facelift-2019.jpg
 * - https://www.auto-data.net/images/f35/Mazda-2-III-DJ-facelift-2019_1.jpg
 * - https://www.auto-data.net/images/f101/Mazda-2-III-DJ-facelift-2019.jpg
 */
import type { Drivetrain, FuelType } from "../../src/generated/prisma/client";
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
  | "toyota-corolla"
  | "toyota-corolla-hatchback"
  | "toyota-gr-corolla"
  | "toyota-camry"
  | "toyota-avalon"
  | "toyota-prius"
  | "toyota-prius-prime"
  | "toyota-mirai"
  | "toyota-yaris"
  | "toyota-yaris-ia"
  | "toyota-yaris-sedan";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: string;
  year: number;
  generationCode: string;
  generationLabel: string;
  generationStartYear: number;
  bodyStyle: "SEDAN" | "HATCHBACK";
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
    displacementCc?: number | null;
    cylinderCount?: number | null;
    configuration: string;
    induction?: string | null;
    electrification: string | null;
  };
  transmission: {
    slug: string;
    name: string;
    type: "AUTOMATIC" | "CVT" | "MANUAL";
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
  destinationCents: number;
  specSourceSlug: string;
  priceSourceSlug: string;
};

const SPEC_SOURCES = [
  {
    slug: "edmunds-2025-toyota-corolla-le",
    title: "2025 Toyota Corolla LE Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/corolla/2025/st-402019698/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2025-toyota-corolla",
    title: "2025 Toyota Corolla Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/corolla-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "toyota-pressroom-2025-corolla-hybrid",
    title:
      "Take on the Day Efficiently in the 2025 Toyota Corolla Hybrid (Toyota USA Newsroom)",
    url: "https://pressroom.toyota.com/take-on-the-day-efficiently-in-the-2025-toyota-corolla-hybrid/",
    publisher: "Toyota USA Newsroom",
  },
  {
    slug: "edmunds-2025-toyota-corolla-hybrid-le",
    title: "2025 Toyota Corolla Hybrid LE Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/corolla-hybrid/2025/st-402032598/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-corolla-hatchback-xse",
    title: "2025 Toyota Corolla Hatchback XSE Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/corolla-hatchback/2025/st-402035380/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "toyota-pressroom-2025-gr-corolla",
    title:
      "Ready to Hit the Streets: The 2025 Toyota GR Corolla (Toyota USA Newsroom)",
    url: "https://pressroom.toyota.com/ready-to-hit-the-streets-the-2025-toyota-gr-corolla-adds-new-direct-automatic-transmission-option-and-more/",
    publisher: "Toyota USA Newsroom",
  },
  {
    slug: "edmunds-2025-toyota-gr-corolla-core",
    title: "2025 Toyota GR Corolla Core Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/gr-corolla/2025/st-402037058/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "toyota-brochure-2025-camry",
    title: "2025 Toyota Camry eBrochure (Toyota)",
    url: "https://www.toyota.com/content/dam/toyota/brochures/pdf/2025/camry_ebrochure.pdf",
    publisher: "Toyota Motor Sales, U.S.A.",
  },
  {
    slug: "edmunds-2025-toyota-camry-le",
    title: "2025 Toyota Camry LE Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/camry/2025/st-402017592/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2022-toyota-avalon-hybrid",
    title: "2022 Toyota Avalon Hybrid Review (Edmunds)",
    url: "https://www.edmunds.com/toyota/avalon-hybrid/2022/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2022-toyota-avalon",
    title: "2022 Toyota Avalon Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/avalon",
    publisher: "Car and Driver",
  },
  {
    slug: "edmunds-2025-toyota-prius-le",
    title: "2025 Toyota Prius LE Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/prius/2025/st-402026052/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-prius-limited",
    title: "2025 Toyota Prius Limited Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/prius/2025/st-402062287/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-prius-phev-xse",
    title: "2025 Toyota Prius Plug-In Hybrid XSE Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/prius-plug-in-hybrid/2025/st-402063380/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "toyota-pressroom-2025-mirai",
    title:
      "Innovative and Cutting-Edge: The Toyota Mirai Streamlines for MY2025 (Toyota USA Newsroom)",
    url: "https://pressroom.toyota.com/innovative-and-cutting-edge-the-toyota-mirai-streamlines-for-my2025/",
    publisher: "Toyota USA Newsroom",
  },
  {
    slug: "edmunds-2025-toyota-mirai",
    title: "2025 Toyota Mirai Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/mirai/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2020-toyota-yaris",
    title: "2020 Toyota Yaris Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/yaris",
    publisher: "Car and Driver",
  },
  {
    slug: "edmunds-2020-toyota-yaris-sedan",
    title: "2020 Toyota Yaris Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/yaris/2020/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2020-toyota-yaris-hatchback",
    title: "2020 Toyota Yaris Hatchback Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/yaris-hatchback/2020/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2017-toyota-yaris-ia",
    title: "2017 Toyota Yaris iA Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/yaris-ia/2017/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "jdpower-2020-toyota-yaris-hatch-le",
    title: "2020 Toyota Yaris Hatchback 5D LE Specs (J.D. Power)",
    url: "https://www.jdpower.com/cars/2020/toyota/yaris/hatchback-5d-le/specs",
    publisher: "J.D. Power",
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "edmunds-2025-toyota-corolla-price",
    title:
      "2025 Toyota Corolla Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/corolla/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "toyota-pressroom-2025-corolla-hybrid-msrp",
    title:
      "2025 Toyota Corolla Hybrid LE MSRP $23,825 excl. $1,135 DPH (Toyota USA Newsroom)",
    url: "https://pressroom.toyota.com/take-on-the-day-efficiently-in-the-2025-toyota-corolla-hybrid/",
    publisher: "Toyota USA Newsroom",
  },
  {
    slug: "edmunds-2025-toyota-corolla-hatchback-price",
    title:
      "2025 Toyota Corolla Hatchback XSE Specs (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/corolla-hatchback/2025/st-402035380/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "toyota-pressroom-2025-gr-corolla-msrp",
    title:
      "2025 Toyota GR Corolla starting MSRP $38,860 excl. $1,135 DPH (Toyota USA Newsroom)",
    url: "https://pressroom.toyota.com/ready-to-hit-the-streets-the-2025-toyota-gr-corolla-adds-new-direct-automatic-transmission-option-and-more/",
    publisher: "Toyota USA Newsroom",
  },
  {
    slug: "edmunds-2025-toyota-camry-price",
    title:
      "2025 Toyota Camry Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/camry/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "epa-2022-toyota-avalon-hybrid-msrp",
    title: "2022 Toyota Avalon Hybrid MSRP range (EPA / fueleconomy.gov)",
    url: "https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=44381",
    publisher: "U.S. EPA",
  },
  {
    slug: "edmunds-2025-toyota-prius-price",
    title:
      "2025 Toyota Prius Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/prius/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-prius-phev-price",
    title:
      "2025 Toyota Prius Plug-In Hybrid XSE Specs (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/prius-plug-in-hybrid/2025/st-402063380/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "toyota-pressroom-2025-mirai-msrp",
    title:
      "2025 Toyota Mirai XLE MSRP $51,795 excl. destination (Toyota USA Newsroom)",
    url: "https://pressroom.toyota.com/innovative-and-cutting-edge-the-toyota-mirai-streamlines-for-my2025/",
    publisher: "Toyota USA Newsroom",
  },
  {
    slug: "cargurus-2020-toyota-yaris-msrp",
    title: "2020 Toyota Yaris original MSRP by trim (CarGurus)",
    url: "https://www.cargurus.com/research/2020-Toyota-Yaris-c29170",
    publisher: "CarGurus",
  },
  {
    slug: "edmunds-2017-toyota-yaris-ia-price",
    title:
      "2017 Toyota Yaris iA Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/yaris-ia/2017/features-specs/",
    publisher: "Edmunds",
  },
] as const;

const DESTINATION_SOURCE_DPH = {
  slug: "toyota-us-dph-aug-2024-passenger-car",
  title:
    "Toyota USA Delivery, Processing & Handling — passenger cars $1,135 (Aug 2024+)",
  url: "https://www.toyota.com/",
  type: "MANUFACTURER" as const,
  publisher: "Toyota Motor Sales, U.S.A.",
};

/**
 * Representative US trims only. EPA ids from fueleconomy.gov REST menu/options
 * and Find.do SBS pages. MSRP excludes destination unless noted in source.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2025-toyota-corolla-le-us",
    name: "Corolla LE",
    modelSlug: "toyota-corolla",
    modelName: "Corolla",
    year: 2025,
    generationCode: "E210",
    generationLabel: "Twelfth generation (E210) US facelift",
    generationStartYear: 2019,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f45/Toyota-Corolla-XII-E210-facelift-2022.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-corolla-xii-e210-facelift-2022-generation-8376",
    imageAlt: "2025 Toyota Corolla LE sedan exterior",
    epaId: "48493",
    engine: {
      slug: "toyota-m20a-fks-169",
      name: "2.0L Inline-4 (M20A-FKS)",
      code: "M20A-FKS",
      fuelType: "PETROL",
      displacementCc: 1987,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "toyota-direct-shift-cvt",
      name: "Dynamic-Shift CVT",
      type: "CVT",
      gearCount: 10,
    },
    dimensions: {
      // Edmunds Corolla LE
      lengthIn: 182.5,
      widthIn: 70.1,
      heightIn: 56.5,
      wheelbaseIn: 106.3,
      curbWeightKg: lbsToKg(2955),
      cargoVolumeLiters: cuFtToLiters(13.1),
      seatingCapacity: 5,
    },
    performance: {
      // HP/torque Edmunds; 0–60 Autoblog ~9 sec
      powerHp: 169,
      torqueLbFt: 151,
      zeroToSixtySeconds: 9.0,
    },
    // EPA id 48493 — 32/41/35 LE
    fuelEconomy: { cityMpg: 32, highwayMpg: 41, combinedMpg: 35 },
    // Dealer comparison / Toyota LE starting $22,325 excl. destination
    baseMsrpCents: 2_232_500,
    destinationCents: TOYOTA_DPH_CENTS.passengerCar,
    specSourceSlug: "edmunds-2025-toyota-corolla-le",
    priceSourceSlug: "edmunds-2025-toyota-corolla-price",
  },
  {
    slug: "2025-toyota-corolla-hybrid-le-us",
    name: "Corolla Hybrid LE",
    modelSlug: "toyota-corolla",
    modelName: "Corolla",
    year: 2025,
    generationCode: "E210",
    generationLabel: "Twelfth generation (E210) US facelift",
    generationStartYear: 2019,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f101/Toyota-Corolla-XII-E210-facelift-2022.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-corolla-xii-e210-facelift-2022-generation-8376",
    imageAlt: "2025 Toyota Corolla Hybrid LE sedan exterior",
    epaId: "49139",
    engine: {
      slug: "toyota-2zr-fxe-138",
      name: "1.8L Inline-4 hybrid (2ZR-FXE)",
      code: "2ZR-FXE",
      fuelType: "HYBRID",
      displacementCc: 1798,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "Toyota Hybrid System (5th gen)",
    },
    transmission: {
      slug: "toyota-ecvt-planetary",
      name: "Electronically controlled CVT (eCVT)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Edmunds Hybrid LE
      lengthIn: 182.5,
      widthIn: 70.1,
      heightIn: 56.5,
      wheelbaseIn: 106.3,
      curbWeightKg: lbsToKg(2850),
      cargoVolumeLiters: cuFtToLiters(13.1),
      seatingCapacity: 5,
    },
    performance: {
      // Toyota pressroom net hp/torque; 0–60 C&D AWD hybrid test 9.0
      powerHp: 138,
      torqueLbFt: 105,
      zeroToSixtySeconds: 9.0,
    },
    // EPA id 49139 — 53/46/50 Hybrid LE FWD
    fuelEconomy: { cityMpg: 53, highwayMpg: 46, combinedMpg: 50 },
    // Toyota pressroom $23,825 excl. $1,135 DPH
    baseMsrpCents: 2_382_500,
    destinationCents: TOYOTA_DPH_CENTS.passengerCar,
    specSourceSlug: "toyota-pressroom-2025-corolla-hybrid",
    priceSourceSlug: "toyota-pressroom-2025-corolla-hybrid-msrp",
  },
  {
    slug: "2025-toyota-corolla-hatchback-xse-us",
    name: "Corolla Hatchback XSE",
    modelSlug: "toyota-corolla-hatchback",
    modelName: "Corolla Hatchback",
    year: 2025,
    generationCode: "E210-HB",
    generationLabel: "Twelfth generation hatchback (E210)",
    generationStartYear: 2019,
    bodyStyle: "HATCHBACK",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f101/Toyota-Corolla-Hatchback-XII-E210.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-corolla-hatchback-xii-e210-generation-6487",
    imageAlt: "2025 Toyota Corolla Hatchback XSE exterior",
    epaId: "47997",
    engine: {
      slug: "toyota-m20a-fks-169",
      name: "2.0L Inline-4 (M20A-FKS)",
      code: "M20A-FKS",
      fuelType: "PETROL",
      displacementCc: 1987,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "toyota-direct-shift-cvt",
      name: "Dynamic-Shift CVT (AV-S10)",
      type: "CVT",
      gearCount: 10,
    },
    dimensions: {
      // Edmunds Hatchback XSE
      lengthIn: 172.0,
      widthIn: 70.5,
      heightIn: 57.1,
      wheelbaseIn: 103.9,
      curbWeightKg: lbsToKg(3150),
      cargoVolumeLiters: cuFtToLiters(17.8),
      seatingCapacity: 5,
    },
    performance: {
      // HP/torque Edmunds; 0–60 C&D hatchback test 8.3
      powerHp: 169,
      torqueLbFt: 151,
      zeroToSixtySeconds: 8.3,
    },
    // EPA id 47997 — 30/38/33
    fuelEconomy: { cityMpg: 30, highwayMpg: 38, combinedMpg: 33 },
    // Edmunds / EPA MSRP $27,080
    baseMsrpCents: 2_708_000,
    destinationCents: TOYOTA_DPH_CENTS.passengerCar,
    specSourceSlug: "edmunds-2025-toyota-corolla-hatchback-xse",
    priceSourceSlug: "edmunds-2025-toyota-corolla-hatchback-price",
  },
  {
    slug: "2025-toyota-gr-corolla-core-us",
    name: "GR Corolla Core",
    modelSlug: "toyota-gr-corolla",
    modelName: "GR Corolla",
    year: 2025,
    generationCode: "E210-GR",
    generationLabel: "GR Corolla (E210-based)",
    generationStartYear: 2023,
    bodyStyle: "HATCHBACK",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f63/Toyota-Corolla-Hatchback-XII-E210-facelift-2022_4.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-corolla-hatchback-xii-e210-facelift-2022-gr-1.6-300hp-gr-four-imt-53018",
    imageAlt: "2025 Toyota GR Corolla Core hatchback exterior",
    epaId: "48596",
    engine: {
      slug: "toyota-g16e-gts-300",
      name: "1.6L Inline-3 turbo (G16E-GTS)",
      code: "G16E-GTS",
      fuelType: "PETROL",
      displacementCc: 1618,
      cylinderCount: 3,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "toyota-gr-imt-6",
      name: "6-speed iMT manual",
      type: "MANUAL",
      gearCount: 6,
    },
    dimensions: {
      // Edmunds / CarBuzz Core
      lengthIn: 173.6,
      widthIn: 72.8,
      heightIn: 57.2,
      wheelbaseIn: 103.9,
      curbWeightKg: lbsToKg(3274),
      cargoVolumeLiters: cuFtToLiters(17.8),
      seatingCapacity: 5,
    },
    performance: {
      // Toyota pressroom 300 hp / 295 lb-ft; Edmunds mfr 0–60 5.0
      powerHp: 300,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.0,
    },
    // EPA id 48596 — Manual 21/28/24
    fuelEconomy: { cityMpg: 21, highwayMpg: 28, combinedMpg: 24 },
    // Toyota pressroom $38,860 excl. $1,135 DPH
    baseMsrpCents: 3_886_000,
    destinationCents: TOYOTA_DPH_CENTS.passengerCar,
    specSourceSlug: "toyota-pressroom-2025-gr-corolla",
    priceSourceSlug: "toyota-pressroom-2025-gr-corolla-msrp",
  },
  {
    slug: "2025-toyota-camry-le-us",
    name: "Camry LE",
    modelSlug: "toyota-camry",
    modelName: "Camry",
    year: 2025,
    generationCode: "XV80",
    generationLabel: "Ninth generation (XV80) hybrid",
    generationStartYear: 2024,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f77/Toyota-Camry-IX-XV80.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-camry-ix-xv80-generation-9999",
    imageAlt: "2025 Toyota Camry LE hybrid sedan exterior",
    epaId: "48032",
    engine: {
      slug: "toyota-a25a-fxs-225",
      name: "2.5L Inline-4 hybrid (A25A-FXS)",
      code: "A25A-FXS",
      fuelType: "HYBRID",
      displacementCc: 2487,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "Toyota Hybrid System (5th gen; 225 hp combined FWD)",
    },
    transmission: {
      slug: "toyota-ecvt-avs6",
      name: "Electronically controlled CVT (AV-S6)",
      type: "CVT",
      gearCount: 6,
    },
    dimensions: {
      // Toyota 2025 Camry eBrochure / Edmunds LE FWD
      lengthIn: 193.5,
      widthIn: 72.4,
      heightIn: 56.9,
      wheelbaseIn: 111.2,
      frontTrackIn: 63.0,
      rearTrackIn: 63.7,
      curbWeightKg: lbsToKg(3450),
      cargoVolumeLiters: cuFtToLiters(15.1),
      seatingCapacity: 5,
    },
    performance: {
      // Brochure 225 net hp / 163 lb-ft ICE; 0–60 ~7.5 prior-gen Camry Hybrid (CarMax) — new-gen FWD similar band
      powerHp: 225,
      torqueLbFt: 163,
      zeroToSixtySeconds: 7.5,
    },
    // EPA id 48032 — 53/50/51 LE FWD
    fuelEconomy: { cityMpg: 53, highwayMpg: 50, combinedMpg: 51 },
    // Edmunds LE $28,700
    baseMsrpCents: 2_870_000,
    destinationCents: TOYOTA_DPH_CENTS.passengerCar,
    specSourceSlug: "toyota-brochure-2025-camry",
    priceSourceSlug: "edmunds-2025-toyota-camry-price",
  },
  {
    slug: "2025-toyota-camry-xse-hybrid-us",
    name: "Camry XSE",
    modelSlug: "toyota-camry",
    modelName: "Camry",
    year: 2025,
    generationCode: "XV80",
    generationLabel: "Ninth generation (XV80) hybrid",
    generationStartYear: 2024,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f45/Toyota-Camry-IX-XV80.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-camry-ix-xv80-generation-9999",
    imageAlt: "2025 Toyota Camry XSE hybrid sedan exterior",
    epaId: "48033",
    engine: {
      slug: "toyota-a25a-fxs-225",
      name: "2.5L Inline-4 hybrid (A25A-FXS)",
      code: "A25A-FXS",
      fuelType: "HYBRID",
      displacementCc: 2487,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "Toyota Hybrid System (5th gen; 225 hp combined FWD)",
    },
    transmission: {
      slug: "toyota-ecvt-avs6",
      name: "Electronically controlled CVT (AV-S6)",
      type: "CVT",
      gearCount: 6,
    },
    dimensions: {
      // Toyota brochure XSE FWD curb 3,538
      lengthIn: 193.5,
      widthIn: 72.4,
      heightIn: 56.9,
      wheelbaseIn: 111.2,
      frontTrackIn: 63.0,
      rearTrackIn: 63.7,
      curbWeightKg: lbsToKg(3538),
      cargoVolumeLiters: cuFtToLiters(15.1),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 225,
      torqueLbFt: 163,
      zeroToSixtySeconds: 7.5,
    },
    // EPA id 48033 — SE/XLE/XSE FWD 48/47/47
    fuelEconomy: { cityMpg: 48, highwayMpg: 47, combinedMpg: 47 },
    // Edmunds XSE FWD $34,900
    baseMsrpCents: 3_490_000,
    destinationCents: TOYOTA_DPH_CENTS.passengerCar,
    specSourceSlug: "toyota-brochure-2025-camry",
    priceSourceSlug: "edmunds-2025-toyota-camry-price",
  },
  {
    slug: "2022-toyota-avalon-hybrid-limited-us",
    name: "Avalon Hybrid Limited",
    modelSlug: "toyota-avalon",
    modelName: "Avalon",
    year: 2022,
    generationCode: "XX50",
    generationLabel: "Fifth generation (XX50)",
    generationStartYear: 2019,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f30/toyota-avalon-v-xx50.jpg",
    imagePageUrl: "https://www.auto-data.net/de/toyota-avalon-model-426",
    imageAlt: "2022 Toyota Avalon Hybrid Limited sedan exterior",
    epaId: "44381",
    engine: {
      slug: "toyota-a25a-fxs-215-avalon",
      name: "2.5L Inline-4 hybrid (A25A-FXS)",
      code: "A25A-FXS-215",
      fuelType: "HYBRID",
      displacementCc: 2487,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "Toyota Hybrid System II (215 hp combined)",
    },
    transmission: {
      slug: "toyota-ecvt-avs6",
      name: "Electronically controlled CVT (AV-S6)",
      type: "CVT",
      gearCount: 6,
    },
    dimensions: {
      // auto-data XX50 / Car and Driver family dims
      lengthIn: 195.9,
      widthIn: 72.8,
      heightIn: 56.5,
      wheelbaseIn: 113.0,
      curbWeightKg: lbsToKg(3640),
      cargoVolumeLiters: cuFtToLiters(16.0),
      seatingCapacity: 5,
    },
    performance: {
      // Cars.com / C&D 215 hp; Edmunds instrumented 0–60 8.2
      powerHp: 215,
      torqueLbFt: 163,
      zeroToSixtySeconds: 8.2,
    },
    // EPA id 44381 — 43/43/43
    fuelEconomy: { cityMpg: 43, highwayMpg: 43, combinedMpg: 43 },
    // EPA MSRP high end Hybrid Limited $44,150
    baseMsrpCents: 4_415_000,
    destinationCents: TOYOTA_DPH_CENTS.passengerCar,
    specSourceSlug: "edmunds-2022-toyota-avalon-hybrid",
    priceSourceSlug: "epa-2022-toyota-avalon-hybrid-msrp",
  },
  {
    slug: "2025-toyota-prius-le-us",
    name: "Prius LE",
    modelSlug: "toyota-prius",
    modelName: "Prius",
    year: 2025,
    generationCode: "XW60",
    generationLabel: "Fifth generation (XW60)",
    generationStartYear: 2023,
    bodyStyle: "HATCHBACK",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f118/Toyota-Prius-V-XW60.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-prius-v-xw60-generation-9123",
    imageAlt: "2025 Toyota Prius LE hatchback exterior",
    epaId: "48861",
    engine: {
      slug: "toyota-m20a-fxs-194",
      name: "2.0L Inline-4 hybrid (M20A-FXS)",
      code: "M20A-FXS",
      fuelType: "HYBRID",
      displacementCc: 1987,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "Toyota Hybrid System (5th gen; 194 hp combined FWD)",
    },
    transmission: {
      slug: "toyota-ecvt-planetary",
      name: "Electronically controlled CVT (eCVT)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Edmunds Prius LE
      lengthIn: 181.1,
      widthIn: 70.2,
      heightIn: 55.9,
      wheelbaseIn: 108.3,
      curbWeightKg: lbsToKg(3097),
      cargoVolumeLiters: cuFtToLiters(23.8),
      seatingCapacity: 5,
    },
    performance: {
      // Edmunds 194 hp; mfr 0–60 7.2
      powerHp: 194,
      torqueLbFt: 139,
      zeroToSixtySeconds: 7.2,
    },
    // EPA id 48861 — 57/56/57
    fuelEconomy: { cityMpg: 57, highwayMpg: 56, combinedMpg: 57 },
    // Edmunds LE $28,350
    baseMsrpCents: 2_835_000,
    destinationCents: TOYOTA_DPH_CENTS.passengerCar,
    specSourceSlug: "edmunds-2025-toyota-prius-le",
    priceSourceSlug: "edmunds-2025-toyota-prius-price",
  },
  {
    slug: "2025-toyota-prius-limited-us",
    name: "Prius Limited",
    modelSlug: "toyota-prius",
    modelName: "Prius",
    year: 2025,
    generationCode: "XW60",
    generationLabel: "Fifth generation (XW60)",
    generationStartYear: 2023,
    bodyStyle: "HATCHBACK",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f120/Toyota-Prius-V-XW60.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-prius-v-xw60-generation-9123",
    imageAlt: "2025 Toyota Prius Limited hatchback exterior",
    epaId: "48860",
    engine: {
      slug: "toyota-m20a-fxs-194",
      name: "2.0L Inline-4 hybrid (M20A-FXS)",
      code: "M20A-FXS",
      fuelType: "HYBRID",
      displacementCc: 1987,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "Toyota Hybrid System (5th gen; 194 hp combined FWD)",
    },
    transmission: {
      slug: "toyota-ecvt-planetary",
      name: "Electronically controlled CVT (eCVT)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Edmunds Limited FWD curb ~3,219 (trims comparison)
      lengthIn: 181.1,
      widthIn: 70.2,
      heightIn: 55.9,
      wheelbaseIn: 108.3,
      curbWeightKg: lbsToKg(3219),
      cargoVolumeLiters: cuFtToLiters(20.3),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 194,
      torqueLbFt: 139,
      zeroToSixtySeconds: 7.2,
    },
    // EPA id 48860 — XLE/LTD 52/52/52
    fuelEconomy: { cityMpg: 52, highwayMpg: 52, combinedMpg: 52 },
    // Edmunds Limited FWD $35,365
    baseMsrpCents: 3_536_500,
    destinationCents: TOYOTA_DPH_CENTS.passengerCar,
    specSourceSlug: "edmunds-2025-toyota-prius-limited",
    priceSourceSlug: "edmunds-2025-toyota-prius-price",
  },
  {
    slug: "2025-toyota-prius-prime-xse-us",
    name: "Prius Plug-in Hybrid XSE",
    modelSlug: "toyota-prius-prime",
    modelName: "Prius Prime",
    year: 2025,
    generationCode: "XW60-PHEV",
    generationLabel: "Fifth generation Plug-in Hybrid (XW60)",
    generationStartYear: 2023,
    bodyStyle: "HATCHBACK",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f119/Toyota-Prius-V-XW60.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-prius-v-xw60-generation-9123",
    imageAlt: "2025 Toyota Prius Plug-in Hybrid XSE exterior",
    epaId: "49014",
    engine: {
      slug: "toyota-m20a-fxs-phev-220",
      name: "2.0L Inline-4 plug-in hybrid (M20A-FXS)",
      code: "M20A-FXS-PHEV",
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 1987,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "PHEV (13.6 kWh; 220 hp combined)",
    },
    transmission: {
      slug: "toyota-ecvt-planetary",
      name: "Electronically controlled CVT (eCVT)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Same XW60 envelope as Prius; Edmunds PHEV XSE
      lengthIn: 181.1,
      widthIn: 70.2,
      heightIn: 56.3,
      wheelbaseIn: 108.3,
      curbWeightKg: lbsToKg(3516),
      cargoVolumeLiters: cuFtToLiters(20.3),
      seatingCapacity: 5,
    },
    performance: {
      // Edmunds 220 hp; Car Connection ~6.6
      powerHp: 220,
      torqueLbFt: 139,
      zeroToSixtySeconds: 6.6,
    },
    // EPA id 49014 — gas 50/47/48; EV range 40 mi
    fuelEconomy: {
      cityMpg: 50,
      highwayMpg: 47,
      combinedMpg: 48,
      electricRangeMiles: 40,
    },
    // Edmunds XSE $36,625
    baseMsrpCents: 3_662_500,
    destinationCents: TOYOTA_DPH_CENTS.passengerCar,
    specSourceSlug: "edmunds-2025-toyota-prius-phev-xse",
    priceSourceSlug: "edmunds-2025-toyota-prius-phev-price",
  },
  {
    slug: "2025-toyota-mirai-xle-us",
    name: "Mirai XLE",
    modelSlug: "toyota-mirai",
    modelName: "Mirai",
    year: 2025,
    generationCode: "JPD20",
    generationLabel: "Second generation (JPD20)",
    generationStartYear: 2021,
    bodyStyle: "SEDAN",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f34/Toyota-Mirai-II.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-mirai-ii-jpd20-generation-5564",
    imageAlt: "2025 Toyota Mirai XLE hydrogen fuel-cell sedan exterior",
    epaId: "49064",
    engine: {
      slug: "toyota-mirai-fc-stack",
      name: "Hydrogen fuel cell + electric motor",
      code: "FC-STACK-MIRAI-II",
      fuelType: "HYDROGEN",
      displacementCc: null,
      cylinderCount: null,
      configuration: "Fuel cell",
      induction: null,
      electrification: "FCEV / PEFC hydrogen fuel cell (182 hp)",
    },
    transmission: {
      slug: "toyota-fcv-single-speed",
      name: "Single-speed reduction gear",
      type: "AUTOMATIC",
      gearCount: 1,
    },
    dimensions: {
      // Edmunds Mirai
      lengthIn: 195.8,
      widthIn: 74.2,
      heightIn: 57.9,
      wheelbaseIn: 114.9,
      curbWeightKg: lbsToKg(4255),
      cargoVolumeLiters: cuFtToLiters(9.6),
      seatingCapacity: 5,
    },
    performance: {
      // Edmunds 182 hp / 221 lb-ft; mfr 0–60 9.2
      powerHp: 182,
      torqueLbFt: 221,
      zeroToSixtySeconds: 9.2,
    },
    // EPA id 49064 — 76/71/74 MPGe; range 402
    fuelEconomy: {
      cityMpg: 76,
      highwayMpg: 71,
      combinedMpg: 74,
      electricRangeMiles: 402,
    },
    // Toyota pressroom / EPA $51,795
    baseMsrpCents: 5_179_500,
    destinationCents: TOYOTA_DPH_CENTS.passengerCar,
    specSourceSlug: "edmunds-2025-toyota-mirai",
    priceSourceSlug: "toyota-pressroom-2025-mirai-msrp",
  },
  {
    slug: "2020-toyota-yaris-le-hatchback-us",
    name: "Yaris LE Hatchback",
    modelSlug: "toyota-yaris",
    modelName: "Yaris",
    year: 2020,
    generationCode: "DJ-HB",
    generationLabel: "Mazda2-based US hatchback (final)",
    generationStartYear: 2020,
    bodyStyle: "HATCHBACK",
    drivetrain: "FWD",
    // US Yaris hatch is Mazda2 DJ; auto-data hosts shared exterior shots
    imageUrl:
      "https://www.auto-data.net/images/f35/Mazda-2-III-DJ-facelift-2019.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/scion-ia-1.5-106hp-automatic-37885",
    imageAlt: "2020 Toyota Yaris LE hatchback exterior",
    epaId: "42000",
    engine: {
      slug: "toyota-yaris-p5-vps-106",
      name: "1.5L Inline-4 (Skyactiv-G / P5-VPS)",
      code: "P5-VPS",
      fuelType: "PETROL",
      displacementCc: 1496,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "toyota-yaris-6a",
      name: "6-speed automatic",
      type: "AUTOMATIC",
      gearCount: 6,
    },
    dimensions: {
      // J.D. Power / C&D Yaris hatch LE
      lengthIn: 161.6,
      widthIn: 66.7,
      heightIn: 58.9,
      wheelbaseIn: 101.2,
      curbWeightKg: lbsToKg(2396),
      cargoVolumeLiters: cuFtToLiters(15.9),
      seatingCapacity: 5,
    },
    performance: {
      // C&D / Toyota press 106 hp / 103 lb-ft; ~9.0 family 0–60
      powerHp: 106,
      torqueLbFt: 103,
      zeroToSixtySeconds: 9.0,
    },
    // EPA id 42000 — 32/40/35 Auto
    fuelEconomy: { cityMpg: 32, highwayMpg: 40, combinedMpg: 35 },
    // CarGurus / Cars.com LE hatch $17,750
    baseMsrpCents: 1_775_000,
    destinationCents: TOYOTA_DPH_CENTS.passengerCar,
    specSourceSlug: "jdpower-2020-toyota-yaris-hatch-le",
    priceSourceSlug: "cargurus-2020-toyota-yaris-msrp",
  },
  {
    slug: "2017-toyota-yaris-ia-us",
    name: "Yaris iA",
    modelSlug: "toyota-yaris-ia",
    modelName: "Yaris iA",
    year: 2017,
    generationCode: "DJ-IA",
    generationLabel: "Mazda2-based sedan (iA)",
    generationStartYear: 2017,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f35/Mazda-2-III-DJ-facelift-2019_1.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/scion-ia-1.5-106hp-automatic-37885",
    imageAlt: "2017 Toyota Yaris iA sedan exterior",
    epaId: "37885",
    engine: {
      slug: "toyota-yaris-p5-vps-106",
      name: "1.5L Inline-4 (Skyactiv-G / P5-VPS)",
      code: "P5-VPS",
      fuelType: "PETROL",
      displacementCc: 1496,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "toyota-yaris-6a",
      name: "6-speed automatic",
      type: "AUTOMATIC",
      gearCount: 6,
    },
    dimensions: {
      // Edmunds / NHTSA product specs
      lengthIn: 171.7,
      widthIn: 66.7,
      heightIn: 58.5,
      wheelbaseIn: 101.2,
      frontTrackIn: 58.9,
      rearTrackIn: 58.5,
      curbWeightKg: lbsToKg(2416),
      cargoVolumeLiters: cuFtToLiters(13.5),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 106,
      torqueLbFt: 103,
      zeroToSixtySeconds: 9.6,
    },
    // EPA id 37885 — 32/40/35 (Auto)
    fuelEconomy: { cityMpg: 32, highwayMpg: 40, combinedMpg: 35 },
    // Edmunds Auto $17,050; guidance base sedan — use Auto as representative
    baseMsrpCents: 1_705_000,
    destinationCents: TOYOTA_DPH_CENTS.passengerCar,
    specSourceSlug: "edmunds-2017-toyota-yaris-ia",
    priceSourceSlug: "edmunds-2017-toyota-yaris-ia-price",
  },
  {
    slug: "2020-toyota-yaris-sedan-le-us",
    name: "Yaris Sedan LE",
    modelSlug: "toyota-yaris-sedan",
    modelName: "Yaris Sedan",
    year: 2020,
    generationCode: "DJ-SDN",
    generationLabel: "Mazda2-based US sedan (final)",
    generationStartYear: 2018,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f101/Mazda-2-III-DJ-facelift-2019.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/scion-ia-1.5-106hp-automatic-37885",
    imageAlt: "2020 Toyota Yaris Sedan LE exterior",
    epaId: "42000",
    engine: {
      slug: "toyota-yaris-p5-vps-106",
      name: "1.5L Inline-4 (Skyactiv-G / P5-VPS)",
      code: "P5-VPS",
      fuelType: "PETROL",
      displacementCc: 1496,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "toyota-yaris-6a",
      name: "6-speed automatic",
      type: "AUTOMATIC",
      gearCount: 6,
    },
    dimensions: {
      // Edmunds 2020 Yaris sedan
      lengthIn: 171.2,
      widthIn: 66.7,
      heightIn: 58.5,
      wheelbaseIn: 101.2,
      curbWeightKg: lbsToKg(2447),
      cargoVolumeLiters: cuFtToLiters(13.5),
      seatingCapacity: 5,
    },
    performance: {
      // C&D XLE sedan test 9.6
      powerHp: 106,
      torqueLbFt: 103,
      zeroToSixtySeconds: 9.6,
    },
    // Same EPA powertrain as hatch Auto
    fuelEconomy: { cityMpg: 32, highwayMpg: 40, combinedMpg: 35 },
    // CarGurus LE Sedan Auto $17,750 (LE 6A most popular)
    baseMsrpCents: 1_775_000,
    destinationCents: TOYOTA_DPH_CENTS.passengerCar,
    specSourceSlug: "edmunds-2020-toyota-yaris-sedan",
    priceSourceSlug: "cargurus-2020-toyota-yaris-msrp",
  },
];

const STATIC_SKIPPED = [
  "2025 Camry gas LE: MY2025 Camry is hybrid-only — seeded LE Hybrid + XSE Hybrid",
  "2025 Prius XSE: XSE not offered on non-PHEV Prius — seeded Limited as upper trim; XSE on Plug-in",
  "2025 GR Corolla Circuit: Circuit discontinued for MY2025 (Premium Plus replaces) — seeded Core",
  "2025 Mirai Limited: Limited discontinued MY2025 mono-grade — seeded XLE only",
  "Corolla SE/XSE / Hybrid SE–XLE: out of LE + Hybrid LE representative scope",
  "Camry SE/XLE/AWD variants: LE + XSE FWD cover new-gen hybrid powertrains",
  "Prius Prime SE: XSE seeded as notable PHEV upper trim",
  "Avalon Touring (gas V6) final year: Hybrid Limited seeded as last-year hybrid flagship",
];

const MODEL_DEFS: { slug: ModelSlug; name: string }[] = [
  { slug: "toyota-corolla", name: "Corolla" },
  { slug: "toyota-corolla-hatchback", name: "Corolla Hatchback" },
  { slug: "toyota-gr-corolla", name: "GR Corolla" },
  { slug: "toyota-camry", name: "Camry" },
  { slug: "toyota-avalon", name: "Avalon" },
  { slug: "toyota-prius", name: "Prius" },
  { slug: "toyota-prius-prime", name: "Prius Prime" },
  { slug: "toyota-mirai", name: "Mirai" },
  { slug: "toyota-yaris", name: "Yaris" },
  { slug: "toyota-yaris-ia", name: "Yaris iA" },
  { slug: "toyota-yaris-sedan", name: "Yaris Sedan" },
];

export async function seedToyotaSedans(
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
    slug: DESTINATION_SOURCE_DPH.slug,
    title: DESTINATION_SOURCE_DPH.title,
    publisher: DESTINATION_SOURCE_DPH.publisher,
    url: DESTINATION_SOURCE_DPH.url,
    type: DESTINATION_SOURCE_DPH.type,
  });

  const specSources = new Map<string, { id: string }>();
  for (const sourceData of SPEC_SOURCES) {
    const source = await upsertCatalogueSource(prisma, {
      slug: sourceData.slug,
      title: sourceData.title,
      publisher: sourceData.publisher,
      url: sourceData.url,
      type: sourceData.slug.startsWith("toyota-pressroom") ||
        sourceData.slug.startsWith("toyota-brochure")
        ? sourceData.slug.startsWith("toyota-brochure")
          ? "MANUFACTURER"
          : "PRESS_RELEASE"
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
      type: sourceData.slug.startsWith("toyota-pressroom")
        ? "PRESS_RELEASE"
        : sourceData.slug.startsWith("epa-")
          ? "GOVERNMENT"
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

      const engine = await ensureToyotaEngine(prisma, {
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
        title: `EPA Fuel Economy — ${trim.year} Toyota ${trim.name}`,
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
          description: `${trim.year} Toyota ${trim.name} (US).`,
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
          description: `${trim.year} Toyota ${trim.name} (US).`,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
      });

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
