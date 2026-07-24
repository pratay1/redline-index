/**
 * Ferrari 458 US catalogue seed — final US model year MY2015 only.
 * One complete PUBLISHED trim each: Italia, Spider, Speciale, Speciale A.
 * Idempotent — does not wire itself into prisma/seed.ts.
 *
 * Exterior images (unique; HEAD-ok JPEG; 458-specific filenames):
 * - https://www.auto-data.net/images/f126/Ferrari-458-Italia.jpg
 * - https://www.auto-data.net/images/f118/Ferrari-458-Spider.jpg
 * - https://www.auto-data.net/images/f88/Ferrari-458-Speciale.jpg
 * - https://www.auto-data.net/images/f104/Ferrari-458-Speciale-A.jpg
 */
import {
  FERRARI_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureFerrariEngine,
  ensureImageSource,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./ferrari-shared";

const MM_TO_IN = 0.0393700787;

function mmToIn(mm: number) {
  return Math.round(mm * MM_TO_IN * 10) / 10;
}

/** MY2015 Ferrari NA destination $3,750 (iSeeCars Monroney). Modern default is FERRARI_DESTINATION_CENTS ($5,000). */
const FERRARI_458_MY2015_DESTINATION_CENTS = 375_000;

type ModelSlug =
  | "ferrari-458-italia"
  | "ferrari-458-spider"
  | "ferrari-458-speciale"
  | "ferrari-458-speciale-a";

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: ModelSlug;
  modelName: string;
  year: number;
  generationCode: string;
  generationDisplayName: string;
  generationStartYear: number;
  generationEndYear: number | null;
  bodyStyle: "COUPE" | "CABRIOLET";
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
    cargoVolumeLiters?: number | null;
    seatingCapacity: number;
  };
  performance: {
    powerHp: number;
    torqueLbFt: number;
    zeroToSixtySeconds: number;
    quarterMileSeconds: number;
    topSpeedMph: number;
  };
  fuelEconomy: {
    cityMpg: number;
    highwayMpg: number;
    combinedMpg: number;
  };
  /** BASE_MSRP in cents (excludes destination). */
  baseMsrpCents: number;
  destinationCents: number;
  priceSourceSlug: string;
  priceSourceTitle: string;
  priceSourceUrl: string;
  priceSourcePublisher: string;
  specSourceSlug: string;
  specSourceTitle: string;
  specSourceUrl: string;
  specSourcePublisher: string;
};

const DESTINATION_SOURCE = {
  slug: "iseecars-2015-ferrari-458-destination-3750",
  title:
    "2015 Ferrari 458 Italia / Spider destination charge $3,750 (iSeeCars Monroney)",
  url: "https://www.iseecars.com/car/ferrari-458-italia-price",
  publisher: "iSeeCars",
  type: "THIRD_PARTY" as const,
};

/**
 * Representative final-US-year trims. EPA ids from fueleconomy.gov (no stop-start variants).
 * MSRP excludes destination. Ground clearance / GVWR not published in primary sources — omitted.
 */
