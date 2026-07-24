/**
 * Honda compact / specialty US catalogue seed (final or current MY only).
 * Fit EX (MY2020 final), CR-Z EX-L (MY2016 final), Insight Touring (MY2022 final),
 * Prelude Hybrid (MY2026), Clarity Fuel Cell (MY2021), Clarity Electric (MY2019),
 * Clarity Plug-In Hybrid Touring (MY2021). Prefer unique auto-data.net exteriors.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Exterior images (unique):
 * - https://www.auto-data.net/images/f0/honda-fit-iii-facelift-2017.jpg
 * - https://www.auto-data.net/images/f105/Honda-CR-Z.jpg
 * - https://www.auto-data.net/images/f8/Honda-Insight-III.jpg
 * - https://www.auto-data.net/images/f31/Honda-Prelude-VI-BF1.jpg
 * - https://www.auto-data.net/images/f113/Honda-Clarity.jpg
 * - https://www.auto-data.net/images/f37/Honda-Clarity.jpg
 * - https://www.auto-data.net/images/f76/Honda-Clarity.jpg
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
  | "honda-fit"
  | "honda-cr-z"
  | "honda-insight"
  | "honda-prelude"
  | "honda-clarity";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: string;
  year: number;
  generationCode: string;
  generationLabel: string;
  generationStartYear: number;
  bodyStyle: "SEDAN" | "HATCHBACK" | "COUPE";
  drivetrain: Drivetrain;
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
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
    type: "AUTOMATIC" | "CVT" | "MANUAL" | "SINGLE_SPEED";
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
    slug: "honda-news-2020-fit-specs",
    title: "2020 Fit Specifications & Features (Honda Newsroom)",
    url: "https://hondanews.com/en-US/releases/release-8d5607d2f6277f4e7a40db546208348b-2020-fit-specifications-features",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-news-2020-fit-pricing",
    title: "Fun and Affordable 2020 Honda Fit Arrives in Showrooms (PR Newswire / Honda)",
    url: "https://www.prnewswire.com/news-releases/fun-and-affordable-2020-honda-fit-arrives-in-showrooms-300974498.html",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-news-2016-cr-z-pricing",
    title: "2016 Honda CR-Z Pricing and EPA Data (Honda Newsroom)",
    url: "https://hondanews.com/en-US/releases/release-b28daa1fd5704bf4b9f75be5a255df92-2016-honda-cr-z-pricing-and-epa-data",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-news-2016-cr-z-specs",
    title: "2016 CR-Z Specifications & Features (Honda Newsroom)",
    url: "https://hondanews.com/en-US/releases/release-21b90b8424924c90a2627ed7d08aa499-2016-cr-z-specifications-features",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-news-2022-insight-specs",
    title: "2022 Honda Insight Specs & Features (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-53541be6030b25a47a2899aba1122785-2022-honda-insight-specs-features",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-news-2022-insight-pricing",
    title: "2022 Honda Insight Pricing and EPA Ratings (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-0d5860f808ceb9825e662cfd5a01cd3d-2022-honda-insight-pricing-and-epa-ratings-50322",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "motortrend-2022-honda-insight",
    title: "2022 Honda Insight Review (MotorTrend)",
    url: "https://www.motortrend.com/cars/honda/insight",
    publisher: "MotorTrend",
  },
  {
    slug: "honda-infocenter-2026-prelude-specs",
    title: "2026 Prelude Specifications (Honda Information Center)",
    url: "https://www.hondainfocenter.com/2026/prelude/feature-guide/specifications/",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "caranddriver-2026-honda-prelude-test",
    title: "2026 Honda Prelude Hybrid Instrumented Test (Car and Driver)",
    url: "https://www.caranddriver.com/reviews/a70478945/2026-honda-prelude-hybrid-test/",
    publisher: "Car and Driver",
  },
  {
    slug: "honda-news-2021-clarity-fc-pricing",
    title: "2021 Honda Clarity Fuel Cell Pricing and EPA Ratings (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-4f88c507e72a4e7630685979cb04d0ab-2021-honda-clarity-fuel-cell-pricing-and-epa-ratings",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-news-2021-clarity-fc-specs",
    title: "2021 Clarity Fuel Cell Specifications & Features (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-4f88c507e72a4e7630685979cb04f2cb-2021-clarity-fuel-cell-specifications-features",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-news-2019-clarity-electric-pricing",
    title: "2019 Honda Clarity Electric Pricing and EPA Ratings (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-807c080220275f828905387c4f0054b4-2019-honda-clarity-electric-pricing-and-epa-ratings-172020",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "greencarscompare-clarity-electric",
    title: "Honda Clarity Electric (2017–2019) specs (Green Cars Compare)",
    url: "https://greencarscompare.com/car/honda-clarity-electric-2018/",
    publisher: "Green Cars Compare",
  },
  {
    slug: "honda-news-2021-clarity-phev-pricing",
    title: "2021 Honda Clarity Plug-In Hybrid Pricing and EPA Ratings (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-f8bfb43dd94cc82c09a8314c0b014ca1-2021-honda-clarity-plug-in-hybrid-pricing-and-epa-ratings",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-news-2021-clarity-phev-specs",
    title: "2021 Clarity Plug-In Hybrid Specifications & Features (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-fe66e016dfbb4b20cd0267afd104885a-2021-clarity-plug-in-hybrid-specifications-features",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "caranddriver-2018-clarity-phev-test",
    title: "Tested: 2018 Honda Clarity Plug-In Hybrid (Car and Driver)",
    url: "https://www.caranddriver.com/reviews/a21969240/2018-honda-clarity-plug-in-hybrid-test-review/",
    publisher: "Car and Driver",
  },
  {
    slug: "carbuzz-2016-cr-z",
    title: "2016 Honda CR-Z Pricing, Photos & Specs (CarBuzz)",
    url: "https://carbuzz.com/cars/honda/cr-z/2016/",
    publisher: "CarBuzz",
  },
  {
    slug: "motormatchup-2020-fit-ex",
    title: "2020 Honda Fit EX 0–60 (Motor Matchup)",
    url: "https://www.motormatchup.com/catalog/Honda/Fit/2020/EX-4DR-Hatchback",
    publisher: "Motor Matchup",
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "honda-news-2020-fit-msrp",
    title: "2020 Honda Fit EX MSRP $19,060 excl. destination (Honda / PR Newswire)",
    url: "https://www.prnewswire.com/news-releases/fun-and-affordable-2020-honda-fit-arrives-in-showrooms-300974498.html",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-news-2016-cr-z-msrp",
    title: "2016 Honda CR-Z EX-L w/ Navigation CVT MSRP $25,090 (Honda Newsroom)",
    url: "https://hondanews.com/en-US/releases/release-b28daa1fd5704bf4b9f75be5a255df92-2016-honda-cr-z-pricing-and-epa-data",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-news-2022-insight-msrp",
    title: "2022 Honda Insight Touring MSRP $29,790 (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-0d5860f808ceb9825e662cfd5a01cd3d-2022-honda-insight-pricing-and-epa-ratings-50322",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-com-2026-prelude-msrp",
    title: "2026 Honda Prelude Hybrid starting MSRP $42,000 (Honda)",
    url: "https://automobiles.honda.com/prelude",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-news-2021-clarity-fc-msrp",
    title: "2021 Honda Clarity Fuel Cell MSRP $58,490 (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-4f88c507e72a4e7630685979cb04d0ab-2021-honda-clarity-fuel-cell-pricing-and-epa-ratings",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-news-2019-clarity-electric-msrp",
    title: "2019 Honda Clarity Electric MSRP $36,620 (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-807c080220275f828905387c4f0054b4-2019-honda-clarity-electric-pricing-and-epa-ratings-172020",
    publisher: "American Honda Motor Co.",
  },
  {
    slug: "honda-news-2021-clarity-phev-msrp",
    title: "2021 Honda Clarity Plug-In Hybrid Touring MSRP $36,600 (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-f8bfb43dd94cc82c09a8314c0b014ca1-2021-honda-clarity-plug-in-hybrid-pricing-and-epa-ratings",
    publisher: "American Honda Motor Co.",
  },
] as const;

const DESTINATION_SOURCE = {
  slug: "honda-us-destination-passenger-car",
  title:
    "Honda US destination & handling — passenger cars ($1,195 catalogue default)",
  url: "https://automobiles.honda.com/",
  type: "MANUFACTURER" as const,
  publisher: "American Honda Motor Co.",
};

/**
 * Representative US trims only. EPA ids from fueleconomy.gov REST menu/options
 * and Find.do SBS pages. MSRP excludes destination unless noted in source.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2020-honda-fit-ex-us",
    name: "Fit EX",
    modelSlug: "honda-fit",
    modelName: "Fit",
    year: 2020,
    generationCode: "GK5",
    generationLabel: "Third generation facelift (GK5) US",
    generationStartYear: 2015,
    bodyStyle: "HATCHBACK",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f0/honda-fit-iii-facelift-2017.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-fit-iii-facelift-2017-generation-6278",
    imageAlt: "2020 Honda Fit EX hatchback exterior",
    // EPA Auto (AV-S7) EX powertrain — 31/36/33
    epaId: "42395",
    engine: {
      slug: "honda-l15b7-fit",
      name: "1.5L Inline-4 (L15B7)",
      code: "L15B7",
      fuelType: "PETROL",
      displacementCc: 1498,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "honda-cvt-avs7-fit",
      name: "CVT (AV-S7)",
      type: "CVT",
      gearCount: 7,
    },
    dimensions: {
      // Honda Newsroom 2020 Fit EX; JD Power ground clearance; iSeeCars GVWR
      lengthIn: 161.4,
      widthIn: 67.0,
      heightIn: 60.0,
      wheelbaseIn: 99.6,
      frontTrackIn: 58.3,
      rearTrackIn: 58.0,
      groundClearanceIn: 4.4,
      curbWeightKg: lbsToKg(2644),
      grossVehicleWeightKg: lbsToKg(3505),
      cargoVolumeLiters: cuFtToLiters(16.6),
      seatingCapacity: 5,
    },
    performance: {
      // Honda: 128 hp / 113 lb-ft CVT; Motor Matchup 0–60 8.8s
      powerHp: 128,
      torqueLbFt: 113,
      zeroToSixtySeconds: 8.8,
      // estimate: Motor Matchup simulation aligned with ~8.8s 0–60
      quarterMileSeconds: 16.6,
      // estimate: Motor Matchup simulated top speed
      topSpeedMph: 126,
    },
    fuelEconomy: { cityMpg: 31, highwayMpg: 36, combinedMpg: 33 },
    // Honda PR: EX CVT $19,060 excl. $930 destination
    baseMsrpCents: 1_906_000,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "honda-news-2020-fit-specs",
    priceSourceSlug: "honda-news-2020-fit-msrp",
  },
  {
    slug: "2016-honda-cr-z-ex-l-us",
    name: "CR-Z EX-L",
    modelSlug: "honda-cr-z",
    modelName: "CR-Z",
    year: 2016,
    generationCode: "ZF1",
    generationLabel: "First generation facelift (ZF1) US",
    generationStartYear: 2011,
    bodyStyle: "COUPE",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f105/Honda-CR-Z.jpg",
    imagePageUrl: "https://www.auto-data.net/en/honda-cr-z-generation-3838",
    imageAlt: "2016 Honda CR-Z EX-L sport hybrid coupe exterior",
    // EPA Auto (AV-S7) CVT hybrid — API 35/38/36
    epaId: "37094",
    engine: {
      slug: "honda-lea-ima-crz",
      name: "1.5L Inline-4 IMA hybrid (LEA)",
      code: "LEA-IMA",
      fuelType: "HYBRID",
      displacementCc: 1497,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "IMA lithium-ion hybrid (130 hp combined)",
    },
    transmission: {
      slug: "honda-cvt-avs7-crz",
      name: "CVT with paddle shifters (AV-S7)",
      type: "CVT",
      gearCount: 7,
    },
    dimensions: {
      // Honda / Carfolio US CR-Z EX-L CVT; AutoTK/AutoFiles ground clearance + GVWR
      lengthIn: 161.5,
      widthIn: 68.5,
      heightIn: 54.9,
      wheelbaseIn: 95.9,
      frontTrackIn: 59.6,
      rearTrackIn: 59.5,
      groundClearanceIn: 5.6,
      curbWeightKg: lbsToKg(2747),
      grossVehicleWeightKg: lbsToKg(3164),
      cargoVolumeLiters: cuFtToLiters(25.1),
      seatingCapacity: 4,
    },
    performance: {
      // Honda: 130 hp combined; 127 lb-ft CVT; CarBuzz ~9.0s 0–60
      powerHp: 130,
      torqueLbFt: 127,
      zeroToSixtySeconds: 9.0,
      // estimate: Motor Matchup EX-L CVT ~16.37s from ~9s 0–60
      quarterMileSeconds: 16.4,
      topSpeedMph: 129,
    },
    fuelEconomy: { cityMpg: 35, highwayMpg: 38, combinedMpg: 36 },
    // Honda: EX-L w/ Navigation CVT $25,090
    baseMsrpCents: 2_509_000,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "honda-news-2016-cr-z-specs",
    priceSourceSlug: "honda-news-2016-cr-z-msrp",
  },
  {
    slug: "2022-honda-insight-touring-us",
    name: "Insight Touring",
    modelSlug: "honda-insight",
    modelName: "Insight",
    year: 2022,
    generationCode: "ZE4",
    generationLabel: "Third generation (ZE4) US",
    generationStartYear: 2019,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f8/Honda-Insight-III.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-insight-iii-generation-6650",
    imageAlt: "2022 Honda Insight Touring hybrid sedan exterior",
    // EPA Insight Touring — 51/45/48
    epaId: "43947",
    engine: {
      slug: "honda-leb-h4-insight",
      name: "1.5L Inline-4 two-motor hybrid",
      code: "LEB-H4",
      fuelType: "HYBRID",
      displacementCc: 1498,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "Two-motor hybrid (151.5 hp combined)",
    },
    transmission: {
      slug: "honda-ecvt-insight",
      name: "Electronic CVT (e-CVT)",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Honda Newsroom 2022 Insight Touring; CarHP ground clearance; AutoFiles GVWR
      lengthIn: 183.6,
      widthIn: 71.6,
      heightIn: 55.6,
      wheelbaseIn: 106.3,
      frontTrackIn: 60.9,
      rearTrackIn: 61.6,
      groundClearanceIn: 5.1,
      curbWeightKg: lbsToKg(3078),
      grossVehicleWeightKg: lbsToKg(4034),
      cargoVolumeLiters: cuFtToLiters(14.7),
      seatingCapacity: 5,
    },
    performance: {
      // Honda: 151.5 hp system; motor 197 lb-ft; MotorTrend 0–60 7.3s
      powerHp: 152,
      torqueLbFt: 197,
      zeroToSixtySeconds: 7.3,
      // Car and Driver instrumented (same ZE4 powertrain): 16.2s @ 86 mph; 114 mph governor
      quarterMileSeconds: 16.2,
      topSpeedMph: 114,
    },
    fuelEconomy: { cityMpg: 51, highwayMpg: 45, combinedMpg: 48 },
    // Honda: Touring $29,790
    baseMsrpCents: 2_979_000,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "honda-news-2022-insight-specs",
    priceSourceSlug: "honda-news-2022-insight-msrp",
  },
  {
    slug: "2026-honda-prelude-hybrid-us",
    name: "Prelude Hybrid",
    modelSlug: "honda-prelude",
    modelName: "Prelude",
    year: 2026,
    generationCode: "BF1",
    generationLabel: "Sixth generation (BF1)",
    generationStartYear: 2026,
    bodyStyle: "COUPE",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f31/Honda-Prelude-VI-BF1.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-prelude-vi-bf1-generation-10786",
    imageAlt: "2026 Honda Prelude Hybrid coupe exterior",
    // EPA 2026 Prelude — 46/41/44
    epaId: "50046",
    engine: {
      slug: "honda-lfc1-prelude",
      name: "2.0L Inline-4 two-motor hybrid",
      code: "LFC1-PRELUDE",
      fuelType: "HYBRID",
      displacementCc: 1993,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "Two-motor hybrid (200 hp combined)",
    },
    transmission: {
      slug: "honda-ecvt-prelude",
      name: "Electronic CVT with Honda S+ Shift",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Honda Info Center / Honda CA 2026 Prelude (115.31 mm clearance; 1850 kg GVWR)
      lengthIn: 178.4,
      widthIn: 74.0,
      heightIn: 53.4,
      wheelbaseIn: 102.6,
      frontTrackIn: 64.0,
      rearTrackIn: 63.5,
      groundClearanceIn: 4.5,
      curbWeightKg: lbsToKg(3261),
      grossVehicleWeightKg: 1850,
      cargoVolumeLiters: cuFtToLiters(15.1),
      seatingCapacity: 4,
    },
    performance: {
      // Honda: 200 hp / 232 lb-ft; Car and Driver 0–60 6.5s, 1/4-mi 15.3s, top 116 mph (mfr)
      powerHp: 200,
      torqueLbFt: 232,
      zeroToSixtySeconds: 6.5,
      quarterMileSeconds: 15.3,
      topSpeedMph: 116,
    },
    fuelEconomy: { cityMpg: 46, highwayMpg: 41, combinedMpg: 44 },
    // Honda.com: Hybrid $42,000
    baseMsrpCents: 4_200_000,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "honda-infocenter-2026-prelude-specs",
    priceSourceSlug: "honda-com-2026-prelude-msrp",
  },
  {
    slug: "2021-honda-clarity-fuel-cell-us",
    name: "Clarity Fuel Cell",
    modelSlug: "honda-clarity",
    modelName: "Clarity",
    year: 2021,
    generationCode: "FC1",
    generationLabel: "Clarity platform (FC1) Fuel Cell",
    generationStartYear: 2017,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f113/Honda-Clarity.jpg",
    imagePageUrl: "https://www.auto-data.net/en/honda-clarity-generation-6267",
    imageAlt: "2021 Honda Clarity Fuel Cell hydrogen sedan exterior",
    // EPA Clarity FCV — 68/67/68 MPGe, 360 mi range
    epaId: "47539",
    engine: {
      slug: "honda-clarity-fc-stack",
      name: "Hydrogen fuel cell + electric motor",
      code: "FC-STACK-CLARITY",
      fuelType: "HYDROGEN",
      displacementCc: null,
      cylinderCount: null,
      configuration: "Fuel cell",
      induction: null,
      electrification: "FCEV / PEMFC (174 hp)",
    },
    transmission: {
      slug: "honda-single-speed-clarity-fc",
      name: "Single-speed direct drive",
      type: "SINGLE_SPEED",
      gearCount: 1,
    },
    dimensions: {
      // Honda Newsroom 2021 Clarity Fuel Cell; AutoFiles GVWR 5038 lbs; ground clearance 5.3 in
      lengthIn: 192.7,
      widthIn: 73.9,
      heightIn: 58.2,
      wheelbaseIn: 108.3,
      frontTrackIn: 62.2,
      rearTrackIn: 62.5,
      groundClearanceIn: 5.3,
      curbWeightKg: lbsToKg(4134),
      grossVehicleWeightKg: lbsToKg(5038),
      cargoVolumeLiters: cuFtToLiters(11.8),
      seatingCapacity: 5,
    },
    performance: {
      // Honda: 174 hp / 221 lb-ft; ~7.8–8.1s family tests — use 8.1s conservative instrumented
      powerHp: 174,
      torqueLbFt: 221,
      zeroToSixtySeconds: 8.1,
      // estimate: secondary listing with ~8.1s 0–60
      quarterMileSeconds: 16.4,
      topSpeedMph: 105,
    },
    fuelEconomy: {
      cityMpg: 68,
      highwayMpg: 67,
      combinedMpg: 68,
      electricRangeMiles: 360,
    },
    // Honda: $58,490 excl. $955 destination
    baseMsrpCents: 5_849_000,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "honda-news-2021-clarity-fc-specs",
    priceSourceSlug: "honda-news-2021-clarity-fc-msrp",
  },
  {
    slug: "2019-honda-clarity-electric-us",
    name: "Clarity Electric",
    modelSlug: "honda-clarity",
    modelName: "Clarity",
    year: 2019,
    generationCode: "FC1-EV",
    generationLabel: "Clarity platform (FC1) Electric",
    generationStartYear: 2017,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f37/Honda-Clarity.jpg",
    imagePageUrl: "https://www.auto-data.net/en/honda-clarity-generation-6267",
    imageAlt: "2019 Honda Clarity Electric sedan exterior",
    // EPA Clarity EV — 126/103/114 MPGe, 89 mi range
    epaId: "41185",
    engine: {
      slug: "honda-clarity-ev-motor",
      name: "AC permanent-magnet synchronous motor (120 kW)",
      code: "CLARITY-EV-120KW",
      fuelType: "ELECTRIC",
      displacementCc: null,
      cylinderCount: null,
      configuration: "Electric",
      induction: null,
      electrification: "BEV 25.5 kWh (161 hp)",
    },
    transmission: {
      slug: "honda-single-speed-clarity-ev",
      name: "Single-speed direct drive",
      type: "SINGLE_SPEED",
      gearCount: 1,
    },
    dimensions: {
      // Same Clarity envelope; KBB/CarConnection curb ~4024 lbs; CarsDirect GVWR 4921 lbs
      lengthIn: 192.7,
      widthIn: 73.9,
      heightIn: 58.2,
      wheelbaseIn: 108.3,
      frontTrackIn: 62.2,
      rearTrackIn: 62.5,
      groundClearanceIn: 5.3,
      curbWeightKg: lbsToKg(4024),
      grossVehicleWeightKg: lbsToKg(4921),
      cargoVolumeLiters: cuFtToLiters(14.5),
      seatingCapacity: 5,
    },
    performance: {
      // Honda/KBB: 161 hp / 221 lb-ft; Green Cars Compare 0–60 9.0s / 100 mph top
      powerHp: 161,
      torqueLbFt: 221,
      zeroToSixtySeconds: 9.0,
      // estimate: from 9.0s 0–60 (same Clarity envelope as PHEV/FC)
      quarterMileSeconds: 16.9,
      topSpeedMph: 100,
    },
    fuelEconomy: {
      cityMpg: 126,
      highwayMpg: 103,
      combinedMpg: 114,
      electricRangeMiles: 89,
    },
    // Honda: $36,620 excl. $955 destination
    baseMsrpCents: 3_662_000,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "greencarscompare-clarity-electric",
    priceSourceSlug: "honda-news-2019-clarity-electric-msrp",
  },
  {
    slug: "2021-honda-clarity-plug-in-hybrid-touring-us",
    name: "Clarity Plug-In Hybrid Touring",
    modelSlug: "honda-clarity",
    modelName: "Clarity",
    year: 2021,
    generationCode: "FC1-PHEV",
    generationLabel: "Clarity platform (FC1) Plug-In Hybrid",
    generationStartYear: 2018,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f76/Honda-Clarity.jpg",
    imagePageUrl: "https://www.auto-data.net/en/honda-clarity-generation-6267",
    imageAlt: "2021 Honda Clarity Plug-In Hybrid Touring exterior",
    // EPA PHEV — gas 44/40/42; EV range ~47 mi (Honda EPA rating)
    epaId: "42983",
    engine: {
      slug: "honda-clarity-phev-15",
      name: "1.5L Inline-4 plug-in hybrid",
      code: "LEB-PHEV-CLARITY",
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 1498,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Naturally aspirated",
      electrification: "PHEV 17 kWh (212 hp combined)",
    },
    transmission: {
      slug: "honda-ecvt-clarity-phev",
      name: "Electronic CVT / fixed single-speed hybrid",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Honda Newsroom 2021 Clarity PHEV Touring; AutoTK GVWR 4965 lbs; 5.3 in clearance
      lengthIn: 192.7,
      widthIn: 73.9,
      heightIn: 58.2,
      wheelbaseIn: 108.3,
      frontTrackIn: 62.2,
      rearTrackIn: 62.5,
      groundClearanceIn: 5.3,
      curbWeightKg: lbsToKg(4059),
      grossVehicleWeightKg: lbsToKg(4965),
      cargoVolumeLiters: cuFtToLiters(15.5),
      seatingCapacity: 5,
    },
    performance: {
      // Honda: 212 hp system; C&D Touring 0–60 7.7s, 1/4-mi 16.2s, 101 mph governor
      powerHp: 212,
      torqueLbFt: 232,
      zeroToSixtySeconds: 7.7,
      quarterMileSeconds: 16.2,
      topSpeedMph: 101,
    },
    fuelEconomy: {
      cityMpg: 44,
      highwayMpg: 40,
      combinedMpg: 42,
      electricRangeMiles: 47,
    },
    // Honda: Touring $36,600 excl. destination
    baseMsrpCents: 3_660_000,
    destinationCents: HONDA_DESTINATION_CENTS.passengerCar,
    specSourceSlug: "honda-news-2021-clarity-phev-specs",
    priceSourceSlug: "honda-news-2021-clarity-phev-msrp",
  },
];

const STATIC_SKIPPED = [
  "FCX Clarity MY2015: no US model year — EPA last lists 2014 Honda FCX Clarity (id 47522); production/lease program ended before MY2015 retail",
  "FCX Clarity MY2014 final: US lease-only (~$600/mo incl. fuel/insurance) with no published retail BASE_MSRP — cannot complete priced PUBLISHED record",
  "2020 Fit LX / Sport / EX-L: EX CVT seeded as representative final-year mid trim",
  "2016 CR-Z LX / EX / manual: EX-L CVT seeded as final-year upper trim",
  "2022 Insight EX: Touring seeded as final-year upper hybrid trim (EPA 43947)",
  "2026 Prelude Hybrid Two-Tone: mono Hybrid $42,000 seeded; Two-Tone is appearance package only",
  "2021 Clarity Plug-In Hybrid (base): Touring seeded as final-year upper PHEV trim",
  "Clarity Fuel Cell / Electric / PHEV earlier years: final US MY only per scope rule",
];

const MODEL_DEFS: { slug: ModelSlug; name: string }[] = [
  { slug: "honda-fit", name: "Fit" },
  { slug: "honda-cr-z", name: "CR-Z" },
  { slug: "honda-insight", name: "Insight" },
  { slug: "honda-prelude", name: "Prelude" },
  { slug: "honda-clarity", name: "Clarity" },
];

export async function seedHondaCompact(
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

  const specSources = new Map<string, { id: string }>();
  for (const sourceData of SPEC_SOURCES) {
    const source = await upsertCatalogueSource(prisma, {
      slug: sourceData.slug,
      title: sourceData.title,
      publisher: sourceData.publisher,
      url: sourceData.url,
      type: sourceData.slug.startsWith("honda-news") ||
        sourceData.slug.startsWith("honda-infocenter") ||
        sourceData.slug.startsWith("honda-com")
        ? sourceData.slug.includes("pricing") || sourceData.slug.includes("msrp")
          ? "PRESS_RELEASE"
          : sourceData.slug.startsWith("honda-news")
            ? "PRESS_RELEASE"
            : "MANUFACTURER"
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
      type:
        sourceData.slug.startsWith("honda-") ? "PRESS_RELEASE" : "THIRD_PARTY",
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
        slug: `autodata-image-${trim.slug}`,
        title: `${trim.name} exterior (auto-data.net)`,
        pageUrl: trim.imagePageUrl,
        publisher: "auto-data.net",
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

      const citationTasks = [
        upsertCitation(
          prisma,
          specSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "Power, torque, 0–60, quarter-mile, and top speed",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Exterior dimensions, ground clearance, curb/GVWR, cargo",
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
          `Destination and handling $${(trim.destinationCents / 100).toFixed(0)}`,
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
