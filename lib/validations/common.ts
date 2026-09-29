import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[+()\d\s-]{7,20}$/, "Enter a valid phone number, e.g. 071 234 5678.");

/**
 * Optional text field: "", missing or whitespace-only become undefined,
 * anything else must pass `schema`.
 */
export function optionalText(schema: z.ZodString) {
  return z
    .union([z.literal(""), schema])
    .optional()
    .transform((value): string | undefined => (value && value.trim() !== "" ? value : undefined));
}
