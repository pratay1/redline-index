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
  trimName: z.string().trim().min(1).max(100).optional(),
  generation: z.string().trim().min(1).max(100).optional(),
  year: z
    .number()
    .int()
    .min(1886)
    .max(currentYear + 2),
  bodyStyle: z.enum(bodyStyleValues).optional(),
  fuelType: z.enum(fuelTypeValues).optional(),
  drivetrain: z.enum(drivetrainValues).optional(),
  transmission: z.enum(transmissionValues).optional(),
  engineName: z.string().trim().min(1).max(120).optional(),
  engineDisplacementCc: z.number().int().positive().max(20_000).optional(),
  cylinderCount: z.number().int().positive().max(24).optional(),
  induction: z.string().trim().min(1).max(80).optional(),
  powerHp: z.number().int().positive().max(3_000).optional(),
  torqueLbFt: z.number().int().positive().max(5_000).optional(),
  zeroToSixtySeconds: z.number().positive().max(60).optional(),
  topSpeedMph: z.number().int().positive().max(500).optional(),
  curbWeightKg: z.number().int().positive().max(20_000).optional(),
  msrpCents: z.number().int().nonnegative().max(2_000_000_000).optional(),
  description: z.string().trim().min(1).max(10_000).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});
export type VehicleListQuery = z.infer<typeof vehicleListQuerySchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
