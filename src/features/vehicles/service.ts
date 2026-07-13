import { Prisma } from "@/generated/prisma/client";
import type { CreateVehicleInput, VehicleListQuery } from "@/features/vehicles/schemas";
import { prisma } from "@/lib/prisma";
const vehicleSummarySelect = {
  id: true,
  slug: true,
  modelName: true,
  trimName: true,
  year: true,
  bodyStyle: true,
  fuelType: true,
  powerHp: true,
  zeroToSixtySeconds: true,
  manufacturer: { select: { name: true, slug: true } },
  images: { take: 1, orderBy: { position: "asc" }, select: { url: true, alt: true } },
} satisfies Prisma.VehicleSelect;
export async function listPublishedVehicles(input: VehicleListQuery) {
  const { cursor, limit, q, ...filters } = input;
  const where: Prisma.VehicleWhereInput = {
    status: "PUBLISHED",
    ...(filters.make ? { manufacturer: { slug: filters.make } } : {}),
    ...(filters.year ? { year: filters.year } : {}),
    ...(filters.bodyStyle ? { bodyStyle: filters.bodyStyle } : {}),
    ...(filters.fuelType ? { fuelType: filters.fuelType } : {}),
    ...(q
      ? {
          OR: [
            { modelName: { contains: q, mode: "insensitive" } },
            { trimName: { contains: q, mode: "insensitive" } },
            { generation: { contains: q, mode: "insensitive" } },
            { manufacturer: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
  const vehicles = await prisma.vehicle.findMany({
    where,
    select: vehicleSummarySelect,
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  const nextCursor = vehicles.length > limit ? vehicles.pop()?.id : undefined;
  return { vehicles, nextCursor };
}
export async function createVehicle(input: CreateVehicleInput, authorId: string) {
  const { makeName, makeSlug, ...vehicleData } = input;
  const vehicle = await prisma.vehicle.create({
    data: {
      ...vehicleData,
      manufacturer: {
        connectOrCreate: {
          where: { slug: makeSlug },
          create: { name: makeName, slug: makeSlug },
        },
      },
      createdBy: { connect: { id: authorId } },
      publishedAt: input.status === "PUBLISHED" ? new Date() : undefined,
    },
    select: { id: true, slug: true, status: true, createdAt: true },
  });
  await prisma.auditLog.create({
    data: {
      actorId: authorId,
      action: "vehicle.created",
      entityType: "Vehicle",
      entityId: vehicle.id,
      metadata: { slug: vehicle.slug, status: vehicle.status },
    },
  });
  return vehicle;
}
