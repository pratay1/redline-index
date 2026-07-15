/**
 * Mercedes-Benz A-Class + CLA seed module (US market).
 * Prefer MY 2025 CLA; A-Class exited the US after MY 2022 — candidates skipped.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 */
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
const CUFT_TO_L = 28.316846592;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: "mercedes-cla";
  year: 2025;
  generationCode: "C118";
  bodyStyle: "COUPE";
  drivetrain: "FWD" | "AWD";
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
  epaId: string;
  engine: {
    slug: string;
    name: string;
    code: string;
    displacementCc: number;
    cylinderCount: number;
    induction: string;
    electrification: string | null;
  };
  transmission: {
    slug: string;
    name: string;
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
  };
  fuelEconomy: {
    cityMpg: number;
    highwayMpg: number;
    combinedMpg: number;
  };
  /** BASE_MSRP in cents (excludes destination). */
  baseMsrpCents: number;
  mbusaSpecUrl: string;
};

/**
 * Unique MBUSA exterior assets (lifestyle / dimension stills).
 * Different color and/or angle per trim; no interiors.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2025-mercedes-cla-250-us",
    name: "CLA 250",
    modelSlug: "mercedes-cla",
    year: 2025,
    generationCode: "C118",
    bodyStyle: "COUPE",
    drivetrain: "FWD",
    // Lifestyle exterior (road/angle unique vs other trims).
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/cla-class/dimensions/2026-CLA250-COUPE-SFB-DR.png",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/cla/coupe/cla250c",
    imageAlt: "2025 Mercedes-Benz CLA 250 Coupe exterior",
    epaId: "47929",
    engine: {
      slug: "mercedes-m260-cla-250",
      name: "M260 2.0L Inline-4 turbo mild hybrid",
      code: "M260",
      displacementCc: 1991,
      cylinderCount: 4,
      induction: "Turbocharger",
      electrification: "48V mild hybrid",
    },
    transmission: {
      slug: "mercedes-8g-dct",
      name: "8G-DCT 8-speed dual-clutch automatic",
    },
    dimensions: {
      lengthIn: 184.6,
      widthIn: 72.0,
      heightIn: 56.7,
      wheelbaseIn: 107.4,
      frontTrackIn: 63.5,
      rearTrackIn: 63.1,
      curbWeightKg: lbsToKg(3494),
      cargoVolumeLiters: cuFtToLiters(11.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 221,
      torqueLbFt: 258,
      zeroToSixtySeconds: 6.3,
    },
    fuelEconomy: { cityMpg: 26, highwayMpg: 36, combinedMpg: 30 },
    // EPA / Cars.com base excl. $1,150 destination ($45,550 - $1,150).
    baseMsrpCents: 4440000,
    mbusaSpecUrl: "https://www.mbusa.com/en/vehicles/model/cla/coupe/cla250c",
  },
  {
    slug: "2025-mercedes-cla-250-4matic-us",
    name: "CLA 250 4MATIC",
    modelSlug: "mercedes-cla",
    year: 2025,
    generationCode: "C118",
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/cla-class/dimensions/2026-CLA250-4M-COUPE-SFB-DR.png",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/cla/coupe/cla250c4",
    imageAlt: "2025 Mercedes-Benz CLA 250 4MATIC Coupe exterior",
    epaId: "47928",
    engine: {
      slug: "mercedes-m260-cla-250",
      name: "M260 2.0L Inline-4 turbo mild hybrid",
      code: "M260",
      displacementCc: 1991,
      cylinderCount: 4,
      induction: "Turbocharger",
      electrification: "48V mild hybrid",
    },
    transmission: {
      slug: "mercedes-8g-dct",
      name: "8G-DCT 8-speed dual-clutch automatic",
    },
    dimensions: {
      lengthIn: 184.6,
      widthIn: 72.0,
      heightIn: 56.7,
      wheelbaseIn: 107.4,
      frontTrackIn: 63.5,
      rearTrackIn: 63.1,
      curbWeightKg: lbsToKg(3616),
      cargoVolumeLiters: cuFtToLiters(11.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 221,
      torqueLbFt: 258,
      zeroToSixtySeconds: 6.3,
    },
    fuelEconomy: { cityMpg: 25, highwayMpg: 34, combinedMpg: 29 },
    baseMsrpCents: 4640000,
    mbusaSpecUrl: "https://www.mbusa.com/en/vehicles/model/cla/coupe/cla250c4",
  },
  {
    slug: "2025-mercedes-amg-cla-35-us",
    name: "AMG CLA 35",
    modelSlug: "mercedes-cla",
    year: 2025,
    generationCode: "C118",
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    // Official MBUSA dimension still — front/rear exterior, silver AMG.
    imageUrl:
      "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/cla-class/dimensions/2026-AMG-CLA35-4M-COUPE-SFB-DR.png",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/cla/coupe/cla35c4",
    imageAlt: "2025 Mercedes-AMG CLA 35 Coupe exterior",
    epaId: "47927",
    engine: {
      slug: "mercedes-m260-amg-cla-35",
      name: "AMG-enhanced M260 2.0L Inline-4 turbo mild hybrid",
      code: "M260-AMG35",
      displacementCc: 1991,
      cylinderCount: 4,
      induction: "Turbocharger",
      electrification: "48V mild hybrid",
    },
    transmission: {
      slug: "mercedes-amg-speedshift-dct-8",
      name: "AMG SPEEDSHIFT DCT 8-speed dual-clutch",
    },
    dimensions: {
      lengthIn: 184.8,
      widthIn: 73.1,
      heightIn: 55.3,
      wheelbaseIn: 107.4,
      frontTrackIn: 63.4,
      rearTrackIn: 63.3,
      curbWeightKg: lbsToKg(3703),
      cargoVolumeLiters: cuFtToLiters(11.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 302,
      torqueLbFt: 295,
      zeroToSixtySeconds: 4.8,
    },
    fuelEconomy: { cityMpg: 22, highwayMpg: 29, combinedMpg: 25 },
    baseMsrpCents: 5610000,
    mbusaSpecUrl: "https://www.mbusa.com/en/vehicles/model/cla/coupe/cla35c4",
  },
  {
    slug: "2025-mercedes-amg-cla-45-s-us",
    name: "AMG CLA 45 S",
    modelSlug: "mercedes-cla",
    year: 2025,
    generationCode: "C118",
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    // Official MBUSA side-profile dimension still — different angle from CLA 35 SFB.
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/cla-class/dimensions/2026-AMG-CLA45S-4M-COUPE-SFB-DR.png",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/cla/coupe/cla45c4s",
    imageAlt: "2025 Mercedes-AMG CLA 45 S Coupe exterior",
    epaId: "47994",
    engine: {
      slug: "mercedes-m139-amg-cla-45-s",
      name: "AMG M139 2.0L Inline-4 turbo",
      code: "M139",
      displacementCc: 1991,
      cylinderCount: 4,
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "mercedes-amg-speedshift-dct-8",
      name: "AMG SPEEDSHIFT DCT 8-speed dual-clutch",
    },
    dimensions: {
      lengthIn: 184.8,
      widthIn: 73.1,
      heightIn: 55.4,
      wheelbaseIn: 107.4,
      frontTrackIn: 63.6,
      rearTrackIn: 62.9,
      curbWeightKg: lbsToKg(3791),
      cargoVolumeLiters: cuFtToLiters(11.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 416,
      torqueLbFt: 369,
      zeroToSixtySeconds: 4.0,
    },
    fuelEconomy: { cityMpg: 20, highwayMpg: 28, combinedMpg: 23 },
    // Cars.com MY2025 $68,200 incl. destination → $67,050 base.
    baseMsrpCents: 6705000,
    mbusaSpecUrl: "https://www.mbusa.com/en/vehicles/model/cla/coupe/cla45c4s",
  },
];

const STATIC_SKIPPED = [
  "A 180: EU-only; no US EPA listing",
  "A 200: EU-only; no US EPA listing",
  "A 220: US A-Class discontinued after MY 2022; no MY 2025 US EPA",
  "A 220 4MATIC: US A-Class discontinued after MY 2022; no MY 2025 US EPA",
  "A 250: EU-only; not offered in US",
  "A 250 4MATIC: EU-only; not offered in US",
  "AMG A 35: US A-Class discontinued after MY 2022; no MY 2025 US EPA",
  "AMG A 45: EU-only; not offered in US",
  "AMG A 45 S: EU-only; not offered in US",
  "CLA 180: EU-only; no US EPA listing",
  "CLA 200: EU-only; no US EPA listing",
  "CLA 220: EU-only; no US EPA listing",
  "AMG CLA 45: US MY 2025 offers AMG CLA 45 S only (EPA id 47994)",
];

const DESTINATION_SOURCE = {
  slug: "cars-com-2025-mercedes-cla-pricing",
  title: "2025 Mercedes-Benz CLA Carries Over, Starts at $45,550 (Cars.com)",
  url: "https://www.cars.com/articles/2025-mercedes-benz-cla-carries-over-starts-at-45550-491926/",
  type: "THIRD_PARTY" as const,
  publisher: "Cars.com",
};

export async function seedMercedesACla(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  // Hierarchy roots — A-Class retained for catalogue even though US trims are skipped.
  await prisma.vehicleModel.upsert({
    where: { slug: "mercedes-a-class" },
    create: {
      manufacturerId,
      name: "A-Class",
      slug: "mercedes-a-class",
    },
    update: { manufacturerId, name: "A-Class" },
  });

  const claModel = await prisma.vehicleModel.upsert({
    where: { slug: "mercedes-cla" },
    create: {
      manufacturerId,
      name: "CLA",
      slug: "mercedes-cla",
    },
    update: { manufacturerId, name: "CLA" },
  });

  const generation = await prisma.vehicleGeneration.upsert({
    where: {
      modelId_code: { modelId: claModel.id, code: "C118" },
    },
    create: {
      modelId: claModel.id,
      code: "C118",
      displayName: "Second generation (C118)",
      startYear: 2020,
    },
    update: {
      displayName: "Second generation (C118)",
      startYear: 2020,
    },
  });

  const modelYear = await prisma.modelYear.upsert({
    where: {
      generationId_year: { generationId: generation.id, year: 2025 },
    },
    create: { generationId: generation.id, year: 2025 },
    update: {},
  });

  const destinationSource = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE.slug,
    title: DESTINATION_SOURCE.title,
    publisher: DESTINATION_SOURCE.publisher,
    url: DESTINATION_SOURCE.url,
    type: DESTINATION_SOURCE.type,
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
        slug: `mbusa-image-${trim.slug}`,
        title: `${trim.name} exterior (MBUSA)`,
        pageUrl: trim.imagePageUrl,
      });

      const engine = await ensureMercedesEngine(prisma, {
        manufacturerId,
        slug: trim.engine.slug,
        name: trim.engine.name,
        code: trim.engine.code,
        fuelType: "PETROL",
        displacementCc: trim.engine.displacementCc,
        cylinderCount: trim.engine.cylinderCount,
        configuration: "Inline",
        induction: trim.engine.induction,
        electrification: trim.engine.electrification,
      });

      const transmission = await prisma.transmission.upsert({
        where: { slug: trim.transmission.slug },
        create: {
          slug: trim.transmission.slug,
          name: trim.transmission.name,
          type: "DUAL_CLUTCH",
          gearCount: 8,
        },
        update: {
          name: trim.transmission.name,
          type: "DUAL_CLUTCH",
          gearCount: 8,
        },
      });

      const specSource = await upsertCatalogueSource(prisma, {
        slug: `mbusa-${trim.slug}-specs`,
        title: `Mercedes-Benz USA — ${trim.name} specifications`,
        publisher: "Mercedes-Benz USA",
        url: trim.mbusaSpecUrl,
        type: "MANUFACTURER",
      });

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-2025-${trim.slug}`,
        title: `EPA Fuel Economy — 2025 Mercedes-Benz ${trim.name}`,
        publisher: "U.S. EPA",
        url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
        type: "GOVERNMENT",
      });

      const priceSource = await upsertCatalogueSource(prisma, {
        slug: DESTINATION_SOURCE.slug,
        title: DESTINATION_SOURCE.title,
        publisher: DESTINATION_SOURCE.publisher,
        url: DESTINATION_SOURCE.url,
        type: DESTINATION_SOURCE.type,
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
          description: `2025 Mercedes-Benz ${trim.name} Coupe (US).`,
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
          description: `2025 Mercedes-Benz ${trim.name} Coupe (US).`,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
      });

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
              amountCents: MERCEDES_DESTINATION_CENTS,
              currency: "USD",
              effectiveAt: pricingDate,
            },
            update: {
              amountCents: MERCEDES_DESTINATION_CENTS,
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
              credit: "Mercedes-Benz USA",
              position: 0,
            },
            update: {
              sourceId: imageSource.id,
              url: imageUrl,
              alt: trim.imageAlt,
              credit: "Mercedes-Benz USA",
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
          "MBUSA power, torque, and 0–60 mph",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "MBUSA exterior dimensions, tracks, curb weight, cargo",
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
          `Destination and handling $${(MERCEDES_DESTINATION_CENTS / 100).toFixed(0)}`,
        ),
        upsertCitation(
          prisma,
          imageSource.id,
          "VehicleImage",
          image.id,
          "url",
          "MBUSA exterior asset",
        ),
      ]);

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
