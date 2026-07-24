/**
 * Mercedes-Benz GLC (X254) US MY 2025 seed module.
 * Idempotent — safe to re-run.
 *
 * EPA IDs: 48275 (GLC 300 4MATIC), 48674 (GLC 350e), 48196 (AMG GLC 43),
 *          49022 (AMG GLC 63 S E PERFORMANCE)
 */
import {
  MERCEDES_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureMercedesEngine,
  upsertCitation,
  upsertCatalogueSource,
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

type FuelEconomySeed = {
  cityMpg: number;
  highwayMpg: number;
  combinedMpg: number;
  electricRangeMiles?: number;
};

type TrimSeed = {
  slug: string;
  name: string;
  drivetrain: "RWD" | "AWD";
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
  epaId: string;
  engine: {
    slug: string;
    name: string;
    code: string;
    fuelType: "PETROL" | "PLUG_IN_HYBRID";
    displacementCc: number;
    cylinderCount: number;
    configuration: "Inline";
    induction: string;
    electrification: string | null;
  };
  transmissionSlug: "mercedes-9g-tronic" | "mercedes-amg-speedshift-mct-9";
  dimensions: {
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    wheelbaseIn: number;
    frontTrackIn?: number;
    rearTrackIn?: number;
    curbWeightKg?: number;
    cargoVolumeLiters: number;
    seatingCapacity: number;
  };
  performance: {
    powerHp: number;
    torqueLbFt: number;
    zeroToSixtySeconds: number;
    topSpeedMph: number;
  };
  fuelEconomy: FuelEconomySeed;
  baseMsrpCents: number;
  mbusaSourceSlug: string;
};

const DESTINATION_SOURCE = {
  slug: "mercedes-us-destination-fee-2025",
  title: "Mercedes-Benz US destination and handling ($1,150)",
  url: "https://www.mbusa.com/en/vehicles/class/glc/suv",
  type: "MANUFACTURER" as const,
  publisher: "Mercedes-Benz USA",
};

const TRIMS: TrimSeed[] = [
  {
    slug: "2025-mercedes-glc-300-us",
    name: "GLC 300",
    drivetrain: "AWD",
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/glc-class/glc-suv/class-page/series-(ncm)/2026-GLC-SUV-HC-D.jpg",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/glc/suv/glc300w4",
    imageAlt: "2025 Mercedes-Benz GLC 300 4MATIC exterior",
    epaId: "48275",
    engine: {
      slug: "mercedes-m254-glc-300",
      name: "M254 2.0L turbo mild hybrid",
      code: "M254",
      fuelType: "PETROL",
      displacementCc: 1991,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: "48V mild hybrid",
    },
    transmissionSlug: "mercedes-9g-tronic",
    dimensions: {
      lengthIn: 185.7,
      widthIn: 74.4,
      heightIn: 64.6,
      wheelbaseIn: 113.7,
      curbWeightKg: lbsToKg(4277),
      cargoVolumeLiters: cuFtToLiters(21.9),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 6.2,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 23, highwayMpg: 31, combinedMpg: 26 },
    baseMsrpCents: 5_125_000,
    mbusaSourceSlug: "mbusa-2025-glc-300",
  },
  {
    slug: "2025-mercedes-glc-350e-us",
    name: "GLC 350e",
    drivetrain: "AWD",
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/glc-class/glc-suv/class-page/series-(ncm)/2026-GLC-SUV-HC-M.jpg",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/glc/suv/glc350e4",
    imageAlt: "2025 Mercedes-Benz GLC 350e 4MATIC exterior",
    epaId: "48674",
    engine: {
      slug: "mercedes-m254-glc-350e",
      name: "M254 2.0L turbo plug-in hybrid",
      code: "M254-PHEV",
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 1991,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: "Plug-in hybrid (100 kW PMSM)",
    },
    transmissionSlug: "mercedes-9g-tronic",
    dimensions: {
      lengthIn: 185.7,
      widthIn: 74.4,
      heightIn: 64.6,
      wheelbaseIn: 113.7,
      cargoVolumeLiters: cuFtToLiters(21.9),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 313,
      torqueLbFt: 406,
      zeroToSixtySeconds: 6.2,
      topSpeedMph: 130,
    },
    fuelEconomy: {
      cityMpg: 23,
      highwayMpg: 28,
      combinedMpg: 25,
      electricRangeMiles: 54,
    },
    baseMsrpCents: 5_990_000,
    mbusaSourceSlug: "mbusa-2025-glc-350e",
  },
  {
    slug: "2025-mercedes-amg-glc-43-us",
    name: "AMG GLC 43",
    drivetrain: "AWD",
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/glc-class/glc-suv/dimensions/2026-GLC300-4M-SUV-SFB-DR.png",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/glc/suv/glc43w4",
    imageAlt: "2025 Mercedes-AMG GLC 43 exterior",
    epaId: "48196",
    engine: {
      slug: "mercedes-m139l-glc-43",
      name: "AMG M139l 2.0L turbo mild hybrid",
      code: "M139L",
      fuelType: "PETROL",
      displacementCc: 1991,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Electric exhaust-gas turbocharger",
      electrification: "48V mild hybrid",
    },
    transmissionSlug: "mercedes-amg-speedshift-mct-9",
    dimensions: {
      lengthIn: 187.0,
      widthIn: 75.6,
      heightIn: 64.4,
      wheelbaseIn: 113.7,
      frontTrackIn: 65.6,
      rearTrackIn: 65.6,
      curbWeightKg: lbsToKg(4553),
      cargoVolumeLiters: cuFtToLiters(21.9),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 416,
      torqueLbFt: 369,
      zeroToSixtySeconds: 4.7,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 19, highwayMpg: 25, combinedMpg: 21 },
    baseMsrpCents: 6_710_000,
    mbusaSourceSlug: "mbusa-2025-amg-glc-43",
  },
  {
    slug: "2025-mercedes-amg-glc-63-s-us",
    name: "AMG GLC 63 S",
    drivetrain: "AWD",
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/glc-class/glc-suv/dimensions/2026-GLC300-SUV-SFB-DR.png",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/glc/suv/glc63w4e",
    imageAlt: "2025 Mercedes-AMG GLC 63 S E PERFORMANCE exterior",
    epaId: "49022",
    engine: {
      slug: "mercedes-m139l-glc-63-s",
      name: "AMG M139l 2.0L P3 performance hybrid",
      code: "M139L-PHEV",
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 1991,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Electric exhaust-gas turbocharger",
      electrification: "P3 plug-in hybrid (150 kW rear motor)",
    },
    transmissionSlug: "mercedes-amg-speedshift-mct-9",
    dimensions: {
      lengthIn: 187.0,
      widthIn: 75.6,
      heightIn: 64.4,
      wheelbaseIn: 113.7,
      frontTrackIn: 64.8,
      rearTrackIn: 64.8,
      curbWeightKg: lbsToKg(5115),
      cargoVolumeLiters: cuFtToLiters(16.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 671,
      torqueLbFt: 752,
      zeroToSixtySeconds: 3.5,
      topSpeedMph: 171,
    },
    fuelEconomy: {
      cityMpg: 19,
      highwayMpg: 21,
      combinedMpg: 20,
      electricRangeMiles: 1,
    },
    baseMsrpCents: 8_605_000,
    mbusaSourceSlug: "mbusa-2025-amg-glc-63-s",
  },
];

const STATIC_SKIPPED = [
  "GLC 200: EU-only — not offered in US MY 2025 (no EPA listing)",
  "GLC 220d: EU diesel — not offered in US MY 2025 (no EPA listing)",
  "GLC 250: discontinued / not offered in US MY 2025 (no EPA listing)",
  "GLC 400: not offered in US MY 2025 (no EPA listing)",
  "AMG GLC 63: not offered in US MY 2025 — only AMG GLC 63 S E PERFORMANCE",
];

const MBUSA_SOURCES: Record<string, { title: string; url: string }> = {
  "mbusa-2025-glc-300": {
    title: "2025 Mercedes-Benz GLC 300 4MATIC SUV (MBUSA)",
    url: "https://www.mbusa.com/en/vehicles/model/glc/suv/glc300w4",
  },
  "mbusa-2025-glc-350e": {
    title: "2025 Mercedes-Benz GLC 350e 4MATIC SUV (MBUSA)",
    url: "https://www.mbusa.com/en/vehicles/model/glc/suv/glc350e4",
  },
  "mbusa-2025-amg-glc-43": {
    title: "2025 Mercedes-AMG GLC 43 SUV (MBUSA)",
    url: "https://www.mbusa.com/en/vehicles/model/glc/suv/glc43w4",
  },
  "mbusa-2025-amg-glc-63-s": {
    title: "2025 Mercedes-AMG GLC 63 S E PERFORMANCE SUV (MBUSA)",
    url: "https://www.mbusa.com/en/vehicles/model/glc/suv/glc63w4e",
  },
};

export async function seedMercedesGlc(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  const model = await prisma.vehicleModel.upsert({
    where: { slug: "mercedes-glc" },
    create: {
      manufacturerId,
      name: "GLC",
      slug: "mercedes-glc",
    },
    update: { manufacturerId, name: "GLC" },
  });

  const generation = await prisma.vehicleGeneration.upsert({
    where: { modelId_code: { modelId: model.id, code: "X254" } },
    create: {
      modelId: model.id,
      code: "X254",
      displayName: "Second generation (X254)",
      startYear: 2023,
    },
    update: {
      displayName: "Second generation (X254)",
      startYear: 2023,
    },
  });

  const modelYear = await prisma.modelYear.upsert({
    where: { generationId_year: { generationId: generation.id, year: 2025 } },
    create: { generationId: generation.id, year: 2025 },
    update: {},
  });

  const transmission9g = await prisma.transmission.upsert({
    where: { slug: "mercedes-9g-tronic" },
    create: {
      slug: "mercedes-9g-tronic",
      name: "9G-TRONIC 9-speed automatic",
      type: "AUTOMATIC",
      gearCount: 9,
    },
    update: {
      name: "9G-TRONIC 9-speed automatic",
      type: "AUTOMATIC",
      gearCount: 9,
    },
  });

  const transmissionAmg = await prisma.transmission.upsert({
    where: { slug: "mercedes-amg-speedshift-mct-9" },
    create: {
      slug: "mercedes-amg-speedshift-mct-9",
      name: "AMG SPEEDSHIFT MCT 9-speed",
      type: "AUTOMATIC",
      gearCount: 9,
    },
    update: {
      name: "AMG SPEEDSHIFT MCT 9-speed",
      type: "AUTOMATIC",
      gearCount: 9,
    },
  });

  const transmissions = {
    "mercedes-9g-tronic": transmission9g,
    "mercedes-amg-speedshift-mct-9": transmissionAmg,
  } as const;

  const destinationSource = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE.slug,
    title: DESTINATION_SOURCE.title,
    publisher: DESTINATION_SOURCE.publisher,
    url: DESTINATION_SOURCE.url,
    type: DESTINATION_SOURCE.type,
  });

  const priceSource = await upsertCatalogueSource(prisma, {
    slug: "edmunds-2025-mercedes-glc-msrp",
    title: "2025 Mercedes-Benz GLC-Class specs & MSRP (Edmunds)",
    publisher: "Edmunds",
    url: "https://www.edmunds.com/mercedes-benz/glc-class/2025/features-specs/",
    type: "THIRD_PARTY",
  });

  for (const trim of TRIMS) {
    try {
      const imageUrl = await assertImageUrlOk(trim.imageUrl);
      // Source URL must be the image asset (unique) — not the MBUSA page
      // (that URL is reserved for the catalogue/spec source below).
      const imageSource = await ensureImageSource(prisma, {
        slug: `mercedes-glc-image-${trim.slug}`,
        title: trim.imageAlt,
        pageUrl: imageUrl,
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

      const mbusaMeta = MBUSA_SOURCES[trim.mbusaSourceSlug];
      if (!mbusaMeta) {
        throw new Error(`Missing MBUSA source for ${trim.mbusaSourceSlug}`);
      }
      const mbusaSource = await upsertCatalogueSource(prisma, {
        slug: trim.mbusaSourceSlug,
        title: mbusaMeta.title,
        publisher: "Mercedes-Benz USA",
        url: mbusaMeta.url,
        type: "MANUFACTURER",
      });

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-2025-mercedes-${trim.epaId}`,
        title: `2025 Mercedes-Benz ${trim.name} EPA fuel economy`,
        publisher: "U.S. EPA",
        url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
        type: "GOVERNMENT",
      });

      const transmission = transmissions[trim.transmissionSlug];

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
          description: `2025 Mercedes-Benz ${trim.name} SUV (US).`,
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
          description: `2025 Mercedes-Benz ${trim.name} SUV (US).`,
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

      const citationTasks = [
        upsertCitation(
          prisma,
          mbusaSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "MBUSA performance specifications",
        ),
        upsertCitation(
          prisma,
          mbusaSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "MBUSA / Edmunds exterior dimensions and cargo",
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
          "MBUSA exterior configurator still",
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
