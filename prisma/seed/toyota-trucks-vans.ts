/**
 * Toyota Tacoma + Tundra + Sienna seed module (US market, MY2025).
 * Tacoma: SR5 + Trailhunter (4th-gen N300).
 * Tundra: SR5 + Limited Hybrid (3rd-gen XK70).
 * Sienna: LE + XSE Hybrid (4th-gen XL40; all current US Siennas are hybrid).
 * Prefer unique auto-data.net exteriors (encyCARpedia CDN often blocked).
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Exterior images (unique):
 * - https://www.auto-data.net/images/f71/Toyota-Tacoma-IV-Double-Cab.jpg
 * - https://www.auto-data.net/images/f40/Toyota-Tacoma-IV-Double-Cab.jpg
 * - https://www.auto-data.net/images/f68/Toyota-Tundra-III-CrewMax-Short-Bed.jpg
 * - https://www.auto-data.net/images/f35/Toyota-Tundra-III-CrewMax-Short-Bed.jpg
 * - https://www.auto-data.net/images/f55/Toyota-Sienna-IV.jpg
 * - https://www.auto-data.net/images/f36/Toyota-Sienna-IV.jpg
 */
import type { FuelType } from "../../src/generated/prisma/client";
import {
  TOYOTA_DPH_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureToyotaEngine,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./toyota-shared";

const LBS_TO_KG = 0.45359237;
const CUFT_TO_L = 28.316846592;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

type ModelSlug = "toyota-tacoma" | "toyota-tundra" | "toyota-sienna";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: "Tacoma" | "Tundra" | "Sienna";
  year: number;
  generationCode: string;
  generationLabel: string;
  generationStartYear: number;
  bodyStyle: "TRUCK" | "VAN";
  drivetrain: "RWD" | "FWD" | "AWD" | "FOUR_WD";
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
    type: "AUTOMATIC" | "CVT";
    gearCount: number;
  };
  dimensions: {
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    wheelbaseIn: number;
    curbWeightKg: number;
    cargoVolumeLiters?: number | null;
    seatingCapacity: number;
  };
  performance: {
    powerHp: number;
    torqueLbFt: number;
    zeroToSixtySeconds: number;
  };
  fuelEconomy: {
    cityMpg: number;
    highwayMpg: number;
    combinedMpg: number;
  };
  /** BASE_MSRP in cents (excludes destination). */
  baseMsrpCents: number;
  destinationCents: number;
  specSourceSlug: string;
  priceSourceSlug: string;
};

const SPEC_SOURCES = [
  {
    slug: "edmunds-2025-toyota-tacoma-trims",
    title: "2025 Toyota Tacoma Trims Comparison (Edmunds)",
    url: "https://www.edmunds.com/toyota/tacoma/2025/trims/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-tacoma-sr5",
    title: "2025 Toyota Tacoma SR5 Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/tacoma/2025/st-402062639/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-tacoma-trailhunter",
    title: "2025 Toyota Tacoma Trailhunter Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/tacoma/2025/st-402062649/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2025-toyota-tacoma",
    title: "2025 Toyota Tacoma Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/tacoma-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "caranddriver-2025-toyota-tacoma-hybrid",
    title: "2025 Toyota Tacoma Hybrid Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/tacoma-hybrid-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "edmunds-2025-toyota-tundra-trims",
    title: "2025 Toyota Tundra Trims Comparison (Edmunds)",
    url: "https://www.edmunds.com/toyota/tundra/2025/trims/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-tundra-limited-hybrid",
    title: "2025 Toyota Tundra Hybrid Limited Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/tundra/2025/hybrid/st-402049279/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2025-toyota-tundra",
    title: "2025 Toyota Tundra Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/tundra-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "caranddriver-2025-toyota-tundra-hybrid",
    title: "2025 Toyota Tundra Hybrid Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/tundra-hybrid-2025",
    publisher: "Car and Driver",
  },
  {
    slug: "edmunds-2025-toyota-sienna-trims",
    title: "2025 Toyota Sienna Minivan Trims Comparison (Edmunds)",
    url: "https://www.edmunds.com/toyota/sienna/2025/trims/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-sienna-xse",
    title: "2025 Toyota Sienna XSE 7-Passenger Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/toyota/sienna/2025/st-402053232/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "caranddriver-2025-toyota-sienna",
    title: "2025 Toyota Sienna Hybrid Review, Pricing, and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/toyota/sienna-2025",
    publisher: "Car and Driver",
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "edmunds-2025-toyota-tacoma-sr5-price",
    title: "2025 Toyota Tacoma SR5 (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/tacoma/2025/trims/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-tacoma-trailhunter-price",
    title: "2025 Toyota Tacoma Trailhunter (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/tacoma/2025/trims/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-tundra-sr5-price",
    title: "2025 Toyota Tundra SR5 (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/tundra/2025/trims/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-tundra-limited-hybrid-price",
    title: "2025 Toyota Tundra Hybrid Limited (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/tundra/2025/hybrid/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-sienna-le-price",
    title: "2025 Toyota Sienna LE (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/sienna/2025/trims/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-toyota-sienna-xse-price",
    title: "2025 Toyota Sienna XSE (Edmunds) — MSRP excludes destination",
    url: "https://www.edmunds.com/toyota/sienna/2025/trims/",
    publisher: "Edmunds",
  },
] as const;

