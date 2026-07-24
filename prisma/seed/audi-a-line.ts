/**
 * Audi A-line seed module (US market) — A3, A4, A5, A6, A7, A8.
 * Prefer MY 2025 with EPA / manufacturer / press specs. A1 skipped (not sold in US).
 * Idempotent — safe to re-run. Wired from prisma/seed.ts.
 */
import {
  AUDI_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureAudiEngine,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./audi-shared";

const LBS_TO_KG = 0.45359237;
const CUFT_TO_L = 28.316846592;
const MM_TO_IN = 1 / 25.4;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function cuFtToLiters(cuFt: number) {
  return Math.round(cuFt * CUFT_TO_L * 10) / 10;
}

function mmToIn(mm: number) {
  return Math.round(mm * MM_TO_IN * 10) / 10;
}

type ModelSlug =
  | "audi-a3"
  | "audi-a4"
  | "audi-a5"
  | "audi-a6"
  | "audi-a7"
  | "audi-a8";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: string;
  year: 2025;
  generationCode: string;
  generationDisplayName: string;
  generationStartYear: number;
  bodyStyle: "SEDAN" | "HATCHBACK";
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
    configuration: string;
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
    topSpeedMph?: number;
  };
  fuelEconomy: {
    cityMpg: number;
    highwayMpg: number;
    combinedMpg: number;
  };
  /** BASE_MSRP in cents (excludes destination). */
  baseMsrpCents: number;
  audiSpecUrl: string;
  audiSpecTitle: string;
};

