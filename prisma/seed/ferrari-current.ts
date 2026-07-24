/**
 * Ferrari current / halo US catalogue (296, Daytona SP3, Purosangue, 12Cilindri, F80).
 * Prefer latest US MY with EPA + MSRP (2025 when 2026 pricing incomplete).
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Sources:
 * - EPA fueleconomy.gov vehicle IDs (gas MPG + PHEV electric range)
 * - Car and Driver / iSeeCars / CarsDirect / CarGurus (US BASE_MSRP)
 * - auto-data.net + Ferrari press (dims, tracks, dry/curb weight, performance)
 * - Destination: FERRARI_DESTINATION_CENTS ($5,000; iSeeCars Monroney-style)
 */
import type { FuelType } from "../../src/generated/prisma/client";
import {
  FERRARI_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureFerrariEngine,
  ensureImageSource,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./ferrari-shared";

const CUFT_TO_L = 28.316846592;

function mmToIn(mm: number) {
  return Math.round((mm / 25.4) * 100) / 100;
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

type ModelKey =
  | "ferrari-296"
  | "ferrari-daytona-sp3"
  | "ferrari-purosangue"
  | "ferrari-12cilindri"
  | "ferrari-f80";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelKey;
  modelName: string;
  year: 2025 | 2026;
  generationCode: string;
  generationDisplayName: string;
  generationStartYear: number;
  generationEndYear?: number | null;
  bodyStyle: "COUPE" | "CABRIOLET" | "ROADSTER" | "SUV";
  drivetrain: "RWD" | "AWD";
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
  epaId: string;
  fuelType: FuelType;
  engine: {
    slug: string;
    name: string;
    code: string;
    displacementCc: number;
    cylinderCount: number;
    configuration: string;
    induction: string;
    electrification: string | null;
  };
  transmission: {
    slug: string;
    name: string;
    gearCount: number;
  };
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
    cargoVolumeLiters?: number;
    seatingCapacity: number;
  };
  performance: {
    powerHp: number;
    torqueLbFt: number;
    zeroToSixtySeconds: number;
    quarterMileSeconds?: number;
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
  msrpSourceUrl: string;
  msrpSourceTitle: string;
  msrpPublisher: string;
  specUrl: string;
  specTitle: string;
  description: string;
};

/**
 * Unique auto-data.net exteriors (HEAD-verified JPEG; one distinct shot per trim).
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2026-ferrari-296-gtb-us",
    name: "296 GTB",
    modelSlug: "ferrari-296",
    modelName: "296",
    year: 2026,
    generationCode: "296",
    generationDisplayName: "296 (2022–)",
    generationStartYear: 2022,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f50/Ferrari-296-GTB.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-296-gtb-3.0-v6-830hp-plug-in-hybrid-f1-dct-43732",
    imageAlt: "2026 Ferrari 296 GTB coupe exterior",
    epaId: "50260",
    fuelType: "PLUG_IN_HYBRID",
    engine: {
      slug: "ferrari-f163-296-phev",
      name: "F163 3.0L twin-turbo V6 + electric motor (PHEV)",
      code: "F163",
      displacementCc: 2992,
      cylinderCount: 6,
      configuration: "V",
      induction: "Twin-turbocharged",
      electrification: "PHEV (axial-flux MGU-K; 7.45 kWh HV battery)",
    },
    transmission: {
      slug: "ferrari-8dct-296",
      name: "8-speed F1 dual-clutch automatic",
      gearCount: 8,
    },
    dimensions: {
      // auto-data / Ferrari press (mm → in). Dry weight with lightweight options.
      lengthIn: mmToIn(4565),
      widthIn: mmToIn(1958),
      heightIn: mmToIn(1187),
      wheelbaseIn: mmToIn(2600),
      frontTrackIn: mmToIn(1665),
      rearTrackIn: mmToIn(1632),
      curbWeightKg: 1470,
      cargoVolumeLiters: cuFtToLiters(5), // EPA lv2
      seatingCapacity: 2,
    },
    performance: {
      // Combined system 830 cv ≈ 819 hp; 0–100 km/h 2.9 s (Ferrari); top >330 km/h.
      powerHp: 819,
      torqueLbFt: 546,
      zeroToSixtySeconds: 2.9,
      topSpeedMph: 205,
    },
    fuelEconomy: {
      // EPA id 50260 — gas-only city/hwy/comb; rangeA = 8 mi.
      cityMpg: 16,
      highwayMpg: 22,
      combinedMpg: 18,
      electricRangeMiles: 8,
    },
    baseMsrpCents: 33_825_000, // Car and Driver 2026 GTB $338,250
    msrpSourceUrl:
      "https://www.caranddriver.com/ferrari/296-gtb/specs/2026/ferrari_296-gtb_ferrari-296gtb_2026",
    msrpSourceTitle: "2026 Ferrari 296 GTB Coupe Features and Specs (Car and Driver)",
    msrpPublisher: "Car and Driver",
    specUrl:
      "https://www.auto-data.net/en/ferrari-296-gtb-3.0-v6-830hp-plug-in-hybrid-f1-dct-43732",
    specTitle: "Ferrari 296 GTB 3.0 V6 (830 Hp) Plug-in Hybrid F1 DCT — auto-data.net",
    description:
      "2026 Ferrari 296 GTB US plug-in hybrid coupe. Mid-engine twin-turbo V6 + electric motor, RWD, 8-speed DCT.",
  },
  {
    slug: "2026-ferrari-296-gts-us",
    name: "296 GTS",
    modelSlug: "ferrari-296",
    modelName: "296",
    year: 2026,
    generationCode: "296",
    generationDisplayName: "296 (2022–)",
    generationStartYear: 2022,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f110/Ferrari-296-GTS.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-296-gts-3.0-v6-830hp-plug-in-hybrid-f1-dct-45695",
    imageAlt: "2026 Ferrari 296 GTS spider exterior",
    epaId: "50261",
    fuelType: "PLUG_IN_HYBRID",
    engine: {
      slug: "ferrari-f163-296-phev",
      name: "F163 3.0L twin-turbo V6 + electric motor (PHEV)",
      code: "F163",
      displacementCc: 2992,
      cylinderCount: 6,
      configuration: "V",
      induction: "Twin-turbocharged",
      electrification: "PHEV (axial-flux MGU-K; 7.45 kWh HV battery)",
    },
    transmission: {
      slug: "ferrari-8dct-296",
      name: "8-speed F1 dual-clutch automatic",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: mmToIn(4565),
      widthIn: mmToIn(1958),
      heightIn: mmToIn(1191),
      wheelbaseIn: mmToIn(2600),
      frontTrackIn: mmToIn(1665),
      rearTrackIn: mmToIn(1632),
      curbWeightKg: 1540,
      cargoVolumeLiters: 49,
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 819,
      torqueLbFt: 546,
      zeroToSixtySeconds: 2.9,
      topSpeedMph: 205,
    },
    fuelEconomy: {
      // EPA id 50261 — rangeA = 7 mi.
      cityMpg: 15,
      highwayMpg: 21,
      combinedMpg: 18,
      electricRangeMiles: 7,
    },
    baseMsrpCents: 37_313_400, // Car and Driver 2026 GTS $373,134
    msrpSourceUrl:
      "https://www.caranddriver.com/ferrari/296-gtb/specs/2026/ferrari_296-gtb_ferrari-296gts_2026",
    msrpSourceTitle: "2026 Ferrari 296 GTS Convertible Features and Specs (Car and Driver)",
    msrpPublisher: "Car and Driver",
    specUrl:
      "https://www.auto-data.net/en/ferrari-296-gts-3.0-v6-830hp-plug-in-hybrid-f1-dct-45695",
    specTitle: "Ferrari 296 GTS 3.0 V6 (830 Hp) Plug-in Hybrid F1 DCT — auto-data.net",
    description:
      "2026 Ferrari 296 GTS US plug-in hybrid retractable-hardtop spider. Mid-engine twin-turbo V6 + electric motor, RWD, 8-speed DCT.",
  },
  {
    slug: "2026-ferrari-296-speciale-us",
    name: "296 Speciale",
    modelSlug: "ferrari-296",
    modelName: "296",
    year: 2026,
    generationCode: "296",
    generationDisplayName: "296 (2022–)",
    generationStartYear: 2022,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f110/Ferrari-296-Speciale.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-296-speciale-3.0-v6-880hp-plug-in-hybrid-f1-dct-54201",
    imageAlt: "2026 Ferrari 296 Speciale coupe exterior",
    epaId: "50262",
    fuelType: "PLUG_IN_HYBRID",
    engine: {
      slug: "ferrari-f163-296-speciale-phev",
      name: "F163 3.0L twin-turbo V6 + electric motor Speciale (PHEV)",
      // Distinct from base 296 F163 row so uprated Speciale electrification is not overwritten.
      code: "F163 Speciale",
      displacementCc: 2992,
      cylinderCount: 6,
      configuration: "V",
      induction: "Twin-turbocharged",
      electrification: "PHEV (uprated MGU-K; 7.45 kWh HV battery)",
    },
    transmission: {
      slug: "ferrari-8dct-296",
      name: "8-speed F1 dual-clutch automatic",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: mmToIn(4625),
      widthIn: mmToIn(1968),
      heightIn: mmToIn(1181),
      wheelbaseIn: mmToIn(2600),
      frontTrackIn: mmToIn(1665),
      rearTrackIn: mmToIn(1632),
      curbWeightKg: 1410,
      cargoVolumeLiters: 169,
      seatingCapacity: 2,
    },
    performance: {
      // Combined 880 cv ≈ 869 hp (C&D / Ferrari); 0–100 2.8 s.
      powerHp: 869,
      torqueLbFt: 557,
      zeroToSixtySeconds: 2.8,
      topSpeedMph: 205,
    },
    fuelEconomy: {
      // EPA id 50262 — rangeA = 7 mi.
      cityMpg: 16,
      highwayMpg: 22,
      combinedMpg: 18,
      electricRangeMiles: 7,
    },
    baseMsrpCents: 47_536_400, // Car and Driver Base $475,364
    msrpSourceUrl:
      "https://www.caranddriver.com/ferrari/296-gtb/specs/2026/ferrari_296-gtb_ferrari-296-speciale_2026",
    msrpSourceTitle: "2026 Ferrari 296 Speciale Coupe Features and Specs (Car and Driver)",
    msrpPublisher: "Car and Driver",
    specUrl:
      "https://www.auto-data.net/en/ferrari-296-speciale-3.0-v6-880hp-plug-in-hybrid-f1-dct-54201",
    specTitle: "Ferrari 296 Speciale 3.0 V6 (880 Hp) Plug-in Hybrid F1 DCT — auto-data.net",
    description:
      "2026 Ferrari 296 Speciale US track-focused plug-in hybrid coupe. Uprated V6 hybrid system, RWD, 8-speed DCT.",
  },
  {
    slug: "2026-ferrari-296-speciale-a-us",
    name: "296 Speciale A",
    modelSlug: "ferrari-296",
    modelName: "296",
    year: 2026,
    generationCode: "296",
    generationDisplayName: "296 (2022–)",
    generationStartYear: 2022,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f60/Ferrari-296-Speciale-A.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-296-speciale-a-3.0-v6-880hp-plug-in-hybrid-f1-dct-54202",
    imageAlt: "2026 Ferrari 296 Speciale A spider exterior",
    epaId: "50263",
    fuelType: "PLUG_IN_HYBRID",
    engine: {
      slug: "ferrari-f163-296-speciale-phev",
      name: "F163 3.0L twin-turbo V6 + electric motor Speciale (PHEV)",
      code: "F163 Speciale",
      displacementCc: 2992,
      cylinderCount: 6,
      configuration: "V",
      induction: "Twin-turbocharged",
      electrification: "PHEV (uprated MGU-K; 7.45 kWh HV battery)",
    },
    transmission: {
      slug: "ferrari-8dct-296",
      name: "8-speed F1 dual-clutch automatic",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: mmToIn(4625),
      widthIn: mmToIn(1968),
      heightIn: mmToIn(1181),
      wheelbaseIn: mmToIn(2600),
      frontTrackIn: mmToIn(1665),
      rearTrackIn: mmToIn(1632),
      curbWeightKg: 1490,
      cargoVolumeLiters: 169,
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 869,
      torqueLbFt: 557,
      zeroToSixtySeconds: 2.8,
      topSpeedMph: 205,
    },
    fuelEconomy: {
      // EPA id 50263 — rangeA = 7 mi.
      cityMpg: 16,
      highwayMpg: 22,
      combinedMpg: 18,
      electricRangeMiles: 7,
    },
    baseMsrpCents: 53_752_400, // CarGurus / rydeshopper Original MSRP $537,524
    msrpSourceUrl: "https://www.rydeshopper.com/ferrari/296-speciale-a/2026",
    msrpSourceTitle: "2026 Ferrari 296 Speciale A MSRP (rydeshopper)",
    msrpPublisher: "rydeshopper",
    specUrl:
      "https://www.auto-data.net/en/ferrari-296-speciale-a-3.0-v6-880hp-plug-in-hybrid-f1-dct-54202",
    specTitle: "Ferrari 296 Speciale A 3.0 V6 (880 Hp) Plug-in Hybrid F1 DCT — auto-data.net",
    description:
      "2026 Ferrari 296 Speciale A US open-top plug-in hybrid. Speciale powertrain in Aperta body, RWD, 8-speed DCT.",
  },
  {
    slug: "2025-ferrari-daytona-sp3-us",
    name: "Daytona SP3",
    modelSlug: "ferrari-daytona-sp3",
    modelName: "Daytona SP3",
    year: 2025,
    generationCode: "SP3",
    generationDisplayName: "Daytona SP3 Icona (2023–2025)",
    generationStartYear: 2023,
    generationEndYear: 2025,
    bodyStyle: "ROADSTER",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f50/Ferrari-Daytona-SP3.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-daytona-sp3-6.5-v12-840hp-f1-dct-45102",
    imageAlt: "2025 Ferrari Daytona SP3 Icona targa exterior",
    epaId: "48580",
    fuelType: "PETROL",
    engine: {
      slug: "ferrari-f140hc-daytona-sp3",
      name: "F140HC 6.5L naturally aspirated V12",
      code: "F140HC",
      displacementCc: 6496,
      cylinderCount: 12,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-7dct-daytona-sp3",
      name: "7-speed F1 dual-clutch automatic",
      gearCount: 7,
    },
    dimensions: {
      // Ferrari Daytona SP3 press / auto-data (dry weight 1485 kg).
      lengthIn: mmToIn(4686),
      widthIn: mmToIn(2050),
      heightIn: mmToIn(1142),
      wheelbaseIn: mmToIn(2651),
      frontTrackIn: mmToIn(1692),
      rearTrackIn: mmToIn(1631),
      curbWeightKg: 1485,
      seatingCapacity: 2,
    },
    performance: {
      // 840 cv ≈ 829 hp; 0–100 2.85 s; top >340 km/h; C/D 1/4-mi est 10.0 s.
      powerHp: 829,
      torqueLbFt: 514,
      zeroToSixtySeconds: 2.85,
      quarterMileSeconds: 10.0,
      topSpeedMph: 211,
    },
    fuelEconomy: {
      // EPA id 48580.
      cityMpg: 12,
      highwayMpg: 16,
      combinedMpg: 13,
    },
    baseMsrpCents: 221_892_800, // iSeeCars 2025 base $2,218,928
    msrpSourceUrl: "https://www.iseecars.com/car/2025-ferrari-daytona_sp3-price",
    msrpSourceTitle: "2025 Ferrari Daytona SP3 Price (iSeeCars)",
    msrpPublisher: "iSeeCars",
    specUrl:
      "https://www.auto-data.net/en/ferrari-daytona-sp3-6.5-v12-840hp-f1-dct-45102",
    specTitle: "Ferrari Daytona SP3 6.5 V12 (840 Hp) F1 DCT — auto-data.net",
    description:
      "2025 Ferrari Daytona SP3 US Icona limited targa. Mid-engine NA V12, RWD, 7-speed DCT; final US catalogue year.",
  },
  {
    slug: "2026-ferrari-purosangue-us",
    name: "Purosangue",
    modelSlug: "ferrari-purosangue",
    modelName: "Purosangue",
    year: 2026,
    generationCode: "F175",
    generationDisplayName: "Purosangue F175 (2024–)",
    generationStartYear: 2024,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f45/Ferrari-Purosangue.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-purosangue-6.5-v12-725hp-awd-f1-dct-46494",
    imageAlt: "2026 Ferrari Purosangue SUV exterior",
    epaId: "49801",
    fuelType: "PETROL",
    engine: {
      slug: "ferrari-f140ia-purosangue",
      name: "F140IA 6.5L naturally aspirated V12",
      code: "F140IA",
      displacementCc: 6496,
      cylinderCount: 12,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-8dct-purosangue",
      name: "8-speed F1 dual-clutch automatic",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: mmToIn(4973),
      widthIn: mmToIn(2028),
      heightIn: mmToIn(1589),
      wheelbaseIn: mmToIn(3018),
      frontTrackIn: mmToIn(1737),
      rearTrackIn: mmToIn(1720),
      curbWeightKg: 2033,
      cargoVolumeLiters: 473,
      seatingCapacity: 4,
    },
    performance: {
      // 725 cv ≈ 715 hp; Ferrari 0–100 3.3 s; C/D 1/4-mi est 11.7 s; top 310 km/h.
      powerHp: 715,
      torqueLbFt: 528,
      zeroToSixtySeconds: 3.3,
      quarterMileSeconds: 11.7,
      topSpeedMph: 193,
    },
    fuelEconomy: {
      // EPA id 49801.
      cityMpg: 11,
      highwayMpg: 15,
      combinedMpg: 12,
    },
    baseMsrpCents: 43_298_600, // Car and Driver 2026 $432,986
    msrpSourceUrl: "https://www.caranddriver.com/ferrari/purosangue",
    msrpSourceTitle: "2026 Ferrari Purosangue Review, Pricing, and Specs (Car and Driver)",
    msrpPublisher: "Car and Driver",
    specUrl:
      "https://www.auto-data.net/en/ferrari-purosangue-6.5-v12-725hp-awd-f1-dct-46494",
    specTitle: "Ferrari Purosangue 6.5 V12 (725 Hp) AWD F1 DCT — auto-data.net",
    description:
      "2026 Ferrari Purosangue US four-seat SUV. Front-mid NA V12, AWD, 8-speed DCT, active suspension.",
  },
  {
    slug: "2026-ferrari-12cilindri-us",
    name: "12Cilindri",
    modelSlug: "ferrari-12cilindri",
    modelName: "12Cilindri",
    year: 2026,
    generationCode: "F167",
    generationDisplayName: "12Cilindri F167 (2025–)",
    generationStartYear: 2025,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f40/Ferrari-12Cilindri.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-12cilindri-6.5-v12-830hp-dct-51666",
    imageAlt: "2026 Ferrari 12Cilindri coupe exterior",
    epaId: "49775",
    fuelType: "PETROL",
    engine: {
      slug: "ferrari-f140hd-12cilindri",
      name: "F140HD 6.5L naturally aspirated V12",
      code: "F140HD",
      displacementCc: 6496,
      cylinderCount: 12,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-8dct-12cilindri",
      name: "8-speed F1 dual-clutch automatic",
      gearCount: 8,
    },
    dimensions: {
      // Width includes mirrors on auto-data (2176 mm); C&D body width 79.0 in used for US catalogue.
      lengthIn: mmToIn(4733),
      widthIn: 79.0,
      heightIn: mmToIn(1292),
      wheelbaseIn: mmToIn(2700),
      frontTrackIn: mmToIn(1686),
      rearTrackIn: mmToIn(1645),
      curbWeightKg: 1560,
      cargoVolumeLiters: 270,
      seatingCapacity: 2,
    },
    performance: {
      // 830 cv ≈ 819 hp; Ferrari 0–100 2.9 s; C/D 1/4-mi est 10.4 s; top >340 km/h.
      powerHp: 819,
      torqueLbFt: 500,
      zeroToSixtySeconds: 2.9,
      quarterMileSeconds: 10.4,
      topSpeedMph: 211,
    },
    fuelEconomy: {
      // EPA id 49775.
      cityMpg: 12,
      highwayMpg: 19,
      combinedMpg: 14,
    },
    baseMsrpCents: 46_599_400, // Car and Driver 2026 $465,994
    msrpSourceUrl: "https://www.caranddriver.com/ferrari/12cilindri",
    msrpSourceTitle: "2026 Ferrari 12Cilindri Review, Pricing, and Specs (Car and Driver)",
    msrpPublisher: "Car and Driver",
    specUrl: "https://www.auto-data.net/en/ferrari-12cilindri-6.5-v12-830hp-dct-51666",
    specTitle: "Ferrari 12Cilindri 6.5 V12 (830 Hp) DCT — auto-data.net",
    description:
      "2026 Ferrari 12Cilindri US grand-touring coupe. Front-mid NA V12, RWD, 8-speed DCT.",
  },
  {
    slug: "2026-ferrari-12cilindri-spider-us",
    name: "12Cilindri Spider",
    modelSlug: "ferrari-12cilindri",
    modelName: "12Cilindri",
    year: 2026,
    generationCode: "F167",
    generationDisplayName: "12Cilindri F167 (2025–)",
    generationStartYear: 2025,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f65/Ferrari-12Cilindri-Spider.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-12cilindri-spider-6.5-v12-830hp-f1-dct-51667",
    imageAlt: "2026 Ferrari 12Cilindri Spider convertible exterior",
    epaId: "49776",
    fuelType: "PETROL",
    engine: {
      slug: "ferrari-f140hd-12cilindri",
      name: "F140HD 6.5L naturally aspirated V12",
      code: "F140HD",
      displacementCc: 6496,
      cylinderCount: 12,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-8dct-12cilindri",
      name: "8-speed F1 dual-clutch automatic",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: mmToIn(4733),
      widthIn: 79.0,
      heightIn: mmToIn(1292),
      wheelbaseIn: mmToIn(2700),
      frontTrackIn: mmToIn(1686),
      rearTrackIn: mmToIn(1645),
      curbWeightKg: 1620,
      cargoVolumeLiters: 200,
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 819,
      torqueLbFt: 500,
      zeroToSixtySeconds: 2.95,
      quarterMileSeconds: 10.5,
      topSpeedMph: 211,
    },
    fuelEconomy: {
      // EPA id 49776.
      cityMpg: 12,
      highwayMpg: 17,
      combinedMpg: 14,
    },
    baseMsrpCents: 51_239_400, // CarsDirect / TrueCar 2026 from $512,394
    msrpSourceUrl: "https://www.carsdirect.com/ferrari/12cilindri-spider",
    msrpSourceTitle: "2026 Ferrari 12Cilindri Spider Buyer Guide MSRP (CarsDirect)",
    msrpPublisher: "CarsDirect",
    specUrl:
      "https://www.auto-data.net/en/ferrari-12cilindri-spider-6.5-v12-830hp-f1-dct-51667",
    specTitle: "Ferrari 12Cilindri Spider 6.5 V12 (830 Hp) F1 DCT — auto-data.net",
    description:
      "2026 Ferrari 12Cilindri Spider US soft-top convertible. Front-mid NA V12, RWD, 8-speed DCT.",
  },
  {
    slug: "2026-ferrari-f80-us",
    name: "F80",
    modelSlug: "ferrari-f80",
    modelName: "F80",
    year: 2026,
    generationCode: "F80",
    generationDisplayName: "F80 (2026–)",
    generationStartYear: 2026,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f90/Ferrari-F80.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-f80-3.0-v6-1200hp-mild-hybrid-e-4wd-f1-dct-52974",
    imageAlt: "2026 Ferrari F80 hypercar coupe exterior",
    epaId: "50044",
    fuelType: "HYBRID",
    engine: {
      slug: "ferrari-f163cf-f80-hybrid",
      name: "F163CF 3.0L twin-turbo V6 + triple electric motors (hybrid)",
      code: "F163CF",
      displacementCc: 2992,
      cylinderCount: 6,
      configuration: "V",
      induction: "Twin-turbocharged",
      electrification:
        "Hybrid e-4WD (front dual motors + rear MGU-K; 2.28 kWh HV battery; not plug-in)",
    },
    transmission: {
      slug: "ferrari-8dct-f80",
      name: "8-speed F1 dual-clutch automatic",
      gearCount: 8,
    },
    dimensions: {
      // Ferrari F80 press / auto-data (dry weight 1525 kg).
      lengthIn: mmToIn(4840),
      widthIn: mmToIn(2060),
      heightIn: mmToIn(1138),
      wheelbaseIn: mmToIn(2665),
      frontTrackIn: mmToIn(1701),
      rearTrackIn: mmToIn(1660),
      curbWeightKg: 1525,
      cargoVolumeLiters: 35,
      seatingCapacity: 2,
    },
    performance: {
      // System 1200 cv ≈ 1184 hp; Ferrari 0–100 2.15 s; C/D 1/4-mi est 9.0 s; top 350 km/h.
      powerHp: 1184,
      torqueLbFt: 627,
      zeroToSixtySeconds: 2.15,
      quarterMileSeconds: 9.0,
      topSpeedMph: 217,
    },
    fuelEconomy: {
      // EPA id 50044 — Hybrid (not PHEV); no electric-only rangeA.
      cityMpg: 15,
      highwayMpg: 20,
      combinedMpg: 17,
    },
    baseMsrpCents: 373_500_000, // Car and Driver Base $3,735,000
    msrpSourceUrl: "https://www.caranddriver.com/ferrari/f80",
    msrpSourceTitle: "2026 Ferrari F80 Review, Pricing, and Specs (Car and Driver)",
    msrpPublisher: "Car and Driver",
    specUrl:
      "https://www.auto-data.net/en/ferrari-f80-3.0-v6-1200hp-mild-hybrid-e-4wd-f1-dct-52974",
    specTitle: "Ferrari F80 3.0 V6 (1200 Hp) Mild Hybrid e-4WD F1 DCT — auto-data.net",
    description:
      "2026 Ferrari F80 US limited hybrid hypercar. Twin-turbo V6 + three electric motors, e-AWD, 8-speed DCT.",
  },
];

const STATIC_SKIPPED = [
  "2026/2027 Ferrari Amalfi: US MY listed as 2027 on Car and Driver; no EPA fuel-economy row for Amalfi in 2025–2026 fueleconomy.gov Ferrari menu — skipped",
  "2026/2027 Ferrari Amalfi Spider: no EPA listing; Amalfi line is MY2027 — skipped",
  "2026/2027 Ferrari 849 Testarossa: US MY listed as 2027 on Car and Driver ($565,685); no EPA vehicle id in 2025–2026 Ferrari menu — skipped",
  "2026/2027 Ferrari 849 Testarossa Spider: no EPA listing; 849 line is MY2027 — skipped",
];

export async function seedFerrariCurrent(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  const destinationSource = await upsertCatalogueSource(prisma, {
    slug: "iseecars-ferrari-destination-5000",
    title: "Ferrari US Destination Charge ~$5,000 (iSeeCars Monroney-style)",
    publisher: "iSeeCars",
    url: "https://www.iseecars.com/car/2025-ferrari-296_gtb-price",
    type: "THIRD_PARTY",
  });

  const claimedImages = new Set<string>();
  const modelCache = new Map<string, { id: string }>();
  const generationCache = new Map<string, { id: string }>();
  const modelYearCache = new Map<string, string>();

  for (const trim of TRIMS) {
    try {
      if (claimedImages.has(trim.imageUrl)) {
        throw new Error(`Duplicate image URL within module: ${trim.imageUrl}`);
      }
      claimedImages.add(trim.imageUrl);

      const imageUrl = await assertImageUrlOk(trim.imageUrl);
      const imageSource = await ensureImageSource(prisma, {
        slug: `auto-data-image-${trim.slug}`,
        title: `${trim.name} exterior (auto-data.net)`,
        pageUrl: trim.imagePageUrl,
        publisher: "auto-data.net",
      });

      let model = modelCache.get(trim.modelSlug);
      if (!model) {
        model = await prisma.vehicleModel.upsert({
          where: { slug: trim.modelSlug },
          create: {
            manufacturerId,
            name: trim.modelName,
            slug: trim.modelSlug,
          },
          update: { manufacturerId, name: trim.modelName },
        });
        modelCache.set(trim.modelSlug, model);
      }

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
            displayName: trim.generationDisplayName,
            startYear: trim.generationStartYear,
            endYear: trim.generationEndYear ?? undefined,
          },
          update: {
            displayName: trim.generationDisplayName,
            startYear: trim.generationStartYear,
            endYear: trim.generationEndYear ?? undefined,
          },
        });
        generationCache.set(genKey, generation);
      }

      const myKey = `${generation.id}:${trim.year}`;
      let modelYearId = modelYearCache.get(myKey);
      if (!modelYearId) {
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
        modelYearId = modelYear.id;
        modelYearCache.set(myKey, modelYearId);
      }

      const engine = await ensureFerrariEngine(prisma, {
        manufacturerId,
        slug: trim.engine.slug,
        name: trim.engine.name,
        code: trim.engine.code,
        fuelType: trim.fuelType,
        displacementCc: trim.engine.displacementCc,
        cylinderCount: trim.engine.cylinderCount,
        configuration: trim.engine.configuration,
        induction: trim.engine.induction,
        electrification: trim.engine.electrification,
      });

      const transmission = await prisma.transmission.upsert({
        where: { slug: trim.transmission.slug },
        create: {
          slug: trim.transmission.slug,
          name: trim.transmission.name,
          type: "DUAL_CLUTCH",
          gearCount: trim.transmission.gearCount,
        },
        update: {
          name: trim.transmission.name,
          type: "DUAL_CLUTCH",
          gearCount: trim.transmission.gearCount,
        },
      });

      const specSource = await upsertCatalogueSource(prisma, {
        slug: `auto-data-${trim.slug}`,
        title: trim.specTitle,
        publisher: "auto-data.net",
        url: trim.specUrl,
        type: "THIRD_PARTY",
      });

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-${trim.year}-${trim.slug}`,
        title: `EPA Fuel Economy — ${trim.year} Ferrari ${trim.name}`,
        publisher: "U.S. EPA",
        url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
        type: "GOVERNMENT",
      });

      const priceSource = await upsertCatalogueSource(prisma, {
        slug: `msrp-${trim.slug}`,
        title: trim.msrpSourceTitle,
        publisher: trim.msrpPublisher,
        url: trim.msrpSourceUrl,
        type: "THIRD_PARTY",
      });

      const vehicle = await prisma.vehicle.upsert({
        where: { slug: trim.slug },
        create: {
          slug: trim.slug,
          modelYearId,
          name: trim.name,
          market: "US",
          bodyStyle: trim.bodyStyle,
          drivetrain: trim.drivetrain,
          engineId: engine.id,
          transmissionId: transmission.id,
          description: trim.description,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
        update: {
          modelYearId,
          name: trim.name,
          market: "US",
          bodyStyle: trim.bodyStyle,
          drivetrain: trim.drivetrain,
          engineId: engine.id,
          transmissionId: transmission.id,
          description: trim.description,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
      });

      const dimensionsData = {
        lengthIn: trim.dimensions.lengthIn,
        widthIn: trim.dimensions.widthIn,
        heightIn: trim.dimensions.heightIn,
        wheelbaseIn: trim.dimensions.wheelbaseIn,
        frontTrackIn: trim.dimensions.frontTrackIn,
        rearTrackIn: trim.dimensions.rearTrackIn,
        groundClearanceIn: trim.dimensions.groundClearanceIn ?? null,
        curbWeightKg: trim.dimensions.curbWeightKg,
        grossVehicleWeightKg: trim.dimensions.grossVehicleWeightKg ?? null,
        cargoVolumeLiters: trim.dimensions.cargoVolumeLiters ?? null,
        seatingCapacity: trim.dimensions.seatingCapacity,
      };

      const performanceData = {
        powerHp: trim.performance.powerHp,
        torqueLbFt: trim.performance.torqueLbFt,
        zeroToSixtySeconds: trim.performance.zeroToSixtySeconds,
        quarterMileSeconds: trim.performance.quarterMileSeconds ?? null,
        topSpeedMph: trim.performance.topSpeedMph,
      };

      const fuelData = {
        cityMpg: trim.fuelEconomy.cityMpg,
        highwayMpg: trim.fuelEconomy.highwayMpg,
        combinedMpg: trim.fuelEconomy.combinedMpg,
        electricRangeMiles: trim.fuelEconomy.electricRangeMiles ?? null,
      };

      const [dimensions, performance, fuelEconomy, price, destination, image] =
        await Promise.all([
          prisma.vehicleDimensions.upsert({
            where: { vehicleId: vehicle.id },
            create: { vehicleId: vehicle.id, ...dimensionsData },
            update: dimensionsData,
          }),
          prisma.vehiclePerformance.upsert({
            where: { vehicleId: vehicle.id },
            create: { vehicleId: vehicle.id, ...performanceData },
            update: performanceData,
          }),
          prisma.vehicleFuelEconomy.upsert({
            where: { vehicleId: vehicle.id },
            create: { vehicleId: vehicle.id, ...fuelData },
            update: fuelData,
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
              amountCents: FERRARI_DESTINATION_CENTS,
              currency: "USD",
              effectiveAt: pricingDate,
            },
            update: {
              amountCents: FERRARI_DESTINATION_CENTS,
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

      const citations: Promise<unknown>[] = [
        upsertCitation(
          prisma,
          specSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "Ferrari press / auto-data.net power, torque, 0–100 km/h (≈0–62 mph), top speed; quarter-mile from C/D estimate when present",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "auto-data.net / Ferrari press exterior dimensions, tracks, dry/curb weight, cargo",
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
          `${trim.msrpPublisher} base MSRP excluding destination`,
        ),
        upsertCitation(
          prisma,
          destinationSource.id,
          "VehiclePrice",
          destination.id,
          "amountCents",
          `US destination and handling $${(FERRARI_DESTINATION_CENTS / 100).toFixed(0)} (iSeeCars / Ferrari of North America Monroney-style)`,
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
        citations.push(
          upsertCitation(
            prisma,
            fuelSource.id,
            "VehicleFuelEconomy",
            fuelEconomy.id,
            "electricRangeMiles",
            `EPA vehicle id ${trim.epaId} (rangeA)`,
          ),
        );
      }

      await Promise.all(citations);
      await ensureAudit(prisma, importerId, vehicle.id, trim.slug);
      seeded.push(
        `${trim.slug} | EPA=${trim.epaId} | image=${imageUrl}`,
      );
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      skipped.push(`${trim.slug}: ${reason}`);
    }
  }

  return { seeded, skipped };
}
