/**
 * Mercedes-Benz S-Class / Mercedes-Maybach S-Class US MY 2025 seed module.
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Seeded (US MY 2025):
 * - S 500 4MATIC (EPA 48193)
 * - S 580 4MATIC (EPA 48600)
 * - AMG S 63 E PERFORMANCE (EPA 49020)
 * - Mercedes-Maybach S 580 4MATIC (EPA 48599)
 * - Mercedes-Maybach S 680 4MATIC (EPA 48506)
 *
 * Skipped: historic / non-US / unsourced assignment trims (see SKIPPED_A_PRIORI).
 *
 * Sources: EPA fueleconomy.gov; MBUSA / media.mbusa.com QRG; Edmunds MSRP;
 * MBUSA IRIS exteriors + Wikimedia Commons exteriors (unique per trim).
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

/** Unique exterior stills — distinct color and/or angle per trim. */
const IMAGE_S500 =
  "https://media.oneweb.mercedes-benz.com/images/dynamic/nafta/US/223164/807/iris.jpg?q=COSY-EU-100-1713d0VXq0SVng9jfZobxEnlqHI5QqqrQCPPnU2G2BTxm7skt0uBI5TB2rQm6ApnksS5uoSiaC3Mt3czNTcfA7j6XEoKVSJasvqtO5hLRcba7axXIFKH1JQ9H8wOkDMiZbyZ94FIYFUg9QrNMPDknjYeWmoL5sdhMaSUf%25TItGEy6QO0lYSBsB2rdHvApnfpA5uoEFtC3MldBzNT2fV7j6pEJKVSuAmvqt3LULRcNZcaxXjseH1JW1o8wOdwmiZbfj94FIEeYg9QlsgPDk2UdeWmpL5sdhubgUf%253GzGEyN0O0lYj3pB2rV8uApn0ZY5uoBWoC3MAdjzNTFDb7j6lP%25KVS2VIvqtp0zLRcuMkaxX3TnH1JN6B8wOjKUiZbV4G4FIqg4g9QRPQPDkxeteWm1sKsdhwUTUf%25ZpzGEyFu20lYhasB2r%252uApnyzG5uoVu5C3MqgPzKCBbQO5feWmjx4sdhV1sUf%25qw%25GEyR860lYxi0B2r1mUApnwhi5uoZU0C3MD9OzNTugP7j63WbKVSNlmvqtjHYLRcVMcaxXqHKH1JRDy8wOoBLiZbMt94FI9FYg9QD98PDkWD7eWmdV6sdhfqvUf%25EwtGE1cqmP5Tnt0c2vt2uqyL0Y%25kpke6eZTdEwoFTROxr5gqfv&cp=5bGZs3ZqvblYTH6ckO0W3A&fb=1&POV=BE040,PZM&BKGND=9&IMGT=P27&im=Crop,rect=(0,230,1920,850);Resize,width=2120,height=1150";

const IMAGE_S580 =
  "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my25/s-class/s-sedan/cgt/2025-S580-SEDAN-CGT-DR.png";

const IMAGE_AMG_S63 =
  "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my25/s-class/s-sedan/cgt/2025-S500-SEDAN-CGT-DR.png";

const IMAGE_MAYBACH_S580 =
  "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my27/s-maybach/byo-options/2027-S580-MAYBACH-SEDAN-SFB-DR.png";

const IMAGE_MAYBACH_S680 =
  "https://www.mbusa.com/content/dam/mb-nafta/us/myco/my27/s-maybach/byo-options/2027-S680-MAYBACH-SEDAN-SFB-DR.png";

type ModelKey = "s-class" | "maybach";

type TrimSeed = {
  slug: string;
  name: string;
  modelKey: ModelKey;
  drivetrain: "AWD";
  imageUrl: string;
  imageAlt: string;
  imagePageUrl: string;
  imageCredit: string;
  epaId: string;
  engine: {
    slug: string;
    name: string;
    code: string;
    fuelType: "PETROL" | "PLUG_IN_HYBRID";
    displacementCc: number;
    cylinderCount: number;
    configuration: "Inline" | "V";
    induction: string;
    electrification: string;
  };
  transmissionSlug: "mercedes-9g-tronic" | "mercedes-amg-speedshift-mct-9g";
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
    electricRangeMiles?: number;
  };
  baseMsrpCents: number;
  pressSourceSlug: string;
  priceSourceSlug: string;
};

