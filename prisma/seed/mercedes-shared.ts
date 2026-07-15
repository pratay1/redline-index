/**
 * Shared Mercedes-Benz seed helpers and reserved exterior image URLs.
 * Series modules MUST use unique exterior images (no interiors; no shared road/color shots).
 */
import type { FuelType, PrismaClient } from "../../src/generated/prisma/client";

export type { SeedCtx } from "./bmw-shared";

/** Absolute image URLs already claimed — NEVER reuse across trims/modules. */
export const RESERVED_MERCEDES_IMAGE_URLS = new Set<string>([
  // Populated by series modules as they land; keep unique at merge time.
]);

/** US Mercedes-Benz destination & handling (cents). Cite when seeding prices. */
export const MERCEDES_DESTINATION_CENTS = 115000;

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
  opts: { slug: string; title: string; pageUrl: string },
) {
  return prisma.source.upsert({
    where: { url: opts.pageUrl },
    create: {
      slug: opts.slug,
      title: opts.title,
      publisher: "Mercedes-Benz",
      url: opts.pageUrl,
      type: "MANUFACTURER",
    },
    update: {
      title: opts.title,
      publisher: "Mercedes-Benz",
      type: "MANUFACTURER",
    },
  });
}

/** HEAD-check a direct image URL (must be JPEG/PNG exterior asset). */
export async function assertImageUrlOk(url: string) {
  if (RESERVED_MERCEDES_IMAGE_URLS.has(url)) {
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

/** Upsert Mercedes-Benz manufacturer under hierarchy root. */
export async function ensureMercedesManufacturer(
  prisma: PrismaClient,
) {
  return prisma.manufacturer.upsert({
    where: { slug: "mercedes-benz" },
    create: {
      name: "Mercedes-Benz",
      slug: "mercedes-benz",
      country: "Germany",
      foundedIn: 1926,
    },
    update: {
      name: "Mercedes-Benz",
      country: "Germany",
      foundedIn: 1926,
    },
  });
}

export type MercedesEngineInput = {
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
export async function ensureMercedesEngine(
  prisma: PrismaClient,
  data: MercedesEngineInput,
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
