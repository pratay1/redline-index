/**
 * Mercedes-Benz EQ flagship EV seed (EQE / EQS / EQE SUV / EQS SUV / Maybach EQS SUV).
 * Idempotent upserts. Unique exterior images only. Do not wire into prisma/seed.ts here.
 *
 * EPA MY 2025 (fueleconomy.gov vehicle IDs) + MBUSA / Edmunds / Cars.com MSRP & performance.
 */
import type { BodyStyle, Drivetrain, PrismaClient } from "../../src/generated/prisma/client";
import {
  MERCEDES_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureMercedesEngine,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./mercedes-shared";

const LBS_TO_KG = 0.45359237;
const CUFT_TO_L = 28.3168466;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToL(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

/** Unique Wikimedia exterior thumbs (color/angle differ per trim). */
const IMG = {
  eqe350Plus:
    "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/eqe-class/eqe-sedan/class-page/series/2026-EQE-SEDAN-FWSH-1-2-XL.jpg",
  eqe3504m:
    "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/eqe-class/eqe-sedan/class-page/series/2026-EQE-SEDAN-FWSH-1-1-XL.jpg",
  eqe500:
    "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/eqe-class/eqe-sedan/class-page/series/2026-EQE-SEDAN-FWSH-2-1-XL.jpg",
  amgEqe53:
    "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/eqe-class/eqe-sedan/class-page/series/2026-EQE-SEDAN-CPH-XL.jpg",
  eqs450Plus:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/2023_Mercedes_EQS_1.jpg/1280px-2023_Mercedes_EQS_1.jpg",
  eqs4504m:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2023_Mercedes-Benz_EQS_450_Business_Class_4Matic_-_108kWh_%28360PS%29_Electric_-_Diamond_White_-_02-2024%2C_Front.jpg/1280px-2023_Mercedes-Benz_EQS_450_Business_Class_4Matic_-_108kWh_%28360PS%29_Electric_-_Diamond_White_-_02-2024%2C_Front.jpg",
  eqs580:
    "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/eqs-class/eqs-sedan/dimensions/2026-EQS450-4M-SEDAN-SFB-DR.png",
  amgEqs53:
    "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/eqs-class/eqs-sedan/dimensions/2026-EQS580-4M-SEDAN-SFB-DR.png",
  eqsSuv450Plus:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Mercedes-Benz_X296_450%2B_1X7A6275.jpg/1280px-Mercedes-Benz_X296_450%2B_1X7A6275.jpg",
  eqsSuv4504m:
    "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/eqs-class/eqs-suv/cgt/2026-EQS400-4M-SUV-CGT-DR.png",
  eqsSuv580:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Mercedes-Benz_X296_EQS_580_4MATIC_SUV_AMG_Line_Polar_White.jpg/1280px-Mercedes-Benz_X296_EQS_580_4MATIC_SUV_AMG_Line_Polar_White.jpg",
  maybach680:
    "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/eqs-class/eqs-suv-maybach/dimensions/2026-EQS-MAYBACH-SUV-SFB-DR.png",
  eqeSuv350Plus:
    "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/eqe-class/eqe-suv/cgt/2026-EQE350-SUV-CGT-DR.webp",
  eqeSuv3504m:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2024_Mercedes-Benz_X294_EQE_350_4MATIC_in_Obsidian_Black_Metallic%2C_front_right%2C_06-26-2024.jpg/1280px-2024_Mercedes-Benz_X294_EQE_350_4MATIC_in_Obsidian_Black_Metallic%2C_front_right%2C_06-26-2024.jpg",
  eqeSuv500:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/2023_Mercedes-Benz_EQE_350_SUV_4MATIC_AMG_Dynamic.jpg/1280px-2023_Mercedes-Benz_EQE_350_SUV_4MATIC_AMG_Dynamic.jpg",
  amgEqeSuv53:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Mercedes-Benz_X294_1X7A0834.jpg/1280px-Mercedes-Benz_X294_1X7A0834.jpg",
} as const;

type FuelEco = {
  cityMpg: number;
  highwayMpg: number;
  combinedMpg: number;
  electricRangeMiles: number;
};

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

type TrimDef = {
  slug: string;
  name: string;
  year: number;
  modelSlug: string;
  modelName: string;
  generationCode: string;
  generationDisplay: string;
  generationStart: number;
  bodyStyle: BodyStyle;
  drivetrain: Drivetrain;
  engineSlug: string;
  engineName: string;
  engineCode: string;
  engineElectrification: string;
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
  msrpCents: number;
  dimensions: Dims;
  performance: Perf;
  fuelEconomy: FuelEco;
  epaId: string;
  epaTitle: string;
  specSourceSlug: string;
};

const EQE_SEDAN_DIMS: Dims = {
  lengthIn: 196.9,
  widthIn: 77.2,
  heightIn: 59.5,
  wheelbaseIn: 122.8,
  curbWeightKg: lbsToKg(5280),
  cargoVolumeLiters: cuFtToL(10.9),
  seatingCapacity: 5,
};

const EQE_SUV_DIMS: Dims = {
  lengthIn: 191.5,
  widthIn: 76.4,
  heightIn: 66.4,
  wheelbaseIn: 119.3,
  curbWeightKg: lbsToKg(5535),
  cargoVolumeLiters: cuFtToL(18.4),
  seatingCapacity: 5,
};

const EQS_SEDAN_DIMS: Dims = {
  lengthIn: 208.2,
  widthIn: 75.8,
  heightIn: 59.6,
  wheelbaseIn: 126.4,
  curbWeightKg: lbsToKg(5590),
  cargoVolumeLiters: cuFtToL(22.0),
  seatingCapacity: 5,
};

const EQS_SUV_DIMS: Dims = {
  lengthIn: 201.8,
  widthIn: 77.1,
  heightIn: 67.6,
  wheelbaseIn: 126.4,
  curbWeightKg: lbsToKg(6094),
  cargoVolumeLiters: cuFtToL(23.0),
  seatingCapacity: 5,
};

const MAYBACH_EQS_SUV_DIMS: Dims = {
  lengthIn: 201.8,
  widthIn: 77.1,
  heightIn: 67.6,
  wheelbaseIn: 126.4,
  curbWeightKg: lbsToKg(6658),
  cargoVolumeLiters: cuFtToL(15.5),
  seatingCapacity: 5,
};

const SPEC_SOURCES: Array<{
  slug: string;
  title: string;
  publisher: string;
  url: string;
  type: "MANUFACTURER" | "PRESS_RELEASE" | "THIRD_PARTY";
  publishedAt?: Date;
}> = [
  {
    slug: "mbusa-2025-eqe-sedan",
    title: "2025 Mercedes-Benz EQE Sedan — MBUSA / Edmunds specifications & MSRP",
    publisher: "Mercedes-Benz USA / Edmunds",
    url: "https://www.edmunds.com/mercedes-benz/eqe/2025/features-specs/",
    type: "THIRD_PARTY",
  },
  {
    slug: "cars-2025-eqe-sedan-pricing",
    title: "How Much Is the 2025 Mercedes-EQ EQE Sedan? (Cars.com)",
    publisher: "Cars.com",
    url: "https://www.cars.com/research/mercedes_benz-amg_eqe-2025/",
    type: "THIRD_PARTY",
  },
  {
    slug: "mbusa-2025-eqs-sedan",
    title: "Build Your Own EQS Sedan — MBUSA power / 0-60 / MSRP",
    publisher: "Mercedes-Benz USA",
    url: "https://www.mbusa.com/en/vehicles/build/eqs/sedan",
    type: "MANUFACTURER",
  },
  {
    slug: "cars-2025-eqs-sedan-pricing",
    title: "How Much Is the 2025 Mercedes-EQ EQS Sedan? (Cars.com)",
    publisher: "Cars.com",
    url: "https://www.cars.com/articles/how-much-is-the-2025-mercedes-eq-eqs-sedan-508620/",
    type: "THIRD_PARTY",
  },
  {
    slug: "edmunds-2025-eqe-suv",
    title: "2025 Mercedes-Benz EQE SUV — Specs & Features (Edmunds)",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/mercedes-benz/eqe-suv/2025/features-specs/",
    type: "THIRD_PARTY",
  },
  {
    slug: "edmunds-2025-eqs-suv",
    title: "2025 Mercedes-Benz EQS SUV — Specs & Features (Edmunds)",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/mercedes-benz/eqs-suv/2025/features-specs/",
    type: "THIRD_PARTY",
  },
  {
    slug: "dealer-2025-maybach-eqs-suv",
    title: "2025 Mercedes-Maybach EQS SUV — starting MSRP $179,900",
    publisher: "Mercedes-Benz of Buckhead",
    url: "https://www.mercedesofbuckhead.com/showroom/2025/Mercedes-Benz/Maybach%20EQS%20680%20SUV/SUV.htm",
    type: "THIRD_PARTY",
  },
];

const TRIMS: TrimDef[] = [
  // —— EQE Sedan (V295) ——
  {
    slug: "2025-mercedes-eqe-350-plus-us",
    name: "EQE 350+",
    year: 2025,
    modelSlug: "mercedes-eqe",
    modelName: "EQE",
    generationCode: "V295",
    generationDisplay: "V295 EQE Sedan",
    generationStart: 2022,
    bodyStyle: "SEDAN",
    drivetrain: "RWD",
    engineSlug: "mercedes-eqe-215kw-psm",
    engineName: "215 kW ACPM (rear)",
    engineCode: "EQE-215KW",
    engineElectrification: "215 kW ACPM 6-Phase (EPA)",
    imageUrl: IMG.eqe350Plus,
    imagePageUrl: "https://commons.wikimedia.org/wiki/File:2022_Mercedes_EQE.jpg",
    imageAlt: "2025 Mercedes-Benz EQE 350+ exterior",
    msrpCents: 7_490_000,
    dimensions: EQE_SEDAN_DIMS,
    performance: { powerHp: 288, torqueLbFt: 417, zeroToSixtySeconds: 6.2, topSpeedMph: 130 },
    fuelEconomy: { cityMpg: 94, highwayMpg: 94, combinedMpg: 94, electricRangeMiles: 308 },
    epaId: "48384",
    epaTitle: "2025 Mercedes-Benz EQE 350 Plus fuel economy data",
    specSourceSlug: "mbusa-2025-eqe-sedan",
  },
  {
    slug: "2025-mercedes-eqe-350-4matic-us",
    name: "EQE 350 4MATIC",
    year: 2025,
    modelSlug: "mercedes-eqe",
    modelName: "EQE",
    generationCode: "V295",
    generationDisplay: "V295 EQE Sedan",
    generationStart: 2022,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    engineSlug: "mercedes-eqe-350-4matic-dual",
    engineName: "Dual ACPM (71 + 144 kW)",
    engineCode: "EQE-350-4M",
    engineElectrification: "71 and 144 kW ACPM 3-Phase (EPA)",
    imageUrl: IMG.eqe3504m,
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:Mercedes-Benz_EQE_350_4MATIC_V295_Obsidian_Black_(1).jpg",
    imageAlt: "2025 Mercedes-Benz EQE 350 4MATIC exterior",
    msrpCents: 7_790_000,
    dimensions: { ...EQE_SEDAN_DIMS, curbWeightKg: lbsToKg(5423) },
    performance: { powerHp: 288, torqueLbFt: 564, zeroToSixtySeconds: 5.5, topSpeedMph: 130 },
    fuelEconomy: { cityMpg: 87, highwayMpg: 85, combinedMpg: 86, electricRangeMiles: 267 },
    epaId: "48383",
    epaTitle: "2025 Mercedes-Benz EQE 350 4matic fuel economy data",
    specSourceSlug: "mbusa-2025-eqe-sedan",
  },
  {
    slug: "2025-mercedes-eqe-500-4matic-us",
    name: "EQE 500 4MATIC",
    year: 2025,
    modelSlug: "mercedes-eqe",
    modelName: "EQE",
    generationCode: "V295",
    generationDisplay: "V295 EQE Sedan",
    generationStart: 2022,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    engineSlug: "mercedes-eqe-500-4matic-dual",
    engineName: "Dual ACPM (71 + 144 kW, 6-phase)",
    engineCode: "EQE-500-4M",
    engineElectrification: "71 and 144 kW ACPM 6-Phase (EPA); 402 hp combined",
    imageUrl: IMG.eqe500,
    imagePageUrl: "https://commons.wikimedia.org/wiki/File:Mercedes-Benz_V295_500_1X7A6809.jpg",
    imageAlt: "2025 Mercedes-Benz EQE 500 4MATIC exterior",
    msrpCents: 8_590_000,
    dimensions: { ...EQE_SEDAN_DIMS, curbWeightKg: lbsToKg(5467) },
    performance: { powerHp: 402, torqueLbFt: 633, zeroToSixtySeconds: 4.5, topSpeedMph: 130 },
    fuelEconomy: { cityMpg: 85, highwayMpg: 84, combinedMpg: 85, electricRangeMiles: 266 },
    epaId: "48385",
    epaTitle: "2025 Mercedes-Benz EQE 500 4matic fuel economy data",
    specSourceSlug: "mbusa-2025-eqe-sedan",
  },
  {
    slug: "2025-mercedes-amg-eqe-53-us",
    name: "AMG EQE 53",
    year: 2025,
    modelSlug: "mercedes-eqe",
    modelName: "EQE",
    generationCode: "V295",
    generationDisplay: "V295 EQE Sedan",
    generationStart: 2022,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    engineSlug: "mercedes-amg-eqe-53-dual",
    engineName: "AMG dual ACPM (165 + 165 kW)",
    engineCode: "AMG-EQE-53",
    engineElectrification: "165 and 165 kW ACPM 3-Phase (EPA); 617 hp combined",
    imageUrl: IMG.amgEqe53,
    imagePageUrl: "https://commons.wikimedia.org/wiki/File:Mercedes-Benz_V295_1X7A0425.jpg",
    imageAlt: "2025 Mercedes-AMG EQE 53 exterior",
    msrpCents: 10_690_000,
    dimensions: { ...EQE_SEDAN_DIMS, curbWeightKg: lbsToKg(5688) },
    performance: { powerHp: 617, torqueLbFt: 701, zeroToSixtySeconds: 3.4, topSpeedMph: 137 },
    fuelEconomy: { cityMpg: 69, highwayMpg: 71, combinedMpg: 70, electricRangeMiles: 220 },
    epaId: "48382",
    epaTitle: "2025 Mercedes-Benz AMG EQE 4matic Plus fuel economy data",
    specSourceSlug: "cars-2025-eqe-sedan-pricing",
  },
  // —— EQS Sedan (V297) ——
  {
    slug: "2025-mercedes-eqs-450-plus-us",
    name: "EQS 450+",
    year: 2025,
    modelSlug: "mercedes-eqs",
    modelName: "EQS",
    generationCode: "V297",
    generationDisplay: "V297 EQS Sedan",
    generationStart: 2021,
    bodyStyle: "SEDAN",
    drivetrain: "RWD",
    engineSlug: "mercedes-eqs-265kw-psm",
    engineName: "265 kW ACPM (rear)",
    engineCode: "EQS-265KW",
    engineElectrification: "265 kW ACPM 6-Phase (EPA)",
    imageUrl: IMG.eqs450Plus,
    imagePageUrl: "https://commons.wikimedia.org/wiki/File:2023_Mercedes_EQS_1.jpg",
    imageAlt: "2025 Mercedes-Benz EQS 450+ exterior",
    msrpCents: 10_440_000,
    dimensions: EQS_SEDAN_DIMS,
    performance: { powerHp: 355, torqueLbFt: 419, zeroToSixtySeconds: 5.9, topSpeedMph: 130 },
    fuelEconomy: { cityMpg: 98, highwayMpg: 98, combinedMpg: 98, electricRangeMiles: 390 },
    epaId: "48388",
    epaTitle: "2025 Mercedes-Benz EQS 450 Plus fuel economy data",
    specSourceSlug: "mbusa-2025-eqs-sedan",
  },
  {
    slug: "2025-mercedes-eqs-450-4matic-us",
    name: "EQS 450 4MATIC",
    year: 2025,
    modelSlug: "mercedes-eqs",
    modelName: "EQS",
    generationCode: "V297",
    generationDisplay: "V297 EQS Sedan",
    generationStart: 2021,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    engineSlug: "mercedes-eqs-450-4matic-dual",
    engineName: "Dual ACPM (174 + 310 kW)",
    engineCode: "EQS-450-4M",
    engineElectrification: "174 and 310 kW ACPM 3-Phase (EPA); 355 hp combined",
    imageUrl: IMG.eqs4504m,
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:2023_Mercedes-Benz_EQS_450_Business_Class_4Matic_-_108kWh_(360PS)_Electric_-_Diamond_White_-_02-2024,_Front.jpg",
    imageAlt: "2025 Mercedes-Benz EQS 450 4MATIC exterior",
    msrpCents: 10_740_000,
    dimensions: EQS_SEDAN_DIMS,
    performance: { powerHp: 355, torqueLbFt: 590, zeroToSixtySeconds: 5.4, topSpeedMph: 130 },
    fuelEconomy: { cityMpg: 91, highwayMpg: 93, combinedMpg: 92, electricRangeMiles: 367 },
    epaId: "48387",
    epaTitle: "2025 Mercedes-Benz EQS 450 4matic fuel economy data",
    specSourceSlug: "mbusa-2025-eqs-sedan",
  },
  {
    slug: "2025-mercedes-eqs-580-4matic-us",
    name: "EQS 580 4MATIC",
    year: 2025,
    modelSlug: "mercedes-eqs",
    modelName: "EQS",
    generationCode: "V297",
    generationDisplay: "V297 EQS Sedan",
    generationStart: 2021,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    engineSlug: "mercedes-eqs-580-4matic",
    engineName: "310 kW ACPM (dual-motor AWD)",
    engineCode: "EQS-580-4M",
    engineElectrification: "310 kW ACPM 6-Phase (EPA); 536 hp combined",
    imageUrl: IMG.eqs580,
    imagePageUrl: "https://commons.wikimedia.org/wiki/File:2024_Mercedes_EQS_580_Business_Class_4MATIC.jpg",
    imageAlt: "2025 Mercedes-Benz EQS 580 4MATIC exterior",
    msrpCents: 12_735_000,
    dimensions: EQS_SEDAN_DIMS,
    performance: { powerHp: 536, torqueLbFt: 633, zeroToSixtySeconds: 4.2, topSpeedMph: 130 },
    fuelEconomy: { cityMpg: 93, highwayMpg: 93, combinedMpg: 93, electricRangeMiles: 371 },
    epaId: "48389",
    epaTitle: "2025 Mercedes-Benz EQS 580 4matic fuel economy data",
    specSourceSlug: "cars-2025-eqs-sedan-pricing",
  },
  {
    slug: "2025-mercedes-amg-eqs-53-us",
    name: "AMG EQS 53",
    year: 2025,
    modelSlug: "mercedes-eqs",
    modelName: "EQS",
    generationCode: "V297",
    generationDisplay: "V297 EQS Sedan",
    generationStart: 2021,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    engineSlug: "mercedes-amg-eqs-53-dual",
    engineName: "AMG dual ACPM (174 + 310 kW)",
    engineCode: "AMG-EQS-53",
    engineElectrification: "174 and 310 kW ACPM 3-Phase (EPA); 649 hp combined",
    imageUrl: IMG.amgEqs53,
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:Mercedes-AMG_EQS53_(V297)_Washington_DC_Metro_Area,_USA.jpg",
    imageAlt: "2025 Mercedes-AMG EQS 53 exterior",
    msrpCents: 14_755_000,
    dimensions: { ...EQS_SEDAN_DIMS, curbWeightKg: lbsToKg(5864) },
    performance: { powerHp: 649, torqueLbFt: 700, zeroToSixtySeconds: 3.4, topSpeedMph: 137 },
    fuelEconomy: { cityMpg: 76, highwayMpg: 81, combinedMpg: 78, electricRangeMiles: 315 },
    epaId: "48386",
    epaTitle: "2025 Mercedes-Benz AMG EQS 4matic Plus fuel economy data",
    specSourceSlug: "cars-2025-eqs-sedan-pricing",
  },
  // —— EQS SUV (X296) ——
  {
    slug: "2025-mercedes-eqs-suv-450-plus-us",
    name: "EQS 450+ SUV",
    year: 2025,
    modelSlug: "mercedes-eqs-suv",
    modelName: "EQS SUV",
    generationCode: "X296",
    generationDisplay: "X296 EQS SUV",
    generationStart: 2022,
    bodyStyle: "SUV",
    drivetrain: "RWD",
    engineSlug: "mercedes-eqs-suv-265kw-psm",
    engineName: "265 kW ACPM (rear)",
    engineCode: "EQS-SUV-265KW",
    engineElectrification: "265 kW ACPM 6-Phase (EPA)",
    imageUrl: IMG.eqsSuv450Plus,
    imagePageUrl: "https://commons.wikimedia.org/wiki/File:Mercedes-Benz_X296_450+_1X7A6275.jpg",
    imageAlt: "2025 Mercedes-Benz EQS 450+ SUV exterior",
    msrpCents: 10_525_000,
    dimensions: EQS_SUV_DIMS,
    performance: { powerHp: 355, torqueLbFt: 419, zeroToSixtySeconds: 6.5, topSpeedMph: 130 },
    fuelEconomy: { cityMpg: 84, highwayMpg: 79, combinedMpg: 82, electricRangeMiles: 323 },
    epaId: "48392",
    epaTitle: "2025 Mercedes-Benz EQS 450 Plus (SUV) fuel economy data",
    specSourceSlug: "edmunds-2025-eqs-suv",
  },
  {
    slug: "2025-mercedes-eqs-suv-450-4matic-us",
    name: "EQS 450 4MATIC SUV",
    year: 2025,
    modelSlug: "mercedes-eqs-suv",
    modelName: "EQS SUV",
    generationCode: "X296",
    generationDisplay: "X296 EQS SUV",
    generationStart: 2022,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "mercedes-eqs-suv-450-4matic-dual",
    engineName: "Dual ACPM (174 + 310 kW)",
    engineCode: "EQS-SUV-450-4M",
    engineElectrification: "174 and 310 kW ACPM 6-Phase (EPA); 355 hp combined",
    imageUrl: IMG.eqsSuv4504m,
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:Mercedes-Benz_X296_EQS_450_4MATIC_SUV_AMG_Line_Obsidian_Black.jpg",
    imageAlt: "2025 Mercedes-Benz EQS 450 4MATIC SUV exterior",
    msrpCents: 10_825_000,
    dimensions: EQS_SUV_DIMS,
    performance: { powerHp: 355, torqueLbFt: 590, zeroToSixtySeconds: 5.8, topSpeedMph: 130 },
    fuelEconomy: { cityMpg: 80, highwayMpg: 78, combinedMpg: 79, electricRangeMiles: 312 },
    epaId: "48395",
    epaTitle: "2025 Mercedes-Benz EQS 450 4matic (SUV) fuel economy data",
    specSourceSlug: "edmunds-2025-eqs-suv",
  },
  {
    slug: "2025-mercedes-eqs-suv-580-4matic-us",
    name: "EQS 580 4MATIC SUV",
    year: 2025,
    modelSlug: "mercedes-eqs-suv",
    modelName: "EQS SUV",
    generationCode: "X296",
    generationDisplay: "X296 EQS SUV",
    generationStart: 2022,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "mercedes-eqs-suv-580-4matic-dual",
    engineName: "Dual ACPM (174 + 310 kW)",
    engineCode: "EQS-SUV-580-4M",
    engineElectrification: "174 and 310 kW ACPM 6-Phase (EPA); 536 hp combined",
    imageUrl: IMG.eqsSuv580,
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:Mercedes-Benz_X296_EQS_580_4MATIC_SUV_AMG_Line_Polar_White.jpg",
    imageAlt: "2025 Mercedes-Benz EQS 580 4MATIC SUV exterior",
    msrpCents: 12_820_000,
    dimensions: EQS_SUV_DIMS,
    performance: { powerHp: 536, torqueLbFt: 633, zeroToSixtySeconds: 4.5, topSpeedMph: 130 },
    fuelEconomy: { cityMpg: 82, highwayMpg: 78, combinedMpg: 80, electricRangeMiles: 317 },
    epaId: "48396",
    epaTitle: "2025 Mercedes-Benz EQS 580 4matic (SUV) fuel economy data",
    specSourceSlug: "edmunds-2025-eqs-suv",
  },
  // —— Maybach EQS SUV ——
  {
    slug: "2025-mercedes-maybach-eqs-suv-680-us",
    name: "Maybach EQS SUV 680",
    year: 2025,
    modelSlug: "mercedes-maybach-eqs-suv",
    modelName: "Maybach EQS SUV",
    generationCode: "X296-MAYBACH",
    generationDisplay: "X296 Mercedes-Maybach EQS SUV",
    generationStart: 2023,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "mercedes-maybach-eqs-680-dual",
    engineName: "Maybach dual ACPM (174 + 310 kW)",
    engineCode: "MAYBACH-EQS-680",
    engineElectrification: "174 and 310 kW ACPM 6-Phase (EPA); 649 hp combined",
    imageUrl: IMG.maybach680,
    imagePageUrl: "https://commons.wikimedia.org/wiki/File:2024_Mercedes-Maybach_EQS_680_SUV.jpg",
    imageAlt: "2025 Mercedes-Maybach EQS SUV 680 exterior",
    msrpCents: 17_990_000,
    dimensions: MAYBACH_EQS_SUV_DIMS,
    performance: { powerHp: 649, torqueLbFt: 700, zeroToSixtySeconds: 4.1, topSpeedMph: 130 },
    fuelEconomy: { cityMpg: 76, highwayMpg: 76, combinedMpg: 76, electricRangeMiles: 302 },
    epaId: "48397",
    epaTitle: "2025 Mercedes-Benz EQS 680 4matic Maybach (SUV) fuel economy data",
    specSourceSlug: "dealer-2025-maybach-eqs-suv",
  },
  // —— EQE SUV (X294) ——
  {
    slug: "2025-mercedes-eqe-suv-350-plus-us",
    name: "EQE 350+ SUV",
    year: 2025,
    modelSlug: "mercedes-eqe-suv",
    modelName: "EQE SUV",
    generationCode: "X294",
    generationDisplay: "X294 EQE SUV",
    generationStart: 2023,
    bodyStyle: "SUV",
    drivetrain: "RWD",
    engineSlug: "mercedes-eqe-suv-215kw-psm",
    engineName: "215 kW ACPM (rear)",
    engineCode: "EQE-SUV-215KW",
    engineElectrification: "215 kW ACPM 6-Phase (EPA)",
    imageUrl: IMG.eqeSuv350Plus,
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:Mercedes-Benz_EQE_350+_SUV_AMG_Line_(X_294)_–_f_13072025.jpg",
    imageAlt: "2025 Mercedes-Benz EQE 350+ SUV exterior",
    msrpCents: 7_790_000,
    dimensions: EQE_SUV_DIMS,
    performance: { powerHp: 288, torqueLbFt: 417, zeroToSixtySeconds: 6.3, topSpeedMph: 130 },
    fuelEconomy: { cityMpg: 98, highwayMpg: 87, combinedMpg: 93, electricRangeMiles: 302 },
    epaId: "48390",
    epaTitle: "2025 Mercedes-Benz EQE 350 Plus (SUV) fuel economy data",
    specSourceSlug: "edmunds-2025-eqe-suv",
  },
  {
    slug: "2025-mercedes-eqe-suv-350-4matic-us",
    name: "EQE 350 4MATIC SUV",
    year: 2025,
    modelSlug: "mercedes-eqe-suv",
    modelName: "EQE SUV",
    generationCode: "X294",
    generationDisplay: "X294 EQE SUV",
    generationStart: 2023,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "mercedes-eqe-suv-350-4matic-dual",
    engineName: "Dual ACPM (71 + 144 kW)",
    engineCode: "EQE-SUV-350-4M",
    engineElectrification: "71 and 144 kW ACPM 6-Phase (EPA)",
    imageUrl: IMG.eqeSuv3504m,
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:2024_Mercedes-Benz_X294_EQE_350_4MATIC_in_Obsidian_Black_Metallic,_front_right,_06-26-2024.jpg",
    imageAlt: "2025 Mercedes-Benz EQE 350 4MATIC SUV exterior",
    msrpCents: 7_790_000,
    dimensions: { ...EQE_SUV_DIMS, curbWeightKg: lbsToKg(5688) },
    performance: { powerHp: 288, torqueLbFt: 564, zeroToSixtySeconds: 5.9, topSpeedMph: 130 },
    fuelEconomy: { cityMpg: 84, highwayMpg: 78, combinedMpg: 81, electricRangeMiles: 253 },
    epaId: "48394",
    epaTitle: "2025 Mercedes-Benz EQE 350 4matic (SUV) fuel economy data",
    specSourceSlug: "edmunds-2025-eqe-suv",
  },
  {
    slug: "2025-mercedes-eqe-suv-500-4matic-us",
    name: "EQE 500 4MATIC SUV",
    year: 2025,
    modelSlug: "mercedes-eqe-suv",
    modelName: "EQE SUV",
    generationCode: "X294",
    generationDisplay: "X294 EQE SUV",
    generationStart: 2023,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "mercedes-eqe-suv-500-4matic-dual",
    engineName: "Dual ACPM (71 + 144 kW)",
    engineCode: "EQE-SUV-500-4M",
    engineElectrification: "71 and 144 kW ACPM 3-Phase (EPA); 402 hp combined",
    imageUrl: IMG.eqeSuv500,
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:2023_Mercedes-Benz_EQE_350_SUV_4MATIC_AMG_Dynamic.jpg",
    imageAlt: "2025 Mercedes-Benz EQE 500 4MATIC SUV exterior",
    msrpCents: 8_950_000,
    dimensions: { ...EQE_SUV_DIMS, curbWeightKg: lbsToKg(5732) },
    performance: { powerHp: 402, torqueLbFt: 633, zeroToSixtySeconds: 4.6, topSpeedMph: 130 },
    fuelEconomy: { cityMpg: 83, highwayMpg: 78, combinedMpg: 81, electricRangeMiles: 264 },
    epaId: "48391",
    epaTitle: "2025 Mercedes-Benz EQE 500 4matic (SUV) fuel economy data",
    specSourceSlug: "edmunds-2025-eqe-suv",
  },
  {
    slug: "2025-mercedes-amg-eqe-suv-53-us",
    name: "AMG EQE SUV 53",
    year: 2025,
    modelSlug: "mercedes-eqe-suv",
    modelName: "EQE SUV",
    generationCode: "X294",
    generationDisplay: "X294 EQE SUV",
    generationStart: 2023,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "mercedes-amg-eqe-suv-53-dual",
    engineName: "AMG dual ACPM (165 + 295 kW)",
    engineCode: "AMG-EQE-SUV-53",
    engineElectrification: "165 and 295 kW ACPM 3-Phase (EPA); 617 hp combined",
    imageUrl: IMG.amgEqeSuv53,
    imagePageUrl: "https://commons.wikimedia.org/wiki/File:Mercedes-Benz_X294_1X7A0834.jpg",
    imageAlt: "2025 Mercedes-AMG EQE SUV 53 exterior",
    msrpCents: 10_960_000,
    dimensions: { ...EQE_SUV_DIMS, curbWeightKg: lbsToKg(5952) },
    performance: { powerHp: 617, torqueLbFt: 701, zeroToSixtySeconds: 3.4, topSpeedMph: 137 },
    fuelEconomy: { cityMpg: 76, highwayMpg: 72, combinedMpg: 74, electricRangeMiles: 230 },
    epaId: "48393",
    epaTitle: "2025 Mercedes-Benz AMG EQE 4matic Plus (SUV) fuel economy data",
    specSourceSlug: "edmunds-2025-eqe-suv",
  },
];

const SKIPPED_UNSOURCED = [
  "EQE 300: not offered US MY 2025 (EPA); EU/other markets only",
  "AMG EQE 43: discontinued / not listed US MY 2025 EPA (AMG EQE 4matic Plus → AMG EQE 53)",
  "AMG EQE SUV 43: discontinued / not listed US MY 2025 EPA (AMG EQE SUV → AMG EQE SUV 53)",
  "AMG EQS SUV 53: not listed US MY 2025 EPA menu",
];

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function upsertSource(
  prisma: PrismaClient,
  data: {
    slug: string;
    title: string;
    publisher: string;
    url: string;
    type: "MANUFACTURER" | "PRESS_RELEASE" | "THIRD_PARTY" | "GOVERNMENT";
    publishedAt?: Date;
  },
) {
  return upsertCatalogueSource(prisma, data);
}

async function seedOne(
  ctx: SeedCtx,
  trim: TrimDef,
  sourceBySlug: Map<string, { id: string }>,
  transmissionId: string,
) {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;

  await sleep(1500);
  await assertImageUrlOk(trim.imageUrl);
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
    where: { generationId_year: { generationId: generation.id, year: trim.year } },
    create: { generationId: generation.id, year: trim.year },
    update: {},
  });

  const engine = await ensureMercedesEngine(prisma, {
    manufacturerId,
    slug: trim.engineSlug,
    name: trim.engineName,
    code: trim.engineCode,
    fuelType: "ELECTRIC",
    electrification: trim.engineElectrification,
    displacementCc: null,
    cylinderCount: null,
    configuration: null,
    induction: null,
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
      status: "PUBLISHED",
      publishedAt: pricingDate,
    },
  });

  const [dimensions, performance, fuelEconomy, price, destination] = await Promise.all([
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
        amountCents: MERCEDES_DESTINATION_CENTS,
        currency: "USD",
        effectiveAt: pricingDate,
      },
      update: {
        amountCents: MERCEDES_DESTINATION_CENTS,
        currency: "USD",
      },
    }),
  ]);

  await prisma.vehicleImage.upsert({
    where: { vehicleId_position: { vehicleId: vehicle.id, position: 0 } },
    create: {
      vehicleId: vehicle.id,
      sourceId: imageSource.id,
      url: trim.imageUrl,
      alt: trim.imageAlt,
      credit: "Wikimedia Commons / Mercedes-Benz",
      position: 0,
    },
    update: {
      sourceId: imageSource.id,
      url: trim.imageUrl,
      alt: trim.imageAlt,
      credit: "Wikimedia Commons / Mercedes-Benz",
    },
  });

  const epaSlug = `epa-${trim.year}-mercedes-${trim.slug.replace(/^\d{4}-mercedes-/, "").replace(/-us$/, "")}`;
  const epaSource = await upsertSource(prisma, {
    slug: epaSlug,
    title: trim.epaTitle,
    publisher: "U.S. Department of Energy and U.S. Environmental Protection Agency",
    url: `https://www.fueleconomy.gov/ws/rest/vehicle/${trim.epaId}`,
    type: "GOVERNMENT",
  });

  const specSource = sourceBySlug.get(trim.specSourceSlug);
  if (!specSource) throw new Error(`Missing spec source ${trim.specSourceSlug}`);

  await Promise.all([
    upsertCitation(
      prisma,
      specSource.id,
      "VehicleDimensions",
      dimensions.id,
      "specifications",
      "Official / published specifications",
    ),
    upsertCitation(
      prisma,
      specSource.id,
      "VehiclePerformance",
      performance.id,
      "specifications",
      "Official / published specifications",
    ),
    upsertCitation(prisma, specSource.id, "VehiclePrice", price.id, "amountCents", "Base MSRP"),
    upsertCitation(
      prisma,
      specSource.id,
      "VehiclePrice",
      destination.id,
      "amountCents",
      "Destination and handling",
    ),
    upsertCitation(
      prisma,
      epaSource.id,
      "VehicleFuelEconomy",
      fuelEconomy.id,
      "combinedMpg",
      "EPA combined MPGe",
    ),
    upsertCitation(
      prisma,
      epaSource.id,
      "VehicleFuelEconomy",
      fuelEconomy.id,
      "electricRangeMiles",
      "EPA electric range",
    ),
  ]);

  await ensureAudit(prisma, importerId, vehicle.id, trim.slug);
  return `${trim.slug} | EPA=${trim.epaId} | image=${trim.imageUrl}`;
}

export async function seedMercedesEqFlagship(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const seeded: string[] = [];
  const skipped: string[] = [...SKIPPED_UNSOURCED];

  const transmission = await ctx.prisma.transmission.upsert({
    where: { slug: "mercedes-single-speed-automatic" },
    create: {
      slug: "mercedes-single-speed-automatic",
      name: "Single-speed automatic",
      type: "SINGLE_SPEED",
      gearCount: 1,
    },
    update: {
      name: "Single-speed automatic",
      type: "SINGLE_SPEED",
      gearCount: 1,
    },
  });

  const sourceBySlug = new Map<string, { id: string }>();
  for (const src of SPEC_SOURCES) {
    const row = await upsertSource(ctx.prisma, src);
    sourceBySlug.set(src.slug, { id: row.id });
  }

  for (const trim of TRIMS) {
    try {
      const line = await seedOne(ctx, trim, sourceBySlug, transmission.id);
      seeded.push(line);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      skipped.push(`${trim.slug}: ${message}`);
    }
  }

  return { seeded, skipped };
}
