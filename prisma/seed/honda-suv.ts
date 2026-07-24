/**
 * Honda SUV / crossover seed module (US market).
 * Crosstour EX-L V6 MY2015 (final), HR-V LX + Sport MY2025, CR-V EX-L +
 * Sport Hybrid MY2025, CR-V e:FCEV MY2025, Passport EX-L MY2025, Pilot Sport
 * MY2025, Prologue Touring AWD MY2025. Prefer unique auto-data.net exteriors.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Exterior images (unique):
 * - https://www.auto-data.net/images/f77/Honda-Crosstour-facelift-2012.jpg
 * - https://www.auto-data.net/images/f41/Honda-HR-V-III-facelift-2024.jpg
 * - https://www.auto-data.net/images/f63/Honda-HR-V-III-facelift-2024.jpg
 * - https://www.auto-data.net/images/f50/Honda-CR-V-VI.jpg
 * - https://www.auto-data.net/images/f110/Honda-CR-V-VI.jpg
 * - https://www.auto-data.net/images/f90/Honda-CR-V-VI.jpg
 * - https://www.auto-data.net/images/f80/Honda-Passport-III-facelift-2021.jpg
 * - https://www.auto-data.net/images/f54/Honda-Pilot-IV.jpg
 * - https://www.auto-data.net/images/f84/Honda-Prologue.jpg
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

/** 2015 Crosstour destination (iSeeCars MSRP table / Honda footnotes era). */
const CROSSTOUR_2015_DESTINATION_CENTS = 88_000;

/** 2025 Prologue D&H $1,450 (Electrek / Edmunds MY2025 Prologue coverage). */
const PROLOGUE_2025_DESTINATION_CENTS = 145_000;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

type ModelSlug =
  | "honda-crosstour"
  | "honda-hr-v"
  | "honda-cr-v"
  | "honda-cr-v-hybrid"
  | "honda-cr-v-efcev"
  | "honda-passport"
  | "honda-pilot"
  | "honda-prologue";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: string;
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
    frontTrackIn: number;
    rearTrackIn: number;
    groundClearanceIn: number;
    curbWeightKg: number;
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
    slug: "hondanews-2015-crosstour-pricing",
    title: "2015 Honda Crosstour Pricing and EPA Data (Honda Newsroom)",
    url: "https://hondanews.com/en-US/releases/release-f9cb5349f4aa4684acac438dcdda66b4-2015-honda-crosstour-pricing-and-epa-data",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "edmunds-2015-honda-crosstour-ex-l-v6",
    title: "2015 Honda Crosstour EX-L V6 Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/honda/crosstour/2015/st-200712329/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2025-honda-hr-v",
    title: "2025 Honda HR-V Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/honda/hr-v-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "edmunds-2025-honda-hr-v",
    title: "2025 Honda HR-V Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/honda/hr-v/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2025-honda-cr-v",
    title: "2025 Honda CR-V Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/honda/cr-v-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "hondanews-2025-cr-v-specs",
    title: "2025 Honda CR-V Specifications and Features (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-f43bcac5ded8efe77b071fcb0c097416-2025-honda-cr-v-specifications-and-features",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "edmunds-2025-honda-cr-v-sport-hybrid",
    title: "2025 Honda CR-V Sport Hybrid Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/honda/cr-v/2025/st-402034745/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2025-honda-cr-v-efcev",
    title: "Honda CR-V e:FCEV Drive / Fuel Cell Review (Car and Driver)",
    url: "https://www.caranddriver.com/reviews/a60241894/2025-honda-cr-v-fuel-cell-drive/",
    publisher: "Car and Driver",
  },
  {
    slug: "hondanews-2025-cr-v-efcev-specs",
    title: "2025 Honda CR-V e:FCEV Specifications & Features (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-5f60982dadd5edbf5cfac0899102b603-2025-honda-cr-v-efcev-specifications-features",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "caranddriver-2025-honda-passport",
    title: "2025 Honda Passport Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/honda/passport-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "edmunds-2025-honda-passport",
    title: "2025 Honda Passport Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/honda/passport/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2025-honda-pilot",
    title: "2025 Honda Pilot Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/honda/pilot-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "edmunds-2025-honda-pilot-ex-l",
    title: "2025 Honda Pilot EX-L Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/honda/pilot/2025/st-402027909/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2024-honda-prologue-test",
    title: "Tested: 2024 Honda Prologue Is a Better EV Than It Is a Honda (Car and Driver)",
    url: "https://www.caranddriver.com/reviews/a46788612/2024-honda-prologue-ev-drive/",
    publisher: "Car and Driver",
  },
  {
    slug: "caranddriver-2025-honda-prologue",
    title: "2025 Honda Prologue Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/honda/prologue-2025",
    publisher: "Car and Driver",
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "hondanews-2015-crosstour-msrp",
    title:
      "2015 Honda Crosstour EX-L V6 2WD MSRP $33,840 excl. destination (Honda Newsroom)",
    url: "https://hondanews.com/en-US/releases/release-f9cb5349f4aa4684acac438dcdda66b4-2015-honda-crosstour-pricing-and-epa-data",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "edmunds-2025-honda-hr-v-price",
    title:
      "2025 Honda HR-V Specs & Features (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/honda/hr-v/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "cargurus-2025-honda-cr-v-ex-l-price",
    title: "2025 Honda CR-V EX-L FWD MSRP $35,000 (CarGurus trim table)",
    url: "https://www.cargurus.com/Cars/2025-Honda-CR-V-Value-c33413",
    publisher: "CarGurus",
  },
  {
    slug: "edmunds-2025-honda-cr-v-hybrid-price",
    title:
      "2025 Honda CR-V Sport Hybrid Specs (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/honda/cr-v/2025/st-402034745/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-honda-cr-v-efcev-price",
    title: "2025 Honda CR-V e:FCEV MSRP $50,000 (Edmunds)",
    url: "https://www.edmunds.com/honda/cr-v-efcev/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-honda-passport-price",
    title:
      "2025 Honda Passport EX-L MSRP $42,400 excl. destination (Edmunds)",
    url: "https://www.edmunds.com/honda/passport/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "cars-com-2025-honda-pilot-price",
    title: "2025 Honda Pilot Sport AWD MSRP $42,300 (Cars.com specs)",
    url: "https://www.cars.com/research/honda-pilot-2025/specs/",
    publisher: "Cars.com",
  },
  {
    slug: "edmunds-2025-honda-prologue-price",
    title:
      "2025 Honda Prologue Touring AWD MSRP $54,700 excl. destination (Edmunds)",
    url: "https://www.edmunds.com/honda/prologue/2025/deals/",
    publisher: "Edmunds",
  },
] as const;

