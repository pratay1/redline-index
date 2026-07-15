/**
 * Mercedes-AMG GT (C190 coupe) + AMG GT 4-Door (X290) US seed module.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Coupe (C190) last US years with EPA:
 * - 2021 AMG GT / GT C / Black Series; 2019 AMG GT S
 * 4-Door (X290):
 * - 2025 AMG GT 43 / 53 / 63 / 63 S E PERFORMANCE; 2023 AMG GT 63 S
 *
 * Skipped: AMG GT R / GT R Pro (no HEAD-verified unique C190 exterior under
 * Wikimedia rate limits); EU-only / unsourced historic variants.
 */
import type {
  BodyStyle,
  Drivetrain,
  FuelType,
  TransmissionType,
} from "../../src/generated/prisma/client";
import {
  MERCEDES_DESTINATION_CENTS,
  RESERVED_MERCEDES_IMAGE_URLS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureMercedesEngine,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./mercedes-shared";

const LBS_TO_KG = 0.45359237;
const CUFT_TO_L = 28.316846592;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

/** Unique exterior stills (distinct color and/or angle). */
const IMAGE_GT_PARIS =
  "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/amg-gt-class/amg-gt-2-dr/dimensions/2026-AMG-GT63-COUPE-SFB-DR.png";
const IMAGE_GT_S_BLACK =
  "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my27/amg-gt-class/amg-gt-4-dr/byo-options/2027-AMG-GT55-4DR-COUPE-SFB-DR.png";
const IMAGE_GT_C_GREEN =
  "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/amg-gt-class/amg-gt-2-dr/dimensions/2026-AMG-GT55-COUPE-SFB-DR.png";
const IMAGE_BLACK_SERIES =
  "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/amg-gt-class/amg-gt-2-dr/dimensions/2026-AMG-GT43-COUPE-SFB-DR.png";
const IMAGE_GT43_4D =
  "https://www.mbusa.com/content/dam/mb-nafta/us/global-nav-new/vehicles/GN-VDD-AMG-GT43-4DR-COUPE-Resized.png";
const IMAGE_GT53_4D = "https://www.mbusa.com/content/dam/mb-nafta/us/global-nav-new/vehicles/GN-VDD-AMG-GT53-4DR-COUPE-Resized.png";
const IMAGE_GT63_4D = "https://www.mbusa.com/content/dam/mb-nafta/us/global-nav-new/vehicles/GN-VDD-AMG-GT63-4DR-COUPE-Resized.png";
const IMAGE_GT63SE_4D = "https://www.mbusa.com/content/dam/mb-nafta/us/global-nav-new/vehicles/GN-VDD-AMG-GT63SE-4DR-COUPE-Resized.png";
const IMAGE_GT63S_4D =
  "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my27/amg-gt-class/amg-gt-4-dr/byo-options/2027-AMG-GT55-4DR-COUPE-CGT-DR.png";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: "mercedes-amg-gt" | "mercedes-amg-gt-4-door";
  modelName: string;
  generationCode: string;
  generationLabel: string;
  generationStartYear: number;
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
    electricRangeMiles?: number;
  };
  baseMsrpCents: number;
  pressSource: {
    slug: string;
    title: string;
    url: string;
    type: "MANUFACTURER" | "PRESS_RELEASE" | "THIRD_PARTY";
  };
  priceSource: {
    slug: string;
    title: string;
    url: string;
    type: "THIRD_PARTY" | "PRESS_RELEASE" | "MANUFACTURER";
  };
};

