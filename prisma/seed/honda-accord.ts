/**
 * Honda Accord US catalogue seed (sedan, coupe, hybrid, plug-in).
 * Representative trims only — current MY2025 for live lines; final US years for
 * discontinued coupe / plug-in. Prefer unique auto-data.net exteriors;
 * PHEV uses Wikimedia Commons thumb (HEAD-ok). Idempotent — does not wire
 * itself into prisma/seed.ts.
 *
 * Exterior images (unique):
 * - https://www.auto-data.net/images/f50/Honda-Accord-XI.jpg
 * - https://www.auto-data.net/images/f129/Honda-Accord-XI.jpg
 * - https://www.auto-data.net/images/f110/Honda-Accord-XI.jpg
 * - https://www.auto-data.net/images/f55/Honda-Accord-IX-Coupe-facelift-2015.jpg
 * - https://www.auto-data.net/images/f47/Honda-Accord-IX-Coupe-facelift-2016.jpg
 * - https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Honda_Accord_Plug-in_Hybrid_rear_-_Tokyo_Motor_Show_2013.jpg/1280px-Honda_Accord_Plug-in_Hybrid_rear_-_Tokyo_Motor_Show_2013.jpg
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

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

type ModelSlug =
  | "honda-accord"
  | "honda-accord-coupe"
  | "honda-accord-plug-in";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: string;
  year: number;
  generationCode: string;
  generationLabel: string;
  generationStartYear: number;
  bodyStyle: "SEDAN" | "COUPE";
  drivetrain: Drivetrain;
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
  imageCredit: string;
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
    type: "AUTOMATIC" | "CVT" | "MANUAL";
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
    slug: "honda-news-2025-accord-pricing-epa",
    title: "2025 Honda Accord Pricing & EPA Ratings (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-d73d9911716c8277bb60a27897012845-2025-honda-accord-pricing-epa-ratings-2025",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-news-2025-accord-specs-features",
    title: "2025 Honda Accord Specifications & Features (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-008e554add341b8444085beaa2074089-2025-honda-accord-specifications-features",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "edmunds-2025-honda-accord",
    title: "2025 Honda Accord Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/honda/accord/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2025-honda-accord",
    title: "2025 Honda Accord Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/honda/accord-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "honda-news-2017-accord-pricing-epa",
    title: "2017 Honda Accord Pricing and EPA Data (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-663e82ddd080443bb44ebb06e5aa4112-2017-honda-accord-pricing-and-epa-data",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-news-2017-accord-coupe-specs",
    title: "2017 Accord Coupe Specifications & Features (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-068b16173e654e1fb0d200ae1e20efe9-2017-accord-coupe-secifications-features",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "edmunds-2017-honda-accord-coupe",
    title: "2017 Honda Accord Coupe Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/honda/accord/2017/coupe/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2016-accord-coupe-v6-test",
    title: "Tested: 2016 Honda Accord Coupe V-6 Automatic (Car and Driver)",
    url: "https://www.caranddriver.com/reviews/a15101487/2016-honda-accord-coupe-v-6-automatic-test-review/",
    publisher: "Car and Driver",
  },
  {
    slug: "honda-pr-2014-accord-plug-in",
    title:
      "115 MPGe Honda Accord Plug-In Hybrid Now Available (American Honda / PR Newswire)",
    url: "https://www.prnewswire.com/news-releases/115-mpge-honda-accord-plug-in-hybrid-most-fuel-efficient-sedan-in-america-now-available-at-select-new-york-and-california-dealerships-187744431.html",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-news-2014-accord-plug-in-specs",
    title: "2014 Honda Accord Plug-In Specifications & Features (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-96c5ebd4eba44b15b0ac401e71b83fd3-2014-honda-accord-plug-in-specifications-features",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "caranddriver-2014-accord-plug-in-test",
    title: "Tested: 2014 Honda Accord Plug-In Hybrid (Car and Driver)",
    url: "https://www.caranddriver.com/reviews/a15115552/2014-honda-accord-plug-in-test-review/",
    publisher: "Car and Driver",
  },
  {
    slug: "epa-2014-honda-accord-plug-in",
    title: "2014 Honda Accord Plug-in Hybrid (fueleconomy.gov)",
    url: "https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=33557",
    publisher: "U.S. EPA",
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "honda-news-2025-accord-msrp",
    title:
      "2025 Honda Accord MSRP excl. destination (Honda Newsroom pricing table)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-d73d9911716c8277bb60a27897012845-2025-honda-accord-pricing-epa-ratings-2025",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-news-2017-accord-coupe-msrp",
    title: "2017 Honda Accord Coupe MSRP by trim (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-663e82ddd080443bb44ebb06e5aa4112-2017-honda-accord-pricing-and-epa-data",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-pr-2014-accord-plug-in-msrp",
    title:
      "2014 Honda Accord Plug-In Hybrid MSRP $39,780 excl. $790 destination (PR Newswire)",
    url: "https://www.prnewswire.com/news-releases/115-mpge-honda-accord-plug-in-hybrid-most-fuel-efficient-sedan-in-america-now-available-at-select-new-york-and-california-dealerships-187744431.html",
    publisher: "American Honda Motor Co.",
  },
] as const;

const DESTINATION_SOURCE = {
  slug: "honda-us-destination-passenger-car",
  title:
    "Honda US destination & handling — passenger cars (Accord class); MY2025 newsroom cites $1,195",
  url: "https://hondanews.com/en-US/honda-automobiles/releases/release-e05d71587ae9f13f8215496ba80078eb-2025-honda-accord-pricing-and-epa-ratings",
  type: "PRESS_RELEASE" as const,
  publisher: "American Honda Motor Co.",
};

const DESTINATION_SOURCE_2014_PHEV = {
  slug: "honda-2014-accord-plug-in-destination-790",
  title: "2014 Accord Plug-In destination $790 (American Honda PR)",
  url: "https://www.prnewswire.com/news-releases/115-mpge-honda-accord-plug-in-hybrid-most-fuel-efficient-sedan-in-america-now-available-at-select-new-york-and-california-dealerships-187744431.html",
  type: "PRESS_RELEASE" as const,
  publisher: "American Honda Motor Co.",
};

/**
 * Representative US trims. EPA ids from fueleconomy.gov REST / Find.do SBS.
 * MSRP excludes destination unless noted in source.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2025-honda-accord-lx-us",
    name: "Accord LX",
    modelSlug: "honda-accord",
    modelName: "Accord",
    year: 2025,
    generationCode: "CY",
    generationLabel: "Eleventh generation (CY1/CY2) US",
    generationStartYear: 2023,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f50/Honda-Accord-XI.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-accord-xi-1.5-turbo-192hp-cvt-47432",
    imageAlt: "2025 Honda Accord LX sedan exterior",
    imageCredit: "auto-data.net",
    epaId: "48504",
    engine: {
      slug: "honda-l15be-192",
      name: "1.5L Inline-4 turbo (L15BE)",
      code: "L15BE",
      fuelType: "PETROL",
      displacementCc: 1498,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharged",
      electrification: null,
    },
    transmission: {
      slug: "honda-cvt-accord-15t",
      name: "Continuously variable transmission (CVT)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Honda Newsroom 2025 Accord specs — LX 17" track 63.0/63.8; GC 5.3
      lengthIn: 195.7,
      widthIn: 73.3,
      heightIn: 57.1,
      wheelbaseIn: 111.4,
      frontTrackIn: 63.0,
      rearTrackIn: 63.8,
      groundClearanceIn: 5.3,
      curbWeightKg: lbsToKg(3239),
      // Secondary trim listings (AllCarsOnline / door-jamb class): GVWR 4321 lb
      grossVehicleWeightKg: lbsToKg(4321),
      cargoVolumeLiters: cuFtToLiters(16.7),
      seatingCapacity: 5,
    },
    performance: {
      // Honda: 192 hp / 192 lb-ft; 0–60 ~7.2 C&D band for 1.5T Accords
      // C&D instrumented 1.5T: 1/4-mile 15.7; top speed (gov ltd) 118 mph
      powerHp: 192,
      torqueLbFt: 192,
      zeroToSixtySeconds: 7.2,
      quarterMileSeconds: 15.7,
      topSpeedMph: 118,
    },
    // EPA id 48504 — 29/37/32
    fuelEconomy: { cityMpg: 29, highwayMpg: 37, combinedMpg: 32 },
    // Honda Newsroom LX $28,295 excl. destination
    baseMsrpCents: 2_829_500,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "honda-news-2025-accord-specs-features",
    priceSourceSlug: "honda-news-2025-accord-msrp",
  },
  {
    slug: "2025-honda-accord-sport-hybrid-us",
    name: "Accord Sport Hybrid",
    modelSlug: "honda-accord",
    modelName: "Accord",
    year: 2025,
    generationCode: "CY",
    generationLabel: "Eleventh generation (CY1/CY2) US",
    generationStartYear: 2023,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f129/Honda-Accord-XI.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-accord-xi-2.0-204hp-hybrid-e-cvt-47433",
    imageAlt: "2025 Honda Accord Sport Hybrid sedan exterior",
    imageCredit: "auto-data.net",
    epaId: "48497",
    engine: {
      slug: "honda-lfb1-204-hybrid",
      name: "2.0L Inline-4 hybrid (LFB1 / e:HEV)",
      code: "LFB1",
      fuelType: "HYBRID",
      displacementCc: 1993,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "Honda two-motor hybrid (e:HEV); 204 hp combined",
    },
    transmission: {
      slug: "honda-ecvt-ehevi",
      name: "Electronic CVT (e-CVT / fixed-gear hybrid)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Honda Newsroom — Sport Hybrid 19" track 62.6/63.5; GC 5.3
      lengthIn: 195.7,
      widthIn: 73.3,
      heightIn: 57.1,
      wheelbaseIn: 111.4,
      frontTrackIn: 62.6,
      rearTrackIn: 63.5,
      groundClearanceIn: 5.3,
      curbWeightKg: lbsToKg(3483),
      // Hybrid sedan GVWR listings (dealer/spec aggregators): 4629 lb
      grossVehicleWeightKg: lbsToKg(4629),
      cargoVolumeLiters: cuFtToLiters(16.7),
      seatingCapacity: 5,
    },
    performance: {
      // Honda 204 hp combined; ICE ~134 lb-ft @ 4500; 0–60 ~6.6 C&D hybrid Accords
      // C&D instrumented hybrid: 1/4-mile 15.3; top speed (gov ltd) 125 mph
      powerHp: 204,
      torqueLbFt: 134,
      zeroToSixtySeconds: 6.6,
      quarterMileSeconds: 15.3,
      topSpeedMph: 125,
    },
    // EPA id 48497 — Sport/Touring 46/41/44
    fuelEconomy: { cityMpg: 46, highwayMpg: 41, combinedMpg: 44 },
    // Honda Newsroom Sport Hybrid $33,655 excl. destination
    baseMsrpCents: 3_365_500,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "honda-news-2025-accord-specs-features",
    priceSourceSlug: "honda-news-2025-accord-msrp",
  },
  {
    slug: "2025-honda-accord-touring-hybrid-us",
    name: "Accord Touring Hybrid",
    modelSlug: "honda-accord",
    modelName: "Accord",
    year: 2025,
    generationCode: "CY",
    generationLabel: "Eleventh generation (CY1/CY2) US",
    generationStartYear: 2023,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f110/Honda-Accord-XI.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-accord-xi-2.0-204hp-hybrid-e-cvt-47433",
    imageAlt: "2025 Honda Accord Touring Hybrid sedan exterior",
    imageCredit: "auto-data.net",
    epaId: "48497",
    engine: {
      slug: "honda-lfb1-204-hybrid",
      name: "2.0L Inline-4 hybrid (LFB1 / e:HEV)",
      code: "LFB1",
      fuelType: "HYBRID",
      displacementCc: 1993,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "Honda two-motor hybrid (e:HEV); 204 hp combined",
    },
    transmission: {
      slug: "honda-ecvt-ehevi",
      name: "Electronic CVT (e-CVT / fixed-gear hybrid)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Honda Newsroom — Touring Hybrid 19" track 62.6/63.5; GC 5.3
      lengthIn: 195.7,
      widthIn: 73.3,
      heightIn: 57.1,
      wheelbaseIn: 111.4,
      frontTrackIn: 62.6,
      rearTrackIn: 63.5,
      groundClearanceIn: 5.3,
      curbWeightKg: lbsToKg(3532),
      // Same hybrid platform GVWR class as Sport/EX-L Hybrid: 4629 lb
      grossVehicleWeightKg: lbsToKg(4629),
      cargoVolumeLiters: cuFtToLiters(16.7),
      seatingCapacity: 5,
    },
    performance: {
      // Honda 204 hp combined; ICE ~134 lb-ft; 0–60 ~6.6 C&D band
      // C&D instrumented hybrid: 1/4-mile 15.3; top speed (gov ltd) 125 mph
      powerHp: 204,
      torqueLbFt: 134,
      zeroToSixtySeconds: 6.6,
      quarterMileSeconds: 15.3,
      topSpeedMph: 125,
    },
    // EPA id 48497 — Sport/Touring 46/41/44
    fuelEconomy: { cityMpg: 46, highwayMpg: 41, combinedMpg: 44 },
    // Honda Newsroom Touring Hybrid $39,300 excl. destination
    baseMsrpCents: 3_930_000,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "honda-news-2025-accord-specs-features",
    priceSourceSlug: "honda-news-2025-accord-msrp",
  },
  {
    slug: "2017-honda-accord-coupe-lx-s-us",
    name: "Accord Coupe LX-S",
    modelSlug: "honda-accord-coupe",
    modelName: "Accord Coupe",
    year: 2017,
    generationCode: "9th-CT-FL",
    generationLabel: "Ninth generation coupe facelift (CT)",
    generationStartYear: 2016,
    bodyStyle: "COUPE",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f55/Honda-Accord-IX-Coupe-facelift-2015.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-accord-ix-coupe-facelift-2015-generation-6809",
    imageAlt: "2017 Honda Accord Coupe LX-S exterior",
    imageCredit: "auto-data.net",
    epaId: "37625",
    engine: {
      slug: "honda-k24w-185",
      name: "2.4L Inline-4 (K24W)",
      code: "K24W",
      fuelType: "PETROL",
      displacementCc: 2356,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "honda-cvt-accord-k24",
      name: "Continuously variable transmission (CVT) with Sport mode",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Honda Newsroom coupe: track 62.4/62.6; C&D/Cars.com GC 5.8
      lengthIn: 189.5,
      widthIn: 72.8,
      heightIn: 56.5,
      wheelbaseIn: 107.3,
      frontTrackIn: 62.4,
      rearTrackIn: 62.6,
      groundClearanceIn: 5.8,
      curbWeightKg: lbsToKg(3242),
      // KBB LX-S Coupe GVWR 4299 lb
      grossVehicleWeightKg: lbsToKg(4299),
      cargoVolumeLiters: cuFtToLiters(13.4),
      seatingCapacity: 5,
    },
    performance: {
      // Honda: 185 hp / 181 lb-ft; 0–60 ~7.5 typical 2.4 CVT coupe
      // estimate: quarter-mile ~16.0 from 7.5 0–60 (≈ +8.5 vs C&D 1.5T delta)
      // estimate: top speed ~125 mph gov class (9th-gen I4 Accords ~120–130)
      powerHp: 185,
      torqueLbFt: 181,
      zeroToSixtySeconds: 7.5,
      quarterMileSeconds: 16.0,
      topSpeedMph: 125,
    },
    // EPA id 37625 — 27/36/30 (sedan+coupe certification; Honda coupe Monroney often 26/34/29)
    fuelEconomy: { cityMpg: 27, highwayMpg: 36, combinedMpg: 30 },
    // Honda Newsroom LX-S CVT $24,875 excl. destination
    baseMsrpCents: 2_487_500,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "honda-news-2017-accord-coupe-specs",
    priceSourceSlug: "honda-news-2017-accord-coupe-msrp",
  },
  {
    slug: "2017-honda-accord-coupe-touring-v6-us",
    name: "Accord Coupe Touring V6",
    modelSlug: "honda-accord-coupe",
    modelName: "Accord Coupe",
    year: 2017,
    generationCode: "9th-CT-FL",
    generationLabel: "Ninth generation coupe facelift (CT)",
    generationStartYear: 2016,
    bodyStyle: "COUPE",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f47/Honda-Accord-IX-Coupe-facelift-2016.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-accord-ix-coupe-facelift-2015-generation-6809",
    imageAlt: "2017 Honda Accord Coupe Touring V6 exterior",
    imageCredit: "auto-data.net",
    epaId: "37623",
    engine: {
      slug: "honda-j35y1-278",
      name: "3.5L V6 (J35Y1)",
      code: "J35Y1",
      fuelType: "PETROL",
      displacementCc: 3471,
      cylinderCount: 6,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "honda-6at-accord-v6",
      name: "6-speed automatic with Sport mode",
      type: "AUTOMATIC",
      gearCount: 6,
    },
    dimensions: {
      // Honda Newsroom coupe: track 62.4/62.6; C&D GC 5.8
      lengthIn: 189.5,
      widthIn: 72.8,
      heightIn: 56.5,
      wheelbaseIn: 107.3,
      frontTrackIn: 62.4,
      rearTrackIn: 62.6,
      groundClearanceIn: 5.8,
      curbWeightKg: lbsToKg(3582),
      // Touring V6 automatic coupe GVWR listings ~4475 lb
      grossVehicleWeightKg: lbsToKg(4475),
      cargoVolumeLiters: cuFtToLiters(13.4),
      seatingCapacity: 5,
    },
    performance: {
      // Honda: 278 hp / 252 lb-ft (6AT); 0–60 ~5.8 C&D V6 coupe band
      // C&D 2016 Touring V6 auto (same powertrain): 1/4-mile 14.2; top 127 mph
      powerHp: 278,
      torqueLbFt: 252,
      zeroToSixtySeconds: 5.8,
      quarterMileSeconds: 14.2,
      topSpeedMph: 127,
    },
    // EPA id 37623 — coupe V6 6AT 21/32/24
    fuelEconomy: { cityMpg: 21, highwayMpg: 32, combinedMpg: 24 },
    // Honda Newsroom Touring 6AT $34,375 excl. destination
    baseMsrpCents: 3_437_500,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "honda-news-2017-accord-coupe-specs",
    priceSourceSlug: "honda-news-2017-accord-coupe-msrp",
  },
  {
    slug: "2014-honda-accord-plug-in-us",
    name: "Accord Plug-In Hybrid",
    modelSlug: "honda-accord-plug-in",
    modelName: "Accord Plug-In",
    year: 2014,
    generationCode: "CR5",
    generationLabel: "Ninth generation plug-in hybrid (CR5)",
    generationStartYear: 2014,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Honda_Accord_Plug-in_Hybrid_rear_-_Tokyo_Motor_Show_2013.jpg/1280px-Honda_Accord_Plug-in_Hybrid_rear_-_Tokyo_Motor_Show_2013.jpg",
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:Honda_Accord_Plug-in_Hybrid_rear_-_Tokyo_Motor_Show_2013.jpg",
    imageAlt: "2014 Honda Accord Plug-In Hybrid sedan exterior",
    imageCredit: "Wikimedia Commons",
    epaId: "33557",
    engine: {
      slug: "honda-lfa1-phev-196",
      name: "2.0L Inline-4 plug-in hybrid (two-motor)",
      code: "LFA1-PHEV",
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 1993,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "PHEV two-motor; 6.7 kWh Li-Ion; 196 hp combined",
    },
    transmission: {
      slug: "honda-ecvt-phev-accord",
      name: "Electronic CVT (e-CVT / two-motor)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Honda Newsroom PHEV: track 62.4/62.7; C&D/iSeeCars GC 5.8
      lengthIn: 192.2,
      widthIn: 72.8,
      heightIn: 57.5,
      wheelbaseIn: 109.3,
      frontTrackIn: 62.4,
      rearTrackIn: 62.7,
      groundClearanceIn: 5.8,
      curbWeightKg: lbsToKg(3799),
      // KBB: curb 3799 + payload 850 → GVWR 4649 lb
      grossVehicleWeightKg: lbsToKg(4649),
      cargoVolumeLiters: cuFtToLiters(9.0),
      seatingCapacity: 5,
    },
    performance: {
      // Honda: 196 hp combined; 0–60 ~7.6 published tests
      // C&D instrumented: 1/4-mile 16.1; top speed (gov ltd) 114 mph
      powerHp: 196,
      torqueLbFt: 226,
      zeroToSixtySeconds: 7.6,
      quarterMileSeconds: 16.1,
      topSpeedMph: 114,
    },
    // EPA id 33557 — gas 47/46/46; EV range 13 mi (MPGe 124/105/115 on electricity)
    fuelEconomy: {
      cityMpg: 47,
      highwayMpg: 46,
      combinedMpg: 46,
      electricRangeMiles: 13,
    },
    // PR: $39,780 excl. $790 destination
    baseMsrpCents: 3_978_000,
    destinationCents: 79_000,
    specSourceSlug: "honda-news-2014-accord-plug-in-specs",
    priceSourceSlug: "honda-pr-2014-accord-plug-in-msrp",
  },
];

const STATIC_SKIPPED = [
  "MY2026 Accord: prefer MY2025 — Honda Newsroom + EPA fully sourced for 2025; 2026 EPA/MSRP incomplete at seed time",
  "2025 Accord SE gas: same 1.5T/CVT EPA 48504 as LX — appearance/equipment package; LX covers gas sedan",
  "2025 Accord EX-L / Sport-L Hybrid: Sport + Touring Hybrid cover hybrid EPA bands (48497 Sport/Touring; EX-L uses 48505 51/44/48)",
  "Accord Hybrid mid years (2015, 2017–2024): scope is current MY2025 hybrid trims only",
  "Accord Sedan mid years (2015–2024): scope is current MY2025 gas LX only",
  "Accord Coupe 2015–2016: final US year MY2017 seeded (LX-S + Touring V6)",
  "MY2015 Accord Plug-In: EPA has no 2015 PHEV entry — US Plug-In was MY2014 only (seeded 2014-honda-accord-plug-in-us)",
  "2017 Coupe EX / EX-L I4 / EX-L V6: LX-S + Touring V6 cover I4 CVT and V6 6AT powertrains",
];

const MODEL_DEFS: { slug: ModelSlug; name: string }[] = [
  { slug: "honda-accord", name: "Accord" },
  { slug: "honda-accord-coupe", name: "Accord Coupe" },
  { slug: "honda-accord-plug-in", name: "Accord Plug-In" },
];

export async function seedHondaAccord(
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

  const destinationSource = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE.slug,
    title: DESTINATION_SOURCE.title,
    publisher: DESTINATION_SOURCE.publisher,
    url: DESTINATION_SOURCE.url,
    type: DESTINATION_SOURCE.type,
  });

  const destinationSource2014 = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE_2014_PHEV.slug,
    title: DESTINATION_SOURCE_2014_PHEV.title,
    publisher: DESTINATION_SOURCE_2014_PHEV.publisher,
    url: DESTINATION_SOURCE_2014_PHEV.url,
    type: DESTINATION_SOURCE_2014_PHEV.type,
  });

  const specSources = new Map<string, { id: string }>();
  for (const sourceData of SPEC_SOURCES) {
    const source = await upsertCatalogueSource(prisma, {
      slug: sourceData.slug,
      title: sourceData.title,
      publisher: sourceData.publisher,
      url: sourceData.url,
      type: sourceData.slug.startsWith("honda-news") ||
        sourceData.slug.startsWith("honda-pr")
        ? "PRESS_RELEASE"
        : sourceData.slug.startsWith("epa-")
          ? "GOVERNMENT"
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
      type: sourceData.slug.startsWith("honda-")
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
        slug: `image-${trim.slug}`,
        title: `${trim.name} exterior (${trim.imageCredit})`,
        pageUrl: trim.imagePageUrl,
        publisher: trim.imageCredit,
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

      const fuelEconomyData = {
        cityMpg: trim.fuelEconomy.cityMpg,
        highwayMpg: trim.fuelEconomy.highwayMpg,
        combinedMpg: trim.fuelEconomy.combinedMpg,
        electricRangeMiles: trim.fuelEconomy.electricRangeMiles ?? null,
      };

      const destSourceForTrim =
        trim.destinationCents === 79_000
          ? destinationSource2014
          : destinationSource;

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
              amountCents: trim.destinationCents,
              currency: "USD",
              effectiveAt: pricingDate,
            },
            update: {
              amountCents: trim.destinationCents,
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

      const citationTasks = [
        upsertCitation(
          prisma,
          specSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "Power, torque, 0–60 mph, quarter-mile, and top speed",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Exterior dimensions, track, ground clearance, curb/GVWR, cargo",
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
          destSourceForTrim.id,
          "VehiclePrice",
          destination.id,
          "amountCents",
          `Destination and handling $${(trim.destinationCents / 100).toFixed(0)}`,
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

      // Instrumented quarter-mile / top-speed citations (C&D) where applicable
      const perfCitationSlug =
        trim.slug === "2025-honda-accord-lx-us" ||
        trim.slug === "2025-honda-accord-sport-hybrid-us" ||
        trim.slug === "2025-honda-accord-touring-hybrid-us"
          ? "caranddriver-2025-honda-accord"
          : trim.slug === "2017-honda-accord-coupe-touring-v6-us"
            ? "caranddriver-2016-accord-coupe-v6-test"
            : trim.slug === "2014-honda-accord-plug-in-us"
              ? "caranddriver-2014-accord-plug-in-test"
              : null;
      if (perfCitationSlug) {
        const perfSource = specSources.get(perfCitationSlug);
        if (perfSource) {
          citationTasks.push(
            upsertCitation(
              prisma,
              perfSource.id,
              "VehiclePerformance",
              performance.id,
              "quarterMileSeconds",
              "Instrumented quarter-mile and governor-limited top speed",
            ),
          );
        }
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
