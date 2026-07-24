/**
 * Honda Civic family seed module (US market).
 * Representative current / final-year trims only — not every year in the ranges.
 * Civic Sedan LX + Sport (MY2025), Coupe Touring (final MY2020), Hatchback Sport
 * (MY2025), Hybrid Sedan Sport + Hybrid Hatch Sport (MY2025), Si Sedan (MY2025),
 * Si Coupe (final MY2020), Type R FL5 (MY2025). CNG MY2015 skipped (enum/image).
 * Prefer unique Civic exteriors (auto-data.net; Wikimedia for discontinued coupes).
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Exterior images (unique):
 * - https://www.auto-data.net/images/f39/Honda-Civic-XI-Sedan-facelift-2024_2.jpg
 * - https://www.auto-data.net/images/f111/Honda-Civic-XI-Sedan-facelift-2024.jpg
 * - https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/2019_Honda_Civic_coupe_%28facelift%29%2C_front_12.16.19.jpg/1280px-2019_Honda_Civic_coupe_%28facelift%29%2C_front_12.16.19.jpg
 * - https://www.auto-data.net/images/f109/Honda-Civic-XI-Hatchback.jpg
 * - https://www.auto-data.net/images/f84/Honda-Civic-XI-facelift-2024.jpg
 * - https://www.auto-data.net/images/f109/Honda-Civic-XI-Hatchback_1.jpg
 * - https://www.auto-data.net/images/f39/Honda-Civic-XI-Sedan-facelift-2024.jpg
 * - https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/19_Honda_Civic_Si_Coupe.jpg/1280px-19_Honda_Civic_Si_Coupe.jpg
 * - https://www.auto-data.net/images/f62/Honda-Civic-XI-Type-R.jpg
 */
