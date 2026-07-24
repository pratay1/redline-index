/**
 * Honda Odyssey + Ridgeline seed module (US market, MY2025).
 * Odyssey: EX-L + Touring (5th gen RL; VAN).
 * Ridgeline: Sport + TrailSport (2nd gen; TRUCK AWD).
 * Prefer unique auto-data.net exteriors. Idempotent — does not wire into prisma/seed.ts.
 *
 * Exterior images (unique):
 * - https://www.auto-data.net/images/f69/Honda-Odyssey-V-facelift-2024.jpg
 * - https://www.auto-data.net/images/f51/Honda-Odyssey-V-facelift-2024.jpg
 * - https://www.auto-data.net/images/f100/Honda-Ridgeline-II-facelift-2021.jpg
 * - https://www.auto-data.net/images/f90/Honda-Ridgeline-II-facelift-2021.jpg
 */
import type { FuelType } from "../../src/generated/prisma/client";
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

type ModelSlug = "honda-odyssey" | "honda-ridgeline";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: "Odyssey" | "Ridgeline";
  year: number;
  generationCode: string;
  generationLabel: string;
  generationStartYear: number;
  bodyStyle: "VAN" | "TRUCK";
  drivetrain: "FWD" | "AWD";
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
    type: "AUTOMATIC";
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
    /** Behind 3rd row (Odyssey) or truck bed volume (Ridgeline), liters. */
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
  };
  /** BASE_MSRP in cents (excludes destination). */
  baseMsrpCents: number;
  destinationCents: number;
  specSourceSlug: string;
  priceSourceSlug: string;
};

const SPEC_SOURCES = [
  {
    slug: "honda-news-2025-odyssey-specs",
    title: "2025 Honda Odyssey Specifications & Features (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-410d07897fdd63d8043cb72750011124-2025-honda-odyssey-specifications-features",
    publisher: "Honda Newsroom",
  },
  {
    slug: "caranddriver-2025-honda-odyssey-test",
    title: "Tested: 2025 Honda Odyssey Still Carries the VTEC Torch (Car and Driver)",
    url: "https://www.caranddriver.com/reviews/a63150125/2025-honda-odyssey-test/",
    publisher: "Car and Driver",
  },
  {
    slug: "edmunds-2025-honda-odyssey-ex-l",
    title: "2025 Honda Odyssey EX-L Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/honda/odyssey/2025/st-402032588/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-honda-odyssey-touring",
    title: "2025 Honda Odyssey Touring Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/honda/odyssey/2025/st-402040999/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "honda-news-2025-ridgeline-pricing-epa",
    title: "2025 Honda Ridgeline Pricing & EPA Ratings (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-d73d9911716c8277bb60a27897032c2e-2025-honda-ridgeline-pricing-epa-ratings-2025",
    publisher: "Honda Newsroom",
  },
  {
    slug: "caranddriver-2024-honda-ridgeline-trailsport-test",
    title: "Tested: 2024 Honda Ridgeline TrailSport (Car and Driver)",
    url: "https://www.caranddriver.com/reviews/a60400009/2024-honda-ridgeline-trailsport-test/",
    publisher: "Car and Driver",
  },
  {
    slug: "edmunds-2025-honda-ridgeline",
    title: "2025 Honda Ridgeline Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/honda/ridgeline/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "edmunds-2025-honda-ridgeline-trailsport",
    title: "2025 Honda Ridgeline TrailSport Specs & Features (Edmunds)",
    url: "https://www.edmunds.com/honda/ridgeline/2025/st-402043814/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "cars-com-2025-honda-ridgeline-specs",
    title: "2025 Honda Ridgeline Specs, Dimensions & Colors (Cars.com)",
    url: "https://www.cars.com/research/honda-ridgeline-2025/specs/",
    publisher: "Cars.com",
  },
  {
    slug: "honda-news-2025-ridgeline-specs",
    title: "2025 Honda Ridgeline Specifications & Features (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-a6122f36d84ae07a2f9839772b07a95b-2025-honda-ridgeline-specifications-features",
    publisher: "Honda Newsroom",
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "honda-news-2025-odyssey-pricing-epa",
    title: "2025 Honda Odyssey Pricing and EPA Ratings (Honda Newsroom)",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-d73d9911716c8277bb60a27897025927-2025-honda-odyssey-pricing-and-epa-ratings-2025",
    publisher: "Honda Newsroom",
  },
  {
    slug: "honda-news-2025-ridgeline-pricing-epa-price",
    title: "2025 Honda Ridgeline Pricing & EPA Ratings (Honda Newsroom) — MSRP excludes destination",
    url: "https://hondanews.com/en-US/honda-automobiles/releases/release-d73d9911716c8277bb60a27897032c2e-2025-honda-ridgeline-pricing-epa-ratings-2025",
    publisher: "Honda Newsroom",
  },
] as const;

