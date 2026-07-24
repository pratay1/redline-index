/**
 * Mercedes-Benz G-Class US MY 2025 seed module.
 * Idempotent — safe to re-run.
 *
 * Seeded (US): G 550 (EPA 48145), AMG G 63 (EPA 48570).
 * Skipped a priori: G 350d, G 400d, G 500, AMG G 65 (EU-only / non-US / discontinued).
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

/** Unique MBUSA IRIS exterior stills — distinct color/angle per trim. */
const IMAGE_G550 =
  "https://media.oneweb.mercedes-benz.com/images/dynamic/nafta/US/465210/X25/iris.jpg?q=COSY-EU-100-1713d0VXq0WFqtyO67PobzIr3eWsrrCsdRRzwQZQ9vZbMw3SGtlaItsd2HdcUfp8yXGEPGEJ0l7YhOB2XQqbApeARI5usmxQC3UkTkzNGLdm7jaSthymI9WFk0cUfzUNXGE7nmJ0lK6xOB2vocbApLHyI5ug41QC3AgQkzN5J9m7jocShKVfBL%25vqE79yLRlN6YaxhrWrH1lb%25n8w2S4oiZT5pM4FmmJTg735wrcldu63yvAKIa9Q6DF1s1n2nvligKfLlCVzWcY54I&cp=5bGZs3ZqvblYTH6ckO0W3A&fb=1&POV=BE040,PZM&BKGND=9&IMGT=P27&im=Crop,rect=(0,-70,1920,1150);Resize,width=1920,height=1150";

const IMAGE_G63 =
  "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/g-class/dimensions/2026-AMG-G63-SUV-SFB-DR.png";

