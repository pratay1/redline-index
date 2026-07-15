/**
 * Mercedes-Benz "other notable" US families seed module.
 * Seeds only trims with complete recent US-sourced data (EPA + MSRP/dims/HP).
 *
 * Hierarchy: Manufacturer → Model → Generation → Year → Trim
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Seeded (MY2023 final US years with EPA):
 * - CLS 450 4MATIC (C257) — EPA 46050
 * - Metris Cargo 126" / Passenger (W447) — EPA 46060 / 46059
 *
 * Skipped (historic-only, EU-only, or incomplete FE/MSRP):
 * B-Class, CLK, CL, CLC, R-Class, M-Class, GL-Class, X-Class, V-Class/Vito,
 * Sprinter/eSprinter (HD EPA-exempt), Metris LWB (no distinct exterior asset).
 */
import type { BodyStyle, Drivetrain, FuelType } from "../../src/generated/prisma/client";
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

/** MBUSA 2023 Metris QRG — van delivery & destination (not passenger-car D&H). */
const METRIS_DESTINATION_CENTS = 189500;

type TrimSeed = {
  slug: string;
  name: string;
  modelSlug: string;
  modelName: string;
  generationCode: string;
  generationLabel: string;
  generationStartYear: number;
  year: number;
  bodyStyle: BodyStyle;
  drivetrain: Drivetrain;
  imageUrl: string;
  imageAlt: string;
  imagePageUrl: string;
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
  transmissionSlug: string;
  transmissionName: string;
  dimensions: {
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    wheelbaseIn: number;
    frontTrackIn?: number;
    rearTrackIn?: number;
    groundClearanceIn?: number;
    curbWeightKg: number;
    grossVehicleWeightKg?: number;
    cargoVolumeLiters: number;
    seatingCapacity: number;
  };
  performance: {
    powerHp: number;
    torqueLbFt: number;
    zeroToSixtySeconds?: number;
    topSpeedMph?: number;
  };
  fuelEconomy: {
    cityMpg: number;
    highwayMpg: number;
    combinedMpg: number;
  };
  baseMsrpCents: number;
  destinationCents: number;
  destinationLocator: string;
  specSource: {
    slug: string;
    title: string;
    url: string;
    type: "MANUFACTURER" | "PRESS_RELEASE" | "THIRD_PARTY";
    publisher: string;
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
    type: "MANUFACTURER" | "THIRD_PARTY";
    publisher: string;
  };
};

