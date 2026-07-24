/**
 * Lamborghini Aventador seed module (US market).
 * Last US year per line — one trim each. Idempotent — safe to re-run.
 * Does not wire itself into prisma/seed.ts.
 *
 * Seeded (final US years):
 * - LP 700-4 Coupe / Roadster → MY 2016
 * - LP 750-4 Superveloce → MY 2016
 * - LP 750-4 SV Roadster → MY 2017
 * - Aventador S / S Roadster → MY 2020 (last Edmunds year with S trims)
 * - SVJ / SVJ Roadster → MY 2021
 * - Ultimae / Ultimae Roadster → MY 2022
 */
import type { BodyStyle } from "../../src/generated/prisma/client";
import {
  LAMBORGHINI_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureLamborghiniEngine,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./lamborghini-shared";

const LBS_TO_KG = 0.45359237;
const CUFT_TO_L = 28.316846592;
const MM_TO_IN = 1 / 25.4;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

function mmToIn(mm: number) {
  return Math.round(mm * MM_TO_IN * 10) / 10;
}

type TrimSeed = {
  slug: string;
  name: string;
  year: number;
  generationCode: string;
  generationDisplayName: string;
  generationStartYear: number;
  generationEndYear: number;
  bodyStyle: BodyStyle;
  drivetrain: "AWD";
  imageUrl: string;
  imagePageUrl: string;
  imagePublisher: "Wikimedia Commons" | "auto-data.net";
  imageAlt: string;
  epaId: string;
  engine: {
    slug: string;
    name: string;
    code: string;
    displacementCc: number;
    cylinderCount: number;
    induction: string;
  };
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
  };
  /** BASE_MSRP in cents (excludes destination). */
  baseMsrpCents: number;
  priceSource: {
    slug: string;
    title: string;
    url: string;
    publisher: string;
  };
  specSource: {
    slug: string;
    title: string;
    url: string;
    publisher: string;
  };
  description: string;
};

