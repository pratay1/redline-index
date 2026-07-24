/**
 * Lamborghini Urus US catalogue seed.
 * - Base Urus: final ICE MY2022 (last non-S gas year before SE era)
 * - Urus S / Performante: final ICE MY2024
 * - Urus SE: current PHEV MY2026 (EPA)
 * Destination: LAMBORGHINI_DESTINATION_CENTS.suv ($3,995).
 * Idempotent — does not wire itself into prisma/seed.ts.
 *
 * Exterior images (unique):
 * - https://www.auto-data.net/images/f125/Lamborghini-Urus.jpg
 * - https://www.auto-data.net/images/f115/Lamborghini-Urus.jpg
 * - https://www.auto-data.net/images/f45/Lamborghini-Urus.jpg
 * - https://www.auto-data.net/images/f75/Lamborghini-Urus-facelift-2024.jpg
 */
import type { FuelType } from "../../src/generated/prisma/client";
import {
  LAMBORGHINI_DESTINATION_CENTS,
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureLamborghiniEngine,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./lamborghini-shared";

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
  year: number;
  generationCode: string;
  generationLabel: string;
  generationStartYear: number;
  bodyStyle: "SUV";
  drivetrain: "AWD";
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
  epaId: string;
  engine: {
    slug: string;
    name: string;
    code: string;
    fuelType: FuelType;
    displacementCc: number;
    cylinderCount: number;
    configuration: string;
    induction: string;
    electrification: string | null;
  };
  transmission: {
    slug: string;
    name: string;
    type: "AUTOMATIC";
    gearCount: number;
  };
  dimensions: {
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    wheelbaseIn: number;
    curbWeightKg: number;
    cargoVolumeLiters: number;
    seatingCapacity: number;
  };
  performance: {
    powerHp: number;
    torqueLbFt: number;
    zeroToSixtySeconds: number;
  };
  fuelEconomy: {
    cityMpg: number;
    highwayMpg: number;
    combinedMpg: number;
    electricRangeMiles?: number;
  };
  /** BASE_MSRP in cents (excludes destination). */
  baseMsrpCents: number;
  specSourceSlug: string;
  priceSourceSlug: string;
};

const SPEC_SOURCES = [
  {
    slug: "caranddriver-2022-lamborghini-urus-specs",
    title: "2022 Lamborghini Urus AWD Features and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/lamborghini/urus/specs/2022/lamborghini_urus_lamborghini-urus_2022",
    publisher: "Car and Driver",
  },
  {
    slug: "caranddriver-2024-lamborghini-urus-s-specs",
    title: "2024 Lamborghini Urus S AWD Features and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/lamborghini/urus/specs/2024/lamborghini_urus_lamborghini-urus_2024",
    publisher: "Car and Driver",
  },
  {
    slug: "caranddriver-2024-lamborghini-urus-performante-specs",
    title:
      "2024 Lamborghini Urus Performante AWD Features and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/lamborghini/urus/specs/2024/lamborghini_urus_lamborghini-urus-performante_2024",
    publisher: "Car and Driver",
  },
  {
    slug: "caranddriver-2025-lamborghini-urus-se-specs",
    title: "2025 Lamborghini Urus SE AWD Features and Specs (Car and Driver)",
    url: "https://www.caranddriver.com/lamborghini/urus/specs/2025/lamborghini_urus_lamborghini-urus_2025",
    publisher: "Car and Driver",
  },
  {
    slug: "lamborghini-urus-s-2024-brochure",
    title: "Urus S Digital Brochure EN 2024 (Automobili Lamborghini)",
    url: "https://www.lamborghini.com/original/DAM/lamborghini/facelift_2019/model_detail/gateway_urus/s/2024/brochure/07_24/URUS%20S_DIGITAL_BROCHURE_WCAG_EN_2024.pdf",
    publisher: "Automobili Lamborghini",
  },
  {
    slug: "lamborghini-urus-performante-2024-brochure",
    title: "Urus Performante Digital Brochure EN 2024 (Automobili Lamborghini)",
    url: "https://www.lamborghini.com/original/DAM/lamborghini/facelift_2019/model_detail/gateway_urus/performante/2024/brochure/URUS%20PERFORMANCE_DIGITAL_BROCHURE_WCAG_EN_2024.pdf",
    publisher: "Automobili Lamborghini",
  },
] as const;

