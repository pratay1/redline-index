/**
 * Shared Honda seed helpers and reserved exterior image URLs.
 * Prefer auto-data.net exteriors; Honda Newsroom / cars.com press stills OK.
 * Series modules MUST use unique exterior images (no interiors; no shared shots).
 */
import type { FuelType, PrismaClient } from "../../src/generated/prisma/client";

export type { SeedCtx } from "./bmw-shared";

/** Absolute image URLs already claimed — NEVER reuse across trims/modules. */
export const RESERVED_HONDA_IMAGE_URLS = new Set<string>([]);

/**
 * US Honda destination & handling (cents). Prefer Monroney / Honda.com footnotes
 * when a trim cites a different amount; otherwise use by class.
 * Civic/Prelude ~$1,195 (Motor1 destination survey); many cars historically $1,095.
 * Larger SUV/truck typically higher — cite per-trim when available.
 */
export const HONDA_DESTINATION_CENTS = {
  /** Civic, Accord, Fit, Insight, Prelude, Clarity passenger cars */
  passengerCar: 119_500,
  /** HR-V, CR-V, Crosstour */
  compactSuv: 137_500,
  /** Passport, Pilot, Prologue, Odyssey */
  midSuvVan: 149_500,
  /** Ridgeline */
  pickup: 149_500,
} as const;

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
  const payload = {
    title: data.title,
    publisher: data.publisher,
    type: data.type,
    publishedAt: data.publishedAt ?? undefined,
  };

  // Source is unique on both url and slug. Prefer URL match, then slug —
  // never rewrite the other unique key (modules share destination pages).
  const byUrl = await prisma.source.findUnique({ where: { url: data.url } });
  if (byUrl) {
    return prisma.source.update({
      where: { id: byUrl.id },
      data: payload,
    });
  }

  const bySlug = await prisma.source.findUnique({ where: { slug: data.slug } });
  if (bySlug) {
    return prisma.source.update({
      where: { id: bySlug.id },
      data: payload,
    });
  }

  return prisma.source.create({
    data: {
      slug: data.slug,
      url: data.url,
      ...payload,
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

/** HEAD-check a direct image URL (must be JPEG/PNG/WebP exterior asset). */
export async function assertImageUrlOk(url: string) {
  if (RESERVED_HONDA_IMAGE_URLS.has(url)) {
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
  RESERVED_HONDA_IMAGE_URLS.add(url);
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

export async function ensureHondaManufacturer(prisma: PrismaClient) {
  return prisma.manufacturer.upsert({
    where: { slug: "honda" },
    create: {
      name: "Honda",
      slug: "honda",
      country: "Japan",
      foundedIn: 1948,
    },
    update: {
      name: "Honda",
      country: "Japan",
      foundedIn: 1948,
    },
  });
}

export type HondaEngineInput = {
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
export async function ensureHondaEngine(
  prisma: PrismaClient,
  data: HondaEngineInput,
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