/**
 * Unique exteriors (HEAD-verified JPEG). Distinct colors / body styles / angles.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2016-lamborghini-aventador-lp-700-4-us",
    name: "Aventador LP 700-4",
    year: 2016,
    generationCode: "LP700",
    generationDisplayName: "LP 700-4 (2011–2016)",
    generationStartYear: 2011,
    generationEndYear: 2016,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f21/file2016712.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-aventador-lp-700-4-coupe-6.5-v12-700hp-4wd-17484",
    imagePublisher: "auto-data.net",
    imageAlt: "2016 Lamborghini Aventador LP 700-4 coupe exterior (orange)",
    // EPA 2016 Aventador Coupe id 36191 — 11/18/13
    epaId: "36191",
    engine: {
      slug: "lamborghini-l539-lp700-v12",
      name: "6.5L V12 naturally aspirated (L539 LP 700-4)",
      code: "L539-LP700",
      displacementCc: 6498,
      cylinderCount: 12,
      induction: "Naturally aspirated",
    },
    dimensions: {
      // auto-data.net LP 700-4 Coupe (mm → in); kerb 1,575 kg; cargo 140 L.
      lengthIn: mmToIn(4780),
      widthIn: mmToIn(2030),
      heightIn: mmToIn(1136),
      wheelbaseIn: mmToIn(2700),
      frontTrackIn: mmToIn(1720),
      rearTrackIn: mmToIn(1700),
      curbWeightKg: 1575,
      cargoVolumeLiters: 140,
      seatingCapacity: 2,
    },
    performance: {
      // US SAE 691 hp (700 PS); 509 lb-ft; 0–60 ~2.8 s; 217 mph (auto-data / Cars.com).
      powerHp: 691,
      torqueLbFt: 509,
      zeroToSixtySeconds: 2.8,
      topSpeedMph: 217,
    },
    fuelEconomy: { cityMpg: 11, highwayMpg: 18, combinedMpg: 13 },
    // Cars.com 2016 LP 700-4 coupe starting MSRP excl. destination.
    baseMsrpCents: 39_950_000,
    priceSource: {
      slug: "cars-com-2016-aventador-trims",
      title: "2016 Lamborghini Aventador Trims (Cars.com)",
      url: "https://www.cars.com/research/lamborghini-aventador-2016/trims/",
      publisher: "Cars.com",
    },
    specSource: {
      slug: "auto-data-aventador-lp700-4-coupe",
      title: "Lamborghini Aventador LP 700-4 Coupe 6.5 V12 — auto-data.net",
      url: "https://www.auto-data.net/en/lamborghini-aventador-lp-700-4-coupe-6.5-v12-700hp-4wd-17484",
      publisher: "auto-data.net",
    },
    description:
      "2016 Lamborghini Aventador LP 700-4 coupe (US). Mid-engine 6.5L V12, AWD, 7-speed ISR.",
  },
  {
    slug: "2016-lamborghini-aventador-lp-700-4-roadster-us",
    name: "Aventador LP 700-4 Roadster",
    year: 2016,
    generationCode: "LP700",
    generationDisplayName: "LP 700-4 (2011–2016)",
    generationStartYear: 2011,
    generationEndYear: 2016,
    bodyStyle: "ROADSTER",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f30/file2219794.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-aventador-lp-700-4-roadster-generation-4686",
    imagePublisher: "auto-data.net",
    imageAlt: "2016 Lamborghini Aventador LP 700-4 Roadster exterior",
    // EPA 2016 Aventador Roadster id 36192 — 10/17/12
    epaId: "36192",
    engine: {
      slug: "lamborghini-l539-lp700-v12",
      name: "6.5L V12 naturally aspirated (L539 LP 700-4)",
      code: "L539-LP700",
      displacementCc: 6498,
      cylinderCount: 12,
      induction: "Naturally aspirated",
    },
    dimensions: {
      // encyCARpedia / auto-data LP 700-4 Roadster; curb 1,625 kg; cargo 140 L.
      lengthIn: mmToIn(4780),
      widthIn: mmToIn(2030),
      heightIn: mmToIn(1136),
      wheelbaseIn: mmToIn(2700),
      frontTrackIn: mmToIn(1720),
      rearTrackIn: mmToIn(1700),
      curbWeightKg: 1625,
      cargoVolumeLiters: 140,
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 691,
      torqueLbFt: 509,
      zeroToSixtySeconds: 2.9,
      topSpeedMph: 217,
    },
    fuelEconomy: { cityMpg: 10, highwayMpg: 17, combinedMpg: 12 },
    // Cars.com 2016 LP 700-4 roadster starting MSRP excl. destination.
    baseMsrpCents: 44_380_000,
    priceSource: {
      slug: "cars-com-2016-aventador-trims",
      title: "2016 Lamborghini Aventador Trims (Cars.com)",
      url: "https://www.cars.com/research/lamborghini-aventador-2016/trims/",
      publisher: "Cars.com",
    },
    specSource: {
      slug: "encycarpedia-aventador-lp700-4-roadster",
      title: "Lamborghini Aventador Roadster LP700-4 — encyCARpedia",
      url: "https://www.encycarpedia.com/se/lamborghini/12-aventador-roadster-lp700-4",
      publisher: "encyCARpedia",
    },
    description:
      "2016 Lamborghini Aventador LP 700-4 Roadster (US). Mid-engine 6.5L V12, AWD, 7-speed ISR.",
  },
  {
    slug: "2016-lamborghini-aventador-lp-750-4-superveloce-us",
    name: "Aventador LP 750-4 Superveloce",
    year: 2016,
    generationCode: "LP750-SV",
    generationDisplayName: "LP 750-4 Superveloce (2015–2017)",
    generationStartYear: 2015,
    generationEndYear: 2017,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f2/file2417393.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-aventador-lp-750-4-superveloce-generation-4687",
    imagePublisher: "auto-data.net",
    imageAlt: "2016 Lamborghini Aventador LP 750-4 Superveloce coupe exterior",
    // Same EPA Coupe listing as LP 700-4 MY2016 (id 36191) — 11/18/13
    epaId: "36191",
    engine: {
      slug: "lamborghini-l539-lp750-sv-v12",
      name: "6.5L V12 naturally aspirated (L539 LP 750-4 SV)",
      code: "L539-LP750-SV",
      displacementCc: 6498,
      cylinderCount: 12,
      induction: "Naturally aspirated",
    },
    dimensions: {
      // auto-data / C&D SV test: L 4835 mm; C/D curb 3,868 lb; cargo ~5 cu ft.
      lengthIn: mmToIn(4835),
      widthIn: mmToIn(2030),
      heightIn: mmToIn(1136),
      wheelbaseIn: mmToIn(2700),
      frontTrackIn: mmToIn(1720),
      rearTrackIn: mmToIn(1700),
      curbWeightKg: lbsToKg(3868),
      cargoVolumeLiters: cuFtToLiters(5),
      seatingCapacity: 2,
    },
    performance: {
      // US SAE 740 hp (750 PS); 509 lb-ft; C/D 0–60 2.7 s; 217 mph.
      powerHp: 740,
      torqueLbFt: 509,
      zeroToSixtySeconds: 2.7,
      topSpeedMph: 217,
    },
    fuelEconomy: { cityMpg: 11, highwayMpg: 18, combinedMpg: 13 },
    // Cardog / Asbury 2016–17 SV coupe starting MSRP excl. destination.
    baseMsrpCents: 49_070_000,
    priceSource: {
      slug: "cardog-2016-aventador-trims",
      title: "2016 Lamborghini Aventador Trims & Pricing (Cardog)",
      url: "https://cardog.app/research/lamborghini/aventador/2016",
      publisher: "Cardog",
    },
    specSource: {
      slug: "caranddriver-2016-aventador-sv-test",
      title: "2016 Lamborghini Aventador LP750-4 Superveloce Test (Car and Driver)",
      url: "https://www.caranddriver.com/reviews/a15103742/2016-lamborghini-aventador-lp750-4-superveloce-test-review/",
      publisher: "Car and Driver",
    },
    description:
      "2016 Lamborghini Aventador LP 750-4 Superveloce coupe (US). Mid-engine 6.5L V12, AWD, 7-speed ISR.",
  },
  {
    slug: "2017-lamborghini-aventador-lp-750-4-sv-roadster-us",
    name: "Aventador LP 750-4 SV Roadster",
    year: 2017,
    generationCode: "LP750-SV",
    generationDisplayName: "LP 750-4 Superveloce (2015–2017)",
    generationStartYear: 2015,
    generationEndYear: 2017,
    bodyStyle: "ROADSTER",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f29/file5715840.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-aventador-lp-750-4-superveloce-roadster-generation-4688",
    imagePublisher: "auto-data.net",
    imageAlt: "2017 Lamborghini Aventador LP 750-4 SV Roadster exterior (yellow)",
    // EPA 2017 Aventador Roadster (non-LP740) id 37568 — 10/18/13
    epaId: "37568",
    engine: {
      slug: "lamborghini-l539-lp750-sv-v12",
      name: "6.5L V12 naturally aspirated (L539 LP 750-4 SV)",
      code: "L539-LP750-SV",
      displacementCc: 6498,
      cylinderCount: 12,
      induction: "Naturally aspirated",
    },
    dimensions: {
      // auto-data SV Roadster generation envelope; +~50 kg vs coupe dry.
      lengthIn: mmToIn(4835),
      widthIn: mmToIn(2030),
      heightIn: mmToIn(1136),
      wheelbaseIn: mmToIn(2700),
      frontTrackIn: mmToIn(1720),
      rearTrackIn: mmToIn(1700),
      curbWeightKg: lbsToKg(3868) + 50,
      cargoVolumeLiters: cuFtToLiters(5),
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 740,
      torqueLbFt: 509,
      zeroToSixtySeconds: 2.9,
      topSpeedMph: 217,
    },
    fuelEconomy: { cityMpg: 10, highwayMpg: 18, combinedMpg: 13 },
    // Cars.com / Cardog / CarBuzz SV Roadster starting MSRP excl. destination.
    baseMsrpCents: 53_550_000,
    priceSource: {
      slug: "cars-com-2016-aventador-trims",
      title: "2016 Lamborghini Aventador Trims (Cars.com) — SV Roadster MSRP",
      url: "https://www.cars.com/research/lamborghini-aventador-2016/trims/",
      publisher: "Cars.com",
    },
    specSource: {
      slug: "carbuzz-2017-aventador-sv-roadster",
      title: "2017 Lamborghini Aventador SV Roadster (CarBuzz)",
      url: "https://carbuzz.com/cars/lamborghini/avenger-sv-roadster/2017/",
      publisher: "CarBuzz",
    },
    description:
      "2017 Lamborghini Aventador LP 750-4 SV Roadster (US). Mid-engine 6.5L V12, AWD, 7-speed ISR.",
  },
  {
    slug: "2020-lamborghini-aventador-s-us",
    name: "Aventador S",
    year: 2020,
    generationCode: "LP740-S",
    generationDisplayName: "Aventador S / LP 740-4 (2017–2021)",
    generationStartYear: 2017,
    generationEndYear: 2021,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f4/lamborghini-aventador-s-coupe_2.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-aventador-s-coupe-generation-5481",
    imagePublisher: "auto-data.net",
    imageAlt: "2020 Lamborghini Aventador S coupe exterior (yellow)",
    // EPA 2020 Aventador Coupe id 42160 — 9/15/11
    epaId: "42160",
    engine: {
      slug: "lamborghini-l539-lp740-s-v12",
      name: "6.5L V12 naturally aspirated (L539 Aventador S)",
      code: "L539-LP740-S",
      displacementCc: 6498,
      cylinderCount: 12,
      induction: "Naturally aspirated",
    },
    dimensions: {
      // encyCARpedia Aventador S; curb 3,472 lb; cargo 4.9 cu ft.
      lengthIn: 188.9,
      widthIn: 79.9,
      heightIn: 44.7,
      wheelbaseIn: 106.3,
      frontTrackIn: 67.7,
      rearTrackIn: 66.1,
      curbWeightKg: lbsToKg(3472),
      cargoVolumeLiters: cuFtToLiters(4.9),
      seatingCapacity: 2,
    },
    performance: {
      // US SAE 730 hp (740 PS); 509 lb-ft; 0–60 ~2.8 s; 217 mph.
      powerHp: 730,
      torqueLbFt: 509,
      zeroToSixtySeconds: 2.8,
      topSpeedMph: 217,
    },
    fuelEconomy: { cityMpg: 9, highwayMpg: 15, combinedMpg: 11 },
    // Edmunds 2020 Aventador S coupe starting MSRP excl. destination.
    baseMsrpCents: 41_782_600,
    priceSource: {
      slug: "edmunds-2020-aventador-features",
      title: "2020 Lamborghini Aventador Specs & Features (Edmunds)",
      url: "https://www.edmunds.com/lamborghini/aventador/2020/features-specs/",
      publisher: "Edmunds",
    },
    specSource: {
      slug: "encycarpedia-aventador-s-coupe",
      title: "Lamborghini Aventador S specs — encyCARpedia",
      url: "https://www.encycarpedia.com/us/lamborghini/16-aventador-s-coupe",
      publisher: "encyCARpedia",
    },
    description:
      "2020 Lamborghini Aventador S coupe (US). Mid-engine 6.5L V12, AWD, 7-speed ISR, rear-wheel steering.",
  },
  {
    slug: "2020-lamborghini-aventador-s-roadster-us",
    name: "Aventador S Roadster",
    year: 2020,
    generationCode: "LP740-S",
    generationDisplayName: "Aventador S / LP 740-4 (2017–2021)",
    generationStartYear: 2017,
    generationEndYear: 2021,
    bodyStyle: "ROADSTER",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f81/Lamborghini-Aventador-S-Roadster.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-aventador-s-roadster-generation-5863",
    imagePublisher: "auto-data.net",
    imageAlt: "2020 Lamborghini Aventador S Roadster exterior",
    // EPA 2020 Aventador Roadster id 42161 — 9/15/11
    epaId: "42161",
    engine: {
      slug: "lamborghini-l539-lp740-s-v12",
      name: "6.5L V12 naturally aspirated (L539 Aventador S)",
      code: "L539-LP740-S",
      displacementCc: 6498,
      cylinderCount: 12,
      induction: "Naturally aspirated",
    },
    dimensions: {
      lengthIn: 188.9,
      widthIn: 79.9,
      heightIn: 44.7,
      wheelbaseIn: 106.3,
      frontTrackIn: 67.7,
      rearTrackIn: 66.1,
      curbWeightKg: lbsToKg(3472) + 50,
      cargoVolumeLiters: cuFtToLiters(4.9),
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 730,
      torqueLbFt: 509,
      zeroToSixtySeconds: 2.9,
      topSpeedMph: 217,
    },
    fuelEconomy: { cityMpg: 9, highwayMpg: 15, combinedMpg: 11 },
    // Edmunds 2020 Aventador S Roadster starting MSRP excl. destination.
    baseMsrpCents: 46_042_200,
    priceSource: {
      slug: "edmunds-2020-aventador-features",
      title: "2020 Lamborghini Aventador Specs & Features (Edmunds)",
      url: "https://www.edmunds.com/lamborghini/aventador/2020/features-specs/",
      publisher: "Edmunds",
    },
    specSource: {
      slug: "encycarpedia-aventador-s-coupe",
      title: "Lamborghini Aventador S specs — encyCARpedia",
      url: "https://www.encycarpedia.com/us/lamborghini/16-aventador-s-coupe",
      publisher: "encyCARpedia",
    },
    description:
      "2020 Lamborghini Aventador S Roadster (US). Mid-engine 6.5L V12, AWD, 7-speed ISR, rear-wheel steering.",
  },
  {
    slug: "2021-lamborghini-aventador-svj-us",
    name: "Aventador SVJ",
    year: 2021,
    generationCode: "LP770-SVJ",
    generationDisplayName: "Aventador SVJ / LP 770-4 (2018–2021)",
    generationStartYear: 2018,
    generationEndYear: 2021,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f22/Lamborghini-Aventador-SVJ.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-aventador-svj-generation-6480",
    imagePublisher: "auto-data.net",
    imageAlt: "2021 Lamborghini Aventador SVJ coupe exterior",
    // EPA 2021 Aventador Coupe id 43485 — 8/15/10
    epaId: "43485",
    engine: {
      slug: "lamborghini-l539-lp770-svj-v12",
      name: "6.5L V12 naturally aspirated (L539 SVJ)",
      code: "L539-LP770-SVJ",
      displacementCc: 6498,
      cylinderCount: 12,
      induction: "Naturally aspirated",
    },
    dimensions: {
      // auto-data SVJ: 4943 × 2098 × 1136 mm; tracks from Ultimae/S family.
      lengthIn: mmToIn(4943),
      widthIn: mmToIn(2098),
      heightIn: mmToIn(1136),
      wheelbaseIn: mmToIn(2700),
      frontTrackIn: mmToIn(1720),
      rearTrackIn: mmToIn(1680),
      curbWeightKg: lbsToKg(3362),
      cargoVolumeLiters: cuFtToLiters(4.9),
      seatingCapacity: 2,
    },
    performance: {
      // US SAE 759 hp (770 PS); 531 lb-ft; 0–60 ~2.8 s; 217+ mph.
      powerHp: 759,
      torqueLbFt: 531,
      zeroToSixtySeconds: 2.8,
      topSpeedMph: 217,
    },
    fuelEconomy: { cityMpg: 8, highwayMpg: 15, combinedMpg: 10 },
    // Edmunds 2021 SVJ coupe starting MSRP excl. destination.
    baseMsrpCents: 52_294_800,
    priceSource: {
      slug: "edmunds-2021-aventador-features",
      title: "2021 Lamborghini Aventador Specs & Features (Edmunds)",
      url: "https://www.edmunds.com/lamborghini/aventador/2021/features-specs/",
      publisher: "Edmunds",
    },
    specSource: {
      slug: "auto-data-aventador-svj",
      title: "Lamborghini Aventador SVJ generation — auto-data.net",
      url: "https://www.auto-data.net/en/lamborghini-aventador-svj-generation-6480",
      publisher: "auto-data.net",
    },
    description:
      "2021 Lamborghini Aventador SVJ coupe (US). Mid-engine 6.5L V12, AWD, 7-speed ISR, ALA active aero.",
  },
  {
    slug: "2021-lamborghini-aventador-svj-roadster-us",
    name: "Aventador SVJ Roadster",
    year: 2021,
    generationCode: "LP770-SVJ",
    generationDisplayName: "Aventador SVJ / LP 770-4 (2018–2021)",
    generationStartYear: 2018,
    generationEndYear: 2021,
    bodyStyle: "ROADSTER",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f130/Lamborghini-Aventador-SVJ-Roadster.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-aventador-svj-roadster-generation-7005",
    imagePublisher: "auto-data.net",
    imageAlt: "2021 Lamborghini Aventador SVJ Roadster exterior",
    // EPA 2021 Aventador Roadster id 43486 — 9/15/10
    epaId: "43486",
    engine: {
      slug: "lamborghini-l539-lp770-svj-v12",
      name: "6.5L V12 naturally aspirated (L539 SVJ)",
      code: "L539-LP770-SVJ",
      displacementCc: 6498,
      cylinderCount: 12,
      induction: "Naturally aspirated",
    },
    dimensions: {
      lengthIn: mmToIn(4943),
      widthIn: mmToIn(2098),
      heightIn: mmToIn(1136),
      wheelbaseIn: mmToIn(2700),
      frontTrackIn: mmToIn(1720),
      rearTrackIn: mmToIn(1680),
      curbWeightKg: lbsToKg(3362) + 50,
      cargoVolumeLiters: cuFtToLiters(4.9),
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 759,
      torqueLbFt: 531,
      zeroToSixtySeconds: 2.9,
      topSpeedMph: 217,
    },
    fuelEconomy: { cityMpg: 9, highwayMpg: 15, combinedMpg: 10 },
    // Edmunds 2021 SVJ Roadster starting MSRP excl. destination.
    baseMsrpCents: 57_396_600,
    priceSource: {
      slug: "edmunds-2021-aventador-features",
      title: "2021 Lamborghini Aventador Specs & Features (Edmunds)",
      url: "https://www.edmunds.com/lamborghini/aventador/2021/features-specs/",
      publisher: "Edmunds",
    },
    specSource: {
      slug: "auto-data-aventador-svj-roadster",
      title: "Lamborghini Aventador SVJ Roadster generation — auto-data.net",
      url: "https://www.auto-data.net/en/lamborghini-aventador-svj-roadster-generation-7005",
      publisher: "auto-data.net",
    },
    description:
      "2021 Lamborghini Aventador SVJ Roadster (US). Mid-engine 6.5L V12, AWD, 7-speed ISR, ALA active aero.",
  },
  {
    slug: "2022-lamborghini-aventador-ultimae-us",
    name: "Aventador LP 780-4 Ultimae",
    year: 2022,
    generationCode: "LP780-Ultimae",
    generationDisplayName: "LP 780-4 Ultimae (2021–2022)",
    generationStartYear: 2021,
    generationEndYear: 2022,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f100/Lamborghini-Aventador-LP-780-4-Ultimae-Coupe_2.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-aventador-lp-780-4-ultimae-coupe-6.5-v12-780hp-4wd-isr-43843",
    imagePublisher: "auto-data.net",
    imageAlt: "2022 Lamborghini Aventador LP 780-4 Ultimae coupe exterior",
    // EPA 2022 Aventador Coupe id 44950 — 9/16/11
    epaId: "44950",
    engine: {
      slug: "lamborghini-l539-lp780-ultimae-v12",
      name: "6.5L V12 naturally aspirated (L539 Ultimae)",
      code: "L539-LP780-Ultimae",
      displacementCc: 6498,
      cylinderCount: 12,
      induction: "Naturally aspirated",
    },
    dimensions: {
      // Car and Driver / CarBuzz Ultimae coupe; tracks from C/D.
      lengthIn: 191.7,
      widthIn: 82.6,
      heightIn: 44.7,
      wheelbaseIn: 106.3,
      frontTrackIn: 67.7,
      rearTrackIn: 66.1,
      curbWeightKg: lbsToKg(3472),
      cargoVolumeLiters: cuFtToLiters(4.9),
      seatingCapacity: 2,
    },
    performance: {
      // US SAE 769 hp (780 PS); 531 lb-ft; 0–60 ~2.8 s; 221 mph (auto-data 355 km/h).
      powerHp: 769,
      torqueLbFt: 531,
      zeroToSixtySeconds: 2.8,
      topSpeedMph: 221,
    },
    fuelEconomy: { cityMpg: 9, highwayMpg: 16, combinedMpg: 11 },
    // iSeeCars 2022 Ultimae coupe MSRP excl. destination ($3,695).
    baseMsrpCents: 49_825_800,
    priceSource: {
      slug: "iseecars-2022-aventador-price",
      title: "2022 Lamborghini Aventador Price / Destination (iSeeCars)",
      url: "https://www.iseecars.com/car/lamborghini-aventador-price",
      publisher: "iSeeCars",
    },
    specSource: {
      slug: "auto-data-aventador-ultimae-coupe",
      title: "Lamborghini Aventador LP 780-4 Ultimae Coupe — auto-data.net",
      url: "https://www.auto-data.net/en/lamborghini-aventador-lp-780-4-ultimae-coupe-6.5-v12-780hp-4wd-isr-43843",
      publisher: "auto-data.net",
    },
    description:
      "2022 Lamborghini Aventador LP 780-4 Ultimae coupe (US). Final Aventador V12; AWD, 7-speed ISR.",
  },
  {
    slug: "2022-lamborghini-aventador-ultimae-roadster-us",
    name: "Aventador LP 780-4 Ultimae Roadster",
    year: 2022,
    generationCode: "LP780-Ultimae",
    generationDisplayName: "LP 780-4 Ultimae (2021–2022)",
    generationStartYear: 2021,
    generationEndYear: 2022,
    bodyStyle: "ROADSTER",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f40/Lamborghini-Aventador-LP-780-4-Ultimae-Roadster.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-aventador-lp-780-4-ultimae-roadster-generation-8479",
    imagePublisher: "auto-data.net",
    imageAlt: "2022 Lamborghini Aventador LP 780-4 Ultimae Roadster exterior",
    // EPA 2022 Aventador Roadster id 45024 — 9/16/11
    epaId: "45024",
    engine: {
      slug: "lamborghini-l539-lp780-ultimae-v12",
      name: "6.5L V12 naturally aspirated (L539 Ultimae)",
      code: "L539-LP780-Ultimae",
      displacementCc: 6498,
      cylinderCount: 12,
      induction: "Naturally aspirated",
    },
    dimensions: {
      lengthIn: 191.7,
      widthIn: 82.6,
      heightIn: 44.7,
      wheelbaseIn: 106.3,
      frontTrackIn: 67.7,
      rearTrackIn: 66.1,
      curbWeightKg: lbsToKg(3472) + 50,
      cargoVolumeLiters: cuFtToLiters(4.9),
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 769,
      torqueLbFt: 531,
      zeroToSixtySeconds: 2.9,
      topSpeedMph: 221,
    },
    fuelEconomy: { cityMpg: 9, highwayMpg: 16, combinedMpg: 11 },
    // iSeeCars 2022 Ultimae Roadster MSRP excl. destination.
    baseMsrpCents: 55_054_200,
    priceSource: {
      slug: "iseecars-2022-aventador-price",
      title: "2022 Lamborghini Aventador Price / Destination (iSeeCars)",
      url: "https://www.iseecars.com/car/lamborghini-aventador-price",
      publisher: "iSeeCars",
    },
    specSource: {
      slug: "carbuzz-2022-aventador-ultimae",
      title: "2022 Lamborghini Aventador Ultimae (CarBuzz)",
      url: "https://carbuzz.com/cars/lamborghini/aventador-ultimae/2022/",
      publisher: "CarBuzz",
    },
    description:
      "2022 Lamborghini Aventador LP 780-4 Ultimae Roadster (US). Final Aventador V12 roadster; AWD, 7-speed ISR.",
  },
];

const STATIC_SKIPPED = [
  "2011–2015 Aventador LP 700-4: US catalogue limited to final MY 2016 coupe/roadster",
  "2015 Aventador LP 750-4 Superveloce: US catalogue limited to final MY 2016 coupe",
  "2016 Aventador LP 750-4 SV Roadster: US catalogue limited to final MY 2017",
  "2017–2019 Aventador S / S Roadster: US catalogue limited to final Edmunds year MY 2020",
  "2021 Aventador S / S Roadster: Edmunds MY2021 US trim list is SVJ-only — skipped",
  "2018–2020 Aventador SVJ / SVJ Roadster: US catalogue limited to final MY 2021",
  "LP 700-4 Pirelli Edition / Miura Homage / SVJ 63 / Ad Personam specials: appearance packages or incomplete catalogue coverage — skipped",
  "Sián / Countach LPI 800-4: seeded in lamborghini-hypercars.ts",
];

export async function seedLamborghiniAventador(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  const model = await prisma.vehicleModel.upsert({
    where: { slug: "lamborghini-aventador" },
    create: {
      manufacturerId,
      name: "Aventador",
      slug: "lamborghini-aventador",
    },
    update: { manufacturerId, name: "Aventador" },
  });

  type GenEntry = { id: string; years: Map<number, string> };
  const generationCache = new Map<string, GenEntry>();

  async function ensureModelYear(trim: TrimSeed): Promise<string> {
    let genEntry = generationCache.get(trim.generationCode);
    if (!genEntry) {
      const generation = await prisma.vehicleGeneration.upsert({
        where: {
          modelId_code: { modelId: model.id, code: trim.generationCode },
        },
        create: {
          modelId: model.id,
          code: trim.generationCode,
          displayName: trim.generationDisplayName,
          startYear: trim.generationStartYear,
          endYear: trim.generationEndYear,
        },
        update: {
          displayName: trim.generationDisplayName,
          startYear: trim.generationStartYear,
          endYear: trim.generationEndYear,
        },
      });
      genEntry = { id: generation.id, years: new Map() };
      generationCache.set(trim.generationCode, genEntry);
    }

    let modelYearId = genEntry.years.get(trim.year);
    if (!modelYearId) {
      const modelYear = await prisma.modelYear.upsert({
        where: {
          generationId_year: {
            generationId: genEntry.id,
            year: trim.year,
          },
        },
        create: { generationId: genEntry.id, year: trim.year },
        update: {},
      });
      modelYearId = modelYear.id;
      genEntry.years.set(trim.year, modelYearId);
    }

    return modelYearId;
  }

  const destinationSource = await upsertCatalogueSource(prisma, {
    slug: "iseecars-2022-aventador-destination",
    title: "2022 Lamborghini Aventador destination charge (iSeeCars)",
    publisher: "iSeeCars",
    url: "https://www.iseecars.com/car/lamborghini-aventador-price",
    type: "THIRD_PARTY",
  });

  const claimedImages = new Set<string>();

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

      const modelYearId = await ensureModelYear(trim);

      const engine = await ensureLamborghiniEngine(prisma, {
        manufacturerId,
        slug: trim.engine.slug,
        name: trim.engine.name,
        code: trim.engine.code,
        fuelType: "PETROL",
        displacementCc: trim.engine.displacementCc,
        cylinderCount: trim.engine.cylinderCount,
        configuration: "V",
        induction: trim.engine.induction,
        electrification: null,
      });

      const transmission = await prisma.transmission.upsert({
        where: { slug: "lamborghini-isr-7" },
        create: {
          slug: "lamborghini-isr-7",
          name: "7-speed ISR automated manual",
          type: "AUTOMATIC",
          gearCount: 7,
        },
        update: {
          name: "7-speed ISR automated manual",
          type: "AUTOMATIC",
          gearCount: 7,
        },
      });

      const specSource = await upsertCatalogueSource(prisma, {
        slug: trim.specSource.slug,
        title: trim.specSource.title,
        publisher: trim.specSource.publisher,
        url: trim.specSource.url,
        type: "THIRD_PARTY",
      });

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-${trim.year}-${trim.slug}`,
        title: `EPA Fuel Economy — ${trim.year} Lamborghini ${trim.name}`,
        publisher: "U.S. EPA",
        url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
        type: "GOVERNMENT",
      });

      const priceSource = await upsertCatalogueSource(prisma, {
        slug: trim.priceSource.slug,
        title: trim.priceSource.title,
        publisher: trim.priceSource.publisher,
        url: trim.priceSource.url,
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

      const destinationCents = LAMBORGHINI_DESTINATION_CENTS.sportsCar;

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
              credit: trim.imagePublisher,
              position: 0,
            },
            update: {
              sourceId: imageSource.id,
              url: imageUrl,
              alt: trim.imageAlt,
              credit: trim.imagePublisher,
            },
          }),
        ]);

      await Promise.all([
        upsertCitation(
          prisma,
          specSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "Power, torque, 0–60 mph, and top speed from cited OEM / press specs",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Exterior dimensions, tracks, curb weight, cargo",
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
          `US destination and handling $${(destinationCents / 100).toFixed(0)} (iSeeCars / sports-car class)`,
        ),
        upsertCitation(
          prisma,
          imageSource.id,
          "VehicleImage",
          image.id,
          "url",
          `${trim.imagePublisher} exterior asset`,
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
