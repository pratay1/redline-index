import { z } from "zod";

const currentYear = new Date().getFullYear();

export const bodyStyleValues = [
  "CABRIOLET",
  "COUPE",
  "CROSSOVER",
  "HATCHBACK",
  "ROADSTER",
  "SEDAN",
  "SUV",
  "TRUCK",
  "VAN",
  "WAGON",
] as const;

export const fuelTypeValues = [
  "DIESEL",
  "ELECTRIC",
  "FLEX_FUEL",
  "HYBRID",
  "HYDROGEN",
  "PETROL",
  "PLUG_IN_HYBRID",
] as const;

export const drivetrainValues = ["FWD", "RWD", "AWD", "FOUR_WD"] as const;

export const transmissionValues = [
  "AUTOMATIC",
  "CVT",
  "DUAL_CLUTCH",
  "MANUAL",
  "SINGLE_SPEED",
] as const;

const vehicleSlug = z
  .string()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case.");

const specificationNumber = z.number().finite().nonnegative();

export const vehicleListQuerySchema = z.object({
  q: z.string().trim().min(2).max(100).optional(),
  make: vehicleSlug.optional(),
  year: z.coerce
    .number()
    .int()
    .min(1886)
    .max(currentYear + 2)
    .optional(),
  bodyStyle: z.enum(bodyStyleValues).optional(),
  fuelType: z.enum(fuelTypeValues).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().cuid().optional(),
});

export const createVehicleSchema = z.object({
  slug: vehicleSlug,
  makeName: z.string().trim().min(2).max(80),
  makeSlug: vehicleSlug,
  modelName: z.string().trim().min(1).max(100),
  modelSlug: vehicleSlug.optional(),
  trimName: z.string().trim().min(1).max(100),
  generation: z.string().trim().min(1).max(100),
  generationName: z.string().trim().min(1).max(100).optional(),
  year: z
    .number()
    .int()
    .min(1886)
    .max(currentYear + 2),
  market: z.string().trim().min(2).max(16).default("US"),
  bodyStyle: z.enum(bodyStyleValues),
  fuelType: z.enum(fuelTypeValues),
  drivetrain: z.enum(drivetrainValues),
  transmission: z.enum(transmissionValues),
  transmissionName: z.string().trim().min(1).max(120).optional(),
  transmissionGears: z.number().int().positive().max(12).optional(),
  engineName: z.string().trim().min(1).max(120),
  engineCode: z.string().trim().min(1).max(80).optional(),
  engineDisplacementCc: z.number().int().positive().max(20_000).optional(),
  cylinderCount: z.number().int().positive().max(24).optional(),
  engineConfiguration: z.string().trim().min(1).max(80).optional(),
  induction: z.string().trim().min(1).max(80).optional(),
  electrification: z.string().trim().min(1).max(120).optional(),
  powerHp: z.number().int().positive().max(3_000).optional(),
  torqueLbFt: z.number().int().positive().max(5_000).optional(),
  zeroToSixtySeconds: z.number().positive().max(60).optional(),
  quarterMileSeconds: z.number().positive().max(60).optional(),
  topSpeedMph: z.number().int().positive().max(500).optional(),
  curbWeightKg: z.number().int().positive().max(20_000).optional(),
  lengthIn: specificationNumber.max(1_000).optional(),
  widthIn: specificationNumber.max(1_000).optional(),
  heightIn: specificationNumber.max(1_000).optional(),
  wheelbaseIn: specificationNumber.max(1_000).optional(),
  frontTrackIn: specificationNumber.max(1_000).optional(),
  rearTrackIn: specificationNumber.max(1_000).optional(),
  groundClearanceIn: specificationNumber.max(100).optional(),
  grossVehicleWeightKg: z.number().int().positive().max(20_000).optional(),
  cargoVolumeLiters: specificationNumber.max(20_000).optional(),
  seatingCapacity: z.number().int().positive().max(20).optional(),
  cityMpg: specificationNumber.max(500).optional(),
  highwayMpg: specificationNumber.max(500).optional(),
  combinedMpg: specificationNumber.max(500).optional(),
  electricRangeMiles: specificationNumber.max(2_000).optional(),
  msrpCents: z.number().int().nonnegative().max(2_000_000_000).optional(),
  pricingEffectiveAt: z.coerce.date().optional(),
  description: z.string().trim().min(1).max(10_000).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

export type VehicleListQuery = z.infer<typeof vehicleListQuerySchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
