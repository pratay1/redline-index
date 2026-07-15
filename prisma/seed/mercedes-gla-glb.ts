/**
 * Mercedes-Benz GLA / GLB US MY 2025 seed module.
 * Idempotent — safe to re-run.
 *
 * Seeded US trims: GLA 250, AMG GLA 35, GLB 250, AMG GLB 35.
 * EPA IDs: 47947 (GLA250), 47944 (AMG GLA35), 47948 (GLB250), 47945 (AMG GLB35).
 *
 * Exterior images (unique; never reuse across modules):
 * - https://upload.wikimedia.org/wikipedia/commons/7/70/A_Mercedes-Benz_GLA_250_in_Taichung.jpg
 * - https://upload.wikimedia.org/wikipedia/commons/1/14/2022_Mercedes-Benz_GLA_35_AMG_front.jpg
 * - https://upload.wikimedia.org/wikipedia/commons/b/bf/Mercedes_Benz_GLB_250_4Matic_2022.jpg
 * - https://upload.wikimedia.org/wikipedia/commons/3/38/Mercedes-AMG_GLB_35_4MATIC_(X247)_(2023)_IMG_9649.jpg
 */
import {
  MERCEDES_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureMercedesEngine,
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
  modelSlug: "mercedes-gla" | "mercedes-glb";
  modelName: "GLA" | "GLB";
  generationCode: string;
  generationLabel: string;
  generationStartYear: number;
  drivetrain: "FWD" | "AWD";
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
  epaId: string;
  engine: {
    slug: string;
    name: string;
    code: string;
    fuelType: "PETROL";
    displacementCc: number;
    cylinderCount: number;
    configuration: "Inline";
    induction: string;
    electrification: string | null;
  };
  transmissionSlug: "mercedes-8g-dct" | "mercedes-amg-speedshift-dct-8";
  dimensions: {
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    wheelbaseIn: number;
    frontTrackIn: number;
    rearTrackIn: number;
    groundClearanceIn?: number;
    curbWeightKg?: number;
    cargoVolumeLiters: number;
    seatingCapacity: number;
  };
  performance: {
    powerHp: number;
    torqueLbFt: number;
    zeroToSixtySeconds: number;
    topSpeedMph?: number;
  };
  fuelEconomy: {
    cityMpg: number;
    highwayMpg: number;
    combinedMpg: number;
  };
  baseMsrpCents: number;
  pressSourceSlug: string;
  priceSourceSlug: string;
};

const PRESS_SOURCES = [
  {
    slug: "mbusa-2025-gla-250",
    title: "2025/2026 Mercedes-Benz GLA 250 SUV — MBUSA specifications",
    url: "https://www.mbusa.com/en/vehicles/model/gla/suv/gla250w",
    publisher: "Mercedes-Benz USA",
  },
  {
    slug: "mbusa-2025-amg-gla-35",
    title: "2025/2026 Mercedes-AMG GLA 35 SUV — MBUSA specifications",
    url: "https://www.mbusa.com/en/vehicles/model/gla/suv/gla35w4",
    publisher: "Mercedes-Benz USA",
  },
  {
    slug: "mbusa-2025-glb-250",
    title: "2025/2026 Mercedes-Benz GLB 250 SUV — MBUSA specifications",
    url: "https://www.mbusa.com/en/vehicles/model/glb/suv/glb250w",
    publisher: "Mercedes-Benz USA",
  },
  {
    slug: "mbusa-2025-amg-glb-35",
    title: "2025/2026 Mercedes-AMG GLB 35 SUV — MBUSA specifications",
    url: "https://www.mbusa.com/en/vehicles/model/glb/suv/glb35w4",
    publisher: "Mercedes-Benz USA",
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "edmunds-2025-gla-class-msrp",
    title: "2025 Mercedes-Benz GLA-Class specs & features (base MSRP)",
    url: "https://www.edmunds.com/mercedes-benz/gla-class/2025/features-specs/",
    publisher: "Edmunds",
  },
  {
    slug: "cars-com-2025-glb-pricing",
    title: "How Much Is the 2025 Mercedes-Benz GLB? (Cars.com)",
    url: "https://www.cars.com/articles/how-much-is-the-2025-mercedes-benz-glb-506431/",
    publisher: "Cars.com",
  },
  {
    slug: "edmunds-2025-glb-class-msrp",
    title: "2025 Mercedes-Benz GLB-Class specs & features (base MSRP)",
    url: "https://www.edmunds.com/mercedes-benz/glb-class/2025/features-specs/",
    publisher: "Edmunds",
  },
] as const;

