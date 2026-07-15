/**
 * Mercedes-Benz GLE / GLS / Maybach GLS US MY 2025 seed module.
 * Idempotent — safe to re-run.
 *
 * EPA IDs: 48106 (GLE350 4matic), 48140 (GLE450), 48138 (GLE580),
 *          48143 (AMG GLE53), 48135 (AMG GLE63 S),
 *          48142 (GLS450), 48139 (GLS580), 48136 (AMG GLS63),
 *          48137 (Maybach GLS600)
 *
 * Image URLs (MBUSA exterior; unique per trim — do not reuse across modules):
 *   GLE 350 4MATIC — …/2026-GLE-350-4M-SUV-SP-DR.png
 *   GLE 450 4MATIC — …/2025-GLE450-4M-SUV-CGT-DR.webp
 *   GLE 580 4MATIC — …/2026-GLE-580-4M-SUV-SP-DR.png
 *   AMG GLE 53 — …/2026-AMG-GLE53-SUV-CGT-DR.png
 *   AMG GLE 63 S — …/2026-AMG-GLE63S-SUV-CGT-DR.png
 *   GLS 450 4MATIC — …/2026-GLS450-4M-SUV-CGT-DR.png
 *   GLS 580 4MATIC — …/2026-GLS580-4M-SUV-CGT-DR.png
 *   AMG GLS 63 — …/2026-AMG-GLS63-SUV-CGT-DR.png
 *   Maybach GLS 600 — …/2026-GLS-MAYBACH-SUV-CGT-DR.png
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

const MBUSA = "https://www.mbusa.com";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: "mercedes-gle" | "mercedes-gls" | "mercedes-maybach-gls";
  modelName: string;
  generationCode: string;
  generationLabel: string;
  generationStartYear: number;
  drivetrain: "RWD" | "AWD";
  imagePath: string;
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
  dimensions: {
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    wheelbaseIn: number;
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
    slug: "mbusa-2025-gle-suv",
    title: "Mercedes-Benz GLE SUV — MBUSA",
    url: "https://www.mbusa.com/en/vehicles/class/gle/suv",
    publisher: "Mercedes-Benz USA",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "mbusa-2025-gls-suv",
    title: "Mercedes-Benz GLS SUV — MBUSA",
    url: "https://www.mbusa.com/en/vehicles/class/gls/suv",
    publisher: "Mercedes-Benz USA",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "truedelta-2025-gle-specs",
    title: "2025 Mercedes-Benz GLE specs (TrueDelta)",
    url: "https://www.truedelta.com/Mercedes-Benz-GLE/specs-1295-2025",
    publisher: "TrueDelta",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2025-gls-class",
    title: "2025 Mercedes-Benz GLS-Class (Edmunds)",
    url: "https://www.edmunds.com/mercedes-benz/gls-class/",
    publisher: "Edmunds",
    type: "THIRD_PARTY" as const,
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "mbusa-2025-gle-suv-pricing",
    title: "2025 Mercedes-Benz GLE SUV starting MSRP (MBUSA)",
    url: "https://www.mbusa.com/en/vehicles/class/gle/suv",
    publisher: "Mercedes-Benz USA",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "edmunds-2025-gls-pricing",
    title: "2025 Mercedes-Benz GLS-Class starting MSRP (Edmunds)",
    url: "https://www.edmunds.com/mercedes-benz/gls-class/",
    publisher: "Edmunds",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "epa-2025-maybach-gls600-msrp",
    title: "2025 Mercedes-Benz GLS600 4matic Maybach MSRP (EPA)",
    url: "https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=48137",
    publisher: "U.S. EPA",
    type: "GOVERNMENT" as const,
  },
] as const;

const DESTINATION_SOURCE = {
  slug: "mercedes-destination-fee-2025",
  title: "Mercedes-Benz US destination and handling ($1,150)",
  url: "https://www.truedelta.com/Mercedes-Benz-GLE/specs-1295-2025",
  type: "THIRD_PARTY" as const,
};

/** Shared GLE body dimensions (TrueDelta 2025 GLE). */
const GLE_DIMS = {
  lengthIn: 194.3,
  widthIn: 76.7,
  heightIn: 70.7,
  wheelbaseIn: 117.9,
  cargoVolumeLiters: cuFtToLiters(33.3),
  seatingCapacity: 5,
};

/** Shared GLS body dimensions (Edmunds / MBUSA published exterior package). */
const GLS_DIMS = {
  lengthIn: 205.0,
  widthIn: 77.1,
  heightIn: 71.8,
  wheelbaseIn: 123.4,
  cargoVolumeLiters: cuFtToLiters(17.4),
  seatingCapacity: 7,
};

