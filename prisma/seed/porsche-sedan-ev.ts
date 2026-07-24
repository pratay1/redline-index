/**
 * Porsche Panamera (sedan) + Taycan (EV) US seed module.
 * Current-gen Panamera G3 / 972 and Taycan Y1A facelift (MY2025).
 * Prefer encyCARpedia exteriors; auto-data.net fallback (unique per trim).
 * Idempotent upserts. Do not wire into prisma/seed.ts here.
 *
 * Spec sources (never invent):
 * - Porsche MY25 Panamera TechSpecs PDF (newsroom)
 * - Porsche Newsroom USA 2025 Taycan pricing / 0–60
 * - EPA fueleconomy.gov vehicle IDs
 * - Edmunds / Car and Driver for Taycan dimensions & torque where cited
 */
import type { BodyStyle, Drivetrain, FuelType } from "../../src/generated/prisma/client";
import {
  PORSCHE_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensurePorscheEngine,
  ensureImageSource,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./porsche-shared";

const LBS_TO_KG = 0.45359237;
const CUFT_TO_L = 28.316846592;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

type Dims = {
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  wheelbaseIn: number;
  curbWeightKg?: number;
  cargoVolumeLiters?: number;
  seatingCapacity: number;
};

type Perf = {
  powerHp: number;
  torqueLbFt: number;
  zeroToSixtySeconds: number;
  topSpeedMph: number;
};

type FuelEco = {
  cityMpg: number;
  highwayMpg: number;
  combinedMpg: number;
  electricRangeMiles?: number;
};

type TrimDef = {
  slug: string;
  name: string;
  year: number;
  modelSlug: "porsche-panamera" | "porsche-taycan";
  modelName: "Panamera" | "Taycan";
  generationCode: string;
  generationDisplay: string;
  generationStart: number;
  bodyStyle: BodyStyle;
  drivetrain: Drivetrain;
  fuelType: FuelType;
  engineSlug: string;
  engineName: string;
  engineCode: string | null;
  engineDisplacementCc?: number | null;
  engineCylinderCount?: number | null;
  engineConfiguration: string;
  engineInduction?: string | null;
  engineElectrification: string | null;
  transmissionSlug: string;
  transmissionName: string;
  transmissionType: "DUAL_CLUTCH" | "AUTOMATIC";
  transmissionGears: number;
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
  imageCredit: "encyCARpedia" | "auto-data.net";
  msrpCents: number;
  dimensions: Dims;
  performance: Perf;
  fuelEconomy: FuelEco;
  epaId: string;
  epaTitle: string;
  specSourceSlug: string;
  skipReason?: string;
};

/**
 * Unique auto-data.net exteriors (verified full-car shots — no interiors/crops).
 * encyCARpedia catalogue pages blocked; CDN IDs not model-verified for Porsche.
 */
const IMG = {
  panameraBase: "https://www.auto-data.net/images/f33/Porsche-Panamera-G3.jpg",
  panamera4: "https://www.auto-data.net/images/f62/Porsche-Panamera-G3.jpg",
  panameraGts: "https://www.auto-data.net/images/f75/Porsche-Panamera-G3.jpg",
  panamera4sEh: "https://www.auto-data.net/images/f105/Porsche-Panamera-G3.jpg",
  taycanBase: "https://www.auto-data.net/images/f75/Porsche-Taycan-Y1A-facelift-2024.jpg",
  taycan4s: "https://www.auto-data.net/images/f80/Porsche-Taycan-Y1A-facelift-2024.jpg",
  taycanTurbo: "https://www.auto-data.net/images/f96/Porsche-Taycan.jpg",
  taycanCt4: "https://www.auto-data.net/images/f96/Porsche-Taycan-Cross-Turismo-Y1A.jpg",
} as const;

const PANAMERA_PAGE =
  "https://www.auto-data.net/en/porsche-panamera-g3-generation-9772";
const TAYCAN_PAGE =
  "https://www.auto-data.net/en/porsche-taycan-y1a-generation-7269";

const TRIMS: TrimDef[] = [
  // —— Panamera G3 / 972 (US MY2025) ——
  {
    slug: "2025-porsche-panamera-us",
    name: "Panamera",
    year: 2025,
    modelSlug: "porsche-panamera",
    modelName: "Panamera",
    generationCode: "G3",
    generationDisplay: "Third generation (G3 / 972)",
    generationStart: 2024,
    bodyStyle: "SEDAN",
    drivetrain: "RWD",
    fuelType: "PETROL",
    engineSlug: "porsche-ea839-2894-v6-tt",
    engineName: "2.9L twin-turbo V6",
    engineCode: "EA839-2894",
    engineDisplacementCc: 2894,
    engineCylinderCount: 6,
    engineConfiguration: "V",
    engineInduction: "Twin-turbo",
    engineElectrification: null,
    transmissionSlug: "porsche-pdk-8",
    transmissionName: "8-speed Porsche Doppelkupplung (PDK)",
    transmissionType: "DUAL_CLUTCH",
    transmissionGears: 8,
    imageUrl: IMG.panameraBase,
    imagePageUrl: PANAMERA_PAGE,
    imageAlt: "2025 Porsche Panamera exterior",
    imageCredit: "auto-data.net",
    msrpCents: 10280000,
    dimensions: {
      // Porsche MY25 Panamera TechSpecs (length/WB/height); width auto-data 1937 mm.
      lengthIn: 198.8,
      widthIn: 76.3,
      heightIn: 55.7,
      wheelbaseIn: 116.1,
      curbWeightKg: lbsToKg(4295),
      cargoVolumeLiters: cuFtToLiters(17.6),
      seatingCapacity: 4,
    },
    performance: {
      // TechSpecs: 348 hp / 368 lb-ft; 0–60 4.8 s; top 169 mph.
      powerHp: 348,
      torqueLbFt: 368,
      zeroToSixtySeconds: 4.8,
      topSpeedMph: 169,
    },
    fuelEconomy: { cityMpg: 18, highwayMpg: 25, combinedMpg: 21 },
    epaId: "48194",
    epaTitle: "2025 Porsche Panamera fuel economy data",
    specSourceSlug: "porsche-my25-panamera-techspecs",
  },
  {
    slug: "2025-porsche-panamera-4-us",
    name: "Panamera 4",
    year: 2025,
    modelSlug: "porsche-panamera",
    modelName: "Panamera",
    generationCode: "G3",
    generationDisplay: "Third generation (G3 / 972)",
    generationStart: 2024,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    fuelType: "PETROL",
    engineSlug: "porsche-ea839-2894-v6-tt",
    engineName: "2.9L twin-turbo V6",
    engineCode: "EA839-2894",
    engineDisplacementCc: 2894,
    engineCylinderCount: 6,
    engineConfiguration: "V",
    engineInduction: "Twin-turbo",
    engineElectrification: null,
    transmissionSlug: "porsche-pdk-8",
    transmissionName: "8-speed Porsche Doppelkupplung (PDK)",
    transmissionType: "DUAL_CLUTCH",
    transmissionGears: 8,
    imageUrl: IMG.panamera4,
    imagePageUrl: PANAMERA_PAGE,
    imageAlt: "2025 Porsche Panamera 4 exterior",
    imageCredit: "auto-data.net",
    msrpCents: 10980000,
    dimensions: {
      lengthIn: 198.8,
      widthIn: 76.3,
      heightIn: 56.0,
      wheelbaseIn: 116.1,
      curbWeightKg: lbsToKg(4374),
      cargoVolumeLiters: cuFtToLiters(17.6),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 348,
      torqueLbFt: 368,
      zeroToSixtySeconds: 4.5,
      topSpeedMph: 168,
    },
    fuelEconomy: { cityMpg: 18, highwayMpg: 25, combinedMpg: 21 },
    epaId: "48195",
    epaTitle: "2025 Porsche Panamera 4 fuel economy data",
    specSourceSlug: "porsche-my25-panamera-techspecs",
  },
  {
    slug: "2025-porsche-panamera-gts-us",
    name: "Panamera GTS",
    year: 2025,
    modelSlug: "porsche-panamera",
    modelName: "Panamera",
    generationCode: "G3",
    generationDisplay: "Third generation (G3 / 972)",
    generationStart: 2024,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    fuelType: "PETROL",
    engineSlug: "porsche-3996-v8-tt-gts",
    engineName: "4.0L twin-turbo V8",
    engineCode: "PA-3996-GTS",
    engineDisplacementCc: 3996,
    engineCylinderCount: 8,
    engineConfiguration: "V",
    engineInduction: "Twin-turbo",
    engineElectrification: null,
    transmissionSlug: "porsche-pdk-8",
    transmissionName: "8-speed Porsche Doppelkupplung (PDK)",
    transmissionType: "DUAL_CLUTCH",
    transmissionGears: 8,
    imageUrl: IMG.panameraGts,
    imagePageUrl: PANAMERA_PAGE,
    imageAlt: "2025 Porsche Panamera GTS exterior",
    imageCredit: "auto-data.net",
    msrpCents: 15420000,
    dimensions: {
      lengthIn: 199.0,
      widthIn: 76.3,
      heightIn: 56.0,
      wheelbaseIn: 116.1,
      curbWeightKg: lbsToKg(4639),
      cargoVolumeLiters: cuFtToLiters(16.8),
      seatingCapacity: 4,
    },
    performance: {
      // TechSpecs: 493 hp / 486 lb-ft; 0–60 3.6 s; top 188 mph.
      powerHp: 493,
      torqueLbFt: 486,
      zeroToSixtySeconds: 3.6,
      topSpeedMph: 188,
    },
    fuelEconomy: { cityMpg: 16, highwayMpg: 24, combinedMpg: 18 },
    epaId: "49043",
    epaTitle: "2025 Porsche Panamera GTS fuel economy data",
    specSourceSlug: "porsche-my25-panamera-techspecs",
  },
  {
    slug: "2025-porsche-panamera-4s-e-hybrid-us",
    name: "Panamera 4S E-Hybrid",
    year: 2025,
    modelSlug: "porsche-panamera",
    modelName: "Panamera",
    generationCode: "G3",
    generationDisplay: "Third generation (G3 / 972)",
    generationStart: 2024,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    fuelType: "PLUG_IN_HYBRID",
    engineSlug: "porsche-ea839-2894-4s-eh",
    engineName: "2.9L twin-turbo V6 + e-machine (4S E-Hybrid)",
    engineCode: "EA839-4S-EH",
    engineDisplacementCc: 2894,
    engineCylinderCount: 6,
    engineConfiguration: "V",
    engineInduction: "Twin-turbo",
    engineElectrification: "Plug-in hybrid (187 hp e-machine, 25.9 kWh battery)",
    transmissionSlug: "porsche-pdk-8",
    transmissionName: "8-speed Porsche Doppelkupplung (PDK)",
    transmissionType: "DUAL_CLUTCH",
    transmissionGears: 8,
    imageUrl: IMG.panamera4sEh,
    imagePageUrl: PANAMERA_PAGE,
    imageAlt: "2025 Porsche Panamera 4S E-Hybrid exterior",
    imageCredit: "auto-data.net",
    msrpCents: 12680000,
    dimensions: {
      lengthIn: 199.0,
      widthIn: 76.3,
      heightIn: 56.0,
      wheelbaseIn: 116.1,
      curbWeightKg: lbsToKg(5016),
      cargoVolumeLiters: cuFtToLiters(15.1),
      seatingCapacity: 4,
    },
    performance: {
      // TechSpecs combined: 536 hp / 553 lb-ft; 0–60 3.5 s; top 180 mph.
      powerHp: 536,
      torqueLbFt: 553,
      zeroToSixtySeconds: 3.5,
      topSpeedMph: 180,
    },
    // EPA gas-only mpg + electric range (MPGe 50/59/54 cited on EPA page).
    fuelEconomy: {
      cityMpg: 20,
      highwayMpg: 23,
      combinedMpg: 21,
      electricRangeMiles: 28,
    },
    epaId: "49164",
    epaTitle: "2025 Porsche Panamera 4S E-Hybrid fuel economy data",
    specSourceSlug: "porsche-my25-panamera-techspecs",
  },
  {
    slug: "2025-porsche-panamera-turbo-e-hybrid-us",
    name: "Panamera Turbo E-Hybrid",
    year: 2025,
    modelSlug: "porsche-panamera",
    modelName: "Panamera",
    generationCode: "G3",
    generationDisplay: "Third generation (G3 / 972)",
    generationStart: 2024,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    fuelType: "PLUG_IN_HYBRID",
    engineSlug: "porsche-3996-v8-turbo-eh",
    engineName: "4.0L twin-turbo V8 + e-machine (Turbo E-Hybrid)",
    engineCode: "PA-3996-TEH",
    engineDisplacementCc: 3996,
    engineCylinderCount: 8,
    engineConfiguration: "V",
    engineInduction: "Twin-turbo",
    engineElectrification: "Plug-in hybrid",
    transmissionSlug: "porsche-pdk-8",
    transmissionName: "8-speed Porsche Doppelkupplung (PDK)",
    transmissionType: "DUAL_CLUTCH",
    transmissionGears: 8,
    imageUrl: IMG.panameraGts,
    imagePageUrl: PANAMERA_PAGE,
    imageAlt: "2025 Porsche Panamera Turbo E-Hybrid exterior",
    imageCredit: "auto-data.net",
    msrpCents: 19100000,
    dimensions: {
      lengthIn: 199.0,
      widthIn: 76.3,
      heightIn: 56.0,
      wheelbaseIn: 116.1,
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 670,
      torqueLbFt: 685,
      zeroToSixtySeconds: 3.0,
      topSpeedMph: 195,
    },
    fuelEconomy: { cityMpg: 0, highwayMpg: 0, combinedMpg: 0 },
    epaId: "",
    epaTitle: "",
    specSourceSlug: "porsche-my25-panamera-techspecs",
    skipReason:
      "Turbo E-Hybrid: EPA fuel economy / electric range not published yet (CarBuzz / fueleconomy.gov) — incomplete for catalogue",
  },

  // —— Taycan Y1A facelift (US MY2025) ——
  {
    slug: "2025-porsche-taycan-us",
    name: "Taycan",
    year: 2025,
    modelSlug: "porsche-taycan",
    modelName: "Taycan",
    generationCode: "Y1A",
    generationDisplay: "Y1A (facelift 2024)",
    generationStart: 2020,
    bodyStyle: "SEDAN",
    drivetrain: "RWD",
    fuelType: "ELECTRIC",
    engineSlug: "porsche-taycan-rear-pmsm",
    engineName: "Rear PMSM (Performance Battery)",
    engineCode: "TAYCAN-RWD-PMSM",
    engineConfiguration: "Single electric motor",
    engineElectrification: "Rear ACPM (EPA 300 and 320 kW ratings)",
    transmissionSlug: "porsche-taycan-2-speed",
    transmissionName: "Two-speed automatic (rear)",
    transmissionType: "AUTOMATIC",
    transmissionGears: 2,
    imageUrl: IMG.taycanBase,
    imagePageUrl: TAYCAN_PAGE,
    imageAlt: "2025 Porsche Taycan exterior",
    imageCredit: "auto-data.net",
    // Porsche Newsroom USA MY2025 MSRP (excl. destination).
    msrpCents: 9940000,
    dimensions: {
      // Edmunds 2025 Taycan base specs.
      lengthIn: 195.4,
      widthIn: 77.4,
      heightIn: 54.3,
      wheelbaseIn: 114.2,
      curbWeightKg: lbsToKg(4630),
      cargoVolumeLiters: cuFtToLiters(17.2),
      seatingCapacity: 4,
    },
    performance: {
      // Newsroom / Edmunds: 402 hp, 302 lb-ft, 0–60 4.5 s; Porsche top 143 mph.
      powerHp: 402,
      torqueLbFt: 302,
      zeroToSixtySeconds: 4.5,
      topSpeedMph: 143,
    },
    fuelEconomy: {
      cityMpg: 94,
      highwayMpg: 88,
      combinedMpg: 91,
      electricRangeMiles: 274,
    },
    epaId: "48415",
    epaTitle: "2025 Porsche Taycan Performance Battery fuel economy data",
    specSourceSlug: "porsche-newsroom-2025-taycan",
  },
  {
    slug: "2025-porsche-taycan-4s-us",
    name: "Taycan 4S",
    year: 2025,
    modelSlug: "porsche-taycan",
    modelName: "Taycan",
    generationCode: "Y1A",
    generationDisplay: "Y1A (facelift 2024)",
    generationStart: 2020,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    fuelType: "ELECTRIC",
    engineSlug: "porsche-taycan-dual-pmsm-4s",
    engineName: "Dual PMSM (4S Perf Battery Plus)",
    engineCode: "TAYCAN-4S-DUAL",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "Front + rear ACPM (EPA 201 and 234 kW)",
    transmissionSlug: "porsche-taycan-2-speed",
    transmissionName: "Two-speed automatic (rear) / single-speed (front)",
    transmissionType: "AUTOMATIC",
    transmissionGears: 2,
    imageUrl: IMG.taycan4s,
    imagePageUrl: TAYCAN_PAGE,
    imageAlt: "2025 Porsche Taycan 4S exterior",
    imageCredit: "auto-data.net",
    msrpCents: 11850000,
    dimensions: {
      // C&D 2025 Taycan 4S tested car (Perf Battery Plus).
      lengthIn: 195.4,
      widthIn: 77.4,
      heightIn: 54.2,
      wheelbaseIn: 114.2,
      curbWeightKg: lbsToKg(5143),
      cargoVolumeLiters: cuFtToLiters(14),
      seatingCapacity: 4,
    },
    performance: {
      // MY2025 overboost LC 536 hp (Newsroom/Orlando); torque up to 512 lb-ft (Porsche USA).
      powerHp: 536,
      torqueLbFt: 512,
      zeroToSixtySeconds: 3.5,
      topSpeedMph: 155,
    },
    fuelEconomy: {
      cityMpg: 89,
      highwayMpg: 85,
      combinedMpg: 87,
      electricRangeMiles: 295,
    },
    epaId: "48732",
    epaTitle: "2025 Porsche Taycan 4S Perf Battery Plus fuel economy data",
    specSourceSlug: "porsche-newsroom-2025-taycan",
  },
  {
    slug: "2025-porsche-taycan-turbo-us",
    name: "Taycan Turbo",
    year: 2025,
    modelSlug: "porsche-taycan",
    modelName: "Taycan",
    generationCode: "Y1A",
    generationDisplay: "Y1A (facelift 2024)",
    generationStart: 2020,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    fuelType: "ELECTRIC",
    engineSlug: "porsche-taycan-dual-pmsm-turbo",
    engineName: "Dual PMSM (Turbo)",
    engineCode: "TAYCAN-TURBO-DUAL",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "Front + rear ACPM (EPA 175 and 234 kW)",
    transmissionSlug: "porsche-taycan-2-speed",
    transmissionName: "Two-speed automatic (rear) / single-speed (front)",
    transmissionType: "AUTOMATIC",
    transmissionGears: 2,
    imageUrl: IMG.taycanTurbo,
    imagePageUrl: TAYCAN_PAGE,
    imageAlt: "2025 Porsche Taycan Turbo exterior",
    imageCredit: "auto-data.net",
    msrpCents: 17360000,
    dimensions: {
      lengthIn: 195.4,
      widthIn: 77.4,
      heightIn: 54.3,
      wheelbaseIn: 114.2,
      // Curb not fully sourced for Turbo sedan MY2025 — omit rather than invent.
      cargoVolumeLiters: cuFtToLiters(14),
      seatingCapacity: 4,
    },
    performance: {
      // Newsroom / Porsche Westlake: 871 hp LC; 656 lb-ft; 0–60 2.5 s; top 162 mph.
      powerHp: 871,
      torqueLbFt: 656,
      zeroToSixtySeconds: 2.5,
      topSpeedMph: 162,
    },
    fuelEconomy: {
      cityMpg: 88,
      highwayMpg: 83,
      combinedMpg: 86,
      electricRangeMiles: 292,
    },
    epaId: "48734",
    epaTitle: "2025 Porsche Taycan Turbo fuel economy data",
    specSourceSlug: "porsche-newsroom-2025-taycan",
  },
  {
    slug: "2025-porsche-taycan-4-cross-turismo-us",
    name: "Taycan 4 Cross Turismo",
    year: 2025,
    modelSlug: "porsche-taycan",
    modelName: "Taycan",
    generationCode: "Y1A",
    generationDisplay: "Y1A (facelift 2024)",
    generationStart: 2020,
    bodyStyle: "WAGON",
    drivetrain: "AWD",
    fuelType: "ELECTRIC",
    engineSlug: "porsche-taycan-dual-pmsm-ct4",
    engineName: "Dual PMSM (4 Cross Turismo)",
    engineCode: "TAYCAN-CT4-DUAL",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "Front + rear ACPM (EPA 150 and 354 kW)",
    transmissionSlug: "porsche-taycan-2-speed",
    transmissionName: "Two-speed automatic (rear) / single-speed (front)",
    transmissionType: "AUTOMATIC",
    transmissionGears: 2,
    imageUrl: IMG.taycanCt4,
    imagePageUrl: TAYCAN_PAGE,
    imageAlt: "2025 Porsche Taycan 4 Cross Turismo exterior",
    imageCredit: "auto-data.net",
    msrpCents: 11110000,
    dimensions: {
      // C&D instrumented 2025 Taycan 4 Cross Turismo.
      lengthIn: 195.8,
      widthIn: 77.4,
      heightIn: 55.4,
      wheelbaseIn: 114.3,
      curbWeightKg: lbsToKg(5197),
      cargoVolumeLiters: cuFtToLiters(16),
      seatingCapacity: 5,
    },
    performance: {
      // C&D / Newsroom: 429 hp, 449 lb-ft, 0–60 4.5 s; KBB top ~136 mph.
      powerHp: 429,
      torqueLbFt: 449,
      zeroToSixtySeconds: 4.5,
      topSpeedMph: 136,
    },
    fuelEconomy: {
      cityMpg: 84,
      highwayMpg: 79,
      combinedMpg: 81,
      electricRangeMiles: 277,
    },
    epaId: "48730",
    epaTitle: "2025 Porsche Taycan 4 Cross Turismo fuel economy data",
    specSourceSlug: "porsche-newsroom-2025-taycan",
  },
];

const SPEC_SOURCES = [
  {
    slug: "porsche-my25-panamera-techspecs",
    title: "MY25 Panamera Models Technical Data (Porsche Newsroom PDF)",
    publisher: "Porsche Cars North America",
    url: "https://newsroom.porsche.com/dam/jcr:6e513c19-3b43-4ef5-baa4-71add9ba1d27/2024_Panamera_TechSpecs.pdf",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "porsche-newsroom-2025-taycan",
    title: "The new 2025 Porsche Taycan models — Porsche Newsroom USA",
    publisher: "Porsche Cars North America",
    url: "https://newsroom.porsche.com/en_US/2024/products/02062024_The_new_2025-_Porsche_Taycan_models.html",
    type: "PRESS_RELEASE" as const,
  },
  {
    slug: "edmunds-2025-taycan",
    title: "2025 Porsche Taycan — Edmunds specifications & MSRP",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/porsche/taycan/2025/features-specs/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "caranddriver-2025-taycan-cross-turismo",
    title: "2025 Porsche Taycan Cross Turismo — Car and Driver specs / tests",
    publisher: "Car and Driver",
    url: "https://www.caranddriver.com/porsche/taycan-cross-turismo-2025",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "porsche-destination-fee",
    title: "Porsche of America destination, processing and handling ($1,995)",
    publisher: "Porsche Cars North America",
    url: "https://newsroom.porsche.com/en_US/2024/products/02062024_The_new_2025-_Porsche_Taycan_models.html",
    type: "MANUFACTURER" as const,
  },
];

const STATIC_SKIPPED = [
  "Panamera gas 4S: not offered in current US G3 lineup (4S is E-Hybrid only; seeded 4S E-Hybrid)",
  "Taycan Sport Turismo: Cross Turismo seeded as the sourced wagon body; Sport Turismo GTS not duplicated",
  "Panamera Executive long-wheelbase: out of standard sedan trim set for this module",
];

async function seedOne(
  ctx: SeedCtx,
  trim: TrimDef,
  sourceBySlug: Map<string, { id: string }>,
) {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;

  if (!trim.epaId) {
    throw new Error("Missing EPA id");
  }
  if (
    trim.fuelType === "ELECTRIC" &&
    (trim.fuelEconomy.electricRangeMiles == null ||
      trim.fuelEconomy.combinedMpg <= 0)
  ) {
    throw new Error("EV requires electricRangeMiles + MPGe");
  }

  await assertImageUrlOk(trim.imageUrl);
  const imageSource = await ensureImageSource(prisma, {
    slug: `img-${trim.slug}`,
    title: `${trim.name} exterior (${trim.imageCredit})`,
    pageUrl: trim.imagePageUrl,
    publisher: trim.imageCredit,
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
    where: { modelId_code: { modelId: model.id, code: trim.generationCode } },
    create: {
      modelId: model.id,
      code: trim.generationCode,
      displayName: trim.generationDisplay,
      startYear: trim.generationStart,
    },
    update: {
      displayName: trim.generationDisplay,
      startYear: trim.generationStart,
    },
  });

  const modelYear = await prisma.modelYear.upsert({
    where: {
      generationId_year: { generationId: generation.id, year: trim.year },
    },
    create: { generationId: generation.id, year: trim.year },
    update: {},
  });

  const engine = await ensurePorscheEngine(prisma, {
    manufacturerId,
    slug: trim.engineSlug,
    name: trim.engineName,
    code: trim.engineCode,
    fuelType: trim.fuelType,
    displacementCc: trim.engineDisplacementCc ?? null,
    cylinderCount: trim.engineCylinderCount ?? null,
    configuration: trim.engineConfiguration,
    induction: trim.engineInduction ?? null,
    electrification: trim.engineElectrification,
  });

  const transmission = await prisma.transmission.upsert({
    where: { slug: trim.transmissionSlug },
    create: {
      slug: trim.transmissionSlug,
      name: trim.transmissionName,
      type: trim.transmissionType,
      gearCount: trim.transmissionGears,
    },
    update: {
      name: trim.transmissionName,
      type: trim.transmissionType,
      gearCount: trim.transmissionGears,
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
      description: `${trim.year} Porsche ${trim.name} (US).`,
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
      description: `${trim.year} Porsche ${trim.name} (US).`,
      status: "PUBLISHED",
      publishedAt: pricingDate,
    },
  });

  const fuelEconomyData = {
    cityMpg: trim.fuelEconomy.cityMpg,
    highwayMpg: trim.fuelEconomy.highwayMpg,
    combinedMpg: trim.fuelEconomy.combinedMpg,
    electricRangeMiles: trim.fuelEconomy.electricRangeMiles ?? null,
  };

  const [dimensions, performance, fuelEconomy, price, destination] =
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
          amountCents: trim.msrpCents,
          currency: "USD",
          effectiveAt: pricingDate,
        },
        update: { amountCents: trim.msrpCents, currency: "USD" },
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
          amountCents: PORSCHE_DESTINATION_CENTS,
          currency: "USD",
          effectiveAt: pricingDate,
        },
        update: {
          amountCents: PORSCHE_DESTINATION_CENTS,
          currency: "USD",
        },
      }),
    ]);

  const image = await prisma.vehicleImage.upsert({
    where: { vehicleId_position: { vehicleId: vehicle.id, position: 0 } },
    create: {
      vehicleId: vehicle.id,
      sourceId: imageSource.id,
      url: trim.imageUrl,
      alt: trim.imageAlt,
      credit: trim.imageCredit,
      position: 0,
    },
    update: {
      sourceId: imageSource.id,
      url: trim.imageUrl,
      alt: trim.imageAlt,
      credit: trim.imageCredit,
    },
  });

  const epaSource = await upsertCatalogueSource(prisma, {
    slug: `epa-${trim.year}-porsche-${trim.slug.replace(/^\d{4}-porsche-/, "").replace(/-us$/, "")}`,
    title: trim.epaTitle,
    publisher: "U.S. Department of Energy and U.S. Environmental Protection Agency",
    url: `https://www.fueleconomy.gov/ws/rest/vehicle/${trim.epaId}`,
    type: "GOVERNMENT",
  });

  const specSource = sourceBySlug.get(trim.specSourceSlug);
  if (!specSource) throw new Error(`Missing spec source ${trim.specSourceSlug}`);
  const destSource = sourceBySlug.get("porsche-destination-fee") ?? specSource;

  // Supplemental third-party citations for Taycan dims / torque.
  const edmunds = sourceBySlug.get("edmunds-2025-taycan");
  const cdCt = sourceBySlug.get("caranddriver-2025-taycan-cross-turismo");

  const citationJobs = [
    upsertCitation(
      prisma,
      specSource.id,
      "VehicleDimensions",
      dimensions.id,
      "specifications",
      "Exterior dimensions / curb weight / cargo",
    ),
    upsertCitation(
      prisma,
      specSource.id,
      "VehiclePerformance",
      performance.id,
      "specifications",
      "Power / torque / 0-60 / top speed",
    ),
    upsertCitation(
      prisma,
      specSource.id,
      "VehiclePrice",
      price.id,
      "amountCents",
      "Base MSRP excluding destination",
    ),
    upsertCitation(
      prisma,
      destSource.id,
      "VehiclePrice",
      destination.id,
      "amountCents",
      `Destination and handling $${(PORSCHE_DESTINATION_CENTS / 100).toFixed(0)}`,
    ),
    upsertCitation(
      prisma,
      epaSource.id,
      "VehicleFuelEconomy",
      fuelEconomy.id,
      "combinedMpg",
      trim.fuelType === "ELECTRIC"
        ? "EPA combined MPGe"
        : "EPA combined MPG (gas)",
    ),
    upsertCitation(
      prisma,
      epaSource.id,
      "VehicleFuelEconomy",
      fuelEconomy.id,
      "cityMpg",
      `EPA vehicle id ${trim.epaId}`,
    ),
    upsertCitation(
      prisma,
      epaSource.id,
      "VehicleFuelEconomy",
      fuelEconomy.id,
      "highwayMpg",
      `EPA vehicle id ${trim.epaId}`,
    ),
    upsertCitation(
      prisma,
      imageSource.id,
      "VehicleImage",
      image.id,
      "url",
      `${trim.imageCredit} exterior asset`,
    ),
  ];

  if (trim.fuelEconomy.electricRangeMiles != null) {
    citationJobs.push(
      upsertCitation(
        prisma,
        epaSource.id,
        "VehicleFuelEconomy",
        fuelEconomy.id,
        "electricRangeMiles",
        "EPA electric range",
      ),
    );
  }

  if (trim.slug === "2025-porsche-taycan-us" && edmunds) {
    citationJobs.push(
      upsertCitation(
        prisma,
        edmunds.id,
        "VehicleDimensions",
        dimensions.id,
        "specifications",
        "Edmunds curb weight / cargo / exterior dims",
      ),
    );
  }

  if (trim.slug.includes("cross-turismo") && cdCt) {
    citationJobs.push(
      upsertCitation(
        prisma,
        cdCt.id,
        "VehicleDimensions",
        dimensions.id,
        "specifications",
        "Car and Driver instrumented curb weight / dimensions",
      ),
    );
  }

  await Promise.all(citationJobs);
  await ensureAudit(prisma, importerId, vehicle.id, trim.slug);
  return trim.slug;
}

export async function seedPorscheSedanEv(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  const sourceBySlug = new Map<string, { id: string }>();
  for (const src of SPEC_SOURCES) {
    const row = await upsertCatalogueSource(ctx.prisma, src);
    sourceBySlug.set(src.slug, { id: row.id });
  }

  const claimedImages = new Set<string>();

  for (const trim of TRIMS) {
    if (trim.skipReason) {
      skipped.push(`${trim.slug}: ${trim.skipReason}`);
      continue;
    }
    try {
      if (claimedImages.has(trim.imageUrl)) {
        throw new Error(`Duplicate image URL within module: ${trim.imageUrl}`);
      }
      claimedImages.add(trim.imageUrl);
      const slug = await seedOne(ctx, trim, sourceBySlug);
      seeded.push(slug);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      skipped.push(`${trim.slug}: ${message}`);
    }
  }

  return { seeded, skipped };
}