const DESTINATION_SOURCE = {
  slug: "honda-us-destination-jan-2025-odyssey-ridgeline",
  title:
    "Honda USA destination & handling — Odyssey midSuvVan / Ridgeline pickup class (see honda-shared HONDA_DESTINATION_CENTS); Honda Newsroom Jan 2025 footnotes also list $1,450",
  url: "https://hondanews.com/en-US/honda-automobiles/releases/release-d73d9911716c8277bb60a27897025927-2025-honda-odyssey-pricing-and-epa-ratings-2025",
  type: "MANUFACTURER" as const,
  publisher: "Honda Newsroom",
};

/**
 * Sourced US trims only. Mid-years and other trims listed in STATIC_SKIPPED.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2025-honda-odyssey-ex-l-us",
    name: "Odyssey EX-L",
    modelSlug: "honda-odyssey",
    modelName: "Odyssey",
    year: 2025,
    generationCode: "RL",
    generationLabel: "Fifth generation (RL)",
    generationStartYear: 2018,
    bodyStyle: "VAN",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f69/Honda-Odyssey-V-facelift-2024.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-odyssey-v-facelift-2024",
    imageAlt: "2025 Honda Odyssey EX-L exterior",
    // EPA: Odyssey FWD 3.5L 10AT — 19/28/22
    epaId: "48254",
    engine: {
      slug: "honda-j35y6-280",
      name: "3.5L V6 i-VTEC",
      code: "J35Y6",
      fuelType: "PETROL",
      displacementCc: 3471,
      cylinderCount: 6,
      configuration: "V",
      // Honda Newsroom: SOHC i-VTEC V6 (naturally aspirated)
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "honda-10at",
      name: "10-speed automatic",
      type: "AUTOMATIC",
      gearCount: 10,
    },
    dimensions: {
      // Honda Newsroom / Edmunds EX-L
      lengthIn: 205.2,
      widthIn: 78.5,
      heightIn: 69.6,
      wheelbaseIn: 118.1,
      // Honda Newsroom track front/rear
      frontTrackIn: 67.3,
      rearTrackIn: 67.2,
      // C&D / TheCarConnection minimum ground clearance
      groundClearanceIn: 4.5,
      curbWeightKg: lbsToKg(4526),
      // GVWR 6,019 lb (curb + ~1,493 lb payload; Honda Canada 2,730 kg)
      grossVehicleWeightKg: lbsToKg(6019),
      // Honda Newsroom cargo behind 3rd row (standard) 32.8 cu ft
      cargoVolumeLiters: cuFtToLiters(32.8),
      seatingCapacity: 8,
    },
    performance: {
      // Honda Newsroom SAE net
      powerHp: 280,
      torqueLbFt: 262,
      // C&D instrumented 2025 Odyssey
      zeroToSixtySeconds: 6.4,
      quarterMileSeconds: 15.0,
      // C&D top speed (governor limited)
      topSpeedMph: 111,
    },
    fuelEconomy: { cityMpg: 19, highwayMpg: 28, combinedMpg: 22 },
    // Honda Newsroom Jan 2025 MSRP (excludes destination)
    baseMsrpCents: 4_222_000,
    destinationCents: HONDA_DESTINATION_CENTS.midSuvVan,
    specSourceSlug: "honda-news-2025-odyssey-specs",
    priceSourceSlug: "honda-news-2025-odyssey-pricing-epa",
  },
  {
    slug: "2025-honda-odyssey-touring-us",
    name: "Odyssey Touring",
    modelSlug: "honda-odyssey",
    modelName: "Odyssey",
    year: 2025,
    generationCode: "RL",
    generationLabel: "Fifth generation (RL)",
    generationStartYear: 2018,
    bodyStyle: "VAN",
    drivetrain: "FWD",
    imageUrl:
      "https://www.auto-data.net/images/f51/Honda-Odyssey-V-facelift-2024.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-odyssey-v-facelift-2024",
    imageAlt: "2025 Honda Odyssey Touring exterior",
    epaId: "48254",
    engine: {
      slug: "honda-j35y6-280",
      name: "3.5L V6 i-VTEC",
      code: "J35Y6",
      fuelType: "PETROL",
      displacementCc: 3471,
      cylinderCount: 6,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "honda-10at",
      name: "10-speed automatic",
      type: "AUTOMATIC",
      gearCount: 10,
    },
    dimensions: {
      lengthIn: 205.2,
      widthIn: 78.5,
      heightIn: 69.6,
      wheelbaseIn: 118.1,
      frontTrackIn: 67.3,
      rearTrackIn: 67.2,
      groundClearanceIn: 4.5,
      // Edmunds Touring curb
      curbWeightKg: lbsToKg(4559),
      grossVehicleWeightKg: lbsToKg(6019),
      // Honda Newsroom cargo behind 3rd row (standard) 32.8 cu ft
      cargoVolumeLiters: cuFtToLiters(32.8),
      seatingCapacity: 8,
    },
    performance: {
      powerHp: 280,
      torqueLbFt: 262,
      // Same powertrain as C&D-tested 2025 Odyssey
      zeroToSixtySeconds: 6.4,
      quarterMileSeconds: 15.0,
      topSpeedMph: 111,
    },
    fuelEconomy: { cityMpg: 19, highwayMpg: 28, combinedMpg: 22 },
    baseMsrpCents: 4_691_000,
    destinationCents: HONDA_DESTINATION_CENTS.midSuvVan,
    specSourceSlug: "edmunds-2025-honda-odyssey-touring",
    priceSourceSlug: "honda-news-2025-odyssey-pricing-epa",
  },
  {
    slug: "2025-honda-ridgeline-sport-us",
    name: "Ridgeline Sport",
    modelSlug: "honda-ridgeline",
    modelName: "Ridgeline",
    year: 2025,
    generationCode: "2nd-gen",
    generationLabel: "Second generation",
    generationStartYear: 2017,
    bodyStyle: "TRUCK",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f100/Honda-Ridgeline-II-facelift-2021.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-ridgeline-ii-facelift-2021",
    imageAlt: "2025 Honda Ridgeline Sport exterior",
    // EPA: Ridgeline AWD (non-TrailSport) — 18/24/21
    epaId: "48246",
    engine: {
      slug: "honda-j35y6-280",
      name: "3.5L V6 i-VTEC",
      code: "J35Y6",
      fuelType: "PETROL",
      displacementCc: 3471,
      cylinderCount: 6,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "honda-9at",
      name: "9-speed automatic",
      type: "AUTOMATIC",
      gearCount: 9,
    },
    dimensions: {
      // Cars.com / Edmunds Crew Cab family; track/GC/GVWR/bed from Honda Newsroom
      lengthIn: 210.2,
      widthIn: 78.6,
      heightIn: 70.8,
      wheelbaseIn: 125.2,
      frontTrackIn: 66.9,
      rearTrackIn: 66.8,
      groundClearanceIn: 7.64,
      curbWeightKg: lbsToKg(4480),
      grossVehicleWeightKg: lbsToKg(6019),
      // Honda Newsroom truck bed cargo volume 33.9 cu ft (not In-Bed Trunk 7.3)
      cargoVolumeLiters: cuFtToLiters(33.9),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 280,
      torqueLbFt: 262,
      // C&D 2024 TrailSport (same 280-hp V6 AWD); Sport not separately instrumented
      zeroToSixtySeconds: 6.0,
      quarterMileSeconds: 14.6,
      // C&D top speed (governor limited)
      topSpeedMph: 111,
    },
    fuelEconomy: { cityMpg: 18, highwayMpg: 24, combinedMpg: 21 },
    // Honda Newsroom Jan 2025 Sport MSRP
    baseMsrpCents: 4_015_000,
    destinationCents: HONDA_DESTINATION_CENTS.pickup,
    specSourceSlug: "honda-news-2025-ridgeline-specs",
    priceSourceSlug: "honda-news-2025-ridgeline-pricing-epa-price",
  },
  {
    slug: "2025-honda-ridgeline-trailsport-us",
    name: "Ridgeline TrailSport",
    modelSlug: "honda-ridgeline",
    modelName: "Ridgeline",
    year: 2025,
    generationCode: "2nd-gen",
    generationLabel: "Second generation",
    generationStartYear: 2017,
    bodyStyle: "TRUCK",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f90/Honda-Ridgeline-II-facelift-2021.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/honda-ridgeline-ii-facelift-2021",
    imageAlt: "2025 Honda Ridgeline TrailSport exterior",
    // EPA: Ridgeline AWD TrailSport — 18/23/20
    epaId: "48247",
    engine: {
      slug: "honda-j35y6-280",
      name: "3.5L V6 i-VTEC",
      code: "J35Y6",
      fuelType: "PETROL",
      displacementCc: 3471,
      cylinderCount: 6,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "honda-9at",
      name: "9-speed automatic",
      type: "AUTOMATIC",
      gearCount: 9,
    },
    dimensions: {
      lengthIn: 210.2,
      widthIn: 78.6,
      heightIn: 70.8,
      wheelbaseIn: 125.2,
      frontTrackIn: 66.9,
      rearTrackIn: 66.8,
      // Honda Newsroom unladen ground clearance
      groundClearanceIn: 7.64,
      // Edmunds TrailSport curb
      curbWeightKg: lbsToKg(4495),
      grossVehicleWeightKg: lbsToKg(6019),
      // Honda Newsroom truck bed cargo volume 33.9 cu ft
      cargoVolumeLiters: cuFtToLiters(33.9),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 280,
      torqueLbFt: 262,
      // C&D instrumented 2024 TrailSport (carryover powertrain for 2025)
      zeroToSixtySeconds: 6.0,
      quarterMileSeconds: 14.6,
      topSpeedMph: 111,
    },
    fuelEconomy: { cityMpg: 18, highwayMpg: 23, combinedMpg: 20 },
    // Cars.com / Edmunds TrailSport MSRP ($45,380); Honda Newsroom dest-inclusive $46,830
    baseMsrpCents: 4_538_000,
    destinationCents: HONDA_DESTINATION_CENTS.pickup,
    specSourceSlug: "edmunds-2025-honda-ridgeline-trailsport",
    priceSourceSlug: "honda-news-2025-ridgeline-pricing-epa-price",
  },
];

const STATIC_SKIPPED = [
  "Odyssey Sport-L / Elite: EX-L + Touring seeded as MY2025 volume and upper trims",
  "Ridgeline RTL / RTL+ / Black Edition / Sport+: Sport + TrailSport seeded as base AWD and off-road representatives",
  "Odyssey / Ridgeline mid-years 2015–2024 / 2017–2024: catalogue focuses on current MY2025 US trims only",
  "2026 Odyssey / Ridgeline: deferred pending complete EPA + pricing parity vs MY2025",
];

const MODEL_DEFS: {
  slug: ModelSlug;
  name: "Odyssey" | "Ridgeline";
}[] = [
  { slug: "honda-odyssey", name: "Odyssey" },
  { slug: "honda-ridgeline", name: "Ridgeline" },
];

export async function seedHondaVanTruck(
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
      type: "MANUFACTURER",
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
          description: `${trim.year} Honda ${trim.name} ${bodyLabel} (US).`,
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
          description: `${trim.year} Honda ${trim.name} ${bodyLabel} (US).`,
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
        groundClearanceIn: trim.dimensions.groundClearanceIn,
        curbWeightKg: trim.dimensions.curbWeightKg,
        grossVehicleWeightKg: trim.dimensions.grossVehicleWeightKg,
        cargoVolumeLiters: trim.dimensions.cargoVolumeLiters,
        seatingCapacity: trim.dimensions.seatingCapacity,
      };

      const performanceData = {
        powerHp: trim.performance.powerHp,
        torqueLbFt: trim.performance.torqueLbFt,
        zeroToSixtySeconds: trim.performance.zeroToSixtySeconds,
        quarterMileSeconds: trim.performance.quarterMileSeconds,
        topSpeedMph: trim.performance.topSpeedMph,
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
          "Power, torque, 0–60, quarter-mile, and top speed",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Exterior dimensions, track, ground clearance, GVWR, curb weight, cargo",
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