import type { Drivetrain, FuelType } from "../../src/generated/prisma/client";
import {
  HONDA_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureHondaEngine,
  ensureImageSource,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./honda-shared";

const LBS_TO_KG = 0.45359237;
const CUFT_TO_L = 28.316846592;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

type ModelSlug =
  | "honda-civic"
  | "honda-civic-coupe"
  | "honda-civic-hatchback"
  | "honda-civic-si"
  | "honda-civic-si-coupe"
  | "honda-civic-type-r";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: string;
  year: number;
  generationCode: string;
  generationLabel: string;
  generationStartYear: number;
  bodyStyle: "SEDAN" | "COUPE" | "HATCHBACK";
  drivetrain: Drivetrain;
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
  imageCredit: string;
  imagePublisher: string;
  epaId: string;
  description?: string;
  engine: {
    slug: string;
    name: string;
    code: string | null;
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
    frontTrackIn: number;
    rearTrackIn: number;
    groundClearanceIn: number;
    curbWeightKg: number;
    /** lbs→kg via lbsToKg; curb + Honda OM max load (CVT/hybrid 850, MT 680). */
    grossVehicleWeightKg: number;
    cargoVolumeLiters: number;
    seatingCapacity: number;
  };
  performance: {
    powerHp: number;
    torqueLbFt: number;
    zeroToSixtySeconds: number;
    quarterMileSeconds: number;
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
  destinationCents: number;
  specSourceSlug: string;
  priceSourceSlug: string;
};

const SPEC_SOURCES = [
  {
    slug: "honda-news-2025-civic-sedan-specs",
    title: "2025 Honda Civic Sedan Specifications & Features (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-c28e8d1efb94e520fef21ff3f800cb30-2025-honda-civic-sedan-specifications-features",
    publisher: "American Honda Motor Co.",
    type: "PRESS_RELEASE" as const,
  },
  {
    slug: "honda-news-2025-civic-hatch-specs",
    title:
      "2025 Honda Civic Hatchback Specifications & Features (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-008e554add341b8444085beaa2041012-2025-honda-civic-hatchback-specifications-features",
    publisher: "American Honda Motor Co.",
    type: "PRESS_RELEASE" as const,
  },
  {
    slug: "honda-news-2025-civic-hatch-pricing",
    title: "2025 Honda Civic Hatchback Pricing and EPA Ratings (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-008e554add341b8444085beaa20d8dc0-2025-honda-civic-hatchback-pricing-and-epa-ratings",
    publisher: "American Honda Motor Co.",
    type: "PRESS_RELEASE" as const,
  },
  {
    slug: "edmunds-2025-honda-civic-lx",
    title: "2025 Honda Civic LX Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/honda/civic/2025/st-402018142/features-specs/",
    publisher: "Edmunds",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2025-honda-civic-si",
    title: "2025 Honda Civic Si Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/honda/civic/2025/si/st-402042462/features-specs/",
    publisher: "Edmunds",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2025-honda-civic-type-r",
    title: "2025 Honda Civic Type R Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/honda/civic/2025/st-402044272/features-specs/",
    publisher: "Edmunds",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "honda-com-2025-civic-type-r-specs",
    title: "2025 Civic Type R Features & Specs (Honda Automobiles)",
    url: "https://automobiles.honda.com/2025/civic-type-r/specs-features-trim-comparison",
    publisher: "American Honda Motor Co.",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "honda-infocenter-2020-civic-coupe-specs",
    title: "2020 Honda Civic Coupe Specifications (Honda Info Center)",
    url: "https://www.hondainfocenter.com/2020/civic-coupe/feature-guide/civic-coupe-specifications/",
    publisher: "American Honda Motor Co.",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "edmunds-2020-honda-civic-coupe",
    title: "2020 Honda Civic Coupe Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/honda/civic/2020/coupe/features-specs/",
    publisher: "Edmunds",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "caranddriver-2025-honda-civic",
    title: "2025 Honda Civic / Civic Hybrid Review (Car and Driver)",
    url: "https://www.caranddriver.com/honda/civic-2025",
    publisher: "Car and Driver",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "caranddriver-2025-honda-civic-si",
    title: "2025 Honda Civic Si Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/honda/civic-si-2025",
    publisher: "Car and Driver",
    type: "THIRD_PARTY" as const,
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "honda-news-2025-civic-sedan-pricing",
    title:
      "2025 Honda Civic Sedan MSRP excl. destination (Honda Newsroom / ConceptCarz reprint)",
    url: "https://www.conceptcarz.com/a54201/2025-honda-civic-pricing-fuel-economy.aspx",
    publisher: "ConceptCarz (Honda pricing release)",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "honda-news-2025-civic-hatch-pricing-msrp",
    title:
      "2025 Honda Civic Hatchback MSRP excl. $1,095 destination (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-008e554add341b8444085beaa20d8dc0-2025-honda-civic-hatchback-pricing-and-epa-ratings",
    publisher: "American Honda Motor Co.",
    type: "PRESS_RELEASE" as const,
  },
  {
    slug: "edmunds-2025-honda-civic-lx-price",
    title: "2025 Honda Civic LX Starting MSRP (Edmunds)",
    url: "https://www.edmunds.com/honda/civic/2025/st-402018142/features-specs/",
    publisher: "Edmunds",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "motorauthority-2025-civic-si-type-r-price",
    title:
      "2025 Civic Si / Type R pricing incl. destination (MotorAuthority)",
    url: "https://www.motorauthority.com/news/1144340_2025-honda-civic-type-r-price",
    publisher: "MotorAuthority",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2025-honda-civic-type-r-price",
    title: "2025 Honda Civic Type R Base MSRP excl. destination (Edmunds)",
    url: "https://www.edmunds.com/honda/civic/2025/type-r/",
    publisher: "Edmunds",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2020-honda-civic-coupe-price",
    title: "2020 Honda Civic Coupe MSRP by trim (Edmunds)",
    url: "https://www.edmunds.com/honda/civic/2020/coupe/features-specs/",
    publisher: "Edmunds",
    type: "THIRD_PARTY" as const,
  },
] as const;

const DESTINATION_SOURCE = {
  slug: "honda-us-destination-passenger-car",
  title:
    "Honda US destination & handling — passenger cars (Civic class; HONDA_DESTINATION_CENTS.passengerCar)",
  url: "https://automobiles.honda.com/",
  type: "MANUFACTURER" as const,
  publisher: "American Honda Motor Co.",
};

/**
 * Representative US trims only. EPA ids from fueleconomy.gov REST menu/options.
 * MSRP excludes destination unless noted in source.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2025-honda-civic-lx-us",
    name: "Civic LX",
    modelSlug: "honda-civic",
    modelName: "Civic",
    year: 2025,
    generationCode: "FE",
    generationLabel: "Eleventh generation sedan (FE) US facelift",
    generationStartYear: 2022,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f39/Honda-Civic-XI-Sedan-facelift-2024_2.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-civic-xi-sedan-facelift-2024-generation-10055",
    imageAlt: "2025 Honda Civic LX sedan exterior",
    imageCredit: "auto-data.net",
    imagePublisher: "auto-data.net",
    epaId: "48016",
    engine: {
      slug: "honda-k20c2-150",
      name: "2.0L Inline-4 (K20C2 Atkinson)",
      code: "K20C2",
      fuelType: "PETROL",
      displacementCc: 1993,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "honda-civic-cvt",
      name: "Continuously Variable Transmission (CVT)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Honda Newsroom 2025 Civic Sedan LX; ground clearance Honda CA 134 mm no-load
      lengthIn: 184.8,
      widthIn: 70.9,
      heightIn: 55.7,
      wheelbaseIn: 107.7,
      frontTrackIn: 60.9,
      rearTrackIn: 62.0,
      groundClearanceIn: 5.3,
      curbWeightKg: lbsToKg(2877),
      // GVWR ≈ curb + Honda OM max load 850 lbs (CVT)
      grossVehicleWeightKg: lbsToKg(2877 + 850),
      cargoVolumeLiters: cuFtToLiters(14.8),
      seatingCapacity: 5,
    },
    performance: {
      // HP/torque Honda Newsroom; 0–60 ~8.2 band for NA 2.0 Civic (C&D class)
      powerHp: 150,
      torqueLbFt: 133,
      zeroToSixtySeconds: 8.2,
      // estimate: from C&D 2025 Sport sedan 16.9 with ~60 lb lighter LX
      quarterMileSeconds: 16.8,
      // estimate: C&D est top speed for 2025 nonhybrid Civic
      topSpeedMph: 124,
    },
    // EPA id 48016 — 32/41/36 LX CVT
    fuelEconomy: { cityMpg: 32, highwayMpg: 41, combinedMpg: 36 },
    // Honda Newsroom / Edmunds $24,250 excl. destination
    baseMsrpCents: 2_425_000,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "honda-news-2025-civic-sedan-specs",
    priceSourceSlug: "edmunds-2025-honda-civic-lx-price",
  },
  {
    slug: "2025-honda-civic-sport-us",
    name: "Civic Sport",
    modelSlug: "honda-civic",
    modelName: "Civic",
    year: 2025,
    generationCode: "FE",
    generationLabel: "Eleventh generation sedan (FE) US facelift",
    generationStartYear: 2022,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f111/Honda-Civic-XI-Sedan-facelift-2024.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-civic-xi-sedan-facelift-2024-generation-10055",
    imageAlt: "2025 Honda Civic Sport sedan exterior",
    imageCredit: "auto-data.net",
    imagePublisher: "auto-data.net",
    epaId: "48017",
    engine: {
      slug: "honda-k20c2-150",
      name: "2.0L Inline-4 (K20C2 Atkinson)",
      code: "K20C2",
      fuelType: "PETROL",
      displacementCc: 1993,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "honda-civic-cvt-avs7",
      name: "CVT with paddle shifters (AV-S7)",
      type: "CVT",
      gearCount: 7,
    },
    dimensions: {
      // Honda Newsroom Sport sedan; ground clearance Honda CA 134 mm no-load
      lengthIn: 184.8,
      widthIn: 70.9,
      heightIn: 55.7,
      wheelbaseIn: 107.7,
      frontTrackIn: 60.5,
      rearTrackIn: 61.6,
      groundClearanceIn: 5.3,
      curbWeightKg: lbsToKg(2935),
      // GVWR ≈ curb + Honda OM max load 850 lbs (CVT)
      grossVehicleWeightKg: lbsToKg(2935 + 850),
      cargoVolumeLiters: cuFtToLiters(14.8),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 150,
      torqueLbFt: 133,
      zeroToSixtySeconds: 8.0,
      // C&D instrumented 2025 Civic Sport sedan
      quarterMileSeconds: 16.9,
      // estimate: C&D est top speed for 2025 nonhybrid Civic
      topSpeedMph: 124,
    },
    // EPA id 48017 — 31/39/34 Sport AV-S7
    fuelEconomy: { cityMpg: 31, highwayMpg: 39, combinedMpg: 34 },
    // Cars.com / Honda: $27,345 incl. $1,095 dest → $26,250 excl.
    baseMsrpCents: 2_625_000,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "honda-news-2025-civic-sedan-specs",
    priceSourceSlug: "honda-news-2025-civic-sedan-pricing",
  },
  {
    slug: "2020-honda-civic-touring-coupe-us",
    name: "Civic Touring Coupe",
    modelSlug: "honda-civic-coupe",
    modelName: "Civic Coupe",
    year: 2020,
    generationCode: "FC",
    generationLabel: "Tenth generation coupe (FC) final US year",
    generationStartYear: 2016,
    bodyStyle: "COUPE",
    drivetrain: "FWD",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/2019_Honda_Civic_coupe_%28facelift%29%2C_front_12.16.19.jpg/1280px-2019_Honda_Civic_coupe_%28facelift%29%2C_front_12.16.19.jpg",
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:2019_Honda_Civic_coupe_(facelift),_front_12.16.19.jpg",
    imageAlt: "2020 Honda Civic Touring coupe exterior (facelift body)",
    imageCredit: "Wikimedia Commons",
    imagePublisher: "Wikimedia Commons",
    epaId: "42140",
    description:
      "2020 Honda Civic Touring Coupe (US) — final US coupe model year.",
    engine: {
      slug: "honda-l15b7-174",
      name: "1.5L Inline-4 turbo (L15B7)",
      code: "L15B7",
      fuelType: "PETROL",
      displacementCc: 1498,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "honda-civic-cvt-avs7",
      name: "CVT with paddle shifters (AV-S7)",
      type: "CVT",
      gearCount: 7,
    },
    dimensions: {
      // Honda Info Center 2020 Coupe Touring; GC Honda CA 125 mm no-load
      lengthIn: 177.3,
      widthIn: 70.9,
      heightIn: 54.9,
      wheelbaseIn: 106.3,
      frontTrackIn: 60.5,
      rearTrackIn: 61.1,
      groundClearanceIn: 4.9,
      curbWeightKg: lbsToKg(2937),
      // GVWR ≈ curb + Honda OM max load 850 lbs (CVT)
      grossVehicleWeightKg: lbsToKg(2937 + 850),
      cargoVolumeLiters: cuFtToLiters(11.9),
      seatingCapacity: 5,
    },
    performance: {
      // HP/torque Honda Info Center; 0–60 ~7.8 Touring coupe class
      powerHp: 174,
      torqueLbFt: 162,
      zeroToSixtySeconds: 7.8,
      // estimate: 10th-gen 1.5T CVT Civic class vs Si 14.6 / Sport NA 16.9
      quarterMileSeconds: 15.8,
      // estimate: 10th-gen 1.5T Civic class top speed
      topSpeedMph: 125,
    },
    // EPA id 42140 — Touring-class 1.5T AV-S7 30/37/33
    fuelEconomy: { cityMpg: 30, highwayMpg: 37, combinedMpg: 33 },
    // Edmunds Touring Coupe $27,150 excl. destination
    baseMsrpCents: 2_715_000,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "honda-infocenter-2020-civic-coupe-specs",
    priceSourceSlug: "edmunds-2020-honda-civic-coupe-price",
  },
  {
    slug: "2025-honda-civic-hatchback-sport-us",
    name: "Civic Hatchback Sport",
    modelSlug: "honda-civic-hatchback",
    modelName: "Civic Hatchback",
    year: 2025,
    generationCode: "FL1",
    generationLabel: "Eleventh generation hatchback (FL1) US facelift",
    generationStartYear: 2022,
    bodyStyle: "HATCHBACK",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f109/Honda-Civic-XI-Hatchback.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-civic-xi-generation-8450",
    imageAlt: "2025 Honda Civic Hatchback Sport exterior",
    imageCredit: "auto-data.net",
    imagePublisher: "auto-data.net",
    epaId: "48502",
    engine: {
      slug: "honda-k20c2-150",
      name: "2.0L Inline-4 (K20C2 Atkinson)",
      code: "K20C2",
      fuelType: "PETROL",
      displacementCc: 1993,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "honda-civic-cvt-avs7",
      name: "CVT with paddle shifters (AV-S7)",
      type: "CVT",
      gearCount: 7,
    },
    dimensions: {
      // Honda Newsroom 2025 Hatchback Sport; GC Honda CA sedan family 134 mm
      lengthIn: 179.0,
      widthIn: 70.9,
      heightIn: 55.7,
      wheelbaseIn: 107.7,
      frontTrackIn: 60.5,
      rearTrackIn: 61.6,
      groundClearanceIn: 5.3,
      curbWeightKg: lbsToKg(2976),
      // GVWR ≈ curb + Honda OM max load 850 lbs (CVT)
      grossVehicleWeightKg: lbsToKg(2976 + 850),
      cargoVolumeLiters: cuFtToLiters(24.5),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 150,
      torqueLbFt: 133,
      zeroToSixtySeconds: 8.0,
      // estimate: same K20C2 / CVT as Sport sedan (C&D 16.9)
      quarterMileSeconds: 16.9,
      // estimate: C&D est top speed for 2025 nonhybrid Civic
      topSpeedMph: 124,
    },
    // EPA id 48502 — 30/38/34 Sport hatch AV-S7
    fuelEconomy: { cityMpg: 30, highwayMpg: 38, combinedMpg: 34 },
    // Honda Newsroom $27,450 excl. destination
    baseMsrpCents: 2_745_000,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "honda-news-2025-civic-hatch-specs",
    priceSourceSlug: "honda-news-2025-civic-hatch-pricing-msrp",
  },
  {
    slug: "2025-honda-civic-sport-hybrid-us",
    name: "Civic Sport Hybrid",
    modelSlug: "honda-civic",
    modelName: "Civic",
    year: 2025,
    generationCode: "FE",
    generationLabel: "Eleventh generation sedan (FE) US facelift",
    generationStartYear: 2022,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f84/Honda-Civic-XI-facelift-2024.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-civic-xi-facelift-2024-2.0-i-vtec-150hp-cvt-52022",
    imageAlt: "2025 Honda Civic Sport Hybrid sedan exterior",
    imageCredit: "auto-data.net",
    imagePublisher: "auto-data.net",
    epaId: "48018",
    description:
      "2025 Honda Civic Sport Hybrid sedan (US) — two-motor hybrid; 200 hp combined.",
    engine: {
      slug: "honda-civic-2-0-immd-200",
      name: "2.0L Inline-4 hybrid two-motor (i-MMD)",
      code: "LFC1",
      fuelType: "HYBRID",
      displacementCc: 1993,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification:
        "Honda two-motor hybrid (i-MMD); 200 hp / 232 lb-ft combined",
    },
    transmission: {
      slug: "honda-immd-ecvt",
      name: "Electronically controlled CVT (eCVT / direct drive)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Honda Newsroom Sport Hybrid sedan; GC Honda CA 134 mm no-load
      lengthIn: 184.8,
      widthIn: 70.9,
      heightIn: 55.7,
      wheelbaseIn: 107.7,
      frontTrackIn: 60.5,
      rearTrackIn: 61.6,
      groundClearanceIn: 5.3,
      curbWeightKg: lbsToKg(3208),
      // GVWR ≈ curb + Honda OM max load 850 lbs (hybrid eCVT)
      grossVehicleWeightKg: lbsToKg(3208 + 850),
      cargoVolumeLiters: cuFtToLiters(14.8),
      seatingCapacity: 5,
    },
    performance: {
      // Combined system output Honda Newsroom; 0–60 C&D class ~6.6
      powerHp: 200,
      torqueLbFt: 232,
      zeroToSixtySeconds: 6.6,
      // C&D instrumented 2025 Civic Hybrid sedan
      quarterMileSeconds: 14.9,
      // C&D instrumented (gov ltd)
      topSpeedMph: 114,
    },
    // EPA id 48018 — 50/47/49 Hybrid sedan
    fuelEconomy: { cityMpg: 50, highwayMpg: 47, combinedMpg: 49 },
    // Honda Newsroom Sport Hybrid $28,750 excl. destination
    baseMsrpCents: 2_875_000,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "honda-news-2025-civic-sedan-specs",
    priceSourceSlug: "honda-news-2025-civic-sedan-pricing",
  },
  {
    slug: "2025-honda-civic-hatchback-sport-hybrid-us",
    name: "Civic Hatchback Sport Hybrid",
    modelSlug: "honda-civic-hatchback",
    modelName: "Civic Hatchback",
    year: 2025,
    generationCode: "FL1",
    generationLabel: "Eleventh generation hatchback (FL1) US facelift",
    generationStartYear: 2022,
    bodyStyle: "HATCHBACK",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f109/Honda-Civic-XI-Hatchback_1.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-civic-xi-generation-8450",
    imageAlt: "2025 Honda Civic Hatchback Sport Hybrid exterior",
    imageCredit: "auto-data.net",
    imagePublisher: "auto-data.net",
    epaId: "48503",
    description:
      "2025 Honda Civic Hatchback Sport Hybrid (US) — two-motor hybrid; 200 hp combined.",
    engine: {
      slug: "honda-civic-2-0-immd-200",
      name: "2.0L Inline-4 hybrid two-motor (i-MMD)",
      code: "LFC1",
      fuelType: "HYBRID",
      displacementCc: 1993,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification:
        "Honda two-motor hybrid (i-MMD); 200 hp / 232 lb-ft combined",
    },
    transmission: {
      slug: "honda-immd-ecvt",
      name: "Electronically controlled CVT (eCVT / direct drive)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Honda Newsroom Sport Hybrid hatch (curb 3,252); GC Honda CA 134 mm
      lengthIn: 179.0,
      widthIn: 70.9,
      heightIn: 55.7,
      wheelbaseIn: 107.7,
      frontTrackIn: 60.9,
      rearTrackIn: 62.0,
      groundClearanceIn: 5.3,
      curbWeightKg: lbsToKg(3252),
      // GVWR ≈ curb + Honda OM max load 850 lbs (hybrid eCVT)
      grossVehicleWeightKg: lbsToKg(3252 + 850),
      cargoVolumeLiters: cuFtToLiters(24.5),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 200,
      torqueLbFt: 232,
      zeroToSixtySeconds: 6.8,
      // C&D instrumented 2025 Civic Sport Hybrid hatch
      quarterMileSeconds: 15.0,
      // C&D instrumented (gov ltd)
      topSpeedMph: 114,
    },
    // EPA id 48503 — 50/45/48 Hybrid hatch
    fuelEconomy: { cityMpg: 50, highwayMpg: 45, combinedMpg: 48 },
    // Honda Newsroom Sport Hybrid hatch $29,950 excl. destination
    baseMsrpCents: 2_995_000,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "honda-news-2025-civic-hatch-specs",
    priceSourceSlug: "honda-news-2025-civic-hatch-pricing-msrp",
  },
  {
    slug: "2025-honda-civic-si-us",
    name: "Civic Si",
    modelSlug: "honda-civic-si",
    modelName: "Civic Si",
    year: 2025,
    generationCode: "FE",
    generationLabel: "Eleventh generation Si sedan (FE) US facelift",
    generationStartYear: 2022,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f39/Honda-Civic-XI-Sedan-facelift-2024.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-civic-xi-sedan-facelift-2024-generation-10055",
    imageAlt: "2025 Honda Civic Si sedan exterior",
    imageCredit: "auto-data.net",
    imagePublisher: "auto-data.net",
    epaId: "48178",
    engine: {
      slug: "honda-l15ca-200",
      name: "1.5L Inline-4 turbo (L15CA)",
      code: "L15CA",
      fuelType: "PETROL",
      displacementCc: 1498,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "honda-civic-si-6mt",
      name: "6-speed manual",
      type: "MANUAL",
      gearCount: 6,
    },
    dimensions: {
      // Edmunds / Honda.com 2025 Civic Si; GC Honda CA Civic family 134 mm
      lengthIn: 184.0,
      widthIn: 70.9,
      heightIn: 55.5,
      wheelbaseIn: 107.7,
      frontTrackIn: 60.5,
      rearTrackIn: 61.7,
      groundClearanceIn: 5.3,
      curbWeightKg: lbsToKg(2952),
      // GVWR ≈ curb + Honda OM max load 680 lbs (manual)
      grossVehicleWeightKg: lbsToKg(2952 + 680),
      cargoVolumeLiters: cuFtToLiters(14.4),
      seatingCapacity: 5,
    },
    performance: {
      // KBB / Honda Si 200 hp / 192 lb-ft; 0–60 ~6.5 C&D class
      powerHp: 200,
      torqueLbFt: 192,
      zeroToSixtySeconds: 6.5,
      // Motor Trend instrumented 2025 Civic Si
      quarterMileSeconds: 15.4,
      // estimate: C&D est top speed for 2025 Civic Si
      topSpeedMph: 135,
    },
    // EPA id 48178 — 27/37/31 Si 6MT
    fuelEconomy: { cityMpg: 27, highwayMpg: 37, combinedMpg: 31 },
    // MotorAuthority $31,045 incl. $1,095 → $29,950 excl.
    baseMsrpCents: 2_995_000,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "edmunds-2025-honda-civic-si",
    priceSourceSlug: "motorauthority-2025-civic-si-type-r-price",
  },
  {
    slug: "2020-honda-civic-si-coupe-us",
    name: "Civic Si Coupe",
    modelSlug: "honda-civic-si-coupe",
    modelName: "Civic Si Coupe",
    year: 2020,
    generationCode: "FC",
    generationLabel: "Tenth generation Si coupe (FC) final US year",
    generationStartYear: 2017,
    bodyStyle: "COUPE",
    drivetrain: "FWD",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/19_Honda_Civic_Si_Coupe.jpg/1280px-19_Honda_Civic_Si_Coupe.jpg",
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:19_Honda_Civic_Si_Coupe.jpg",
    imageAlt: "2020 Honda Civic Si Coupe exterior",
    imageCredit: "Wikimedia Commons",
    imagePublisher: "Wikimedia Commons",
    epaId: "41884",
    description:
      "2020 Honda Civic Si Coupe (US) — final US Si coupe model year.",
    engine: {
      // Factory code L15B7 (Si tune, auto-data / Honda); shares Engine.code with
      // Touring 174 hp L15B7 via ensureHondaEngine uniqueness — HP on VehiclePerformance.
      slug: "honda-l15b7-si-205",
      name: "1.5L Inline-4 turbo (L15B7)",
      code: "L15B7",
      fuelType: "PETROL",
      displacementCc: 1498,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "honda-civic-si-6mt-fc",
      name: "6-speed manual",
      type: "MANUAL",
      gearCount: 6,
    },
    dimensions: {
      // Edmunds / Honda Info Center Si Coupe; GC Honda CA Si 120 mm no-load
      lengthIn: 177.3,
      widthIn: 70.9,
      heightIn: 54.9,
      wheelbaseIn: 106.3,
      // Honda CA Si coupe track 1537/1555 mm
      frontTrackIn: 60.5,
      rearTrackIn: 61.2,
      groundClearanceIn: 4.7,
      curbWeightKg: lbsToKg(2889),
      // GVWR ≈ curb + Honda OM max load 680 lbs (manual)
      grossVehicleWeightKg: lbsToKg(2889 + 680),
      cargoVolumeLiters: cuFtToLiters(11.9),
      seatingCapacity: 5,
    },
    performance: {
      // 205 hp / ~192 lb-ft Si; 0–60 ~6.4 class
      powerHp: 205,
      torqueLbFt: 192,
      zeroToSixtySeconds: 6.4,
      // Automobile magazine instrumented 2020 Civic Si
      quarterMileSeconds: 14.6,
      // C&D instrumented 10th-gen Si (gov ltd)
      topSpeedMph: 137,
    },
    // EPA id 41884 — Civic 2Dr Man 6-spd 1.5T 26/36/30
    fuelEconomy: { cityMpg: 26, highwayMpg: 36, combinedMpg: 30 },
    // Edmunds Si Coupe $25,000 excl. destination
    baseMsrpCents: 2_500_000,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "edmunds-2020-honda-civic-coupe",
    priceSourceSlug: "edmunds-2020-honda-civic-coupe-price",
  },
  {
    slug: "2025-honda-civic-type-r-us",
    name: "Civic Type R",
    modelSlug: "honda-civic-type-r",
    modelName: "Civic Type R",
    year: 2025,
    generationCode: "FL5",
    generationLabel: "Civic Type R (FL5)",
    generationStartYear: 2023,
    bodyStyle: "HATCHBACK",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f62/Honda-Civic-XI-Type-R.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-civic-type-r-fl5-generation-9019",
    imageAlt: "2025 Honda Civic Type R FL5 exterior",
    imageCredit: "auto-data.net",
    imagePublisher: "auto-data.net",
    epaId: "48042",
    engine: {
      slug: "honda-k20c1-315",
      name: "2.0L Inline-4 turbo (K20C1)",
      code: "K20C1",
      fuelType: "PETROL",
      displacementCc: 1996,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "honda-type-r-6mt",
      name: "6-speed manual with rev-match",
      type: "MANUAL",
      gearCount: 6,
    },
    dimensions: {
      // Honda.com / Edmunds 2025 Type R
      lengthIn: 180.9,
      widthIn: 74.4,
      heightIn: 55.4,
      wheelbaseIn: 107.7,
      frontTrackIn: 64.0,
      rearTrackIn: 63.5,
      groundClearanceIn: 4.8,
      curbWeightKg: lbsToKg(3188),
      // GVWR ≈ curb + Honda OM max load 680 lbs (manual / Type R)
      grossVehicleWeightKg: lbsToKg(3188 + 680),
      cargoVolumeLiters: cuFtToLiters(24.5),
      seatingCapacity: 4,
    },
    performance: {
      // Honda 315 hp / 310 lb-ft; 0–60 ~4.9 C&D FL5 class
      powerHp: 315,
      torqueLbFt: 310,
      zeroToSixtySeconds: 4.9,
      // C&D instrumented FL5 Type R
      quarterMileSeconds: 13.5,
      // Honda / C&D manufacturer claim
      topSpeedMph: 169,
    },
    // EPA id 48042 — 22/28/24 Type R 6MT
    fuelEconomy: { cityMpg: 22, highwayMpg: 28, combinedMpg: 24 },
    // Edmunds $45,595 excl. destination ($46,690 incl. $1,095)
    baseMsrpCents: 4_559_500,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "honda-com-2025-civic-type-r-specs",
    priceSourceSlug: "edmunds-2025-honda-civic-type-r-price",
  },
];

const STATIC_SKIPPED = [
  "Civic mid-years 2016–2024 (sedan/hatch/Si/Type R): out of current/final-year representative scope — seeded MY2025 (or MY2020 final coupe/Si coupe)",
  "Civic Sedan EX/EX-L/Touring appearance packages: same powertrains as LX/Sport/Hybrid — seeded LX + Sport + Sport Hybrid",
  "Civic Hatchback EX-L: discontinued for MY2025 hatch lineup (Sport / Sport Hybrid / Sport Touring Hybrid only) — seeded Sport + Sport Hybrid",
  "Civic Sport Touring Hybrid sedan/hatch: upper hybrid appearance package — seeded Sport Hybrid as hybrid representative",
  "Civic Hybrid Sedan MY2015: lone interim hybrid year skipped (easy-skip per brief); current hybrid returns MY2025",
  "Civic Natural Gas MY2015: FuelType enum has no CNG; auto-data generation pages returned non-Civic exteriors; skipped pending sourced PETROL+CNG-note record with verified Civic CNG exterior",
  "Civic Si Coupe mid-years 2017–2019: seeded final MY2020 only",
  "Civic Type R FK8 2017–2021: seeded current FL5 MY2025 only",
  "Civic Coupe EX (final year): Touring seeded as upper final coupe trim",
];

const MODEL_DEFS: { slug: ModelSlug; name: string }[] = [
  { slug: "honda-civic", name: "Civic" },
  { slug: "honda-civic-coupe", name: "Civic Coupe" },
  { slug: "honda-civic-hatchback", name: "Civic Hatchback" },
  { slug: "honda-civic-si", name: "Civic Si" },
  { slug: "honda-civic-si-coupe", name: "Civic Si Coupe" },
  { slug: "honda-civic-type-r", name: "Civic Type R" },
];

export async function seedHondaCivic(
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
      type: sourceData.type,
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
      type: sourceData.type,
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
        slug: `image-${trim.slug}`,
        title: `${trim.name} exterior (${trim.imagePublisher})`,
        pageUrl: trim.imagePageUrl,
        publisher: trim.imagePublisher,
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

      const engine = await ensureHondaEngine(prisma, {
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
        title: `EPA Fuel Economy — ${trim.year} Honda ${trim.name}`,
        publisher: "U.S. EPA",
        url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
        type: "GOVERNMENT",
      });

      const description =
        trim.description ?? `${trim.year} Honda ${trim.name} (US).`;

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
          description,
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
          description,
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

      const citationTasks = [
        upsertCitation(
          prisma,
          specSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "Power, torque, 0–60, quarter-mile, and top speed",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Exterior dimensions, track, clearance, curb/GVWR, cargo",
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
          `${trim.imagePublisher} exterior asset`,
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
