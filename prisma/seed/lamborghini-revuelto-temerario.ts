/**
 * Lamborghini Revuelto + Temerario US seed module (current MY2026).
 * Idempotent — safe to re-run. Does not wire itself into prisma/seed.ts.
 *
 * Seeded:
 * - 2026 Revuelto coupe (EPA 49993) — hybrid V12 HPEV
 * - 2026 Temerario coupe (EPA 49994) — twin-turbo V8 HPEV
 *
 * Sources:
 * - EPA fueleconomy.gov ids 49993 / 49994 (gas-only city/hwy/comb)
 * - Lamborghini MY2026 digital brochures (dims, system output, 0–100, top speed, EPA MPGe / EV range notes)
 * - Car and Driver specs / reviews (US SAE hp, curb weight Temerario, MSRP, EV range)
 * - iSeeCars Monroney-style destination $3,995
 */
import type {
  BodyStyle,
  Drivetrain,
  FuelType,
  TransmissionType,
} from "../../src/generated/prisma/client";
import {
  assertImageUrlOk,
  ensureAudit,
  ensureImageSource,
  ensureLamborghiniEngine,
  upsertCatalogueSource,
  upsertCitation,
  type SeedCtx,
} from "./lamborghini-shared";

const LBS_TO_KG = 0.45359237;
const MM_TO_IN = 1 / 25.4;
const KM_TO_MI = 0.621371;

/** Monroney-style US destination for MY2026 Revuelto / Temerario (iSeeCars). */
const DESTINATION_2026_CENTS = 399_500;

function lbsToKg(lbs: number) {
  return Math.round(lbs * LBS_TO_KG);
}

function mmToIn(mm: number) {
  return Math.round(mm * MM_TO_IN * 10) / 10;
}

function kmhToMph(kmh: number) {
  return Math.round(kmh * KM_TO_MI);
}

/** Unique auto-data.net exteriors (HEAD-verified JPEG; distinct assets). */
const IMAGE_REVUELTO =
  "https://www.auto-data.net/images/f122/Lamborghini-Revuelto.jpg";
const IMAGE_TEMERARIO =
  "https://www.auto-data.net/images/f127/Lamborghini-Temerario.jpg";

type ModelKey = "revuelto" | "temerario";

type TrimSeed = {
  slug: string;
  name: string;
  modelKey: ModelKey;
  modelSlug: string;
  modelName: string;
  generationCode: string;
  generationDisplayName: string;
  generationStartYear: number;
  generationEndYear: number | null;
  year: 2026;
  bodyStyle: BodyStyle;
  drivetrain: Drivetrain;
  imageUrl: string;
  imagePageUrl: string;
  imageAlt: string;
  epaId: string;
  engine: {
    slug: string;
    name: string;
    code: string | null;
    fuelType: FuelType;
    displacementCc: number;
    cylinderCount: number;
    configuration: string;
    induction: string;
    electrification: string;
  };
  transmission: {
    slug: string;
    name: string;
    type: TransmissionType;
    gearCount: number;
  };
  dimensions: {
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    wheelbaseIn: number;
    frontTrackIn: number;
    rearTrackIn: number;
    curbWeightKg?: number;
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
    electricRangeMiles: number;
  };
  /** BASE_MSRP in cents (excludes destination). */
  baseMsrpCents: number;
  description: string;
  specSource: {
    slug: string;
    title: string;
    url: string;
    publisher: string;
    type: "MANUFACTURER" | "THIRD_PARTY";
  };
  priceSource: {
    slug: string;
    title: string;
    url: string;
    publisher: string;
    type: "THIRD_PARTY";
  };
};

