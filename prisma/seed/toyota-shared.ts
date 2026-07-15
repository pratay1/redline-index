/**
 * Shared Toyota seed helpers and reserved exterior image URLs.
 * Prefer encyCARpedia exteriors (`c.encycarpedia.com/ci/{id}.jpg`); fallback auto-data.net.
 * Series modules MUST use unique exterior images (no interiors; no shared shots).
 */
import type { FuelType, PrismaClient } from "../../src/generated/prisma/client";

export type { SeedCtx } from "./bmw-shared";

/** Absolute image URLs already claimed — NEVER reuse across trims/modules. */
export const RESERVED_TOYOTA_IMAGE_URLS = new Set<string>([]);

/**
 * US Toyota Delivery, Processing & Handling (cents) — Aug 2024+ DPH schedule
 * (Toyota full-line pricing / dealer MSRP footnotes).
 */
export const TOYOTA_DPH_CENTS = {
  /** Corolla, Camry, Prius, Mirai, GR86, GR Corolla, GR Supra, etc. */
  passengerCar: 113500,
  /** Corolla Cross */
  entrySuv: 135000,
  /** RAV4, bZ4X */
  smallSuv: 139500,
  /** 4Runner, Highlander, Grand Highlander, Sienna, Land Cruiser, Venza */
  midSuvVan: 145000,
  /** Tacoma */
  smallPickup: 149500,
  /** Tundra, Sequoia — some listings show $2,095; prefer cited sticker when available */
  largePickupSuv: 194500,
} as const;

/** @deprecated Prefer TOYOTA_DPH_CENTS by vehicle class. */
export const TOYOTA_DESTINATION_CENTS = TOYOTA_DPH_CENTS.passengerCar;

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
  const publisher = opts.publisher ?? "encyCARpedia";
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

/** HEAD-check a direct image URL (must be JPEG/PNG exterior asset). */
export async function assertImageUrlOk(url: string) {
  if (RESERVED_TOYOTA_IMAGE_URLS.has(url)) {
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
  RESERVED_TOYOTA_IMAGE_URLS.add(url);
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

export async function ensureToyotaManufacturer(prisma: PrismaClient) {
  return prisma.manufacturer.upsert({
    where: { slug: "toyota" },
    create: {
      name: "Toyota",
      slug: "toyota",
      country: "Japan",
      foundedIn: 1937,
    },
    update: {
      name: "Toyota",
      country: "Japan",
      foundedIn: 1937,
    },
  });
}

export type ToyotaEngineInput = {
  manufacturerId: string;
  slug: string;
  name: string;
  code: string | null;
  fuelType: FuelType;
  displacementCc?: number | null;
  cylinderCount?: number | null;
  configuration?: string | null;
  induction?: string | null;
  electrification?: string | null;
};

/**
 * Engine is unique on (manufacturerId, code). Reuse the existing row when the
 * same factory code appears under a different slug in another series module.
 */
export async function ensureToyotaEngine(
  prisma: PrismaClient,
  data: ToyotaEngineInput,
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
          displacementCc: data.displacementCc ?? null,
          cylinderCount: data.cylinderCount ?? null,
          configuration: data.configuration ?? null,
          induction: data.induction ?? null,
          electrification: data.electrification ?? null,
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
      displacementCc: data.displacementCc ?? undefined,
      cylinderCount: data.cylinderCount ?? undefined,
      configuration: data.configuration ?? undefined,
      induction: data.induction ?? undefined,
      electrification: data.electrification ?? undefined,
    },
    update: {
      manufacturerId: data.manufacturerId,
      name: data.name,
      code: data.code ?? undefined,
      fuelType: data.fuelType,
      displacementCc: data.displacementCc ?? undefined,
      cylinderCount: data.cylinderCount ?? undefined,
      configuration: data.configuration ?? undefined,
      induction: data.induction ?? undefined,
      electrification: data.electrification ?? undefined,
    },
  });
}
