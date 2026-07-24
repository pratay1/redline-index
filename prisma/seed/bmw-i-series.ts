/**
 * BMW i Series EV seed module (i4 / i5 / i7 / iX3 / iX).
 * Idempotent upserts. Do not reuse RESERVED_BMW_IMAGE_IDS.
 */
import type { BodyStyle, Drivetrain, PrismaClient } from "../../src/generated/prisma/client";
import {
  DESTINATION_CENTS,
  assertImageOk,
  ensureAudit,
  ensureImageSource,
  mediapoolUrl,
  upsertCitation,
  type SeedCtx,
} from "./bmw-shared";

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
  frontTrackIn?: number;
  rearTrackIn?: number;
  groundClearanceIn?: number;
  curbWeightKg?: number;
  grossVehicleWeightKg?: number;
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
  dokNo: string;
  imageAlt: string;
  msrpCents: number;
  /** Override destination when manufacturer publishes a different D&H. */
  destinationCents?: number;
  dimensions: Dims;
  performance: Perf;
  fuelEconomy: FuelEco;
  epaId: string;
  epaTitle: string;
  specSourceSlug: string;
  skipReason?: string;
};

const LBS_TO_KG = 0.45359237;
const CUFT_TO_L = 28.3168466;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToL(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

/** i4 eDrive40 and extended i-series trims. */
const TRIMS: TrimDef[] = [
  // —— i4 ——
  {
    slug: "2025-bmw-i4-edrive40-us",
    name: "i4 eDrive40",
    year: 2025,
    modelSlug: "bmw-i4",
    modelName: "i4",
    generationCode: "G26",
    generationDisplay: "G26 i4 Gran Coupe",
    generationStart: 2022,
    bodyStyle: "SEDAN",
    drivetrain: "RWD",
    engineSlug: "bmw-i4-250kw-eesm",
    engineName: "250 kW EESM",
    engineCode: "I4-250KW-EESM",
    engineElectrification: "250 kW externally excited synchronous motor",
    dokNo: "P90546610",
    imageAlt: "2025 BMW i4 eDrive40 exterior",
    msrpCents: 5790000,
    dimensions: {
      lengthIn: 188.3,
      widthIn: 72.9,
      heightIn: 57,
      wheelbaseIn: 112.4,
      frontTrackIn: 62.6,
      rearTrackIn: 63.2,
      groundClearanceIn: 4.9,
      curbWeightKg: 2125,
      grossVehicleWeightKg: 2605,
      cargoVolumeLiters: 470,
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 335,
      torqueLbFt: 317,
      zeroToSixtySeconds: 5.5,
      topSpeedMph: 118,
    },
    fuelEconomy: {
      cityMpg: 113,
      highwayMpg: 111,
      combinedMpg: 112,
      electricRangeMiles: 318,
    },
    epaId: "48310",
    epaTitle: "2025 BMW i4 eDrive40 Gran Coupe fuel economy data",
    specSourceSlug: "bmw-2025-i4-press-release",
  },
  {
    slug: "2025-bmw-i4-xdrive40-us",
    name: "i4 xDrive40",
    year: 2025,
    modelSlug: "bmw-i4",
    modelName: "i4",
    generationCode: "G26",
    generationDisplay: "G26 i4 Gran Coupe",
    generationStart: 2022,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    engineSlug: "bmw-i4-xdrive40-dual-eesm",
    engineName: "Dual EESM (190 + 230 kW)",
    engineCode: "I4-XDRIVE40-DUAL-EESM",
    engineElectrification: "190 and 230 kW EESM (EPA)",
    dokNo: "P90546599",
    imageAlt: "2025 BMW i4 xDrive40 exterior",
    msrpCents: 6230000,
    dimensions: {
      lengthIn: 188.5,
      widthIn: 72.9,
      heightIn: 57,
      wheelbaseIn: 112.4,
      groundClearanceIn: 4.9,
      curbWeightKg: lbsToKg(5022),
      cargoVolumeLiters: cuFtToL(16.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 396,
      torqueLbFt: 443,
      zeroToSixtySeconds: 4.9,
      topSpeedMph: 124,
    },
    fuelEconomy: { cityMpg: 99, highwayMpg: 103, combinedMpg: 101, electricRangeMiles: 287 },
    epaId: "48314",
    epaTitle: "2025 BMW i4 xDrive40 Gran Coupe (18 inch Wheels) fuel economy data",
    specSourceSlug: "bmw-press-i4-xdrive40-canada",
  },
  {
    slug: "2026-bmw-i4-m60-us",
    name: "i4 M60",
    year: 2026,
    modelSlug: "bmw-i4",
    modelName: "i4",
    generationCode: "G26",
    generationDisplay: "G26 i4 Gran Coupe",
    generationStart: 2022,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    engineSlug: "bmw-i4-m60-dual-eesm",
    engineName: "Dual EESM (200 + 250 kW)",
    engineCode: "I4-M60-DUAL-EESM",
    engineElectrification: "200 and 250 kW EESM (EPA); up to 593 hp in My Mode Sport",
    dokNo: "P90546632",
    imageAlt: "2026 BMW i4 M60 exterior",
    msrpCents: 7070000,
    dimensions: {
      lengthIn: 188.5,
      widthIn: 72.9,
      heightIn: 57,
      wheelbaseIn: 112.4,
      groundClearanceIn: 4.9,
      cargoVolumeLiters: cuFtToL(16.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 593,
      torqueLbFt: 586,
      zeroToSixtySeconds: 3.6,
      topSpeedMph: 124,
    },
    fuelEconomy: { cityMpg: 99, highwayMpg: 96, combinedMpg: 98, electricRangeMiles: 278 },
    epaId: "50190",
    epaTitle: "2026 BMW i4 M60 xDrive Gran Coupe (19 inch Wheels) fuel economy data",
    specSourceSlug: "bmw-2026-i4-update-press-release",
  },
  // —— i5 ——
  {
    slug: "2025-bmw-i5-edrive40-us",
    name: "i5 eDrive40",
    year: 2025,
    modelSlug: "bmw-i5",
    modelName: "i5",
    generationCode: "G60",
    generationDisplay: "G60 5 Series / i5",
    generationStart: 2024,
    bodyStyle: "SEDAN",
    drivetrain: "RWD",
    engineSlug: "bmw-i5-250kw-eesm",
    engineName: "250 kW EESM",
    engineCode: "I5-250KW-EESM",
    engineElectrification: "250 kW EESM (EPA)",
    dokNo: "P90504991",
    imageAlt: "2025 BMW i5 eDrive40 exterior",
    msrpCents: 6710000,
    dimensions: {
      lengthIn: 199.2,
      widthIn: 74.8,
      heightIn: 59.6,
      wheelbaseIn: 117.9,
      groundClearanceIn: 5.7,
      curbWeightKg: lbsToKg(4916),
      cargoVolumeLiters: cuFtToL(17.3),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 335,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.7,
      topSpeedMph: 120,
    },
    fuelEconomy: { cityMpg: 104, highwayMpg: 105, combinedMpg: 105, electricRangeMiles: 295 },
    epaId: "48316",
    epaTitle: "2025 BMW i5 eDrive40 Sedan (19 inch Wheels) fuel economy data",
    specSourceSlug: "bmw-2024-5-series-i5-press-release",
  },
  {
    slug: "2025-bmw-i5-xdrive40-us",
    name: "i5 xDrive40",
    year: 2025,
    modelSlug: "bmw-i5",
    modelName: "i5",
    generationCode: "G60",
    generationDisplay: "G60 5 Series / i5",
    generationStart: 2024,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    engineSlug: "bmw-i5-xdrive40-dual-eesm",
    engineName: "Dual EESM (190 + 230 kW)",
    engineCode: "I5-XDRIVE40-DUAL-EESM",
    engineElectrification: "190 and 230 kW EESM (EPA)",
    dokNo: "P90504990",
    imageAlt: "2025 BMW i5 xDrive40 exterior",
    msrpCents: 7010000,
    dimensions: {
      lengthIn: 199.2,
      widthIn: 74.8,
      heightIn: 59.6,
      wheelbaseIn: 117.9,
      groundClearanceIn: 5.7,
      curbWeightKg: lbsToKg(5187),
      cargoVolumeLiters: cuFtToL(17.3),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 389,
      torqueLbFt: 435,
      zeroToSixtySeconds: 5.2,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 92, highwayMpg: 95, combinedMpg: 93, electricRangeMiles: 266 },
    epaId: "48322",
    epaTitle: "2025 BMW i5 xDrive40 Sedan (19 inch Wheels) fuel economy data",
    specSourceSlug: "bmw-2024-spring-i5-xdrive40-press-release",
  },
  {
    slug: "2025-bmw-i5-m60-us",
    name: "i5 M60",
    year: 2025,
    modelSlug: "bmw-i5",
    modelName: "i5",
    generationCode: "G60",
    generationDisplay: "G60 5 Series / i5",
    generationStart: 2024,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    engineSlug: "bmw-i5-m60-dual-eesm",
    engineName: "Dual EESM M60",
    engineCode: "I5-M60-DUAL-EESM",
    engineElectrification: "190 and 230 kW EESM (EPA); up to 593 hp system output",
    dokNo: "P90505035",
    imageAlt: "2025 BMW i5 M60 exterior",
    msrpCents: 8410000,
    dimensions: {
      lengthIn: 199.2,
      widthIn: 74.8,
      heightIn: 59.3,
      wheelbaseIn: 117.9,
      groundClearanceIn: 5.4,
      curbWeightKg: lbsToKg(5247),
      cargoVolumeLiters: cuFtToL(17.3),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 593,
      torqueLbFt: 586,
      zeroToSixtySeconds: 3.7,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 89, highwayMpg: 91, combinedMpg: 90, electricRangeMiles: 253 },
    epaId: "48319",
    epaTitle: "2025 BMW i5 M60 xDrive Sedan (19 inch Wheels) fuel economy data",
    specSourceSlug: "bmw-2024-5-series-i5-press-release",
  },
  // —— i7 (EPA / BMW USA official names) ——
  {
    slug: "2025-bmw-i7-edrive50-us",
    name: "i7 eDrive50",
    year: 2025,
    modelSlug: "bmw-i7",
    modelName: "i7",
    generationCode: "G70",
    generationDisplay: "G70 7 Series / i7",
    generationStart: 2023,
    bodyStyle: "SEDAN",
    drivetrain: "RWD",
    engineSlug: "bmw-i7-335kw-eesm",
    engineName: "335 kW EESM",
    engineCode: "I7-335KW-EESM",
    engineElectrification: "335 kW EESM (EPA)",
    dokNo: "P90458174",
    imageAlt: "2025 BMW i7 eDrive50 exterior",
    msrpCents: 10570000,
    dimensions: {
      lengthIn: 212.2,
      widthIn: 76.8,
      heightIn: 60.8,
      wheelbaseIn: 126.6,
      curbWeightKg: lbsToKg(5635),
      cargoVolumeLiters: cuFtToL(17.7),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 449,
      torqueLbFt: 479,
      zeroToSixtySeconds: 5.3,
      topSpeedMph: 127,
    },
    fuelEconomy: { cityMpg: 85, highwayMpg: 93, combinedMpg: 88, electricRangeMiles: 314 },
    epaId: "48325",
    epaTitle: "2025 BMW i7 eDrive50 Sedan (19 inch Wheels) fuel economy data",
    specSourceSlug: "bmw-i7-edrive50-summer-2023-press",
  },
  {
    slug: "2025-bmw-i7-xdrive60-us",
    name: "i7 xDrive60",
    year: 2025,
    modelSlug: "bmw-i7",
    modelName: "i7",
    generationCode: "G70",
    generationDisplay: "G70 7 Series / i7",
    generationStart: 2023,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    engineSlug: "bmw-i7-xdrive60-dual-eesm",
    engineName: "Dual EESM (190 + 230 kW)",
    engineCode: "I7-XDRIVE60-DUAL-EESM",
    engineElectrification: "190 and 230 kW EESM (EPA); 536 hp combined",
    dokNo: "P90458915",
    imageAlt: "2025 BMW i7 xDrive60 exterior",
    msrpCents: 12420000,
    dimensions: {
      lengthIn: 212.2,
      widthIn: 76.8,
      heightIn: 60.8,
      wheelbaseIn: 126.6,
      cargoVolumeLiters: cuFtToL(17.7),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 536,
      torqueLbFt: 549,
      zeroToSixtySeconds: 4.5,
      topSpeedMph: 149,
    },
    fuelEconomy: { cityMpg: 85, highwayMpg: 91, combinedMpg: 88, electricRangeMiles: 311 },
    epaId: "48330",
    epaTitle: "2025 BMW i7 xDrive60 Sedan (19 inch wheels) fuel economy data",
    specSourceSlug: "bmw-2023-7-series-i7-press-release",
  },
  // —— iX3 (2027 Neue Klasse; official US name iX3 50 xDrive) ——
  {
    slug: "2027-bmw-ix3-50-xdrive-us",
    name: "iX3 50 xDrive",
    year: 2027,
    modelSlug: "bmw-ix3",
    modelName: "iX3",
    generationCode: "NA5",
    generationDisplay: "NA5 Neue Klasse iX3",
    generationStart: 2027,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "bmw-ix3-50-dual-eesm-asm",
    engineName: "Dual motor (123 + 240 kW)",
    engineCode: "IX3-50-DUAL",
    engineElectrification: "123 and 240 kW EESM/ASM (EPA); 463 hp combined",
    dokNo: "P90615623",
    imageAlt: "2027 BMW iX3 50 xDrive exterior",
    msrpCents: 6150000,
    destinationCents: 135000,
    dimensions: {
      lengthIn: 188.3,
      widthIn: 74.6,
      heightIn: 64.4,
      wheelbaseIn: 114.1,
      frontTrackIn: 64.1,
      rearTrackIn: 64.3,
      groundClearanceIn: 6.9,
      curbWeightKg: lbsToKg(5154),
      cargoVolumeLiters: cuFtToL(30.4),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 463,
      torqueLbFt: 476,
      zeroToSixtySeconds: 4.7,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 125, highwayMpg: 110, combinedMpg: 118, electricRangeMiles: 434 },
    epaId: "50385",
    epaTitle: "2027 BMW iX3 50 xDrive (20 inch Summer Tires) fuel economy data",
    specSourceSlug: "bmw-2027-ix3-press-release",
  },
  // —— iX (2026 LCI naming) ——
  {
    slug: "2026-bmw-ix-xdrive45-us",
    name: "iX xDrive45",
    year: 2026,
    modelSlug: "bmw-ix",
    modelName: "iX",
    generationCode: "I20",
    generationDisplay: "I20 iX",
    generationStart: 2022,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "bmw-ix-xdrive45-dual-eesm",
    engineName: "Dual EESM (190 + 200 kW)",
    engineCode: "IX-XDRIVE45-DUAL-EESM",
    engineElectrification: "190 and 200 kW EESM (EPA); 402 hp combined",
    dokNo: "P90585145",
    imageAlt: "2026 BMW iX xDrive45 exterior",
    msrpCents: 7515000,
    dimensions: {
      lengthIn: 195.5,
      widthIn: 77.6,
      heightIn: 67.7,
      wheelbaseIn: 118.1,
      frontTrackIn: 65.9,
      rearTrackIn: 67.1,
      groundClearanceIn: 8.8,
      curbWeightKg: lbsToKg(5567),
      cargoVolumeLiters: cuFtToL(35.5),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 402,
      torqueLbFt: 516,
      zeroToSixtySeconds: 4.9,
      topSpeedMph: 124,
    },
    fuelEconomy: { cityMpg: 94, highwayMpg: 93, combinedMpg: 94, electricRangeMiles: 312 },
    epaId: "49619",
    epaTitle: "2026 BMW iX xDrive45 (20 inch Wheels) fuel economy data",
    specSourceSlug: "bmw-2026-ix-press-release",
  },
  {
    slug: "2026-bmw-ix-xdrive60-us",
    name: "iX xDrive60",
    year: 2026,
    modelSlug: "bmw-ix",
    modelName: "iX",
    generationCode: "I20",
    generationDisplay: "I20 iX",
    generationStart: 2022,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "bmw-ix-xdrive60-dual-eesm",
    engineName: "Dual EESM (190 + 230 kW)",
    engineCode: "IX-XDRIVE60-DUAL-EESM",
    engineElectrification: "190 and 230 kW EESM (EPA); 536 hp combined",
    dokNo: "P90585172",
    imageAlt: "2026 BMW iX xDrive60 exterior",
    msrpCents: 8850000,
    dimensions: {
      lengthIn: 195.5,
      widthIn: 77.6,
      heightIn: 67.7,
      wheelbaseIn: 118.1,
      frontTrackIn: 65.9,
      rearTrackIn: 67.1,
      groundClearanceIn: 8.8,
      curbWeightKg: lbsToKg(5692),
      cargoVolumeLiters: cuFtToL(35.5),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 536,
      torqueLbFt: 564,
      zeroToSixtySeconds: 4.4,
      topSpeedMph: 124,
    },
    fuelEconomy: { cityMpg: 99, highwayMpg: 94, combinedMpg: 97, electricRangeMiles: 364 },
    epaId: "49623",
    epaTitle: "2026 BMW iX xDrive60 (20 inch Wheels) fuel economy data",
    specSourceSlug: "bmw-2026-ix-press-release",
  },
  {
    slug: "2026-bmw-ix-m70-us",
    name: "iX M70",
    year: 2026,
    modelSlug: "bmw-ix",
    modelName: "iX",
    generationCode: "I20",
    generationDisplay: "I20 iX",
    generationStart: 2022,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "bmw-ix-m70-dual-eesm",
    engineName: "Dual EESM M70 (190 + 360 kW)",
    engineCode: "IX-M70-DUAL-EESM",
    engineElectrification: "190 and 360 kW EESM (EPA); up to 650 hp in My Mode Sport",
    dokNo: "P90585348",
    imageAlt: "2026 BMW iX M70 exterior",
    msrpCents: 11150000,
    dimensions: {
      lengthIn: 195.5,
      widthIn: 77.6,
      heightIn: 67.7,
      wheelbaseIn: 118.1,
      frontTrackIn: 65.4,
      rearTrackIn: 66.5,
      groundClearanceIn: 8.8,
      curbWeightKg: lbsToKg(5849),
      cargoVolumeLiters: cuFtToL(35.5),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 650,
      torqueLbFt: 811,
      zeroToSixtySeconds: 3.6,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 79, highwayMpg: 82, combinedMpg: 80, electricRangeMiles: 303 },
    epaId: "49627",
    epaTitle: "2026 BMW iX M70 (21 inch Wheels) fuel economy data",
    specSourceSlug: "bmw-2026-ix-press-release",
  },
];

const SPEC_SOURCES: Array<{
  slug: string;
  title: string;
  publisher: string;
  url: string;
  type: "PRESS_RELEASE" | "MANUFACTURER" | "THIRD_PARTY";
  publishedAt?: Date;
}> = [
  {
    slug: "bmw-press-i4-xdrive40-canada",
    title: "BMW Group Canada announces the new BMW i4 xDrive40",
    publisher: "BMW Group",
    url: "https://www.press.bmwgroup.com/canada/article/detail/T0418238EN/bmw-group-canada-announces-the-new-bmw-i4-xdrive40-expanding-the-i4-range-with-an-additional-xdrive-all-wheel-drive-variant",
    type: "PRESS_RELEASE",
    publishedAt: new Date("2023-06-01T00:00:00.000Z"),
  },
  {
    slug: "bmw-usa-i4-xdrive40-msrp",
    title: "BMW i4 Gran Coupe model overview (MSRP / 0-60)",
    publisher: "BMW of North America",
    url: "https://www.bmwusa.com/vehicles/i-series/i4/bmw-i4-gran-coupe.html",
    type: "MANUFACTURER",
  },
  {
    slug: "bmw-2026-i4-update-press-release",
    title: "2026 BMW i4 update measures",
    publisher: "BMW Group",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0453773EN_US/2026-bmw-i4-update-measures",
    type: "PRESS_RELEASE",
    publishedAt: new Date("2025-11-06T00:00:00.000Z"),
  },
  {
    slug: "bmw-2024-5-series-i5-press-release",
    title: "The All-New 2024 BMW 5 Series",
    publisher: "BMW Group",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0418778EN_US/the-all-new-2024-bmw-5-series",
    type: "PRESS_RELEASE",
    publishedAt: new Date("2023-05-24T00:00:00.000Z"),
  },
  {
    slug: "bmw-2024-spring-i5-xdrive40-press-release",
    title: "BMW model update measures for spring 2024",
    publisher: "BMW Group",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0439355EN_US/bmw-model-update-measures-for-spring-2024",
    type: "PRESS_RELEASE",
    publishedAt: new Date("2024-01-30T00:00:00.000Z"),
  },
  {
    slug: "bmw-i5-xdrive40-curb-edmunds",
    title: "2025 BMW i5 xDrive40 curb weight (Edmunds)",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/bmw/i5/2025/trims/",
    type: "THIRD_PARTY",
  },
  {
    slug: "bmw-2023-7-series-i7-press-release",
    title: "The new BMW 7 Series",
    publisher: "BMW Group",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0382613EN_US/the-new-bmw-7-series",
    type: "PRESS_RELEASE",
    publishedAt: new Date("2022-04-20T00:00:00.000Z"),
  },
  {
    slug: "bmw-i7-edrive50-summer-2023-press",
    title: "BMW model update measures for summer 2023 (i7 eDrive50)",
    publisher: "BMW Group",
    url: "https://www.press.bmwgroup.com/global/article/detail/T0418860EN/bmw-model-update-measures-for-summer-2023",
    type: "PRESS_RELEASE",
    publishedAt: new Date("2023-06-01T00:00:00.000Z"),
  },
  {
    slug: "bmw-i7-2025-pricing-cars",
    title: "2025 BMW i7 pricing (Cars.com)",
    publisher: "Cars.com",
    url: "https://www.cars.com/research/bmw-i7-2025/",
    type: "THIRD_PARTY",
  },
  {
    slug: "bmw-i7-edrive50-curb-edmunds",
    title: "2025 BMW i7 eDrive50 curb weight (Edmunds)",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/bmw/i7/2025/features-specs/",
    type: "THIRD_PARTY",
  },
  {
    slug: "bmw-2027-ix3-press-release",
    title: "The All-New BMW iX3",
    publisher: "BMW Group",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0452316EN_US/the-all-new-bmw-ix3",
    type: "PRESS_RELEASE",
    publishedAt: new Date("2025-09-01T00:00:00.000Z"),
  },
  {
    slug: "bmw-2027-ix3-pricing-press-release",
    title: "BMW Officially Announces Pricing and Range for 2027 BMW iX3 50 xDrive",
    publisher: "BMW Group",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0457571EN_US/bmw-officially-announces-pricing-and-range-for-2027-bmw-ix3-50-xdrive",
    type: "PRESS_RELEASE",
    publishedAt: new Date("2026-05-07T00:00:00.000Z"),
  },
  {
    slug: "bmw-usa-ix3-curb-weight",
    title: "BMW iX3 technical data (curb weight)",
    publisher: "BMW of North America",
    url: "https://www.bmwusa.com/vehicles/x-series/ix3/bmw-ix3-technical-data.html",
    type: "MANUFACTURER",
  },
  {
    slug: "bmw-2026-ix-press-release",
    title: "The new BMW iX",
    publisher: "BMW Group",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0447721EN_US/the-new-bmw-ix",
    type: "PRESS_RELEASE",
    publishedAt: new Date("2025-01-28T00:00:00.000Z"),
  },
];

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
  return prisma.source.upsert({
    where: { url: data.url },
    create: {
      slug: data.slug,
      title: data.title,
      publisher: data.publisher,
      url: data.url,
      type: data.type,
      publishedAt: data.publishedAt,
    },
    update: {
      title: data.title,
      publisher: data.publisher,
      type: data.type,
      publishedAt: data.publishedAt,
    },
  });
}

async function seedOne(ctx: SeedCtx, trim: TrimDef, sourceBySlug: Map<string, { id: string }>) {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;

  await assertImageOk(trim.dokNo);
  const imageSource = await ensureImageSource(prisma, trim.dokNo);

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

  const engine = await prisma.engine.upsert({
    where: { slug: trim.engineSlug },
    create: {
      manufacturerId,
      slug: trim.engineSlug,
      name: trim.engineName,
      code: trim.engineCode,
      fuelType: "ELECTRIC",
      electrification: trim.engineElectrification,
    },
    update: {
      manufacturerId,
      name: trim.engineName,
      code: trim.engineCode,
      fuelType: "ELECTRIC",
      electrification: trim.engineElectrification,
      displacementCc: null,
      cylinderCount: null,
      configuration: null,
      induction: null,
    },
  });

  const transmission = await prisma.transmission.upsert({
    where: { slug: "bmw-single-speed-automatic" },
    create: {
      slug: "bmw-single-speed-automatic",
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
        amountCents: trim.destinationCents ?? DESTINATION_CENTS,
        currency: "USD",
        effectiveAt: pricingDate,
      },
      update: {
        amountCents: trim.destinationCents ?? DESTINATION_CENTS,
        currency: "USD",
      },
    }),
  ]);

  await prisma.vehicleImage.upsert({
    where: { vehicleId_position: { vehicleId: vehicle.id, position: 0 } },
    create: {
      vehicleId: vehicle.id,
      sourceId: imageSource.id,
      url: mediapoolUrl(trim.dokNo),
      alt: trim.imageAlt,
      credit: "BMW Group",
      position: 0,
    },
    update: {
      sourceId: imageSource.id,
      url: mediapoolUrl(trim.dokNo),
      alt: trim.imageAlt,
      credit: "BMW Group",
    },
  });

  const epaSlug = `epa-${trim.year}-bmw-${trim.slug.replace(/^\d{4}-bmw-/, "").replace(/-us$/, "")}`;
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
    upsertCitation(prisma, specSource.id, "VehicleDimensions", dimensions.id, "specifications", "Official specifications"),
    upsertCitation(prisma, specSource.id, "VehiclePerformance", performance.id, "specifications", "Official specifications"),
    upsertCitation(prisma, specSource.id, "VehiclePrice", price.id, "amountCents", "Base MSRP"),
    upsertCitation(
      prisma,
      trim.slug.includes("ix3")
        ? (sourceBySlug.get("bmw-2027-ix3-pricing-press-release")?.id ?? specSource.id)
        : specSource.id,
      "VehiclePrice",
      destination.id,
      "amountCents",
      "Destination and handling",
    ),
    upsertCitation(prisma, epaSource.id, "VehicleFuelEconomy", fuelEconomy.id, "combinedMpg", "EPA combined MPGe"),
    upsertCitation(
      prisma,
      epaSource.id,
      "VehicleFuelEconomy",
      fuelEconomy.id,
      "electricRangeMiles",
      "EPA electric range",
    ),
  ]);

  // Supplemental citations for fields pulled from secondary manufacturer / third-party sources
  if (trim.slug === "2025-bmw-i4-xdrive40-us") {
    const msrpSrc = sourceBySlug.get("bmw-usa-i4-xdrive40-msrp");
    if (msrpSrc) {
      await upsertCitation(prisma, msrpSrc.id, "VehiclePrice", price.id, "amountCents", "US MSRP / 0-60");
      await upsertCitation(
        prisma,
        msrpSrc.id,
        "VehiclePerformance",
        performance.id,
        "zeroToSixtySeconds",
        "BMW USA 0-60",
      );
    }
  }
  if (trim.slug === "2025-bmw-i5-xdrive40-us") {
    const curbSrc = sourceBySlug.get("bmw-i5-xdrive40-curb-edmunds");
    if (curbSrc) {
      await upsertCitation(prisma, curbSrc.id, "VehicleDimensions", dimensions.id, "curbWeightKg", "Curb weight");
    }
  }
  if (trim.slug === "2025-bmw-i7-edrive50-us" || trim.slug === "2025-bmw-i7-xdrive60-us") {
    const priceSrc = sourceBySlug.get("bmw-i7-2025-pricing-cars");
    if (priceSrc) {
      await upsertCitation(prisma, priceSrc.id, "VehiclePrice", price.id, "amountCents", "2025 US base MSRP");
    }
  }
  if (trim.slug === "2025-bmw-i7-edrive50-us") {
    const curbSrc = sourceBySlug.get("bmw-i7-edrive50-curb-edmunds");
    if (curbSrc) {
      await upsertCitation(prisma, curbSrc.id, "VehicleDimensions", dimensions.id, "curbWeightKg", "Curb weight");
    }
  }
  if (trim.slug === "2027-bmw-ix3-50-xdrive-us") {
    const priceSrc = sourceBySlug.get("bmw-2027-ix3-pricing-press-release");
    const curbSrc = sourceBySlug.get("bmw-usa-ix3-curb-weight");
    if (priceSrc) {
      await upsertCitation(prisma, priceSrc.id, "VehiclePrice", price.id, "amountCents", "Base MSRP");
    }
    if (curbSrc) {
      await upsertCitation(prisma, curbSrc.id, "VehicleDimensions", dimensions.id, "curbWeightKg", "Curb weight");
    }
  }

  await ensureAudit(prisma, importerId, vehicle.id, trim.slug);
  return trim.slug;
}