const TRIMS: TrimSeed[] = [
  {
    slug: "2015-ferrari-458-italia-us",
    name: "458 Italia",
    modelSlug: "ferrari-458-italia",
    modelName: "458 Italia",
    year: 2015,
    generationCode: "F142",
    generationDisplayName: "458 Italia (F142) US",
    generationStartYear: 2009,
    generationEndYear: 2015,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f126/Ferrari-458-Italia.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-458-italia-4.5-v8-570hp-18350",
    imageAlt: "2015 Ferrari 458 Italia coupe exterior",
    epaId: "35528",
    engine: {
      slug: "ferrari-f136fb-v8-562",
      name: "4.5L V8 naturally aspirated (F136FB)",
      code: "F136FB",
      displacementCc: 4497,
      cylinderCount: 8,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-f1-dct-7",
      name: "7-speed F1 dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // auto-data.net mm→in; kerb 1380 kg; trunk 230 L; tracks 1672/1606 mm.
      lengthIn: mmToIn(4527),
      widthIn: mmToIn(1937),
      heightIn: mmToIn(1213),
      wheelbaseIn: mmToIn(2650),
      frontTrackIn: mmToIn(1672),
      rearTrackIn: mmToIn(1606),
      curbWeightKg: 1380,
      cargoVolumeLiters: 230,
      seatingCapacity: 2,
    },
    performance: {
      // US SAE 562 hp / 398 lb-ft (Edmunds / C&D). MT instrumented 0–60 3.0 / ¼ 10.9; top 202 mph.
      powerHp: 562,
      torqueLbFt: 398,
      zeroToSixtySeconds: 3.0,
      quarterMileSeconds: 10.9,
      topSpeedMph: 202,
    },
    // EPA id 35528 — 13/17/14 (no stop-start).
    fuelEconomy: { cityMpg: 13, highwayMpg: 17, combinedMpg: 14 },
    // EPA / Edmunds via fueleconomy.gov SBS; iSeeCars confirms $239,340 excl. dest.
    baseMsrpCents: 23_934_000,
    destinationCents: FERRARI_458_MY2015_DESTINATION_CENTS,
    priceSourceSlug: "iseecars-2015-ferrari-458-italia-msrp",
    priceSourceTitle: "2015 Ferrari 458 Italia MSRP $239,340 excl. destination (iSeeCars)",
    priceSourceUrl: "https://www.iseecars.com/car/ferrari-458-italia-price",
    priceSourcePublisher: "iSeeCars",
    specSourceSlug: "motortrend-2010-ferrari-458-italia-test",
    specSourceTitle: "First Test: Ferrari 458 Italia (MotorTrend instrumented)",
    specSourceUrl: "https://www.motortrend.com/reviews/ferrari-458-italia-test",
    specSourcePublisher: "MotorTrend",
  },
  {
    slug: "2015-ferrari-458-spider-us",
    name: "458 Spider",
    modelSlug: "ferrari-458-spider",
    modelName: "458 Spider",
    year: 2015,
    generationCode: "F142-Spider",
    generationDisplayName: "458 Spider (F142) US",
    generationStartYear: 2011,
    generationEndYear: 2015,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f118/Ferrari-458-Spider.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-458-spider-4.5-v8-570hp-18349",
    imageAlt: "2015 Ferrari 458 Spider retractable-hardtop exterior",
    epaId: "35530",
    engine: {
      slug: "ferrari-f136fb-v8-562",
      name: "4.5L V8 naturally aspirated (F136FB)",
      code: "F136FB",
      displacementCc: 4497,
      cylinderCount: 8,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-f1-dct-7",
      name: "7-speed F1 dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // auto-data.net: L/W/H/WB/tracks; kerb 1535 kg; trunk 230 L.
      lengthIn: mmToIn(4527),
      widthIn: mmToIn(1937),
      heightIn: mmToIn(1211),
      wheelbaseIn: mmToIn(2650),
      frontTrackIn: mmToIn(1672),
      rearTrackIn: mmToIn(1606),
      curbWeightKg: 1535,
      cargoVolumeLiters: 230,
      seatingCapacity: 2,
    },
    performance: {
      // US SAE 562/398; auto-data 0–60 3.2 (from 0–100 3.4); top 199 mph (320 km/h).
      // estimate: quarter-mile 11.2 s — ~0.3 s over Italia MT 10.9 given +155 kg curb (auto-data).
      powerHp: 562,
      torqueLbFt: 398,
      zeroToSixtySeconds: 3.2,
      quarterMileSeconds: 11.2,
      topSpeedMph: 199,
    },
    // EPA id 35530 — 13/17/14.
    fuelEconomy: { cityMpg: 13, highwayMpg: 17, combinedMpg: 14 },
    // iSeeCars $263,553 excl. $3,750 destination.
    baseMsrpCents: 26_355_300,
    destinationCents: FERRARI_458_MY2015_DESTINATION_CENTS,
    priceSourceSlug: "iseecars-2015-ferrari-458-spider-msrp",
    priceSourceTitle: "2015 Ferrari 458 Spider MSRP $263,553 excl. destination (iSeeCars)",
    priceSourceUrl: "https://www.iseecars.com/car/ferrari-458-spider-price",
    priceSourcePublisher: "iSeeCars",
    specSourceSlug: "auto-data-ferrari-458-spider-570",
    specSourceTitle: "Ferrari 458 Spider 4.5 V8 (570 Hp) — auto-data.net",
    specSourceUrl:
      "https://www.auto-data.net/en/ferrari-458-spider-4.5-v8-570hp-18349",
    specSourcePublisher: "auto-data.net",
  },
  {
    slug: "2015-ferrari-458-speciale-us",
    name: "458 Speciale",
    modelSlug: "ferrari-458-speciale",
    modelName: "458 Speciale",
    year: 2015,
    generationCode: "F142SE",
    generationDisplayName: "458 Speciale (F142) US",
    generationStartYear: 2013,
    generationEndYear: 2015,
    bodyStyle: "COUPE",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f88/Ferrari-458-Speciale.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-458-speciale-4.5-v8-605hp-21994",
    imageAlt: "2015 Ferrari 458 Speciale coupe exterior",
    epaId: "35532",
    engine: {
      slug: "ferrari-f136fl-v8-597",
      name: "4.5L V8 naturally aspirated (F136FL)",
      code: "F136FL",
      displacementCc: 4497,
      cylinderCount: 8,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-f1-dct-7",
      name: "7-speed F1 dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // auto-data.net: 4571×1951×1203 mm; tracks 1679/1632; dry/kerb 1395 kg. Cargo not listed.
      lengthIn: mmToIn(4571),
      widthIn: mmToIn(1951),
      heightIn: mmToIn(1203),
      wheelbaseIn: mmToIn(2650),
      frontTrackIn: mmToIn(1679),
      rearTrackIn: mmToIn(1632),
      curbWeightKg: 1395,
      cargoVolumeLiters: null,
      seatingCapacity: 2,
    },
    performance: {
      // US SAE ~597 hp / 398 lb-ft (Cars.com). Ferrari / C&D 0–60 2.8; top 202 mph.
      // estimate: quarter-mile 10.7 s — Car and Driver PERFORMANCE (C/D EST) for Speciale.
      powerHp: 597,
      torqueLbFt: 398,
      zeroToSixtySeconds: 2.8,
      quarterMileSeconds: 10.7,
      topSpeedMph: 202,
    },
    // EPA id 35532 — 13/17/14; MSRP $291,744 on EPA SBS.
    fuelEconomy: { cityMpg: 13, highwayMpg: 17, combinedMpg: 14 },
    baseMsrpCents: 29_174_400,
    destinationCents: FERRARI_458_MY2015_DESTINATION_CENTS,
    priceSourceSlug: "epa-2015-ferrari-458-speciale-msrp",
    priceSourceTitle: "2015 Ferrari 458 Speciale MSRP $291,744 (fueleconomy.gov / Edmunds)",
    priceSourceUrl: "https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=35532",
    priceSourcePublisher: "U.S. EPA",
    specSourceSlug: "caranddriver-2014-ferrari-458-speciale",
    specSourceTitle: "First Drive: 2014 Ferrari 458 Speciale (Car and Driver)",
    specSourceUrl:
      "https://www.caranddriver.com/reviews/a15113517/2014-ferrari-458-speciale-first-drive-review/",
    specSourcePublisher: "Car and Driver",
  },
  {
    slug: "2015-ferrari-458-speciale-a-us",
    name: "458 Speciale A",
    modelSlug: "ferrari-458-speciale-a",
    modelName: "458 Speciale A",
    year: 2015,
    generationCode: "F142SA",
    generationDisplayName: "458 Speciale A (F142) US",
    generationStartYear: 2014,
    generationEndYear: 2015,
    bodyStyle: "CABRIOLET",
    drivetrain: "RWD",
    imageUrl: "https://www.auto-data.net/images/f104/Ferrari-458-Speciale-A.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/ferrari-458-speciale-a-4.5-v8-605hp-21996",
    imageAlt: "2015 Ferrari 458 Speciale A Aperta exterior",
    epaId: "35534",
    engine: {
      slug: "ferrari-f136fl-v8-597",
      name: "4.5L V8 naturally aspirated (F136FL)",
      code: "F136FL",
      displacementCc: 4497,
      cylinderCount: 8,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: null,
    },
    transmission: {
      slug: "ferrari-f1-dct-7",
      name: "7-speed F1 dual-clutch automatic",
      type: "DUAL_CLUTCH",
      gearCount: 7,
    },
    dimensions: {
      // auto-data.net: 4571×1951×1204 mm; tracks 1679/1632; kerb 1445 kg. Cargo not listed.
      lengthIn: mmToIn(4571),
      widthIn: mmToIn(1951),
      heightIn: mmToIn(1204),
      wheelbaseIn: mmToIn(2650),
      frontTrackIn: mmToIn(1679),
      rearTrackIn: mmToIn(1632),
      curbWeightKg: 1445,
      cargoVolumeLiters: null,
      seatingCapacity: 2,
    },
    performance: {
      // Same F136FL as Speciale; auto-data 0–60 2.8; top 199 mph (320 km/h).
      // estimate: quarter-mile 10.9 s — ~0.2 s over Speciale C&D est 10.7 for +50 kg (auto-data).
      powerHp: 597,
      torqueLbFt: 398,
      zeroToSixtySeconds: 2.8,
      quarterMileSeconds: 10.9,
      topSpeedMph: 199,
    },
    // EPA lists as "458 Speciale Spider" id 35534 — 13/17/14.
    fuelEconomy: { cityMpg: 13, highwayMpg: 17, combinedMpg: 14 },
    // Robb Report / Cars & Bids: base MSRP $318,060.
    baseMsrpCents: 31_806_000,
    destinationCents: FERRARI_458_MY2015_DESTINATION_CENTS,
    priceSourceSlug: "robbreport-2015-ferrari-458-speciale-a-msrp",
    priceSourceTitle:
      "2015 Ferrari 458 Speciale Aperta base MSRP $318,060 (Robb Report / Cars & Bids)",
    priceSourceUrl:
      "https://robbreport.com/motors/cars/2015-ferrari-458-speciale-aperta-cars-and-bids-online-auction-1234860197/",
    priceSourcePublisher: "Robb Report",
    specSourceSlug: "auto-data-ferrari-458-speciale-a-605",
    specSourceTitle: "Ferrari 458 Speciale A 4.5 V8 (605 Hp) — auto-data.net",
    specSourceUrl:
      "https://www.auto-data.net/en/ferrari-458-speciale-a-4.5-v8-605hp-21996",
    specSourcePublisher: "auto-data.net",
  },
];

