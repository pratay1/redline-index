import { z } from "zod";
import {
  bodyStyleValues,
  drivetrainValues,
  fuelTypeValues,
  transmissionValues,
} from "@/features/vehicles/schemas";

export const adminResourceSchema = z.enum([
  "manufacturers",
  "models",
  "generations",
  "model-years",
  "engines",
  "transmissions",
  "images",
  "sources",
]);

export const idSchema = z.string().cuid();
export const slugSchema = z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case.");
const optionalText = z.preprocess((value) => (value === "" ? undefined : value), z.string().trim().max(500).optional());
const optionalNumber = z.preprocess((value) => (value === "" ? undefined : Number(value)), z.number().finite().optional());

export const manufacturerSchema = z.object({ name: z.string().trim().min(2).max(80), slug: slugSchema, country: optionalText, foundedIn: optionalNumber.pipe(z.number().int().min(1769).max(new Date().getFullYear()).optional()) });
export const modelSchema = z.object({ manufacturerId: idSchema, name: z.string().trim().min(1).max(100), slug: slugSchema });
export const generationSchema = z.object({ modelId: idSchema, code: z.string().trim().min(1).max(100), displayName: optionalText, startYear: optionalNumber.pipe(z.number().int().min(1886).max(2100).optional()), endYear: optionalNumber.pipe(z.number().int().min(1886).max(2100).optional()) }).refine((data) => !data.startYear || !data.endYear || data.endYear >= data.startYear, { message: "End year must not be earlier than start year." });
export const modelYearSchema = z.object({ generationId: idSchema, year: z.coerce.number().int().min(1886).max(new Date().getFullYear() + 2) });
export const engineSchema = z.object({ manufacturerId: z.preprocess((value) => value === "" ? undefined : value, idSchema.optional()), slug: slugSchema, name: z.string().trim().min(1).max(120), code: optionalText, fuelType: z.enum(fuelTypeValues), displacementCc: optionalNumber.pipe(z.number().int().positive().max(20_000).optional()), cylinderCount: optionalNumber.pipe(z.number().int().positive().max(24).optional()), configuration: optionalText, induction: optionalText, electrification: optionalText });
export const transmissionSchema = z.object({ slug: slugSchema, name: z.string().trim().min(1).max(120), type: z.enum(transmissionValues), gearCount: optionalNumber.pipe(z.number().int().positive().max(12).optional()) });
export const sourceSchema = z.object({ slug: slugSchema, title: z.string().trim().min(1).max(300), publisher: z.string().trim().min(1).max(160), url: z.url(), type: z.enum(["MANUFACTURER", "GOVERNMENT", "PRESS_RELEASE", "OWNER_MANUAL", "THIRD_PARTY"]), publishedAt: z.preprocess((value) => value === "" ? undefined : new Date(String(value)), z.date().optional()) });
export const imageSchema = z.object({ vehicleId: idSchema, sourceId: z.preprocess((value) => value === "" ? undefined : value, idSchema.optional()), url: z.url(), alt: z.string().trim().min(3).max(300), credit: optionalText, position: z.coerce.number().int().min(0).max(50) });

export const trimSchema = z.object({
  id: z.preprocess((value) => value || undefined, idSchema.optional()), slug: slugSchema, name: z.string().trim().min(1).max(100), modelYearId: idSchema, market: z.string().trim().min(2).max(16), bodyStyle: z.enum(bodyStyleValues), drivetrain: z.enum(drivetrainValues), engineId: idSchema, transmissionId: idSchema, description: optionalText, status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  powerHp: optionalNumber, torqueLbFt: optionalNumber, zeroToSixtySeconds: optionalNumber, quarterMileSeconds: optionalNumber, topSpeedMph: optionalNumber,
  lengthIn: optionalNumber, widthIn: optionalNumber, heightIn: optionalNumber, wheelbaseIn: optionalNumber, frontTrackIn: optionalNumber, rearTrackIn: optionalNumber, groundClearanceIn: optionalNumber, curbWeightKg: optionalNumber, grossVehicleWeightKg: optionalNumber, cargoVolumeLiters: optionalNumber, seatingCapacity: optionalNumber,
  cityMpg: optionalNumber, highwayMpg: optionalNumber, combinedMpg: optionalNumber, electricRangeMiles: optionalNumber,
  amountCents: optionalNumber.pipe(z.number().int().nonnegative().optional()), currency: z.string().trim().length(3).default("USD"), effectiveAt: z.preprocess((value) => value === "" ? undefined : new Date(String(value)), z.date().optional()),
  imageUrl: z.preprocess((value) => value === "" ? undefined : value, z.url().optional()), imageAlt: optionalText, imageCredit: optionalText, imageSourceId: z.preprocess((value) => value === "" ? undefined : value, idSchema.optional()), sourceId: z.preprocess((value) => value === "" ? undefined : value, idSchema.optional()),
});

export type AdminResource = z.infer<typeof adminResourceSchema>;
