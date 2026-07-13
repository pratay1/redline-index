import { z } from "zod";
const databaseEnvSchema = z.object({
  DATABASE_URL: z.url("DATABASE_URL must be a valid PostgreSQL URL"),
});
const clerkEnvSchema = z.object({
  CLERK_WEBHOOK_SIGNING_SECRET: z
    .string()
    .min(1, "CLERK_WEBHOOK_SIGNING_SECRET is required"),
});
export function getDatabaseEnv() {
  return databaseEnvSchema.parse({ DATABASE_URL: process.env.DATABASE_URL });
}
export function getClerkEnv() {
  return clerkEnvSchema.parse({
    CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
  });
}
