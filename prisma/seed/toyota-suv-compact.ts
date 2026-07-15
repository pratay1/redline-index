/**
 * Toyota compact SUV / crossover seed module (US market).
 * C-HR (final MY2022 XLE), Corolla Cross LE + Hybrid S MY2025, RAV4 LE /
 * Hybrid XLE / Plug-in Hybrid SE MY2025, Venza LE/XLE Hybrid MY2024 (final),
 * bZ4X XLE MY2025. Prefer unique auto-data.net exteriors.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Exterior images (unique):
 * - https://www.auto-data.net/images/f50/Toyota-C-HR.jpg
 * - https://www.auto-data.net/images/f129/Toyota-Corolla-Cross-facelift-2024.jpg
 * - https://www.auto-data.net/images/f128/Toyota-Corolla-Cross-facelift-2024.jpg
 * - https://www.auto-data.net/images/f80/Toyota-RAV4-V.jpg
 * - https://www.auto-data.net/images/f115/Toyota-RAV4-V-facelift-2021.jpg
 * - https://www.auto-data.net/images/f110/Toyota-RAV4-V.jpg
 * - https://www.auto-data.net/images/f95/Toyota-Venza-II-XU80.jpg
 * - https://www.auto-data.net/images/f45/Toyota-Venza-II-XU80.jpg
 * - https://www.auto-data.net/images/f90/Toyota-bZ4X-facelift-2025.jpg
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

/** 2022 C-HR US destination (TrueDelta MSRP table) — pre–Aug 2024 DPH schedule. */
const CHR_2022_DESTINATION_CENTS = 133_500;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

type ModelSlug =
  | "toyota-c-hr"
  | "toyota-corolla-cross"
  | "toyota-rav4"
  | "toyota-venza"
  | "toyota-bz4x";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: "C-HR" | "Corolla Cross" | "RAV4" | "Venza" | "bZ4X";
  year: number;
  generationCode: string;
  generationLabel: string;
  generationStartYear: number;
  bodyStyle: "SUV" | "CROSSOVER";
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
    type: "AUTOMATIC" | "CVT";
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
  destinationCents: number;
  specSourceSlug: string;
  priceSourceSlug: string;
};

