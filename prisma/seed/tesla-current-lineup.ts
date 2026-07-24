/**
 * Tesla current US model-line seed module.
 *
 * Scope: one complete representative MY2026 trim for each current Tesla model
 * line with EPA fuel-economy data and a unique exterior image.
 */
import type { BodyStyle, Drivetrain } from "../../src/generated/prisma/client";
import {
  TESLA_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureTeslaEngine,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./tesla-shared";

const CUFT_TO_L = 28.316846592;

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

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
  torqueLbFt?: number;
  zeroToSixtySeconds: number;
  quarterMileSeconds?: number;
  topSpeedMph: number;
};

type FuelEco = {
  cityMpg: number;
  highwayMpg: number;
  combinedMpg: number;
  electricRangeMiles: number;
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
  engineConfiguration: string;
  engineElectrification: string;
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
  imageCredit?: string;
  msrpCents: number;
  dimensions: Dims;
  performance: Perf;
  fuelEconomy: FuelEco;
  epaId: string;
  epaTitle: string;
  specSourceSlug: string;
  dimensionSourceSlug?: string;
  grossWeightSourceSlug?: string;
  torqueSourceSlug?: string;
  quarterMileSourceSlug?: string;
  priceSourceSlug: string;
};

const IMG = {
  model3: "https://www.auto-data.net/images/f49/Tesla-Model-3-facelift-2023.jpg",
  model3Perf: "https://www.auto-data.net/images/f49/Tesla-Model-3-facelift-2023_1.jpg",
  modelY: "https://www.auto-data.net/images/f109/Tesla-Model-Y-facelift-2025.jpg",
  modelYPerf: "https://www.auto-data.net/images/f109/Tesla-Model-Y-facelift-2025_1.jpg",
  modelYStandardAwd:
    "https://static-assets.tesla.com/configurator/compositor?context=design_studio_2&options=$MTY13,$PPSW,$WY19B,$INPB0&view=STUD_3QTR&model=my&size=1920&bkba_opt=1",
  modelYLongRangeRwd:
    "https://static-assets.tesla.com/configurator/compositor?context=design_studio_2&options=$MTY13,$PBSB,$WY19B,$INPB0&view=STUD_3QTR&model=my&size=1920&bkba_opt=1",
  modelYLongRangeAwd:
    "https://static-assets.tesla.com/configurator/compositor?context=design_studio_2&options=$MTY13,$PPSB,$WY19B,$INPB0&view=STUD_3QTR&model=my&size=1920&bkba_opt=1",
  modelS: "https://www.auto-data.net/images/f46/Tesla-Model-S-facelift-2021.jpg",
  modelSPlaid: "https://www.auto-data.net/images/f46/Tesla-Model-S-facelift-2021_1.jpg",
  modelX: "https://www.auto-data.net/images/f88/Tesla-Model-X_2.jpg",
  modelXPlaid: "https://www.auto-data.net/images/f43/Tesla-Model-X.jpg",
  cybertruck: "https://www.auto-data.net/images/f44/Tesla-Cybertruck.jpg",
  cybertruckAwd: "https://www.auto-data.net/images/f44/Tesla-Cybertruck_1.jpg",
} as const;