const PRICE_SOURCES = [
  {
    slug: "cars-com-2022-lamborghini-urus-msrp",
    title: "2022 Lamborghini Urus specs & colors (Cars.com) — base MSRP",
    url: "https://www.cars.com/research/lamborghini-urus-2022/specs/",
    publisher: "Cars.com",
  },
  {
    slug: "cars-com-2024-lamborghini-urus-msrp",
    title: "2024 Lamborghini Urus Specs, Dimensions & Colors (Cars.com) — base MSRP",
    url: "https://www.cars.com/research/lamborghini-urus-2024/specs/",
    publisher: "Cars.com",
  },
  {
    slug: "caranddriver-2026-lamborghini-urus-msrp",
    title:
      "2026 Lamborghini Urus SE Features and Specs (Car and Driver) — as-shown MSRP less destination",
    url: "https://www.caranddriver.com/lamborghini/urus/specs",
    publisher: "Car and Driver",
  },
] as const;

const DESTINATION_SOURCE = {
  slug: "lamborghini-urus-destination-3995",
  title:
    "Lamborghini Urus US destination & handling $3,995 (Monroney-style / catalogue constant)",
  url: "https://www.cars.com/research/lamborghini-urus-2024/specs/",
  type: "THIRD_PARTY" as const,
  publisher: "Cars.com / Redline catalogue",
};