const TRIMS: TrimSeed[] = [
  {
    slug: "2023-mercedes-cls-450-4matic-us",
    name: "CLS 450 4MATIC",
    modelSlug: "mercedes-cls",
    modelName: "CLS",
    generationCode: "C257",
    generationLabel: "Third generation (C257)",
    generationStartYear: 2018,
    year: 2023,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl:
      "https://file.kelleybluebookimages.com/kbb/base/evox/CP/53204/2023-Mercedes-Benz-CLS-front_53204_032_2400x1800_996.png",
    imageAlt: "2023 Mercedes-Benz CLS 450 4MATIC exterior front three-quarter",
    imagePageUrl: "https://www.kbb.com/mercedes-benz/cls/2023/specs/",
    epaId: "46050",
    engine: {
      slug: "mercedes-m256-cls-450",
      name: "M256 3.0L I6 EQ Boost",
      code: "M256",
      fuelType: "PETROL",
      displacementCc: 2999,
      cylinderCount: 6,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: "EQ Boost 48V mild hybrid",
    },
    transmissionSlug: "mercedes-9g-tronic",
    transmissionName: "9G-TRONIC 9-speed automatic",
    dimensions: {
      // Cars.com / U.S. News 2023 CLS 450 4MATIC Coupe
      lengthIn: 196.4,
      widthIn: 73.9,
      heightIn: 56.3,
      wheelbaseIn: 115.7,
      // Car and Driver 2022 CLS 450 4MATIC (unchanged C257 architecture)
      frontTrackIn: 63.8,
      rearTrackIn: 64.1,
      curbWeightKg: lbsToKg(4255),
      cargoVolumeLiters: cuFtToLiters(11.9),
      seatingCapacity: 5,
    },
    performance: {
      powerHp: 362,
      torqueLbFt: 369,
      // Kelley Blue Book 2023 CLS 450 4MATIC
      zeroToSixtySeconds: 4.5,
      topSpeedMph: 130,
    },
    fuelEconomy: { cityMpg: 22, highwayMpg: 30, combinedMpg: 25 },
    // Cars.com / U.S. News base MSRP excl. destination
    baseMsrpCents: 7650000,
    destinationCents: MERCEDES_DESTINATION_CENTS,
    destinationLocator: `Destination and handling $${(MERCEDES_DESTINATION_CENTS / 100).toFixed(0)} (MERCEDES_DESTINATION_CENTS)`,
    specSource: {
      slug: "cars-com-2023-cls-450-4matic-specs",
      title: "2023 Mercedes-Benz CLS 450 4MATIC Coupe specs",
      url: "https://www.cars.com/research/mercedes_benz-cls_450-2023/specs/428767/",
      type: "THIRD_PARTY",
      publisher: "Cars.com",
    },
    fuelSource: {
      slug: "epa-2023-mercedes-cls450-4matic-46050",
      title: "EPA Fuel Economy — 2023 Mercedes-Benz CLS450 4matic",
      url: "https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=46050",
    },
    priceSource: {
      slug: "cars-com-2023-cls-450-msrp",
      title: "2023 Mercedes-Benz CLS 450 MSRP",
      url: "https://www.cars.com/research/mercedes_benz-cls_450-2023/specs/",
      type: "THIRD_PARTY",
      publisher: "Cars.com",
    },
  },
  {
    slug: "2023-mercedes-metris-cargo-126-us",
    name: "Metris Cargo Van 126\" WB",
    modelSlug: "mercedes-metris",
    modelName: "Metris",
    generationCode: "W447",
    generationLabel: "First generation (W447)",
    generationStartYear: 2016,
    year: 2023,
    bodyStyle: "VAN",
    drivetrain: "RWD",
    imageUrl:
      "https://file.kelleybluebookimages.com/kbb/base/house/2023/2023-Mercedes-Benz-Metris%20Cargo-FrontSide_MBMETC2301_640x480.jpg",
    imageAlt: "2023 Mercedes-Benz Metris Cargo Van exterior front three-quarter",
    imagePageUrl: "https://www.kbb.com/mercedes-benz/metris/2023/specs/",
    epaId: "46060",
    engine: {
      slug: "mercedes-m274-metris-2-0t",
      name: "M274 2.0L I4 Turbo",
      code: "M274",
      fuelType: "PETROL",
      displacementCc: 1991,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmissionSlug: "mercedes-9g-tronic",
    transmissionName: "9G-TRONIC 9-speed automatic",
    dimensions: {
      // MBUSA 2023 Metris Quick Reference Guide + KBB/Edmunds curb
      lengthIn: 202.4,
      widthIn: 75.9,
      heightIn: 75.2,
      wheelbaseIn: 126.0,
      groundClearanceIn: 5.2,
      curbWeightKg: lbsToKg(4123),
      grossVehicleWeightKg: lbsToKg(6834),
      cargoVolumeLiters: cuFtToLiters(183),
      seatingCapacity: 2,
    },
    performance: {
      powerHp: 208,
      torqueLbFt: 258,
    },
    fuelEconomy: { cityMpg: 19, highwayMpg: 23, combinedMpg: 20 },
    // MBUSA QRG base MSRP excl. $1,895 D&H
    baseMsrpCents: 3960000,
    destinationCents: METRIS_DESTINATION_CENTS,
    destinationLocator: "MBUSA 2023 Metris QRG delivery & destination $1,895",
    specSource: {
      slug: "mbusa-2023-metris-quick-reference-guide",
      title: "2023 Metris Quick Reference Guide",
      url: "https://media.mbusa.com/releases/release-c2f1a87a73a786d9cc747fd47801ac59-2023-metris-quick-reference-guide",
      type: "PRESS_RELEASE",
      publisher: "Mercedes-Benz USA",
    },
    fuelSource: {
      slug: "epa-2023-mercedes-metris-cargo-46060",
      title: "EPA Fuel Economy — 2023 Mercedes-Benz Metris (Cargo Van)",
      url: "https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=46060",
    },
    priceSource: {
      slug: "mbusa-2023-metris-qrg-msrp",
      title: "2023 Metris Quick Reference Guide — Models & MSRP",
      url: "https://media.mbusa.com/releases/release-c2f1a87a73a786d9cc747fd47801ac59-2023-metris-quick-reference-guide",
      type: "MANUFACTURER",
      publisher: "Mercedes-Benz USA",
    },
  },
  {
    slug: "2023-mercedes-metris-passenger-us",
    name: "Metris Passenger Van",
    modelSlug: "mercedes-metris",
    modelName: "Metris",
    generationCode: "W447",
    generationLabel: "First generation (W447)",
    generationStartYear: 2016,
    year: 2023,
    bodyStyle: "VAN",
    drivetrain: "RWD",
    imageUrl:
      "https://file.kelleybluebookimages.com/kbb/base/house/2022/2022-Mercedes-Benz-Metris%20Passenger-FrontSide_MBMETP2201_640x480.jpg",
    imageAlt: "Mercedes-Benz Metris Passenger Van exterior front three-quarter",
    imagePageUrl: "https://www.kbb.com/mercedes-benz/metris/2023/specs/",
    epaId: "46059",
    engine: {
      slug: "mercedes-m274-metris-2-0t",
      name: "M274 2.0L I4 Turbo",
      code: "M274",
      fuelType: "PETROL",
      displacementCc: 1991,
      cylinderCount: 4,
      configuration: "Inline",
      induction: "Turbocharger",
      electrification: null,
    },
    transmissionSlug: "mercedes-9g-tronic",
    transmissionName: "9G-TRONIC 9-speed automatic",
    dimensions: {
      lengthIn: 202.4,
      widthIn: 75.9,
      heightIn: 74.4,
      wheelbaseIn: 126.0,
      groundClearanceIn: 5.2,
      curbWeightKg: lbsToKg(4409),
      grossVehicleWeightKg: lbsToKg(6834),
      // Behind 3rd row (MBUSA QRG)
      cargoVolumeLiters: cuFtToLiters(37.4),
      seatingCapacity: 8,
    },
    performance: {
      powerHp: 208,
      torqueLbFt: 258,
    },
    fuelEconomy: { cityMpg: 18, highwayMpg: 22, combinedMpg: 19 },
    baseMsrpCents: 4360000,
    destinationCents: METRIS_DESTINATION_CENTS,
    destinationLocator: "MBUSA 2023 Metris QRG delivery & destination $1,895",
    specSource: {
      slug: "mbusa-2023-metris-quick-reference-guide",
      title: "2023 Metris Quick Reference Guide",
      url: "https://media.mbusa.com/releases/release-c2f1a87a73a786d9cc747fd47801ac59-2023-metris-quick-reference-guide",
      type: "PRESS_RELEASE",
      publisher: "Mercedes-Benz USA",
    },
    fuelSource: {
      slug: "epa-2023-mercedes-metris-passenger-46059",
      title: "EPA Fuel Economy — 2023 Mercedes-Benz Metris (Passenger Van)",
      url: "https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=46059",
    },
    priceSource: {
      slug: "mbusa-2023-metris-qrg-msrp",
      title: "2023 Metris Quick Reference Guide — Models & MSRP",
      url: "https://media.mbusa.com/releases/release-c2f1a87a73a786d9cc747fd47801ac59-2023-metris-quick-reference-guide",
      type: "MANUFACTURER",
      publisher: "Mercedes-Benz USA",
    },
  },
];

const STATIC_SKIPPED: string[] = [
  "B-Class: no current/recent complete US-market trim (historic US B250e era only)",
  "CLK: historic US coupe/cabriolet only — incomplete current data",
  "CL: historic US coupe only — incomplete current data",
  "CLC: never a recent complete US production trim set",
  "R-Class: historic US only — incomplete current data",
  "M-Class (pre-GLE): historic US only — superseded by GLE",
  "GL-Class (pre-GLS): historic US only — superseded by GLS",
  "X-Class: not sold in US",
  "V-Class / Vito: EU naming; US equivalent was Metris (seeded where complete)",
  "Sprinter / eSprinter (current US): HD GVWR — exempt from EPA FE labeling; incomplete fuelEconomy record",
  "Metris Cargo Van 135\" LWB (EPA 46061): skipped — no unique exterior image distinct from SWB cargo",
  "Metris US Postal variants: fleet-only; not general retail catalogue",
  "Metris Getaway camper: incomplete EPA/dims for catalogue trim",
];

export async function seedMercedesOther(
  ctx: SeedCtx,
): Promise<{ seeded: string[]; skipped: string[] }> {
  const { prisma, importerId, manufacturerId, pricingDate } = ctx;
  const seeded: string[] = [];
  const skipped: string[] = [...STATIC_SKIPPED];

  const transmissionBySlug = new Map<string, string>();

  for (const trim of TRIMS) {
    try {
      const imageUrl = await assertImageUrlOk(trim.imageUrl);
      const imageSource = await ensureImageSource(prisma, {
        slug: `img-${trim.slug}`,
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

      let transmissionId = transmissionBySlug.get(trim.transmissionSlug);
      if (!transmissionId) {
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
        transmissionId = transmission.id;
        transmissionBySlug.set(trim.transmissionSlug, transmissionId);
      }

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
        publisher: trim.specSource.publisher,
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
        publisher: trim.priceSource.publisher,
        url: trim.priceSource.url,
        type: trim.priceSource.type,
      });

      const destinationSource = await upsertCatalogueSource(prisma, {
        slug:
          trim.destinationCents === METRIS_DESTINATION_CENTS
            ? "mbusa-2023-metris-destination"
            : "mercedes-destination-fee-shared",
        title:
          trim.destinationCents === METRIS_DESTINATION_CENTS
            ? "2023 Metris delivery & destination"
            : "Mercedes-Benz US destination & handling",
        publisher: "Mercedes-Benz USA",
        url:
          trim.destinationCents === METRIS_DESTINATION_CENTS
            ? "https://media.mbusa.com/releases/release-c2f1a87a73a786d9cc747fd47801ac59-2023-metris-quick-reference-guide"
            : "https://www.mbusa.com/",
        type: "MANUFACTURER",
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
          transmissionId,
          description: `${trim.year} Mercedes-Benz ${trim.name} (US).`,
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
          transmissionId,
          description: `${trim.year} Mercedes-Benz ${trim.name} (US).`,
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
              credit: "Mercedes-Benz / Kelley Blue Book",
              position: 0,
            },
            update: {
              sourceId: imageSource.id,
              url: imageUrl,
              alt: trim.imageAlt,
              credit: "Mercedes-Benz / Kelley Blue Book",
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
          "Power / torque (and 0–60 / top speed when listed)",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          "Length / width / height / wheelbase / cargo / curb",
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
          trim.destinationLocator,
        ),
        upsertCitation(
          prisma,
          imageSource.id,
          "VehicleImage",
          image.id,
          "url",
          "Exterior stock / OEM-style still",
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
