/**
 * Shared BMW seed helpers and reserved PressClub image IDs.
 * Series modules must import from here and MUST NOT reuse reserved image IDs.
 */
import type { PrismaClient } from "../../src/generated/prisma/client";

export type SeedCtx = {
  prisma: PrismaClient;
  importerId: string;
  manufacturerId: string;
  pricingDate: Date;
};

/** Already used across the catalogue — NEVER reuse these dokNo IDs. */
export const RESERVED_BMW_IMAGE_IDS = new Set([
  // Original catalogue / 2 Series / early seed
  "P90549616",
  "P90549617",
  "P90549625",
  "P90549626",
  "P90554821",
  "P90554870",
  "P90554902",
  "P90554903",
  "P90554915",
  "P90554916",
  "P90572308",
  "P90615578",
  "P90546610",
  "P90589117",
  "P90589217",
  "P90553471",
  "P90390664",
  // 3 Series M3 module
  "P90550995",
  "P90550998",
  "P90551001",
  // 5 Series module
  "P90505146",
  "P90505140",
  "P90505141",
  "P90505142",
  "P90557399",
  "P90564722",
  // i Series module
  "P90546599",
  "P90546632",
  "P90504990",
  "P90504991",
  "P90505035",
  "P90458174",
  "P90458915",
  "P90615623",
  "P90585145",
  "P90585172",
  "P90585348",
  // Z Series module
  "P90481358",
  "P90536236",
  // 7 Series module
  "P90458916",
  "P90458917",
  // 4 Series module
  "P90536510",
  "P90536511",
  "P90536512",
  "P90536513",
  "P90536514",
  "P90536516",
  "P90536517",
  "P90546574",
  "P90546575",
  "P90546579",
  "P90546580",
  "P90536834",
  "P90536853",
  "P90536831",
  "P90536787",
  // X Series module
  "P90465574",
  "P90509735",
  "P90525114",
  "P90526444",
  "P90557147",
  "P90489760",
  "P90557150",
  "P90495503",
  "P90492412",
  "P90492280",
  "P90495603",
  "P90457500",
  "P90457423",
  "P90476753",
  "P90499800",
]);

export const DESTINATION_CENTS = 117500;

export function mediapoolUrl(dokNo: string) {
  return `https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=${dokNo}`;
}

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

export async function ensureImageSource(prisma: PrismaClient, dokNo: string) {
  // RESERVED_BMW_IMAGE_IDS is for parallel authoring collision avoidance.
  // At seed runtime the owning module legitimately uses its own dokNos.
  const pageUrl = `https://www.press.bmwgroup.com/usa/photo/detail/${dokNo}`;
  return prisma.source.upsert({
    where: { url: pageUrl },
    create: {
      slug: `bmw-pressclub-image-${dokNo.toLowerCase()}`,
      title: `BMW PressClub vehicle image ${dokNo}`,
      publisher: "BMW Group",
      url: pageUrl,
      type: "MANUFACTURER",
    },
    update: {
      title: `BMW PressClub vehicle image ${dokNo}`,
      publisher: "BMW Group",
      type: "MANUFACTURER",
    },
  });
}

export async function assertImageOk(dokNo: string) {
  const url = mediapoolUrl(dokNo);
  const res = await fetch(url, {
    method: "HEAD",
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`Image HEAD failed for ${dokNo}: ${res.status}`);
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