const TRIMS: TrimSeed[] = [
  {
    slug: "2026-lamborghini-revuelto-us",
    name: "Revuelto",
    modelKey: "revuelto",
    modelSlug: "lamborghini-revuelto",
    modelName: "Revuelto",
    generationCode: "LB744",
    generationDisplayName: "Revuelto (LB744)",
    generationStartYear: 2023,
    generationEndYear: null,
    year: 2026,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl: IMAGE_REVUELTO,
    imagePageUrl: "https://www.lamborghini.com/en-en/models/revuelto",
    imageAlt: "2026 Lamborghini Revuelto coupe exterior",
    epaId: "49993",
    engine: {
      slug: "lamborghini-l545-v12-phev",
      name: "L545 6.5L V12 + three electric motors (PHEV)",
      code: "L545",
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 6499,
      cylinderCount: 12,
      configuration: "V",
      induction: "Naturally aspirated",
      electrification: "PHEV (front axle dual e-motors + rear e-motor; ~3.8 kWh)",
    },
    transmission: {
      slug: "lamborghini-dct-8-revuelto",
      name: "8-speed dual-clutch automatic (AM-S8)",
      type: "DUAL_CLUTCH",
      gearCount: 8,
    },
    dimensions: {
      // Lamborghini MY2026 brochure mm→in (width excl. mirrors); tracks OEM.
      lengthIn: mmToIn(4947),
      widthIn: mmToIn(2038),
      heightIn: mmToIn(1161),
      wheelbaseIn: mmToIn(2779),
      frontTrackIn: mmToIn(1720),
      rearTrackIn: mmToIn(1701),
      // Curb weight not published as distinct from dry (1,780 kg EU MY26) — omit.
      seatingCapacity: 2,
    },
    performance: {
      // Combined system 1,001 hp (C&D SAE); ICE torque 534 lb-ft @ 6,750 (725 Nm).
      powerHp: 1001,
      torqueLbFt: 534,
      // OEM 0–100 km/h 2.5 s (catalogue uses as 0–60 claim).
      zeroToSixtySeconds: 2.5,
      // OEM top speed >350 km/h.
      topSpeedMph: kmhToMph(350),
    },
    fuelEconomy: {
      // EPA id 49993 gas-only; brochure / C&D: 23 MPGe combined, 5 mi EV range.
      cityMpg: 10,
      highwayMpg: 17,
      combinedMpg: 12,
      electricRangeMiles: 5,
    },
    // C&D / CarsDirect base MSRP $608,358 excl. destination.
    baseMsrpCents: 60_835_800,
    description:
      "2026 Lamborghini Revuelto (US). Mid-engine naturally aspirated V12 plug-in hybrid with three electric motors, AWD, 8-speed dual-clutch.",
    specSource: {
      slug: "lamborghini-revuelto-my2026-brochure",
      title: "Lamborghini Revuelto Digital Brochure MY2026 (EN)",
      url: "https://www.lamborghini.com/original/DAM/lamborghini/0_facelift_2025/model_details/revuelto/2026/brochure/03_05/Lamborghini_REVUELTO_DIGITAL_BROCHURE_EN_2026_WCAG.pdf",
      publisher: "Automobili Lamborghini",
      type: "MANUFACTURER",
    },
    priceSource: {
      slug: "caranddriver-2026-lamborghini-revuelto-specs",
      title: "2026 Lamborghini Revuelto Specs / MSRP (Car and Driver)",
      url: "https://www.caranddriver.com/lamborghini/revuelto/specs",
      publisher: "Car and Driver",
      type: "THIRD_PARTY",
    },
  },
  {
    slug: "2026-lamborghini-temerario-us",
    name: "Temerario",
    modelKey: "temerario",
    modelSlug: "lamborghini-temerario",
    modelName: "Temerario",
    generationCode: "404",
    generationDisplayName: "Temerario (404)",
    generationStartYear: 2026,
    generationEndYear: null,
    year: 2026,
    bodyStyle: "COUPE",
    drivetrain: "AWD",
    imageUrl: IMAGE_TEMERARIO,
    imagePageUrl: "https://www.lamborghini.com/en-en/models/temerario",
    imageAlt: "2026 Lamborghini Temerario coupe exterior",
    epaId: "49994",
    engine: {
      slug: "lamborghini-v8-tt-phev-temerario",
      name: "4.0L twin-turbo V8 + three electric motors (PHEV)",
      code: null,
      fuelType: "PLUG_IN_HYBRID",
      displacementCc: 3995,
      cylinderCount: 8,
      configuration: "V",
      induction: "Twin-turbo",
      electrification: "PHEV (front e-axle + P1 e-motor; ~3.8 kWh)",
    },
    transmission: {
      slug: "lamborghini-dct-8-temerario",
      name: "8-speed dual-clutch automatic (S8)",
      type: "DUAL_CLUTCH",
      gearCount: 8,
    },
    dimensions: {
      // Lamborghini MY2026 brochure / C&D specs (mm→in / published inches).
      lengthIn: mmToIn(4706),
      widthIn: mmToIn(1996),
      heightIn: mmToIn(1201),
      wheelbaseIn: mmToIn(2658),
      frontTrackIn: mmToIn(1722),
      rearTrackIn: mmToIn(1670),
      // C&D base curb weight 4,240 lb.
      curbWeightKg: lbsToKg(4240),
      seatingCapacity: 2,
    },
    performance: {
      // Combined 907 hp (C&D SAE / 920 CV); ICE torque 538 lb-ft (730 Nm).
      powerHp: 907,
      torqueLbFt: 538,
      // OEM 0–100 km/h 2.7 s.
      zeroToSixtySeconds: 2.7,
      // OEM top speed 343 km/h.
      topSpeedMph: kmhToMph(343),
    },
    fuelEconomy: {
      // EPA id 49994 gas-only; brochure / C&D: 24 MPGe combined, 4 mi EV range.
      cityMpg: 14,
      highwayMpg: 19,
      combinedMpg: 16,
      electricRangeMiles: 4,
    },
    // C&D starting MSRP $387,649 excl. destination (matches Base listing pattern vs Revuelto).
    baseMsrpCents: 38_764_900,
    description:
      "2026 Lamborghini Temerario (US). Mid-engine twin-turbo V8 plug-in hybrid with three electric motors, AWD, 8-speed dual-clutch.",
    specSource: {
      slug: "lamborghini-temerario-my2026-brochure",
      title: "Lamborghini Temerario Digital Brochure MY2026 (EN)",
      url: "https://www.lamborghini.com/original/DAM/lamborghini/0_facelift_2025/model_details/temerario/brochure/2026/02_23/Lamborghini%20Temerario_DIGITAL_BROCHURE_EN_2026_WCAG.pdf",
      publisher: "Automobili Lamborghini",
      type: "MANUFACTURER",
    },
    priceSource: {
      slug: "caranddriver-2026-lamborghini-temerario",
      title: "2026 Lamborghini Temerario Review / Pricing (Car and Driver)",
      url: "https://www.caranddriver.com/lamborghini/temerario",
      publisher: "Car and Driver",
      type: "THIRD_PARTY",
    },
  },
];

