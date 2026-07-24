/**
 * Porsche 718 Boxster + Cayman seed module (US market, MY 2025).
 * Prefer EPA / Edmunds / Porsche dealer & finder specs. Idempotent — safe to re-run.
 * Does not wire itself into prisma/seed.ts.
 */
import {
  PORSCHE_DESTINATION_CENTS,
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

type ModelSlug = "porsche-718-boxster" | "porsche-718-cayman";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: string;
  year: 2025;
  generationCode: string;
  generationDisplayName: string;
  generationStartYear: number;
  bodyStyle: "ROADSTER" | "COUPE";
  drivetrain: "RWD";
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
    configuration: string;
    induction: string;
    electrification: string | null;
  };
  transmission: {
    slug: string;
    name: string;
    type: "DUAL_CLUTCH";
    gearCount: number;
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
  specUrl: string;
  specTitle: string;
};

/**
 * Unique auto-data.net exteriors (verified — no interiors).
 * encyCARpedia preferred but Cloudflare-blocked at seed time; fallback used.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2025-porsche-718-cayman-us",
    name: "718 Cayman",
    modelSlug: "porsche-718-cayman",
    modelName: "718 Cayman",
    year: 2025,
    generationCode: "982",
    generationDisplayName: "718 / 982 generation",
    generationStartYear: 2016,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl:
      "https://www.auto-data.net/images/f123/Porsche-718-Cayman-982.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/porsche-718-cayman-982-2.0-300hp-pdk-41382",
    imageAlt: "2025 Porsche 718 Cayman coupe exterior",
    epaId: "48811",
    engine: {
      slug: "porsche-mdd-pb-300",
      name: "2.0L Flat-4 turbo (MDD.PB)",
      code: "MDD.PB",
      displacementCc: 1988,
      cylinderCount: 4,
      configuration: "Boxer",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "porsche-pdk-7",
      name: "7-speed PDK dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // Edmunds length/width/height/wheelbase/cargo/curb; JD Power tracks.
      lengthIn: 172.4,
      widthIn: 70.9,
      heightIn: 51.0,
      wheelbaseIn: 97.4,
      frontTrackIn: 59.6,
      rearTrackIn: 60.3,
      curbWeightKg: lbsToKg(3104),
      cargoVolumeLiters: cuFtToLiters(15.0),
      seatingCapacity: 2,
    },
    performance: {
      // HP/torque Porsche Sewickley; 0–60 Edmunds mfr; top Sewickley.
      powerHp: 300,
      torqueLbFt: 280,
      zeroToSixtySeconds: 4.7,
      topSpeedMph: 171,
    },
    // EPA Auto (AM-S7) id 48811 — 21/27/24.
    fuelEconomy: { cityMpg: 21, highwayMpg: 27, combinedMpg: 24 },
    // Edmunds base MSRP excl. destination.
    baseMsrpCents: 7280000,
    specUrl:
      "https://www.edmunds.com/porsche/718-cayman/2025/st-402043148/features-specs/",
    specTitle: "2025 Porsche 718 Cayman — Edmunds specs & features",
  },
  {
    slug: "2025-porsche-718-cayman-gts-40-us",
    name: "718 Cayman GTS 4.0",
    modelSlug: "porsche-718-cayman",
    modelName: "718 Cayman",
    year: 2025,
    generationCode: "982",
    generationDisplayName: "718 / 982 generation",
    generationStartYear: 2016,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl:
      "https://www.auto-data.net/images/f120/Porsche-718-Cayman-982.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/porsche-718-cayman-982-gts-4.0-400hp-pdk-41385",
    imageAlt: "2025 Porsche 718 Cayman GTS 4.0 coupe exterior",
    epaId: "48587",
    engine: {
      slug: "porsche-dkda-394",
      name: "4.0L Flat-6 naturally aspirated (DKDA)",
      code: "DKDA",
      displacementCc: 3995,
      cylinderCount: 6,
      configuration: "Boxer",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "porsche-pdk-7",
      name: "7-speed PDK dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // Edmunds exterior dims/cargo/curb; tracks auto-data (1527/1535 mm).
      lengthIn: 173.4,
      widthIn: 70.9,
      heightIn: 50.2,
      wheelbaseIn: 97.4,
      frontTrackIn: 60.1,
      rearTrackIn: 60.4,
      curbWeightKg: lbsToKg(3241),
      cargoVolumeLiters: cuFtToLiters(15.0),
      seatingCapacity: 2,
    },
    performance: {
      // US SAE 394 hp / 317 lb-ft Edmunds; 0–60 Porsche/Edmunds w/ Sport Chrono; top Sewickley.
      powerHp: 394,
      torqueLbFt: 317,
      zeroToSixtySeconds: 3.8,
      topSpeedMph: 182,
    },
    // EPA Auto (AM-S7) id 48587 — 19/24/21.
    fuelEconomy: { cityMpg: 19, highwayMpg: 24, combinedMpg: 21 },
    // Edmunds base MSRP excl. destination.
    baseMsrpCents: 9970000,
    specUrl:
      "https://www.edmunds.com/porsche/718-cayman/2025/gts-40/st-402043150/features-specs/",
    specTitle: "2025 Porsche 718 Cayman GTS 4.0 — Edmunds specs & features",
  },
  {
    slug: "2025-porsche-718-boxster-us",
    name: "718 Boxster",
    modelSlug: "porsche-718-boxster",
    modelName: "718 Boxster",
    year: 2025,
    generationCode: "982",
    generationDisplayName: "718 / 982 generation",
    generationStartYear: 2016,
    bodyStyle: "ROADSTER",
    drivetrain: "RWD",
    imageUrl:
      "https://www.auto-data.net/images/f120/Porsche-718-Boxster-982.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/porsche-718-boxster-982-generation-3022",
    imageAlt: "2025 Porsche 718 Boxster roadster exterior",
    epaId: "48809",
    engine: {
      slug: "porsche-mdd-pb-300",
      name: "2.0L Flat-4 turbo (MDD.PB)",
      code: "MDD.PB",
      displacementCc: 1988,
      cylinderCount: 4,
      configuration: "Boxer",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "porsche-pdk-7",
      name: "7-speed PDK dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // Edmunds length/width/height/wheelbase/cargo/curb; tracks shared 982 platform (JD Power Cayman).
      lengthIn: 172.4,
      widthIn: 70.9,
      heightIn: 50.4,
      wheelbaseIn: 97.4,
      frontTrackIn: 59.6,
      rearTrackIn: 60.3,
      curbWeightKg: lbsToKg(3097),
      cargoVolumeLiters: cuFtToLiters(9.7),
      seatingCapacity: 2,
    },
    performance: {
      // HP/torque Porsche Sewickley; 0–60 Edmunds/KBB mfr; top Sewickley.
      powerHp: 300,
      torqueLbFt: 280,
      zeroToSixtySeconds: 4.7,
      topSpeedMph: 171,
    },
    // EPA Auto (AM-S7) id 48809 — 21/27/24.
    fuelEconomy: { cityMpg: 21, highwayMpg: 27, combinedMpg: 24 },
    // Edmunds / iSeeCars base MSRP excl. destination.
    baseMsrpCents: 7490000,
    specUrl:
      "https://www.edmunds.com/porsche/718-boxster/2025/st-402048195/features-specs/",
    specTitle: "2025 Porsche 718 Boxster — Edmunds specs & features",
  },
  {
    slug: "2025-porsche-718-boxster-gts-40-us",
    name: "718 Boxster GTS 4.0",
    modelSlug: "porsche-718-boxster",
    modelName: "718 Boxster",
    year: 2025,
    generationCode: "982",
    generationDisplayName: "718 / 982 generation",
    generationStartYear: 2016,
    bodyStyle: "ROADSTER",
    drivetrain: "RWD",
    imageUrl:
      "https://www.auto-data.net/images/f58/Porsche-718-Boxster-982.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/porsche-718-boxster-982-generation-3022",
    imageAlt: "2025 Porsche 718 Boxster GTS 4.0 roadster exterior",
    epaId: "48585",
    engine: {
      slug: "porsche-dkda-394",
      name: "4.0L Flat-6 naturally aspirated (DKDA)",
      code: "DKDA",
      displacementCc: 3995,
      cylinderCount: 6,
      configuration: "Boxer",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "porsche-pdk-7",
      name: "7-speed PDK dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // JD Power length/height/tracks; Edmunds width/wheelbase/cargo/curb.
      lengthIn: 172.9,
      widthIn: 70.9,
      heightIn: 50.4,
      wheelbaseIn: 97.4,
      frontTrackIn: 60.1,
      rearTrackIn: 60.4,
      curbWeightKg: lbsToKg(3241),
      cargoVolumeLiters: cuFtToLiters(9.7),
      seatingCapacity: 2,
    },
    performance: {
      // US SAE Edmunds/JD Power; 0–60 Porsche Finder/Sewickley w/ Sport Chrono; top Finder.
      powerHp: 394,
      torqueLbFt: 317,
      zeroToSixtySeconds: 3.8,
      topSpeedMph: 179,
    },
    // EPA Auto (AM-S7) id 48585 — 19/24/21.
    fuelEconomy: { cityMpg: 19, highwayMpg: 24, combinedMpg: 21 },
    // Edmunds / iSeeCars base MSRP excl. destination.
    baseMsrpCents: 10180000,
    specUrl:
      "https://www.edmunds.com/porsche/718-boxster/2025/st-402048193/features-specs/",
    specTitle: "2025 Porsche 718 Boxster GTS 4.0 — Edmunds specs & features",
  },
];

const STATIC_SKIPPED = [
  "718 Cayman S: representative Base + GTS 4.0 seeded; S fully sourceable later (EPA id 48815)",
  "718 Boxster S: representative Base + GTS 4.0 seeded; S fully sourceable later (EPA id 48813)",
  "718 Cayman Style Edition / Boxster Style Edition: appearance packages; Base covers powertrain",
  "718 Cayman GT4 RS / Boxster Spyder RS: halo track variants; skipped without separate full UI package pass",
  "718 Spyder (non-RS): prior MY; US MY 2025 lists Spyder RS only",
  "6-speed manual variants: PDK is standard US listing and fully EPA-sourced; manuals skipped to avoid duplicate trim rows",
  "MY 2017–2024 carryover years: prefer latest US MY 2025 still offered",
];

/** Matches PORSCHE_DESTINATION_CENTS ($1,650). MY2025 stickers often list $1,995. */
const DESTINATION_SOURCE = {
  slug: "iseecars-2024-porsche-718-cayman-destination",
  title: "2024 Porsche 718 Cayman destination charge $1,650 (iSeeCars)",
  url: "https://www.iseecars.com/car/2024-porsche-718_cayman-price",
  type: "THIRD_PARTY" as const,
  publisher: "iSeeCars",
};

