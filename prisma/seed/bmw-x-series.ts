/**
 * BMW X Series US MY 2025 seed module (X1/X2/X3/X5/X6/X7/XM; ALPINA XB7).
 * Idempotent — safe to re-run.
 *
 * EPA IDs: 48077, 48078 (X3), 47743 (X5), 48261, 48262, 48263, 48264,
 *          47742, 49009, 47744, 47745, 47746, 47747, 47748, 47807,
 *          47749, 47750, 49010
 */
import {
  DESTINATION_CENTS,
  assertImageOk,
  ensureAudit,
  ensureImageSource,
  mediapoolUrl,
  upsertCitation,
  type SeedCtx,
} from "./bmw-shared";

const LBS_TO_KG = 0.45359237;
const CUFT_TO_L = 28.316846592;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

type FuelEconomySeed = {
  cityMpg: number;
  highwayMpg: number;
  combinedMpg: number;
  electricRangeMiles?: number;
};

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: string;
  modelName: string;
  generationCode: string;
  generationLabel: string;
  generationStartYear: number;
  drivetrain: "RWD" | "AWD";
  dokNo: string;
  imageAlt: string;
  epaId: string;
  engine: {
    slug: string;
    name: string;
    code: string;
    fuelType: "PETROL" | "PLUG_IN_HYBRID";
    displacementCc: number;
    cylinderCount: number;
    configuration: "Inline" | "V";
    induction: string;
    electrification: string | null;
  };
  transmissionSlug:
    | "bmw-7-speed-dct-steptronic"
    | "bmw-8-speed-steptronic"
    | "bmw-8-speed-m-steptronic-drivelogic"
    | "bmw-8-speed-alpina-switch-tronic";
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
  fuelEconomy: FuelEconomySeed;
  baseMsrpCents: number;
  pressSourceSlug: string;
  priceSourceSlug: string;
};

const PRESS_SOURCES = [
  {
    slug: "bmw-2025-x3-press-release",
    title: "The All-New 2025 BMW X3.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0443207EN_US/the-all-new-2025-bmw-x3",
  },
  {
    slug: "bmw-2023-x1-press-release",
    title: "The all-new 2023 BMW X1.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0394853EN_US/the-all-new-2023-bmw-x1",
  },
  {
    slug: "bmw-2024-x1-m35i-press-release",
    title: "The BMW X1 M35i xDrive.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0422247EN_US/the-bmw-x1-m35i-xdrive",
  },
  {
    slug: "bmw-2024-x2-press-release",
    title: "The All-New 2024 BMW X2.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0437576EN_US/the-all-new-2024-bmw-x2",
  },
  {
    slug: "bmw-2024-x5-x6-press-release",
    title: "The 2024 BMW X5 and X6.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0408460EN_US/the-2024-bmw-x5-and-x6",
  },
  {
    slug: "bmw-2024-x5-m-x6-m-press-release",
    title: "The 2024 BMW X5 M Competition and X6 M Competition.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0409477EN_US/the-2024-bmw-x5-m-competition-and-x6-m-competition",
  },
  {
    slug: "bmw-2023-x7-press-release",
    title: "The New BMW X7.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0380774EN_US/the-new-bmw-x7",
  },
  {
    slug: "bmw-2023-alpina-xb7-press-release",
    title: "The 2023 BMW ALPINA XB7: The Force of Emotions.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0403875EN_US/the-2023-bmw-alpina-xb7:-the-force-of-emotions",
  },
  {
    slug: "bmw-xm-label-red-press-release",
    title: "The BMW XM Label Red – The Most Powerful BMW M Model Ever Made.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0412959EN_US/the-bmw-xm-label-red-%E2%80%93-the-most-powerful-bmw-m-model-ever-made",
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "bmw-2025-x3-press-release",
    title: "The All-New 2025 BMW X3 (base MSRP)",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0443207EN_US/the-all-new-2025-bmw-x3",
    publisher: "BMW Group",
  },
  {
    slug: "bmw-2024-x5-x6-press-release",
    title: "The 2024 BMW X5 and X6 (base MSRP)",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0408460EN_US/the-2024-bmw-x5-and-x6",
    publisher: "BMW Group",
  },
  {
    slug: "iseecars-2025-bmw-x1-msrp",
    title: "2025 BMW X1 MSRP (iSeeCars)",
    url: "https://www.iseecars.com/car/2025-bmw-x1-price",
    publisher: "iSeeCars",
  },
  {
    slug: "iseecars-2025-bmw-x2-msrp",
    title: "2025 BMW X2 MSRP (iSeeCars)",
    url: "https://www.iseecars.com/car/2025-bmw-x2-price",
    publisher: "iSeeCars",
  },
  {
    slug: "edmunds-2025-bmw-x5-msrp",
    title: "2025 BMW X5 specs & features (base MSRP)",
    url: "https://www.edmunds.com/bmw/x5/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "cars-com-2025-bmw-x5-m-msrp",
    title: "2025 BMW X5 M Competition specs (Cars.com)",
    url: "https://www.cars.com/research/bmw-x5_m-2025/specs/",
    publisher: "Cars.com",
  },
  {
    slug: "edmunds-2025-bmw-x6-msrp",
    title: "2025 BMW X6 specs & features (base MSRP)",
    url: "https://www.edmunds.com/bmw/x6/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2025-bmw-x6-m-msrp",
    title: "2025 BMW X6 M starting price (Car and Driver)",
    url: "https://www.caranddriver.com/bmw/x6-m-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "cars-com-2025-bmw-x7-pricing",
    title: "2025 BMW X7 pricing (Cars.com)",
    url: "https://www.cars.com/articles/2025-bmw-x7-three-row-luxury-priced-from-85475-503740/",
    publisher: "Cars.com",
  },
  {
    slug: "edmunds-2025-bmw-alpina-xb7-msrp",
    title: "2025 BMW ALPINA XB7 specs & features (base MSRP)",
    url: "https://www.edmunds.com/bmw/alpina-xb7/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "cars-com-2025-bmw-xm-pricing",
    title: "2025 BMW XM / XM Label pricing (Cars.com)",
    url: "https://www.cars.com/research/bmw-xm-2025/",
    publisher: "Cars.com",
  },
] as const;

