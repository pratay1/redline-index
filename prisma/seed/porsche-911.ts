/**
 * Porsche 911 seed module (US market) — 992 / 992.2, prefer MY 2024–2026.
 * Representative trims with full EPA + dimensions + performance + MSRP.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
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

type TrimSeed = {
  slug: string;
  name: string;
  year: 2024 | 2025;
  generationCode: "992" | "992.2";
  generationDisplayName: string;
  generationStartYear: number;
  bodyStyle: "COUPE" | "CABRIOLET";
  drivetrain: "RWD" | "AWD";
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
 * Unique auto-data.net exteriors (verified HEAD — no interiors).
 * Different generation/angle/body per trim.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2025-porsche-911-carrera-us",
    name: "911 Carrera",
    year: 2025,
    generationCode: "992.2",
    generationDisplayName: "Eighth generation facelift (992.2)",
    generationStartYear: 2024,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl:
      "https://www.auto-data.net/images/f67/Porsche-911-992-facelift-2024.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/porsche-911-992-facelift-2024-generation-10036",
    imageAlt: "2025 Porsche 911 Carrera coupe exterior",
    epaId: "48589",
    engine: {
      slug: "porsche-9a2-carrera-388",
      name: "3.0L flat-six twin-turbo (Carrera)",
      code: "9A2-388",
      displacementCc: 2981,
      cylinderCount: 6,
      configuration: "Boxer",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "porsche-pdk-8",
      name: "8-speed Porsche Doppelkupplung (PDK)",
      type: "DUAL_CLUTCH",
      gearCount: 8,
    },
    dimensions: {
      // Car and Driver instrumented 2025 Carrera; tracks C&D Targa 4 GTS narrow body.
      lengthIn: 178.8,
      widthIn: 72.9,
      heightIn: 51.1,
      wheelbaseIn: 96.5,
      frontTrackIn: 62.5,
      rearTrackIn: 61.2,
      curbWeightKg: lbsToKg(3472),
      cargoVolumeLiters: cuFtToLiters(5),
      seatingCapacity: 4,
    },
    performance: {
      // HP/torque/0–60/top C&D 2025 Carrera; EPA MPG FuelEconomyHub id 48589.
      powerHp: 388,
      torqueLbFt: 331,
      zeroToSixtySeconds: 3.1,
      topSpeedMph: 183,
    },
    fuelEconomy: { cityMpg: 18, highwayMpg: 25, combinedMpg: 21 },
    // EPA / Edmunds base excl. destination.
    baseMsrpCents: 12010000,
    specUrl: "https://www.caranddriver.com/porsche/911-2025",
    specTitle: "2025 Porsche 911 Carrera — Car and Driver specs",
  },
  {
    slug: "2025-porsche-911-carrera-s-us",
    name: "911 Carrera S",
    year: 2025,
    generationCode: "992.2",
    generationDisplayName: "Eighth generation facelift (992.2)",
    generationStartYear: 2024,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl:
      "https://www.auto-data.net/images/f67/Porsche-911-992-facelift-2024_2.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/porsche-911-992-facelift-2024-generation-10036",
    imageAlt: "2025 Porsche 911 Carrera S coupe exterior",
    epaId: "49133",
    engine: {
      slug: "porsche-9a2-carrera-s-473",
      name: "3.0L flat-six twin-turbo (Carrera S)",
      code: "9A2-473",
      displacementCc: 2981,
      cylinderCount: 6,
      configuration: "Boxer",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "porsche-pdk-8",
      name: "8-speed Porsche Doppelkupplung (PDK)",
      type: "DUAL_CLUTCH",
      gearCount: 8,
    },
    dimensions: {
      // C&D tested Carrera S; tracks shared narrow-body 992.2.
      lengthIn: 178.8,
      widthIn: 72.9,
      heightIn: 50.9,
      wheelbaseIn: 96.5,
      frontTrackIn: 62.5,
      rearTrackIn: 61.2,
      curbWeightKg: lbsToKg(3557),
      cargoVolumeLiters: cuFtToLiters(5),
      seatingCapacity: 4,
    },
    performance: {
      // Porsche Newsroom USA power/torque/0–60/top; EPA FuelEconomyHub 49133.
      powerHp: 473,
      torqueLbFt: 390,
      zeroToSixtySeconds: 3.1,
      topSpeedMph: 191,
    },
    fuelEconomy: { cityMpg: 17, highwayMpg: 24, combinedMpg: 20 },
    // Porsche Newsroom USA MSRP excl. delivery.
    baseMsrpCents: 14640000,
    specUrl:
      "https://newsroom.porsche.com/en_US/2025/products/porsche-911-carrera-s-and-cabriolet-38321.html",
    specTitle: "2025 Porsche 911 Carrera S — Porsche Newsroom USA",
  },
  {
    slug: "2024-porsche-911-carrera-4s-us",
    name: "911 Carrera 4S",
    year: 2024,
    generationCode: "992",
    generationDisplayName: "Eighth generation (992)",
    generationStartYear: 2019,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f112/Porsche-911-992.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/porsche-911-992-generation-6715",
    imageAlt: "2024 Porsche 911 Carrera 4S coupe exterior",
    epaId: "47297",
    engine: {
      slug: "porsche-9a2-carrera-4s-443",
      name: "3.0L flat-six twin-turbo (Carrera 4S)",
      code: "9A2-443",
      displacementCc: 2981,
      cylinderCount: 6,
      configuration: "Boxer",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "porsche-pdk-8",
      name: "8-speed Porsche Doppelkupplung (PDK)",
      type: "DUAL_CLUTCH",
      gearCount: 8,
    },
    dimensions: {
      // carspecs.us / Motor Matchup 2024 Carrera 4S Coupe.
      lengthIn: 177.9,
      widthIn: 72.9,
      heightIn: 51.1,
      wheelbaseIn: 96.5,
      frontTrackIn: 62.5,
      rearTrackIn: 61.2,
      curbWeightKg: lbsToKg(3487),
      cargoVolumeLiters: cuFtToLiters(4.6),
      seatingCapacity: 4,
    },
    performance: {
      // Edmunds/JD Power HP/torque; Porsche LC 0–60; StuttCars top speed.
      powerHp: 443,
      torqueLbFt: 390,
      zeroToSixtySeconds: 3.2,
      topSpeedMph: 190,
    },
    fuelEconomy: { cityMpg: 18, highwayMpg: 23, combinedMpg: 20 },
    // Edmunds / Porsche Walnut Creek 2024 price list excl. destination.
    baseMsrpCents: 13860000,
    specUrl:
      "https://www.edmunds.com/porsche/911/2024/st-402000043/features-specs/",
    specTitle: "2024 Porsche 911 Carrera 4S — Edmunds specs",
  },
  {
    slug: "2025-porsche-911-turbo-s-us",
    name: "911 Turbo S",
    year: 2025,
    generationCode: "992",
    generationDisplayName: "Eighth generation (992)",
    generationStartYear: 2019,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f112/Porsche-911-992_4.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/porsche-911-992-generation-6715",
    imageAlt: "2025 Porsche 911 Turbo S coupe exterior",
    epaId: "48593",
    engine: {
      slug: "porsche-9a2-turbo-s-640",
      name: "3.7L flat-six twin-turbo (Turbo S)",
      code: "9A2E-640",
      displacementCc: 3745,
      cylinderCount: 6,
      configuration: "Boxer",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "porsche-pdk-8",
      name: "8-speed Porsche Doppelkupplung (PDK)",
      type: "DUAL_CLUTCH",
      gearCount: 8,
    },
    dimensions: {
      // U.S. News / JD Power curb & overall; Porsche Type 992 Turbo tech PDF tracks/cargo.
      lengthIn: 178.6,
      widthIn: 74.8,
      heightIn: 51.3,
      wheelbaseIn: 96.5,
      frontTrackIn: 62.4,
      rearTrackIn: 63.0,
      curbWeightKg: lbsToKg(3649),
      cargoVolumeLiters: cuFtToLiters(4.5),
      seatingCapacity: 4,
    },
    performance: {
      // TrueDelta/Edmunds HP/torque; mfr 0–60 with Sport Chrono; catalog top speed.
      powerHp: 640,
      torqueLbFt: 590,
      zeroToSixtySeconds: 2.6,
      topSpeedMph: 205,
    },
    fuelEconomy: { cityMpg: 14, highwayMpg: 20, combinedMpg: 16 },
    // EPA / Edmunds base excl. destination.
    baseMsrpCents: 23040000,
    specUrl:
      "https://www.edmunds.com/porsche/911/2025/st-402038872/features-specs/",
    specTitle: "2025 Porsche 911 Turbo S — Edmunds specs",
  },
  {
    slug: "2025-porsche-911-targa-4-gts-us",
    name: "911 Targa 4 GTS",
    year: 2025,
    generationCode: "992.2",
    generationDisplayName: "Eighth generation facelift (992.2)",
    generationStartYear: 2024,
    bodyStyle: "CABRIOLET",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f112/Porsche-911-Targa-992-facelift-2024.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/porsche-911-targa-992-facelift-2024-generation-10038",
    imageAlt: "2025 Porsche 911 Targa 4 GTS exterior",
    epaId: "49039",
    engine: {
      slug: "porsche-9a3-targa-gts-hybrid-532",
      name: "3.6L flat-six T-Hybrid (Targa 4 GTS)",
      code: "9A3B-532",
      displacementCc: 3591,
      cylinderCount: 6,
      configuration: "Boxer",
      induction: "Electric turbocharger",
      electrification: "T-Hybrid (400V)",
    },
    transmission: {
      slug: "porsche-pdk-8",
      name: "8-speed Porsche Doppelkupplung (PDK)",
      type: "DUAL_CLUTCH",
      gearCount: 8,
    },
    dimensions: {
      // Car and Driver Targa 4 GTS dimensions/tracks/curb; KBB cargo 4.8 cu ft.
      lengthIn: 179.3,
      widthIn: 72.9,
      heightIn: 51.3,
      wheelbaseIn: 96.5,
      frontTrackIn: 62.5,
      rearTrackIn: 61.2,
      curbWeightKg: lbsToKg(3869),
      cargoVolumeLiters: cuFtToLiters(4.8),
      seatingCapacity: 4,
    },
    performance: {
      // C&D system output; The Drive 0–62 / top speed.
      powerHp: 532,
      torqueLbFt: 449,
      zeroToSixtySeconds: 3.0,
      topSpeedMph: 194,
    },
    fuelEconomy: { cityMpg: 17, highwayMpg: 23, combinedMpg: 19 },
    // Edmunds / EPA MSRP excl. destination.
    baseMsrpCents: 18600000,
    specUrl:
      "https://www.caranddriver.com/porsche/911/specs/2025/porsche_911_porsche-911-targa_2025",
    specTitle: "2025 Porsche 911 Targa 4 GTS — Car and Driver specs",
  },
];

const STATIC_SKIPPED = [
  "911 Carrera 4S (MY 2025 US): not listed in US EPA/Edmunds lineup; AWD Carrera path is Carrera 4 GTS — seeded MY 2024 Carrera 4S instead",
  "911 GT3 / GT3 Touring (MY 2025): Edmunds notes not EPA-tested; fuel-economy UI incomplete — skipped",
  "911 GT3 RS: track-special; no complete US EPA fuel package seeded here",
  "911 Turbo (non-S): Turbo S seeded as Turbo-line representative",
  "911 Carrera GTS coupe: Targa 4 GTS seeded as hybrid GTS / open-top representative",
  "911 Cabriolet body styles: coupe/Targa coverage preferred for this module",
  "991-generation (2015–2019) US 911s: out of preferred 992 MY 2024–2026 window",
];

const DESTINATION_SOURCE = {
  slug: "autotrader-2024-porsche-911-destination",
  title: "2024 Porsche 911 destination charge $1,650 (Autotrader)",
  url: "https://www.autotrader.com/comparisons/2024-porsche-911-choosing-the-right-trim",
  type: "THIRD_PARTY" as const,
  publisher: "Autotrader",
};

export async function seedPorsche911(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  const model = await prisma.vehicleModel.upsert({
    where: { slug: "porsche-911" },
    create: {
      manufacturerId,
      name: "911",
      slug: "porsche-911",
    },
    update: { manufacturerId, name: "911" },
  });

  const generationCache = new Map<
    string,
    { id: string; years: Map<number, string> }
  >();

  async function ensureModelYear(trim: TrimSeed) {
    let genEntry = generationCache.get(trim.generationCode);
    if (!genEntry) {
      const generation = await prisma.vehicleGeneration.upsert({
        where: {
          modelId_code: { modelId: model.id, code: trim.generationCode },
        },
        create: {
          modelId: model.id,
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
      generationCache.set(trim.generationCode, genEntry);
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
        slug: `porsche-911-${trim.slug}-specs`,
        title: trim.specTitle,
        publisher: "Manufacturer / third-party catalogue",
        url: trim.specUrl,
        type: "THIRD_PARTY",
      });

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-${trim.year}-${trim.slug}`,
        title: `EPA Fuel Economy — ${trim.year} Porsche ${trim.name}`,
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
          modelYearId,
          name: trim.name,
          market: "US",
          bodyStyle: trim.bodyStyle,
          drivetrain: trim.drivetrain,
          engineId: engine.id,
          transmissionId: transmission.id,
          description: `${trim.year} Porsche ${trim.name} (US).`,
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
          description: `${trim.year} Porsche ${trim.name} (US).`,
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
          "Power, torque, 0–60 mph, and top speed from cited catalogue / press",
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
          `Base MSRP excluding destination (${trim.year} US)`,
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