export async function seedPorsche718(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  const modelCache = new Map<
    ModelSlug,
    { id: string; generations: Map<string, { id: string; years: Map<number, string> }> }
  >();

  async function ensureModelYear(trim: TrimSeed) {
    let modelEntry = modelCache.get(trim.modelSlug);
    if (!modelEntry) {
      const model = await prisma.vehicleModel.upsert({
        where: { slug: trim.modelSlug },
        create: {
          manufacturerId,
          name: trim.modelName,
          slug: trim.modelSlug,
        },
        update: { manufacturerId, name: trim.modelName },
      });
      modelEntry = { id: model.id, generations: new Map() };
      modelCache.set(trim.modelSlug, modelEntry);
    }

    let genEntry = modelEntry.generations.get(trim.generationCode);
    if (!genEntry) {
      const generation = await prisma.vehicleGeneration.upsert({
        where: {
          modelId_code: {
            modelId: modelEntry.id,
            code: trim.generationCode,
          },
        },
        create: {
          modelId: modelEntry.id,
          code: trim.generationCode,
          displayName: trim.generationDisplayName,
          startYear: trim.generationStartYear,
        },
        update: {
          displayName: trim.generationDisplayName,
          startYear: trim.generationStartYear,
        },
      });
      genEntry = { id: generation.id, years: new Map() };
      modelEntry.generations.set(trim.generationCode, genEntry);
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
        slug: `auto-data-image-${trim.slug}`,
        title: `${trim.name} exterior (auto-data.net)`,
        pageUrl: trim.imagePageUrl,
        publisher: "auto-data.net",
      });

      const modelYearId = await ensureModelYear(trim);

      const engine = await ensurePorscheEngine(prisma, {
        manufacturerId,
        slug: trim.engine.slug,
        name: trim.engine.name,
        code: trim.engine.code,
        fuelType: "PETROL",
        displacementCc: trim.engine.displacementCc,
        cylinderCount: trim.engine.cylinderCount,
        configuration: trim.engine.configuration,
        induction: trim.engine.induction,
        electrification: trim.engine.electrification,
      });

      const transmission = await prisma.transmission.upsert({
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

      const specSource = await upsertCatalogueSource(prisma, {
        slug: `porsche-718-${trim.slug}-specs`,
        title: trim.specTitle,
        publisher: "Edmunds",
        url: trim.specUrl,
        type: "THIRD_PARTY",
      });

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-2025-${trim.slug}`,
        title: `EPA Fuel Economy — 2025 Porsche ${trim.name}`,
        publisher: "U.S. EPA",
        url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
        type: "GOVERNMENT",
      });

      const priceSource = await upsertCatalogueSource(prisma, {
        slug: `edmunds-price-${trim.slug}`,
        title: trim.specTitle,
        publisher: "Edmunds",
        url: trim.specUrl,
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
          description: `2025 Porsche ${trim.name} (US).`,
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
          description: `2025 Porsche ${trim.name} (US).`,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
      });

      const performanceData = {
        powerHp: trim.performance.powerHp,
        torqueLbFt: trim.performance.torqueLbFt,
        zeroToSixtySeconds: trim.performance.zeroToSixtySeconds,
        topSpeedMph: trim.performance.topSpeedMph,
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
              amountCents: PORSCHE_DESTINATION_CENTS,
              currency: "USD",
              effectiveAt: pricingDate,
            },
            update: {
              amountCents: PORSCHE_DESTINATION_CENTS,
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
          "Power, torque, 0–60 mph, and top speed from cited catalogue / dealer press",
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
          "Base MSRP excluding destination (2025 US)",
        ),
        upsertCitation(
          prisma,
          destinationSource.id,
          "VehiclePrice",
          destination.id,
          "amountCents",
          `Destination and handling $${(PORSCHE_DESTINATION_CENTS / 100).toFixed(0)}`,
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