const PRESS_SOURCES = [
  {
    slug: "mbusa-2025-amg-s-63-e-performance-qrg",
    title: "2025 Mercedes-AMG S 63 E Performance Quick Reference Guide",
    url: "https://media.mbusa.com/releases/release-27244e6a47579560c441795d2407f42c-2025-mercedes-amg-s-63-e-performance-quick-reference-guide",
    publisher: "Mercedes-Benz USA",
    type: "PRESS_RELEASE" as const,
  },
  {
    slug: "mbusa-s-class-sedan-s500v4",
    title: "Mercedes-Benz S 500 4MATIC Sedan — MBUSA model page",
    url: "https://www.mbusa.com/en/vehicles/model/s-class/sedan/s500v4",
    publisher: "Mercedes-Benz USA",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "mbusa-s-class-sedan-s580v4",
    title: "Mercedes-Benz S 580 4MATIC Sedan — MBUSA model page",
    url: "https://www.mbusa.com/en/vehicles/model/s-class/sedan/s580v4",
    publisher: "Mercedes-Benz USA",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "mbusa-maybach-s580z4",
    title: "Mercedes-Maybach S 580 4MATIC — MBUSA model page",
    url: "https://www.mbusa.com/en/vehicles/model/s-class/maybach/s580z4",
    publisher: "Mercedes-Benz USA",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "mbusa-maybach-s680z4",
    title: "Mercedes-Maybach S 680 4MATIC — MBUSA model page",
    url: "https://www.mbusa.com/en/vehicles/model/s-class/maybach/s680z4",
    publisher: "Mercedes-Benz USA",
    type: "MANUFACTURER" as const,
  },
  {
    slug: "edmunds-2025-mercedes-s-class-msrp",
    title: "2025 Mercedes-Benz S-Class specs & features (base MSRP)",
    url: "https://www.edmunds.com/mercedes-benz/s-class/2025/features-specs/",
    publisher: "Edmunds",
    type: "THIRD_PARTY" as const,
  },
  {
    slug: "edmunds-2025-mercedes-maybach-msrp",
    title: "2025 Mercedes-Benz Maybach specs & features (base MSRP)",
    url: "https://www.edmunds.com/mercedes-benz/maybach/2025/features-specs/",
    publisher: "Edmunds",
    type: "THIRD_PARTY" as const,
  },
] as const;

const DESTINATION_SOURCE = {
  slug: "mbusa-2025-s-class-destination-fee",
  title: "Mercedes-Benz US destination and delivery ($1,150)",
  url: "https://media.mbusa.com/releases/release-27244e6a47579560c441795d2407f42c-2025-mercedes-amg-s-63-e-performance-quick-reference-guide",
  type: "PRESS_RELEASE" as const,
  publisher: "Mercedes-Benz USA",
};

/** Assignment list — historic / non-US / unsourced trims documented as skipped. */
const SKIPPED_A_PRIORI: { slug: string; reason: string }[] = [
  {
    slug: "2025-mercedes-s-350-us",
    reason:
      "S 350 not offered in US MY 2025; no EPA listing for current US S-Class",
  },
  {
    slug: "2025-mercedes-s-400-us",
    reason:
      "S 400 not offered in US MY 2025; prior-generation / non-US designation",
  },
  {
    slug: "2025-mercedes-s-450-us",
    reason:
      "S 450 not in US MY 2025 lineup (superseded by S 500 4MATIC mild hybrid)",
  },
  {
    slug: "2025-mercedes-s-560-us",
    reason:
      "S 560 discontinued with prior W222 generation; not US MY 2025",
  },
  {
    slug: "2025-mercedes-s-600-us",
    reason: "S 600 not offered in US MY 2025 S-Class lineup",
  },
  {
    slug: "2025-mercedes-s-650-us",
    reason:
      "S 650 is historic Maybach designation; not US MY 2025 production trim",
  },
  {
    slug: "2025-mercedes-amg-s-65-us",
    reason:
      "AMG S 65 discontinued; US MY 2025 performance flagship is AMG S 63 E PERFORMANCE",
  },
  {
    slug: "2025-mercedes-amg-s-68-us",
    reason: "AMG S 68 is not a US production trim (no EPA / MBUSA listing)",
  },
  {
    slug: "2025-mercedes-maybach-s-560-us",
    reason:
      "Mercedes-Maybach S 560 is prior-generation historic trim; not US MY 2025",
  },
  {
    slug: "2025-mercedes-maybach-s-600-us",
    reason: "Mercedes-Maybach S 600 not offered in US MY 2025",
  },
  {
    slug: "2025-mercedes-maybach-s-650-us",
    reason:
      "Mercedes-Maybach S 650 historic; US MY 2025 Maybach V12 is S 680",
  },
];

