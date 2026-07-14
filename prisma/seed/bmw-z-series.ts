/**
 * BMW Z Series (Z4 Roadster) US MY 2025 seed module.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
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

type TrimSeed = {
  slug: string;
  name: string;
  dokNo: string;
  imageAlt: string;
  epaId: string;
  engine: {
    slug: string;
    name: string;
    code: string;
    displacementCc: number;
    cylinderCount: number;
  };
  dimensions: {
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    wheelbaseIn: number;
    frontTrackIn: number;
    rearTrackIn: number;
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
  /** BASE_MSRP in cents (excludes destination). */
  baseMsrpCents: number;
  specSource: {
    slug: string;
    title: string;
    url: string;
    type: "MANUFACTURER" | "PRESS_RELEASE";
  };
  fuelSource: {
    slug: string;
    title: string;
    url: string;
  };
  priceSource: {
    slug: string;
    title: string;
    url: string;
    type: "THIRD_PARTY";
  };
};

const TRIMS: TrimSeed[] = [
  {
    slug: "2025-bmw-z4-sdrive30i-us",
    name: "Z4 sDrive30i",
    dokNo: "P90481358",
    imageAlt: "2025 BMW Z4 sDrive30i Roadster exterior",
    epaId: "47695",
    engine: {
      slug: "bmw-b46b20-z4",
      name: "B46B20",
      code: "B46B20",
      displacementCc: 1998,
      cylinderCount: 4,
    },
    dimensions: {
      lengthIn: 170.7,
      widthIn: 73.4,
      heightIn: 51.4,
      wheelbaseIn: 97.2,
      frontTrackIn: 63.7,
      rearTrackIn: 63.5,
      // BMW USA technical data curb weight (current US listing).
      curbWeightKg: lbsToKg(3314),
      // Launch PressClub GVWR (unchanged architecture).
      grossVehicleWeightKg: lbsToKg(3880),
      cargoVolumeLiters: cuFtToLiters(9.9),
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.2,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 25, highwayMpg: 33, combinedMpg: 28 },
    // Edmunds base MSRP excl. destination; Cars.com full price $55,675 = $54,500 + $1,175.
    baseMsrpCents: 5450000,
    specSource: {
      slug: "bmw-z4-g29-launch-press-release",
      title: "The new BMW Z4 (PressClub USA)",
      url: "https://www.press.bmwgroup.com/usa/article/detail/T0285141EN_US/the-new-bmw-z4?language=en_US",
      type: "PRESS_RELEASE",
    },
    fuelSource: {
      slug: "epa-2025-bmw-z4-sdrive30i",
      title: "EPA Fuel Economy — 2025 BMW Z4 sDrive30i",
      url: "https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=47695",
    },
    priceSource: {
      slug: "edmunds-2025-bmw-z4-features-specs",
      title: "2025 BMW Z4 Specs & Features (Edmunds)",
      url: "https://www.edmunds.com/bmw/z4/2025/features-specs/",
      type: "THIRD_PARTY",
    },
  },
  {
    slug: "2025-bmw-z4-m40i-us",
    name: "Z4 M40i",
    dokNo: "P90536236",
    imageAlt: "2025 BMW Z4 M40i Roadster exterior",
    epaId: "47763",
    engine: {
      slug: "bmw-b58b30o1-z4",
      name: "B58B30O1",
      code: "B58B30O1",
      displacementCc: 2998,
      cylinderCount: 6,
    },
    dimensions: {
      lengthIn: 170.7,
      widthIn: 73.4,
      heightIn: 51.4,
      wheelbaseIn: 97.2,
      frontTrackIn: 62.8,
      rearTrackIn: 62.6,
      // Official auto curb/GVWR from G29 launch PressClub update.
      curbWeightKg: lbsToKg(3443),
      grossVehicleWeightKg: lbsToKg(4092),
      cargoVolumeLiters: cuFtToLiters(9.9),
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 382,
      torqueLbFt: 369,
      // Automatic Steptronic (standard); Handschalter manual is 4.2s.
      zeroToSixtySeconds: 3.9,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 23, highwayMpg: 29, combinedMpg: 25 },
    // Edmunds base MSRP excl. destination; Cars.com full price $68,175 = $67,000 + $1,175.
    baseMsrpCents: 6700000,
    specSource: {
      // Same G29 fact sheet covers M40i auto 382 hp / 3.9s / curb / tracks.
      slug: "bmw-z4-g29-launch-press-release",
      title: "The new BMW Z4 (PressClub USA)",
      url: "https://www.press.bmwgroup.com/usa/article/detail/T0285141EN_US/the-new-bmw-z4?language=en_US",
      type: "PRESS_RELEASE",
    },
    fuelSource: {
      slug: "epa-2025-bmw-z4-m40i",
      title: "EPA Fuel Economy — 2025 BMW Z4 M40i",
      url: "https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=47763",
    },
    priceSource: {
      slug: "edmunds-2025-bmw-z4-features-specs",
      title: "2025 BMW Z4 Specs & Features (Edmunds)",
      url: "https://www.edmunds.com/bmw/z4/2025/features-specs/",
      type: "THIRD_PARTY",
    },
  },
];

/** Shared dimension/performance facts also corroborated on BMW USA technical data. */
const BMW_USA_TECH_SOURCE = {
  slug: "bmw-usa-z4-technical-data",
  title: "BMW Z4 Roadster technical data (BMW USA)",
  url: "https://www.bmwusa.com/vehicles/m-series/z4-m40i/bmw-z4-m40i-technical-data.html",
  type: "MANUFACTURER" as const,
};