const TRIMS: TrimSeed[] = [
  {
    slug: "2022-lamborghini-urus-us",
    name: "Urus",
    year: 2022,
    generationCode: "URUS",
    generationLabel: "First generation (2018–2024 ICE)",
    generationStartYear: 2018,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f125/Lamborghini-Urus.jpg",
    imagePageUrl: "https://www.auto-data.net/en/lamborghini-urus-generation-5439",
    imageAlt: "2022 Lamborghini Urus exterior front view in blue",
    epaId: "44157",
    engine: {
      slug: "lamborghini-urus-4-0tt-v8-650",
      name: "4.0L V8 twin-turbo",
      code: "URUS-4.0TT-V8-650",
      fuelType: "PETROL",
      displacementCc: 3996,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "lamborghini-urus-8-auto",
      name: "8-speed automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // C&D 2022 Urus AWD specs sheet
      lengthIn: 201.3,
      widthIn: 79.4,
      heightIn: 64.5,
      wheelbaseIn: 118.2,
      curbWeightKg: lbsToKg(4844),
      cargoVolumeLiters: cuFtToLiters(21.8),
      seatingCapacity: 5,
    },
    performance: {
      // C&D: 641 hp / 626 lb-ft; Lamborghini claim 0–100 km/h 3.6 s
      powerHp: 641,
      torqueLbFt: 626,
      zeroToSixtySeconds: 3.6,
    },
    // EPA id 44157
    fuelEconomy: { cityMpg: 12, highwayMpg: 17, combinedMpg: 14 },
    // Cars.com base MSRP $225,500 (excludes destination)
    baseMsrpCents: 22_550_000,
    specSourceSlug: "caranddriver-2022-lamborghini-urus-specs",
    priceSourceSlug: "cars-com-2022-lamborghini-urus-msrp",
  },
  {
    slug: "2024-lamborghini-urus-s-us",
    name: "Urus S",
    year: 2024,
    generationCode: "URUS",
    generationLabel: "First generation (2018–2024 ICE)",
    generationStartYear: 2018,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f115/Lamborghini-Urus.jpg",
    imagePageUrl: "https://www.auto-data.net/en/lamborghini-urus-generation-5439",
    imageAlt: "2024 Lamborghini Urus S exterior front three-quarter in dark grey",
    epaId: "46746",
    engine: {
      slug: "lamborghini-urus-4-0tt-v8-666",
      name: "4.0L V8 twin-turbo",
      code: "URUS-4.0TT-V8-666",
      fuelType: "PETROL",
      displacementCc: 3996,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "lamborghini-urus-8-auto",
      name: "8-speed automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // C&D 2024 Urus S; curb 4,844 lb (Carbuzz / C&D family)
      lengthIn: 201.3,
      widthIn: 79.4,
      heightIn: 64.5,
      wheelbaseIn: 118.2,
      curbWeightKg: lbsToKg(4844),
      cargoVolumeLiters: cuFtToLiters(21.8),
      seatingCapacity: 5,
    },
    performance: {
      // C&D US: 657 hp / 627 lb-ft; Lamborghini 0–100 km/h 3.5 s
      powerHp: 657,
      torqueLbFt: 627,
      zeroToSixtySeconds: 3.5,
    },
    // EPA id 46746
    fuelEconomy: { cityMpg: 14, highwayMpg: 19, combinedMpg: 16 },
    // Cars.com base MSRP $237,848 (excludes destination)
    baseMsrpCents: 23_784_800,
    specSourceSlug: "caranddriver-2024-lamborghini-urus-s-specs",
    priceSourceSlug: "cars-com-2024-lamborghini-urus-msrp",
  },
  {
    slug: "2024-lamborghini-urus-performante-us",
    name: "Urus Performante",
    year: 2024,
    generationCode: "URUS",
    generationLabel: "First generation (2018–2024 ICE)",
    generationStartYear: 2018,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl: "https://www.auto-data.net/images/f45/Lamborghini-Urus.jpg",
    imagePageUrl: "https://www.auto-data.net/en/lamborghini-urus-generation-5439",
    imageAlt:
      "2024 Lamborghini Urus Performante exterior rear three-quarter with carbon arches",
    epaId: "46680",
    engine: {
      slug: "lamborghini-urus-4-0tt-v8-666",
      name: "4.0L V8 twin-turbo",
      code: "URUS-4.0TT-V8-666",
      fuelType: "PETROL",
      displacementCc: 3996,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: null,
    },
    transmission: {
      slug: "lamborghini-urus-8-auto",
      name: "8-speed automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // C&D 2024 Performante; curb 4,740 lb
      lengthIn: 202.2,
      widthIn: 79.8,
      heightIn: 63.7,
      wheelbaseIn: 118.3,
      curbWeightKg: lbsToKg(4740),
      cargoVolumeLiters: cuFtToLiters(21.8),
      seatingCapacity: 5,
    },
    performance: {
      // C&D / The Drive: 657 hp / 627 lb-ft; Lamborghini 0–100 km/h 3.3 s
      powerHp: 657,
      torqueLbFt: 627,
      zeroToSixtySeconds: 3.3,
    },
    // EPA id 46680
    fuelEconomy: { cityMpg: 14, highwayMpg: 19, combinedMpg: 16 },
    // Cars.com base MSRP $269,885 (excludes destination)
    baseMsrpCents: 26_988_500,
    specSourceSlug: "caranddriver-2024-lamborghini-urus-performante-specs",
    priceSourceSlug: "cars-com-2024-lamborghini-urus-msrp",
  },
  {
    slug: "2026-lamborghini-urus-se-us",
    name: "Urus SE",
    year: 2026,
    generationCode: "URUS-FL2024",
    generationLabel: "Facelift PHEV (2024–)",
    generationStartYear: 2024,
    bodyStyle: "SUV",
    drivetrain: "AWD",
    imageUrl:
      "https://www.auto-data.net/images/f75/Lamborghini-Urus-facelift-2024.jpg",
    imagePageUrl:
      "https://www.auto-data.net/en/lamborghini-urus-facelift-2024-generation-10004",
    imageAlt: "2026 Lamborghini Urus SE exterior front view in orange",
    epaId: "49755",
    engine: {
      slug: "lamborghini-urus-se-4-0tt-v8-phev",
      name: "4.0L V8 twin-turbo PHEV",
      code: "URUS-SE-4.0TT-V8-PHEV",
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 3996,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbocharger",
      electrification: "PHEV (141 kW AC 3-Phase; EPA)",
    },
    transmission: {
      slug: "lamborghini-urus-8-auto",
      name: "8-speed automatic",
      type: "AUTOMATIC",
      gearCount: 8,
    },
    dimensions: {
      // C&D 2025/2026 Urus SE family; curb 5,523 lb
      lengthIn: 201.7,
      widthIn: 79.6,
      heightIn: 64.5,
      wheelbaseIn: 118.2,
      curbWeightKg: lbsToKg(5523),
      cargoVolumeLiters: cuFtToLiters(16),
      seatingCapacity: 5,
    },
    performance: {
      // C&D: combined 789 hp / 701 lb-ft; Lamborghini 0–100 km/h 3.4 s
      powerHp: 789,
      torqueLbFt: 701,
      zeroToSixtySeconds: 3.4,
    },
    // EPA id 49755 — gas-only city/hwy/comb + electric range (rangeA)
    fuelEconomy: {
      cityMpg: 19,
      highwayMpg: 21,
      combinedMpg: 20,
      electricRangeMiles: 35,
    },
    // C&D 2026 as-shown $252,007 − $3,995 destination = $248,012
    baseMsrpCents: 24_801_200,
    specSourceSlug: "caranddriver-2025-lamborghini-urus-se-specs",
    priceSourceSlug: "caranddriver-2026-lamborghini-urus-msrp",
  },
];