const TRIMS: TrimDef[] = [
  {
    slug: "2026-tesla-model-3-standard-rwd-us",
    name: "Model 3 Standard RWD",
    year: 2026,
    modelSlug: "tesla-model-3",
    modelName: "Model 3",
    generationCode: "Highland",
    generationDisplay: "Highland facelift",
    generationStart: 2024,
    bodyStyle: "SEDAN",
    drivetrain: "RWD",
    engineSlug: "tesla-model-3-rwd-pmsm",
    engineName: "Rear permanent-magnet synchronous motor",
    engineCode: "MODEL3-RWD-PMSM",
    engineConfiguration: "Single electric motor",
    engineElectrification: "Rear permanent-magnet motor",
    imageUrl: IMG.model3,
    imagePageUrl:
      "https://www.auto-data.net/en/tesla-model-3-highland-facelift-2023-generation-9666",
    imageAlt: "2026 Tesla Model 3 exterior",
    msrpCents: 3699000,
    dimensions: {
      lengthIn: 185.8,
      widthIn: 72.8,
      heightIn: 56.7,
      wheelbaseIn: 113.2,
      frontTrackIn: 62.36,
      rearTrackIn: 62.4,
      groundClearanceIn: 5.43,
      curbWeightKg: 1760,
      grossVehicleWeightKg: 2192,
      cargoVolumeLiters: 594,
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 283,
      torqueLbFt: 310,
      zeroToSixtySeconds: 5.8,
      quarterMileSeconds: 13.7,
      topSpeedMph: 125,
    },
    fuelEconomy: {
      cityMpg: 147,
      highwayMpg: 130,
      combinedMpg: 139,
      electricRangeMiles: 321,
    },
    epaId: "50251",
    epaTitle: "2026 Tesla Model 3 Standard RWD fuel economy data",
    specSourceSlug: "autodata-2026-model-3-standard",
    dimensionSourceSlug: "tesla-owner-model-3-dimensions",
    quarterMileSourceSlug: "caranddriver-2026-model-3-test",
    priceSourceSlug: "edmunds-2026-model-3",
  },
  {
    slug: "2026-tesla-model-3-performance-us",
    name: "Model 3 Performance",
    year: 2026,
    modelSlug: "tesla-model-3",
    modelName: "Model 3",
    generationCode: "Highland",
    generationDisplay: "Highland facelift",
    generationStart: 2024,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    engineSlug: "tesla-model-3-performance-dual-motor",
    engineName: "Dual motor performance all-wheel drive",
    engineCode: "MODEL3-PERFORMANCE-DUAL",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "Front and rear electric motors",
    imageUrl: IMG.model3Perf,
    imagePageUrl:
      "https://www.auto-data.net/en/tesla-model-3-highland-facelift-2023-generation-9666",
    imageAlt: "2026 Tesla Model 3 Performance exterior",
    msrpCents: 5499000,
    dimensions: {
      lengthIn: 185.8,
      widthIn: 72.8,
      heightIn: 56.3,
      wheelbaseIn: 113.2,
      frontTrackIn: 62.3,
      rearTrackIn: 61.4,
      groundClearanceIn: 5.0,
      curbWeightKg: 1851,
      grossVehicleWeightKg: 2268,
      cargoVolumeLiters: 594,
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 510,
      torqueLbFt: 547,
      zeroToSixtySeconds: 2.9,
      quarterMileSeconds: 11.0,
      topSpeedMph: 163,
    },
    fuelEconomy: {
      cityMpg: 120,
      highwayMpg: 107,
      combinedMpg: 114,
      electricRangeMiles: 309,
    },
    epaId: "50036",
    epaTitle: "2026 Tesla Model 3 Performance fuel economy data",
    specSourceSlug: "autodata-2026-model-3-performance",
    dimensionSourceSlug: "tesla-owner-model-3-dimensions",
    quarterMileSourceSlug: "caranddriver-2026-model-3-test",
    priceSourceSlug: "edmunds-2026-model-3",
  },
  {
    slug: "2026-tesla-model-y-standard-rwd-us",
    name: "Model Y Standard RWD",
    year: 2026,
    modelSlug: "tesla-model-y",
    modelName: "Model Y",
    generationCode: "Juniper",
    generationDisplay: "Juniper facelift",
    generationStart: 2025,
    bodyStyle: "SUV",
    drivetrain: "RWD",
    engineSlug: "tesla-model-y-rwd-pmsm",
    engineName: "Rear permanent-magnet synchronous motor",
    engineCode: "MODELY-RWD-PMSM",
    engineConfiguration: "Single electric motor",
    engineElectrification: "Rear permanent-magnet motor",
    imageUrl: IMG.modelY,
    imagePageUrl:
      "https://www.auto-data.net/en/tesla-model-y-juniper-facelift-2025-generation-10390",
    imageAlt: "2026 Tesla Model Y exterior",
    msrpCents: 3999000,
    dimensions: {
      lengthIn: 188.7,
      widthIn: 75.6,
      heightIn: 63.8,
      wheelbaseIn: 113.8,
      frontTrackIn: 65.2,
      rearTrackIn: 65.2,
      groundClearanceIn: 6.4,
      curbWeightKg: 1842,
      grossVehicleWeightKg: 2456,
      cargoVolumeLiters: cuFtToLiters(76.2),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 299,
      torqueLbFt: 309,
      zeroToSixtySeconds: 6.8,
      quarterMileSeconds: 14.1,
      topSpeedMph: 125,
    },
    fuelEconomy: {
      cityMpg: 148,
      highwayMpg: 129,
      combinedMpg: 138,
      electricRangeMiles: 321,
    },
    epaId: "50040",
    epaTitle: "2026 Tesla Model Y Standard RWD (18in wheels) fuel economy data",
    specSourceSlug: "caranddriver-2026-model-y",
    dimensionSourceSlug: "tesla-owner-model-y-dimensions",
    grossWeightSourceSlug: "kengarff-2026-model-y-standard-rwd",
    torqueSourceSlug: "cars-2026-model-y",
    quarterMileSourceSlug: "caranddriver-2026-model-y-standard-test",
    priceSourceSlug: "tesla-2026-model-y",
  },
  {
    slug: "2026-tesla-model-y-standard-awd-us",
    name: "Model Y Standard AWD",
    year: 2026,
    modelSlug: "tesla-model-y",
    modelName: "Model Y",
    generationCode: "Juniper",
    generationDisplay: "Juniper facelift",
    generationStart: 2025,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "tesla-model-y-standard-dual-motor",
    engineName: "Dual motor standard all-wheel drive",
    engineCode: "MODELY-STANDARD-DUAL",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "Front and rear electric motors",
    imageUrl: IMG.modelYStandardAwd,
    imagePageUrl: IMG.modelYStandardAwd,
    imageAlt: "2026 Tesla Model Y Standard AWD exterior",
    imageCredit: "Tesla",
    msrpCents: 4199000,
    dimensions: {
      lengthIn: 188.7,
      widthIn: 75.6,
      heightIn: 63.8,
      wheelbaseIn: 113.8,
      frontTrackIn: 65.2,
      rearTrackIn: 65.2,
      groundClearanceIn: 6.4,
      curbWeightKg: 1926,
      grossVehicleWeightKg: 2591,
      cargoVolumeLiters: cuFtToLiters(76.2),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 425,
      torqueLbFt: 309,
      zeroToSixtySeconds: 5.0,
      quarterMileSeconds: 12.6,
      topSpeedMph: 125,
    },
    fuelEconomy: {
      cityMpg: 133,
      highwayMpg: 120,
      combinedMpg: 127,
      electricRangeMiles: 294,
    },
    epaId: "50304",
    epaTitle: "2026 Tesla Model Y Standard AWD fuel economy data",
    specSourceSlug: "cars-2026-model-y",
    dimensionSourceSlug: "tesla-owner-model-y-dimensions",
    grossWeightSourceSlug: "autosofdallas-2026-model-y-standard-awd",
    torqueSourceSlug: "cars-2026-model-y",
    quarterMileSourceSlug: "caranddriver-2026-model-y-standard-test",
    priceSourceSlug: "cars-2026-model-y",
  },
  {
    slug: "2026-tesla-model-y-long-range-rwd-us",
    name: "Model Y Long Range RWD",
    year: 2026,
    modelSlug: "tesla-model-y",
    modelName: "Model Y",
    generationCode: "Juniper",
    generationDisplay: "Juniper facelift",
    generationStart: 2025,
    bodyStyle: "SUV",
    drivetrain: "RWD",
    engineSlug: "tesla-model-y-long-range-rwd-pmsm",
    engineName: "Rear permanent-magnet synchronous motor",
    engineCode: "MODELY-LR-RWD-PMSM",
    engineConfiguration: "Single electric motor",
    engineElectrification: "Rear permanent-magnet motor",
    imageUrl: IMG.modelYLongRangeRwd,
    imagePageUrl: IMG.modelYLongRangeRwd,
    imageAlt: "2026 Tesla Model Y Long Range RWD exterior",
    imageCredit: "Tesla",
    msrpCents: 4499000,
    dimensions: {
      lengthIn: 188.6,
      widthIn: 75.6,
      heightIn: 64.0,
      wheelbaseIn: 113.8,
      frontTrackIn: 64.4,
      rearTrackIn: 64.4,
      groundClearanceIn: 6.6,
      curbWeightKg: 1898,
      grossVehicleWeightKg: 2432,
      cargoVolumeLiters: cuFtToLiters(76.2),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 326,
      torqueLbFt: 325,
      zeroToSixtySeconds: 4.8,
      quarterMileSeconds: 13.4,
      topSpeedMph: 125,
    },
    fuelEconomy: {
      cityMpg: 144,
      highwayMpg: 123,
      combinedMpg: 134,
      electricRangeMiles: 357,
    },
    epaId: "49743",
    epaTitle: "2026 Tesla Model Y Long Range RWD fuel economy data",
    specSourceSlug: "caranddriver-2026-model-y",
    dimensionSourceSlug: "tesla-owner-model-y-dimensions",
    quarterMileSourceSlug: "motortrend-2026-model-y-long-range-rwd-test",
    priceSourceSlug: "tesla-2026-model-y",
  },
  {
    slug: "2026-tesla-model-y-long-range-awd-us",
    name: "Model Y Long Range AWD",
    year: 2026,
    modelSlug: "tesla-model-y",
    modelName: "Model Y",
    generationCode: "Juniper",
    generationDisplay: "Juniper facelift",
    generationStart: 2025,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "tesla-model-y-long-range-dual-motor",
    engineName: "Dual motor long range all-wheel drive",
    engineCode: "MODELY-LR-DUAL",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "Front and rear electric motors",
    imageUrl: IMG.modelYLongRangeAwd,
    imagePageUrl: IMG.modelYLongRangeAwd,
    imageAlt: "2026 Tesla Model Y Long Range AWD exterior",
    imageCredit: "Tesla",
    msrpCents: 4899000,
    dimensions: {
      lengthIn: 188.6,
      widthIn: 75.6,
      heightIn: 63.9,
      wheelbaseIn: 113.8,
      frontTrackIn: 64.4,
      rearTrackIn: 64.4,
      groundClearanceIn: 6.6,
      curbWeightKg: 1994,
      grossVehicleWeightKg: 2503,
      cargoVolumeLiters: cuFtToLiters(75.5),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 425,
      torqueLbFt: 475,
      zeroToSixtySeconds: 4.6,
      quarterMileSeconds: 12.3,
      topSpeedMph: 125,
    },
    fuelEconomy: {
      cityMpg: 130,
      highwayMpg: 115,
      combinedMpg: 123,
      electricRangeMiles: 327,
    },
    epaId: "49744",
    epaTitle: "2026 Tesla Model Y Long Range AWD fuel economy data",
    specSourceSlug: "edmunds-2026-model-y-long-range-awd",
    dimensionSourceSlug: "tesla-owner-model-y-dimensions",
    quarterMileSourceSlug: "caranddriver-2026-model-y-long-range-awd-test",
    priceSourceSlug: "tesla-2026-model-y",
  },
  {
    slug: "2026-tesla-model-y-performance-awd-us",
    name: "Model Y Performance AWD",
    year: 2026,
    modelSlug: "tesla-model-y",
    modelName: "Model Y",
    generationCode: "Juniper",
    generationDisplay: "Juniper facelift",
    generationStart: 2025,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "tesla-model-y-performance-dual-motor",
    engineName: "Dual motor performance all-wheel drive",
    engineCode: "MODELY-PERFORMANCE-DUAL",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "Front and rear electric motors",
    imageUrl: IMG.modelYPerf,
    imagePageUrl:
      "https://www.auto-data.net/en/tesla-model-y-juniper-facelift-2025-generation-10390",
    imageAlt: "2026 Tesla Model Y Performance exterior",
    msrpCents: 5749000,
    dimensions: {
      lengthIn: 188.8,
      widthIn: 75.6,
      heightIn: 63.4,
      wheelbaseIn: 113.8,
      frontTrackIn: 64.4,
      rearTrackIn: 63.9,
      groundClearanceIn: 6.0,
      curbWeightKg: 2026,
      grossVehicleWeightKg: 2532,
      cargoVolumeLiters: cuFtToLiters(76.2),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 510,
      torqueLbFt: 513,
      zeroToSixtySeconds: 3.3,
      quarterMileSeconds: 11.5,
      topSpeedMph: 155,
    },
    fuelEconomy: {
      cityMpg: 111,
      highwayMpg: 100,
      combinedMpg: 105,
      electricRangeMiles: 306,
    },
    epaId: "50253",
    epaTitle: "2026 Tesla Model Y Performance AWD fuel economy data",
    specSourceSlug: "tesla-2026-model-y",
    dimensionSourceSlug: "tesla-owner-model-y-dimensions",
    grossWeightSourceSlug: "trustauto-2026-model-y-performance-awd",
    quarterMileSourceSlug: "caranddriver-2026-model-y-performance-test",
    priceSourceSlug: "tesla-2026-model-y",
  },
  {
    slug: "2026-tesla-model-s-awd-us",
    name: "Model S AWD",
    year: 2026,
    modelSlug: "tesla-model-s",
    modelName: "Model S",
    generationCode: "Palladium",
    generationDisplay: "Palladium facelift",
    generationStart: 2021,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    engineSlug: "tesla-model-s-dual-motor",
    engineName: "Dual motor all-wheel drive",
    engineCode: "MODELS-DUAL-MOTOR",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "Front and rear electric motors",
    imageUrl: IMG.modelS,
    imagePageUrl:
      "https://www.auto-data.net/en/tesla-model-s-facelift-2021-generation-8165",
    imageAlt: "2026 Tesla Model S exterior",
    msrpCents: 9499000,
    dimensions: {
      lengthIn: 197.7,
      widthIn: 78.2,
      heightIn: 56.3,
      wheelbaseIn: 116.5,
      frontTrackIn: 66.5,
      rearTrackIn: 66.5,
      groundClearanceIn: 4.6,
      curbWeightKg: 2069,
      grossVehicleWeightKg: 2473,
      cargoVolumeLiters: 798,
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 670,
      torqueLbFt: 723,
      zeroToSixtySeconds: 3.1,
      quarterMileSeconds: 10.8,
      topSpeedMph: 149,
    },
    fuelEconomy: {
      cityMpg: 132,
      highwayMpg: 116,
      combinedMpg: 124,
      electricRangeMiles: 410,
    },
    epaId: "49741",
    epaTitle: "2026 Tesla Model S fuel economy data",
    specSourceSlug: "caranddriver-2026-model-s-specs",
    dimensionSourceSlug: "tesla-owner-model-s-dimensions",
    grossWeightSourceSlug: "carweek-2026-model-s-awd",
    torqueSourceSlug: "carweek-2026-model-s-awd",
    quarterMileSourceSlug: "motormatchup-2026-model-s-awd",
    priceSourceSlug: "edmunds-2026-model-s",
  },
  {
    slug: "2026-tesla-model-s-plaid-us",
    name: "Model S Plaid",
    year: 2026,
    modelSlug: "tesla-model-s",
    modelName: "Model S",
    generationCode: "Palladium",
    generationDisplay: "Palladium facelift",
    generationStart: 2021,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    engineSlug: "tesla-model-s-plaid-tri-motor",
    engineName: "Tri motor Plaid all-wheel drive",
    engineCode: "MODELS-PLAID-TRI",
    engineConfiguration: "Tri electric motors",
    engineElectrification: "One front and two rear electric motors",
    imageUrl: IMG.modelSPlaid,
    imagePageUrl:
      "https://www.auto-data.net/en/tesla-model-s-facelift-2021-generation-8165",
    imageAlt: "2026 Tesla Model S Plaid exterior",
    msrpCents: 10999000,
    dimensions: {
      lengthIn: 198.7,
      widthIn: 78.2,
      heightIn: 56.3,
      wheelbaseIn: 116.5,
      frontTrackIn: 66.5,
      rearTrackIn: 66.5,
      groundClearanceIn: 4.3,
      curbWeightKg: 2178,
      grossVehicleWeightKg: 2566,
      cargoVolumeLiters: 798,
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 1020,
      torqueLbFt: 1050,
      zeroToSixtySeconds: 1.99,
      quarterMileSeconds: 9.23,
      topSpeedMph: 200,
    },
    fuelEconomy: {
      cityMpg: 114,
      highwayMpg: 105,
      combinedMpg: 110,
      electricRangeMiles: 368,
    },
    epaId: "49742",
    epaTitle: "2026 Tesla Model S Plaid fuel economy data",
    specSourceSlug: "tesla-2026-model-s",
    dimensionSourceSlug: "tesla-owner-model-s-dimensions",
    grossWeightSourceSlug: "premiumautos-2026-model-s-plaid",
    priceSourceSlug: "edmunds-2026-model-s",
  },
  {
    slug: "2026-tesla-model-x-awd-us",
    name: "Model X AWD",
    year: 2026,
    modelSlug: "tesla-model-x",
    modelName: "Model X",
    generationCode: "Palladium",
    generationDisplay: "Palladium facelift",
    generationStart: 2021,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "tesla-model-x-dual-motor",
    engineName: "Dual motor all-wheel drive",
    engineCode: "MODELX-DUAL-MOTOR",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "Front and rear electric motors",
    imageUrl: IMG.modelX,
    imagePageUrl: "https://www.auto-data.net/en/tesla-model-x-generation-4104",
    imageAlt: "2026 Tesla Model X exterior",
    msrpCents: 9999000,
    dimensions: {
      lengthIn: 199.1,
      widthIn: 78.7,
      heightIn: 66.1,
      wheelbaseIn: 116.7,
      frontTrackIn: 67.1,
      rearTrackIn: 67.3,
      groundClearanceIn: 5.7,
      curbWeightKg: 2373,
      grossVehicleWeightKg: 2960,
      cargoVolumeLiters: 1233,
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 670,
      torqueLbFt: 644,
      zeroToSixtySeconds: 3.8,
      quarterMileSeconds: 11.5,
      topSpeedMph: 149,
    },
    fuelEconomy: {
      cityMpg: 110,
      highwayMpg: 99,
      combinedMpg: 105,
      electricRangeMiles: 352,
    },
    epaId: "49745",
    epaTitle: "2026 Tesla Model X fuel economy data",
    specSourceSlug: "edmunds-2026-model-x-specs",
    dimensionSourceSlug: "tesla-owner-model-x-dimensions",
    torqueSourceSlug: "caranddriver-2026-model-x-test",
    quarterMileSourceSlug: "caranddriver-2026-model-x-test",
    priceSourceSlug: "edmunds-2026-model-x",
  },
  {
    slug: "2026-tesla-model-x-plaid-us",
    name: "Model X Plaid",
    year: 2026,
    modelSlug: "tesla-model-x",
    modelName: "Model X",
    generationCode: "Palladium",
    generationDisplay: "Palladium facelift",
    generationStart: 2021,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    engineSlug: "tesla-model-x-plaid-tri-motor",
    engineName: "Tri motor Plaid all-wheel drive",
    engineCode: "MODELX-PLAID-TRI",
    engineConfiguration: "Tri electric motors",
    engineElectrification: "One front and two rear electric motors",
    imageUrl: IMG.modelXPlaid,
    imagePageUrl: "https://www.auto-data.net/en/tesla-model-x-generation-4104",
    imageAlt: "2026 Tesla Model X Plaid exterior",
    msrpCents: 11499000,
    dimensions: {
      lengthIn: 199.1,
      widthIn: 78.7,
      heightIn: 66.1,
      wheelbaseIn: 116.7,
      frontTrackIn: 67.1,
      rearTrackIn: 67.3,
      groundClearanceIn: 5.7,
      curbWeightKg: 2468,
      grossVehicleWeightKg: 3050,
      cargoVolumeLiters: 608,
      seatingCapacity: 6,
    },
    performance: {
      powerHp: 1020,
      torqueLbFt: 1050,
      zeroToSixtySeconds: 2.5,
      quarterMileSeconds: 9.9,
      topSpeedMph: 163,
    },
    fuelEconomy: {
      cityMpg: 105,
      highwayMpg: 94,
      combinedMpg: 100,
      electricRangeMiles: 335,
    },
    epaId: "49746",
    epaTitle: "2026 Tesla Model X Plaid fuel economy data",
    specSourceSlug: "kbb-2026-model-x",
    dimensionSourceSlug: "tesla-owner-model-x-dimensions",
    priceSourceSlug: "edmunds-2026-model-x",
  },
  {
    slug: "2026-tesla-cybertruck-dual-motor-awd-us",
    name: "Cybertruck Dual Motor AWD",
    year: 2026,
    modelSlug: "tesla-cybertruck",
    modelName: "Cybertruck",
    generationCode: "Cybertruck",
    generationDisplay: "First generation",
    generationStart: 2024,
    bodyStyle: "TRUCK",
    drivetrain: "AWD",
    engineSlug: "tesla-cybertruck-dual-motor",
    engineName: "Dual motor all-wheel drive",
    engineCode: "CYBERTRUCK-DUAL-MOTOR",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "Front and rear electric motors",
    imageUrl: IMG.cybertruck,
    imagePageUrl: "https://www.auto-data.net/en/tesla-cybertruck-generation-8588",
    imageAlt: "2026 Tesla Cybertruck exterior",
    msrpCents: 6999000,
    dimensions: {
      lengthIn: 223.7,
      widthIn: 80.0,
      heightIn: 68.5,
      wheelbaseIn: 143.1,
      frontTrackIn: 69.76,
      rearTrackIn: 69.76,
      groundClearanceIn: 16.0,
      curbWeightKg: 3009,
      grossVehicleWeightKg: 4007,
      cargoVolumeLiters: 1885,
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 600,
      torqueLbFt: 521,
      zeroToSixtySeconds: 4.1,
      quarterMileSeconds: 12.4,
      topSpeedMph: 112,
    },
    fuelEconomy: {
      cityMpg: 87,
      highwayMpg: 70,
      combinedMpg: 78,
      electricRangeMiles: 325,
    },
    epaId: "50460",
    epaTitle: "2026 Tesla Cybertruck Dual Motor AWD fuel economy data",
    specSourceSlug: "autodata-cybertruck",
    dimensionSourceSlug: "tesla-owner-cybertruck-dimensions",
    torqueSourceSlug: "carsdirect-2026-cybertruck",
    quarterMileSourceSlug: "motortrend-2024-cybertruck-dual-motor-test",
    priceSourceSlug: "edmunds-2026-cybertruck",
  },
  {
    slug: "2026-tesla-cybertruck-awd-us",
    name: "Cybertruck AWD",
    year: 2026,
    modelSlug: "tesla-cybertruck",
    modelName: "Cybertruck",
    generationCode: "Cybertruck",
    generationDisplay: "First generation",
    generationStart: 2024,
    bodyStyle: "TRUCK",
    drivetrain: "AWD",
    engineSlug: "tesla-cybertruck-premium-dual-motor",
    engineName: "Dual motor premium all-wheel drive",
    engineCode: "CYBERTRUCK-PREMIUM-DUAL",
    engineConfiguration: "Dual electric motors",
    engineElectrification: "Front and rear electric motors",
    imageUrl: IMG.cybertruckAwd,
    imagePageUrl: "https://www.auto-data.net/en/tesla-cybertruck-generation-8588",
    imageAlt: "2026 Tesla Cybertruck AWD exterior",
    msrpCents: 7999000,
    dimensions: {
      lengthIn: 223.7,
      widthIn: 80.0,
      heightIn: 68.5,
      wheelbaseIn: 143.1,
      frontTrackIn: 69.76,
      rearTrackIn: 69.76,
      groundClearanceIn: 16.0,
      curbWeightKg: 3009,
      grossVehicleWeightKg: 4007,
      cargoVolumeLiters: 1885,
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 600,
      torqueLbFt: 521,
      zeroToSixtySeconds: 4.1,
      quarterMileSeconds: 12.4,
      topSpeedMph: 112,
    },
    fuelEconomy: {
      cityMpg: 85,
      highwayMpg: 72,
      combinedMpg: 79,
      electricRangeMiles: 325,
    },
    epaId: "50039",
    epaTitle: "2026 Tesla Cybertruck AWD fuel economy data",
    specSourceSlug: "edmunds-2026-cybertruck-awd",
    dimensionSourceSlug: "tesla-owner-cybertruck-dimensions",
    quarterMileSourceSlug: "motortrend-2024-cybertruck-dual-motor-test",
    priceSourceSlug: "edmunds-2026-cybertruck",
  },
];

