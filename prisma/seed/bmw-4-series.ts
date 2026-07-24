/**
 * BMW 4 Series / M4 US MY 2025 seed module.
 * Idempotent — safe to re-run.
 *
 * Sources:
 * - Coupe/Convertible press: https://www.press.bmwgroup.com/usa/article/detail/T0439311EN_US/the-new-2025-bmw-4-series-coupe-and-convertible
 * - Gran Coupe press: https://www.press.bmwgroup.com/usa/article/detail/T0441360EN_US/the-new-2025-bmw-i4-and-4-series-gran-coupe
 * - M4 press: https://www.press.bmwgroup.com/usa/article/detail/T0439244EN_US/the-new-2025-bmw-m4-coupe-and-m4-convertible
 * - BMW USA technical data (dimensions / 0–60 / curb)
 * - Gran Coupe MSRP: Edmunds 2025 4 Series Gran Coupe (PressClub pricing TBA)
 * - EPA vehicle IDs listed per trim
 */
import type { SeedCtx } from "./bmw-shared";
import {
  DESTINATION_CENTS,
  assertImageOk,
  ensureAudit,
  ensureImageSource,
  mediapoolUrl,
  upsertCitation,
} from "./bmw-shared";

const LBS_TO_KG = 0.45359237;
const CUFT_TO_L = 28.316846592;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

type BodyStyle = "SEDAN" | "COUPE" | "CABRIOLET";
type Drivetrain = "RWD" | "AWD";
type GenerationCode = "G22" | "G23" | "G26" | "G82" | "G83";
type TransmissionSlug =
  | "bmw-8-speed-steptronic"
  | "bmw-6-speed-manual"
  | "bmw-8-speed-m-steptronic-drivelogic";
type EngineSlug = "bmw-b48b20o2" | "bmw-b58b30m2" | "bmw-s58b30t0";

