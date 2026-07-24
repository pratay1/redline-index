import { Prisma } from "@/generated/prisma/client";
import type { CreateVehicleInput, VehicleListQuery } from "@/features/vehicles/schemas";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const vehicleSummarySelect = {
  id: true,
  slug: true,
  name: true,
  market: true,
  bodyStyle: true,
  drivetrain: true,
  modelYear: {
    select: {
      year: true,
      generation: {
        select: {
          code: true,
          model: {
            select: {
              name: true,
              manufacturer: { select: { name: true, slug: true } },
            },
          },
        },
      },
    },
  },
  engine: { select: { fuelType: true } },
  performance: { select: { powerHp: true, zeroToSixtySeconds: true } },
  images: { take: 1, orderBy: { position: "asc" }, select: { url: true, alt: true } },
} satisfies Prisma.VehicleSelect;

function toSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function listPublishedVehicles(input: VehicleListQuery) {
  const { cursor, limit, q, ...filters } = input;
  const conditions: Prisma.VehicleWhereInput[] = [{ status: "PUBLISHED" }];

  if (filters.make || filters.year)
    conditions.push({
      modelYear: {
        ...(filters.year ? { year: filters.year } : {}),
        ...(filters.make
          ? { generation: { model: { manufacturer: { slug: filters.make } } } }
          : {}),
      },
    });

  if (filters.bodyStyle) conditions.push({ bodyStyle: filters.bodyStyle });
  if (filters.fuelType) conditions.push({ engine: { fuelType: filters.fuelType } });
  if (q)
    conditions.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { modelYear: { generation: { code: { contains: q, mode: "insensitive" } } } },
        {
          modelYear: {
            generation: { model: { name: { contains: q, mode: "insensitive" } } },
          },
        },
        {
          modelYear: {
            generation: {
              model: { manufacturer: { name: { contains: q, mode: "insensitive" } } },
            },
          },
        },
      ],
    });

  const vehicles = await prisma.vehicle.findMany({
    where: { AND: conditions },
    select: vehicleSummarySelect,
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const nextCursor = vehicles.length > limit ? vehicles.pop()?.id : undefined;

  return {
    vehicles: vehicles.map((vehicle) => ({
      id: vehicle.id,
      slug: vehicle.slug,
      modelName: vehicle.modelYear.generation.model.name,
      trimName: vehicle.name,
      generation: vehicle.modelYear.generation.code,
      year: vehicle.modelYear.year,
      market: vehicle.market,
      bodyStyle: vehicle.bodyStyle,
      drivetrain: vehicle.drivetrain,
      fuelType: vehicle.engine.fuelType,
      powerHp: vehicle.performance?.powerHp ?? null,
      zeroToSixtySeconds: vehicle.performance?.zeroToSixtySeconds ?? null,
      manufacturer: vehicle.modelYear.generation.model.manufacturer,
      images: vehicle.images,
    })),
    nextCursor,
  };
}

export async function createVehicle(input: CreateVehicleInput, authorId: string) {
  const modelSlug = input.modelSlug ?? `${input.makeSlug}-${toSlug(input.modelName)}`;
  const engineSlug = `${input.makeSlug}-${toSlug(input.engineCode ?? input.engineName)}`;
  const transmissionName =
    input.transmissionName ?? input.transmission.replaceAll("_", " ");
  const transmissionSlug = `${input.transmission.toLowerCase()}-${input.transmissionGears ?? "standard"}`;
  const dimensions = {
    lengthIn: input.lengthIn,
    widthIn: input.widthIn,
    heightIn: input.heightIn,
    wheelbaseIn: input.wheelbaseIn,
    frontTrackIn: input.frontTrackIn,
    rearTrackIn: input.rearTrackIn,
    groundClearanceIn: input.groundClearanceIn,
    curbWeightKg: input.curbWeightKg,
    grossVehicleWeightKg: input.grossVehicleWeightKg,
    cargoVolumeLiters: input.cargoVolumeLiters,
    seatingCapacity: input.seatingCapacity,
  };
  const performance = {
    powerHp: input.powerHp,
    torqueLbFt: input.torqueLbFt,
    zeroToSixtySeconds: input.zeroToSixtySeconds,
    quarterMileSeconds: input.quarterMileSeconds,
    topSpeedMph: input.topSpeedMph,
  };
  const fuelEconomy = {
    cityMpg: input.cityMpg,
    highwayMpg: input.highwayMpg,
    combinedMpg: input.combinedMpg,
    electricRangeMiles: input.electricRangeMiles,
  };

  try {
    return await prisma.$transaction(async (tx) => {
      const manufacturer = await tx.manufacturer.upsert({
        where: { slug: input.makeSlug },
        create: { name: input.makeName, slug: input.makeSlug },
        update: { name: input.makeName },
      });
      const model = await tx.vehicleModel.upsert({
        where: { slug: modelSlug },
        create: {
          name: input.modelName,
          slug: modelSlug,
          manufacturerId: manufacturer.id,
        },
        update: { name: input.modelName, manufacturerId: manufacturer.id },
      });
      const generation = await tx.vehicleGeneration.upsert({
        where: { modelId_code: { modelId: model.id, code: input.generation } },
        create: {
          modelId: model.id,
          code: input.generation,
          displayName: input.generationName,
        },
        update: { displayName: input.generationName },
      });
      const modelYear = await tx.modelYear.upsert({
        where: { generationId_year: { generationId: generation.id, year: input.year } },
        create: { generationId: generation.id, year: input.year },
        update: {},
      });
      const engine = await tx.engine.upsert({
        where: { slug: engineSlug },
        create: {
          slug: engineSlug,
          name: input.engineName,
          code: input.engineCode,
          fuelType: input.fuelType,
          displacementCc: input.engineDisplacementCc,
          cylinderCount: input.cylinderCount,
          configuration: input.engineConfiguration,
          induction: input.induction,
          electrification: input.electrification,
          manufacturerId: manufacturer.id,
        },
        update: {
          name: input.engineName,
          code: input.engineCode,
          fuelType: input.fuelType,
          displacementCc: input.engineDisplacementCc,
          cylinderCount: input.cylinderCount,
          configuration: input.engineConfiguration,
          induction: input.induction,
          electrification: input.electrification,
          manufacturerId: manufacturer.id,
        },
      });
      const transmission = await tx.transmission.upsert({
        where: { slug: transmissionSlug },
        create: {
          slug: transmissionSlug,
          name: transmissionName,
          type: input.transmission,
          gearCount: input.transmissionGears,
        },
        update: {
          name: transmissionName,
          type: input.transmission,
          gearCount: input.transmissionGears,
        },
      });
      const vehicle = await tx.vehicle.create({
        data: {
          slug: input.slug,
          name: input.trimName,
          market: input.market,
          bodyStyle: input.bodyStyle,
          drivetrain: input.drivetrain,
          description: input.description,
          status: input.status,
          publishedAt: input.status === "PUBLISHED" ? new Date() : undefined,
          modelYearId: modelYear.id,
          engineId: engine.id,
          transmissionId: transmission.id,
          createdById: authorId,
          ...(Object.values(dimensions).some((value) => value !== undefined)
            ? { dimensions: { create: dimensions } }
            : {}),
          ...(Object.values(performance).some((value) => value !== undefined)
            ? { performance: { create: performance } }
            : {}),
          ...(Object.values(fuelEconomy).some((value) => value !== undefined)
            ? { fuelEconomy: { create: fuelEconomy } }
            : {}),
          ...(input.msrpCents !== undefined
            ? {
                prices: {
                  create: {
                    amountCents: input.msrpCents,
                    market: input.market,
                    type: "BASE_MSRP",
                    effectiveAt: input.pricingEffectiveAt ?? new Date(),
                  },
                },
              }
            : {}),
        },
        select: { id: true, slug: true, status: true, createdAt: true },
      });
      await tx.auditLog.create({
        data: {
          actorId: authorId,
          action: "vehicle.created",
          entityType: "Vehicle",
          entityId: vehicle.id,
          metadata: { slug: vehicle.slug, status: vehicle.status },
        },
      });
      return vehicle;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
      throw new AppError("A vehicle with this identity already exists.", 409);
    throw error;
  }
}