type TrimSeed = {
  slug: string;
  name: string;
  drivetrain: "AWD";
  imageUrl: string;
  imageAlt: string;
  imagePageUrl: string;
  epaId: string;
  engine: {
    slug: string;
    name: string;
    code: string;
    fuelType: "PETROL";
    displacementCc: number;
    cylinderCount: number;
    configuration: "Inline" | "V";
    induction: string;
    electrification: string;
  };
  transmissionSlug: "mercedes-9g-tronic" | "mercedes-amg-speedshift-tct-9g";
  dimensions: {
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    wheelbaseIn: number;
    frontTrackIn?: number;
    rearTrackIn?: number;
    groundClearanceIn?: number;
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
  baseMsrpCents: number;
  pressSourceSlug: string;
  priceSourceSlug: string;
};

const PRESS_SOURCES = [
  {
    slug: "mbusa-2025-g-550-qrg",
    title: "2025 Mercedes-Benz G 550 Quick Reference Guide",
    url: "https://media.mbusa.com/releases/release-27244e6a47579560c441795d240be02d-2025-mercedes-benz-g-550-quick-reference-guide",
    publisher: "Mercedes-Benz USA",
    type: "PRESS_RELEASE" as const,
  },
  {
    slug: "mbusa-2025-amg-g-63-qrg",
    title: "2025 Mercedes-AMG G 63 Quick Reference Guide",
    url: "https://media.mbusa.com/releases/release-27244e6a47579560c441795d240bcc75-2025-mercedes-amg-g-63-quick-reference-guide",
    publisher: "Mercedes-Benz USA",
    type: "PRESS_RELEASE" as const,
  },
] as const;

const DESTINATION_SOURCE = {
  slug: "mbusa-2025-g-class-destination-fee",
  title: "Mercedes-Benz US destination and delivery ($1,150)",
  url: "https://media.mbusa.com/releases/release-27244e6a47579560c441795d240be02d-2025-mercedes-benz-g-550-quick-reference-guide",
  type: "PRESS_RELEASE" as const,
  publisher: "Mercedes-Benz USA",
};

/** Assignment list — EU-only / non-US / discontinued trims documented as skipped. */
const SKIPPED_A_PRIORI: { slug: string; reason: string }[] = [
  {
    slug: "2025-mercedes-g-350d-us",
    reason:
      "G 350d is EU-market diesel only; not offered in US MY 2025 (no EPA listing)",
  },
  {
    slug: "2025-mercedes-g-400d-us",
    reason:
      "G 400d is EU-market diesel only; not offered in US MY 2025 (no EPA listing)",
  },
  {
    slug: "2025-mercedes-g-500-us",
    reason:
      "G 500 not a US designation for MY 2025; US petrol trim is G 550 (seeded)",
  },
  {
    slug: "2025-mercedes-amg-g-65-us",
    reason:
      "AMG G 65 discontinued after prior W463 generation; not in US MY 2025 lineup",
  },
];

const TRIMS: TrimSeed[] = [
  {
    slug: "2025-mercedes-g-550-us",
    name: "G 550",
    drivetrain: "AWD",
    imageUrl: IMAGE_G550,
    imageAlt: "2025 Mercedes-Benz G 550 exterior (US)",
    imagePageUrl:
      "https://www.mbusa.com/en/vehicles/model/g-class/suv/g550w4",
    epaId: "48145",
    engine: {
      slug: "mercedes-m256-g550",
      name: "3.0L Inline-6 Turbo with 48V Mild Hybrid",
      code: "M256",
      fuelType: "PETROL",
      displacementCc: 2999,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Turbocharger with electric auxiliary compressor",
      electrification: "48V mild hybrid (ISG)",
    },
    transmissionSlug: "mercedes-9g-tronic",
    dimensions: {
      lengthIn: 190.0,
      widthIn: 76.0,
      heightIn: 80.4,
      wheelbaseIn: 113.8,
      frontTrackIn: 64.5,
      rearTrackIn: 64.5,
      groundClearanceIn: 9.5,
      curbWeightKg: lbsToKg(5534),
      cargoVolumeLiters: cuFtToLiters(37.4),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 443,
      torqueLbFt: 413,
      zeroToSixtySeconds: 5.3,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 17, highwayMpg: 19, combinedMpg: 18 },
    baseMsrpCents: 14825000,
    pressSourceSlug: "mbusa-2025-g-550-qrg",
    priceSourceSlug: "mbusa-2025-g-550-qrg",
  },
  {
    slug: "2025-mercedes-amg-g-63-us",
    name: "AMG G 63",
    drivetrain: "AWD",
    imageUrl: IMAGE_G63,
    imageAlt: "2025 Mercedes-AMG G 63 exterior (US)",
    imagePageUrl:
      "https://www.mbusa.com/en/vehicles/model/g-class/suv/g63w4",
    epaId: "48570",
    engine: {
      slug: "mercedes-m177-amg-g63",
      name: "Handcrafted AMG 4.0L V8 Biturbo with Hybrid Assist",
      code: "M177",
      fuelType: "PETROL",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin turbochargers",
      electrification: "48V mild hybrid (ISG)",
    },
    transmissionSlug: "mercedes-amg-speedshift-tct-9g",
    dimensions: {
      lengthIn: 191.9,
      widthIn: 78.1,
      heightIn: 77.9,
      wheelbaseIn: 113.8,
      groundClearanceIn: 9.5,
      curbWeightKg: lbsToKg(5842),
      cargoVolumeLiters: cuFtToLiters(37.4),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 577,
      torqueLbFt: 627,
      zeroToSixtySeconds: 4.2,
      topSpeedMph: 137,
    },
    fuelEconomy: { cityMpg: 14, highwayMpg: 16, combinedMpg: 15 },
    baseMsrpCents: 18610000,
    pressSourceSlug: "mbusa-2025-amg-g-63-qrg",
    priceSourceSlug: "mbusa-2025-amg-g-63-qrg",
  },
];

export async function seedMercedesGClass(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = SKIPPED_A_PRIORI.map(
    (s) => `${s.slug}: ${s.reason}`,
  );

  const pressSources = new Map<string, { id: string }>();
  for (const sourceData of PRESS_SOURCES) {
    const source = await prisma.source.upsert({
      where: { url: sourceData.url },
      create: {
        slug: sourceData.slug,
        title: sourceData.title,
        publisher: sourceData.publisher,
        url: sourceData.url,
        type: sourceData.type,
      },
      update: {
        title: sourceData.title,
        publisher: sourceData.publisher,
        type: sourceData.type,
      },
    });
    pressSources.set(sourceData.slug, source);
  }

  const destinationSource = await prisma.source.upsert({
    where: { url: DESTINATION_SOURCE.url },
    create: {
      slug: DESTINATION_SOURCE.slug,
      title: DESTINATION_SOURCE.title,
      publisher: DESTINATION_SOURCE.publisher,
      url: DESTINATION_SOURCE.url,
      type: DESTINATION_SOURCE.type,
    },
    update: {
      title: DESTINATION_SOURCE.title,
      publisher: DESTINATION_SOURCE.publisher,
      type: DESTINATION_SOURCE.type,
    },
  });

  const transmissions = {
    "mercedes-9g-tronic": await prisma.transmission.upsert({
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
    }),
    "mercedes-amg-speedshift-tct-9g": await prisma.transmission.upsert({
      where: { slug: "mercedes-amg-speedshift-tct-9g" },
      create: {
        slug: "mercedes-amg-speedshift-tct-9g",
        name: "AMG SPEEDSHIFT TCT 9G",
        type: "AUTOMATIC",
        gearCount: 9,
      },
      update: {
        name: "AMG SPEEDSHIFT TCT 9G",
        type: "AUTOMATIC",
        gearCount: 9,
      },
    }),
  } as const;

  const model = await prisma.vehicleModel.upsert({
    where: { slug: "mercedes-g-class" },
    create: {
      manufacturerId,
      name: "G-Class",
      slug: "mercedes-g-class",
    },
    update: {
      manufacturerId,
      name: "G-Class",
    },
  });

  const generation = await prisma.vehicleGeneration.upsert({
    where: {
      modelId_code: { modelId: model.id, code: "W465" },
    },
    create: {
      modelId: model.id,
      code: "W465",
      displayName: "Second generation (W465)",
      startYear: 2024,
    },
    update: {
      displayName: "Second generation (W465)",
      startYear: 2024,
    },
  });

  const modelYear = await prisma.modelYear.upsert({
    where: {
      generationId_year: { generationId: generation.id, year: 2025 },
    },
    create: { generationId: generation.id, year: 2025 },
    update: {},
  });

  for (const trim of TRIMS) {
    try {
      const imageUrl = await assertImageUrlOk(trim.imageUrl);
      const imageSource = await ensureImageSource(prisma, {
        slug: `mbusa-image-${trim.slug}`,
        title: trim.imageAlt,
        pageUrl: trim.imagePageUrl,
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
      const priceSource = pressSources.get(trim.priceSourceSlug);
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
          pressSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "MBUSA Quick Reference Guide performance specifications",
        ),
        upsertCitation(
          prisma,
          pressSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "MBUSA Quick Reference Guide dimensions / technical data",
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
          "Destination and delivery $1,150",
        ),
        upsertCitation(
          prisma,
          imageSource.id,
          "VehicleImage",
          image.id,
          "url",
          "Mercedes-Benz USA exterior IRIS still",
        ),
      ]);

      await ensureAudit(prisma, importerId, vehicle.id, trim.slug);

      seeded.push(
        `${trim.slug} | EPA=${trim.epaId} | image=${trim.imageUrl}`,
      );
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      skipped.push(`${trim.slug}: ${reason}`);
    }
  }

  return { seeded, skipped };
}