/** Aug 2024+ Toyota DPH schedule (cited sticker values in toyota-shared). */
const DESTINATION_SOURCE = {
  slug: "toyota-us-dph-aug-2024",
  title:
    "Toyota USA Delivery, Processing & Handling — Tacoma $1,495 / Tundra $1,945 / Sienna $1,450 (Aug 2024+ schedule)",
  url: "https://www.hublertoyota.com/2025-toyota-tacoma.html",
  type: "MANUFACTURER" as const,
  publisher: "Toyota / dealer MSRP footnote",
};

/**
 * Sourced US trims only. Skip incomplete / out-of-scope variants via STATIC_SKIPPED.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2025-toyota-tacoma-sr5-us",
    name: "Tacoma SR5",
    modelSlug: "toyota-tacoma",
    modelName: "Tacoma",
    year: 2025,
    generationCode: "N300",
    generationLabel: "Fourth generation (N300)",
    generationStartYear: 2024,
    bodyStyle: "TRUCK",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f71/Toyota-Tacoma-IV-Double-Cab.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-tacoma-iv-double-cab-generation-9824",
    imageAlt: "2025 Toyota Tacoma SR5 exterior",
    // EPA: Tacoma SR5/Sport/PreRunner 2WD — 21/26/23
    epaId: "48871",
    engine: {
      slug: "toyota-t24a-fts-iforce-278",
      name: "2.4L I4 turbo i-FORCE",
      code: "T24A-FTS",
      fuelType: "PETROL",
      displacementCc: 2393,
      cylinderCount: 4,
      configuration: "I",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "toyota-ect-i-8",
      name: "8-speed ECT-i automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // Edmunds trims: Double Cab short bed SR5
      lengthIn: 213.0,
      widthIn: 76.9,
      heightIn: 73.8,
      wheelbaseIn: 131.9,
      curbWeightKg: lbsToKg(4265),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 278,
      torqueLbFt: 317,
      // C&D instrumented 278-hp RWD Tacoma (TRD PreRunner)
      zeroToSixtySeconds: 7.0,
    },
    fuelEconomy: { cityMpg: 21, highwayMpg: 26, combinedMpg: 23 },
    // Edmunds trims: SR5 starting MSRP
    baseMsrpCents: 3_888_500,
    destinationCents: TOYOTA_DPH_CENTS.smallPickup,
    specSourceSlug: "edmunds-2025-toyota-tacoma-sr5",
    priceSourceSlug: "edmunds-2025-toyota-tacoma-sr5-price",
  },
  {
    slug: "2025-toyota-tacoma-trailhunter-us",
    name: "Tacoma Trailhunter",
    modelSlug: "toyota-tacoma",
    modelName: "Tacoma",
    year: 2025,
    generationCode: "N300",
    generationLabel: "Fourth generation (N300)",
    generationStartYear: 2024,
    bodyStyle: "TRUCK",
    drivetrain: "FOUR_WD",
    imageUrl: "https://www.auto-data.net/images/f40/Toyota-Tacoma-IV-Double-Cab.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-tacoma-iv-double-cab-generation-9824",
    imageAlt: "2025 Toyota Tacoma Trailhunter exterior",
    // EPA: Tacoma Hybrid 4WD — 22/24/23
    epaId: "48902",
    engine: {
      slug: "toyota-t24a-fts-iforce-max-326",
      name: "2.4L I4 turbo i-FORCE MAX hybrid",
      code: "T24A-FTS-IFORCE-MAX",
      fuelType: "HYBRID",
      displacementCc: 2393,
      cylinderCount: 4,
      configuration: "I",
      induction: "Turbocharger",
      electrification: "i-FORCE MAX mild/full hybrid (combined 326 hp)",
    },
    transmission: {
      slug: "toyota-ect-i-8",
      name: "8-speed ECT-i automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // Edmunds trims: Trailhunter Double Cab
      lengthIn: 214.2,
      widthIn: 79.9,
      heightIn: 75.8,
      wheelbaseIn: 131.9,
      curbWeightKg: lbsToKg(5360),
      seatingCapacity: 5,
    },
    performance: {
      // Toyota / C&D: i-FORCE MAX combined 326 hp, 465 lb-ft
      powerHp: 326,
      torqueLbFt: 465,
      // C&D hybrid Tacoma TRD Pro / Trailhunter class ~7.7
      zeroToSixtySeconds: 7.7,
    },
    fuelEconomy: { cityMpg: 22, highwayMpg: 24, combinedMpg: 23 },
    baseMsrpCents: 6_473_000,
    destinationCents: TOYOTA_DPH_CENTS.smallPickup,
    specSourceSlug: "edmunds-2025-toyota-tacoma-trailhunter",
    priceSourceSlug: "edmunds-2025-toyota-tacoma-trailhunter-price",
  },
  {
    slug: "2025-toyota-tundra-sr5-us",
    name: "Tundra SR5",
    modelSlug: "toyota-tundra",
    modelName: "Tundra",
    year: 2025,
    generationCode: "XK70",
    generationLabel: "Third generation (XK70)",
    generationStartYear: 2022,
    bodyStyle: "TRUCK",
    drivetrain: "RWD",
    imageUrl:
      "https://www.auto-data.net/images/f68/Toyota-Tundra-III-CrewMax-Short-Bed.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-tundra-iii-crewmax-short-bed-generation-8683",
    imageAlt: "2025 Toyota Tundra SR5 exterior",
    // EPA: Tundra 2WD gas — 18/23/20
    epaId: "48510",
    engine: {
      slug: "toyota-v35a-fts-iforce-389",
      name: "3.4L V6 twin-turbo i-FORCE",
      code: "V35A-FTS",
      fuelType: "PETROL",
      displacementCc: 3445,
      cylinderCount: 6,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "toyota-ect-i-10",
      name: "10-speed ECT-i automatic",
      type: "AUTOMATIC",
      gearCount: 10,
    },
    dimensions: {
      // Edmunds CrewMax short-bed family
      lengthIn: 233.6,
      widthIn: 80.2,
      heightIn: 78.0,
      wheelbaseIn: 145.7,
      curbWeightKg: lbsToKg(5160),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 389,
      torqueLbFt: 479,
      // C&D instrumented Tundra Limited 4x4 same 389-hp V6
      zeroToSixtySeconds: 6.1,
    },
    fuelEconomy: { cityMpg: 18, highwayMpg: 23, combinedMpg: 20 },
    // Edmunds CrewMax SR5 starting MSRP
    baseMsrpCents: 5_010_500,
    destinationCents: TOYOTA_DPH_CENTS.largePickupSuv,
    specSourceSlug: "edmunds-2025-toyota-tundra-trims",
    priceSourceSlug: "edmunds-2025-toyota-tundra-sr5-price",
  },
  {
    slug: "2025-toyota-tundra-limited-hybrid-us",
    name: "Tundra Limited Hybrid",
    modelSlug: "toyota-tundra",
    modelName: "Tundra",
    year: 2025,
    generationCode: "XK70",
    generationLabel: "Third generation (XK70)",
    generationStartYear: 2022,
    bodyStyle: "TRUCK",
    drivetrain: "RWD",
    imageUrl:
      "https://www.auto-data.net/images/f35/Toyota-Tundra-III-CrewMax-Short-Bed.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/toyota-tundra-iii-crewmax-short-bed-generation-8683",
    imageAlt: "2025 Toyota Tundra Limited Hybrid exterior",
    // EPA: Tundra 2WD hybrid — 20/24/22
    epaId: "48512",
    engine: {
      slug: "toyota-v35a-fts-iforce-max-437",
      name: "3.4L V6 twin-turbo i-FORCE MAX hybrid",
      code: "V35A-FTS-IFORCE-MAX",
      fuelType: "HYBRID",
      displacementCc: 3445,
      cylinderCount: 6,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: "i-FORCE MAX hybrid (combined 437 hp)",
    },
    transmission: {
      slug: "toyota-ect-i-10",
      name: "10-speed ECT-i automatic",
      type: "AUTOMATIC",
      gearCount: 10,
    },
    dimensions: {
      lengthIn: 233.6,
      widthIn: 80.2,
      heightIn: 78.0,
      wheelbaseIn: 145.7,
      // Edmunds Limited Hybrid RWD curb
      curbWeightKg: lbsToKg(5710),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 437,
      torqueLbFt: 583,
      // C&D long-term / instrumented Tundra hybrid ~5.6–5.7
      zeroToSixtySeconds: 5.6,
    },
    fuelEconomy: { cityMpg: 20, highwayMpg: 24, combinedMpg: 22 },
    // Edmunds Hybrid Limited CrewMax RWD 5.5' bed
    baseMsrpCents: 5_800_500,
    destinationCents: TOYOTA_DPH_CENTS.largePickupSuv,
    specSourceSlug: "edmunds-2025-toyota-tundra-limited-hybrid",
    priceSourceSlug: "edmunds-2025-toyota-tundra-limited-hybrid-price",
  },
  {
    slug: "2025-toyota-sienna-le-us",
    name: "Sienna LE",
    modelSlug: "toyota-sienna",
    modelName: "Sienna",
    year: 2025,
    generationCode: "XL40",
    generationLabel: "Fourth generation (XL40)",
    generationStartYear: 2021,
    bodyStyle: "VAN",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f55/Toyota-Sienna-IV.jpg",
    imagePageUrl: "https://www.auto-data.net/en/toyota-sienna-iv-generation-7974",
    imageAlt: "2025 Toyota Sienna LE exterior",
    // EPA: Sienna 2WD — 36/36/36
    epaId: "48904",
    engine: {
      slug: "toyota-a25a-fxs-hybrid-245",
      name: "2.5L I4 hybrid",
      code: "A25A-FXS",
      fuelType: "HYBRID",
      displacementCc: 2487,
      cylinderCount: 4,
      configuration: "I",
      induction: null,
      electrification: "Toyota Hybrid System (combined 245 hp)",
    },
    transmission: {
      slug: "toyota-e-cvt",
      name: "e-CVT",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Edmunds LE 8-Passenger
      lengthIn: 203.7,
      widthIn: 78.5,
      heightIn: 68.5,
      wheelbaseIn: 120.5,
      curbWeightKg: lbsToKg(4610),
      cargoVolumeLiters: cuFtToLiters(33.5),
      seatingCapacity: 8,
    },
    performance: {
      powerHp: 245,
      // ICE torque (C&D / manufacturer); system combined HP is the headline figure
      torqueLbFt: 176,
      // C&D instrumented Sienna Hybrid (AWD Limited same 245-hp system)
      zeroToSixtySeconds: 7.5,
    },
    fuelEconomy: { cityMpg: 36, highwayMpg: 36, combinedMpg: 36 },
    baseMsrpCents: 3_918_500,
    destinationCents: TOYOTA_DPH_CENTS.midSuvVan,
    specSourceSlug: "edmunds-2025-toyota-sienna-trims",
    priceSourceSlug: "edmunds-2025-toyota-sienna-le-price",
  },
  {
    slug: "2025-toyota-sienna-xse-us",
    name: "Sienna XSE",
    modelSlug: "toyota-sienna",
    modelName: "Sienna",
    year: 2025,
    generationCode: "XL40",
    generationLabel: "Fourth generation (XL40)",
    generationStartYear: 2021,
    bodyStyle: "VAN",
    drivetrain: "FWD",
    imageUrl: "https://www.auto-data.net/images/f36/Toyota-Sienna-IV.jpg",
    imagePageUrl: "https://www.auto-data.net/en/toyota-sienna-iv-generation-7974",
    imageAlt: "2025 Toyota Sienna XSE exterior",
    epaId: "48904",
    engine: {
      slug: "toyota-a25a-fxs-hybrid-245",
      name: "2.5L I4 hybrid",
      code: "A25A-FXS",
      fuelType: "HYBRID",
      displacementCc: 2487,
      cylinderCount: 4,
      configuration: "I",
      induction: null,
      electrification: "Toyota Hybrid System (combined 245 hp)",
    },
    transmission: {
      slug: "toyota-e-cvt",
      name: "e-CVT",
      type: "CVT",
      gearCount: 1,
    },
    dimensions: {
      // Edmunds XSE 7-Passenger
      lengthIn: 204.1,
      widthIn: 78.5,
      heightIn: 68.5,
      wheelbaseIn: 120.5,
      curbWeightKg: lbsToKg(4675),
      cargoVolumeLiters: cuFtToLiters(33.5),
      seatingCapacity: 7,
    },
    performance: {
      powerHp: 245,
      torqueLbFt: 176,
      zeroToSixtySeconds: 7.5,
    },
    fuelEconomy: { cityMpg: 36, highwayMpg: 36, combinedMpg: 36 },
    baseMsrpCents: 4_664_000,
    destinationCents: TOYOTA_DPH_CENTS.midSuvVan,
    specSourceSlug: "edmunds-2025-toyota-sienna-xse",
    priceSourceSlug: "edmunds-2025-toyota-sienna-xse-price",
  },
];

const STATIC_SKIPPED = [
  "Tacoma TRD Off-Road / TRD Pro / Limited: Trailhunter seeded as MY2025 new-gen off-road hybrid flagship alongside SR5",
  "Tundra TRD Pro Hybrid / Platinum / Capstone: Limited Hybrid seeded as hybrid representative alongside SR5",
  "Sienna Platinum / XLE / Woodland: XSE seeded as sporty mid trim alongside LE; Platinum deferred",
  "Pre-2025 Tacoma III / Tundra II / Sienna III: catalogue focuses on current MY2025 US trims",
];

const MODEL_DEFS: {
  slug: ModelSlug;
  name: "Tacoma" | "Tundra" | "Sienna";
}[] = [
  { slug: "toyota-tacoma", name: "Tacoma" },
  { slug: "toyota-tundra", name: "Tundra" },
  { slug: "toyota-sienna", name: "Sienna" },
];

export async function seedToyotaTrucksVans(
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
      type: "THIRD_PARTY",
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
      type: "THIRD_PARTY",
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

      const engine = await ensureToyotaEngine(prisma, {
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
        title: `EPA Fuel Economy — ${trim.year} Toyota ${trim.name}`,
        publisher: "U.S. EPA",
        url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
        type: "GOVERNMENT",
      });

      const bodyLabel = trim.bodyStyle === "TRUCK" ? "pickup" : "minivan";
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
          description: `${trim.year} Toyota ${trim.name} ${bodyLabel} (US).`,
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
          description: `${trim.year} Toyota ${trim.name} ${bodyLabel} (US).`,
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
        curbWeightKg: trim.dimensions.curbWeightKg,
        cargoVolumeLiters: trim.dimensions.cargoVolumeLiters ?? null,
        seatingCapacity: trim.dimensions.seatingCapacity,
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

      await Promise.all([
        upsertCitation(
          prisma,
          specSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "Power, torque, and 0–60 mph",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Exterior dimensions, curb weight, cargo",
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
