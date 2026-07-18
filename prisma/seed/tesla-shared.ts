/**
 * Shared Tesla seed helpers and reserved exterior image URLs.
 * Prefer Tesla official pages for market/pricing and EPA for range/MPGe.
 */
import type { FuelType, PrismaClient } from "../../src/generated/prisma/client";
import type { SeedCtx } from "./bmw-shared";

export type { SeedCtx };

export const TESLA_DESTINATION_CENTS = 139000;
export const TESLA_ORDER_FEE_CENTS = 25000;

export const RESERVED_TESLA_IMAGE_URLS = new Set<string>([]);

export async function upsertCitation(
  prisma: PrismaClient,
  sourceId: string,
  entityType: string,
  entityId: string,
  fieldName: string,
  locator: string,
) {
  await prisma.sourceCitation.upsert({
    where: {
      sourceId_entityType_entityId_fieldName: {
        sourceId,
        entityType,
        entityId,
        fieldName,
      },
    },
    create: { sourceId, entityType, entityId, fieldName, locator },
    update: { locator },
  });
}

export async function upsertCatalogueSource(
  prisma: PrismaClient,
  data: {
    slug: string;
    title: string;
    publisher: string;
    url: string;
    type: "MANUFACTURER" | "GOVERNMENT" | "PRESS_RELEASE" | "OWNER_MANUAL" | "THIRD_PARTY";
    publishedAt?: Date | null;
  },
) {
  return prisma.source.upsert({
    where: { url: data.url },
    create: {
      slug: data.slug,
      title: data.title,
      publisher: data.publisher,
      url: data.url,
      type: data.type,
      publishedAt: data.publishedAt ?? undefined,
    },
    update: {
      title: data.title,
      publisher: data.publisher,
      type: data.type,
      publishedAt: data.publishedAt ?? undefined,
    },
  });
}

export async function ensureImageSource(
  prisma: PrismaClient,
  opts: {
    slug: string;
    title: string;
    pageUrl: string;
    publisher?: string;
  },
) {
  const publisher = opts.publisher ?? "auto-data.net";
  return prisma.source.upsert({
    where: { url: opts.pageUrl },
    create: {
      slug: opts.slug,
      title: opts.title,
      publisher,
      url: opts.pageUrl,
      type: "THIRD_PARTY",
    },
    update: {
      title: opts.title,
      publisher,
      type: "THIRD_PARTY",
    },
  });
}

export async function assertImageUrlOk(url: string) {
  if (RESERVED_TESLA_IMAGE_URLS.has(url)) {
    throw new Error(`Image URL already reserved: ${url}`);
  }
  const res = await fetch(url, {
    method: "HEAD",
    headers: { "User-Agent": "Mozilla/5.0" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Image HEAD failed for ${url}: ${res.status}`);
  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("image")) {
    throw new Error(`Not an image content-type for ${url}: ${type}`);
  }
  RESERVED_TESLA_IMAGE_URLS.add(url);
  return url;
}

export async function ensureAudit(
  prisma: PrismaClient,
  importerId: string,
  vehicleId: string,
  vehicleSlug: string,
) {
  const existing = await prisma.auditLog.findFirst({
    where: {
      actorId: importerId,
      action: "vehicle.seeded",
      entityType: "Vehicle",
      entityId: vehicleId,
    },
    select: { id: true },
  });
  if (!existing) {
    await prisma.auditLog.create({
      data: {
        actorId: importerId,
        action: "vehicle.seeded",
        entityType: "Vehicle",
        entityId: vehicleId,
        metadata: { source: "prisma/seed", vehicleSlug },
      },
    });
  }
}

export async function ensureTeslaManufacturer(prisma: PrismaClient) {
  return prisma.manufacturer.upsert({
    where: { slug: "tesla" },
    create: {
      name: "Tesla",
      slug: "tesla",
      country: "United States",
      foundedIn: 2003,
    },
    update: {
      name: "Tesla",
      country: "United States",
      foundedIn: 2003,
    },
  });
}

export type TeslaEngineInput = {
  manufacturerId: string;
  slug: string;
  name: string;
  code: string | null;
  fuelType: FuelType;
  configuration: string;
  electrification: string;
};

export async function ensureTeslaEngine(
  prisma: PrismaClient,
  data: TeslaEngineInput,
) {
  if (data.code) {
    const byCode = await prisma.engine.findFirst({
      where: { manufacturerId: data.manufacturerId, code: data.code },
    });
    if (byCode) {
      return prisma.engine.update({
        where: { id: byCode.id },
        data: {
          name: data.name,
          fuelType: data.fuelType,
          displacementCc: null,
          cylinderCount: null,
          configuration: data.configuration,
          induction: null,
          electrification: data.electrification,
        },
      });
    }
  }

  return prisma.engine.upsert({
    where: { slug: data.slug },
    create: {
      manufacturerId: data.manufacturerId,
      slug: data.slug,
      name: data.name,
      code: data.code ?? undefined,
      fuelType: data.fuelType,
      configuration: data.configuration,
      electrification: data.electrification,
    },
    update: {
      manufacturerId: data.manufacturerId,
      name: data.name,
      code: data.code ?? undefined,
      fuelType: data.fuelType,
      displacementCc: null,
      cylinderCount: null,
      configuration: data.configuration,
      induction: null,
      electrification: data.electrification,
    },
  });
}