type TrimSeed = {
  slug: string;
  name: string;
  generationCode: GenerationCode;
  generationLabel: string;
  generationStartYear: number;
  bodyStyle: BodyStyle;
  drivetrain: Drivetrain;
  dokNo: string;
  epaId: string;
  engineSlug: EngineSlug;
  transmissionSlug: TransmissionSlug;
  dimensions: {
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    wheelbaseIn: number;
    frontTrackIn: number;
    rearTrackIn: number;
    groundClearanceIn?: number;
    curbWeightKg: number;
    grossVehicleWeightKg?: number;
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
  pressSourceSlug: string;
  priceSourceSlug: string;
  /** Dimensions/0–60 from BMW USA tech pages (non-M) or PressClub (M4). */
  techSourceSlug: string;
};

/** Reuse main-seed / i-series Source.slug values when URL already exists (url is @unique). */
const PRESS_SOURCES = [
  {
    slug: "bmw-2025-4-series-coupe-press-release",
    title: "The new 2025 BMW 4 Series Coupe and Convertible.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0439311EN_US/the-new-2025-bmw-4-series-coupe-and-convertible",
    type: "PRESS_RELEASE" as const,
  },
  {
    slug: "bmw-2025-i4-press-release",
    title: "The new 2025 BMW i4 and 4 Series Gran Coupe.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0441360EN_US/the-new-2025-bmw-i4-and-4-series-gran-coupe",
    type: "PRESS_RELEASE" as const,
  },
  {
    slug: "bmw-2025-m4-coupe-convertible-press-release",
    title: "The new 2025 BMW M4 Coupe and M4 Convertible.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0439244EN_US/the-new-2025-bmw-m4-coupe-and-m4-convertible",
    type: "PRESS_RELEASE" as const,
  },
];

/** Only Edmunds — PressClub MSRPs cite PRESS_SOURCES (Source.url is unique). */
const PRICE_SOURCES = [
  {
    slug: "edmunds-2025-bmw-4-series-gran-coupe-msrp",
    title: "2025 BMW 4 Series Gran Coupe Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/bmw/4-series-gran-coupe/2025/features-specs/",
    publisher: "Edmunds",
    type: "THIRD_PARTY" as const,
  },
];

const TECH_SOURCES = [
  {
    slug: "bmw-usa-4-series-coupe-technical-data",
    title: "BMW 4 Series Coupe technical data (BMW USA)",
    url: "https://www.bmwusa.com/vehicles/4-series/4-series-coupe/bmw-4-series-technical-highlights.html/430i-coupe.bmw",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "bmw-usa-4-series-convertible-technical-data",
    title: "BMW 4 Series Convertible technical data (BMW USA)",
    url: "https://www.bmwusa.com/vehicles/4-series/4-series-convertible/bmw-4-series-convertible-technical-highlights.html",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "bmw-usa-4-series-gran-coupe-technical-data",
    title: "BMW 4 Series Gran Coupe / M440i technical data (BMW USA)",
    url: "https://www.bmwusa.com/vehicles/m-series/m440i-xdrive-gran-coupe/bmw-m440i-xdrive-gran-coupe-technical-highlights.html/m440i-gran-coupe.bmw",
    type: "MANUFACTURER" as const,
  },
];

/** Coupe / Convertible shared exterior tracks (iSeeCars / catalogue cross-check). */
const COUPE_TRACK = { frontTrackIn: 62.3, rearTrackIn: 62.7 } as const;
const GC_TRACK = { frontTrackIn: 62.3, rearTrackIn: 63.4 } as const;
const M4_TRACK = { frontTrackIn: 63.7, rearTrackIn: 63.2 } as const;

const TRIMS: TrimSeed[] = [
  {
    slug: "2025-bmw-430i-coupe-us",
    name: "430i Coupe",
    generationCode: "G22",
    generationLabel: "Second generation Coupe (G22)",
    generationStartYear: 2021,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    dokNo: "P90390664",
    epaId: "47765",
    engineSlug: "bmw-b48b20o2",
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 187.9,
      widthIn: 72.9,
      heightIn: 54.6,
      wheelbaseIn: 112.2,
      frontTrackIn: 62.8,
      rearTrackIn: 63.1,
      groundClearanceIn: 5.1,
      curbWeightKg: 1670,
      grossVehicleWeightKg: 2110,
      cargoVolumeLiters: 340,
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.5,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 26, highwayMpg: 34, combinedMpg: 29 },
    baseMsrpCents: 5070000,
    pressSourceSlug: "bmw-2025-4-series-coupe-press-release",
    priceSourceSlug: "bmw-2025-4-series-coupe-press-release",
    techSourceSlug: "bmw-usa-4-series-coupe-technical-data",
  },
  {
    slug: "2025-bmw-430i-xdrive-coupe-us",
    name: "430i xDrive Coupe",
    generationCode: "G22",
    generationLabel: "Second generation Coupe (G22)",
    generationStartYear: 2021,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    dokNo: "P90536510",
    epaId: "47766",
    engineSlug: "bmw-b48b20o2",
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 187.9,
      widthIn: 72.9,
      heightIn: 54.8,
      wheelbaseIn: 112.2,
      ...COUPE_TRACK,
      groundClearanceIn: 5.1,
      curbWeightKg: lbsToKg(3805),
      cargoVolumeLiters: cuFtToLiters(15.5),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.4,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 27, highwayMpg: 34, combinedMpg: 30 },
    baseMsrpCents: 5_270_000,
    pressSourceSlug: "bmw-2025-4-series-coupe-press-release",
    priceSourceSlug: "bmw-2025-4-series-coupe-press-release",
    techSourceSlug: "bmw-usa-4-series-coupe-technical-data",
  },
  {
    slug: "2025-bmw-m440i-coupe-us",
    name: "M440i Coupe",
    generationCode: "G22",
    generationLabel: "Second generation Coupe (G22)",
    generationStartYear: 2021,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    dokNo: "P90536511",
    epaId: "47769",
    engineSlug: "bmw-b58b30m2",
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 188.0,
      widthIn: 72.9,
      heightIn: 54.6,
      wheelbaseIn: 112.2,
      ...COUPE_TRACK,
      groundClearanceIn: 5.1,
      curbWeightKg: lbsToKg(3896),
      cargoVolumeLiters: cuFtToLiters(15.5),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 386,
      torqueLbFt: 398,
      zeroToSixtySeconds: 4.6,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 27, highwayMpg: 34, combinedMpg: 30 },
    baseMsrpCents: 6_425_000,
    pressSourceSlug: "bmw-2025-4-series-coupe-press-release",
    priceSourceSlug: "bmw-2025-4-series-coupe-press-release",
    techSourceSlug: "bmw-usa-4-series-coupe-technical-data",
  },
  {
    slug: "2025-bmw-m440i-xdrive-coupe-us",
    name: "M440i xDrive Coupe",
    generationCode: "G22",
    generationLabel: "Second generation Coupe (G22)",
    generationStartYear: 2021,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    dokNo: "P90536512",
    epaId: "47770",
    engineSlug: "bmw-b58b30m2",
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 188.0,
      widthIn: 72.9,
      heightIn: 54.8,
      wheelbaseIn: 112.2,
      ...COUPE_TRACK,
      groundClearanceIn: 5.1,
      curbWeightKg: lbsToKg(4019),
      cargoVolumeLiters: cuFtToLiters(15.5),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 386,
      torqueLbFt: 398,
      zeroToSixtySeconds: 4.2,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 26, highwayMpg: 33, combinedMpg: 29 },
    baseMsrpCents: 6_625_000,
    pressSourceSlug: "bmw-2025-4-series-coupe-press-release",
    priceSourceSlug: "bmw-2025-4-series-coupe-press-release",
    techSourceSlug: "bmw-usa-4-series-coupe-technical-data",
  },

  // —— Convertible (G23)
  {
    slug: "2025-bmw-430i-convertible-us",
    name: "430i Convertible",
    generationCode: "G23",
    generationLabel: "Second generation Convertible (G23)",
    generationStartYear: 2021,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    dokNo: "P90536513",
    epaId: "47767",
    engineSlug: "bmw-b48b20o2",
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 187.9,
      widthIn: 72.9,
      heightIn: 54.6,
      wheelbaseIn: 112.2,
      ...COUPE_TRACK,
      groundClearanceIn: 5.0,
      curbWeightKg: lbsToKg(4026),
      cargoVolumeLiters: cuFtToLiters(13.6),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 6.0,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 27, highwayMpg: 35, combinedMpg: 30 },
    baseMsrpCents: 5_870_000,
    pressSourceSlug: "bmw-2025-4-series-coupe-press-release",
    priceSourceSlug: "bmw-2025-4-series-coupe-press-release",
    techSourceSlug: "bmw-usa-4-series-convertible-technical-data",
  },
  {
    slug: "2025-bmw-430i-xdrive-convertible-us",
    name: "430i xDrive Convertible",
    generationCode: "G23",
    generationLabel: "Second generation Convertible (G23)",
    generationStartYear: 2021,
    bodyStyle: "CABRIOLET",
    drivetrain: "AWD",
    dokNo: "P90536514",
    epaId: "47768",
    engineSlug: "bmw-b48b20o2",
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 187.9,
      widthIn: 72.9,
      heightIn: 54.9,
      wheelbaseIn: 112.2,
      ...COUPE_TRACK,
      groundClearanceIn: 5.0,
      curbWeightKg: lbsToKg(4145),
      cargoVolumeLiters: cuFtToLiters(13.6),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.9,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 24, highwayMpg: 33, combinedMpg: 28 },
    baseMsrpCents: 6_070_000,
    pressSourceSlug: "bmw-2025-4-series-coupe-press-release",
    priceSourceSlug: "bmw-2025-4-series-coupe-press-release",
    techSourceSlug: "bmw-usa-4-series-convertible-technical-data",
  },
  {
    slug: "2025-bmw-m440i-convertible-us",
    name: "M440i Convertible",
    generationCode: "G23",
    generationLabel: "Second generation Convertible (G23)",
    generationStartYear: 2021,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    dokNo: "P90536516",
    epaId: "47771",
    engineSlug: "bmw-b58b30m2",
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 188.0,
      widthIn: 72.9,
      heightIn: 54.6,
      wheelbaseIn: 112.2,
      ...COUPE_TRACK,
      groundClearanceIn: 5.0,
      curbWeightKg: lbsToKg(4242),
      cargoVolumeLiters: cuFtToLiters(13.6),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 386,
      torqueLbFt: 398,
      zeroToSixtySeconds: 5.0,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 27, highwayMpg: 33, combinedMpg: 29 },
    baseMsrpCents: 7_225_000,
    pressSourceSlug: "bmw-2025-4-series-coupe-press-release",
    priceSourceSlug: "bmw-2025-4-series-coupe-press-release",
    techSourceSlug: "bmw-usa-4-series-convertible-technical-data",
  },
  {
    slug: "2025-bmw-m440i-xdrive-convertible-us",
    name: "M440i xDrive Convertible",
    generationCode: "G23",
    generationLabel: "Second generation Convertible (G23)",
    generationStartYear: 2021,
    bodyStyle: "CABRIOLET",
    drivetrain: "AWD",
    dokNo: "P90536517",
    epaId: "47772",
    engineSlug: "bmw-b58b30m2",
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 188.0,
      widthIn: 72.9,
      heightIn: 54.9,
      wheelbaseIn: 112.2,
      ...COUPE_TRACK,
      groundClearanceIn: 5.0,
      curbWeightKg: lbsToKg(4354),
      cargoVolumeLiters: cuFtToLiters(13.6),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 386,
      torqueLbFt: 398,
      zeroToSixtySeconds: 4.6,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 25, highwayMpg: 32, combinedMpg: 28 },
    baseMsrpCents: 7_425_000,
    pressSourceSlug: "bmw-2025-4-series-coupe-press-release",
    priceSourceSlug: "bmw-2025-4-series-coupe-press-release",
    techSourceSlug: "bmw-usa-4-series-convertible-technical-data",
  },

  // —— Gran Coupe (G26) — SEDAN body style per assignment
  {
    slug: "2025-bmw-430i-gran-coupe-us",
    name: "430i Gran Coupe",
    generationCode: "G26",
    generationLabel: "First generation Gran Coupe (G26)",
    generationStartYear: 2022,
    bodyStyle: "SEDAN",
    drivetrain: "RWD",
    dokNo: "P90546574",
    epaId: "48167",
    engineSlug: "bmw-b48b20o2",
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 188.5,
      widthIn: 72.9,
      heightIn: 56.8,
      wheelbaseIn: 112.4,
      ...GC_TRACK,
      groundClearanceIn: 5.5,
      curbWeightKg: lbsToKg(3898),
      cargoVolumeLiters: cuFtToLiters(16.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.8,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 27, highwayMpg: 35, combinedMpg: 30 },
    // Edmunds base excl. destination ($50,825 − $1,175).
    baseMsrpCents: 4_965_000,
    pressSourceSlug: "bmw-2025-i4-press-release",
    priceSourceSlug: "edmunds-2025-bmw-4-series-gran-coupe-msrp",
    techSourceSlug: "bmw-usa-4-series-gran-coupe-technical-data",
  },
  {
    slug: "2025-bmw-430i-xdrive-gran-coupe-us",
    name: "430i xDrive Gran Coupe",
    generationCode: "G26",
    generationLabel: "First generation Gran Coupe (G26)",
    generationStartYear: 2022,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    dokNo: "P90546575",
    epaId: "48168",
    engineSlug: "bmw-b48b20o2",
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 188.5,
      widthIn: 72.9,
      heightIn: 56.8,
      wheelbaseIn: 112.4,
      ...GC_TRACK,
      groundClearanceIn: 5.5,
      curbWeightKg: lbsToKg(4019),
      cargoVolumeLiters: cuFtToLiters(16.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.7,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 25, highwayMpg: 34, combinedMpg: 29 },
    baseMsrpCents: 5_165_000,
    pressSourceSlug: "bmw-2025-i4-press-release",
    priceSourceSlug: "edmunds-2025-bmw-4-series-gran-coupe-msrp",
    techSourceSlug: "bmw-usa-4-series-gran-coupe-technical-data",
  },
  {
    slug: "2025-bmw-m440i-gran-coupe-us",
    name: "M440i Gran Coupe",
    generationCode: "G26",
    generationLabel: "First generation Gran Coupe (G26)",
    generationStartYear: 2022,
    bodyStyle: "SEDAN",
    drivetrain: "RWD",
    dokNo: "P90546579",
    epaId: "48169",
    engineSlug: "bmw-b58b30m2",
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 188.5,
      widthIn: 72.9,
      heightIn: 56.8,
      wheelbaseIn: 112.4,
      ...GC_TRACK,
      groundClearanceIn: 5.5,
      curbWeightKg: lbsToKg(4149),
      cargoVolumeLiters: cuFtToLiters(16.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 386,
      torqueLbFt: 398,
      zeroToSixtySeconds: 4.6,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 26, highwayMpg: 32, combinedMpg: 28 },
    baseMsrpCents: 6_320_000,
    pressSourceSlug: "bmw-2025-i4-press-release",
    priceSourceSlug: "edmunds-2025-bmw-4-series-gran-coupe-msrp",
    techSourceSlug: "bmw-usa-4-series-gran-coupe-technical-data",
  },
  {
    slug: "2025-bmw-m440i-xdrive-gran-coupe-us",
    name: "M440i xDrive Gran Coupe",
    generationCode: "G26",
    generationLabel: "First generation Gran Coupe (G26)",
    generationStartYear: 2022,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    dokNo: "P90546580",
    epaId: "48170",
    engineSlug: "bmw-b58b30m2",
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 188.5,
      widthIn: 72.9,
      heightIn: 56.8,
      wheelbaseIn: 112.4,
      ...GC_TRACK,
      groundClearanceIn: 5.5,
      curbWeightKg: lbsToKg(4266),
      cargoVolumeLiters: cuFtToLiters(16.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 386,
      torqueLbFt: 398,
      zeroToSixtySeconds: 4.3,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 25, highwayMpg: 31, combinedMpg: 27 },
    baseMsrpCents: 6_520_000,
    pressSourceSlug: "bmw-2025-i4-press-release",
    priceSourceSlug: "edmunds-2025-bmw-4-series-gran-coupe-msrp",
    techSourceSlug: "bmw-usa-4-series-gran-coupe-technical-data",
  },

  // —— Full M (G82 / G83)
  {
    slug: "2025-bmw-m4-coupe-us",
    name: "M4 Coupe",
    generationCode: "G82",
    generationLabel: "Second generation M4 Coupe (G82)",
    generationStartYear: 2021,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    dokNo: "P90536834",
    epaId: "47773",
    engineSlug: "bmw-s58b30t0",
    transmissionSlug: "bmw-6-speed-manual",
    dimensions: {
      lengthIn: 189.1,
      widthIn: 74.3,
      heightIn: 54.8,
      wheelbaseIn: 112.5,
      ...M4_TRACK,
      groundClearanceIn: 4.7,
      curbWeightKg: lbsToKg(3830),
      grossVehicleWeightKg: lbsToKg(4751),
      cargoVolumeLiters: cuFtToLiters(15.5),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 473,
      torqueLbFt: 406,
      zeroToSixtySeconds: 4.1,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 16, highwayMpg: 23, combinedMpg: 19 },
    baseMsrpCents: 7_910_000,
    pressSourceSlug: "bmw-2025-m4-coupe-convertible-press-release",
    priceSourceSlug: "bmw-2025-m4-coupe-convertible-press-release",
    techSourceSlug: "bmw-2025-m4-coupe-convertible-press-release",
  },
  {
    slug: "2025-bmw-m4-competition-coupe-us",
    name: "M4 Competition Coupe",
    generationCode: "G82",
    generationLabel: "Second generation M4 Coupe (G82)",
    generationStartYear: 2021,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    dokNo: "P90536853",
    epaId: "47774",
    engineSlug: "bmw-s58b30t0",
    transmissionSlug: "bmw-8-speed-m-steptronic-drivelogic",
    dimensions: {
      lengthIn: 189.1,
      widthIn: 74.3,
      heightIn: 54.8,
      wheelbaseIn: 112.5,
      ...M4_TRACK,
      groundClearanceIn: 4.7,
      curbWeightKg: lbsToKg(3880),
      grossVehicleWeightKg: lbsToKg(4751),
      cargoVolumeLiters: cuFtToLiters(15.5),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 503,
      torqueLbFt: 479,
      zeroToSixtySeconds: 3.8,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 16, highwayMpg: 23, combinedMpg: 19 },
    baseMsrpCents: 8_320_000,
    pressSourceSlug: "bmw-2025-m4-coupe-convertible-press-release",
    priceSourceSlug: "bmw-2025-m4-coupe-convertible-press-release",
    techSourceSlug: "bmw-2025-m4-coupe-convertible-press-release",
  },
  {
    slug: "2025-bmw-m4-competition-xdrive-coupe-us",
    name: "M4 Competition xDrive Coupe",
    generationCode: "G82",
    generationLabel: "Second generation M4 Coupe (G82)",
    generationStartYear: 2021,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    dokNo: "P90536831",
    epaId: "47775",
    engineSlug: "bmw-s58b30t0",
    transmissionSlug: "bmw-8-speed-m-steptronic-drivelogic",
    dimensions: {
      lengthIn: 189.1,
      widthIn: 74.3,
      heightIn: 54.9,
      wheelbaseIn: 112.5,
      ...M4_TRACK,
      groundClearanceIn: 4.8,
      curbWeightKg: lbsToKg(3979),
      grossVehicleWeightKg: lbsToKg(4861),
      cargoVolumeLiters: cuFtToLiters(15.5),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 523,
      torqueLbFt: 479,
      zeroToSixtySeconds: 3.4,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 16, highwayMpg: 23, combinedMpg: 18 },
    baseMsrpCents: 8_830_000,
    pressSourceSlug: "bmw-2025-m4-coupe-convertible-press-release",
    priceSourceSlug: "bmw-2025-m4-coupe-convertible-press-release",
    techSourceSlug: "bmw-2025-m4-coupe-convertible-press-release",
  },
  {
    slug: "2025-bmw-m4-competition-xdrive-convertible-us",
    name: "M4 Competition xDrive Convertible",
    generationCode: "G83",
    generationLabel: "Second generation M4 Convertible (G83)",
    generationStartYear: 2021,
    bodyStyle: "CABRIOLET",
    drivetrain: "AWD",
    dokNo: "P90536787",
    epaId: "47776",
    engineSlug: "bmw-s58b30t0",
    transmissionSlug: "bmw-8-speed-m-steptronic-drivelogic",
    dimensions: {
      lengthIn: 189.1,
      widthIn: 74.3,
      heightIn: 54.9,
      wheelbaseIn: 112.5,
      ...M4_TRACK,
      groundClearanceIn: 4.8,
      curbWeightKg: lbsToKg(4306),
      grossVehicleWeightKg: lbsToKg(5170),
      cargoVolumeLiters: cuFtToLiters(10.6),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 523,
      torqueLbFt: 479,
      zeroToSixtySeconds: 3.6,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 16, highwayMpg: 22, combinedMpg: 18 },
    baseMsrpCents: 9_530_000,
    pressSourceSlug: "bmw-2025-m4-coupe-convertible-press-release",
    priceSourceSlug: "bmw-2025-m4-coupe-convertible-press-release",
    techSourceSlug: "bmw-2025-m4-coupe-convertible-press-release",
  },
];