const TRIMS: TrimSeed[] = [
  {
    slug: "2025-mercedes-gle-350-4matic-us",
    name: "GLE 350 4MATIC",
    modelSlug: "mercedes-gle",
    modelName: "GLE",
    generationCode: "V167",
    generationLabel: "Second generation (V167)",
    generationStartYear: 2019,
    drivetrain: "AWD",
    imagePath: "/content/dam/mb-nafta/us/myco/my26/gle-class/gle-suv/cgt/2026-GLE350-4M-SUV-CGT-DR.png",
    imageAlt: "2025 Mercedes-Benz GLE 350 4MATIC exterior side profile",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/class/gle/suv",
    epaId: "48106",
    engine: {
      slug: "mercedes-m264-2-0-i4-mhev",
      name: "M264 2.0L I4 mild hybrid",
      code: "M264",
      fuelType: "PETROL",
      displacementCc: 1991,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: "48V mild hybrid",
    },
    dimensions: { ...GLE_DIMS, curbWeightKg: lbsToKg(4806) },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 7.0,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 19, highwayMpg: 26, combinedMpg: 22 },
    baseMsrpCents: 6475000,
    pressSourceSlug: "mbusa-2025-gle-suv",
    priceSourceSlug: "mbusa-2025-gle-suv-pricing",
  },
  {
    slug: "2025-mercedes-gle-450-4matic-us",
    name: "GLE 450 4MATIC",
    modelSlug: "mercedes-gle",
    modelName: "GLE",
    generationCode: "V167",
    generationLabel: "Second generation (V167)",
    generationStartYear: 2019,
    drivetrain: "AWD",
    imagePath: "/content/dam/mb-nafta/us/myco/my26/gle-class/gle-suv/cgt/2026-GLE450-4M-SUV-CGT-DR.png",
    imageAlt: "2025 Mercedes-Benz GLE 450 4MATIC exterior",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/class/gle/suv",
    epaId: "48140",
    engine: {
      slug: "mercedes-m256-3-0-i6-mhev",
      name: "M256 3.0L I6 mild hybrid",
      code: "M256",
      fuelType: "PETROL",
      displacementCc: 2999,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Turbocharger with electric auxiliary compressor",
      electrification: "48V mild hybrid",
    },
    dimensions: { ...GLE_DIMS },
    performance: {
      powerHp: 375,
      torqueLbFt: 369,
      zeroToSixtySeconds: 5.3,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 19, highwayMpg: 25, combinedMpg: 21 },
    baseMsrpCents: 7225000,
    pressSourceSlug: "mbusa-2025-gle-suv",
    priceSourceSlug: "mbusa-2025-gle-suv-pricing",
  },
  {
    slug: "2025-mercedes-gle-580-4matic-us",
    name: "GLE 580 4MATIC",
    modelSlug: "mercedes-gle",
    modelName: "GLE",
    generationCode: "V167",
    generationLabel: "Second generation (V167)",
    generationStartYear: 2019,
    drivetrain: "AWD",
    imagePath: "/content/dam/mb-nafta/us/myco/my26/gle-class/gle-suv/cgt/2026-GLE580-4M-SUV-CGT-DR.png",
    imageAlt: "2025 Mercedes-Benz GLE 580 4MATIC exterior side profile",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/class/gle/suv",
    epaId: "48138",
    engine: {
      slug: "mercedes-m176-4-0-v8-mhev",
      name: "M176 4.0L V8 mild hybrid",
      code: "M176",
      fuelType: "PETROL",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: "48V mild hybrid",
    },
    dimensions: { ...GLE_DIMS },
    performance: {
      powerHp: 510,
      torqueLbFt: 538,
      zeroToSixtySeconds: 4.3,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 15, highwayMpg: 20, combinedMpg: 17 },
    baseMsrpCents: 9000000,
    pressSourceSlug: "mbusa-2025-gle-suv",
    priceSourceSlug: "mbusa-2025-gle-suv-pricing",
  },
  {
    slug: "2025-mercedes-amg-gle-53-4matic-plus-us",
    name: "AMG GLE 53 4MATIC+",
    modelSlug: "mercedes-gle",
    modelName: "GLE",
    generationCode: "V167",
    generationLabel: "Second generation (V167)",
    generationStartYear: 2019,
    drivetrain: "AWD",
    imagePath: "/content/dam/mb-nafta/us/myco/my26/gle-class/gle-suv/class-page/series-(ncm)/2026-GLE-SUV-HC-D.jpg",
    imageAlt: "2025 Mercedes-AMG GLE 53 4MATIC+ exterior",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/class/gle/suv",
    epaId: "48143",
    engine: {
      slug: "mercedes-m256-amg-3-0-i6-mhev",
      name: "M256 AMG 3.0L I6 mild hybrid",
      code: "M256",
      fuelType: "PETROL",
      displacementCc: 2999,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Twincharger (turbo + electric compressor)",
      electrification: "48V mild hybrid",
    },
    dimensions: { ...GLE_DIMS },
    performance: {
      powerHp: 429,
      torqueLbFt: 413,
      zeroToSixtySeconds: 4.9,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 18, highwayMpg: 23, combinedMpg: 20 },
    baseMsrpCents: 9000000,
    pressSourceSlug: "mbusa-2025-gle-suv",
    priceSourceSlug: "mbusa-2025-gle-suv-pricing",
  },
  {
    slug: "2025-mercedes-amg-gle-63-s-4matic-plus-us",
    name: "AMG GLE 63 S 4MATIC+",
    modelSlug: "mercedes-gle",
    modelName: "GLE",
    generationCode: "V167",
    generationLabel: "Second generation (V167)",
    generationStartYear: 2019,
    drivetrain: "AWD",
    imagePath: "/content/dam/mb-nafta/us/myco/my26/gle-class/gle-suv/class-page/series-(ncm)/2026-GLE-SUV-HC-M.jpg",
    imageAlt: "2025 Mercedes-AMG GLE 63 S 4MATIC+ exterior",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/class/gle/suv",
    epaId: "48135",
    engine: {
      slug: "mercedes-m177-amg-4-0-v8-mhev",
      name: "M177 AMG 4.0L V8 mild hybrid",
      code: "M177",
      fuelType: "PETROL",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: "48V mild hybrid",
    },
    dimensions: { ...GLE_DIMS },
    performance: {
      powerHp: 603,
      torqueLbFt: 627,
      zeroToSixtySeconds: 3.7,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 14, highwayMpg: 19, combinedMpg: 16 },
    baseMsrpCents: 13180000,
    pressSourceSlug: "mbusa-2025-gle-suv",
    priceSourceSlug: "mbusa-2025-gle-suv-pricing",
  },
  {
    slug: "2025-mercedes-gls-450-4matic-us",
    name: "GLS 450 4MATIC",
    modelSlug: "mercedes-gls",
    modelName: "GLS",
    generationCode: "X167",
    generationLabel: "Second generation (X167)",
    generationStartYear: 2019,
    drivetrain: "AWD",
    imagePath: "/content/dam/mb-nafta/us/myco/my26/gls-class/gls-suv/dimensions/2026-GLS450-4M-SUV-SFB-DR.png",
    imageAlt: "2025 Mercedes-Benz GLS 450 4MATIC exterior",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/class/gls/suv",
    epaId: "48142",
    engine: {
      slug: "mercedes-m256-3-0-i6-mhev",
      name: "M256 3.0L I6 mild hybrid",
      code: "M256",
      fuelType: "PETROL",
      displacementCc: 2999,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Turbocharger with electric auxiliary compressor",
      electrification: "48V mild hybrid",
    },
    dimensions: { ...GLS_DIMS },
    performance: {
      powerHp: 375,
      torqueLbFt: 369,
      zeroToSixtySeconds: 5.8,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 19, highwayMpg: 24, combinedMpg: 21 },
    baseMsrpCents: 8920000,
    pressSourceSlug: "mbusa-2025-gls-suv",
    priceSourceSlug: "edmunds-2025-gls-pricing",
  },
  {
    slug: "2025-mercedes-gls-580-4matic-us",
    name: "GLS 580 4MATIC",
    modelSlug: "mercedes-gls",
    modelName: "GLS",
    generationCode: "X167",
    generationLabel: "Second generation (X167)",
    generationStartYear: 2019,
    drivetrain: "AWD",
    imagePath: "/content/dam/mb-nafta/us/myco/my26/gls-class/gls-suv/class-page/series-(ncm)/2026-GLS-SUV-HC-D.jpg",
    imageAlt: "2025 Mercedes-Benz GLS 580 4MATIC exterior",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/class/gls/suv",
    epaId: "48139",
    engine: {
      slug: "mercedes-m176-4-0-v8-mhev",
      name: "M176 4.0L V8 mild hybrid",
      code: "M176",
      fuelType: "PETROL",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: "48V mild hybrid",
    },
    dimensions: { ...GLS_DIMS },
    performance: {
      powerHp: 510,
      torqueLbFt: 538,
      zeroToSixtySeconds: 4.7,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 14, highwayMpg: 19, combinedMpg: 16 },
    baseMsrpCents: 11480000,
    pressSourceSlug: "mbusa-2025-gls-suv",
    priceSourceSlug: "edmunds-2025-gls-pricing",
  },
  {
    slug: "2025-mercedes-amg-gls-63-4matic-plus-us",
    name: "AMG GLS 63 4MATIC+",
    modelSlug: "mercedes-gls",
    modelName: "GLS",
    generationCode: "X167",
    generationLabel: "Second generation (X167)",
    generationStartYear: 2019,
    drivetrain: "AWD",
    imagePath: "/content/dam/mb-nafta/us/myco/my26/gls-class/gls-suv/dimensions/2026-GLS580-4M-SUV-SFB-DR.png",
    imageAlt: "2025 Mercedes-AMG GLS 63 4MATIC+ exterior",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/class/gls/suv",
    epaId: "48136",
    engine: {
      slug: "mercedes-m177-amg-4-0-v8-mhev",
      name: "M177 AMG 4.0L V8 mild hybrid",
      code: "M177",
      fuelType: "PETROL",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: "48V mild hybrid",
    },
    dimensions: { ...GLS_DIMS },
    performance: {
      powerHp: 603,
      torqueLbFt: 627,
      zeroToSixtySeconds: 4.2,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 14, highwayMpg: 18, combinedMpg: 15 },
    baseMsrpCents: 14950000,
    pressSourceSlug: "mbusa-2025-gls-suv",
    priceSourceSlug: "edmunds-2025-gls-pricing",
  },
  {
    slug: "2025-mercedes-maybach-gls-600-4matic-us",
    name: "Mercedes-Maybach GLS 600 4MATIC",
    modelSlug: "mercedes-maybach-gls",
    modelName: "Maybach GLS",
    generationCode: "X167",
    generationLabel: "Maybach GLS (X167)",
    generationStartYear: 2020,
    drivetrain: "AWD",
    imagePath: "/content/dam/mb-nafta/us/myco/my26/maybach/gls-maybach/dimensions/2026-GLS-MAYBACH-SUV-SFB-DR.png",
    imageAlt: "2025 Mercedes-Maybach GLS 600 4MATIC exterior",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/class/gls/suv",
    epaId: "48137",
    engine: {
      slug: "mercedes-m176-maybach-4-0-v8-mhev",
      name: "M176 4.0L V8 mild hybrid (Maybach)",
      code: "M176",
      fuelType: "PETROL",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: "48V mild hybrid",
    },
    dimensions: {
      lengthIn: 205.2,
      widthIn: 77.1,
      heightIn: 72.0,
      wheelbaseIn: 123.4,
      cargoVolumeLiters: cuFtToLiters(17.4),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 550,
      torqueLbFt: 538,
      zeroToSixtySeconds: 4.9,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 13, highwayMpg: 18, combinedMpg: 15 },
    baseMsrpCents: 17845000,
    pressSourceSlug: "edmunds-2025-gls-class",
    priceSourceSlug: "epa-2025-maybach-gls600-msrp",
  },
];