const SPEC_SOURCES = [
  {
    slug: "autodata-2026-model-3-standard",
    title: "Tesla Model 3 Standard 62.5 kWh technical specifications",
    publisher: "auto-data.net",
    url: "https://www.auto-data.net/en/tesla-model-3-highland-facelift-2023-standard-62.5-kwh-283hp-56052",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "autodata-2026-model-3-performance",
    title: "Tesla Model 3 Performance 82 kWh Dual Motor AWD technical specifications",
    publisher: "auto-data.net",
    url: "https://www.auto-data.net/en/tesla-model-3-highland-facelift-2023-performance-82-kwh-510hp-dual-motor-awd-51628",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "tesla-owner-model-3-dimensions",
    title: "Model 3 Owner's Manual — Dimensions and Weights",
    publisher: "Tesla",
    url: "https://www.tesla.com/ownersmanual/model3/en_cn/GUID-56562137-FC31-4110-A13C-9A9FC6657BF0.html",
    type: "OWNER_MANUAL" as const,
  },
  {
    slug: "tesla-2026-model-3",
    title: "Model 3 — Tesla pricing and specifications",
    publisher: "Tesla",
    url: "https://www.tesla.com/model3",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "edmunds-2026-model-3",
    title: "2026 Tesla Model 3 — Edmunds pricing and specifications",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/tesla/model-3/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2026-model-3-standard",
    title: "2026 Tesla Model 3 Standard — Edmunds specs",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/tesla/model-3/2026/standard/st-402057159/features-specs/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "caranddriver-2026-model-3-test",
    title: "2026 Tesla Model 3 — Car and Driver instrumented test results",
    publisher: "Car and Driver",
    url: "https://www.caranddriver.com/tesla/model-3",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "tesla-2026-model-y",
    title: "Model Y — Tesla pricing and specifications",
    publisher: "Tesla",
    url: "https://www.tesla.com/modely",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "tesla-owner-model-y-dimensions",
    title: "Model Y Owner's Manual — Dimensions",
    publisher: "Tesla",
    url: "https://www.tesla.com/ownersmanual/modely/en_us/GUID-1E76B638-7B12-4D9A-8767-94B7F1E92A0E.html",
    type: "OWNER_MANUAL" as const,
  },
  {
    slug: "caranddriver-2026-model-y",
    title: "2026 Tesla Model Y — Car and Driver review, pricing, and specs",
    publisher: "Car and Driver",
    url: "https://www.caranddriver.com/tesla/model-y",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "caranddriver-2026-model-y-standard-test",
    title: "Tested: Entry-Level 2026 Tesla Model Y Takes a Little off the Top",
    publisher: "Car and Driver",
    url: "https://www.caranddriver.com/reviews/a68851083/2026-tesla-model-y-standard-drive/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "motortrend-2026-model-y-long-range-rwd-test",
    title: "Tested: The Tesla Model Y Premium RWD Is a Better Computer Than It Is a Car",
    publisher: "MotorTrend",
    url: "https://www.motortrend.com/reviews/2025-tesla-model-y-first-test-review",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "caranddriver-2026-model-y-long-range-awd-test",
    title: "Test: 2026 Tesla Model Y Long Range AWD Makes Appreciable Gains",
    publisher: "Car and Driver",
    url: "https://www.caranddriver.com/reviews/a65562450/2026-tesla-model-y-long-range-awd-test/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "caranddriver-2026-model-y-performance-test",
    title: "Tested: 2026 Tesla Model Y Performance Takes the Edge Off",
    publisher: "Car and Driver",
    url: "https://www.caranddriver.com/reviews/a69496119/2026-tesla-model-y-performance-drive/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "cars-2026-model-y",
    title: "2026 Tesla Model Y specs and prices",
    publisher: "Cars.com",
    url: "https://www.cars.com/research/tesla-model_y-2026/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "kengarff-2026-model-y-standard-rwd",
    title: "Pre-Owned 2026 Tesla Model Y Standard RWD specifications",
    publisher: "Ken Garff",
    url: "https://www.kengarff.com/inventory/used-2026-tesla-model-y-standard-rwd-sport-utility-7saygded3ta599760/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "autosofdallas-2026-model-y-standard-awd",
    title: "2026 Tesla Model Y Standard AWD specifications",
    publisher: "Autos of Dallas",
    url: "https://www.autosofdallas.com/inventory/used-2026-tesla-model-y-7saygdee1ta413545-in-irving-plano-tx",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "trustauto-2026-model-y-performance-awd",
    title: "Used 2026 Tesla Model Y Performance AWD specifications",
    publisher: "Trust Auto",
    url: "https://www.trustauto.com/used-cars/2026-tesla-model-y-performance-awd-electric-luxury-suv-7SAYGDET5TA604108",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2026-model-y-long-range-awd",
    title: "2026 Tesla Model Y Long Range AWD specs",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/tesla/model-y/2026/st-402069383/features-specs/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "tesla-2026-model-s",
    title: "Model S — Tesla specifications",
    publisher: "Tesla",
    url: "https://www.tesla.com/models",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "tesla-owner-model-s-dimensions",
    title: "Model S Owner's Manual — Dimensions",
    publisher: "Tesla",
    url: "https://www.tesla.com/ownersmanual/models/en_us/GUID-91E5877F-3CD2-4B3B-B2B8-B5DB4A6C0A05.html",
    type: "OWNER_MANUAL" as const,
  },
  {
    slug: "edmunds-2026-model-s",
    title: "2026 Tesla Model S — Edmunds pricing and specifications",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/tesla/model-s/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "caranddriver-2026-model-s-specs",
    title: "2026 Tesla Model S — Car and Driver specifications",
    publisher: "Car and Driver",
    url: "https://www.caranddriver.com/tesla/model-s/specs",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "carweek-2026-model-s-awd",
    title: "2026 Tesla Model S AWD specifications",
    publisher: "Carweek",
    url: "https://www.carweek.com/research/tesla/model-s/2026/specs",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "motormatchup-2026-model-s-awd",
    title: "2026 Tesla Model S AWD performance simulation",
    publisher: "MotorMatchup",
    url: "https://www.motormatchup.com/catalog/Tesla/Model-S/2026/AWD",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "premiumautos-2026-model-s-plaid",
    title: "Used 2026 Tesla Model S Plaid specifications",
    publisher: "Premium Autos",
    url: "https://www.premiumautosinc.com/inventory/used-2026-tesla-model-s-plaid-5yjsa1e64tf555841-in-norco-el-monte-ca",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "kbb-2026-model-x",
    title: "2026 Tesla Model X — Kelley Blue Book specifications",
    publisher: "Kelley Blue Book",
    url: "https://www.kbb.com/tesla/model-x/2026/specs/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2026-model-x",
    title: "2026 Tesla Model X — Edmunds pricing and specifications",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/tesla/model-x/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2026-model-x-specs",
    title: "2026 Tesla Model X — Edmunds detailed specs",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/tesla/model-x/2026/features-specs/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "caranddriver-2026-model-x-test",
    title: "2026 Tesla Model X — Car and Driver instrumented test results",
    publisher: "Car and Driver",
    url: "https://www.caranddriver.com/tesla/model-x",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "tesla-owner-model-x-dimensions",
    title: "Model X Owner's Manual — Dimensions",
    publisher: "Tesla",
    url: "https://www.tesla.com/ownersmanual/modelx/en_mo/GUID-91E5877F-3CD2-4B3B-B2B8-B5DB4A6C0A05.html",
    type: "OWNER_MANUAL" as const,
  },
  {
    slug: "edmunds-2026-cybertruck-awd",
    title: "2026 Tesla Cybertruck AWD — Edmunds specs",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/tesla/cybertruck/2026/st-402099518/features-specs/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "carsdirect-2026-cybertruck",
    title: "2026 Chevrolet Suburban vs 2026 Tesla Cybertruck comparison specs",
    publisher: "CarsDirect",
    url: "https://www.carsdirect.com/compare/compare-tool/chevrolet/suburban/tesla/cybertruck",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "motortrend-2024-cybertruck-dual-motor-test",
    title: "2024 Tesla Cybertruck Dual Motor 0-60 mph and quarter-mile test",
    publisher: "MotorTrend",
    url: "https://www.motortrend.com/reviews/2024-tesla-cybertruck-dual-motor-0-60-mph-tested",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2026-cybertruck",
    title: "2026 Tesla Cybertruck — Edmunds pricing and specifications",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/tesla/cybertruck/",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "autodata-cybertruck",
    title: "Tesla Cybertruck technical specifications",
    publisher: "auto-data.net",
    url: "https://www.auto-data.net/en/tesla-cybertruck-generation-8588",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "tesla-owner-cybertruck-dimensions",
    title: "Cybertruck Owner's Manual — Dimensions",
    publisher: "Tesla",
    url: "https://www.tesla.com/ownersmanual/cybertruck/en_us/GUID-12A976DD-EB60-431B-AFF1-5A37E95006DB.html",
    type: "OWNER_MANUAL" as const,
  },
];