const DESTINATION_SOURCE = {
  slug: "mercedes-us-destination-fee-2025-glb",
  title: "Mercedes-Benz US destination and handling ($1,150)",
  url: "https://www.cars.com/articles/how-much-is-the-2025-mercedes-benz-glb-506431/",
  type: "THIRD_PARTY" as const,
};

/** EU-only / not offered US MY 2025 — documented skips (never invent specs). */
const STATIC_SKIPPED = [
  "gla-180: EU-only; not offered in US MY 2025",
  "gla-200: EU-only; not offered in US MY 2025",
  "gla-220: EU-only; not offered in US MY 2025",
  "amg-gla-45: not offered in US MY 2025 (discontinued for US)",
  "amg-gla-45-s: not offered in US MY 2025 (discontinued for US)",
  "glb-180: EU-only; not offered in US MY 2025",
  "glb-200: EU-only; not offered in US MY 2025",
  "glb-220d: EU diesel; not offered in US MY 2025",
];

const TRIMS: TrimSeed[] = [
  {
    slug: "2025-mercedes-gla-250-us",
    name: "GLA 250",
    modelSlug: "mercedes-gla",
    modelName: "GLA",
    generationCode: "H247",
    generationLabel: "Second generation (H247)",
    generationStartYear: 2021,
    drivetrain: "FWD",
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/gla-class/dimensions/2026-GLA-250-4M-SUV-SFB-DR.png",
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:A_Mercedes-Benz_GLA_250_in_Taichung.jpg",
    imageAlt: "2025 Mercedes-Benz GLA 250 exterior",
    epaId: "47947",
    engine: {
      slug: "mercedes-m260-221",
      name: "2.0L Inline-4 turbo with mild hybrid drive",
      code: "M260",
      fuelType: "PETROL",
      displacementCc: 1991,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: "48V mild hybrid (EQ Boost)",
    },
    transmissionSlug: "mercedes-8g-dct",
    dimensions: {
      lengthIn: 173.6,
      widthIn: 72.2,
      heightIn: 63.5,
      wheelbaseIn: 107.4,
      frontTrackIn: 63.2,
      rearTrackIn: 63.2,
      curbWeightKg: lbsToKg(3604),
      cargoVolumeLiters: cuFtToLiters(15.4),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 221,
      torqueLbFt: 258,
      zeroToSixtySeconds: 6.8,
    },
    fuelEconomy: { cityMpg: 26, highwayMpg: 34, combinedMpg: 29 },
    baseMsrpCents: 4300000,
    pressSourceSlug: "mbusa-2025-gla-250",
    priceSourceSlug: "edmunds-2025-gla-class-msrp",
  },
  {
    slug: "2025-mercedes-amg-gla-35-us",
    name: "AMG GLA 35",
    modelSlug: "mercedes-gla",
    modelName: "GLA",
    generationCode: "H247",
    generationLabel: "Second generation (H247)",
    generationStartYear: 2021,
    drivetrain: "AWD",
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/gla-class/dimensions/2026-GLA-AMG-35-4M-SUV-SFB-DR.png",
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:2022_Mercedes-Benz_GLA_35_AMG_front.jpg",
    imageAlt: "2025 Mercedes-AMG GLA 35 exterior",
    epaId: "47944",
    engine: {
      slug: "mercedes-m139-302",
      name: "AMG-enhanced 2.0L inline-4 turbo with hybrid assist",
      code: "M139",
      fuelType: "PETROL",
      displacementCc: 1991,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: "48V mild hybrid (EQ Boost)",
    },
    transmissionSlug: "mercedes-amg-speedshift-dct-8",
    dimensions: {
      lengthIn: 174.6,
      widthIn: 72.8,
      heightIn: 62.5,
      wheelbaseIn: 107.4,
      frontTrackIn: 63.7,
      rearTrackIn: 62.8,
      curbWeightKg: lbsToKg(3869),
      cargoVolumeLiters: cuFtToLiters(15.4),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 302,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.1,
    },
    fuelEconomy: { cityMpg: 22, highwayMpg: 28, combinedMpg: 24 },
    baseMsrpCents: 5805000,
    pressSourceSlug: "mbusa-2025-amg-gla-35",
    priceSourceSlug: "edmunds-2025-gla-class-msrp",
  },
  {
    slug: "2025-mercedes-glb-250-us",
    name: "GLB 250",
    modelSlug: "mercedes-glb",
    modelName: "GLB",
    generationCode: "X247",
    generationLabel: "First generation (X247)",
    generationStartYear: 2020,
    drivetrain: "FWD",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/bf/Mercedes_Benz_GLB_250_4Matic_2022.jpg",
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:Mercedes_Benz_GLB_250_4Matic_2022.jpg",
    imageAlt: "2025 Mercedes-Benz GLB 250 exterior",
    epaId: "47948",
    engine: {
      slug: "mercedes-m260-221",
      name: "2.0L Inline-4 turbo with mild hybrid drive",
      code: "M260",
      fuelType: "PETROL",
      displacementCc: 1991,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: "48V mild hybrid (EQ Boost)",
    },
    transmissionSlug: "mercedes-8g-dct",
    dimensions: {
      lengthIn: 182.4,
      widthIn: 72.2,
      heightIn: 66.7,
      wheelbaseIn: 111.4,
      frontTrackIn: 62.4,
      rearTrackIn: 62.5,
      groundClearanceIn: 7.9,
      cargoVolumeLiters: cuFtToLiters(22.0),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 221,
      torqueLbFt: 258,
      zeroToSixtySeconds: 6.9,
    },
    fuelEconomy: { cityMpg: 25, highwayMpg: 33, combinedMpg: 28 },
    // Cars.com $46,950 incl. $1,150 destination → $45,800 base
    baseMsrpCents: 4580000,
    pressSourceSlug: "mbusa-2025-glb-250",
    priceSourceSlug: "cars-com-2025-glb-pricing",
  },
  {
    slug: "2025-mercedes-amg-glb-35-us",
    name: "AMG GLB 35",
    modelSlug: "mercedes-glb",
    modelName: "GLB",
    generationCode: "X247",
    generationLabel: "First generation (X247)",
    generationStartYear: 2020,
    drivetrain: "AWD",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/38/Mercedes-AMG_GLB_35_4MATIC_(X247)_(2023)_IMG_9649.jpg",
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:Mercedes-AMG_GLB_35_4MATIC_(X247)_(2023)_IMG_9649.jpg",
    imageAlt: "2025 Mercedes-AMG GLB 35 exterior",
    epaId: "47945",
    engine: {
      slug: "mercedes-m139-302",
      name: "AMG-enhanced 2.0L inline-4 turbo with hybrid assist",
      code: "M139",
      fuelType: "PETROL",
      displacementCc: 1991,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: "48V mild hybrid (EQ Boost)",
    },
    transmissionSlug: "mercedes-amg-speedshift-dct-8",
    dimensions: {
      lengthIn: 183.1,
      widthIn: 72.8,
      heightIn: 65.4,
      wheelbaseIn: 111.4,
      frontTrackIn: 63.7,
      rearTrackIn: 62.8,
      curbWeightKg: lbsToKg(3869),
      cargoVolumeLiters: cuFtToLiters(22.0),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 302,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.4,
    },
    fuelEconomy: { cityMpg: 21, highwayMpg: 26, combinedMpg: 23 },
    // Cars.com $61,250 incl. $1,150 destination → $60,100 base
    baseMsrpCents: 6010000,
    pressSourceSlug: "mbusa-2025-amg-glb-35",
    priceSourceSlug: "cars-com-2025-glb-pricing",
  },
];