function isCompleteVehicle(vehicle: {
  dimensions: unknown;
  performance: unknown;
  fuelEconomy: unknown;
  prices: unknown[];
  images: unknown[];
}) {
  return Boolean(
    vehicle.dimensions &&
      vehicle.performance &&
      vehicle.fuelEconomy &&
      vehicle.prices.length >= 2 &&
      vehicle.images.length >= 1,
  );
}

export async function seedBmw4Series(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [];

  const model = await prisma.vehicleModel.upsert({
    where: { slug: "bmw-4-series" },
    create: {
      manufacturerId,
      name: "4 Series",
      slug: "bmw-4-series",
    },
    update: { manufacturerId, name: "4 Series" },
  });

  const generationByCode = new Map<string, { id: string }>();
  for (const trim of TRIMS) {
    if (generationByCode.has(trim.generationCode)) continue;
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
    generationByCode.set(trim.generationCode, generation);
  }

  const modelYearByGeneration = new Map<string, { id: string }>();
  for (const [code, generation] of generationByCode) {
    const modelYear = await prisma.modelYear.upsert({
      where: {
        generationId_year: { generationId: generation.id, year: 2025 },
      },
      create: { generationId: generation.id, year: 2025 },
      update: {},
    });
    modelYearByGeneration.set(code, modelYear);
  }

  const b48 = await prisma.engine.upsert({
    where: { slug: "bmw-b48b20o2" },
    create: {
      manufacturerId,
      slug: "bmw-b48b20o2",
      name: "B48B20O2",
      code: "B48B20O2",
      fuelType: "PETROL",
      displacementCc: 1998,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Twin-scroll turbocharger",
      electrification: "48V mild hybrid",
    },
    update: {
      manufacturerId,
      name: "B48B20O2",
      code: "B48B20O2",
      fuelType: "PETROL",
      displacementCc: 1998,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Twin-scroll turbocharger",
      electrification: "48V mild hybrid",
    },
  });

  const b58 = await prisma.engine.upsert({
    where: { slug: "bmw-b58b30m2" },
    create: {
      manufacturerId,
      slug: "bmw-b58b30m2",
      name: "B58B30M2",
      code: "B58B30M2",
      fuelType: "PETROL",
      displacementCc: 2998,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Twin-scroll turbocharger",
      electrification: "48V mild hybrid",
    },
    update: {
      manufacturerId,
      name: "B58B30M2",
      code: "B58B30M2",
      fuelType: "PETROL",
      displacementCc: 2998,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Twin-scroll turbocharger",
      electrification: "48V mild hybrid",
    },
  });

  const s58 = await prisma.engine.upsert({
    where: { slug: "bmw-s58b30t0" },
    create: {
      manufacturerId,
      slug: "bmw-s58b30t0",
      name: "S58B30T0",
      code: "S58B30T0",
      fuelType: "PETROL",
      displacementCc: 2993,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Twin mono-scroll turbochargers",
    },
    update: {
      manufacturerId,
      name: "S58B30T0",
      code: "S58B30T0",
      fuelType: "PETROL",
      displacementCc: 2993,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Twin mono-scroll turbochargers",
      electrification: null,
    },
  });

  const engineBySlug = {
    "bmw-b48b20o2": b48,
    "bmw-b58b30m2": b58,
    "bmw-s58b30t0": s58,
  } as const;

  const steptronic = await prisma.transmission.upsert({
    where: { slug: "bmw-8-speed-steptronic" },
    create: {
      slug: "bmw-8-speed-steptronic",
      name: "8-speed Steptronic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    update: { name: "8-speed Steptronic", type: "AUTOMATIC", gearCount: 8 },
  });

  const manual6 = await prisma.transmission.upsert({
    where: { slug: "bmw-6-speed-manual" },
    create: {
      slug: "bmw-6-speed-manual",
      name: "6-speed manual",
      type: "MANUAL",
      gearCount: 6,
    },
    update: { name: "6-speed manual", type: "MANUAL", gearCount: 6 },
  });

  const mSteptronic = await prisma.transmission.upsert({
    where: { slug: "bmw-8-speed-m-steptronic-drivelogic" },
    create: {
      slug: "bmw-8-speed-m-steptronic-drivelogic",
      name: "8-speed M Steptronic with Drivelogic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    update: {
      name: "8-speed M Steptronic with Drivelogic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
  });

  const transmissionBySlug = {
    "bmw-8-speed-steptronic": steptronic,
    "bmw-6-speed-manual": manual6,
    "bmw-8-speed-m-steptronic-drivelogic": mSteptronic,
  } as const;

  const pressSourceBySlug = new Map<string, { id: string }>();
  for (const src of PRESS_SOURCES) {
    const record = await prisma.source.upsert({
      where: { slug: src.slug },
      create: {
        slug: src.slug,
        title: src.title,
        publisher: "BMW Group",
        url: src.url,
        type: src.type,
      },
      update: {
        title: src.title,
        publisher: "BMW Group",
        url: src.url,
        type: src.type,
      },
    });
    pressSourceBySlug.set(src.slug, record);
  }

  const priceSourceBySlug = new Map<string, { id: string }>(pressSourceBySlug);
  for (const src of PRICE_SOURCES) {
    const record = await prisma.source.upsert({
      where: { slug: src.slug },
      create: {
        slug: src.slug,
        title: src.title,
        publisher: src.publisher,
        url: src.url,
        type: src.type,
      },
      update: {
        title: src.title,
        publisher: src.publisher,
        url: src.url,
        type: src.type,
      },
    });
    priceSourceBySlug.set(src.slug, record);
  }

  const techSourceBySlug = new Map<string, { id: string }>(pressSourceBySlug);
  for (const src of TECH_SOURCES) {
    const record = await prisma.source.upsert({
      where: { slug: src.slug },
      create: {
        slug: src.slug,
        title: src.title,
        publisher: "BMW of North America",
        url: src.url,
        type: src.type,
      },
      update: {
        title: src.title,
        publisher: "BMW of North America",
        url: src.url,
        type: src.type,
      },
    });
    techSourceBySlug.set(src.slug, record);
  }

  for (const trim of TRIMS) {
    try {
      const existing = await prisma.vehicle.findUnique({
        where: { slug: trim.slug },
        include: {
          dimensions: true,
          performance: true,
          fuelEconomy: true,
          prices: true,
          images: true,
        },
      });
      if (existing && isCompleteVehicle(existing)) {
        skipped.push(`${trim.slug} (already complete)`);
        continue;
      }

      const imageUrl = await assertImageOk(trim.dokNo);
      const imageSource = await ensureImageSource(prisma, trim.dokNo);
      const modelYear = modelYearByGeneration.get(trim.generationCode);
      if (!modelYear) {
        throw new Error(`Missing model year for ${trim.generationCode}`);
      }
      const engine = engineBySlug[trim.engineSlug];
      const transmission = transmissionBySlug[trim.transmissionSlug];
      const pressSource = pressSourceBySlug.get(trim.pressSourceSlug);
      const priceSource = priceSourceBySlug.get(trim.priceSourceSlug);
      const techSource = techSourceBySlug.get(trim.techSourceSlug);
      if (!pressSource || !priceSource || !techSource) {
        throw new Error(`Missing sources for ${trim.slug}`);
      }

      const fuelSource = await prisma.source.upsert({
        where: { slug: `epa-2025-bmw-${trim.slug.replace(/^2025-bmw-/, "").replace(/-us$/, "")}` },
        create: {
          slug: `epa-2025-bmw-${trim.slug.replace(/^2025-bmw-/, "").replace(/-us$/, "")}`,
          title: `EPA Fuel Economy — 2025 BMW ${trim.name}`,
          publisher: "U.S. EPA",
          url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
          type: "GOVERNMENT",
        },
        update: {
          title: `EPA Fuel Economy — 2025 BMW ${trim.name}`,
          publisher: "U.S. EPA",
          url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
          type: "GOVERNMENT",
        },
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
          description: `2025 BMW ${trim.name} (US).`,
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
          description: `2025 BMW ${trim.name} (US).`,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
      });

      const [dimensions, performance, fuelEconomy, basePrice, destinationPrice, image] =
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
              amountCents: DESTINATION_CENTS,
              currency: "USD",
              effectiveAt: pricingDate,
            },
            update: {
              amountCents: DESTINATION_CENTS,
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
              alt: `2025 BMW ${trim.name} exterior`,
              credit: "BMW Group",
              position: 0,
            },
            update: {
              sourceId: imageSource.id,
              url: imageUrl,
              alt: `2025 BMW ${trim.name} exterior`,
              credit: "BMW Group",
            },
          }),
        ]);

      await Promise.all([
        upsertCitation(
          prisma,
          techSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "BMW USA / PressClub dimensions and curb weight",
        ),
        upsertCitation(
          prisma,
          pressSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "PressClub power/torque; BMW USA or PressClub 0–60",
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
          basePrice.id,
          "amountCents",
          "Base MSRP excluding destination (2025 US)",
        ),
        upsertCitation(
          prisma,
          pressSource.id,
          "VehiclePrice",
          destinationPrice.id,
          "amountCents",
          "Destination and handling $1,175",
        ),
        upsertCitation(
          prisma,
          imageSource.id,
          "VehicleImage",
          image.id,
          "url",
          `BMW PressClub mediapool ${trim.dokNo}`,
        ),
      ]);

      await ensureAudit(prisma, importerId, vehicle.id, trim.slug);
      seeded.push(
        `${trim.slug} | dokNo=${trim.dokNo} | EPA=${trim.epaId} | image=${mediapoolUrl(trim.dokNo)}`,
      );
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      skipped.push(`${trim.slug}: ${reason}`);
    }
  }

  return { seeded, skipped };
}