const DESTINATION_SOURCE = {
  slug: "bmw-x-series-destination-fee-2025",
  title: "BMW US destination and handling ($1,175)",
  url: "https://www.cars.com/articles/2025-bmw-x7-three-row-luxury-priced-from-85475-503740/",
  type: "THIRD_PARTY" as const,
};

const TRIMS: TrimSeed[] = [
  {
    slug: "2025-bmw-x3-30-xdrive-us",
    name: "X3 30 xDrive",
    modelSlug: "bmw-x3",
    modelName: "X3",
    generationCode: "G45",
    generationLabel: "Fourth generation (G45)",
    generationStartYear: 2025,
    drivetrain: "AWD",
    dokNo: "P90554821",
    imageAlt: "2025 BMW X3 30 xDrive exterior",
    epaId: "48077",
    engine: {
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
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 187.2,
      widthIn: 75.6,
      heightIn: 65.4,
      wheelbaseIn: 112.8,
      frontTrackIn: 63.5,
      rearTrackIn: 65.3,
      groundClearanceIn: 8.5,
      curbWeightKg: 1894,
      grossVehicleWeightKg: 2500,
      cargoVolumeLiters: 892,
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 6,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 27, highwayMpg: 33, combinedMpg: 29 },
    baseMsrpCents: 4950000,
    pressSourceSlug: "bmw-2025-x3-press-release",
    priceSourceSlug: "bmw-2025-x3-press-release",
  },
  {
    slug: "2025-bmw-x3-m50-xdrive-us",
    name: "X3 M50 xDrive",
    modelSlug: "bmw-x3",
    modelName: "X3",
    generationCode: "G45",
    generationLabel: "Fourth generation (G45)",
    generationStartYear: 2025,
    drivetrain: "AWD",
    dokNo: "P90554870",
    imageAlt: "2025 BMW X3 M50 xDrive exterior",
    epaId: "48078",
    engine: {
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
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 187.2,
      widthIn: 75.6,
      heightIn: 65.4,
      wheelbaseIn: 112.8,
      frontTrackIn: 63.9,
      rearTrackIn: 63.9,
      groundClearanceIn: 8.3,
      curbWeightKg: 2057,
      grossVehicleWeightKg: 2620,
      cargoVolumeLiters: 892,
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 393,
      torqueLbFt: 428,
      zeroToSixtySeconds: 4.4,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 25, highwayMpg: 30, combinedMpg: 27 },
    baseMsrpCents: 6410000,
    pressSourceSlug: "bmw-2025-x3-press-release",
    priceSourceSlug: "bmw-2025-x3-press-release",
  },
  {
    slug: "2025-bmw-x5-xdrive40i-us",
    name: "X5 xDrive40i",
    modelSlug: "bmw-x5",
    modelName: "X5",
    generationCode: "G05",
    generationLabel: "Fourth generation (G05)",
    generationStartYear: 2019,
    drivetrain: "AWD",
    dokNo: "P90615578",
    imageAlt: "2025 BMW X5 xDrive40i exterior",
    epaId: "47743",
    engine: {
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
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 194.3,
      widthIn: 78.9,
      heightIn: 69.5,
      wheelbaseIn: 117.1,
      frontTrackIn: 66.1,
      rearTrackIn: 66.5,
      groundClearanceIn: 8.7,
      curbWeightKg: 2190,
      grossVehicleWeightKg: 2860,
      cargoVolumeLiters: 972,
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 375,
      torqueLbFt: 398,
      zeroToSixtySeconds: 5.2,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 23, highwayMpg: 27, combinedMpg: 25 },
    baseMsrpCents: 6860000,
    pressSourceSlug: "bmw-2024-x5-x6-press-release",
    priceSourceSlug: "bmw-2024-x5-x6-press-release",
  },
  // ——— X1 ———
  {
    slug: "2025-bmw-x1-xdrive28i-us",
    name: "X1 xDrive28i",
    modelSlug: "bmw-x1",
    modelName: "X1",
    generationCode: "U11",
    generationLabel: "Third generation (U11)",
    generationStartYear: 2023,
    drivetrain: "AWD",
    dokNo: "P90465574",
    imageAlt: "2025 BMW X1 xDrive28i exterior",
    epaId: "48261",
    engine: {
      slug: "bmw-b48a20o1-x1-28i",
      name: "B48A20O1",
      code: "B48A20O1-X1",
      fuelType: "PETROL",
      displacementCc: 1998,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "TwinPower Turbo",
      electrification: null,
    },
    transmissionSlug: "bmw-7-speed-dct-steptronic",
    dimensions: {
      lengthIn: 177.2,
      widthIn: 72.6,
      heightIn: 64.6,
      wheelbaseIn: 106.0,
      frontTrackIn: 62.3,
      rearTrackIn: 62.3,
      groundClearanceIn: 8.1,
      curbWeightKg: lbsToKg(3750),
      grossVehicleWeightKg: lbsToKg(4850),
      cargoVolumeLiters: cuFtToLiters(25.7),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 241,
      torqueLbFt: 295,
      zeroToSixtySeconds: 6.2,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 24, highwayMpg: 33, combinedMpg: 28 },
    baseMsrpCents: 4135000,
    pressSourceSlug: "bmw-2023-x1-press-release",
    priceSourceSlug: "iseecars-2025-bmw-x1-msrp",
  },
  {
    slug: "2025-bmw-x1-m35i-us",
    name: "X1 M35i",
    modelSlug: "bmw-x1",
    modelName: "X1",
    generationCode: "U11",
    generationLabel: "Third generation (U11)",
    generationStartYear: 2023,
    drivetrain: "AWD",
    dokNo: "P90509735",
    imageAlt: "2025 BMW X1 M35i exterior",
    epaId: "48262",
    engine: {
      slug: "bmw-b48a20m1-x1-m35i",
      name: "B48A20M1",
      code: "B48A20M1-X1",
      fuelType: "PETROL",
      displacementCc: 1998,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "M TwinPower Turbo",
      electrification: null,
    },
    transmissionSlug: "bmw-7-speed-dct-steptronic",
    dimensions: {
      lengthIn: 177.2,
      widthIn: 72.6,
      heightIn: 64.6,
      wheelbaseIn: 106.0,
      frontTrackIn: 62.3,
      rearTrackIn: 62.3,
      groundClearanceIn: 8.1,
      curbWeightKg: lbsToKg(3825),
      grossVehicleWeightKg: lbsToKg(5004),
      cargoVolumeLiters: cuFtToLiters(25.7),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 312,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.2,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 23, highwayMpg: 31, combinedMpg: 26 },
    baseMsrpCents: 5080000,
    pressSourceSlug: "bmw-2024-x1-m35i-press-release",
    priceSourceSlug: "iseecars-2025-bmw-x1-msrp",
  },
  // ——— X2 ———
  {
    slug: "2025-bmw-x2-xdrive28i-us",
    name: "X2 xDrive28i",
    modelSlug: "bmw-x2",
    modelName: "X2",
    generationCode: "U10",
    generationLabel: "Second generation (U10)",
    generationStartYear: 2024,
    drivetrain: "AWD",
    dokNo: "P90525114",
    imageAlt: "2025 BMW X2 xDrive28i exterior",
    epaId: "48263",
    engine: {
      slug: "bmw-b48a20o1-x2-28i",
      name: "B48A20O1",
      code: "B48A20O1-X2",
      fuelType: "PETROL",
      displacementCc: 1998,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "TwinPower Turbo",
      electrification: null,
    },
    transmissionSlug: "bmw-7-speed-dct-steptronic",
    dimensions: {
      lengthIn: 179.3,
      widthIn: 72.6,
      heightIn: 62.6,
      wheelbaseIn: 106.0,
      frontTrackIn: 62.3,
      rearTrackIn: 62.3,
      groundClearanceIn: 8.1,
      curbWeightKg: lbsToKg(3803),
      grossVehicleWeightKg: lbsToKg(4806),
      cargoVolumeLiters: cuFtToLiters(25.3),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 241,
      torqueLbFt: 295,
      zeroToSixtySeconds: 6.2,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 24, highwayMpg: 33, combinedMpg: 28 },
    baseMsrpCents: 4285000,
    pressSourceSlug: "bmw-2024-x2-press-release",
    priceSourceSlug: "iseecars-2025-bmw-x2-msrp",
  },
  {
    slug: "2025-bmw-x2-m35i-us",
    name: "X2 M35i",
    modelSlug: "bmw-x2",
    modelName: "X2",
    generationCode: "U10",
    generationLabel: "Second generation (U10)",
    generationStartYear: 2024,
    drivetrain: "AWD",
    dokNo: "P90526444",
    imageAlt: "2025 BMW X2 M35i exterior",
    epaId: "48264",
    engine: {
      slug: "bmw-b48a20m1-x2-m35i",
      name: "B48A20M1",
      code: "B48A20M1-X2",
      fuelType: "PETROL",
      displacementCc: 1998,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "M TwinPower Turbo",
      electrification: null,
    },
    transmissionSlug: "bmw-7-speed-dct-steptronic",
    dimensions: {
      lengthIn: 179.3,
      widthIn: 72.6,
      heightIn: 62.6,
      wheelbaseIn: 106.0,
      frontTrackIn: 62.3,
      rearTrackIn: 62.3,
      groundClearanceIn: 8.1,
      curbWeightKg: lbsToKg(3840),
      grossVehicleWeightKg: lbsToKg(5004),
      cargoVolumeLiters: cuFtToLiters(25.3),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 312,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.2,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 23, highwayMpg: 32, combinedMpg: 26 },
    baseMsrpCents: 5230000,
    pressSourceSlug: "bmw-2024-x2-press-release",
    priceSourceSlug: "iseecars-2025-bmw-x2-msrp",
  },
  // ——— X5 ———
  {
    slug: "2025-bmw-x5-sdrive40i-us",
    name: "X5 sDrive40i",
    modelSlug: "bmw-x5",
    modelName: "X5",
    generationCode: "G05",
    generationLabel: "Fourth generation LCI (G05)",
    generationStartYear: 2019,
    drivetrain: "RWD",
    dokNo: "P90557147",
    imageAlt: "2025 BMW X5 sDrive40i exterior",
    epaId: "47742",
    engine: {
      slug: "bmw-b58b30m2-x5-40i",
      name: "B58B30M2",
      code: "B58B30M2-X5",
      fuelType: "PETROL",
      displacementCc: 2998,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "TwinPower Turbo",
      electrification: "48V mild hybrid",
    },
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 194.3,
      widthIn: 78.9,
      heightIn: 69.5,
      wheelbaseIn: 117.1,
      frontTrackIn: 66.1,
      rearTrackIn: 66.5,
      groundClearanceIn: 8.7,
      curbWeightKg: lbsToKg(4828),
      grossVehicleWeightKg: lbsToKg(6200),
      cargoVolumeLiters: cuFtToLiters(33.9),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 375,
      torqueLbFt: 398,
      zeroToSixtySeconds: 5.2,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 23, highwayMpg: 27, combinedMpg: 25 },
    baseMsrpCents: 6630000,
    pressSourceSlug: "bmw-2024-x5-x6-press-release",
    priceSourceSlug: "edmunds-2025-bmw-x5-msrp",
  },
  {
    slug: "2025-bmw-x5-xdrive50e-us",
    name: "X5 xDrive50e",
    modelSlug: "bmw-x5",
    modelName: "X5",
    generationCode: "G05",
    generationLabel: "Fourth generation LCI (G05)",
    generationStartYear: 2019,
    drivetrain: "AWD",
    dokNo: "P90489760",
    imageAlt: "2025 BMW X5 xDrive50e exterior",
    epaId: "49009",
    engine: {
      slug: "bmw-b58-x5-50e-phev",
      name: "B58 3.0L PHEV (X5 50e)",
      code: "B58-X5-50e",
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 2998,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "TwinPower Turbo",
      electrification: "Plug-in hybrid (GEN5 eDrive)",
    },
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 194.3,
      widthIn: 78.9,
      heightIn: 69.5,
      wheelbaseIn: 117.1,
      frontTrackIn: 66.1,
      rearTrackIn: 66.5,
      groundClearanceIn: 8.3,
      curbWeightKg: lbsToKg(5522),
      grossVehicleWeightKg: lbsToKg(6970),
      cargoVolumeLiters: cuFtToLiters(33.9),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 483,
      torqueLbFt: 516,
      zeroToSixtySeconds: 4.6,
      topSpeedMph: 130,
    },
    fuelEconomy: {
      cityMpg: 22,
      highwayMpg: 23,
      combinedMpg: 22,
      electricRangeMiles: 39,
    },
    baseMsrpCents: 7380000,
    pressSourceSlug: "bmw-2024-x5-x6-press-release",
    priceSourceSlug: "edmunds-2025-bmw-x5-msrp",
  },
  {
    slug: "2025-bmw-x5-m60i-us",
    name: "X5 M60i",
    modelSlug: "bmw-x5",
    modelName: "X5",
    generationCode: "G05",
    generationLabel: "Fourth generation LCI (G05)",
    generationStartYear: 2019,
    drivetrain: "AWD",
    dokNo: "P90557150",
    imageAlt: "2025 BMW X5 M60i exterior",
    epaId: "47744",
    engine: {
      slug: "bmw-n63b44t3-x5-m60i",
      name: "N63B44T3",
      code: "N63B44T3-X5",
      fuelType: "PETROL",
      displacementCc: 4395,
      cylinderCount: 8,
      configuration: "V",
      induction: "TwinPower Turbo",
      electrification: "48V mild hybrid",
    },
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 194.3,
      widthIn: 78.9,
      heightIn: 69.5,
      wheelbaseIn: 117.1,
      frontTrackIn: 66.1,
      rearTrackIn: 66.5,
      groundClearanceIn: 8.3,
      curbWeightKg: lbsToKg(5260),
      grossVehicleWeightKg: lbsToKg(6660),
      cargoVolumeLiters: cuFtToLiters(33.9),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 523,
      torqueLbFt: 553,
      zeroToSixtySeconds: 4.2,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 17, highwayMpg: 22, combinedMpg: 19 },
    baseMsrpCents: 9085000,
    pressSourceSlug: "bmw-2024-x5-x6-press-release",
    priceSourceSlug: "edmunds-2025-bmw-x5-msrp",
  },
  {
    slug: "2025-bmw-x5-m-competition-us",
    name: "X5 M Competition",
    modelSlug: "bmw-x5",
    modelName: "X5",
    generationCode: "G05",
    generationLabel: "Fourth generation LCI (G05)",
    generationStartYear: 2019,
    drivetrain: "AWD",
    dokNo: "P90495503",
    imageAlt: "2025 BMW X5 M Competition exterior",
    epaId: "47745",
    engine: {
      slug: "bmw-s68b44t0-x5-m",
      name: "S68B44T0",
      code: "S68B44T0-X5M",
      fuelType: "PETROL",
      displacementCc: 4395,
      cylinderCount: 8,
      configuration: "V",
      induction: "M TwinPower Turbo",
      electrification: "48V mild hybrid",
    },
    transmissionSlug: "bmw-8-speed-m-steptronic-drivelogic",
    dimensions: {
      lengthIn: 194.8,
      widthIn: 79.3,
      heightIn: 69.1,
      wheelbaseIn: 117.1,
      frontTrackIn: 66.9,
      rearTrackIn: 66.5,
      groundClearanceIn: 8.3,
      curbWeightKg: lbsToKg(5498),
      grossVehicleWeightKg: lbsToKg(6660),
      cargoVolumeLiters: cuFtToLiters(33.9),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 617,
      torqueLbFt: 553,
      zeroToSixtySeconds: 3.7,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 13, highwayMpg: 18, combinedMpg: 15 },
    baseMsrpCents: 12720000,
    pressSourceSlug: "bmw-2024-x5-m-x6-m-press-release",
    priceSourceSlug: "cars-com-2025-bmw-x5-m-msrp",
  },
  // ——— X6 ———
  {
    slug: "2025-bmw-x6-xdrive40i-us",
    name: "X6 xDrive40i",
    modelSlug: "bmw-x6",
    modelName: "X6",
    generationCode: "G06",
    generationLabel: "Third generation LCI (G06)",
    generationStartYear: 2020,
    drivetrain: "AWD",
    dokNo: "P90492412",
    imageAlt: "2025 BMW X6 xDrive40i exterior",
    epaId: "47746",
    engine: {
      slug: "bmw-b58b30m2-x6-40i",
      name: "B58B30M2",
      code: "B58B30M2-X6",
      fuelType: "PETROL",
      displacementCc: 2998,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "TwinPower Turbo",
      electrification: "48V mild hybrid",
    },
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 195.8,
      widthIn: 78.9,
      heightIn: 66.9,
      wheelbaseIn: 117.1,
      frontTrackIn: 66.1,
      rearTrackIn: 66.7,
      groundClearanceIn: 8.5,
      curbWeightKg: lbsToKg(4930),
      grossVehicleWeightKg: lbsToKg(6280),
      cargoVolumeLiters: cuFtToLiters(27.4),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 375,
      torqueLbFt: 398,
      zeroToSixtySeconds: 5.2,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 23, highwayMpg: 26, combinedMpg: 24 },
    baseMsrpCents: 7510000,
    pressSourceSlug: "bmw-2024-x5-x6-press-release",
    priceSourceSlug: "edmunds-2025-bmw-x6-msrp",
  },
  {
    slug: "2025-bmw-x6-m60i-us",
    name: "X6 M60i",
    modelSlug: "bmw-x6",
    modelName: "X6",
    generationCode: "G06",
    generationLabel: "Third generation LCI (G06)",
    generationStartYear: 2020,
    drivetrain: "AWD",
    dokNo: "P90492280",
    imageAlt: "2025 BMW X6 M60i exterior",
    epaId: "47747",
    engine: {
      slug: "bmw-n63b44t3-x6-m60i",
      name: "N63B44T3",
      code: "N63B44T3-X6",
      fuelType: "PETROL",
      displacementCc: 4395,
      cylinderCount: 8,
      configuration: "V",
      induction: "TwinPower Turbo",
      electrification: "48V mild hybrid",
    },
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 195.8,
      widthIn: 78.9,
      heightIn: 66.9,
      wheelbaseIn: 117.1,
      frontTrackIn: 66.1,
      rearTrackIn: 66.7,
      groundClearanceIn: 8.3,
      curbWeightKg: lbsToKg(5260),
      grossVehicleWeightKg: lbsToKg(6660),
      cargoVolumeLiters: cuFtToLiters(27.4),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 523,
      torqueLbFt: 553,
      zeroToSixtySeconds: 4.2,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 17, highwayMpg: 22, combinedMpg: 19 },
    baseMsrpCents: 9515000,
    pressSourceSlug: "bmw-2024-x5-x6-press-release",
    priceSourceSlug: "edmunds-2025-bmw-x6-msrp",
  },
  {
    slug: "2025-bmw-x6-m-competition-us",
    name: "X6 M Competition",
    modelSlug: "bmw-x6",
    modelName: "X6",
    generationCode: "G06",
    generationLabel: "Third generation LCI (G06)",
    generationStartYear: 2020,
    drivetrain: "AWD",
    dokNo: "P90495603",
    imageAlt: "2025 BMW X6 M Competition exterior",
    epaId: "47748",
    engine: {
      slug: "bmw-s68b44t0-x6-m",
      name: "S68B44T0",
      code: "S68B44T0-X6M",
      fuelType: "PETROL",
      displacementCc: 4395,
      cylinderCount: 8,
      configuration: "V",
      induction: "M TwinPower Turbo",
      electrification: "48V mild hybrid",
    },
    transmissionSlug: "bmw-8-speed-m-steptronic-drivelogic",
    dimensions: {
      lengthIn: 196.2,
      widthIn: 79.5,
      heightIn: 66.5,
      wheelbaseIn: 117.1,
      frontTrackIn: 66.9,
      rearTrackIn: 66.7,
      groundClearanceIn: 8.3,
      curbWeightKg: lbsToKg(5455),
      grossVehicleWeightKg: lbsToKg(6660),
      cargoVolumeLiters: cuFtToLiters(27.4),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 617,
      torqueLbFt: 553,
      zeroToSixtySeconds: 3.7,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 13, highwayMpg: 18, combinedMpg: 15 },
    // Car and Driver starting $133,550 includes $1,175 destination → base $132,375
    baseMsrpCents: 13237500,
    pressSourceSlug: "bmw-2024-x5-m-x6-m-press-release",
    priceSourceSlug: "caranddriver-2025-bmw-x6-m-msrp",
  },
  // ——— X7 / ALPINA ———
  {
    slug: "2025-bmw-x7-xdrive40i-us",
    name: "X7 xDrive40i",
    modelSlug: "bmw-x7",
    modelName: "X7",
    generationCode: "G07",
    generationLabel: "First generation LCI (G07)",
    generationStartYear: 2019,
    drivetrain: "AWD",
    dokNo: "P90457500",
    imageAlt: "2025 BMW X7 xDrive40i exterior",
    epaId: "47807",
    engine: {
      slug: "bmw-b58b30m2-x7-40i",
      name: "B58B30M2",
      code: "B58B30M2-X7",
      fuelType: "PETROL",
      displacementCc: 2998,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "TwinPower Turbo",
      electrification: "48V mild hybrid",
    },
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 203.6,
      widthIn: 78.7,
      heightIn: 72.2,
      wheelbaseIn: 122.2,
      frontTrackIn: 66.3,
      rearTrackIn: 66.9,
      groundClearanceIn: 8.7,
      curbWeightKg: lbsToKg(5445),
      grossVehicleWeightKg: lbsToKg(7170),
      cargoVolumeLiters: cuFtToLiters(48.6),
      seatingCapacity: 7,
    },
    performance: {
      powerHp: 375,
      torqueLbFt: 398,
      zeroToSixtySeconds: 5.6,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 20, highwayMpg: 24, combinedMpg: 22 },
    // Cars.com $85,475 incl. $1,175 dest → base $84,300
    baseMsrpCents: 8430000,
    pressSourceSlug: "bmw-2023-x7-press-release",
    priceSourceSlug: "cars-com-2025-bmw-x7-pricing",
  },
  {
    slug: "2025-bmw-x7-m60i-us",
    name: "X7 M60i",
    modelSlug: "bmw-x7",
    modelName: "X7",
    generationCode: "G07",
    generationLabel: "First generation LCI (G07)",
    generationStartYear: 2019,
    drivetrain: "AWD",
    dokNo: "P90457423",
    imageAlt: "2025 BMW X7 M60i exterior",
    epaId: "47749",
    engine: {
      slug: "bmw-n63b44t3-x7-m60i",
      name: "N63B44T3",
      code: "N63B44T3-X7",
      fuelType: "PETROL",
      displacementCc: 4395,
      cylinderCount: 8,
      configuration: "V",
      induction: "TwinPower Turbo",
      electrification: "48V mild hybrid",
    },
    transmissionSlug: "bmw-8-speed-steptronic",
    dimensions: {
      lengthIn: 203.6,
      widthIn: 78.7,
      heightIn: 72.2,
      wheelbaseIn: 122.2,
      frontTrackIn: 66.3,
      rearTrackIn: 66.9,
      groundClearanceIn: 8.7,
      curbWeightKg: lbsToKg(5895),
      grossVehicleWeightKg: lbsToKg(7170),
      cargoVolumeLiters: cuFtToLiters(48.6),
      seatingCapacity: 7,
    },
    performance: {
      powerHp: 523,
      torqueLbFt: 553,
      zeroToSixtySeconds: 4.5,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 16, highwayMpg: 20, combinedMpg: 18 },
    // Cars.com $113,075 incl. $1,175 dest → base $111,900
    baseMsrpCents: 11190000,
    pressSourceSlug: "bmw-2023-x7-press-release",
    priceSourceSlug: "cars-com-2025-bmw-x7-pricing",
  },
  {
    slug: "2025-bmw-alpina-xb7-us",
    name: "ALPINA XB7",
    modelSlug: "bmw-x7",
    modelName: "X7",
    generationCode: "G07",
    generationLabel: "First generation LCI (G07)",
    generationStartYear: 2019,
    drivetrain: "AWD",
    dokNo: "P90476753",
    imageAlt: "2025 BMW ALPINA XB7 exterior",
    epaId: "47750",
    engine: {
      slug: "bmw-alpina-n63-xb7",
      name: "ALPINA 4.4L Twin-Turbo V8",
      code: "N63-ALPINA-XB7",
      fuelType: "PETROL",
      displacementCc: 4395,
      cylinderCount: 8,
      configuration: "V",
      induction: "ALPINA TwinPower Turbo",
      electrification: "48V mild hybrid",
    },
    transmissionSlug: "bmw-8-speed-alpina-switch-tronic",
    dimensions: {
      lengthIn: 203.6,
      widthIn: 78.7,
      heightIn: 70.7,
      wheelbaseIn: 122.2,
      frontTrackIn: 66.5,
      rearTrackIn: 67.1,
      groundClearanceIn: 8.7,
      curbWeightKg: lbsToKg(5986),
      grossVehicleWeightKg: lbsToKg(7170),
      cargoVolumeLiters: cuFtToLiters(48.6),
      seatingCapacity: 7,
    },
    performance: {
      powerHp: 630,
      torqueLbFt: 590,
      zeroToSixtySeconds: 3.9,
      topSpeedMph: 180,
    },
    fuelEconomy: { cityMpg: 16, highwayMpg: 20, combinedMpg: 17 },
    baseMsrpCents: 15240000,
    pressSourceSlug: "bmw-2023-alpina-xb7-press-release",
    priceSourceSlug: "edmunds-2025-bmw-alpina-xb7-msrp",
  },
  // ——— XM Label (EPA / US naming) ———
  {
    slug: "2025-bmw-xm-label-us",
    name: "XM Label",
    modelSlug: "bmw-xm",
    modelName: "XM",
    generationCode: "G09",
    generationLabel: "First generation (G09)",
    generationStartYear: 2023,
    drivetrain: "AWD",
    dokNo: "P90499800",
    imageAlt: "2025 BMW XM Label exterior",
    epaId: "49010",
    engine: {
      slug: "bmw-s68-xm-label-phev",
      name: "S68 M HYBRID (XM Label)",
      code: "S68-XM-LABEL",
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 4395,
      cylinderCount: 8,
      configuration: "V",
      induction: "M TwinPower Turbo",
      electrification: "M HYBRID PHEV (GEN5 eDrive)",
    },
    transmissionSlug: "bmw-8-speed-m-steptronic-drivelogic",
    dimensions: {
      lengthIn: 201.2,
      widthIn: 78.9,
      heightIn: 69.1,
      wheelbaseIn: 122.2,
      frontTrackIn: 68.0,
      rearTrackIn: 67.2,
      groundClearanceIn: 8.7,
      curbWeightKg: lbsToKg(6094),
      grossVehicleWeightKg: lbsToKg(7275),
      cargoVolumeLiters: cuFtToLiters(18.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 738,
      torqueLbFt: 738,
      zeroToSixtySeconds: 3.7,
      topSpeedMph: 155,
    },
    fuelEconomy: {
      cityMpg: 12,
      highwayMpg: 17,
      combinedMpg: 14,
      electricRangeMiles: 31,
    },
    // Cars.com Label $187,875 incl. $1,175 dest → base $186,700
    baseMsrpCents: 18670000,
    pressSourceSlug: "bmw-xm-label-red-press-release",
    priceSourceSlug: "cars-com-2025-bmw-xm-pricing",
  },
];