export async function seedMercedesGlaGlb(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  const destinationSource = await prisma.source.upsert({
    where: { url: DESTINATION_SOURCE.url },
    create: {
      slug: DESTINATION_SOURCE.slug,
      title: DESTINATION_SOURCE.title,
      publisher: "Cars.com",
      url: DESTINATION_SOURCE.url,
      type: DESTINATION_SOURCE.type,
    },
    update: {
      title: DESTINATION_SOURCE.title,
      publisher: "Cars.com",
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
        publisher: sourceData.publisher,
        url: sourceData.url,
        type: "MANUFACTURER",
      },
      update: {
        title: sourceData.title,
        publisher: sourceData.publisher,
        type: "MANUFACTURER",
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
    "mercedes-8g-dct": await prisma.transmission.upsert({
      where: { slug: "mercedes-8g-dct" },
      create: {
        slug: "mercedes-8g-dct",
        name: "8G-DCT 8-speed dual-clutch automatic",
        type: "DUAL_CLUTCH",
        gearCount: 8,
      },
      update: {
        name: "8G-DCT 8-speed dual-clutch automatic",
        type: "DUAL_CLUTCH",
        gearCount: 8,
      },
    }),
    "mercedes-amg-speedshift-dct-8": await prisma.transmission.upsert({
      where: { slug: "mercedes-amg-speedshift-dct-8" },
      create: {
        slug: "mercedes-amg-speedshift-dct-8",
        name: "AMG SPEEDSHIFT DCT 8-speed dual-clutch",
        type: "DUAL_CLUTCH",
        gearCount: 8,
      },
      update: {
        name: "AMG SPEEDSHIFT DCT 8-speed dual-clutch",
        type: "DUAL_CLUTCH",
        gearCount: 8,
      },
    }),
  } as const;

  for (const trim of TRIMS) {
    try {
      const imageUrl = await assertImageUrlOk(trim.imageUrl);
      const imageSource = await ensureImageSource(prisma, {
        slug: `img-${trim.slug}`,
        title: trim.imageAlt,
        pageUrl: trim.imagePageUrl,
      });

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

      const engine = await ensureMercedesEngine(prisma, {
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
          slug: `epa-2025-mercedes-${trim.slug.replace(/^2025-mercedes-/, "").replace(/-us$/, "")}`,
          title: `EPA Fuel Economy — 2025 Mercedes-Benz ${trim.name}`,
          publisher: "U.S. EPA",
          url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
          type: "GOVERNMENT",
        },
        update: {
          title: `EPA Fuel Economy — 2025 Mercedes-Benz ${trim.name}`,
          publisher: "U.S. EPA",
          type: "GOVERNMENT",
        },
      });

      const vehicle = await prisma.vehicle.upsert({
        where: { slug: trim.slug },
        create: {
          slug: trim.slug,
          modelYearId: modelYear.id,
          name: trim.name,
          market: "US",
          bodyStyle: "SUV",
          drivetrain: trim.drivetrain,
          engineId: engine.id,
          transmissionId: transmission.id,
          description: `2025 Mercedes-Benz ${trim.name} (US).`,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
        update: {
          modelYearId: modelYear.id,
          name: trim.name,
          market: "US",
          bodyStyle: "SUV",
          drivetrain: trim.drivetrain,
          engineId: engine.id,
          transmissionId: transmission.id,
          description: `2025 Mercedes-Benz ${trim.name} (US).`,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
      });

      const fuelEconomyData = {
        cityMpg: trim.fuelEconomy.cityMpg,
        highwayMpg: trim.fuelEconomy.highwayMpg,
        combinedMpg: trim.fuelEconomy.combinedMpg,
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
              credit: "Wikimedia Commons",
              position: 0,
            },
            update: {
              sourceId: imageSource.id,
              url: imageUrl,
              alt: trim.imageAlt,
              credit: "Wikimedia Commons",
            },
          }),
        ]);

      await Promise.all([
        upsertCitation(
          prisma,
          pressSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "MBUSA performance specifications",
        ),
        upsertCitation(
          prisma,
          pressSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "MBUSA dimensions / technical data",
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
          "Destination and handling $1,150",
        ),
        upsertCitation(
          prisma,
          imageSource.id,
          "VehicleImage",
          image.id,
          "url",
          trim.imagePageUrl,
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