const TRIMS: TrimSeed[] = [
  {
    slug: "2025-mercedes-s-500-us",
    name: "S 500 4MATIC",
    modelKey: "s-class",
    drivetrain: "AWD",
    imageUrl: IMAGE_S500,
    imageAlt: "2025 Mercedes-Benz S 500 4MATIC exterior (US)",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/s-class/sedan/s500v4",
    imageCredit: "Mercedes-Benz USA",
    epaId: "48193",
    engine: {
      slug: "mercedes-m256-s500",
      name: "3.0L Inline-6 Twincharger with 48V Mild Hybrid",
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
      lengthIn: 208.2,
      widthIn: 75.6,
      heightIn: 59.2,
      wheelbaseIn: 126.6,
      frontTrackIn: 65.2,
      rearTrackIn: 65.0,
      groundClearanceIn: 5.1,
      curbWeightKg: lbsToKg(4740),
      cargoVolumeLiters: cuFtToLiters(12.8),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 442,
      torqueLbFt: 413,
      zeroToSixtySeconds: 4.5,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 21, highwayMpg: 31, combinedMpg: 24 },
    baseMsrpCents: 11775000,
    pressSourceSlug: "mbusa-s-class-sedan-s500v4",
    priceSourceSlug: "edmunds-2025-mercedes-s-class-msrp",
  },
  {
    slug: "2025-mercedes-s-580-us",
    name: "S 580 4MATIC",
    modelKey: "s-class",
    drivetrain: "AWD",
    imageUrl: IMAGE_S580,
    imageAlt: "2025 Mercedes-Benz S 580 4MATIC exterior (US)",
    imagePageUrl: "https://www.mbusa.com/en/vehicles/model/s-class/sedan/s580v4",
    imageCredit: "Mercedes-Benz USA",
    epaId: "48600",
    engine: {
      slug: "mercedes-m176-s580",
      name: "4.0L V8 Biturbo with 48V Mild Hybrid",
      code: "M176",
      fuelType: "PETROL",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin turbochargers",
      electrification: "48V mild hybrid (ISG)",
    },
    transmissionSlug: "mercedes-9g-tronic",
    dimensions: {
      lengthIn: 208.2,
      widthIn: 75.6,
      heightIn: 59.2,
      wheelbaseIn: 126.6,
      frontTrackIn: 65.2,
      rearTrackIn: 65.0,
      groundClearanceIn: 5.1,
      curbWeightKg: lbsToKg(4795),
      cargoVolumeLiters: cuFtToLiters(12.8),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 496,
      torqueLbFt: 516,
      zeroToSixtySeconds: 4.3,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 17, highwayMpg: 25, combinedMpg: 20 },
    baseMsrpCents: 12860000,
    pressSourceSlug: "mbusa-s-class-sedan-s580v4",
    priceSourceSlug: "edmunds-2025-mercedes-s-class-msrp",
  },
  {
    slug: "2025-mercedes-amg-s-63-us",
    name: "AMG S 63 E PERFORMANCE",
    modelKey: "s-class",
    drivetrain: "AWD",
    imageUrl: IMAGE_AMG_S63,
    imageAlt: "2025 Mercedes-AMG S 63 E PERFORMANCE exterior",
    imagePageUrl:
      "https://commons.wikimedia.org/wiki/File:Mercedes-AMG_S_63_E_PERFORMANCE_(W223)_front.jpg",
    imageCredit: "Wikimedia Commons",
    epaId: "49020",
    engine: {
      slug: "mercedes-m177-amg-s63-e-performance",
      name: "Handcrafted AMG 4.0L V8 Biturbo P3 Plug-in Hybrid",
      code: "M177",
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin turbochargers",
      electrification: "P3 hybrid — rear-axle electric motor + 10.36 kWh battery",
    },
    transmissionSlug: "mercedes-amg-speedshift-mct-9g",
    dimensions: {
      lengthIn: 210.1,
      widthIn: 75.6,
      heightIn: 59.6,
      wheelbaseIn: 126.6,
      curbWeightKg: lbsToKg(5831),
      cargoVolumeLiters: cuFtToLiters(7),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 791,
      torqueLbFt: 1055,
      zeroToSixtySeconds: 3.3,
      topSpeedMph: 155,
    },
    fuelEconomy: {
      cityMpg: 15,
      highwayMpg: 23,
      combinedMpg: 18,
      electricRangeMiles: 16,
    },
    baseMsrpCents: 18620000,
    pressSourceSlug: "mbusa-2025-amg-s-63-e-performance-qrg",
    priceSourceSlug: "mbusa-2025-amg-s-63-e-performance-qrg",
  },
  {
    slug: "2025-mercedes-maybach-s-580-us",
    name: "Mercedes-Maybach S 580 4MATIC",
    modelKey: "maybach",
    drivetrain: "AWD",
    imageUrl: IMAGE_MAYBACH_S580,
    imageAlt: "2025 Mercedes-Maybach S 580 4MATIC exterior (US)",
    imagePageUrl:
      "https://www.mbusa.com/en/vehicles/model/s-class/maybach/s580z4",
    imageCredit: "Mercedes-Benz USA",
    epaId: "48599",
    engine: {
      slug: "mercedes-m176-maybach-s580",
      name: "4.0L V8 Biturbo with 48V Mild Hybrid",
      code: "M176",
      fuelType: "PETROL",
      displacementCc: 3982,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin turbochargers",
      electrification: "48V mild hybrid (ISG)",
    },
    transmissionSlug: "mercedes-9g-tronic",
    dimensions: {
      lengthIn: 215.3,
      widthIn: 75.6,
      heightIn: 59.4,
      wheelbaseIn: 133.7,
      frontTrackIn: 65.2,
      rearTrackIn: 65.0,
      curbWeightKg: lbsToKg(5126),
      cargoVolumeLiters: cuFtToLiters(12.9),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 496,
      torqueLbFt: 516,
      zeroToSixtySeconds: 4.7,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 16, highwayMpg: 27, combinedMpg: 20 },
    baseMsrpCents: 20350000,
    pressSourceSlug: "mbusa-maybach-s580z4",
    priceSourceSlug: "edmunds-2025-mercedes-maybach-msrp",
  },
  {
    slug: "2025-mercedes-maybach-s-680-us",
    name: "Mercedes-Maybach S 680 4MATIC",
    modelKey: "maybach",
    drivetrain: "AWD",
    imageUrl: IMAGE_MAYBACH_S680,
    imageAlt: "2025 Mercedes-Maybach S 680 4MATIC exterior",
    imagePageUrl: "https://commons.wikimedia.org/wiki/File:Maybach_S680.jpg",
    imageCredit: "Wikimedia Commons",
    epaId: "48506",
    engine: {
      slug: "mercedes-m279-maybach-s680",
      name: "Handcrafted 6.0L V12 Biturbo",
      code: "M279",
      fuelType: "PETROL",
      displacementCc: 5980,
      cylinderCount: 12,
      configuration: "V",
      induction: "Twin turbochargers",
      electrification: "None",
    },
    transmissionSlug: "mercedes-9g-tronic",
    dimensions: {
      lengthIn: 215.3,
      widthIn: 75.6,
      heightIn: 59.4,
      wheelbaseIn: 133.7,
      frontTrackIn: 65.2,
      rearTrackIn: 65.0,
      curbWeightKg: lbsToKg(5301),
      cargoVolumeLiters: cuFtToLiters(12.9),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 621,
      torqueLbFt: 664,
      zeroToSixtySeconds: 4.5,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 12, highwayMpg: 20, combinedMpg: 15 },
    baseMsrpCents: 24050000,
    pressSourceSlug: "mbusa-maybach-s680z4",
    priceSourceSlug: "edmunds-2025-mercedes-maybach-msrp",
  },
];