const DESTINATION_SOURCE_COMPACT = {
  slug: "honda-us-destination-compact-suv",
  title:
    "Honda US destination & handling — compact SUV class (HR-V / CR-V / Crosstour)",
  url: "https://automobiles.honda.com/",
  type: "MANUFACTURER" as const,
  publisher: "American Honda Motor Co.",
};

const DESTINATION_SOURCE_MID = {
  slug: "honda-us-destination-mid-suv-van",
  title:
    "Honda US destination & handling — midsize SUV / van class (Passport / Pilot)",
  url: "https://automobiles.honda.com/",
  type: "MANUFACTURER" as const,
  publisher: "American Honda Motor Co.",
};

const DESTINATION_SOURCE_CROSSTOUR_2015 = {
  slug: "iseecars-2015-honda-crosstour-destination-880",
  title: "2015 Honda Crosstour destination $880 (iSeeCars MSRP table)",
  url: "https://www.iseecars.com/car/honda-crosstour-price",
  type: "THIRD_PARTY" as const,
  publisher: "iSeeCars",
};

const DESTINATION_SOURCE_PROLOGUE_2025 = {
  slug: "electrek-2025-honda-prologue-destination-1450",
  title: "2025 Honda Prologue destination & handling $1,450 (Electrek)",
  url: "https://electrek.co/2025/03/03/honda-prologue-upgraded-300-mi-range-same-price-2025/",
  type: "THIRD_PARTY" as const,
  publisher: "Electrek",
};