const SPEC_SOURCES = [
  {
    slug: "edmunds-2022-toyota-c-hr",
    title: "2022 Toyota C-HR Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/c-hr/2022/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2022-toyota-c-hr",
    title: "2022 Toyota C-HR Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/c-hr-2022",
    publisher: "Car and Driver",
  },
  {
    slug: "edmunds-2025-toyota-corolla-cross-le",
    title: "2025 Toyota Corolla Cross LE Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/corolla-cross/2025/st-402059428/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2025-toyota-corolla-cross-hybrid",
    title:
      "2025 Toyota Corolla Cross Hybrid Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/corolla-cross-hybrid-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "edmunds-2025-toyota-corolla-cross-hybrid",
    title: "2025 Toyota Corolla Cross Hybrid Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/corolla-cross-hybrid/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-rav4-le",
    title: "2025 Toyota RAV4 LE Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/rav4/2025/st-402022010/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-rav4-trims",
    title: "2025 Toyota RAV4 SUV Trims Comparison (Edmunds)",
    url: "https://www.edmunds.com/toyota/rav4/2025/trims/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2025-toyota-rav4-hybrid",
    title: "2025 Toyota RAV4 Hybrid Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/rav4-hybrid",
    publisher: "Car and Driver",
  },
  {
    slug: "edmunds-2025-toyota-rav4-hybrid-xle",
    title: "2025 Toyota RAV4 Hybrid XLE Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/rav4-hybrid/2025/st-402059200/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-rav4-phev-se",
    title: "2025 Toyota RAV4 Plug-In Hybrid SE Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/rav4-plug-in-hybrid/2025/st-402037151/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2024-toyota-venza",
    title: "2024 Toyota Venza Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/venza/2024/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2024-toyota-venza",
    title: "2024 Toyota Venza Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/venza",
    publisher: "Car and Driver",
  },
  {
    slug: "toyota-pressroom-2025-bz4x",
    title:
      "2025 Toyota bZ4X BEV Electrifies with Lower Price and New Nightshade Edition (Toyota USA Newsroom)",
    url: "https://pressroom.toyota.com/2025-toyota-bz4x-bev-electrifies-with-lower-price-and-new-nightshade-edition/",
    publisher: "Toyota USA Newsroom",
  },
  {
    slug: "edmunds-2025-toyota-bz4x-trims",
    title: "2025 Toyota bZ4X Trims Comparison (Edmunds)",
    url: "https://www.edmunds.com/toyota/bz4x/2025/trims/",
    publisher: "Edmunds",
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "edmunds-2022-toyota-c-hr-price",
    title: "2022 Toyota C-HR Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/c-hr/2022/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-corolla-cross-price",
    title:
      "2025 Toyota Corolla Cross Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/corolla-cross/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-corolla-cross-hybrid-price",
    title:
      "2025 Toyota Corolla Cross Hybrid Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/corolla-cross-hybrid/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-rav4-price",
    title: "2025 Toyota RAV4 LE Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/rav4/2025/st-402022010/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-rav4-hybrid-price",
    title:
      "2025 Toyota RAV4 Hybrid Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/rav4-hybrid/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-rav4-phev-price",
    title:
      "2025 Toyota RAV4 Plug-In Hybrid SE Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/rav4-plug-in-hybrid/2025/st-402037151/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2024-toyota-venza-price",
    title: "2024 Toyota Venza Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/venza/2024/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "toyota-pressroom-2025-bz4x-msrp",
    title:
      "2025 Toyota bZ4X XLE FWD MSRP $37,070 (Toyota USA Newsroom) — excludes destination",
    url: "https://pressroom.toyota.com/2025-toyota-bz4x-bev-electrifies-with-lower-price-and-new-nightshade-edition/",
    publisher: "Toyota USA Newsroom",
  },
] as const;

const DESTINATION_SOURCE_DPH = {
  slug: "toyota-us-dph-aug-2024",
  title:
    "Toyota USA Delivery, Processing & Handling schedule (Aug 2024+) — entry/small/mid SUV DPH",
  url: "https://www.toyota.com/",
  type: "MANUFACTURER" as const,
  publisher: "Toyota Motor Sales, U.S.A.",
};

const DESTINATION_SOURCE_CHR_2022 = {
  slug: "truedelta-2022-toyota-c-hr-destination-1335",
  title: "2022 Toyota C-HR destination $1,335 (TrueDelta MSRP table)",
  url: "https://www.truedelta.com/Toyota-C-HR/specs-1395-2022",
  type: "THIRD_PARTY" as const,
  publisher: "TrueDelta",
};

