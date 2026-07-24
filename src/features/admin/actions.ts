"use server";

import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/features/auth/authorization";
import { adminResourceSchema, engineSchema, generationSchema, idSchema, imageSchema, manufacturerSchema, modelSchema, modelYearSchema, sourceSchema, transmissionSchema, trimSchema } from "@/features/admin/schemas";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function values(formData: FormData) { return Object.fromEntries(formData); }
async function audit(actorId: string, action: string, entityType: string, entityId: string, metadata?: Prisma.InputJsonValue) { await prisma.auditLog.create({ data: { actorId, action, entityType, entityId, metadata } }); }

export async function saveResourceAction(resourceValue: string, id: string | undefined, _state: { ok: boolean; message: string }, formData: FormData) {
  const admin = await requireAdmin();
  const resource = adminResourceSchema.parse(resourceValue);
  if (id) idSchema.parse(id);
  const raw = values(formData);
  try {
    let entity: { id: string };
    if (resource === "manufacturers") { const data = manufacturerSchema.parse(raw); entity = id ? await prisma.manufacturer.update({ where: { id }, data }) : await prisma.manufacturer.create({ data }); }
    else if (resource === "models") { const data = modelSchema.parse(raw); entity = id ? await prisma.vehicleModel.update({ where: { id }, data }) : await prisma.vehicleModel.create({ data }); }
    else if (resource === "generations") { const data = generationSchema.parse(raw); entity = id ? await prisma.vehicleGeneration.update({ where: { id }, data }) : await prisma.vehicleGeneration.create({ data }); }
    else if (resource === "model-years") { const data = modelYearSchema.parse(raw); entity = id ? await prisma.modelYear.update({ where: { id }, data }) : await prisma.modelYear.create({ data }); }
    else if (resource === "engines") { const data = engineSchema.parse(raw); entity = id ? await prisma.engine.update({ where: { id }, data }) : await prisma.engine.create({ data }); }
    else if (resource === "transmissions") { const data = transmissionSchema.parse(raw); entity = id ? await prisma.transmission.update({ where: { id }, data }) : await prisma.transmission.create({ data }); }
    else if (resource === "sources") { const data = sourceSchema.parse(raw); entity = id ? await prisma.source.update({ where: { id }, data }) : await prisma.source.create({ data }); }
    else { const data = imageSchema.parse(raw); entity = id ? await prisma.vehicleImage.update({ where: { id }, data }) : await prisma.vehicleImage.create({ data }); }
    await audit(admin.id, `${resource}.${id ? "updated" : "created"}`, resource, entity.id);
    revalidatePath("/admin"); revalidatePath(`/admin/${resource}`);
    return { ok: true, message: id ? "Saved changes." : "Created successfully." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { ok: false, message: "That record already exists." };
    return { ok: false, message: error instanceof Error ? error.message : "Unable to save this record." };
  }
}

export async function deleteResourceAction(resourceValue: string, id: string, _state: { ok: boolean; message: string }, formData: FormData) {
  const admin = await requireAdmin(); const resource = adminResourceSchema.parse(resourceValue); idSchema.parse(id);
  if (formData.get("confirm") !== "on") return { ok: false, message: "Confirm deletion before continuing." };
  try {
    if (resource === "manufacturers") await prisma.manufacturer.delete({ where: { id } });
    else if (resource === "models") await prisma.vehicleModel.delete({ where: { id } });
    else if (resource === "generations") await prisma.vehicleGeneration.delete({ where: { id } });
    else if (resource === "model-years") await prisma.modelYear.delete({ where: { id } });
    else if (resource === "engines") await prisma.engine.delete({ where: { id } });
    else if (resource === "transmissions") await prisma.transmission.delete({ where: { id } });
    else if (resource === "sources") await prisma.source.delete({ where: { id } });
    else await prisma.vehicleImage.delete({ where: { id } });
    await audit(admin.id, `${resource}.deleted`, resource, id); revalidatePath("/admin"); revalidatePath(`/admin/${resource}`); return { ok: true, message: "Deleted successfully." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") return { ok: false, message: "This record is still in use and cannot be deleted." };
    return { ok: false, message: "Unable to delete this record." };
  }
}

export async function saveTrimAction(_state: { ok: boolean; message: string }, formData: FormData) {
  const admin = await requireAdmin(); const parsed = trimSchema.safeParse(values(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the highlighted fields." };
  const { id, imageUrl, imageAlt, imageCredit, imageSourceId, sourceId, amountCents, effectiveAt, ...data } = parsed.data;
  try {
    const vehicle = await prisma.$transaction(async (tx) => {
      const vehicleData = { slug: data.slug, name: data.name, modelYearId: data.modelYearId, market: data.market, bodyStyle: data.bodyStyle, drivetrain: data.drivetrain, engineId: data.engineId, transmissionId: data.transmissionId, description: data.description, status: data.status, publishedAt: data.status === "PUBLISHED" ? new Date() : null, dimensions: { upsert: { create: { lengthIn: data.lengthIn, widthIn: data.widthIn, heightIn: data.heightIn, wheelbaseIn: data.wheelbaseIn, frontTrackIn: data.frontTrackIn, rearTrackIn: data.rearTrackIn, groundClearanceIn: data.groundClearanceIn, curbWeightKg: data.curbWeightKg, grossVehicleWeightKg: data.grossVehicleWeightKg, cargoVolumeLiters: data.cargoVolumeLiters, seatingCapacity: data.seatingCapacity }, update: { lengthIn: data.lengthIn, widthIn: data.widthIn, heightIn: data.heightIn, wheelbaseIn: data.wheelbaseIn, frontTrackIn: data.frontTrackIn, rearTrackIn: data.rearTrackIn, groundClearanceIn: data.groundClearanceIn, curbWeightKg: data.curbWeightKg, grossVehicleWeightKg: data.grossVehicleWeightKg, cargoVolumeLiters: data.cargoVolumeLiters, seatingCapacity: data.seatingCapacity } } }, performance: { upsert: { create: { powerHp: data.powerHp, torqueLbFt: data.torqueLbFt, zeroToSixtySeconds: data.zeroToSixtySeconds, quarterMileSeconds: data.quarterMileSeconds, topSpeedMph: data.topSpeedMph }, update: { powerHp: data.powerHp, torqueLbFt: data.torqueLbFt, zeroToSixtySeconds: data.zeroToSixtySeconds, quarterMileSeconds: data.quarterMileSeconds, topSpeedMph: data.topSpeedMph } } }, fuelEconomy: { upsert: { create: { cityMpg: data.cityMpg, highwayMpg: data.highwayMpg, combinedMpg: data.combinedMpg, electricRangeMiles: data.electricRangeMiles }, update: { cityMpg: data.cityMpg, highwayMpg: data.highwayMpg, combinedMpg: data.combinedMpg, electricRangeMiles: data.electricRangeMiles } } } };
      const result = id ? await tx.vehicle.update({ where: { id }, data: vehicleData }) : await tx.vehicle.create({ data: { ...vehicleData, createdById: admin.id } as Prisma.VehicleUncheckedCreateInput });
      if (amountCents !== undefined) await tx.vehiclePrice.upsert({ where: { vehicleId_market_type_effectiveAt: { vehicleId: result.id, market: data.market, type: "BASE_MSRP", effectiveAt: effectiveAt ?? new Date("2025-01-01") } }, create: { vehicleId: result.id, market: data.market, type: "BASE_MSRP", amountCents, currency: data.currency, effectiveAt: effectiveAt ?? new Date("2025-01-01") }, update: { amountCents, currency: data.currency } });
      if (imageUrl && imageAlt) await tx.vehicleImage.upsert({ where: { vehicleId_position: { vehicleId: result.id, position: 0 } }, create: { vehicleId: result.id, url: imageUrl, alt: imageAlt, credit: imageCredit, sourceId: imageSourceId, position: 0 }, update: { url: imageUrl, alt: imageAlt, credit: imageCredit, sourceId: imageSourceId } });
      if (sourceId) await tx.sourceCitation.upsert({ where: { sourceId_entityType_entityId_fieldName: { sourceId, entityType: "Vehicle", entityId: result.id, fieldName: "specifications" } }, create: { sourceId, entityType: "Vehicle", entityId: result.id, fieldName: "specifications", locator: "Admin trim editor" }, update: { locator: "Admin trim editor" } });
      await tx.auditLog.create({ data: { actorId: admin.id, action: `vehicle.${id ? "updated" : "created"}`, entityType: "Vehicle", entityId: result.id, metadata: { slug: result.slug, status: result.status } } }); return result;
    });
    revalidatePath("/admin"); revalidatePath("/admin/trims"); revalidatePath(`/admin/trims/${vehicle.id}`); return { ok: true, message: "Trim saved successfully." };
  } catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { ok: false, message: "A trim with that identity already exists." }; return { ok: false, message: "Unable to save the trim." }; }
}

export async function archiveTrimAction(id: string, _state: { ok: boolean; message: string }, formData: FormData) { const admin = await requireAdmin(); idSchema.parse(id); if (formData.get("confirm") !== "on") return { ok: false, message: "Confirm archiving before continuing." }; await prisma.vehicle.update({ where: { id }, data: { status: "ARCHIVED", publishedAt: null } }); await audit(admin.id, "vehicle.archived", "Vehicle", id); revalidatePath("/admin/trims"); return { ok: true, message: "Trim archived." }; }