export async function seedBmwISeries(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const seeded: string[] = [];
  const skipped: string[] = [];

  const sourceBySlug = new Map<string, { id: string }>();
  for (const src of SPEC_SOURCES) {
    const row = await upsertSource(ctx.prisma, src);
    sourceBySlug.set(src.slug, { id: row.id });
  }

  // Also ensure the shared 2025 i4 press source exists for cross-refs
  const i4Shared = await upsertSource(ctx.prisma, {
    slug: "bmw-2025-i4-press-release",
    title: "The new 2025 BMW i4 and 4 Series Gran Coupe.",
    publisher: "BMW Group",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0441360EN_US/the-new-2025-bmw-i4-and-4-series-gran-coupe",
    type: "PRESS_RELEASE",
    publishedAt: new Date("2024-04-24T00:00:00.000Z"),
  });
  sourceBySlug.set("bmw-2025-i4-press-release", { id: i4Shared.id });

  for (const trim of TRIMS) {
    if (trim.skipReason) {
      skipped.push(`${trim.slug}: ${trim.skipReason}`);
      continue;
    }
    try {
      const slug = await seedOne(ctx, trim, sourceBySlug);
      seeded.push(slug);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      skipped.push(`${trim.slug}: ${message}`);
    }
  }

  return { seeded, skipped };
}