/**
 * Sourced US trims only. Incomplete / out-of-scope variants via STATIC_SKIPPED.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2022-toyota-c-hr-xle-us",
    name: "C-HR XLE",
    modelSlug: "toyota-c-hr",
    modelName: "C-HR",
    year: 2022,
    generationCode: "AX10-FL2020",
    generationLabel: "First generation (AX10 facelift 2020)",
    generationStartYear: 2018,
    bodyStyle: "CROSSOVER",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f50/Toyota-C-HR.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-c-hr-i-facelift-2020-generation-7394",
    imageAlt: "2022 Toyota C-HR XLE exterior",
    epaId: "44985",
    engine: {
      slug: "toyota-m20a-fks-c-hr",
      name: "2.0L Inline-4 Dynamic Force",
      code: "M20A-FKS",
      fuelType: "PETROL",
      displacementCc: 1987,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "toyota-cvt-avs7",
      name: "CVT with 7-speed sequential shiftmatic",
      type: "CVT",
      gearCount: 7,
    },
    dimensions: {
      // Edmunds 2022 C-HR
      lengthIn: 172.6,
      widthIn: 70.7,
      heightIn: 61.6,
      wheelbaseIn: 103.9,
      curbWeightKg: lbsToKg(3300),
      cargoVolumeLiters: cuFtToLiters(19.1),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 144,
      torqueLbFt: 139,
      // Car and Driver instrumented
      zeroToSixtySeconds: 11.0,
    },
    // EPA id 44985
    fuelEconomy: { cityMpg: 27, highwayMpg: 31, combinedMpg: 29 },
    // Edmunds / TrueDelta base MSRP excl. destination
    baseMsrpCents: 2_428_000,
    destinationCents: CHR_2022_DESTINATION_CENTS,
    specSourceSlug: "caranddriver-2022-toyota-c-hr",
    priceSourceSlug: "edmunds-2022-toyota-c-hr-price",
  },
  {
    slug: "2025-toyota-corolla-cross-le-us",
    name: "Corolla Cross LE",
    modelSlug: "toyota-corolla-cross",
    modelName: "Corolla Cross",
    year: 2025,
    generationCode: "XG10-FL2024",
    generationLabel: "First generation (XG10 facelift 2024)",
    generationStartYear: 2022,
    bodyStyle: "SUV",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f129/Toyota-Corolla-Cross-facelift-2024.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-corolla-cross-facelift-2024-generation-10124",
    imageAlt: "2025 Toyota Corolla Cross LE exterior",
    epaId: "48911",
    engine: {
      slug: "toyota-m20a-fks-corolla-cross",
      name: "2.0L Inline-4 Dynamic Force",
      code: "M20A-FKS",
      fuelType: "PETROL",
      displacementCc: 1987,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "toyota-cvt-avs10-corolla-cross",
      name: "Direct Shift-CVT (AV-S10)",
      type: "CVT",
      gearCount: 10,
    },
    dimensions: {
      // Edmunds 2025 Corolla Cross LE
      lengthIn: 176.1,
      widthIn: 71.9,
      heightIn: 64.9,
      wheelbaseIn: 103.9,
      curbWeightKg: lbsToKg(3086),
      cargoVolumeLiters: cuFtToLiters(24.0),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 169,
      torqueLbFt: 151,
      // Car and Driver: non-hybrid Corolla Cross 9.2 sec (hybrid review comparison)
      zeroToSixtySeconds: 9.2,
    },
    // EPA id 48911
    fuelEconomy: { cityMpg: 31, highwayMpg: 33, combinedMpg: 32 },
    // Edmunds LE FWD
    baseMsrpCents: 2_646_500,
    destinationCents: TOYOTA_DPH_CENTS.entrySuv,
    specSourceSlug: "caranddriver-2025-toyota-corolla-cross-hybrid",
    priceSourceSlug: "edmunds-2025-toyota-corolla-cross-price",
  },
  {
    slug: "2025-toyota-corolla-cross-hybrid-s-us",
    name: "Corolla Cross Hybrid S",
    modelSlug: "toyota-corolla-cross",
    modelName: "Corolla Cross",
    year: 2025,
    generationCode: "XG10-FL2024",
    generationLabel: "First generation (XG10 facelift 2024)",
    generationStartYear: 2022,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f128/Toyota-Corolla-Cross-facelift-2024.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-corolla-cross-facelift-2024-generation-10124",
    imageAlt: "2025 Toyota Corolla Cross Hybrid S exterior",
    epaId: "48939",
    engine: {
      slug: "toyota-m20a-fxs-corolla-cross-hybrid",
      name: "2.0L Inline-4 hybrid (system)",
      code: "M20A-FXS",
      fuelType: "HYBRID",
      displacementCc: 1987,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "Full hybrid (combined 196 hp; AWD e-motor rear)",
    },
    transmission: {
      slug: "toyota-ecvt-avs6-corolla-cross-hybrid",
      name: "Electronically controlled CVT (AV-S6)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Edmunds Hybrid family; length/wheelbase match gas Cross
      lengthIn: 176.1,
      widthIn: 71.9,
      heightIn: 64.9,
      wheelbaseIn: 103.9,
      curbWeightKg: lbsToKg(3373),
      cargoVolumeLiters: cuFtToLiters(21.5),
      seatingCapacity: 5,
    },
    performance: {
      // Car and Driver instrumented hybrid; engine torque per C&D sheet
      powerHp: 196,
      torqueLbFt: 139,
      zeroToSixtySeconds: 7.3,
    },
    // EPA id 48939
    fuelEconomy: { cityMpg: 45, highwayMpg: 38, combinedMpg: 42 },
    // Edmunds Hybrid S — entry hybrid trim (no Hybrid LE for MY2025)
    baseMsrpCents: 2_849_500,
    destinationCents: TOYOTA_DPH_CENTS.entrySuv,
    specSourceSlug: "caranddriver-2025-toyota-corolla-cross-hybrid",
    priceSourceSlug: "edmunds-2025-toyota-corolla-cross-hybrid-price",
  },
  {
    slug: "2025-toyota-rav4-le-us",
    name: "RAV4 LE",
    modelSlug: "toyota-rav4",
    modelName: "RAV4",
    year: 2025,
    generationCode: "XA50-FL2021",
    generationLabel: "Fifth generation (XA50 facelift 2021)",
    generationStartYear: 2019,
    bodyStyle: "SUV",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f80/Toyota-RAV4-V.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-rav4-v-facelift-2021-generation-9946",
    imageAlt: "2025 Toyota RAV4 LE exterior",
    epaId: "48910",
    engine: {
      slug: "toyota-a25a-fks-rav4",
      name: "2.5L Inline-4 Dynamic Force",
      code: "A25A-FKS",
      fuelType: "PETROL",
      displacementCc: 2487,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "toyota-8at-rav4",
      name: "8-speed Direct Shift automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // Edmunds 2025 RAV4 LE
      lengthIn: 180.9,
      widthIn: 73.0,
      heightIn: 67.0,
      wheelbaseIn: 105.9,
      curbWeightKg: lbsToKg(3370),
      cargoVolumeLiters: cuFtToLiters(37.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 203,
      torqueLbFt: 184,
      // Car and Driver: gas RAV4 8.0 sec
      zeroToSixtySeconds: 8.0,
    },
    // EPA id 48910
    fuelEconomy: { cityMpg: 27, highwayMpg: 35, combinedMpg: 30 },
    // Edmunds LE FWD
    baseMsrpCents: 2_885_000,
    destinationCents: TOYOTA_DPH_CENTS.smallSuv,
    specSourceSlug: "edmunds-2025-toyota-rav4-le",
    priceSourceSlug: "edmunds-2025-toyota-rav4-price",
  },
  {
    slug: "2025-toyota-rav4-hybrid-xle-us",
    name: "RAV4 Hybrid XLE",
    modelSlug: "toyota-rav4",
    modelName: "RAV4",
    year: 2025,
    generationCode: "XA50-FL2021",
    generationLabel: "Fifth generation (XA50 facelift 2021)",
    generationStartYear: 2019,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f115/Toyota-RAV4-V-facelift-2021.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-rav4-v-facelift-2021-generation-9946",
    imageAlt: "2025 Toyota RAV4 Hybrid XLE exterior",
    epaId: "48937",
    engine: {
      slug: "toyota-a25a-fxs-rav4-hybrid",
      name: "2.5L Inline-4 hybrid (system)",
      code: "A25A-FXS",
      fuelType: "HYBRID",
      displacementCc: 2487,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "Full hybrid (combined 219 hp; electronic AWD)",
    },
    transmission: {
      slug: "toyota-ecvt-avs6-rav4-hybrid",
      name: "Electronically controlled CVT (AV-S6)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Edmunds Hybrid XLE
      lengthIn: 180.9,
      widthIn: 73.0,
      heightIn: 67.0,
      wheelbaseIn: 105.9,
      curbWeightKg: lbsToKg(3775),
      cargoVolumeLiters: cuFtToLiters(37.5),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 219,
      // Engine torque (SAE); system output published as hp only
      torqueLbFt: 163,
      // Car and Driver Hybrid Woodland instrumented (same powertrain)
      zeroToSixtySeconds: 7.3,
    },
    // EPA id 48937
    fuelEconomy: { cityMpg: 41, highwayMpg: 38, combinedMpg: 39 },
    // Edmunds Hybrid XLE
    baseMsrpCents: 3_411_000,
    destinationCents: TOYOTA_DPH_CENTS.smallSuv,
    specSourceSlug: "edmunds-2025-toyota-rav4-hybrid-xle",
    priceSourceSlug: "edmunds-2025-toyota-rav4-hybrid-price",
  },
  {
    slug: "2025-toyota-rav4-plug-in-hybrid-se-us",
    name: "RAV4 Plug-in Hybrid SE",
    modelSlug: "toyota-rav4",
    modelName: "RAV4",
    year: 2025,
    generationCode: "XA50-FL2021",
    generationLabel: "Fifth generation (XA50 facelift 2021)",
    generationStartYear: 2019,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f110/Toyota-RAV4-V.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-rav4-v-facelift-2021-generation-9946",
    imageAlt: "2025 Toyota RAV4 Plug-in Hybrid SE exterior",
    epaId: "49160",
    engine: {
      slug: "toyota-a25a-fxs-rav4-phev",
      name: "2.5L Inline-4 plug-in hybrid (system)",
      code: "A25A-FXS-PHEV",
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 2487,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "PHEV (combined 302 hp; 18.1 kWh; electronic AWD)",
    },
    transmission: {
      slug: "toyota-ecvt-avs6-rav4-phev",
      name: "Electronically controlled CVT (AV-S6)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Edmunds PHEV SE; length family matches XA50
      lengthIn: 180.9,
      widthIn: 73.0,
      heightIn: 67.0,
      wheelbaseIn: 105.9,
      curbWeightKg: lbsToKg(4235),
      cargoVolumeLiters: cuFtToLiters(33.5),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 302,
      torqueLbFt: 165,
      // Car and Driver instrumented PHEV
      zeroToSixtySeconds: 5.4,
    },
    // EPA id 49160 — gas hybrid MPG + electric range
    fuelEconomy: {
      cityMpg: 40,
      highwayMpg: 36,
      combinedMpg: 38,
      electricRangeMiles: 42,
    },
    // Edmunds SE base MSRP excl. destination
    baseMsrpCents: 4_456_500,
    destinationCents: TOYOTA_DPH_CENTS.smallSuv,
    specSourceSlug: "edmunds-2025-toyota-rav4-phev-se",
    priceSourceSlug: "edmunds-2025-toyota-rav4-phev-price",
  },
  {
    slug: "2024-toyota-venza-le-us",
    name: "Venza LE",
    modelSlug: "toyota-venza",
    modelName: "Venza",
    year: 2024,
    generationCode: "XU80",
    generationLabel: "Second generation (XU80)",
    generationStartYear: 2021,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f95/Toyota-Venza-II-XU80.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-venza-ii-xu80-generation-7881",
    imageAlt: "2024 Toyota Venza LE Hybrid exterior",
    epaId: "47393",
    engine: {
      slug: "toyota-a25a-fxs-venza",
      name: "2.5L Inline-4 hybrid (system)",
      code: "A25A-FXS",
      fuelType: "HYBRID",
      displacementCc: 2487,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "Full hybrid (combined 219 hp; electronic AWD)",
    },
    transmission: {
      slug: "toyota-ecvt-avs6-venza",
      name: "Electronically controlled CVT (AV-S6)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Edmunds / TrimAtlas LE
      lengthIn: 186.6,
      widthIn: 73.0,
      heightIn: 65.9,
      wheelbaseIn: 105.9,
      curbWeightKg: lbsToKg(3847),
      cargoVolumeLiters: cuFtToLiters(28.8),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 219,
      torqueLbFt: 163,
      // Car and Driver instrumented
      zeroToSixtySeconds: 7.6,
    },
    // EPA id 47393
    fuelEconomy: { cityMpg: 40, highwayMpg: 37, combinedMpg: 39 },
    // Edmunds LE
    baseMsrpCents: 3_507_000,
    destinationCents: TOYOTA_DPH_CENTS.midSuvVan,
    specSourceSlug: "edmunds-2024-toyota-venza",
    priceSourceSlug: "edmunds-2024-toyota-venza-price",
  },
  {
    slug: "2024-toyota-venza-xle-us",
    name: "Venza XLE",
    modelSlug: "toyota-venza",
    modelName: "Venza",
    year: 2024,
    generationCode: "XU80",
    generationLabel: "Second generation (XU80)",
    generationStartYear: 2021,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f45/Toyota-Venza-II-XU80.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-venza-ii-xu80-generation-7881",
    imageAlt: "2024 Toyota Venza XLE Hybrid exterior",
    epaId: "47393",
    engine: {
      slug: "toyota-a25a-fxs-venza",
      name: "2.5L Inline-4 hybrid (system)",
      code: "A25A-FXS",
      fuelType: "HYBRID",
      displacementCc: 2487,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "Full hybrid (combined 219 hp; electronic AWD)",
    },
    transmission: {
      slug: "toyota-ecvt-avs6-venza",
      name: "Electronically controlled CVT (AV-S6)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      lengthIn: 186.6,
      widthIn: 73.0,
      heightIn: 65.9,
      wheelbaseIn: 105.9,
      curbWeightKg: lbsToKg(3891),
      cargoVolumeLiters: cuFtToLiters(28.8),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 219,
      torqueLbFt: 163,
      zeroToSixtySeconds: 7.6,
    },
    fuelEconomy: { cityMpg: 40, highwayMpg: 37, combinedMpg: 39 },
    // Edmunds XLE
    baseMsrpCents: 3_928_000,
    destinationCents: TOYOTA_DPH_CENTS.midSuvVan,
    specSourceSlug: "caranddriver-2024-toyota-venza",
    priceSourceSlug: "edmunds-2024-toyota-venza-price",
  },
  {
    slug: "2025-toyota-bz4x-xle-us",
    name: "bZ4X XLE",
    modelSlug: "toyota-bz4x",
    modelName: "bZ4X",
    year: 2025,
    generationCode: "EA10-FL2025",
    generationLabel: "First generation (EA10 facelift 2025)",
    generationStartYear: 2023,
    bodyStyle: "SUV",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f90/Toyota-bZ4X-facelift-2025.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-bz4x-facelift-2025-generation-10678",
    imageAlt: "2025 Toyota bZ4X XLE exterior",
    epaId: "49126",
    engine: {
      slug: "toyota-bz4x-fwd-150kw",
      name: "Single electric motor (FWD)",
      code: "BZ4X-FWD-150KW",
      fuelType: "ELECTRIC",
      displacementCc: null,
      cylinderCount: null,
      configuration: "Electric",
      induction: null,
      electrification: "BEV (150 kW AC synchronous; 71.4 kWh)",
    },
    transmission: {
      slug: "toyota-ev-single-speed",
      name: "Single-speed automatic",
      type: "AUTOMATIC",
      gearCount: 1,
    },
    dimensions: {
      // Toyota pressroom / Edmunds
      lengthIn: 184.6,
      widthIn: 73.2,
      heightIn: 65.0,
      wheelbaseIn: 112.2,
      curbWeightKg: lbsToKg(4266),
      cargoVolumeLiters: cuFtToLiters(27.7),
      seatingCapacity: 5,
    },
    performance: {
      // Toyota USA Newsroom FWD
      powerHp: 201,
      torqueLbFt: 196,
      zeroToSixtySeconds: 7.1,
    },
    // EPA id 49126 — MPGe stored in mpg fields + range
    fuelEconomy: {
      cityMpg: 131,
      highwayMpg: 107,
      combinedMpg: 119,
      electricRangeMiles: 252,
    },
    // Toyota pressroom XLE FWD $37,070 excl. destination
    baseMsrpCents: 3_707_000,
    destinationCents: TOYOTA_DPH_CENTS.smallSuv,
    specSourceSlug: "toyota-pressroom-2025-bz4x",
    priceSourceSlug: "toyota-pressroom-2025-bz4x-msrp",
  },
];

const STATIC_SKIPPED = [
  "C-HR LE (MY2022): US lineup base was XLE — LE discontinued; XLE seeded as final-year entry",
  "C-HR Nightshade/Limited (MY2022): deferred; XLE covers final US year with full EPA",
  "Corolla Cross Hybrid LE (MY2025): trim renamed — entry hybrid is Hybrid S (seeded)",
  "Corolla Cross L/XLE / Hybrid SE–XSE: out of scope for LE + entry-hybrid focus",
  "RAV4 Limited / Hybrid Limited / Woodland: deferred; LE + Hybrid XLE + PHEV SE seeded",
  "RAV4 Prime nameplate (MY2025): rebranded RAV4 Plug-in Hybrid — SE seeded under PHEV",
  "Venza first-gen (MY2015): thin incomplete record skipped per guidance",
  "Venza Nightshade/Limited (MY2024): LE/XLE Hybrid cover final US year",
  "bZ4X Limited/Nightshade/AWD (MY2025): XLE FWD seeded as longest-range EPA trim",
];

const MODEL_DEFS: { slug: ModelSlug; name: TrimSeed["modelName"] }[] = [
  { slug: "toyota-c-hr", name: "C-HR" },
  { slug: "toyota-corolla-cross", name: "Corolla Cross" },
  { slug: "toyota-rav4", name: "RAV4" },
  { slug: "toyota-venza", name: "Venza" },
  { slug: "toyota-bz4x", name: "bZ4X" },
];

export async function seedToyotaSuvCompact(
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

  const destinationSourceDph = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE_DPH.slug,
    title: DESTINATION_SOURCE_DPH.title,
    publisher: DESTINATION_SOURCE_DPH.publisher,
    url: DESTINATION_SOURCE_DPH.url,
    type: DESTINATION_SOURCE_DPH.type,
  });
  const destinationSourceChr = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE_CHR_2022.slug,
    title: DESTINATION_SOURCE_CHR_2022.title,
    publisher: DESTINATION_SOURCE_CHR_2022.publisher,
    url: DESTINATION_SOURCE_CHR_2022.url,
    type: DESTINATION_SOURCE_CHR_2022.type,
  });

  const specSources = new Map<string, { id: string }>();
  for (const sourceData of SPEC_SOURCES) {
    const source = await upsertCatalogueSource(prisma, {
      slug: sourceData.slug,
      title: sourceData.title,
      publisher: sourceData.publisher,
      url: sourceData.url,
      type:
        sourceData.slug.startsWith("toyota-pressroom")
          ? "PRESS_RELEASE"
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
      type:
        sourceData.slug.startsWith("toyota-pressroom")
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

      const destinationCents = trim.destinationCents;
      const destinationSource =
        destinationCents === CHR_2022_DESTINATION_CENTS
          ? destinationSourceChr
          : destinationSourceDph;

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
