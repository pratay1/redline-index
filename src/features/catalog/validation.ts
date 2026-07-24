import { z } from "zod";

export const publicSlugSchema = z
  .string()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const searchTermSchema = z.string().trim().min(1).max(100);

export function parsePublicSlug(value: string) {
  return publicSlugSchema.safeParse(value);
}

export function parseSearchTerm(value: string | string[] | undefined) {
  if (typeof value !== "string") return undefined;
  const parsed = searchTermSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}