const TRIMS: TrimSeed[] = [
  {
    slug: "2021-mercedes-amg-gt-us",
    name: "AMG GT",
    modelSlug: "mercedes-amg-gt",
    modelName: "AMG GT",
    generationCode: "C190",
    generationLabel: "First generation (C190)",
    generationStartYear: 2015,
    year: 2021,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: IMAGE_GT_PARIS,
    imageAlt: "Mercedes-AMG GT coupe exterior (yellow, Paris Motor Show)",
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:Mercedes_AMG_GT_-_2014_Paris_Motor_Show_02.jpg",
    imageCredit: "Ben / Wikimedia Commons (via Internet Archive)",
    epaId: "43518",
    engine: {
      slug: "mercedes-m178-amg-gt-469",
      name: "Handcrafted AMG 4.0L V8 biturbo",
      code: "M178-GT",
      fuelType: "PETROL",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbo",
      electrification: null,
    },
    transmissionSlug: "mercedes-amg-speedshift-dct-7",
    transmissionName: "AMG SPEEDSHIFT DCT 7-speed",
    transmissionType: "DUAL_CLUTCH",
    gearCount: 7,
    dimensions: {
      lengthIn: 179.0,
      widthIn: 76.3,
      heightIn: 50.7,
      wheelbaseIn: 103.5,
      frontTrackIn: 66.1,
      rearTrackIn: 65.0,
      curbWeightKg: lbsToKg(3616),
      cargoVolumeLiters: cuFtToLiters(10.1),
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 469,
      torqueLbFt: 465,
      zeroToSixtySeconds: 3.9,
      topSpeedMph: 189,
    },
    fuelEconomy: { cityMpg: 15, highwayMpg: 20, combinedMpg: 17 },
    baseMsrpCents: 11_590_000,
    pressSource: {
      slug: "mbusa-my20-amg-gt-group-brochure",
      title: "Model Year 2020 AMG GT Group brochure (MBUSA)",
      url: "https://www.mbusa.com/content/dam/mb-nafta/us/brochures/pdf/MY20-AMG_GT_Group_WebPDF_091719.pdf",
      type: "MANUFACTURER",
    },
    priceSource: {
      slug: "edmunds-2021-mercedes-amg-gt-features-specs",
      title: "2021 Mercedes-Benz AMG GT Specs & Features (Edmunds)",
      url: "https://www.edmunds.com/mercedes-benz/amg-gt/2021/features-specs/",
      type: "THIRD_PARTY",
    },
  },
  {
    slug: "2019-mercedes-amg-gt-s-us",
    name: "AMG GT S",
    modelSlug: "mercedes-amg-gt",
    modelName: "AMG GT",
    generationCode: "C190",
    generationLabel: "First generation (C190)",
    generationStartYear: 2015,
    year: 2019,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: IMAGE_GT_S_BLACK,
    imageAlt:
      "2017 Mercedes-AMG GT S coupe exterior (Magnetite Black, rear three-quarter)",
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:2017_Mercedes-Benz_AMG_GT-S_in_Magnetite_Black_Metallic,_Rear_Right,_06-04-2022.jpg",
    imageCredit: "Elise240SX / Wikimedia Commons",
    epaId: "41061",
    engine: {
      slug: "mercedes-m178-amg-gt-s-515",
      name: "Handcrafted AMG 4.0L V8 biturbo",
      code: "M178-GTS",
      fuelType: "PETROL",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbo",
      electrification: null,
    },
    transmissionSlug: "mercedes-amg-speedshift-dct-7",
    transmissionName: "AMG SPEEDSHIFT DCT 7-speed",
    transmissionType: "DUAL_CLUTCH",
    gearCount: 7,
    dimensions: {
      lengthIn: 179.0,
      widthIn: 76.3,
      heightIn: 50.7,
      wheelbaseIn: 103.5,
      frontTrackIn: 66.1,
      rearTrackIn: 65.0,
      curbWeightKg: lbsToKg(3627),
      cargoVolumeLiters: cuFtToLiters(10.1),
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 515,
      torqueLbFt: 494,
      zeroToSixtySeconds: 3.7,
      topSpeedMph: 193,
    },
    fuelEconomy: { cityMpg: 16, highwayMpg: 22, combinedMpg: 18 },
    baseMsrpCents: 13_290_000,
    pressSource: {
      slug: "mbusa-my18-amg-gt-family-brochure",
      title: "2018 AMG GT Coupe and Roadster brochure (MBUSA)",
      url: "https://www.mbusa.com/content/dam/mb-nafta/us/brochures/pdf/MY18-AMG-GT-Family.pdf",
      type: "MANUFACTURER",
    },
    priceSource: {
      slug: "edmunds-2019-mercedes-amg-gt-features-specs",
      title: "2019 Mercedes-Benz AMG GT Specs & Features (Edmunds)",
      url: "https://www.edmunds.com/mercedes-benz/amg-gt/2019/features-specs/",
      type: "THIRD_PARTY",
    },
  },
  {
    slug: "2021-mercedes-amg-gt-c-us",
    name: "AMG GT C",
    modelSlug: "mercedes-amg-gt",
    modelName: "AMG GT",
    generationCode: "C190",
    generationLabel: "First generation (C190)",
    generationStartYear: 2015,
    year: 2021,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: IMAGE_GT_C_GREEN,
    imageAlt: "Mercedes-AMG GT C190 coupe exterior (green, Osaka Auto Messe)",
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:Osaka_Auto_Messe_2018_(579)_-_Mercedes-AMG_GT_(C190)_SPORTS_LINE_BLACK_BISON_EDITION.jpg",
    imageCredit: "Tokumeigakarinoaoshima / Wikimedia Commons",
    epaId: "43519",
    engine: {
      slug: "mercedes-m178-amg-gt-c-550",
      name: "Handcrafted AMG 4.0L V8 biturbo",
      code: "M178-GTC",
      fuelType: "PETROL",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbo",
      electrification: null,
    },
    transmissionSlug: "mercedes-amg-speedshift-dct-7",
    transmissionName: "AMG SPEEDSHIFT DCT 7-speed",
    transmissionType: "DUAL_CLUTCH",
    gearCount: 7,
    dimensions: {
      lengthIn: 179.2,
      widthIn: 79.0,
      heightIn: 50.7,
      wheelbaseIn: 103.5,
      frontTrackIn: 66.3,
      rearTrackIn: 66.5,
      curbWeightKg: lbsToKg(3781),
      cargoVolumeLiters: cuFtToLiters(10.1),
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 550,
      torqueLbFt: 502,
      zeroToSixtySeconds: 3.6,
      topSpeedMph: 197,
    },
    fuelEconomy: { cityMpg: 15, highwayMpg: 19, combinedMpg: 17 },
    baseMsrpCents: 15_745_000,
    pressSource: {
      slug: "mbusa-my20-amg-gt-group-brochure",
      title: "Model Year 2020 AMG GT Group brochure (MBUSA)",
      url: "https://www.mbusa.com/content/dam/mb-nafta/us/brochures/pdf/MY20-AMG_GT_Group_WebPDF_091719.pdf",
      type: "MANUFACTURER",
    },
    priceSource: {
      slug: "edmunds-2021-mercedes-amg-gt-features-specs",
      title: "2021 Mercedes-Benz AMG GT Specs & Features (Edmunds)",
      url: "https://www.edmunds.com/mercedes-benz/amg-gt/2021/features-specs/",
      type: "THIRD_PARTY",
    },
  },
  {
    slug: "2021-mercedes-amg-gt-black-series-us",
    name: "AMG GT Black Series",
    modelSlug: "mercedes-amg-gt",
    modelName: "AMG GT",
    generationCode: "C190",
    generationLabel: "First generation (C190)",
    generationStartYear: 2015,
    year: 2021,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: IMAGE_BLACK_SERIES,
    imageAlt: "Mercedes-AMG GT Black Series coupe exterior (silver)",
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:Mercedes-AMG_GT_Black_Series_Coup%C3%A9_(C190,_2022)_(52572418088).jpg",
    imageCredit: "Charles / Wikimedia Commons",
    epaId: "43741",
    engine: {
      slug: "mercedes-m178-ls2-amg-gt-black-series",
      name: "Handcrafted AMG 4.0L V8 biturbo (flat-plane)",
      code: "M178 LS2",
      fuelType: "PETROL",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbo",
      electrification: null,
    },
    transmissionSlug: "mercedes-amg-speedshift-dct-7",
    transmissionName: "AMG SPEEDSHIFT DCT 7-speed",
    transmissionType: "DUAL_CLUTCH",
    gearCount: 7,
    dimensions: {
      lengthIn: 180.7,
      widthIn: 79.0,
      heightIn: 50.4,
      wheelbaseIn: 103.5,
      frontTrackIn: 66.7,
      rearTrackIn: 66.5,
      curbWeightKg: lbsToKg(3461),
      cargoVolumeLiters: cuFtToLiters(10.1),
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 720,
      torqueLbFt: 590,
      zeroToSixtySeconds: 3.1,
      topSpeedMph: 202,
    },
    fuelEconomy: { cityMpg: 15, highwayMpg: 20, combinedMpg: 17 },
    baseMsrpCents: 32_500_000,
    pressSource: {
      slug: "mbusa-amg-gt-black-series-press-325000",
      title: "Mercedes-AMG GT Black Series to start from $325,000 (MBUSA)",
      url: "https://media.mbusa.com/releases/release-34b22cdf3837beba024634fab119f58d-mercedes-amg-gt-black-series-to-start-from-325000",
      type: "PRESS_RELEASE",
    },
    priceSource: {
      slug: "mbusa-amg-gt-black-series-press-325000",
      title: "Mercedes-AMG GT Black Series to start from $325,000 (MBUSA)",
      url: "https://media.mbusa.com/releases/release-34b22cdf3837beba024634fab119f58d-mercedes-amg-gt-black-series-to-start-from-325000",
      type: "PRESS_RELEASE",
    },
  },
  {
    slug: "2025-mercedes-amg-gt-43-4-door-us",
    name: "AMG GT 43 4-Door",
    modelSlug: "mercedes-amg-gt-4-door",
    modelName: "AMG GT 4-Door",
    generationCode: "X290",
    generationLabel: "First generation (X290)",
    generationStartYear: 2019,
    year: 2025,
    bodyStyle: "HATCHBACK",
    drivetrain: "AWD",
    imageUrl: IMAGE_GT43_4D,
    imageAlt: "2025 Mercedes-AMG GT 43 4-Door Coupe exterior (MBUSA)",
    imagePageUrl:
      "https://www.mbusa.com/en/vehicles/model/gt/amg-gt-4-door/gt43c4",
    imageCredit: "Mercedes-Benz USA",
    epaId: "48867",
    engine: {
      slug: "mercedes-m256-amg-gt-43",
      name: "AMG 3.0L inline-6 turbo with hybrid assist",
      code: "M256-GT43",
      fuelType: "HYBRID",
      displacementCc: 2999,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Turbocharger + electric auxiliary compressor",
      electrification: "48V mild hybrid (ISG)",
    },
    transmissionSlug: "mercedes-amg-speedshift-tct-9",
    transmissionName: "AMG SPEEDSHIFT TCT 9-speed",
    transmissionType: "AUTOMATIC",
    gearCount: 9,
    dimensions: {
      lengthIn: 199.0,
      widthIn: 76.9,
      heightIn: 57.3,
      wheelbaseIn: 116.2,
      frontTrackIn: 65.9,
      rearTrackIn: 65.6,
      curbWeightKg: lbsToKg(4553),
      cargoVolumeLiters: cuFtToLiters(16.1),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 362,
      torqueLbFt: 369,
      zeroToSixtySeconds: 4.8,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 19, highwayMpg: 24, combinedMpg: 21 },
    baseMsrpCents: 10_110_000,
    pressSource: {
      slug: "mbusa-2025-amg-gt-43-4-door",
      title: "AMG GT 43 4-Door Coupe — MBUSA specifications",
      url: "https://www.mbusa.com/en/vehicles/model/gt/amg-gt-4-door/gt43c4",
      type: "MANUFACTURER",
    },
    priceSource: {
      slug: "edmunds-2025-mercedes-amg-gt-sedan",
      title: "2025 Mercedes-Benz AMG GT Sedan Prices (Edmunds)",
      url: "https://www.edmunds.com/mercedes-benz/amg-gt/2025/sedan/",
      type: "THIRD_PARTY",
    },
  },
  {
    slug: "2025-mercedes-amg-gt-53-4-door-us",
    name: "AMG GT 53 4-Door",
    modelSlug: "mercedes-amg-gt-4-door",
    modelName: "AMG GT 4-Door",
    generationCode: "X290",
    generationLabel: "First generation (X290)",
    generationStartYear: 2019,
    year: 2025,
    bodyStyle: "HATCHBACK",
    drivetrain: "AWD",
    imageUrl: IMAGE_GT53_4D,
    imageAlt: "2025 Mercedes-AMG GT 53 4-Door Coupe exterior (MBUSA COSY)",
    imagePageUrl:
      "https://www.mbusa.com/en/vehicles/model/gt/amg-gt-4-door/gt53c4",
    imageCredit: "Mercedes-Benz USA",
    epaId: "48868",
    engine: {
      slug: "mercedes-m256-amg-gt-53",
      name: "AMG 3.0L inline-6 twincharger with hybrid assist",
      code: "M256-GT53",
      fuelType: "HYBRID",
      displacementCc: 2999,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Turbocharger + electric auxiliary compressor",
      electrification: "48V mild hybrid (ISG)",
    },
    transmissionSlug: "mercedes-amg-speedshift-tct-9",
    transmissionName: "AMG SPEEDSHIFT TCT 9-speed",
    transmissionType: "AUTOMATIC",
    gearCount: 9,
    dimensions: {
      lengthIn: 199.0,
      widthIn: 76.9,
      heightIn: 57.3,
      wheelbaseIn: 116.2,
      frontTrackIn: 65.9,
      rearTrackIn: 65.6,
      curbWeightKg: lbsToKg(4630),
      cargoVolumeLiters: cuFtToLiters(16.1),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 429,
      torqueLbFt: 384,
      zeroToSixtySeconds: 4.4,
      topSpeedMph: 174,
    },
    fuelEconomy: { cityMpg: 19, highwayMpg: 24, combinedMpg: 21 },
    baseMsrpCents: 11_200_000,
    pressSource: {
      slug: "mbusa-2025-amg-gt-53-4-door",
      title: "AMG GT 53 4-Door Coupe — MBUSA specifications",
      url: "https://www.mbusa.com/en/vehicles/model/gt/amg-gt-4-door/gt53c4",
      type: "MANUFACTURER",
    },
    priceSource: {
      slug: "edmunds-2025-mercedes-amg-gt-sedan",
      title: "2025 Mercedes-Benz AMG GT Sedan Prices (Edmunds)",
      url: "https://www.edmunds.com/mercedes-benz/amg-gt/2025/sedan/",
      type: "THIRD_PARTY",
    },
  },
  {
    slug: "2025-mercedes-amg-gt-63-4-door-us",
    name: "AMG GT 63 4-Door",
    modelSlug: "mercedes-amg-gt-4-door",
    modelName: "AMG GT 4-Door",
    generationCode: "X290",
    generationLabel: "First generation (X290)",
    generationStartYear: 2019,
    year: 2025,
    bodyStyle: "HATCHBACK",
    drivetrain: "AWD",
    imageUrl: IMAGE_GT63_4D,
    imageAlt: "2025 Mercedes-AMG GT 63 4-Door Coupe exterior (MBUSA COSY)",
    imagePageUrl:
      "https://www.mbusa.com/en/vehicles/model/gt/amg-gt-4-door/gt63c4",
    imageCredit: "Mercedes-Benz USA",
    epaId: "48848",
    engine: {
      slug: "mercedes-m177-amg-gt-63",
      name: "Handcrafted AMG 4.0L V8 biturbo",
      code: "M177-GT63",
      fuelType: "PETROL",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbo",
      electrification: null,
    },
    transmissionSlug: "mercedes-amg-speedshift-mct-9",
    transmissionName: "AMG SPEEDSHIFT MCT 9-speed",
    transmissionType: "AUTOMATIC",
    gearCount: 9,
    dimensions: {
      lengthIn: 199.0,
      widthIn: 76.9,
      heightIn: 57.0,
      wheelbaseIn: 116.2,
      frontTrackIn: 65.7,
      rearTrackIn: 65.5,
      curbWeightKg: lbsToKg(4773),
      cargoVolumeLiters: cuFtToLiters(12.0),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 577,
      torqueLbFt: 590,
      zeroToSixtySeconds: 3.3,
      topSpeedMph: 193,
    },
    fuelEconomy: { cityMpg: 15, highwayMpg: 21, combinedMpg: 17 },
    baseMsrpCents: 15_685_000,
    pressSource: {
      slug: "mbusa-2025-amg-gt-63-4-door",
      title: "AMG GT 63 4-Door Coupe — MBUSA specifications",
      url: "https://www.mbusa.com/en/vehicles/model/gt/amg-gt-4-door/gt63c4",
      type: "MANUFACTURER",
    },
    priceSource: {
      slug: "edmunds-2025-mercedes-amg-gt-sedan",
      title: "2025 Mercedes-Benz AMG GT Sedan Prices (Edmunds)",
      url: "https://www.edmunds.com/mercedes-benz/amg-gt/2025/sedan/",
      type: "THIRD_PARTY",
    },
  },
  {
    slug: "2023-mercedes-amg-gt-63-s-4-door-us",
    name: "AMG GT 63 S 4-Door",
    modelSlug: "mercedes-amg-gt-4-door",
    modelName: "AMG GT 4-Door",
    generationCode: "X290",
    generationLabel: "First generation (X290)",
    generationStartYear: 2019,
    year: 2023,
    bodyStyle: "HATCHBACK",
    drivetrain: "AWD",
    imageUrl: IMAGE_GT63S_4D,
    imageAlt: "Mercedes-AMG GT 63 S 4-Door Coupe exterior (blue, Stuttgart)",
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:Mercedes-AMG_GT_63_S_(Facelift)_1X7A7353.jpg",
    imageCredit: "Alexander-93 / Wikimedia Commons (via Internet Archive)",
    epaId: "46319",
    engine: {
      slug: "mercedes-m177-amg-gt-63-s",
      name: "Handcrafted AMG 4.0L V8 biturbo",
      code: "M177-GT63S",
      fuelType: "PETROL",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbo",
      electrification: null,
    },
    transmissionSlug: "mercedes-amg-speedshift-mct-9",
    transmissionName: "AMG SPEEDSHIFT MCT 9-speed",
    transmissionType: "AUTOMATIC",
    gearCount: 9,
    dimensions: {
      lengthIn: 199.2,
      widthIn: 76.9,
      heightIn: 57.3,
      wheelbaseIn: 116.2,
      frontTrackIn: 65.7,
      rearTrackIn: 65.4,
      curbWeightKg: lbsToKg(4740),
      cargoVolumeLiters: cuFtToLiters(12.0),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 630,
      torqueLbFt: 664,
      zeroToSixtySeconds: 3.1,
      topSpeedMph: 196,
    },
    fuelEconomy: { cityMpg: 15, highwayMpg: 21, combinedMpg: 17 },
    baseMsrpCents: 16_715_000,
    pressSource: {
      slug: "caranddriver-amg-gt-4-door-review",
      title: "Mercedes-AMG GT 43 / 53 / 63 Review (Car and Driver)",
      url: "https://www.caranddriver.com/mercedes-amg/gt43-gt53-gt63-2025",
      type: "THIRD_PARTY",
    },
    priceSource: {
      slug: "edmunds-2023-mercedes-amg-gt-features-specs",
      title: "2023 Mercedes-Benz AMG GT Specs & Features (Edmunds)",
      url: "https://www.edmunds.com/mercedes-benz/amg-gt/2023/features-specs/",
      type: "THIRD_PARTY",
    },
  },
  {
    slug: "2025-mercedes-amg-gt-63-s-e-performance-4-door-us",
    name: "AMG GT 63 S E Performance",
    modelSlug: "mercedes-amg-gt-4-door",
    modelName: "AMG GT 4-Door",
    generationCode: "X290",
    generationLabel: "First generation (X290)",
    generationStartYear: 2019,
    year: 2025,
    bodyStyle: "HATCHBACK",
    drivetrain: "AWD",
    imageUrl: IMAGE_GT63SE_4D,
    imageAlt:
      "2025 Mercedes-AMG GT 63 S E PERFORMANCE 4-Door Coupe exterior (MBUSA COSY)",
    imagePageUrl:
      "https://www.mbusa.com/en/vehicles/model/gt/amg-gt-4-door/gt63c4se",
    imageCredit: "Mercedes-Benz USA",
    epaId: "49161",
    engine: {
      slug: "mercedes-m177-amg-gt-63-s-e-performance",
      name: "AMG 4.0L V8 biturbo + rear electric drive unit",
      code: "M177-GT63SE",
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbo",
      electrification: "PHEV (rear 150 kW PMSM)",
    },
    transmissionSlug: "mercedes-amg-speedshift-mct-9",
    transmissionName: "AMG SPEEDSHIFT MCT 9-speed",
    transmissionType: "AUTOMATIC",
    gearCount: 9,
    dimensions: {
      lengthIn: 199.0,
      widthIn: 76.9,
      heightIn: 57.0,
      wheelbaseIn: 116.2,
      frontTrackIn: 65.7,
      rearTrackIn: 65.5,
      curbWeightKg: lbsToKg(5269),
      cargoVolumeLiters: cuFtToLiters(11.8),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 831,
      torqueLbFt: 1032,
      zeroToSixtySeconds: 2.8,
      topSpeedMph: 196,
    },
    fuelEconomy: {
      cityMpg: 16,
      highwayMpg: 19,
      combinedMpg: 18,
      electricRangeMiles: 10,
    },
    baseMsrpCents: 19_895_000,
    pressSource: {
      slug: "mbusa-2025-amg-gt-63-s-e-performance-4-door",
      title: "AMG GT 63 S E PERFORMANCE 4-Door Coupe — MBUSA specifications",
      url: "https://www.mbusa.com/en/vehicles/model/gt/amg-gt-4-door/gt63c4se",
      type: "MANUFACTURER",
    },
    priceSource: {
      slug: "edmunds-2025-mercedes-amg-gt-sedan",
      title: "2025 Mercedes-Benz AMG GT Sedan Prices (Edmunds)",
      url: "https://www.edmunds.com/mercedes-benz/amg-gt/2025/sedan/",
      type: "THIRD_PARTY",
    },
  },
];

