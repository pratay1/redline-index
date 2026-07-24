/**
 * Audi S / SQ seed module (US market).
 * Prefer MY 2025 S3–S8 and SQ5/SQ7/SQ8; skip S1/SQ2 (not US).
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 */
import {
  AUDI_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureAudiEngine,
  ensureImageSource,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./audi-shared";

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
  modelSlug: string;
  modelName: string;
  year: 2025;
  generationCode: string;
  generationLabel: string;
  generationStartYear: number;
  bodyStyle: "SEDAN" | "HATCHBACK" | "SUV";
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
    configuration: "Inline" | "V";
    induction: string;
    electrification: string | null;
  };
  transmission: {
    slug: string;
    name: string;
    type: "DUAL_CLUTCH" | "AUTOMATIC";
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
  audiSpecUrl: string;
};

/**
 * Unique encyCARpedia exterior assets (verified exteriors; no interiors).
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2025-audi-s3-premium-us",
    name: "S3 Premium",
    modelSlug: "audi-s3",
    modelName: "S3",
    year: 2025,
    generationCode: "8Y",
    generationLabel: "Fourth generation (8Y)",
    generationStartYear: 2020,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    imageUrl: "https://c.encycarpedia.com/ci/13564.jpg",
    imagePageUrl: "https://www.encycarpedia.com/us/audi/24-s3-sedan",
    imageAlt: "2025 Audi S3 Sedan exterior",
    epaId: "48150",
    engine: {
      slug: "audi-ea888-s3-2-0-tfsi",
      name: "2.0L Inline-4 TFSI turbo",
      code: "DNUE",
      displacementCc: 1984,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "audi-7-speed-s-tronic",
      name: "7-speed S tronic dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      lengthIn: 177.3,
      widthIn: 71.5,
      heightIn: 55.8,
      wheelbaseIn: 103.6,
      frontTrackIn: 60.8,
      rearTrackIn: 59.8,
      curbWeightKg: lbsToKg(3549),
      cargoVolumeLiters: cuFtToLiters(8.3),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 328,
      torqueLbFt: 310,
      zeroToSixtySeconds: 4.4,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 23, highwayMpg: 31, combinedMpg: 26 },
    // Audi USA starting MSRP excl. $1,295 destination.
    baseMsrpCents: 4870000,
    audiSpecUrl: "https://www.audiusa.com/en/models/a3/s3/2025/overview/",
  },
  {
    slug: "2025-audi-s4-premium-us",
    name: "S4 Premium",
    modelSlug: "audi-s4",
    modelName: "S4",
    year: 2025,
    generationCode: "B9",
    generationLabel: "Fifth generation (B9)",
    generationStartYear: 2017,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    imageUrl: "https://c.encycarpedia.com/ci/11569.jpg",
    imagePageUrl: "https://www.encycarpedia.com/us/audi/19-s4-tdi-sedan",
    imageAlt: "2025 Audi S4 Sedan exterior",
    epaId: "47973",
    engine: {
      slug: "audi-ea839-s4-3-0-tfsi",
      name: "3.0L V6 TFSI turbo",
      code: "CWGD",
      displacementCc: 2995,
      cylinderCount: 6,
      configuration: "V",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "audi-8-speed-tiptronic",
      name: "8-speed Tiptronic automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: 187.5,
      widthIn: 72.7,
      heightIn: 56.2,
      wheelbaseIn: 111.0,
      frontTrackIn: 61.9,
      rearTrackIn: 61.2,
      curbWeightKg: lbsToKg(3880),
      cargoVolumeLiters: cuFtToLiters(12.0),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 349,
      torqueLbFt: 369,
      zeroToSixtySeconds: 4.4,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 20, highwayMpg: 29, combinedMpg: 24 },
    baseMsrpCents: 5490000,
    audiSpecUrl: "https://www.caranddriver.com/audi/s4/specs/2025/audi_s4_audi-s4_2025",
  },
  {
    slug: "2025-audi-s5-sportback-premium-us",
    name: "S5 Sportback Premium",
    modelSlug: "audi-s5",
    modelName: "S5",
    year: 2025,
    generationCode: "B9",
    generationLabel: "Second generation (B9)",
    generationStartYear: 2017,
    bodyStyle: "HATCHBACK",
    drivetrain: "AWD",
    imageUrl: "https://c.encycarpedia.com/ci/11381.jpg",
    imagePageUrl: "https://www.encycarpedia.com/us/audi/19-s5-sportback-tdi-coupe",
    imageAlt: "2025 Audi S5 Sportback exterior",
    epaId: "48005",
    engine: {
      slug: "audi-ea839-s5-3-0-tfsi",
      name: "3.0L V6 TFSI turbo",
      code: "CWGD",
      displacementCc: 2995,
      cylinderCount: 6,
      configuration: "V",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "audi-8-speed-tiptronic",
      name: "8-speed Tiptronic automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: 187.2,
      widthIn: 72.6,
      heightIn: 54.6,
      wheelbaseIn: 111.2,
      frontTrackIn: 62.5,
      rearTrackIn: 61.7,
      curbWeightKg: lbsToKg(3924),
      cargoVolumeLiters: cuFtToLiters(21.8),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 349,
      torqueLbFt: 369,
      zeroToSixtySeconds: 4.5,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 20, highwayMpg: 29, combinedMpg: 23 },
    baseMsrpCents: 5790000,
    audiSpecUrl:
      "https://www.caranddriver.com/audi/s5/specs/2025/audi_s5-sportback_audi-s5-sportback_2025",
  },
  {
    slug: "2025-audi-s6-premium-us",
    name: "S6 Premium",
    modelSlug: "audi-s6",
    modelName: "S6",
    year: 2025,
    generationCode: "C8",
    generationLabel: "Fifth generation (C8)",
    generationStartYear: 2019,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    imageUrl: "https://c.encycarpedia.com/ci/11367.jpg",
    imagePageUrl: "https://www.encycarpedia.com/us/audi/19-s6-tdi-sedan",
    imageAlt: "2025 Audi S6 Sedan exterior",
    epaId: "48173",
    engine: {
      slug: "audi-ea839-s6-2-9-tfsi",
      name: "2.9L V6 TFSI twin-turbo mild hybrid",
      code: "DECA",
      displacementCc: 2894,
      cylinderCount: 6,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: "48V mild hybrid",
    },
    transmission: {
      slug: "audi-8-speed-tiptronic",
      name: "8-speed Tiptronic automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: 195.0,
      widthIn: 74.3,
      heightIn: 56.9,
      wheelbaseIn: 115.3,
      frontTrackIn: 64.3,
      rearTrackIn: 63.7,
      curbWeightKg: lbsToKg(4519),
      cargoVolumeLiters: cuFtToLiters(13.7),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 444,
      torqueLbFt: 442,
      zeroToSixtySeconds: 4.4,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 19, highwayMpg: 27, combinedMpg: 22 },
    baseMsrpCents: 7590000,
    audiSpecUrl: "https://www.caranddriver.com/audi/s6/specs/2025/audi_s6_audi-s6_2025",
  },
  {
    slug: "2025-audi-s7-premium-us",
    name: "S7 Premium",
    modelSlug: "audi-s7",
    modelName: "S7",
    year: 2025,
    generationCode: "C8",
    generationLabel: "Second generation (C8)",
    generationStartYear: 2019,
    bodyStyle: "HATCHBACK",
    drivetrain: "AWD",
    imageUrl: "https://c.encycarpedia.com/ci/11366.jpg",
    imagePageUrl: "https://www.encycarpedia.com/us/audi/19-s7-sportback-tdi-coupe",
    imageAlt: "2025 Audi S7 Sportback exterior",
    epaId: "48174",
    engine: {
      slug: "audi-ea839-s7-2-9-tfsi",
      name: "2.9L V6 TFSI twin-turbo mild hybrid",
      code: "DECA",
      displacementCc: 2894,
      cylinderCount: 6,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: "48V mild hybrid",
    },
    transmission: {
      slug: "audi-8-speed-tiptronic",
      name: "8-speed Tiptronic automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: 196.0,
      widthIn: 75.1,
      heightIn: 55.8,
      wheelbaseIn: 115.3,
      frontTrackIn: 65.1,
      rearTrackIn: 64.4,
      curbWeightKg: lbsToKg(4597),
      cargoVolumeLiters: cuFtToLiters(24.6),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 444,
      torqueLbFt: 442,
      zeroToSixtySeconds: 4.1,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 19, highwayMpg: 27, combinedMpg: 22 },
    baseMsrpCents: 8570000,
    audiSpecUrl: "https://www.caranddriver.com/audi/s7/specs/2025/audi_s7_audi-s7_2025",
  },
  {
    slug: "2025-audi-s8-us",
    name: "S8",
    modelSlug: "audi-s8",
    modelName: "S8",
    year: 2025,
    generationCode: "D5",
    generationLabel: "Fourth generation (D5)",
    generationStartYear: 2019,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    imageUrl: "https://c.encycarpedia.com/ci/12777.jpg",
    imagePageUrl: "https://www.encycarpedia.com/us/audi/22-s8-sedan",
    imageAlt: "2025 Audi S8 Sedan exterior",
    epaId: "48037",
    engine: {
      slug: "audi-ea825-s8-4-0-tfsi",
      name: "4.0L V8 TFSI twin-turbo mild hybrid",
      code: "CWUR",
      displacementCc: 3996,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: "48V mild hybrid",
    },
    transmission: {
      slug: "audi-8-speed-tiptronic",
      name: "8-speed Tiptronic automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: 209.0,
      widthIn: 76.6,
      heightIn: 58.6,
      wheelbaseIn: 123.2,
      frontTrackIn: 64.1,
      rearTrackIn: 63.7,
      curbWeightKg: lbsToKg(5126),
      cargoVolumeLiters: cuFtToLiters(12.5),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 563,
      torqueLbFt: 590,
      zeroToSixtySeconds: 3.8,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 15, highwayMpg: 24, combinedMpg: 18 },
    baseMsrpCents: 12530000,
    audiSpecUrl: "https://www.caranddriver.com/audi/s8/specs/2025/audi_s8_audi-s8_2025",
  },
  {
    slug: "2025-audi-sq5-premium-us",
    name: "SQ5 Premium",
    modelSlug: "audi-sq5",
    modelName: "SQ5",
    year: 2025,
    generationCode: "FY",
    generationLabel: "Second generation (FY)",
    generationStartYear: 2018,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://c.encycarpedia.com/ci/10990.jpg",
    imagePageUrl: "https://www.encycarpedia.com/us/audi/17-sq5-quattro-suv",
    imageAlt: "2025 Audi SQ5 SUV exterior",
    epaId: "48072",
    engine: {
      slug: "audi-ea839-sq5-3-0-tfsi",
      name: "3.0L V6 TFSI turbo",
      code: "CWGD",
      displacementCc: 2995,
      cylinderCount: 6,
      configuration: "V",
      induction: "Turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "audi-8-speed-tiptronic",
      name: "8-speed Tiptronic automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: 184.3,
      widthIn: 74.5,
      heightIn: 65.5,
      wheelbaseIn: 111.0,
      frontTrackIn: 63.6,
      rearTrackIn: 63.3,
      curbWeightKg: lbsToKg(4288),
      cargoVolumeLiters: cuFtToLiters(25.9),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 349,
      torqueLbFt: 369,
      zeroToSixtySeconds: 4.7,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 19, highwayMpg: 24, combinedMpg: 21 },
    baseMsrpCents: 5840000,
    audiSpecUrl: "https://www.caranddriver.com/audi/sq5/specs/2025/audi_sq5_audi-sq5_2025",
  },
  {
    slug: "2025-audi-sq7-premium-plus-us",
    name: "SQ7 Premium Plus",
    modelSlug: "audi-sq7",
    modelName: "SQ7",
    year: 2025,
    generationCode: "4M",
    generationLabel: "Second generation (4M)",
    generationStartYear: 2017,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://c.encycarpedia.com/ci/13502.jpg",
    imagePageUrl: "https://www.encycarpedia.com/us/audi/24-sq7-tfsi-suv",
    imageAlt: "2025 Audi SQ7 SUV exterior",
    epaId: "47806",
    engine: {
      slug: "audi-ea825-sq7-4-0-tfsi",
      name: "4.0L V8 TFSI twin-turbo",
      code: "DCUE",
      displacementCc: 3996,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "audi-8-speed-tiptronic",
      name: "8-speed Tiptronic automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: 199.6,
      widthIn: 77.6,
      heightIn: 68.5,
      wheelbaseIn: 117.9,
      frontTrackIn: 66.1,
      rearTrackIn: 66.6,
      curbWeightKg: lbsToKg(5291),
      cargoVolumeLiters: cuFtToLiters(14.2),
      seatingCapacity: 7,
    },
    performance: {
      powerHp: 500,
      torqueLbFt: 568,
      zeroToSixtySeconds: 4.0,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 15, highwayMpg: 21, combinedMpg: 17 },
    baseMsrpCents: 9080000,
    audiSpecUrl: "https://www.caranddriver.com/audi/sq7/specs/2025/audi_sq7_audi-sq7_2025",
  },
  {
    slug: "2025-audi-sq8-premium-plus-us",
    name: "SQ8 Premium Plus",
    modelSlug: "audi-sq8",
    modelName: "SQ8",
    year: 2025,
    generationCode: "4M",
    generationLabel: "First generation (4M)",
    generationStartYear: 2019,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://c.encycarpedia.com/ci/13371.jpg",
    imagePageUrl: "https://www.encycarpedia.com/us/audi/23-sq8-tfsi-suv",
    imageAlt: "2025 Audi SQ8 SUV exterior",
    epaId: "48114",
    engine: {
      slug: "audi-ea825-sq8-4-0-tfsi",
      name: "4.0L V8 TFSI twin-turbo",
      code: "DCUE",
      displacementCc: 3996,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "audi-8-speed-tiptronic",
      name: "8-speed Tiptronic automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      lengthIn: 196.6,
      widthIn: 78.5,
      heightIn: 67.2,
      wheelbaseIn: 117.9,
      frontTrackIn: 66.1,
      rearTrackIn: 66.6,
      curbWeightKg: lbsToKg(5269),
      cargoVolumeLiters: cuFtToLiters(30.5),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 500,
      torqueLbFt: 568,
      zeroToSixtySeconds: 4.0,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 15, highwayMpg: 21, combinedMpg: 17 },
    baseMsrpCents: 9760000,
    audiSpecUrl: "https://www.caranddriver.com/audi/sq8/specs/2025/audi_sq8_audi-sq8_2025",
  },
];

const STATIC_SKIPPED = [
  "S1: EU-only; not offered in US",
  "SQ2: EU-only; not offered in US",
  "S5 Coupe: US MY 2025 catalogue focuses on S5 Sportback (EPA id 48005)",
  "SQ5 Sportback: skipped in favor of SQ5 SUV Premium (EPA id 48072)",
  "SQ8 e-tron: EV SQ line deferred to e-tron seed module",
];

const DESTINATION_SOURCE = {
  slug: "audi-2025-us-destination-fee",
  title: "Audi of America 2025 model lineup — destination and delivery $1,295",
  url: "https://audiclubna.org/audi-of-america-updates-2025-model-lineup-with-trim-selections-compelling-option-packages-extended-connectivity-offerings/",
  type: "THIRD_PARTY" as const,
  publisher: "Audi Club North America",
};

export async function seedAudiSLine(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  const destinationSource = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE.slug,
    title: DESTINATION_SOURCE.title,
    publisher: DESTINATION_SOURCE.publisher,
    url: DESTINATION_SOURCE.url,
    type: DESTINATION_SOURCE.type,
  });

  const claimedImages = new Set<string>();
  const modelYearCache = new Map<string, string>();

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
      });

      const model = await prisma.vehicleModel.upsert({
        where: { slug: trim.modelSlug },
        create: {
          manufacturerId,
          name: trim.modelName,
          slug: trim.modelSlug,
        },
        update: { manufacturerId, name: trim.modelName },
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

      const myKey = `${generation.id}:${trim.year}`;
      let modelYearId = modelYearCache.get(myKey);
      if (!modelYearId) {
        const modelYear = await prisma.modelYear.upsert({
          where: {
            generationId_year: {
              generationId: generation.id,
              year: trim.year,
            },
          },
          create: { generationId: generation.id, year: trim.year },
          update: {},
        });
        modelYearId = modelYear.id;
        modelYearCache.set(myKey, modelYearId);
      }

      const engine = await ensureAudiEngine(prisma, {
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
        slug: `specs-${trim.slug}`,
        title: `Audi ${trim.name} specifications (US MY ${trim.year})`,
        publisher:
          trim.audiSpecUrl.includes("audiusa.com")
            ? "Audi USA"
            : "Car and Driver",
        url: trim.audiSpecUrl,
        type: trim.audiSpecUrl.includes("audiusa.com")
          ? "MANUFACTURER"
          : "THIRD_PARTY",
      });

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-2025-${trim.slug}`,
        title: `EPA Fuel Economy — 2025 Audi ${trim.name}`,
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

      const bodyLabel =
        trim.bodyStyle === "HATCHBACK"
          ? "Sportback"
          : trim.bodyStyle === "SUV"
            ? "SUV"
            : "Sedan";

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
          description: `2025 Audi ${trim.name} ${bodyLabel} (US).`,
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
          description: `2025 Audi ${trim.name} ${bodyLabel} (US).`,
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
              amountCents: AUDI_DESTINATION_CENTS,
              currency: "USD",
              effectiveAt: pricingDate,
            },
            update: {
              amountCents: AUDI_DESTINATION_CENTS,
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
          "Power, torque, 0–60 mph, and top speed",
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
          `Destination and delivery $${(AUDI_DESTINATION_CENTS / 100).toFixed(0)}`,
        ),
        upsertCitation(
          prisma,
          imageSource.id,
          "VehicleImage",
          image.id,
          "url",
          "encyCARpedia exterior asset",
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