const DESTINATION_SOURCE = {
  slug: "bmw-z4-final-edition-press-release",
  title: "The BMW Z4 Final Edition (PressClub USA)",
  url: "https://www.press.bmwgroup.com/usa/article/detail/T0454065EN_US/the-bmw-z4-final-edition?language=en_US",
  type: "PRESS_RELEASE" as const,
};

export async function seedBmwZSeries(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [];

  const model = await prisma.vehicleModel.upsert({
    where: { slug: "bmw-z4" },
    create: {
      manufacturerId,
      name: "Z4",
      slug: "bmw-z4",
    },
    update: { manufacturerId, name: "Z4" },
  });

  const generation = await prisma.vehicleGeneration.upsert({
    where: { modelId_code: { modelId: model.id, code: "G29" } },
    create: {
      modelId: model.id,
      code: "G29",
      displayName: "Third generation (G29)",
      startYear: 2019,
    },
    update: {
      displayName: "Third generation (G29)",
      startYear: 2019,
    },
  });

  const modelYear = await prisma.modelYear.upsert({
    where: { generationId_year: { generationId: generation.id, year: 2025 } },
    create: { generationId: generation.id, year: 2025 },
    update: {},
  });

  const transmission = await prisma.transmission.upsert({
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
  });

  const bmwUsaTechSource = await prisma.source.upsert({
    where: { slug: BMW_USA_TECH_SOURCE.slug },
    create: {
      ...BMW_USA_TECH_SOURCE,
      publisher: "BMW of North America",
    },
    update: {
      title: BMW_USA_TECH_SOURCE.title,
      publisher: "BMW of North America",
      url: BMW_USA_TECH_SOURCE.url,
      type: BMW_USA_TECH_SOURCE.type,
    },
  });

  const destinationSource = await prisma.source.upsert({
    where: { slug: DESTINATION_SOURCE.slug },
    create: {
      ...DESTINATION_SOURCE,
      publisher: "BMW Group",
    },
    update: {
      title: DESTINATION_SOURCE.title,
      publisher: "BMW Group",
      url: DESTINATION_SOURCE.url,
      type: DESTINATION_SOURCE.type,
    },
  });

  for (const trim of TRIMS) {
    try {
      const imageUrl = await assertImageOk(trim.dokNo);
      const imageSource = await ensureImageSource(prisma, trim.dokNo);

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
          induction: "Twin-scroll turbocharger",
        },
        update: {
          manufacturerId,
          name: trim.engine.name,
          code: trim.engine.code,
          fuelType: "PETROL",
          displacementCc: trim.engine.displacementCc,
          cylinderCount: trim.engine.cylinderCount,
          configuration: "Inline",
          induction: "Twin-scroll turbocharger",
          electrification: null,
        },
      });

      const specSource = await prisma.source.upsert({
        where: { slug: trim.specSource.slug },
        create: {
          slug: trim.specSource.slug,
          title: trim.specSource.title,
          publisher: "BMW Group",
          url: trim.specSource.url,
          type: trim.specSource.type,
        },
        update: {
          title: trim.specSource.title,
          publisher: "BMW Group",
          url: trim.specSource.url,
          type: trim.specSource.type,
        },
      });

      const fuelSource = await prisma.source.upsert({
        where: { slug: trim.fuelSource.slug },
        create: {
          slug: trim.fuelSource.slug,
          title: trim.fuelSource.title,
          publisher: "U.S. EPA",
          url: trim.fuelSource.url,
          type: "GOVERNMENT",
        },
        update: {
          title: trim.fuelSource.title,
          publisher: "U.S. EPA",
          url: trim.fuelSource.url,
          type: "GOVERNMENT",
        },
      });

      const priceSource = await prisma.source.upsert({
        where: { slug: trim.priceSource.slug },
        create: {
          slug: trim.priceSource.slug,
          title: trim.priceSource.title,
          publisher: "Edmunds",
          url: trim.priceSource.url,
          type: trim.priceSource.type,
        },
        update: {
          title: trim.priceSource.title,
          publisher: "Edmunds",
          url: trim.priceSource.url,
          type: trim.priceSource.type,
        },
      });

      const vehicle = await prisma.vehicle.upsert({
        where: { slug: trim.slug },
        create: {
          slug: trim.slug,
          modelYearId: modelYear.id,
          name: trim.name,
          market: "US",
          bodyStyle: "ROADSTER",
          drivetrain: "RWD",
          engineId: engine.id,
          transmissionId: transmission.id,
          description: `2025 BMW ${trim.name} Roadster (US).`,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
        update: {
          modelYearId: modelYear.id,
          name: trim.name,
          market: "US",
          bodyStyle: "ROADSTER",
          drivetrain: "RWD",
          engineId: engine.id,
          transmissionId: transmission.id,
          description: `2025 BMW ${trim.name} Roadster (US).`,
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

      await Promise.all([
        upsertCitation(
          prisma,
          specSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "BMW PressClub performance specifications",
        ),
        upsertCitation(
          prisma,
          bmwUsaTechSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "BMW USA technical data (length/width/height/wheelbase/cargo)",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "tracksAndWeights",
          "BMW PressClub track widths and GVWR (and M40i curb weight)",
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
      ]);

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