const STATIC_SKIPPED = [
  "Model 3 Premium RWD/AWD: EPA records exist, but Standard RWD and Performance cover the current base + halo trims in this pass.",
  "Model Y 19-inch wheel package duplicates: EPA lists separate wheel/range entries; Standard RWD, Standard AWD, Long Range RWD, Long Range AWD, and Performance AWD are seeded as trim-level records.",
  "Model S Plaid 21-inch wheels: separate EPA wheel package (id 50252); standard Plaid package seeded as the production halo trim.",
  "Model X optional wheel/seating packages: base AWD and Plaid seeded; package-only range variants are not separate catalogue trims here.",
  "Cybertruck Long Range RWD and Cyberbeast: RWD is a wheel/package-specific EPA entry; Cyberbeast lacks a matching 2026 fueleconomy.gov model-menu label in this pass.",
  "Roadster and Cybercab: not current US production catalogue trims with complete EPA/pricing records.",
];

async function seedOne(
  ctx: SeedCtx,
  trim: TrimDef,
  sourceBySlug: Map<string, { id: string }>,
) {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;

  await assertImageUrlOk(trim.imageUrl);
  const imageSource = await ensureImageSource(prisma, {
    slug: `img-${trim.slug}`,
    title: trim.imageAlt,
    pageUrl: trim.imagePageUrl,
    publisher: trim.imageCredit ?? "auto-data.net",
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

  const engine = await ensureTeslaEngine(prisma, {
    manufacturerId,
    slug: trim.engineSlug,
    name: trim.engineName,
    code: trim.engineCode,
    fuelType: "ELECTRIC",
    configuration: trim.engineConfiguration,
    electrification: trim.engineElectrification,
  });

  const transmission = await prisma.transmission.upsert({
    where: { slug: "tesla-single-speed-automatic" },
    create: {
      slug: "tesla-single-speed-automatic",
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
      description: `${trim.year} Tesla ${trim.name} (US).`,
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
      description: `${trim.year} Tesla ${trim.name} (US).`,
      status: "PUBLISHED",
      publishedAt: pricingDate,
    },
  });

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
          amountCents: TESLA_DESTINATION_CENTS,
          currency: "USD",
          effectiveAt: pricingDate,
        },
        update: {
          amountCents: TESLA_DESTINATION_CENTS,
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
      credit: trim.imageCredit ?? "auto-data.net",
      position: 0,
    },
    update: {
      sourceId: imageSource.id,
      url: trim.imageUrl,
      alt: trim.imageAlt,
      credit: trim.imageCredit ?? "auto-data.net",
    },
  });

  const epaSource = await upsertCatalogueSource(prisma, {
    slug: `epa-${trim.slug.replace(/-us$/, "")}`,
    title: trim.epaTitle,
    publisher: "U.S. Department of Energy and U.S. Environmental Protection Agency",
    url: `https://www.fueleconomy.gov/ws/rest/vehicle/${trim.epaId}`,
    type: "GOVERNMENT",
  });

  const specSource = sourceBySlug.get(trim.specSourceSlug);
  if (!specSource) throw new Error(`Missing spec source ${trim.specSourceSlug}`);
  const dimensionSource = sourceBySlug.get(
    trim.dimensionSourceSlug ?? trim.specSourceSlug,
  );
  if (!dimensionSource) {
    throw new Error(
      `Missing dimension source ${trim.dimensionSourceSlug ?? trim.specSourceSlug}`,
    );
  }
  const priceSource = sourceBySlug.get(trim.priceSourceSlug);
  if (!priceSource) throw new Error(`Missing price source ${trim.priceSourceSlug}`);
  const quarterMileSource = trim.quarterMileSourceSlug
    ? sourceBySlug.get(trim.quarterMileSourceSlug)
    : null;
  if (trim.quarterMileSourceSlug && !quarterMileSource) {
    throw new Error(`Missing quarter-mile source ${trim.quarterMileSourceSlug}`);
  }
  const grossWeightSource = trim.grossWeightSourceSlug
    ? sourceBySlug.get(trim.grossWeightSourceSlug)
    : null;
  if (trim.grossWeightSourceSlug && !grossWeightSource) {
    throw new Error(`Missing gross-weight source ${trim.grossWeightSourceSlug}`);
  }
  const torqueSource = trim.torqueSourceSlug
    ? sourceBySlug.get(trim.torqueSourceSlug)
    : null;
  if (trim.torqueSourceSlug && !torqueSource) {
    throw new Error(`Missing torque source ${trim.torqueSourceSlug}`);
  }

  const citations = [
    upsertCitation(
      prisma,
      dimensionSource.id,
      "VehicleDimensions",
      dimensions.id,
      "specifications",
      "Exterior dimensions / cargo / seating",
    ),
    upsertCitation(
      prisma,
      specSource.id,
      "VehiclePerformance",
      performance.id,
      "specifications",
      "Power / 0-60 / top speed",
    ),
    upsertCitation(
      prisma,
      priceSource.id,
      "VehiclePrice",
      price.id,
      "amountCents",
      "Base MSRP excluding destination/order fees",
    ),
    upsertCitation(
      prisma,
      priceSource.id,
      "VehiclePrice",
      destination.id,
      "amountCents",
      `Destination fee $${(TESLA_DESTINATION_CENTS / 100).toFixed(0)}`,
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
      epaSource.id,
      "VehicleFuelEconomy",
      fuelEconomy.id,
      "electricRangeMiles",
      "EPA electric range",
    ),
    upsertCitation(
      prisma,
      imageSource.id,
      "VehicleImage",
      image.id,
      "url",
      `${trim.imageCredit ?? "auto-data.net"} exterior asset`,
    ),
  ];

  if (quarterMileSource && trim.performance.quarterMileSeconds != null) {
    citations.push(
      upsertCitation(
        prisma,
        quarterMileSource.id,
        "VehiclePerformance",
        performance.id,
        "quarterMileSeconds",
        "Instrumented quarter-mile test",
      ),
    );
  }

  if (grossWeightSource && trim.dimensions.grossVehicleWeightKg != null) {
    citations.push(
      upsertCitation(
        prisma,
        grossWeightSource.id,
        "VehicleDimensions",
        dimensions.id,
        "grossVehicleWeightKg",
        "Gross vehicle weight rating",
      ),
    );
  }

  if (torqueSource && trim.performance.torqueLbFt != null) {
    citations.push(
      upsertCitation(
        prisma,
        torqueSource.id,
        "VehiclePerformance",
        performance.id,
        "torqueLbFt",
        "Combined torque",
      ),
    );
  }

  await Promise.all(citations);

  await ensureAudit(prisma, importerId, vehicle.id, trim.slug);
  return trim.slug;
}

export async function seedTeslaCurrentLineup(
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