/**
 * Sourced US trims only. Incomplete / out-of-scope variants via STATIC_SKIPPED.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2015-honda-crosstour-ex-l-v6-us",
    name: "Crosstour EX-L V6",
    modelSlug: "honda-crosstour",
    modelName: "Crosstour",
    year: 2015,
    generationCode: "TF1-FL2012",
    generationLabel: "First generation facelift (2012–2015)",
    generationStartYear: 2009,
    bodyStyle: "CROSSOVER",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f77/Honda-Crosstour-facelift-2012.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-crosstour-facelift-2012-generation-8965",
    imageAlt: "2015 Honda Crosstour EX-L V6 exterior",
    epaId: "35692",
    engine: {
      slug: "honda-j35y1-crosstour",
      name: "3.5L V6 i-VTEC",
      code: "J35Y1",
      fuelType: "PETROL",
      displacementCc: 3471,
      cylinderCount: 6,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "honda-6at-crosstour",
      name: "6-speed automatic",
      type: "AUTOMATIC",
      gearCount: 6,
    },
    dimensions: {
      // Edmunds / JD Power Crosstour EX-L V6 2WD
      lengthIn: 196.8,
      widthIn: 74.7,
      heightIn: 61.5,
      wheelbaseIn: 110.1,
      frontTrackIn: 64.9,
      rearTrackIn: 64.9,
      groundClearanceIn: 6.2,
      curbWeightKg: lbsToKg(3903),
      // 2015 Crosstour owners manual GVWR 2WD
      grossVehicleWeightKg: lbsToKg(4938),
      cargoVolumeLiters: cuFtToLiters(25.7),
      seatingCapacity: 5,
    },
    performance: {
      // Honda Newsroom 278 hp; torque per Edmunds EX-L V6
      powerHp: 278,
      torqueLbFt: 252,
      // Period instrumented tests of Crosstour V6 ~6.5 sec
      zeroToSixtySeconds: 6.5,
      // estimate: autofiles EX-L V6 FWD band with 6.5 0–60
      quarterMileSeconds: 14.9,
      // estimate: C&D Accordion Crosstour V6 governor (prior gen)
      topSpeedMph: 121,
    },
    // EPA id 35692 — 20/29/23
    fuelEconomy: { cityMpg: 20, highwayMpg: 29, combinedMpg: 23 },
    // Honda Newsroom EX-L V6 2WD
    baseMsrpCents: 3_384_000,
    destinationCents: CROSSTOUR_2015_DESTINATION_CENTS,
    specSourceSlug: "edmunds-2015-honda-crosstour-ex-l-v6",
    priceSourceSlug: "hondanews-2015-crosstour-msrp",
  },
  {
    slug: "2025-honda-hr-v-lx-us",
    name: "HR-V LX",
    modelSlug: "honda-hr-v",
    modelName: "HR-V",
    year: 2025,
    generationCode: "RV-FL2024",
    generationLabel: "Third generation facelift (2024+)",
    generationStartYear: 2022,
    bodyStyle: "CROSSOVER",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f41/Honda-HR-V-III-facelift-2024.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-hr-v-iii-facelift-2024-generation-10160",
    imageAlt: "2025 Honda HR-V LX exterior",
    epaId: "47783",
    engine: {
      slug: "honda-k20c2-hr-v",
      name: "2.0L Inline-4 i-VTEC",
      code: "K20C2",
      fuelType: "PETROL",
      displacementCc: 1996,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "honda-cvt-hr-v",
      name: "Continuously variable transmission (CVT)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Honda Newsroom / Edmunds 2025 HR-V LX FWD
      lengthIn: 179.8,
      widthIn: 72.4,
      heightIn: 63.4,
      wheelbaseIn: 104.5,
      frontTrackIn: 62.6,
      rearTrackIn: 63.2,
      groundClearanceIn: 7.0,
      curbWeightKg: lbsToKg(3159),
      // iSeeCars / dealer weight rating LX FWD
      grossVehicleWeightKg: lbsToKg(4210),
      cargoVolumeLiters: cuFtToLiters(24.4),
      seatingCapacity: 5,
    },
    performance: {
      // Edmunds / C&D 158 hp / 138 lb-ft; ~9.5 sec class tests
      powerHp: 158,
      torqueLbFt: 138,
      zeroToSixtySeconds: 9.5,
      // estimate: C&D 2023 HR-V AWD EX-L 17.3 @ 9.4 0–60; FWD ~0.1 slower
      quarterMileSeconds: 17.4,
      // C&D est top speed (same gen HR-V)
      topSpeedMph: 115,
    },
    // EPA id 47783 — 26/32/28
    fuelEconomy: { cityMpg: 26, highwayMpg: 32, combinedMpg: 28 },
    // Edmunds LX FWD
    baseMsrpCents: 2_540_000,
    destinationCents: HONDA_DESTINATION_CENTS.compactSuv,
    specSourceSlug: "edmunds-2025-honda-hr-v",
    priceSourceSlug: "edmunds-2025-honda-hr-v-price",
  },
  {
    slug: "2025-honda-hr-v-sport-awd-us",
    name: "HR-V Sport AWD",
    modelSlug: "honda-hr-v",
    modelName: "HR-V",
    year: 2025,
    generationCode: "RV-FL2024",
    generationLabel: "Third generation facelift (2024+)",
    generationStartYear: 2022,
    bodyStyle: "CROSSOVER",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f63/Honda-HR-V-III-facelift-2024.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-hr-v-iii-facelift-2024-generation-10160",
    imageAlt: "2025 Honda HR-V Sport AWD exterior",
    epaId: "47782",
    engine: {
      slug: "honda-k20c2-hr-v",
      name: "2.0L Inline-4 i-VTEC",
      code: "K20C2",
      fuelType: "PETROL",
      displacementCc: 1996,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "honda-cvt-hr-v",
      name: "Continuously variable transmission (CVT)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Honda Newsroom Sport AWD; curb for AWD Sport ~3311
      lengthIn: 179.8,
      widthIn: 72.4,
      heightIn: 63.8,
      wheelbaseIn: 104.5,
      frontTrackIn: 62.6,
      rearTrackIn: 63.2,
      groundClearanceIn: 7.3,
      curbWeightKg: lbsToKg(3311),
      // iSeeCars / dealer weight rating Sport AWD
      grossVehicleWeightKg: lbsToKg(4188),
      cargoVolumeLiters: cuFtToLiters(24.4),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 158,
      torqueLbFt: 138,
      // Motor Matchup / class AWD tests ~9.4; C&D EX-L AWD 9.4
      zeroToSixtySeconds: 9.4,
      // C&D instrumented 2023 HR-V EX-L AWD (same 158-hp / CVT)
      quarterMileSeconds: 17.3,
      // C&D est top speed
      topSpeedMph: 115,
    },
    // EPA id 47782 — 25/30/27
    fuelEconomy: { cityMpg: 25, highwayMpg: 30, combinedMpg: 27 },
    // Edmunds Sport AWD
    baseMsrpCents: 2_900_000,
    destinationCents: HONDA_DESTINATION_CENTS.compactSuv,
    specSourceSlug: "caranddriver-2025-honda-hr-v",
    priceSourceSlug: "edmunds-2025-honda-hr-v-price",
  },
  {
    slug: "2025-honda-cr-v-ex-l-us",
    name: "CR-V EX-L",
    modelSlug: "honda-cr-v",
    modelName: "CR-V",
    year: 2025,
    generationCode: "RW",
    generationLabel: "Sixth generation (RW)",
    generationStartYear: 2022,
    bodyStyle: "SUV",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f50/Honda-CR-V-VI.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-cr-v-vi-generation-8960",
    imageAlt: "2025 Honda CR-V EX-L exterior",
    epaId: "47949",
    engine: {
      slug: "honda-l15be-cr-v",
      name: "1.5L Inline-4 turbo VTEC",
      code: "L15BE",
      fuelType: "PETROL",
      displacementCc: 1498,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharged",
      electrification: null,
    },
    transmission: {
      slug: "honda-cvt-cr-v-gas",
      name: "Continuously variable transmission (CVT)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Honda Newsroom / Edmunds CR-V gas 2WD
      lengthIn: 184.8,
      widthIn: 73.5,
      heightIn: 66.2,
      wheelbaseIn: 106.3,
      frontTrackIn: 63.4,
      rearTrackIn: 64.1,
      groundClearanceIn: 7.8,
      curbWeightKg: lbsToKg(3472),
      // GVWR ≈ curb + Honda CR-V OM max load 850 lbs
      grossVehicleWeightKg: lbsToKg(3472 + 850),
      cargoVolumeLiters: cuFtToLiters(39.3),
      seatingCapacity: 5,
    },
    performance: {
      // Honda Newsroom 190/179; C&D EX-L instrumented 8.1
      powerHp: 190,
      torqueLbFt: 179,
      zeroToSixtySeconds: 8.1,
      // C&D instrumented 2023 CR-V EX-L (same 1.5T / CVT)
      quarterMileSeconds: 16.3,
      // C&D est top speed (gas CR-V)
      topSpeedMph: 130,
    },
    // EPA id 47949 — 28/34/30
    fuelEconomy: { cityMpg: 28, highwayMpg: 34, combinedMpg: 30 },
    // CarGurus / CareEdge EX-L FWD
    baseMsrpCents: 3_500_000,
    destinationCents: HONDA_DESTINATION_CENTS.compactSuv,
    specSourceSlug: "caranddriver-2025-honda-cr-v",
    priceSourceSlug: "cargurus-2025-honda-cr-v-ex-l-price",
  },
  {
    slug: "2025-honda-cr-v-sport-hybrid-us",
    name: "CR-V Sport Hybrid",
    modelSlug: "honda-cr-v-hybrid",
    modelName: "CR-V Hybrid",
    year: 2025,
    generationCode: "RW-HYBRID",
    generationLabel: "Sixth generation hybrid (RW)",
    generationStartYear: 2022,
    bodyStyle: "SUV",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f110/Honda-CR-V-VI.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-cr-v-vi-generation-8960",
    imageAlt: "2025 Honda CR-V Sport Hybrid exterior",
    epaId: "47950",
    engine: {
      slug: "honda-lfb1-cr-v-hybrid",
      name: "2.0L Inline-4 hybrid (system)",
      code: "LFB1",
      fuelType: "HYBRID",
      displacementCc: 1993,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "Two-motor hybrid (combined 204 hp)",
    },
    transmission: {
      slug: "honda-ecvt-cr-v-hybrid",
      name: "Electronically controlled CVT (e-CVT)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Honda Newsroom / Edmunds Sport Hybrid FWD
      lengthIn: 184.8,
      widthIn: 73.5,
      heightIn: 66.2,
      wheelbaseIn: 106.3,
      frontTrackIn: 63.4,
      rearTrackIn: 64.1,
      groundClearanceIn: 7.8,
      curbWeightKg: lbsToKg(3752),
      // GVWR ≈ curb + Honda CR-V Hybrid OM max load 850 lbs
      grossVehicleWeightKg: lbsToKg(3752 + 850),
      cargoVolumeLiters: cuFtToLiters(36.3),
      seatingCapacity: 5,
    },
    performance: {
      // Honda system 204 hp; ICE torque 138; class tests ~7.6
      powerHp: 204,
      torqueLbFt: 138,
      zeroToSixtySeconds: 7.6,
      // estimate: C&D CR-V Hybrid 16.3 @ ~7.9 0–60; ~0.3 quicker here
      quarterMileSeconds: 16.0,
      // C&D governor-limited hybrid CR-V
      topSpeedMph: 111,
    },
    // EPA id 47950 — 43/36/40
    fuelEconomy: { cityMpg: 43, highwayMpg: 36, combinedMpg: 40 },
    // Edmunds Sport Hybrid FWD $34,650
    baseMsrpCents: 3_465_000,
    destinationCents: HONDA_DESTINATION_CENTS.compactSuv,
    specSourceSlug: "hondanews-2025-cr-v-specs",
    priceSourceSlug: "edmunds-2025-honda-cr-v-hybrid-price",
  },
  {
    slug: "2025-honda-cr-v-efcev-us",
    name: "CR-V e:FCEV",
    modelSlug: "honda-cr-v-efcev",
    modelName: "CR-V e:FCEV",
    year: 2025,
    generationCode: "RW-EFCEV",
    generationLabel: "Sixth generation fuel cell (RW)",
    generationStartYear: 2024,
    bodyStyle: "SUV",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f90/Honda-CR-V-VI.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-cr-v-vi-generation-8960",
    imageAlt: "2025 Honda CR-V e:FCEV exterior",
    epaId: "50270",
    engine: {
      slug: "honda-cr-v-efcev-stack",
      name: "Hydrogen fuel cell + plug-in electric motor",
      code: "FC-STACK-CRV-EFCEV",
      fuelType: "HYDROGEN",
      displacementCc: null,
      cylinderCount: null,
      configuration: "Fuel cell",
      induction: null,
      electrification: "e:FCEV PEMFC + 17.7 kWh plug-in (174 hp)",
    },
    transmission: {
      slug: "honda-efcev-single-speed",
      name: "Single-speed reduction gear",
      type: "AUTOMATIC",
      gearCount: 1,
    },
    dimensions: {
      // Honda Info Center / Newsroom e:FCEV
      lengthIn: 187.6,
      widthIn: 73.5,
      heightIn: 66.5,
      wheelbaseIn: 106.3,
      frontTrackIn: 63.4,
      rearTrackIn: 64.0,
      groundClearanceIn: 6.7,
      curbWeightKg: lbsToKg(4460),
      // GVWR ≈ curb + Honda CR-V family OM max load 850 lbs
      grossVehicleWeightKg: lbsToKg(4460 + 850),
      cargoVolumeLiters: cuFtToLiters(25.2),
      seatingCapacity: 5,
    },
    performance: {
      // Honda Newsroom 174 hp / 229 lb-ft; C&D est 8.6
      powerHp: 174,
      torqueLbFt: 229,
      zeroToSixtySeconds: 8.6,
      // estimate: C&D CR-V e:FCEV performance estimate (same review as 8.6 0–60)
      quarterMileSeconds: 17.8,
      // estimate: compact Honda crossover governor band
      topSpeedMph: 115,
    },
    // Honda Newsroom MPGe 61/52/57; EPA total range 270 (29 EV + H2)
    fuelEconomy: {
      cityMpg: 61,
      highwayMpg: 52,
      combinedMpg: 57,
      electricRangeMiles: 270,
    },
    // Edmunds / Honda $50,000 MSRP (CA lease program)
    baseMsrpCents: 5_000_000,
    destinationCents: HONDA_DESTINATION_CENTS.compactSuv,
    specSourceSlug: "caranddriver-2025-honda-cr-v-efcev",
    priceSourceSlug: "edmunds-2025-honda-cr-v-efcev-price",
  },
  {
    slug: "2025-honda-passport-ex-l-us",
    name: "Passport EX-L",
    modelSlug: "honda-passport",
    modelName: "Passport",
    year: 2025,
    generationCode: "YF7-FL2021",
    generationLabel: "Third generation facelift (2021–2025)",
    generationStartYear: 2018,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f80/Honda-Passport-III-facelift-2021.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-passport-iii-facelift-2021-generation-9244",
    imageAlt: "2025 Honda Passport EX-L exterior",
    epaId: "48092",
    engine: {
      slug: "honda-j35y6-passport",
      name: "3.5L V6 i-VTEC",
      code: "J35Y6",
      fuelType: "PETROL",
      displacementCc: 3471,
      cylinderCount: 6,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "honda-9at-passport",
      name: "9-speed automatic",
      type: "AUTOMATIC",
      gearCount: 9,
    },
    dimensions: {
      // Honda Newsroom / Edmunds 2025 Passport EX-L
      lengthIn: 189.1,
      widthIn: 78.6,
      heightIn: 71.6,
      wheelbaseIn: 110.9,
      frontTrackIn: 66.7,
      rearTrackIn: 66.7,
      groundClearanceIn: 8.1,
      curbWeightKg: lbsToKg(4236),
      // Dealer / Chrome Data GVWR EX-L AWD
      grossVehicleWeightKg: lbsToKg(5401),
      cargoVolumeLiters: cuFtToLiters(50.5),
      seatingCapacity: 5,
    },
    performance: {
      // Edmunds 280/262; prior-gen EX-L tests ~6.4
      powerHp: 280,
      torqueLbFt: 262,
      zeroToSixtySeconds: 6.4,
      // estimate: prior-gen Passport V6 C&D band (~14.9) with 6.4 0–60
      quarterMileSeconds: 15.0,
      // estimate: Honda midsize SUV governor (Pilot/Passport class)
      topSpeedMph: 112,
    },
    // EPA id 48092 — 19/24/21
    fuelEconomy: { cityMpg: 19, highwayMpg: 24, combinedMpg: 21 },
    // Edmunds EX-L AWD
    baseMsrpCents: 4_240_000,
    destinationCents: HONDA_DESTINATION_CENTS.midSuvVan,
    specSourceSlug: "edmunds-2025-honda-passport",
    priceSourceSlug: "edmunds-2025-honda-passport-price",
  },
  {
    slug: "2025-honda-pilot-sport-awd-us",
    name: "Pilot Sport AWD",
    modelSlug: "honda-pilot",
    modelName: "Pilot",
    year: 2025,
    generationCode: "YF8",
    generationLabel: "Fourth generation (YF8)",
    generationStartYear: 2022,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f54/Honda-Pilot-IV.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-pilot-iv-generation-9231",
    imageAlt: "2025 Honda Pilot Sport AWD exterior",
    epaId: "47753",
    engine: {
      slug: "honda-j35y8-pilot",
      name: "3.5L V6 i-VTEC",
      code: "J35Y8",
      fuelType: "PETROL",
      displacementCc: 3471,
      cylinderCount: 6,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "honda-10at-pilot",
      name: "10-speed automatic",
      type: "AUTOMATIC",
      gearCount: 10,
    },
    dimensions: {
      // Honda / Edmunds / Cars.com Pilot Sport
      lengthIn: 199.9,
      widthIn: 78.5,
      heightIn: 70.9,
      wheelbaseIn: 113.8,
      frontTrackIn: 67.5,
      rearTrackIn: 67.8,
      groundClearanceIn: 7.3,
      curbWeightKg: lbsToKg(4488),
      // GVWR ≈ curb + Honda Pilot OM max load 1,340 lbs (8-seat)
      grossVehicleWeightKg: lbsToKg(4488 + 1340),
      cargoVolumeLiters: cuFtToLiters(18.6),
      seatingCapacity: 8,
    },
    performance: {
      // C&D Elite AWD instrumented 7.2 (same 285-hp V6 / 10AT)
      powerHp: 285,
      torqueLbFt: 262,
      zeroToSixtySeconds: 7.2,
      // C&D instrumented Pilot Elite AWD
      quarterMileSeconds: 15.7,
      // C&D governor-limited
      topSpeedMph: 112,
    },
    // EPA id 47753 — 19/25/21
    fuelEconomy: { cityMpg: 19, highwayMpg: 25, combinedMpg: 21 },
    // Cars.com Sport AWD
    baseMsrpCents: 4_230_000,
    destinationCents: HONDA_DESTINATION_CENTS.midSuvVan,
    specSourceSlug: "caranddriver-2025-honda-pilot",
    priceSourceSlug: "cars-com-2025-honda-pilot-price",
  },
  {
    slug: "2025-honda-prologue-touring-awd-us",
    name: "Prologue Touring AWD",
    modelSlug: "honda-prologue",
    modelName: "Prologue",
    year: 2025,
    generationCode: "PROLOGUE-1",
    generationLabel: "First generation (GM Ultium)",
    generationStartYear: 2024,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f84/Honda-Prologue.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-prologue-generation-10274",
    imageAlt: "2025 Honda Prologue Touring AWD exterior",
    epaId: "49089",
    engine: {
      slug: "honda-prologue-dual-motor",
      name: "Dual-motor electric (AWD)",
      code: "EV-PROLOGUE-AWD",
      fuelType: "ELECTRIC",
      displacementCc: null,
      cylinderCount: null,
      configuration: "Dual motor",
      induction: null,
      electrification: "BEV dual-motor AWD (300 hp / 355 lb-ft)",
    },
    transmission: {
      slug: "honda-prologue-single-speed",
      name: "Single-speed reduction gear",
      type: "AUTOMATIC",
      gearCount: 1,
    },
    dimensions: {
      // Honda Newsroom / CA Prologue specs (US shared)
      lengthIn: 192.0,
      widthIn: 78.3,
      heightIn: 64.8,
      wheelbaseIn: 121.8,
      frontTrackIn: 66.1,
      rearTrackIn: 66.3,
      groundClearanceIn: 8.1,
      curbWeightKg: lbsToKg(5115),
      // Honda CA GVWR 3,000 kg / US dealer 6,614 lbs
      grossVehicleWeightKg: lbsToKg(6614),
      cargoVolumeLiters: cuFtToLiters(23.7),
      seatingCapacity: 5,
    },
    performance: {
      // C&D 2025: 300 hp AWD; instrumented 2024 Elite dual-motor 5.9
      powerHp: 300,
      torqueLbFt: 355,
      zeroToSixtySeconds: 5.9,
      // C&D instrumented 2024 Prologue Elite AWD (same dual-motor)
      quarterMileSeconds: 14.8,
      // C&D governor-limited
      topSpeedMph: 112,
    },
    // EPA id 49089 — 108/90/99 MPGe; range 294
    fuelEconomy: {
      cityMpg: 108,
      highwayMpg: 90,
      combinedMpg: 99,
      electricRangeMiles: 294,
    },
    // Edmunds Touring AWD
    baseMsrpCents: 5_470_000,
    destinationCents: PROLOGUE_2025_DESTINATION_CENTS,
    specSourceSlug: "caranddriver-2025-honda-prologue",
    priceSourceSlug: "edmunds-2025-honda-prologue-price",
  },
];

const STATIC_SKIPPED: string[] = [
  "HR-V EX-L / non-Sport trims: LX + Sport cover FWD/AWD gas powertrain",
  "CR-V LX/EX gas / Sport-L & Sport Touring Hybrid: EX-L + Sport Hybrid cover gas vs hybrid",
  "CR-V e:FCEV: CA lease-focused retail; seeded anyway (EPA id 50270, US MSRP)",
  "Passport TrailSport / Black Edition: EX-L covers final MY of YF7 V6/9AT",
  "Pilot EX-L / TrailSport / Touring / Elite: Sport AWD covers YF8 V6 entry AWD",
  "Prologue EX FWD / Elite AWD: Touring AWD seeded (instrumented dual-motor 0–60); EX FWD lacks published instrumented 0–60",
  "MY2016–2024 interim years / MY2026 incomplete EPA: current (or final) US MY only",
];

const MODEL_DEFS: { slug: ModelSlug; name: string }[] = [
  { slug: "honda-crosstour", name: "Crosstour" },
  { slug: "honda-hr-v", name: "HR-V" },
  { slug: "honda-cr-v", name: "CR-V" },
  { slug: "honda-cr-v-hybrid", name: "CR-V Hybrid" },
  { slug: "honda-cr-v-efcev", name: "CR-V e:FCEV" },
  { slug: "honda-passport", name: "Passport" },
  { slug: "honda-pilot", name: "Pilot" },
  { slug: "honda-prologue", name: "Prologue" },
];

export async function seedHondaSuv(
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

  const destinationSourceCompact = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE_COMPACT.slug,
    title: DESTINATION_SOURCE_COMPACT.title,
    publisher: DESTINATION_SOURCE_COMPACT.publisher,
    url: DESTINATION_SOURCE_COMPACT.url,
    type: DESTINATION_SOURCE_COMPACT.type,
  });
  const destinationSourceMid = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE_MID.slug,
    title: DESTINATION_SOURCE_MID.title,
    publisher: DESTINATION_SOURCE_MID.publisher,
    url: DESTINATION_SOURCE_MID.url,
    type: DESTINATION_SOURCE_MID.type,
  });
  const destinationSourceCrosstour = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE_CROSSTOUR_2015.slug,
    title: DESTINATION_SOURCE_CROSSTOUR_2015.title,
    publisher: DESTINATION_SOURCE_CROSSTOUR_2015.publisher,
    url: DESTINATION_SOURCE_CROSSTOUR_2015.url,
    type: DESTINATION_SOURCE_CROSSTOUR_2015.type,
  });
  const destinationSourcePrologue = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE_PROLOGUE_2025.slug,
    title: DESTINATION_SOURCE_PROLOGUE_2025.title,
    publisher: DESTINATION_SOURCE_PROLOGUE_2025.publisher,
    url: DESTINATION_SOURCE_PROLOGUE_2025.url,
    type: DESTINATION_SOURCE_PROLOGUE_2025.type,
  });

  const specSources = new Map<string, { id: string }>();
  for (const sourceData of SPEC_SOURCES) {
    const source = await upsertCatalogueSource(prisma, {
      slug: sourceData.slug,
      title: sourceData.title,
      publisher: sourceData.publisher,
      url: sourceData.url,
      type: sourceData.slug.startsWith("hondanews")
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
      type: sourceData.slug.startsWith("hondanews")
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
          description: `${trim.year} Honda ${trim.name} (US).`,
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
          description: `${trim.year} Honda ${trim.name} (US).`,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
      });

      const destinationCents = trim.destinationCents;
      let destinationSource = destinationSourceCompact;
      if (destinationCents === CROSSTOUR_2015_DESTINATION_CENTS) {
        destinationSource = destinationSourceCrosstour;
      } else if (destinationCents === PROLOGUE_2025_DESTINATION_CENTS) {
        destinationSource = destinationSourcePrologue;
      } else if (destinationCents === HONDA_DESTINATION_CENTS.midSuvVan) {
        destinationSource = destinationSourceMid;
      }

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