const STATIC_SKIPPED = [
  "MY2024–2025 Revuelto: catalogue prefers current MY2026 (EPA id 49993) with matching MSRP",
  "2026 Revuelto NA63: limited North America 63-unit special edition; cosmetic package, not a distinct powertrain trim",
  "Temerario Alleggerita / carbon wheel packages: appearance and weight options on the same V8 PHEV powertrain — skipped as separate trims",
];

const DESTINATION_SOURCE = {
  slug: "iseecars-2026-lamborghini-revuelto-temerario-destination",
  title: "2026 Lamborghini Revuelto / Temerario Destination Charge (iSeeCars)",
  url: "https://www.iseecars.com/car/lamborghini-revuelto-price",
  type: "THIRD_PARTY" as const,
  publisher: "iSeeCars",
};

export async function seedLamborghiniRevueltoTemerario(
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
  const modelCache = new Map<
    string,
    { id: string; generationId: string; modelYearId: string }
  >();

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

      let hierarchy = modelCache.get(trim.modelSlug);
      if (!hierarchy) {
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

        hierarchy = {
          id: model.id,
          generationId: generation.id,
          modelYearId: modelYear.id,
        };
        modelCache.set(trim.modelSlug, hierarchy);
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
        slug: trim.specSource.slug,
        title: trim.specSource.title,
        publisher: trim.specSource.publisher,
        url: trim.specSource.url,
        type: trim.specSource.type,
      });

      const fuelSource = await upsertCatalogueSource(prisma, {
        slug: `epa-2026-${trim.slug}`,
        title: `EPA Fuel Economy — 2026 Lamborghini ${trim.name}`,
        publisher: "U.S. EPA",
        url: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${trim.epaId}`,
        type: "GOVERNMENT",
      });

      const priceSource = await upsertCatalogueSource(prisma, {
        slug: trim.priceSource.slug,
        title: trim.priceSource.title,
        publisher: trim.priceSource.publisher,
        url: trim.priceSource.url,
        type: trim.priceSource.type,
      });

      const vehicle = await prisma.vehicle.upsert({
        where: { slug: trim.slug },
        create: {
          slug: trim.slug,
          modelYearId: hierarchy.modelYearId,
          name: trim.name,
          market: "US",
          bodyStyle: trim.bodyStyle,
          drivetrain: trim.drivetrain,
          engineId: engine.id,
          transmissionId: transmission.id,
          description: trim.description,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
        update: {
          modelYearId: hierarchy.modelYearId,
          name: trim.name,
          market: "US",
          bodyStyle: trim.bodyStyle,
          drivetrain: trim.drivetrain,
          engineId: engine.id,
          transmissionId: transmission.id,
          description: trim.description,
          status: "PUBLISHED",
          publishedAt: pricingDate,
          createdById: importerId,
        },
      });

      const dimensionsPayload = {
        lengthIn: trim.dimensions.lengthIn,
        widthIn: trim.dimensions.widthIn,
        heightIn: trim.dimensions.heightIn,
        wheelbaseIn: trim.dimensions.wheelbaseIn,
        frontTrackIn: trim.dimensions.frontTrackIn,
        rearTrackIn: trim.dimensions.rearTrackIn,
        curbWeightKg: trim.dimensions.curbWeightKg ?? null,
        seatingCapacity: trim.dimensions.seatingCapacity,
      };

      const [dimensions, performance, fuelEconomy, price, destination, image] =
        await Promise.all([
          prisma.vehicleDimensions.upsert({
            where: { vehicleId: vehicle.id },
            create: { vehicleId: vehicle.id, ...dimensionsPayload },
            update: dimensionsPayload,
          }),
          prisma.vehiclePerformance.upsert({
            where: { vehicleId: vehicle.id },
            create: { vehicleId: vehicle.id, ...trim.performance },
            update: trim.performance,
          }),
          prisma.vehicleFuelEconomy.upsert({
            where: { vehicleId: vehicle.id },
            create: {
              vehicleId: vehicle.id,
              cityMpg: trim.fuelEconomy.cityMpg,
              highwayMpg: trim.fuelEconomy.highwayMpg,
              combinedMpg: trim.fuelEconomy.combinedMpg,
              electricRangeMiles: trim.fuelEconomy.electricRangeMiles,
            },
            update: {
              cityMpg: trim.fuelEconomy.cityMpg,
              highwayMpg: trim.fuelEconomy.highwayMpg,
              combinedMpg: trim.fuelEconomy.combinedMpg,
              electricRangeMiles: trim.fuelEconomy.electricRangeMiles,
            },
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
              amountCents: DESTINATION_2026_CENTS,
              currency: "USD",
              effectiveAt: pricingDate,
            },
            update: {
              amountCents: DESTINATION_2026_CENTS,
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

      const dimLocator =
        trim.modelKey === "revuelto"
          ? "Lamborghini MY2026 brochure exterior dimensions / tracks (curb weight unpublished beyond dry weight)"
          : "Lamborghini MY2026 brochure dimensions / tracks; curb weight Car and Driver specs (4,240 lb)";

      await Promise.all([
        upsertCitation(
          prisma,
          specSource.id,
          "VehiclePerformance",
          performance.id,
          "specifications",
          "OEM brochure combined power / 0–100 km/h / top speed; C&D SAE hp & torque",
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleDimensions",
          dimensions.id,
          "specifications",
          dimLocator,
        ),
        upsertCitation(
          prisma,
          fuelSource.id,
          "VehicleFuelEconomy",
          fuelEconomy.id,
          "cityMpg",
          `EPA vehicle id ${trim.epaId} (gas-only)`,
        ),
        upsertCitation(
          prisma,
          fuelSource.id,
          "VehicleFuelEconomy",
          fuelEconomy.id,
          "highwayMpg",
          `EPA vehicle id ${trim.epaId} (gas-only)`,
        ),
        upsertCitation(
          prisma,
          fuelSource.id,
          "VehicleFuelEconomy",
          fuelEconomy.id,
          "combinedMpg",
          `EPA vehicle id ${trim.epaId} (gas-only)`,
        ),
        upsertCitation(
          prisma,
          specSource.id,
          "VehicleFuelEconomy",
          fuelEconomy.id,
          "electricRangeMiles",
          trim.modelKey === "revuelto"
            ? "OEM brochure / C&D: EPA zero-emission range 5 miles (23 MPGe combined)"
            : "OEM brochure / C&D: EPA EV range 4 miles (24 MPGe combined)",
        ),
        upsertCitation(
          prisma,
          priceSource.id,
          "VehiclePrice",
          price.id,
          "amountCents",
          trim.modelKey === "revuelto"
            ? "Base MSRP $608,358 excluding destination (Car and Driver specs)"
            : "Base MSRP $387,649 excluding destination (Car and Driver)",
        ),
        upsertCitation(
          prisma,
          destinationSource.id,
          "VehiclePrice",
          destination.id,
          "amountCents",
          `2026 US destination and handling $${(DESTINATION_2026_CENTS / 100).toFixed(0)} (iSeeCars Monroney-style)`,
        ),
        upsertCitation(
          prisma,
          imageSource.id,
          "VehicleImage",
          image.id,
          "url",
          trim.modelKey === "revuelto"
            ? "auto-data.net exterior asset images/f122/Lamborghini-Revuelto.jpg"
            : "auto-data.net exterior asset images/f127/Lamborghini-Temerario.jpg",
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