const STATIC_SKIPPED = [
  "458 Italia / Spider / Speciale / Speciale A MY2009–2014: scope is final US year MY2015 only",
  "EPA stop-start variants 35529 / 35531 / 35533 / 35535 (combined 15): same powertrains as seeded no-stop-start ids",
  `Destination: MY2015 Monroney $3,750 (iSeeCars) — not modern FERRARI_DESTINATION_CENTS $${(FERRARI_DESTINATION_CENTS / 100).toFixed(0)}`,
  "Ground clearance / GVWR: not published in EPA, auto-data, or primary OEM US sheets — omitted",
  "Speciale / Speciale A cargo volume: not listed on auto-data or EPA — omitted",
];

const MODEL_DEFS: { slug: ModelSlug; name: string }[] = [
  { slug: "ferrari-458-italia", name: "458 Italia" },
  { slug: "ferrari-458-spider", name: "458 Spider" },
  { slug: "ferrari-458-speciale", name: "458 Speciale" },
  { slug: "ferrari-458-speciale-a", name: "458 Speciale A" },
];

export async function seedFerrari458(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  const models = new Map<ModelSlug, { id: string }>();
  for (const def of MODEL_DEFS) {
    const model = await prisma.vehicleModel.upsert({
      where: { slug: def.slug },
      create: {
        manufacturerId,
        name: def.name,
        slug: def.slug,
      },
      update: { manufacturerId, name: def.name },
    });
    models.set(def.slug, model);
  }

  const destinationSource = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE.slug,
    title: DESTINATION_SOURCE.title,
    publisher: DESTINATION_SOURCE.publisher,
    url: DESTINATION_SOURCE.url,
    type: DESTINATION_SOURCE.type,
  });

  const claimedImages = new Set<string>();
  const generationCache = new Map<string, { id: string }>();
  const yearCache = new Map<string, { id: string }>();
  const transmissionCache = new Map<string, { id: string }>();

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

      const model = models.get(trim.modelSlug);
      if (!model) throw new Error(`Missing model ${trim.modelSlug}`);

      const genKey = `${trim.modelSlug}:${trim.generationCode}`;
      let generation = generationCache.get(genKey);
      if (!generation) {
        generation = await prisma.vehicleGeneration.upsert({
          where: {
            modelId_code: { modelId: model.id, code: trim.generationCode },
          },
          create: {
            modelId: model.id,
            code: trim.generationCode,
            displayName: trim.generationDisplayName,
            startYear: trim.generationStartYear,
            endYear: trim.generationEndYear ?? undefined,
          },
          update: {
            displayName: trim.generationDisplayName,
            startYear: trim.generationStartYear,
            endYear: trim.generationEndYear ?? undefined,
          },
        });
        generationCache.set(genKey, generation);
      }

      const yearKey = `${generation.id}:${trim.year}`;
      let modelYear = yearCache.get(yearKey);
      if (!modelYear) {
        modelYear = await prisma.modelYear.upsert({
          where: {
            generationId_year: {
              generationId: generation.id,
              year: trim.year,
            },
          },
          create: { generationId: generation.id, year: trim.year },
          update: {},
        });
        yearCache.set(yearKey, modelYear);
      }

      const engine = await ensureFerrariEngine(prisma, {
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

      let transmission = transmissionCache.get(trim.transmission.slug);
      if (!transmission) {
        transmission = await prisma.transmission.upsert({
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
        transmissionCache.set(trim.transmission.slug, transmission);
      }

      const specSource = await upsertCatalogueSource(prisma, {
        slug: trim.specSourceSlug,
        title: trim.specSourceTitle,
        publisher: trim.specSourcePublisher,
        url: trim.specSourceUrl,
        type: "THIRD_PARTY",
      });

      const priceSource = await upsertCatalogueSource(prisma, {
        slug: trim.priceSourceSlug,
        title: trim.priceSourceTitle,
        publisher: trim.priceSourcePublisher,
        url: trim.priceSourceUrl,
        type: trim.priceSourcePublisher === "U.S. EPA" ? "GOVERNMENT" : "THIRD_PARTY",
      });

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-${trim.year}-${trim.slug}`,
        title: `EPA Fuel Economy — ${trim.year} Ferrari ${trim.name}`,
        publisher: "U.S. EPA",
        url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
        type: "GOVERNMENT",
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
          description: `${trim.year} Ferrari ${trim.name} (US).`,
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
          description: `${trim.year} Ferrari ${trim.name} (US).`,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
      });

      const dimensionsData = {
        lengthIn: trim.dimensions.lengthIn,
        widthIn: trim.dimensions.widthIn,
        heightIn: trim.dimensions.heightIn,
        wheelbaseIn: trim.dimensions.wheelbaseIn,
        frontTrackIn: trim.dimensions.frontTrackIn,
        rearTrackIn: trim.dimensions.rearTrackIn,
        curbWeightKg: trim.dimensions.curbWeightKg,
        cargoVolumeLiters: trim.dimensions.cargoVolumeLiters ?? null,
        seatingCapacity: trim.dimensions.seatingCapacity,
      };

      const performanceData = {
        powerHp: trim.performance.powerHp,
        torqueLbFt: trim.performance.torqueLbFt,
        zeroToSixtySeconds: trim.performance.zeroToSixtySeconds,
        quarterMileSeconds: trim.performance.quarterMileSeconds,
        topSpeedMph: trim.performance.topSpeedMph,
      };

      const [dimensions, performance, fuelEconomy, price, destination, image] =
        await Promise.all([
          prisma.vehicleDimensions.upsert({
            where: { vehicleId: vehicle.id },
            create: { vehicleId: vehicle.id, ...dimensionsData },
            update: dimensionsData,
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
              amountCents: trim.destinationCents,
              currency: "USD",
              effectiveAt: pricingDate,
            },
            update: {
              amountCents: trim.destinationCents,
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
          "Power, torque, 0–60 mph, quarter-mile, and top speed",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Exterior dimensions, tracks, curb weight, cargo where published",
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
          `Destination and handling $${(trim.destinationCents / 100).toFixed(0)}`,
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