/**
 * Unique auto-data.net exteriors (verified — no interiors).
 * Different angle/color per trim.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2025-audi-a3-premium-40-tfsi-quattro-us",
    name: "A3 Premium 40 TFSI quattro",
    modelSlug: "audi-a3",
    modelName: "A3",
    year: 2025,
    generationCode: "8Y",
    generationDisplayName: "Fourth generation (8Y)",
    generationStartYear: 2020,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f110/Audi-A3-Sedan-8Y-facelift-2024.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/audi-a3-sedan-8y-facelift-2024-generation-9913",
    imageAlt: "2025 Audi A3 Premium 40 TFSI quattro sedan exterior",
    epaId: "47969",
    engine: {
      slug: "audi-ea888-201",
      name: "2.0L Inline-4 turbo mild hybrid (40 TFSI)",
      code: "EA888-201",
      displacementCc: 1984,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: "Mild hybrid",
    },
    transmission: {
      slug: "audi-s-tronic-7",
      name: "7-speed S tronic dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // Car and Driver OEM sheet for Premium 40 TFSI quattro.
      lengthIn: 176.9,
      widthIn: 71.5,
      heightIn: 56.2,
      wheelbaseIn: 103.5,
      frontTrackIn: 60.7,
      rearTrackIn: 59.6,
      curbWeightKg: lbsToKg(3461),
      cargoVolumeLiters: cuFtToLiters(10.9),
      seatingCapacity: 5,
    },
    performance: {
      // HP Edmunds/KBB; torque C&D OEM; 0–60 Edmunds mfr / auto-data; top KBB.
      powerHp: 201,
      torqueLbFt: 221,
      zeroToSixtySeconds: 6.0,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 24, highwayMpg: 34, combinedMpg: 28 },
    // EPA / Audi dealer $38,200 excl. $1,295 destination.
    baseMsrpCents: 3820000,
    audiSpecUrl:
      "https://www.caranddriver.com/audi/a3/specs/2025/audi_a3_audi-a3_2025",
    audiSpecTitle: "2025 Audi A3 Premium 40 TFSI quattro — Car and Driver specs",
  },
  {
    slug: "2025-audi-a4-s-line-premium-45-tfsi-quattro-us",
    name: "A4 S line Premium 45 TFSI quattro",
    modelSlug: "audi-a4",
    modelName: "A4",
    year: 2025,
    generationCode: "B9",
    generationDisplayName: "Fifth generation facelift (B9 / 8W)",
    generationStartYear: 2016,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f0/Audi-A4-B9-8W-facelift-2019.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/audi-a4-b9-8w-facelift-2019-generation-7119",
    imageAlt: "2025 Audi A4 S line Premium 45 TFSI quattro sedan exterior",
    epaId: "47974",
    engine: {
      slug: "audi-ea888-261",
      name: "2.0L Inline-4 turbo mild hybrid (45 TFSI)",
      code: "EA888-261",
      displacementCc: 1984,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: "12V mild hybrid",
    },
    transmission: {
      slug: "audi-s-tronic-7",
      name: "7-speed S tronic dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // C&D / CareEdge; tracks C&D.
      lengthIn: 187.5,
      widthIn: 72.7,
      heightIn: 56.2,
      wheelbaseIn: 111.0,
      frontTrackIn: 61.9,
      rearTrackIn: 61.2,
      curbWeightKg: lbsToKg(3705),
      cargoVolumeLiters: cuFtToLiters(12),
      seatingCapacity: 5,
    },
    performance: {
      // 261 hp / 273 lb-ft; 0–60 Audi dealer claim 5.2s; top 130 mph.
      powerHp: 261,
      torqueLbFt: 273,
      zeroToSixtySeconds: 5.2,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 23, highwayMpg: 32, combinedMpg: 26 },
    // US News / iSeeCars $44,100 excl. destination.
    baseMsrpCents: 4410000,
    audiSpecUrl: "https://cars.usnews.com/cars-trucks/audi/a4/specs",
    audiSpecTitle: "2025 Audi A4 configurations — U.S. News",
  },
  {
    slug: "2025-audi-a5-premium-plus-quattro-us",
    name: "A5 Premium Plus",
    modelSlug: "audi-a5",
    modelName: "A5",
    year: 2025,
    generationCode: "B10",
    generationDisplayName: "Third generation (B10)",
    generationStartYear: 2024,
    bodyStyle: "HATCHBACK",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f128/Audi-A5-Sedan-B10.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/audi-a5-sedan-b10-generation-10094",
    imageAlt: "2025 Audi A5 Premium Plus quattro exterior",
    epaId: "49040",
    engine: {
      slug: "audi-ea888-268",
      name: "2.0L Inline-4 turbo 48V mild hybrid",
      code: "EA888-268",
      displacementCc: 1984,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: "48V mild hybrid",
    },
    transmission: {
      slug: "audi-s-tronic-7",
      name: "7-speed S tronic dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // C&D / MotorTrend; tracks auto-data.net B10 (1618 / 1605 mm).
      lengthIn: 190.1,
      widthIn: 73.2,
      heightIn: 57.0,
      wheelbaseIn: 113.8,
      frontTrackIn: mmToIn(1618),
      rearTrackIn: mmToIn(1605),
      curbWeightKg: lbsToKg(4100),
      cargoVolumeLiters: cuFtToLiters(22.6),
      seatingCapacity: 5,
    },
    performance: {
      // C&D / KBB 268 hp, 295 lb-ft; 0–60 auto-data / KBB 5.6s; top 130.
      powerHp: 268,
      torqueLbFt: 295,
      zeroToSixtySeconds: 5.6,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 22, highwayMpg: 31, combinedMpg: 26 },
    // Edmunds Premium Plus starting MSRP excl. destination.
    baseMsrpCents: 5259500,
    audiSpecUrl: "https://www.caranddriver.com/audi/a5-2025",
    audiSpecTitle: "2025 Audi A5 Sedan — Car and Driver",
  },
  {
    slug: "2025-audi-a6-premium-plus-45-tfsi-quattro-us",
    name: "A6 Premium Plus 45 TFSI quattro",
    modelSlug: "audi-a6",
    modelName: "A6",
    year: 2025,
    generationCode: "C8",
    generationDisplayName: "Fifth generation facelift (C8)",
    generationStartYear: 2018,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f51/Audi-A6-Limousine-C8-facelift-2023.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/audi-a6-limousine-c8-facelift-2023-generation-9794",
    imageAlt: "2025 Audi A6 Premium Plus 45 TFSI quattro sedan exterior",
    epaId: "48009",
    engine: {
      slug: "audi-ea888-261",
      name: "2.0L Inline-4 turbo mild hybrid (45 TFSI)",
      code: "EA888-261",
      displacementCc: 1984,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: "12V mild hybrid",
    },
    transmission: {
      slug: "audi-s-tronic-7",
      name: "7-speed S tronic dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // Edmunds / JD Power / Galpin.
      lengthIn: 194.4,
      widthIn: 74.3,
      heightIn: 57.4,
      wheelbaseIn: 115.1,
      frontTrackIn: 64.2,
      rearTrackIn: 63.7,
      curbWeightKg: lbsToKg(4101),
      cargoVolumeLiters: cuFtToLiters(13.7),
      seatingCapacity: 5,
    },
    performance: {
      // 261 hp / 273 lb-ft; 0–60 Audi dealer 5.8s.
      powerHp: 261,
      torqueLbFt: 273,
      zeroToSixtySeconds: 5.8,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 24, highwayMpg: 31, combinedMpg: 26 },
    // Audi Elk Grove Premium Plus from $62,800 excl. destination.
    baseMsrpCents: 6280000,
    audiSpecUrl: "https://research.audielkgrove.com/audi-a6/",
    audiSpecTitle: "2025 Audi A6 lineup — Research Audi Elk Grove",
  },
  {
    slug: "2025-audi-a7-premium-plus-55-tfsi-quattro-us",
    name: "A7 Premium Plus 55 TFSI quattro",
    modelSlug: "audi-a7",
    modelName: "A7",
    year: 2025,
    generationCode: "C8",
    generationDisplayName: "Second generation facelift (C8)",
    generationStartYear: 2018,
    bodyStyle: "HATCHBACK",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f119/Audi-A7-Sportback-C8-facelift-2023.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/audi-a7-sportback-c8-facelift-2023-generation-9801",
    imageAlt: "2025 Audi A7 Premium Plus 55 TFSI quattro Sportback exterior",
    epaId: "48011",
    engine: {
      slug: "audi-ea839-335",
      name: "3.0L V6 turbo 48V mild hybrid (55 TFSI)",
      code: "EA839-335",
      displacementCc: 2995,
      cylinderCount: 6,
      configuration: "V",
      induction: "Turbocharger",
      electrification: "48V mild hybrid",
    },
    transmission: {
      slug: "audi-s-tronic-7",
      name: "7-speed S tronic dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // Edmunds / C&D.
      lengthIn: 195.6,
      widthIn: 75.1,
      heightIn: 56.0,
      wheelbaseIn: 115.2,
      frontTrackIn: 65.0,
      rearTrackIn: 64.4,
      curbWeightKg: lbsToKg(4343),
      cargoVolumeLiters: cuFtToLiters(24.9),
      seatingCapacity: 5,
    },
    performance: {
      // Edmunds / KBB 335 hp, 369 lb-ft; 0–60 5.2s; top 130.
      powerHp: 335,
      torqueLbFt: 369,
      zeroToSixtySeconds: 5.2,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 22, highwayMpg: 30, combinedMpg: 25 },
    // Edmunds $77,700 excl. destination (C&D $78,995 incl.).
    baseMsrpCents: 7770000,
    audiSpecUrl:
      "https://www.caranddriver.com/audi/a7/specs/2025/audi_a7_audi-a7_2025",
    audiSpecTitle: "2025 Audi A7 Premium Plus 55 TFSI quattro — Car and Driver",
  },
  {
    slug: "2025-audi-a8-l-55-tfsi-quattro-us",
    name: "A8 L 55 TFSI quattro",
    modelSlug: "audi-a8",
    modelName: "A8",
    year: 2025,
    generationCode: "D5",
    generationDisplayName: "Fourth generation facelift (D5)",
    generationStartYear: 2017,
    bodyStyle: "SEDAN",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f86/Audi-A8-Long-D5-facelift-2021.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/audi-a8l-d5-facelift-2021-generation-8674",
    imageAlt: "2025 Audi A8 L 55 TFSI quattro exterior",
    epaId: "48036",
    engine: {
      slug: "audi-ea839-335",
      name: "3.0L V6 turbo 48V mild hybrid (55 TFSI)",
      code: "EA839-335",
      displacementCc: 2995,
      cylinderCount: 6,
      configuration: "V",
      induction: "Turbocharger",
      electrification: "48V mild hybrid",
    },
    transmission: {
      slug: "audi-tiptronic-8",
      name: "8-speed Tiptronic automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // C&D / The Car Connection / U.S. News.
      lengthIn: 208.7,
      widthIn: 76.6,
      heightIn: 58.6,
      wheelbaseIn: 123.2,
      frontTrackIn: 64.7,
      rearTrackIn: 64.3,
      curbWeightKg: lbsToKg(4773),
      cargoVolumeLiters: cuFtToLiters(12.5),
      seatingCapacity: 5,
    },
    performance: {
      // C&D / Edmunds 335 hp, 369 lb-ft; 0–60 Edmunds 5.6s.
      powerHp: 335,
      torqueLbFt: 369,
      zeroToSixtySeconds: 5.6,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 20, highwayMpg: 26, combinedMpg: 22 },
    // Edmunds $92,000 excl.; Cars.com $93,295 incl. $1,295 destination.
    baseMsrpCents: 9200000,
    audiSpecUrl:
      "https://www.caranddriver.com/audi/a8/specs/2025/audi_a8_audi-a8_2025",
    audiSpecTitle: "2025 Audi A8 L 55 TFSI quattro — Car and Driver",
  },
];

const STATIC_SKIPPED = [
  "A1: not sold in the US market",
  "A3 FWD: US MY 2025 listings emphasize Premium quattro; FWD not seeded without separate full EPA/MSRP package",
  "A4 40 TFSI: streamlining left 45 TFSI as primary US powertrain for late MY 2025 (seeded S line Premium 45)",
  "A4 allroad: wagon body; out of A-line sedan/Sportback scope for this module",
  "A5 Sportback (prior gen carryover): superseded by B10 A5 sedan for current US lineup",
  "A6 55 TFSI: skip unless separately fully sourced; seeded representative 45 TFSI Premium Plus",
  "A7 Premium / Prestige: Premium Plus fully sourced as representative trim",
  "A8 (non-L): US market offers A8 L only for 55 TFSI",
];

const DESTINATION_SOURCE = {
  slug: "cars-com-2025-audi-a8-destination",
  title: "2025 Audi A8 pricing includes $1,295 destination (Cars.com)",
  url: "https://www.cars.com/articles/2025-audi-a8-updated-design-expanded-tech-and-new-trim-options-2-489584/",
  type: "THIRD_PARTY" as const,
  publisher: "Cars.com",
};

export async function seedAudiALine(
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
        slug: `audi-aline-${trim.slug}-specs`,
        title: trim.audiSpecTitle,
        publisher: "Car and Driver / third-party catalogue",
        url: trim.audiSpecUrl,
        type: "THIRD_PARTY",
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
          description: `2025 Audi ${trim.name} (US).`,
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
          description: `2025 Audi ${trim.name} (US).`,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
      });

      const performanceData = {
        powerHp: trim.performance.powerHp,
        torqueLbFt: trim.performance.torqueLbFt,
        zeroToSixtySeconds: trim.performance.zeroToSixtySeconds,
        ...(trim.performance.topSpeedMph != null
          ? { topSpeedMph: trim.performance.topSpeedMph }
          : {}),
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
          "Power, torque, and 0–60 mph from cited catalogue / press",
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
          `Destination and handling $${(AUDI_DESTINATION_CENTS / 100).toFixed(0)}`,
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
