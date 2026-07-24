/**
 * Mercedes-Benz SL Roadster (R232) + CLE Coupe (C236) US MY 2025 seed module.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Seeded: AMG SL 43 / 55 / 63 / 63 S E Performance; CLE 300 / 450; AMG CLE 53 (coupes).
 * Skipped: historic SL 300–550 / AMG SL 65; CLE 200 (EU); AMG CLE 63 (not US MY2025);
 *          SLK / SLC lines (discontinued; incomplete current US catalogue data).
 */
import {
  MERCEDES_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureMercedesEngine,
  upsertCatalogueSource,
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

type TrimSeed = {
  slug: string;
  name: string;
  bodyStyle: "ROADSTER" | "COUPE";
  drivetrain: "RWD" | "AWD";
  modelSlug: "mercedes-sl" | "mercedes-cle";
  modelName: string;
  generationCode: string;
  generationName: string;
  generationStartYear: number;
  imageUrl: string;
  imageAlt: string;
  imagePageUrl: string;
  epaId: string;
  engine: {
    slug: string;
    name: string;
    code: string;
    fuelType: "PETROL" | "HYBRID" | "PLUG_IN_HYBRID";
    displacementCc: number;
    cylinderCount: number;
    configuration: string;
    induction: string;
    electrification: string | null;
  };
  transmissionSlug: string;
  transmissionName: string;
  dimensions: {
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    wheelbaseIn: number;
    frontTrackIn?: number;
    rearTrackIn?: number;
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
  specSource: {
    slug: string;
    title: string;
    url: string;
    type: "MANUFACTURER" | "PRESS_RELEASE" | "THIRD_PARTY";
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
  };
};

const DESTINATION_SOURCE = {
  slug: "mercedes-benz-usa-destination-fee",
  title: "Mercedes-Benz USA destination and handling",
  url: "https://www.mbusa.com/en/vehicles",
  type: "MANUFACTURER" as const,
  publisher: "Mercedes-Benz USA",
};

/** Unique exterior stills claimed by this module — do not reuse across trims. */
const CLAIMED_IMAGE_URLS = new Set<string>();

const SL_TRIMS: TrimSeed[] = [
  {
    slug: "2025-mercedes-amg-sl-43-us",
    name: "AMG SL 43",
    bodyStyle: "ROADSTER",
    drivetrain: "RWD",
    modelSlug: "mercedes-sl",
    modelName: "SL",
    generationCode: "R232",
    generationName: "Seventh generation (R232)",
    generationStartYear: 2022,
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/sl-class/dimensions/2026-AMG-SL43-ROADSTER-SFB-DR.png",
    imageAlt: "2025 Mercedes-AMG SL 43 Roadster exterior",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/sl/roadster/sl43r",
    epaId: "48481",
    engine: {
      slug: "mercedes-m139-amg-sl-43",
      name: "AMG M139 2.0L I4 turbo mild hybrid",
      code: "M139",
      fuelType: "HYBRID",
      displacementCc: 1991,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Electric exhaust-gas turbocharger",
      electrification: "48V mild hybrid (ISG)",
    },
    transmissionSlug: "mercedes-amg-speedshift-mct-9",
    transmissionName: "AMG SPEEDSHIFT MCT 9-speed",
    dimensions: {
      lengthIn: 185.2,
      widthIn: 75.4,
      heightIn: 53.3,
      wheelbaseIn: 106.3,
      curbWeightKg: lbsToKg(3825),
      cargoVolumeLiters: cuFtToLiters(7.5),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 416,
      torqueLbFt: 369,
      zeroToSixtySeconds: 4.6,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 19, highwayMpg: 27, combinedMpg: 22 },
    // Edmunds 2025 base MSRP excl. destination
    baseMsrpCents: 11195000,
    specSource: {
      slug: "mbusa-amg-sl-43-roadster",
      title: "AMG SL 43 Roadster (Mercedes-Benz USA)",
      url: "https://www.mbusa.com/en/vehicles/model/sl/roadster/sl43r",
      type: "MANUFACTURER",
    },
    fuelSource: {
      slug: "epa-2025-mercedes-amg-sl43",
      title: "EPA Fuel Economy — 2025 Mercedes-Benz AMG SL43",
      url: "https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=48481",
    },
    priceSource: {
      slug: "edmunds-2025-mercedes-sl-class",
      title: "2025 Mercedes-Benz SL-Class (Edmunds)",
      url: "https://www.edmunds.com/mercedes-benz/sl-class/",
    },
  },
  {
    slug: "2025-mercedes-amg-sl-55-us",
    name: "AMG SL 55",
    bodyStyle: "ROADSTER",
    drivetrain: "AWD",
    modelSlug: "mercedes-sl",
    modelName: "SL",
    generationCode: "R232",
    generationName: "Seventh generation (R232)",
    generationStartYear: 2022,
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/sl-class/dimensions/2026-AMG-SL55-ROADSTER-SFB-DR.png",
    imageAlt: "2025 Mercedes-AMG SL 55 Roadster exterior",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/sl/roadster/sl55r4",
    epaId: "48483",
    engine: {
      slug: "mercedes-m177-amg-sl-55",
      name: "AMG M177 4.0L V8 twin-turbo",
      code: "M177-SL55",
      fuelType: "PETROL",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharged",
      electrification: null,
    },
    transmissionSlug: "mercedes-amg-speedshift-mct-9",
    transmissionName: "AMG SPEEDSHIFT MCT 9-speed",
    dimensions: {
      lengthIn: 185.2,
      widthIn: 75.4,
      heightIn: 53.3,
      wheelbaseIn: 106.3,
      curbWeightKg: lbsToKg(4277),
      cargoVolumeLiters: cuFtToLiters(7.5),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 469,
      torqueLbFt: 516,
      zeroToSixtySeconds: 3.8,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 13, highwayMpg: 21, combinedMpg: 16 },
    baseMsrpCents: 14465000,
    specSource: {
      slug: "mbusa-amg-sl-55-roadster",
      title: "AMG SL 55 Roadster (Mercedes-Benz USA)",
      url: "https://www.mbusa.com/en/vehicles/model/sl/roadster/sl55r4",
      type: "MANUFACTURER",
    },
    fuelSource: {
      slug: "epa-2025-mercedes-amg-sl55",
      title: "EPA Fuel Economy — 2025 Mercedes-Benz AMG SL55 4matic Plus",
      url: "https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=48483",
    },
    priceSource: {
      slug: "edmunds-2025-mercedes-sl-class",
      title: "2025 Mercedes-Benz SL-Class (Edmunds)",
      url: "https://www.edmunds.com/mercedes-benz/sl-class/",
    },
  },
  {
    slug: "2025-mercedes-amg-sl-63-us",
    name: "AMG SL 63",
    bodyStyle: "ROADSTER",
    drivetrain: "AWD",
    modelSlug: "mercedes-sl",
    modelName: "SL",
    generationCode: "R232",
    generationName: "Seventh generation (R232)",
    generationStartYear: 2022,
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/sl-class/dimensions/2026-AMG-SL63SE-ROADSTER-SFB-DR.png",
    imageAlt: "2025 Mercedes-AMG SL 63 Roadster exterior",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/sl/roadster/sl63r4",
    epaId: "48482",
    engine: {
      slug: "mercedes-m177-amg-sl-63",
      name: "AMG M177 4.0L V8 twin-turbo",
      code: "M177-SL63",
      fuelType: "PETROL",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharged",
      electrification: null,
    },
    transmissionSlug: "mercedes-amg-speedshift-mct-9",
    transmissionName: "AMG SPEEDSHIFT MCT 9-speed",
    dimensions: {
      lengthIn: 185.2,
      widthIn: 75.4,
      heightIn: 53.3,
      wheelbaseIn: 106.3,
      curbWeightKg: lbsToKg(4321),
      cargoVolumeLiters: cuFtToLiters(7.5),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 577,
      torqueLbFt: 590,
      zeroToSixtySeconds: 3.5,
      topSpeedMph: 196,
    },
    fuelEconomy: { cityMpg: 13, highwayMpg: 21, combinedMpg: 16 },
    baseMsrpCents: 18715000,
    specSource: {
      slug: "mbusa-amg-sl-63-roadster",
      title: "AMG SL 63 Roadster (Mercedes-Benz USA)",
      url: "https://www.mbusa.com/en/vehicles/model/sl/roadster/sl63r4",
      type: "MANUFACTURER",
    },
    fuelSource: {
      slug: "epa-2025-mercedes-amg-sl63",
      title: "EPA Fuel Economy — 2025 Mercedes-Benz AMG SL63 4matic Plus",
      url: "https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=48482",
    },
    priceSource: {
      slug: "edmunds-2025-mercedes-sl-class",
      title: "2025 Mercedes-Benz SL-Class (Edmunds)",
      url: "https://www.edmunds.com/mercedes-benz/sl-class/",
    },
  },
  {
    slug: "2025-mercedes-amg-sl-63-s-e-performance-us",
    name: "AMG SL 63 S E Performance",
    bodyStyle: "ROADSTER",
    drivetrain: "AWD",
    modelSlug: "mercedes-sl",
    modelName: "SL",
    generationCode: "R232",
    generationName: "Seventh generation (R232)",
    generationStartYear: 2022,
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/sl-class/dimensions/2026-AMG-SL63-ROADSTER-SFB-DR.png",
    imageAlt: "2025 Mercedes-AMG SL 63 S E Performance Roadster exterior",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/sl/roadster/sl63er4",
    epaId: "49017",
    engine: {
      slug: "mercedes-m177-amg-sl-63-s-e-performance",
      name: "AMG M177 4.0L V8 twin-turbo PHEV",
      code: "M177-PHEV",
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharged",
      electrification: "Plug-in hybrid (rear e-motor; combined 805 hp)",
    },
    transmissionSlug: "mercedes-amg-speedshift-mct-9",
    transmissionName: "AMG SPEEDSHIFT MCT 9-speed",
    dimensions: {
      lengthIn: 185.2,
      widthIn: 75.4,
      heightIn: 53.3,
      wheelbaseIn: 106.3,
      curbWeightKg: lbsToKg(4839),
      cargoVolumeLiters: cuFtToLiters(7.5),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 805,
      torqueLbFt: 1047,
      zeroToSixtySeconds: 2.8,
      topSpeedMph: 196,
    },
    fuelEconomy: { cityMpg: 16, highwayMpg: 22, combinedMpg: 18 },
    baseMsrpCents: 20715000,
    specSource: {
      slug: "mbusa-amg-sl-63-s-e-performance",
      title: "AMG SL 63 S E Performance Roadster (Mercedes-Benz USA)",
      url: "https://www.mbusa.com/en/vehicles/model/sl/roadster/sl63er4",
      type: "MANUFACTURER",
    },
    fuelSource: {
      slug: "epa-2025-mercedes-amg-sl63-s-e-performance",
      title: "EPA Fuel Economy — 2025 Mercedes-Benz AMG SL63 S E Performance",
      url: "https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=49017",
    },
    priceSource: {
      slug: "edmunds-2025-mercedes-sl-class",
      title: "2025 Mercedes-Benz SL-Class (Edmunds)",
      url: "https://www.edmunds.com/mercedes-benz/sl-class/",
    },
  },
];

const CLE_TRIMS: TrimSeed[] = [
  {
    slug: "2025-mercedes-cle-300-4matic-coupe-us",
    name: "CLE 300 4MATIC Coupe",
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    modelSlug: "mercedes-cle",
    modelName: "CLE",
    generationCode: "C236",
    generationName: "First generation (C236)",
    generationStartYear: 2024,
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/cle-class/cle-coupe/cgt/2026-300W-CLE-COUPE-CGT-DR.png",
    imageAlt: "2025 Mercedes-Benz CLE 300 4MATIC Coupe exterior",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/cle/coupe/cle300c4",
    epaId: "48157",
    engine: {
      slug: "mercedes-m254-cle-300",
      name: "M254 2.0L I4 turbo mild hybrid",
      code: "M254",
      fuelType: "HYBRID",
      displacementCc: 1999,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharged",
      electrification: "48V mild hybrid (ISG)",
    },
    transmissionSlug: "mercedes-9g-tronic",
    transmissionName: "9G-TRONIC 9-speed automatic",
    dimensions: {
      lengthIn: 191.0,
      widthIn: 73.3,
      heightIn: 56.2,
      wheelbaseIn: 112.8,
      frontTrackIn: 63.2,
      rearTrackIn: 63.6,
      curbWeightKg: lbsToKg(4057),
      cargoVolumeLiters: cuFtToLiters(11.2),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 255,
      torqueLbFt: 295,
      zeroToSixtySeconds: 6.2,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 24, highwayMpg: 33, combinedMpg: 27 },
    baseMsrpCents: 5800000,
    specSource: {
      slug: "mbusa-cle-300-4matic-coupe",
      title: "CLE 300 4MATIC Coupe (Mercedes-Benz USA)",
      url: "https://www.mbusa.com/en/vehicles/model/cle/coupe/cle300c4",
      type: "MANUFACTURER",
    },
    fuelSource: {
      slug: "epa-2025-mercedes-cle300-coupe",
      title: "EPA Fuel Economy — 2025 Mercedes-Benz CLE300 4matic (Coupe)",
      url: "https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=48157",
    },
    priceSource: {
      slug: "edmunds-2025-mercedes-cle-coupe",
      title: "2025 Mercedes-Benz CLE Coupe (Edmunds)",
      url: "https://www.edmunds.com/mercedes-benz/cle/2025/coupe/",
    },
  },
  {
    slug: "2025-mercedes-cle-450-4matic-coupe-us",
    name: "CLE 450 4MATIC Coupe",
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    modelSlug: "mercedes-cle",
    modelName: "CLE",
    generationCode: "C236",
    generationName: "First generation (C236)",
    generationStartYear: 2024,
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/cle-class/cle-coupe/dimensions/2026-CLE-450-COUPE-SFB-DR.png",
    imageAlt: "2025 Mercedes-Benz CLE 450 4MATIC Coupe exterior",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/cle/coupe/cle450c4",
    epaId: "48159",
    engine: {
      slug: "mercedes-m256-cle-450",
      name: "M256 3.0L I6 turbo mild hybrid",
      code: "M256",
      fuelType: "HYBRID",
      displacementCc: 2999,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Turbocharged with electric auxiliary compressor",
      electrification: "48V mild hybrid (ISG)",
    },
    transmissionSlug: "mercedes-9g-tronic",
    transmissionName: "9G-TRONIC 9-speed automatic",
    dimensions: {
      lengthIn: 191.0,
      widthIn: 73.3,
      heightIn: 56.2,
      wheelbaseIn: 112.8,
      frontTrackIn: 63.2,
      rearTrackIn: 63.6,
      curbWeightKg: lbsToKg(4266),
      cargoVolumeLiters: cuFtToLiters(11.2),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 375,
      torqueLbFt: 369,
      zeroToSixtySeconds: 4.2,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 23, highwayMpg: 33, combinedMpg: 26 },
    baseMsrpCents: 6745000,
    specSource: {
      slug: "mbusa-cle-450-4matic-coupe",
      title: "CLE 450 4MATIC Coupe (Mercedes-Benz USA)",
      url: "https://www.mbusa.com/en/vehicles/model/cle/coupe/cle450c4",
      type: "MANUFACTURER",
    },
    fuelSource: {
      slug: "epa-2025-mercedes-cle450-coupe",
      title: "EPA Fuel Economy — 2025 Mercedes-Benz CLE450 4matic (Coupe)",
      url: "https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=48159",
    },
    priceSource: {
      slug: "edmunds-2025-mercedes-cle-coupe",
      title: "2025 Mercedes-Benz CLE Coupe (Edmunds)",
      url: "https://www.edmunds.com/mercedes-benz/cle/2025/coupe/",
    },
  },
  {
    slug: "2025-mercedes-amg-cle-53-coupe-us",
    name: "AMG CLE 53 Coupe",
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    modelSlug: "mercedes-cle",
    modelName: "CLE",
    generationCode: "C236",
    generationName: "First generation (C236)",
    generationStartYear: 2024,
    imageUrl: "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my26/cle-class/cle-coupe/dimensions/2026-AMG-CLE53-COUPE-SFB-DR.png",
    imageAlt: "2025 Mercedes-AMG CLE 53 Coupe exterior",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/cle/coupe/cle53c4",
    epaId: "48487",
    engine: {
      slug: "mercedes-m256-amg-cle-53",
      name: "AMG-enhanced M256 3.0L I6 twincharger mild hybrid",
      code: "M256-AMG",
      fuelType: "HYBRID",
      displacementCc: 2999,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Turbocharged with electric auxiliary compressor",
      electrification: "48V mild hybrid (ISG)",
    },
    transmissionSlug: "mercedes-amg-speedshift-tct-9",
    transmissionName: "AMG SPEEDSHIFT TCT 9-speed",
    dimensions: {
      lengthIn: 191.0,
      widthIn: 73.3,
      heightIn: 56.2,
      wheelbaseIn: 113.2,
      frontTrackIn: 63.2,
      rearTrackIn: 63.6,
      curbWeightKg: lbsToKg(4420),
      cargoVolumeLiters: cuFtToLiters(11.0),
      seatingCapacity: 4,
    },
    performance: {
      powerHp: 443,
      torqueLbFt: 413,
      zeroToSixtySeconds: 4.0,
      topSpeedMph: 155,
    },
    fuelEconomy: { cityMpg: 20, highwayMpg: 27, combinedMpg: 23 },
    baseMsrpCents: 7430000,
    specSource: {
      slug: "mbusa-amg-cle-53-coupe-qrg-2025",
      title: "2025 Mercedes-AMG CLE 53 Coupe Quick Reference Guide",
      url: "https://media.mbusa.com/releases/release-7fa8a8ec6fed8413f2bac1ecef0dd819-2025-mercedes-amg-cle-53-coupe-quick-reference-guide",
      type: "PRESS_RELEASE",
    },
    fuelSource: {
      slug: "epa-2025-mercedes-amg-cle53-coupe",
      title: "EPA Fuel Economy — 2025 Mercedes-Benz AMG CLE53 4matic Plus (coupe)",
      url: "https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=48487",
    },
    priceSource: {
      slug: "edmunds-2025-mercedes-cle-coupe",
      title: "2025 Mercedes-Benz CLE Coupe (Edmunds)",
      url: "https://www.edmunds.com/mercedes-benz/cle/2025/coupe/",
    },
  },
];

const STATIC_SKIPPED = [
  "SL 300 / SL 400 / SL 450 / SL 500 / SL 550: prior generations; not current US MY 2025 production with complete EPA+MSRP set for this module",
  "AMG SL 65: discontinued; not offered in US MY 2025",
  "CLE 200: EU-market; not offered in US",
  "AMG CLE 63: not available in US MY 2025 EPA catalogue",
  "mercedes-slk (historic SLK 200/250/300/350/55 AMG): discontinued; incomplete current US-sourced catalogue package",
  "mercedes-slc (SLC 180/200/300, AMG SLC 43): discontinued; incomplete current US-sourced catalogue package",
];

async function seedTrim(
  ctx: SeedCtx,
  trim: TrimSeed,
  seeded: string[],
  skipped: string[],
) {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;

  try {
    if (CLAIMED_IMAGE_URLS.has(trim.imageUrl)) {
      throw new Error(`Duplicate image URL within module: ${trim.imageUrl}`);
    }
    CLAIMED_IMAGE_URLS.add(trim.imageUrl);

    const imageUrl = await assertImageUrlOk(trim.imageUrl);
    const imageSource = await ensureImageSource(prisma, {
      slug: `mbusa-image-${trim.slug}`,
      title: `${trim.name} exterior (Mercedes-Benz USA)`,
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
        displayName: trim.generationName,
        startYear: trim.generationStartYear,
      },
      update: {
        displayName: trim.generationName,
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

    const transmission = await prisma.transmission.upsert({
      where: { slug: trim.transmissionSlug },
      create: {
        slug: trim.transmissionSlug,
        name: trim.transmissionName,
        type: "AUTOMATIC",
        gearCount: 9,
      },
      update: {
        name: trim.transmissionName,
        type: "AUTOMATIC",
        gearCount: 9,
      },
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

    const specSource = await upsertCatalogueSource(prisma, {
      slug: trim.specSource.slug,
      title: trim.specSource.title,
      publisher: "Mercedes-Benz USA",
      url: trim.specSource.url,
      type: trim.specSource.type,
    });

    const fuelSource = await upsertCatalogueSource(prisma, {
      slug: trim.fuelSource.slug,
      title: trim.fuelSource.title,
      publisher: "U.S. EPA",
      url: trim.fuelSource.url,
      type: "GOVERNMENT",
    });

    const priceSource = await upsertCatalogueSource(prisma, {
      slug: trim.priceSource.slug,
      title: trim.priceSource.title,
      publisher: "Edmunds",
      url: trim.priceSource.url,
      type: "THIRD_PARTY",
    });

    const destinationSource = await upsertCatalogueSource(prisma, {
      ...DESTINATION_SOURCE,
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
        description: `2025 Mercedes-Benz ${trim.name} (US).`,
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
        specSource.id,
        "VehiclePerformance",
        performance.id,
        "specifications",
        "MBUSA / press performance specifications",
      ),
      upsertCitation(
        prisma,
        specSource.id,
        "VehicleDimensions",
        dimensions.id,
        "specifications",
        "MBUSA exterior dimensions and curb weight",
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
        `Destination and handling $${(MERCEDES_DESTINATION_CENTS / 100).toFixed(0)}`,
      ),
      upsertCitation(
        prisma,
        imageSource.id,
        "VehicleImage",
        image.id,
        "url",
        "Mercedes-Benz USA exterior asset",
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

export async function seedMercedesRoadstersCle(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  for (const trim of [...SL_TRIMS, ...CLE_TRIMS]) {
    await seedTrim(ctx, trim, seeded, skipped);
  }

  return { seeded, skipped };
}