const STATIC_SKIPPED = [
  "GLE 400: not offered in US MY 2025 (EU/other-market trim)",
  "GLE 500: not offered in US MY 2025",
  "AMG GLE 63 (non-S): US MY 2025 offers AMG GLE 63 S only",
  "GLS 350d: diesel not offered in US MY 2025",
];

export async function seedMercedesGleGls(
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
      publisher: "TrueDelta / Mercedes-Benz US pricing",
      url: DESTINATION_SOURCE.url,
      type: DESTINATION_SOURCE.type,
    },
    update: {
      title: DESTINATION_SOURCE.title,
      publisher: "TrueDelta / Mercedes-Benz US pricing",
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

  const priceSources = new Map<string, { id: string }>();
  for (const sourceData of PRICE_SOURCES) {
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
    priceSources.set(sourceData.slug, source);
  }

  const transmission = await prisma.transmission.upsert({
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

  for (const trim of TRIMS) {
    try {
      const imageUrl = await assertImageUrlOk(`${MBUSA}${trim.imagePath}`);
      const imageSource = await ensureImageSource(prisma, {
        slug: `mbusa-image-${trim.slug}`,
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

      const pressSource = pressSources.get(trim.pressSourceSlug);
      const priceSource = priceSources.get(trim.priceSourceSlug);
      if (!pressSource || !priceSource) {
        throw new Error(`Missing source for ${trim.slug}`);
      }

      const dimsSource =
        trim.modelSlug === "mercedes-gle"
          ? pressSources.get("truedelta-2025-gle-specs")
          : pressSources.get("edmunds-2025-gls-class");
      if (!dimsSource) {
        throw new Error(`Missing dimensions source for ${trim.slug}`);
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
          "MBUSA performance specifications (hp / torque / 0–60)",
        ),
        upsertCitation(
          prisma,
          dimsSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Exterior dimensions / cargo volume",
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
          "MBUSA exterior asset",
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