const STATIC_SKIPPED = [
  "Urus Pearl Capsule / Graphite Capsule: appearance packages, not distinct powertrains",
  "2023 Urus S / Performante: intermediate ICE years; final US ICE seeded as MY2024",
  "2025 Urus S / Performante ICE carryover: superseded by SE; final ICE year seeded as 2024",
  "2025 Urus SE: EPA twin of MY2026; current US year seeded as 2026 (EPA 49755)",
  "Urus SE Performante (MY2027): announced; no US EPA listing yet for this seed pass",
];

export async function seedLamborghiniUrus(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  const model = await prisma.vehicleModel.upsert({
    where: { slug: "lamborghini-urus" },
    create: {
      manufacturerId,
      name: "Urus",
      slug: "lamborghini-urus",
    },
    update: { manufacturerId, name: "Urus" },
  });

  const destinationSource = await upsertCatalogueSource(prisma, {
    slug: DESTINATION_SOURCE.slug,
    title: DESTINATION_SOURCE.title,
    publisher: DESTINATION_SOURCE.publisher,
    url: DESTINATION_SOURCE.url,
    type: DESTINATION_SOURCE.type,
  });

  const specSources = new Map<string, { id: string }>();
  for (const sourceData of SPEC_SOURCES) {
    const source = await upsertCatalogueSource(prisma, {
      slug: sourceData.slug,
      title: sourceData.title,
      publisher: sourceData.publisher,
      url: sourceData.url,
      type: sourceData.slug.startsWith("lamborghini-")
        ? "MANUFACTURER"
        : "THIRD_PARTY",
    });
    specSources.set(sourceData.slug, source);
  }

  const priceSources = new Map<string, { id: string }>();
  for (const sourceData of PRICE_SOURCES) {
    const source = await upsertCatalogueSource(prisma, {
      slug: sourceData.slug,
      title: sourceData.title,
      publisher: sourceData.publisher,
      url: sourceData.url,
      type: "THIRD_PARTY",
    });
    priceSources.set(sourceData.slug, source);
  }

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
        slug: `autodata-image-${trim.slug}`,
        title: `${trim.name} exterior (auto-data.net)`,
        pageUrl: trim.imagePageUrl,
        publisher: "auto-data.net",
      });

      const genKey = trim.generationCode;
      let generation = generationCache.get(genKey);
      if (!generation) {
        generation = await prisma.vehicleGeneration.upsert({
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

      const engine = await ensureLamborghiniEngine(prisma, {
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

      const specSource = specSources.get(trim.specSourceSlug);
      if (!specSource) {
        throw new Error(`Missing spec source ${trim.specSourceSlug}`);
      }
      const priceSource = priceSources.get(trim.priceSourceSlug);
      if (!priceSource) {
        throw new Error(`Missing price source ${trim.priceSourceSlug}`);
      }

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-${trim.year}-${trim.slug}`,
        title: `EPA Fuel Economy — ${trim.year} Lamborghini ${trim.name}`,
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
          description: `${trim.year} Lamborghini ${trim.name} SUV (US).`,
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
          description: `${trim.year} Lamborghini ${trim.name} SUV (US).`,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
      });

      const destinationCents = LAMBORGHINI_DESTINATION_CENTS.suv;

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
              amountCents: destinationCents,
              currency: "USD",
              effectiveAt: pricingDate,
            },
            update: {
              amountCents: destinationCents,
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

      const citationTasks = [
        upsertCitation(
          prisma,
          specSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "Power, torque, and 0–60 mph",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Exterior dimensions, curb weight, cargo",
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
          `Destination and handling $${(destinationCents / 100).toFixed(0)}`,
        ),
        upsertCitation(
          prisma,
          imageSource.id,
          "VehicleImage",
          image.id,
          "url",
          "auto-data.net exterior asset",
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
      seeded.push(`${trim.slug} | EPA=${trim.epaId} | image=${imageUrl}`);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      skipped.push(`${trim.slug}: ${reason}`);
    }
  }

  return { seeded, skipped };
}
