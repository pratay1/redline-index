/**
 * Porsche 918 Spyder seed module (US market).
 * Final US model year 2015 only — plug-in hybrid hypercar roadster.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Sources:
 * - EPA id 34856 (fuel economy, electric range, MSRP band)
 * - auto-data.net / encyCARpedia (dims, 0–60, system output)
 * - Cars.com / iSeeCars (base MSRP; 2015 destination $2,975)
 */
import {
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensurePorscheEngine,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./porsche-shared";

const LBS_TO_KG = 0.45359237;
const CUFT_TO_L = 28.316846592;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

/** Period-accurate US destination for MY2015 918 (iSeeCars). */
const DESTINATION_2015_CENTS = 297_500;

type TrimSeed = {
  slug: string;
  name: string;
  year: 2015;
  generationCode: "918";
  bodyStyle: "ROADSTER";
  drivetrain: "AWD";
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
    electrification: string;
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
    topSpeedMph: number;
  };
  fuelEconomy: {
    cityMpg: number;
    highwayMpg: number;
    combinedMpg: number;
    electricRangeMiles: number;
  };
  /** BASE_MSRP in cents (excludes destination). */
  baseMsrpCents: number;
};

/**
 * Unique encyCARpedia exterior (silver roadster, front ¾).
 * HEAD-verified JPEG; not Weissach (no exposed-carbon aero package).
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2015-porsche-918-spyder-us",
    name: "918 Spyder",
    year: 2015,
    generationCode: "918",
    bodyStyle: "ROADSTER",
    drivetrain: "AWD",
    imageUrl: "https://c.encycarpedia.com/ci/2815.jpg",
    imagePageUrl: "https://www.encycarpedia.com/us/porsche/13-918-spyder-roadster",
    imageAlt: "2015 Porsche 918 Spyder roadster exterior",
    epaId: "34856",
    engine: {
      slug: "porsche-m18-00-918",
      name: "M18.00 4.6L V8 + dual electric motors (PHEV)",
      code: "M18.00",
      displacementCc: 4593,
      cylinderCount: 8,
      induction: "Naturally aspirated",
      electrification: "PHEV (front 95 kW + rear 116 kW DC brushless)",
    },
    transmission: {
      slug: "porsche-pdk-7-918",
      name: "7-speed PDK dual-clutch automatic",
    },
    dimensions: {
      // auto-data.net / encyCARpedia (mm → in).
      lengthIn: 182.8,
      widthIn: 76.4,
      heightIn: 45.9,
      wheelbaseIn: 107.5,
      frontTrackIn: 65.5,
      rearTrackIn: 63.5,
      curbWeightKg: lbsToKg(3691),
      cargoVolumeLiters: cuFtToLiters(3.9),
      seatingCapacity: 2,
    },
    performance: {
      // Combined system output ~887 hp / 944 lb-ft; 0–60 ~2.5 s (auto-data / encyCARpedia).
      powerHp: 887,
      torqueLbFt: 944,
      zeroToSixtySeconds: 2.5,
      topSpeedMph: 214,
    },
    fuelEconomy: {
      // EPA gas-only city/hwy/comb; electric range 12 mi (EPA id 34856).
      cityMpg: 20,
      highwayMpg: 24,
      combinedMpg: 22,
      electricRangeMiles: 12,
    },
    // EPA / Cars.com base MSRP $845,000 excl. destination.
    baseMsrpCents: 84_500_000,
  },
];

const STATIC_SKIPPED = [
  "2013–2014 918 Spyder: US catalogue limited to final MY 2015 (EPA id 34856)",
  "2015 918 Spyder Weissach Package: distinct exterior (exposed carbon / magnesium wheels) not HEAD-verified on encyCARpedia or auto-data as a unique asset; incomplete image coverage — skipped",
];

const DESTINATION_SOURCE = {
  slug: "iseecars-2015-porsche-918-spyder-pricing",
  title: "2015 Porsche 918 Spyder Price / Destination Charge (iSeeCars)",
  url: "https://www.iseecars.com/car/porsche-918-spyder-price",
  type: "THIRD_PARTY" as const,
  publisher: "iSeeCars",
};

const SPEC_SOURCE = {
  slug: "auto-data-porsche-918-spyder-887",
  title: "Porsche 918 Spyder 4.6 V8 (887 Hp) Hybrid PDK — auto-data.net",
  url: "https://www.auto-data.net/en/porsche-918-spyder-4.6-v8-887hp-hybrid-pdk-21380",
  type: "THIRD_PARTY" as const,
  publisher: "auto-data.net",
};

export async function seedPorsche918(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  const model = await prisma.vehicleModel.upsert({
    where: { slug: "porsche-918-spyder" },
    create: {
      manufacturerId,
      name: "918 Spyder",
      slug: "porsche-918-spyder",
    },
    update: { manufacturerId, name: "918 Spyder" },
  });

  const generation = await prisma.vehicleGeneration.upsert({
    where: {
      modelId_code: { modelId: model.id, code: "918" },
    },
    create: {
      modelId: model.id,
      code: "918",
      displayName: "918 Spyder (2013–2015)",
      startYear: 2013,
      endYear: 2015,
    },
    update: {
      displayName: "918 Spyder (2013–2015)",
      startYear: 2013,
      endYear: 2015,
    },
  });

  const modelYear = await prisma.modelYear.upsert({
    where: {
      generationId_year: { generationId: generation.id, year: 2015 },
    },
    create: { generationId: generation.id, year: 2015 },
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
        slug: `encycarpedia-image-${trim.slug}`,
        title: `${trim.name} exterior (encyCARpedia)`,
        pageUrl: trim.imagePageUrl,
        publisher: "encyCARpedia",
      });

      const engine = await ensurePorscheEngine(prisma, {
        manufacturerId,
        slug: trim.engine.slug,
        name: trim.engine.name,
        code: trim.engine.code,
        fuelType: "PLUG_IN_HYBRID",
        displacementCc: trim.engine.displacementCc,
        cylinderCount: trim.engine.cylinderCount,
        configuration: "V",
        induction: trim.engine.induction,
        electrification: trim.engine.electrification,
      });

      const transmission = await prisma.transmission.upsert({
        where: { slug: trim.transmission.slug },
        create: {
          slug: trim.transmission.slug,
          name: trim.transmission.name,
          type: "DUAL_CLUTCH",
          gearCount: 7,
        },
        update: {
          name: trim.transmission.name,
          type: "DUAL_CLUTCH",
          gearCount: 7,
        },
      });

      const specSource = await upsertCatalogueSource(prisma, {
        slug: SPEC_SOURCE.slug,
        title: SPEC_SOURCE.title,
        publisher: SPEC_SOURCE.publisher,
        url: SPEC_SOURCE.url,
        type: SPEC_SOURCE.type,
      });

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-2015-${trim.slug}`,
        title: `EPA Fuel Economy — 2015 Porsche ${trim.name}`,
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
          description:
            "2015 Porsche 918 Spyder plug-in hybrid roadster (US). Mid-engine V8 + dual electric motors, AWD, 7-speed PDK.",
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
          description:
            "2015 Porsche 918 Spyder plug-in hybrid roadster (US). Mid-engine V8 + dual electric motors, AWD, 7-speed PDK.",
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
            create: {
              vehicleId: vehicle.id,
              cityMpg: trim.fuelEconomy.cityMpg,
              highwayMpg: trim.fuelEconomy.highwayMpg,
              combinedMpg: trim.fuelEconomy.combinedMpg,
              electricRangeMiles: trim.fuelEconomy.electricRangeMiles,
            },
            update: {
              cityMpg: trim.fuelEconomy.cityMpg,
              highwayMpg: trim.fuelEconomy.highwayMpg,
              combinedMpg: trim.fuelEconomy.combinedMpg,
              electricRangeMiles: trim.fuelEconomy.electricRangeMiles,
            },
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
              amountCents: DESTINATION_2015_CENTS,
              currency: "USD",
              effectiveAt: pricingDate,
            },
            update: {
              amountCents: DESTINATION_2015_CENTS,
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
              credit: "encyCARpedia",
              position: 0,
            },
            update: {
              sourceId: imageSource.id,
              url: imageUrl,
              alt: trim.imageAlt,
              credit: "encyCARpedia",
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
          "auto-data.net combined power, torque, 0–60 mph, top speed",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "auto-data.net / encyCARpedia exterior dimensions, tracks, curb weight, cargo",
        ),
        upsertCitation(
          prisma,
          fuelSource.id,
          "VehicleFuelEconomy",
          fuelEconomy.id,
          "cityMpg",
          `EPA vehicle id ${trim.epaId} (gas-only)`,
        ),
        upsertCitation(
          prisma,
          fuelSource.id,
          "VehicleFuelEconomy",
          fuelEconomy.id,
          "highwayMpg",
          `EPA vehicle id ${trim.epaId} (gas-only)`,
        ),
        upsertCitation(
          prisma,
          fuelSource.id,
          "VehicleFuelEconomy",
          fuelEconomy.id,
          "combinedMpg",
          `EPA vehicle id ${trim.epaId} (gas-only; 67 MPGe on electricity)`,
        ),
        upsertCitation(
          prisma,
          fuelSource.id,
          "VehicleFuelEconomy",
          fuelEconomy.id,
          "electricRangeMiles",
          `EPA vehicle id ${trim.epaId} (rangeA = 12 mi)`,
        ),
        upsertCitation(
          prisma,
          priceSource.id,
          "VehiclePrice",
          price.id,
          "amountCents",
          "Base MSRP $845,000 excluding destination (EPA / Cars.com / iSeeCars)",
        ),
        upsertCitation(
          prisma,
          destinationSource.id,
          "VehiclePrice",
          destination.id,
          "amountCents",
          `2015 US destination and handling $${(DESTINATION_2015_CENTS / 100).toFixed(0)} (iSeeCars)`,
        ),
        upsertCitation(
          prisma,
          imageSource.id,
          "VehicleImage",
          image.id,
          "url",
          "encyCARpedia exterior asset ci/2815.jpg",
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