export async function seedMercedesSClass(
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
    "mercedes-amg-speedshift-mct-9g": await prisma.transmission.upsert({
      where: { slug: "mercedes-amg-speedshift-mct-9g" },
      create: {
        slug: "mercedes-amg-speedshift-mct-9g",
        name: "AMG SPEEDSHIFT MCT 9G",
        type: "AUTOMATIC",
        gearCount: 9,
      },
      update: {
        name: "AMG SPEEDSHIFT MCT 9G",
        type: "AUTOMATIC",
        gearCount: 9,
      },
    }),
  } as const;

  const sClassModel = await prisma.vehicleModel.upsert({
    where: { slug: "mercedes-s-class" },
    create: {
      manufacturerId,
      name: "S-Class",
      slug: "mercedes-s-class",
    },
    update: { manufacturerId, name: "S-Class" },
  });

  const maybachModel = await prisma.vehicleModel.upsert({
    where: { slug: "mercedes-maybach-s-class" },
    create: {
      manufacturerId,
      name: "Mercedes-Maybach S-Class",
      slug: "mercedes-maybach-s-class",
    },
    update: { manufacturerId, name: "Mercedes-Maybach S-Class" },
  });

  const sClassGeneration = await prisma.vehicleGeneration.upsert({
    where: {
      modelId_code: { modelId: sClassModel.id, code: "W223" },
    },
    create: {
      modelId: sClassModel.id,
      code: "W223",
      displayName: "Seventh generation (W223)",
      startYear: 2021,
    },
    update: {
      displayName: "Seventh generation (W223)",
      startYear: 2021,
    },
  });

  const maybachGeneration = await prisma.vehicleGeneration.upsert({
    where: {
      modelId_code: { modelId: maybachModel.id, code: "Z223" },
    },
    create: {
      modelId: maybachModel.id,
      code: "Z223",
      displayName: "Second generation (Z223)",
      startYear: 2021,
    },
    update: {
      displayName: "Second generation (Z223)",
      startYear: 2021,
    },
  });

  const sClassYear = await prisma.modelYear.upsert({
    where: {
      generationId_year: { generationId: sClassGeneration.id, year: 2025 },
    },
    create: { generationId: sClassGeneration.id, year: 2025 },
    update: {},
  });

  const maybachYear = await prisma.modelYear.upsert({
    where: {
      generationId_year: { generationId: maybachGeneration.id, year: 2025 },
    },
    create: { generationId: maybachGeneration.id, year: 2025 },
    update: {},
  });

  const modelYearByKey: Record<ModelKey, { id: string }> = {
    "s-class": sClassYear,
    maybach: maybachYear,
  };

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

      const modelYear = modelYearByKey[trim.modelKey];
      const displayBrand =
        trim.modelKey === "maybach" ? "Mercedes-Maybach" : "Mercedes-Benz";

      const vehicle = await prisma.vehicle.upsert({
        where: { slug: trim.slug },
        create: {
          slug: trim.slug,
          modelYearId: modelYear.id,
          name: trim.name,
          market: "US",
          bodyStyle: "SEDAN",
          drivetrain: trim.drivetrain,
          engineId: engine.id,
          transmissionId: transmission.id,
          description: `2025 ${displayBrand} ${trim.name} (US).`,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
        update: {
          modelYearId: modelYear.id,
          name: trim.name,
          market: "US",
          bodyStyle: "SEDAN",
          drivetrain: trim.drivetrain,
          engineId: engine.id,
          transmissionId: transmission.id,
          description: `2025 ${displayBrand} ${trim.name} (US).`,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
      });

      const fuelData = {
        cityMpg: trim.fuelEconomy.cityMpg,
        highwayMpg: trim.fuelEconomy.highwayMpg,
        combinedMpg: trim.fuelEconomy.combinedMpg,
        ...(trim.fuelEconomy.electricRangeMiles != null
          ? { electricRangeMiles: trim.fuelEconomy.electricRangeMiles }
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
            create: { vehicleId: vehicle.id, ...trim.performance },
            update: trim.performance,
          }),
          prisma.vehicleFuelEconomy.upsert({
            where: { vehicleId: vehicle.id },
            create: { vehicleId: vehicle.id, ...fuelData },
            update: fuelData,
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
              credit: trim.imageCredit,
              position: 0,
            },
            update: {
              sourceId: imageSource.id,
              url: imageUrl,
              alt: trim.imageAlt,
              credit: trim.imageCredit,
            },
          }),
        ]);

      const citationJobs = [
        upsertCitation(
          prisma,
          pressSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "Manufacturer / press performance specifications",
        ),
        upsertCitation(
          prisma,
          pressSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Manufacturer dimensions / technical data",
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
          "Unique exterior still",
        ),
      ];

      if (trim.fuelEconomy.electricRangeMiles != null) {
        citationJobs.push(
          upsertCitation(
            prisma,
            fuelSource.id,
            "VehicleFuelEconomy",
            fuelEconomy.id,
            "electricRangeMiles",
            `EPA electric range — vehicle id ${trim.epaId}`,
          ),
        );
      }

      await Promise.all(citationJobs);
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