export async function seedBmwXSeries(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [];

  const destinationSource = await prisma.source.upsert({
    where: { url: DESTINATION_SOURCE.url },
    create: {
      slug: DESTINATION_SOURCE.slug,
      title: DESTINATION_SOURCE.title,
      publisher: "Cars.com / BMW US pricing",
      url: DESTINATION_SOURCE.url,
      type: DESTINATION_SOURCE.type,
    },
    update: {
      title: DESTINATION_SOURCE.title,
      publisher: "Cars.com / BMW US pricing",
      type: DESTINATION_SOURCE.type,
    },
  });

  const pressSources = new Map<string, { id: string }>();
  for (const sourceData of PRESS_SOURCES) {
    const source = await prisma.source.upsert({
      where: { url: sourceData.url },
      create: {
        slug: sourceData.slug,
        title: sourceData.title,
        publisher: "BMW Group",
        url: sourceData.url,
        type: "PRESS_RELEASE",
      },
      update: {
        title: sourceData.title,
        publisher: "BMW Group",
        type: "PRESS_RELEASE",
      },
    });
    pressSources.set(sourceData.slug, source);
  }

  const priceSources = new Map<string, { id: string }>();
  for (const sourceData of PRICE_SOURCES) {
    const source = await prisma.source.upsert({
      where: { url: sourceData.url },
      create: {
        slug: sourceData.slug,
        title: sourceData.title,
        publisher: sourceData.publisher,
        url: sourceData.url,
        type: "THIRD_PARTY",
      },
      update: {
        title: sourceData.title,
        publisher: sourceData.publisher,
        type: "THIRD_PARTY",
      },
    });
    priceSources.set(sourceData.slug, source);
  }

  const transmissions = {
    "bmw-7-speed-dct-steptronic": await prisma.transmission.upsert({
      where: { slug: "bmw-7-speed-dct-steptronic" },
      create: {
        slug: "bmw-7-speed-dct-steptronic",
        name: "7-speed DCT Steptronic",
        type: "DUAL_CLUTCH",
        gearCount: 7,
      },
      update: {
        name: "7-speed DCT Steptronic",
        type: "DUAL_CLUTCH",
        gearCount: 7,
      },
    }),
    "bmw-8-speed-steptronic": await prisma.transmission.upsert({
      where: { slug: "bmw-8-speed-steptronic" },
      create: {
        slug: "bmw-8-speed-steptronic",
        name: "8-speed Steptronic",
        type: "AUTOMATIC",
        gearCount: 8,
      },
      update: {
        name: "8-speed Steptronic",
        type: "AUTOMATIC",
        gearCount: 8,
      },
    }),
    "bmw-8-speed-m-steptronic-drivelogic": await prisma.transmission.upsert({
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
    }),
    "bmw-8-speed-alpina-switch-tronic": await prisma.transmission.upsert({
      where: { slug: "bmw-8-speed-alpina-switch-tronic" },
      create: {
        slug: "bmw-8-speed-alpina-switch-tronic",
        name: "8-speed ALPINA SWITCH-TRONIC",
        type: "AUTOMATIC",
        gearCount: 8,
      },
      update: {
        name: "8-speed ALPINA SWITCH-TRONIC",
        type: "AUTOMATIC",
        gearCount: 8,
      },
    }),
  } as const;

  const modelCache = new Map<
    string,
    { modelId: string; modelYearId: string }
  >();

  for (const trim of TRIMS) {
    try {
      const imageUrl = await assertImageOk(trim.dokNo);
      const imageSource = await ensureImageSource(prisma, trim.dokNo);

      let modelYearId = modelCache.get(trim.modelSlug)?.modelYearId;
      if (!modelYearId) {
        const model = await prisma.vehicleModel.upsert({
          where: { slug: trim.modelSlug },
          create: {
            manufacturerId,
            name: trim.modelName,
            slug: trim.modelSlug,
          },
          update: {
            manufacturerId,
            name: trim.modelName,
          },
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
            generationId_year: { generationId: generation.id, year: 2025 },
          },
          create: { generationId: generation.id, year: 2025 },
          update: {},
        });
        modelCache.set(trim.modelSlug, {
          modelId: model.id,
          modelYearId: modelYear.id,
        });
        modelYearId = modelYear.id;
      }

      // X7 and ALPINA XB7 share model/generation; M Competition shares X5/X6 gens.
      // Re-resolve generation when code differs within same model (shouldn't for our map).
      const modelMeta = modelCache.get(trim.modelSlug)!;
      const model = await prisma.vehicleModel.findUniqueOrThrow({
        where: { id: modelMeta.modelId },
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
          generationId_year: { generationId: generation.id, year: 2025 },
        },
        create: { generationId: generation.id, year: 2025 },
        update: {},
      });
      modelYearId = modelYear.id;

      const engine = await prisma.engine.upsert({
        where: { slug: trim.engine.slug },
        create: {
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
        },
        update: {
          manufacturerId,
          name: trim.engine.name,
          code: trim.engine.code,
          fuelType: trim.engine.fuelType,
          displacementCc: trim.engine.displacementCc,
          cylinderCount: trim.engine.cylinderCount,
          configuration: trim.engine.configuration,
          induction: trim.engine.induction,
          electrification: trim.engine.electrification,
        },
      });

      const transmission = transmissions[trim.transmissionSlug];
      const pressSource = pressSources.get(trim.pressSourceSlug);
      const priceSource = priceSources.get(trim.priceSourceSlug);
      if (!pressSource || !priceSource) {
        throw new Error(`Missing source for ${trim.slug}`);
      }

      const fuelSource = await prisma.source.upsert({
        where: {
          url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
        },
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
          type: "GOVERNMENT",
        },
      });

      const vehicle = await prisma.vehicle.upsert({
        where: { slug: trim.slug },
        create: {
          slug: trim.slug,
          modelYearId,
          name: trim.name,
          market: "US",
          bodyStyle: "SUV",
          drivetrain: trim.drivetrain,
          engineId: engine.id,
          transmissionId: transmission.id,
          description: `2025 BMW ${trim.name} (US).`,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
        update: {
          modelYearId,
          name: trim.name,
          market: "US",
          bodyStyle: "SUV",
          drivetrain: trim.drivetrain,
          engineId: engine.id,
          transmissionId: transmission.id,
          description: `2025 BMW ${trim.name} (US).`,
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
              alt: trim.imageAlt,
              credit: "BMW Group",
              position: 0,
            },
            update: {
              sourceId: imageSource.id,
              url: imageUrl,
              alt: trim.imageAlt,
              credit: "BMW Group",
            },
          }),
        ]);

      const citationTasks = [
        upsertCitation(
          prisma,
          pressSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "BMW PressClub performance specifications",
        ),
        upsertCitation(
          prisma,
          pressSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "BMW PressClub dimensions / technical data",
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
          "Base MSRP excluding destination (2025 US)",
        ),
        upsertCitation(
          prisma,
          destinationSource.id,
          "VehiclePrice",
          destination.id,
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
      ];

      if (trim.fuelEconomy.electricRangeMiles != null) {
        citationTasks.push(
          upsertCitation(
            prisma,
            fuelSource.id,
            "VehicleFuelEconomy",
            fuelEconomy.id,
            "electricRangeMiles",
            `EPA vehicle id ${trim.epaId} rangeA`,
          ),
        );
      }

      await Promise.all(citationTasks);
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
