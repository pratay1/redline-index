/**
 * BMW 2 Series / M2 US MY 2025 seed module.
 * Idempotent — safe to re-run.
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

type BodyStyle = "COUPE" | "SEDAN";
type Drivetrain = "RWD" | "AWD" | "FWD";

type TrimSeed = {
  slug: string;
  name: string;
  generationCode: "G42" | "F74" | "G87";
  generationLabel: string;
  generationStartYear: number;
  bodyStyle: BodyStyle;
  drivetrain: Drivetrain;
  dokNo: string;
  imageAlt: string;
  epaId: string;
  fuelSourceSlug: string;
  fuelSourceTitle: string;
  engine: {
    slug: string;
    name: string;
    code: string;
    displacementCc: number;
    cylinderCount: number;
    induction: string;
  };
  transmissionSlug:
    | "bmw-8-speed-sport-steptronic"
    | "bmw-7-speed-dct-steptronic"
    | "bmw-8-speed-m-steptronic-drivelogic";
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
    topSpeedMph: number;
  };
  fuelEconomy: {
    cityMpg: number;
    highwayMpg: number;
    combinedMpg: number;
  };
  baseMsrpCents: number;
  pressSourceSlug: string;
};

const PRESS_SOURCES = [
  {
    slug: "bmw-2025-2-series-coupe-press-release",
    title: "The new 2025 BMW 2 Series Coupe.",
    url: "https://www.press.bmwgroup.com/usa/article/attachment/T0443107EN_US/617995",
    publishedAt: new Date("2024-06-12T00:00:00.000Z"),
  },
  {
    slug: "bmw-2025-2-series-gran-coupe-press-release",
    title: "The new 2025 BMW 2 Series Gran Coupe.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0445698EN_US/the-new-2025-bmw-2-series-gran-coupe",
    publishedAt: new Date("2024-10-15T00:00:00.000Z"),
  },
  {
    slug: "bmw-2025-m2-press-release",
    title: "The new 2025 BMW M2.",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0443102EN_US/new-2025-bmw-m2",
    publishedAt: new Date("2024-06-12T00:00:00.000Z"),
  },
] as const;

const TRIMS: TrimSeed[] = [
  {
    slug: "2025-bmw-230i-coupe-us",
    name: "230i Coupe",
    generationCode: "G42",
    generationLabel: "Second generation Coupe (G42)",
    generationStartYear: 2022,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    dokNo: "P90554902",
    imageAlt: "2025 BMW 230i Coupe exterior",
    epaId: "48151",
    fuelSourceSlug: "epa-2025-bmw-230i-coupe",
    fuelSourceTitle: "2025 BMW 230i Coupe fuel economy data",
    engine: {
      slug: "bmw-b48b20-230i",
      name: "B48B20",
      code: "B48B20",
      displacementCc: 1998,
      cylinderCount: 4,
      induction: "Twin-scroll turbocharger",
    },
    transmissionSlug: "bmw-8-speed-sport-steptronic",
    dimensions: {
      lengthIn: 179,
      widthIn: 72.4,
      heightIn: 54.8,
      wheelbaseIn: 107.9,
      frontTrackIn: 62.4,
      rearTrackIn: 62.9,
      groundClearanceIn: 5,
      curbWeightKg: 1563,
      grossVehicleWeightKg: 1995,
      cargoVolumeLiters: 391,
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.5,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 26, highwayMpg: 35, combinedMpg: 30 },
    baseMsrpCents: 3920000,
    pressSourceSlug: "bmw-2025-2-series-coupe-press-release",
  },
  {
    slug: "2025-bmw-230i-xdrive-coupe-us",
    name: "230i xDrive Coupe",
    generationCode: "G42",
    generationLabel: "Second generation Coupe (G42)",
    generationStartYear: 2022,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    dokNo: "P90554903",
    imageAlt: "2025 BMW 230i xDrive Coupe exterior",
    epaId: "48152",
    fuelSourceSlug: "epa-2025-bmw-230i-xdrive-coupe",
    fuelSourceTitle: "2025 BMW 230i xDrive Coupe fuel economy data",
    engine: {
      slug: "bmw-b48b20-230i",
      name: "B48B20",
      code: "B48B20",
      displacementCc: 1998,
      cylinderCount: 4,
      induction: "Twin-scroll turbocharger",
    },
    transmissionSlug: "bmw-8-speed-sport-steptronic",
    dimensions: {
      lengthIn: 179,
      widthIn: 72.4,
      heightIn: 55.2,
      wheelbaseIn: 107.9,
      frontTrackIn: 62.4,
      rearTrackIn: 62.9,
      groundClearanceIn: 5,
      curbWeightKg: 1635,
      grossVehicleWeightKg: 2065,
      cargoVolumeLiters: 391,
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.3,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 25, highwayMpg: 33, combinedMpg: 28 },
    baseMsrpCents: 4120000,
    pressSourceSlug: "bmw-2025-2-series-coupe-press-release",
  },
  {
    slug: "2025-bmw-m240i-xdrive-coupe-us",
    name: "M240i xDrive Coupe",
    generationCode: "G42",
    generationLabel: "Second generation Coupe (G42)",
    generationStartYear: 2022,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    dokNo: "P90554915",
    imageAlt: "2025 BMW M240i xDrive Coupe exterior",
    epaId: "48154",
    fuelSourceSlug: "epa-2025-bmw-m240i-xdrive-coupe",
    fuelSourceTitle: "2025 BMW M240i xDrive Coupe fuel economy data",
    engine: {
      slug: "bmw-b58b30-m240i",
      name: "B58B30",
      code: "B58B30",
      displacementCc: 2998,
      cylinderCount: 6,
      induction: "Twin-scroll turbocharger",
    },
    transmissionSlug: "bmw-8-speed-sport-steptronic",
    dimensions: {
      lengthIn: 179,
      widthIn: 72.4,
      heightIn: 55.3,
      wheelbaseIn: 107.9,
      frontTrackIn: 62.2,
      rearTrackIn: 62.8,
      groundClearanceIn: 5,
      curbWeightKg: 1756,
      grossVehicleWeightKg: 2165,
      cargoVolumeLiters: 391,
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 382,
      torqueLbFt: 369,
      zeroToSixtySeconds: 4.1,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 23, highwayMpg: 32, combinedMpg: 26 },
    baseMsrpCents: 5210000,
    pressSourceSlug: "bmw-2025-2-series-coupe-press-release",
  },
  {
    slug: "2025-bmw-m240i-coupe-us",
    name: "M240i Coupe",
    generationCode: "G42",
    generationLabel: "Second generation Coupe (G42)",
    generationStartYear: 2022,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    dokNo: "P90554916",
    imageAlt: "2025 BMW M240i Coupe exterior",
    epaId: "48153",
    fuelSourceSlug: "epa-2025-bmw-m240i-coupe",
    fuelSourceTitle: "2025 BMW M240i Coupe fuel economy data",
    engine: {
      slug: "bmw-b58b30-m240i",
      name: "B58B30",
      code: "B58B30",
      displacementCc: 2998,
      cylinderCount: 6,
      induction: "Twin-scroll turbocharger",
    },
    transmissionSlug: "bmw-8-speed-sport-steptronic",
    dimensions: {
      lengthIn: 179.4,
      widthIn: 72.4,
      heightIn: 55,
      wheelbaseIn: 107.9,
      frontTrackIn: 62.2,
      rearTrackIn: 62.8,
      groundClearanceIn: 5,
      curbWeightKg: 1700,
      grossVehicleWeightKg: 2110,
      cargoVolumeLiters: 391,
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 382,
      torqueLbFt: 369,
      zeroToSixtySeconds: 4.2,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 23, highwayMpg: 32, combinedMpg: 26 },
    baseMsrpCents: 5010000,
    pressSourceSlug: "bmw-2025-2-series-coupe-press-release",
  },
  {
    slug: "2025-bmw-228-xdrive-gran-coupe-us",
    name: "228 xDrive Gran Coupe",
    generationCode: "F74",
    generationLabel: "Second generation Gran Coupe (F74)",
    generationStartYear: 2025,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    dokNo: "P90572308",
    imageAlt: "2025 BMW 228 xDrive Gran Coupe exterior",
    epaId: "48841",
    fuelSourceSlug: "epa-2025-bmw-228-xdrive-gran-coupe",
    fuelSourceTitle: "2025 BMW 228 xDrive Gran Coupe fuel economy data",
    engine: {
      slug: "bmw-b48a20o2",
      name: "B48A20O2",
      code: "B48A20O2",
      displacementCc: 1998,
      cylinderCount: 4,
      induction: "Twin-scroll turbocharger",
    },
    transmissionSlug: "bmw-7-speed-dct-steptronic",
    dimensions: {
      lengthIn: 179.2,
      widthIn: 70.9,
      heightIn: 56.9,
      wheelbaseIn: 105.1,
      frontTrackIn: 61.4,
      rearTrackIn: 61.4,
      groundClearanceIn: 5.7,
      curbWeightKg: 1603,
      grossVehicleWeightKg: 2075,
      cargoVolumeLiters: 340,
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 241,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.8,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 26, highwayMpg: 38, combinedMpg: 30 },
    baseMsrpCents: 4160000,
    pressSourceSlug: "bmw-2025-2-series-gran-coupe-press-release",
  },
  {
    slug: "2025-bmw-228-gran-coupe-us",
    name: "228 Gran Coupe",
    generationCode: "F74",
    generationLabel: "Second generation Gran Coupe (F74)",
    generationStartYear: 2025,
    bodyStyle: "SEDAN",
    drivetrain: "FWD",
    dokNo: "P90589217",
    imageAlt: "2025 BMW 228 Gran Coupe exterior",
    epaId: "49231",
    fuelSourceSlug: "epa-2026-bmw-228-gran-coupe",
    fuelSourceTitle: "2026 BMW 228 Gran Coupe fuel economy data (FWD sDrive)",
    engine: {
      slug: "bmw-b48a20o2",
      name: "B48A20O2",
      code: "B48A20O2",
      displacementCc: 1998,
      cylinderCount: 4,
      induction: "Twin-scroll turbocharger",
    },
    transmissionSlug: "bmw-7-speed-dct-steptronic",
    dimensions: {
      lengthIn: 179.2,
      widthIn: 70.9,
      heightIn: 56.9,
      wheelbaseIn: 105.1,
      frontTrackIn: 61.4,
      rearTrackIn: 61.4,
      groundClearanceIn: 5.7,
      curbWeightKg: 1545,
      grossVehicleWeightKg: 2015,
      cargoVolumeLiters: 340,
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 241,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.9,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 27, highwayMpg: 39, combinedMpg: 31 },
    baseMsrpCents: 3960000,
    pressSourceSlug: "bmw-2025-2-series-gran-coupe-press-release",
  },
  {
    slug: "2025-bmw-m235-xdrive-gran-coupe-us",
    name: "M235 xDrive Gran Coupe",
    generationCode: "F74",
    generationLabel: "Second generation Gran Coupe (F74)",
    generationStartYear: 2025,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    dokNo: "P90589117",
    imageAlt: "2025 BMW M235 xDrive Gran Coupe exterior",
    epaId: "48842",
    fuelSourceSlug: "epa-2025-bmw-m235-xdrive-gran-coupe",
    fuelSourceTitle: "2025 BMW M235 xDrive Gran Coupe fuel economy data",
    engine: {
      slug: "bmw-b48a20-m235",
      name: "B48A20",
      code: "B48A20-M235",
      displacementCc: 1998,
      cylinderCount: 4,
      induction: "Twin-scroll turbocharger",
    },
    transmissionSlug: "bmw-7-speed-dct-steptronic",
    dimensions: {
      lengthIn: 179.2,
      widthIn: 70.9,
      heightIn: 56.9,
      wheelbaseIn: 105.1,
      frontTrackIn: 61.6,
      rearTrackIn: 61.8,
      groundClearanceIn: 5.5,
      curbWeightKg: 1690,
      grossVehicleWeightKg: 2160,
      cargoVolumeLiters: 340,
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 312,
      torqueLbFt: 295,
      zeroToSixtySeconds: 4.4,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 24, highwayMpg: 33, combinedMpg: 27 },
    baseMsrpCents: 4950000,
    pressSourceSlug: "bmw-2025-2-series-gran-coupe-press-release",
  },
  {
    slug: "2025-bmw-m2-coupe-us",
    name: "M2 Coupe",
    generationCode: "G87",
    generationLabel: "Second generation M2 (G87)",
    generationStartYear: 2023,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    dokNo: "P90553471",
    imageAlt: "2025 BMW M2 Coupe exterior",
    epaId: "47970",
    fuelSourceSlug: "epa-2025-bmw-m2-coupe",
    fuelSourceTitle: "2025 BMW M2 Coupe fuel economy data",
    engine: {
      slug: "bmw-s58b30-m2",
      name: "S58B30",
      code: "S58B30",
      displacementCc: 2993,
      cylinderCount: 6,
      induction: "Twin-turbocharger",
    },
    transmissionSlug: "bmw-8-speed-m-steptronic-drivelogic",
    dimensions: {
      lengthIn: 180.3,
      widthIn: 72.5,
      heightIn: 55.3,
      wheelbaseIn: 108.1,
      frontTrackIn: 63.7,
      rearTrackIn: 63.2,
      groundClearanceIn: 4.8,
      curbWeightKg: 1730,
      grossVehicleWeightKg: 2160,
      cargoVolumeLiters: 390,
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 473,
      torqueLbFt: 443,
      zeroToSixtySeconds: 4.1,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 16, highwayMpg: 23, combinedMpg: 19 },
    baseMsrpCents: 6490000,
    pressSourceSlug: "bmw-2025-m2-press-release",
  },
];

function isCompleteVehicle(vehicle: {
  dimensions: unknown;
  performance: unknown;
  fuelEconomy: unknown;
  prices: unknown[];
  images: unknown[];
}) {
  return Boolean(
    vehicle.dimensions &&
      vehicle.performance &&
      vehicle.fuelEconomy &&
      vehicle.prices.length >= 2 &&
      vehicle.images.length >= 1,
  );
}

export async function seedBmw2Series(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [];

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
        publishedAt: sourceData.publishedAt,
      },
      update: {
        title: sourceData.title,
        publisher: "BMW Group",
        type: "PRESS_RELEASE",
        publishedAt: sourceData.publishedAt,
      },
    });
    pressSources.set(sourceData.slug, source);
  }

  const transmissions = {
    "bmw-8-speed-sport-steptronic": await prisma.transmission.upsert({
      where: { slug: "bmw-8-speed-sport-steptronic" },
      create: {
        slug: "bmw-8-speed-sport-steptronic",
        name: "8-speed Sport Steptronic",
        type: "AUTOMATIC",
        gearCount: 8,
      },
      update: {
        name: "8-speed Sport Steptronic",
        type: "AUTOMATIC",
        gearCount: 8,
      },
    }),
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
  } as const;

  const model = await prisma.vehicleModel.upsert({
    where: { slug: "bmw-2-series" },
    create: {
      manufacturerId,
      name: "2 Series",
      slug: "bmw-2-series",
    },
    update: { manufacturerId, name: "2 Series" },
  });

  const generationByCode = new Map<string, { id: string; modelYearId: string }>();

  for (const trim of TRIMS) {
    try {
      const existing = await prisma.vehicle.findUnique({
        where: { slug: trim.slug },
        include: {
          dimensions: true,
          performance: true,
          fuelEconomy: true,
          prices: true,
          images: true,
        },
      });
      if (existing && isCompleteVehicle(existing)) {
        skipped.push(`${trim.slug} (already complete)`);
        continue;
      }

      await assertImageOk(trim.dokNo);
      const imageSource = await ensureImageSource(prisma, trim.dokNo);

      let generationMeta = generationByCode.get(trim.generationCode);
      if (!generationMeta) {
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
        generationMeta = { id: generation.id, modelYearId: modelYear.id };
        generationByCode.set(trim.generationCode, generationMeta);
      }

      const engine = await prisma.engine.upsert({
        where: { slug: trim.engine.slug },
        create: {
          manufacturerId,
          slug: trim.engine.slug,
          name: trim.engine.name,
          code: trim.engine.code,
          fuelType: "PETROL",
          displacementCc: trim.engine.displacementCc,
          cylinderCount: trim.engine.cylinderCount,
          configuration: "Inline",
          induction: trim.engine.induction,
        },
        update: {
          manufacturerId,
          name: trim.engine.name,
          code: trim.engine.code,
          fuelType: "PETROL",
          displacementCc: trim.engine.displacementCc,
          cylinderCount: trim.engine.cylinderCount,
          configuration: "Inline",
          induction: trim.engine.induction,
          electrification: null,
        },
      });

      const transmission = transmissions[trim.transmissionSlug];
      const pressSource = pressSources.get(trim.pressSourceSlug);
      if (!pressSource) {
        throw new Error(`Missing press source for ${trim.slug}`);
      }

      const fuelSource = await prisma.source.upsert({
        where: { slug: trim.fuelSourceSlug },
        create: {
          slug: trim.fuelSourceSlug,
          title: trim.fuelSourceTitle,
          publisher: "U.S. Department of Energy and U.S. Environmental Protection Agency",
          url: `https://www.fueleconomy.gov/ws/rest/vehicle/${trim.epaId}`,
          type: "GOVERNMENT",
        },
        update: {
          title: trim.fuelSourceTitle,
          publisher: "U.S. Department of Energy and U.S. Environmental Protection Agency",
          url: `https://www.fueleconomy.gov/ws/rest/vehicle/${trim.epaId}`,
          type: "GOVERNMENT",
        },
      });

      const vehicle = await prisma.vehicle.upsert({
        where: { slug: trim.slug },
        create: {
          slug: trim.slug,
          modelYearId: generationMeta.modelYearId,
          name: trim.name,
          market: "US",
          bodyStyle: trim.bodyStyle,
          drivetrain: trim.drivetrain,
          engineId: engine.id,
          transmissionId: transmission.id,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
        update: {
          modelYearId: generationMeta.modelYearId,
          name: trim.name,
          market: "US",
          bodyStyle: trim.bodyStyle,
          drivetrain: trim.drivetrain,
          engineId: engine.id,
          transmissionId: transmission.id,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
      });

      const [dimensions, performance, fuelEconomy, basePrice, destinationPrice, image] =
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
            update: { amountCents: trim.baseMsrpCents, currency: "USD" },
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
            update: { amountCents: DESTINATION_CENTS, currency: "USD" },
          }),
          prisma.vehicleImage.upsert({
            where: { vehicleId_position: { vehicleId: vehicle.id, position: 0 } },
            create: {
              vehicleId: vehicle.id,
              sourceId: imageSource.id,
              url: mediapoolUrl(trim.dokNo),
              alt: trim.imageAlt,
              credit: "BMW Group",
              position: 0,
            },
            update: {
              sourceId: imageSource.id,
              url: mediapoolUrl(trim.dokNo),
              alt: trim.imageAlt,
              credit: "BMW Group",
            },
          }),
        ]);

      await Promise.all([
        upsertCitation(
          prisma,
          pressSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Official specifications",
        ),
        upsertCitation(
          prisma,
          pressSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "Official specifications",
        ),
        upsertCitation(
          prisma,
          pressSource.id,
          "VehiclePrice",
          basePrice.id,
          "amountCents",
          "Base MSRP",
        ),
        upsertCitation(
          prisma,
          pressSource.id,
          "VehiclePrice",
          destinationPrice.id,
          "amountCents",
          "Destination and handling",
        ),
        upsertCitation(
          prisma,
          fuelSource.id,
          "VehicleFuelEconomy",
          fuelEconomy.id,
          "cityMpg",
          "EPA city estimate",
        ),
        upsertCitation(
          prisma,
          fuelSource.id,
          "VehicleFuelEconomy",
          fuelEconomy.id,
          "highwayMpg",
          "EPA highway estimate",
        ),
        upsertCitation(
          prisma,
          fuelSource.id,
          "VehicleFuelEconomy",
          fuelEconomy.id,
          "combinedMpg",
          "EPA combined estimate",
        ),
        upsertCitation(
          prisma,
          imageSource.id,
          "VehicleImage",
          image.id,
          "url",
          `PressClub image ${trim.dokNo}`,
        ),
      ]);

      await ensureAudit(prisma, importerId, vehicle.id, trim.slug);
      seeded.push(trim.slug);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      skipped.push(`${trim.slug}: ${message}`);
    }
  }

  return { seeded, skipped };
}