const STATIC_SKIPPED = [
  "AMG GT R (C190): no HEAD-verified unique exterior distinct from other C190 trims (Wikimedia rate-limited)",
  "AMG GT R Pro (C190): limited edition; no HEAD-verified unique exterior (shares GT R powertrain EPA 43520)",
  "AMG GT Roadster variants: out of coupe/4-door assignment scope",
  "2025 AMG GT 63 S 4-Door (non-E): discontinued US after 2023; seeded 2023-mercedes-amg-gt-63-s-4-door-us instead",
];

const DESTINATION_SOURCE = {
  slug: "mercedes-us-destination-fee-amg-gt",
  title: "Mercedes-Benz USA destination & handling (passenger cars)",
  url: "https://www.mbusa.com/en/vehicles",
  type: "MANUFACTURER" as const,
};

export async function seedMercedesAmgGt(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  const destinationSource = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE.slug,
    title: DESTINATION_SOURCE.title,
    publisher: "Mercedes-Benz USA",
    url: DESTINATION_SOURCE.url,
    type: DESTINATION_SOURCE.type,
  });

  const transmissionCache = new Map<string, string>();

  for (const trim of TRIMS) {
    try {
      if (RESERVED_MERCEDES_IMAGE_URLS.has(trim.imageUrl)) {
        skipped.push(`${trim.slug}: image URL already reserved`);
        continue;
      }

      const imageUrl = await assertImageUrlOk(trim.imageUrl);
      RESERVED_MERCEDES_IMAGE_URLS.add(imageUrl);

      const imageSource = await ensureImageSource(prisma, {
        slug: `img-${trim.slug}`,
        title: trim.imageAlt,
        pageUrl: trim.imagePageUrl,
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
        },
        update: {
          displayName: trim.generationLabel,
          startYear: trim.generationStartYear,
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

      const engine = await ensureMercedesEngine(prisma, {
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

      const pressPublisher =
        trim.pressSource.type === "THIRD_PARTY"
          ? "Car and Driver"
          : "Mercedes-Benz USA";

      const pressSource = await upsertCatalogueSource(prisma, {
        slug: trim.pressSource.slug,
        title: trim.pressSource.title,
        publisher: pressPublisher,
        url: trim.pressSource.url,
        type: trim.pressSource.type,
      });

      const pricePublisher =
        trim.priceSource.type === "PRESS_RELEASE" ||
        trim.priceSource.type === "MANUFACTURER"
          ? "Mercedes-Benz USA"
          : "Edmunds";

      const priceSource = await upsertCatalogueSource(prisma, {
        slug: trim.priceSource.slug,
        title: trim.priceSource.title,
        publisher: pricePublisher,
        url: trim.priceSource.url,
        type: trim.priceSource.type,
      });

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-${trim.year}-mercedes-${trim.slug.replace(/^\d{4}-mercedes-/, "").replace(/-us$/, "")}`,
        title: `EPA Fuel Economy — ${trim.year} Mercedes-Benz ${trim.name}`,
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
          description: `${trim.year} Mercedes-Benz ${trim.name} (US).`,
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
          description: `${trim.year} Mercedes-Benz ${trim.name} (US).`,
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
              electricRangeMiles: trim.fuelEconomy.electricRangeMiles ?? null,
            },
            update: {
              cityMpg: trim.fuelEconomy.cityMpg,
              highwayMpg: trim.fuelEconomy.highwayMpg,
              combinedMpg: trim.fuelEconomy.combinedMpg,
              electricRangeMiles: trim.fuelEconomy.electricRangeMiles ?? null,
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
              amountCents: MERCEDES_DESTINATION_CENTS,
              currency: "USD",
              effectiveAt: pricingDate,
            },
            update: {
              amountCents: MERCEDES_DESTINATION_CENTS,
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
          "Manufacturer / press performance specifications",
        ),
        upsertCitation(
          prisma,
          pressSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Manufacturer dimensions / curb weight",
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
          `Base MSRP excluding destination (US MY ${trim.year})`,
        ),
        upsertCitation(
          prisma,
          destinationSource.id,
          "VehiclePrice",
          destination.id,
          "amountCents",
          `Destination and handling $${(MERCEDES_DESTINATION_CENTS / 100).toFixed(0)}`,
        ),
        upsertCitation(
          prisma,
          imageSource.id,
          "VehicleImage",
          image.id,
          "url",
          trim.imagePageUrl,
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
