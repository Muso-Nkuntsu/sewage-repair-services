import { z } from "zod";

/**
 * South African phone numbers only (mobile or landline):
 * 0 + 9 digits      e.g. 071 234 5678, 021 555 0101, 0712345678
 * 27 + 9 digits    e.g. +27 71 234 5678, +27712345678
 * Spaces or dashes between digits are allowed. The digit after 0 / +27 must be 1–8.
 * This checks the format only; it does not confirm the number exists.
 */

export const SA_PHONE_REGEX = /^(?:\+27[\s-]?|0)[1-8](?:[\s-]?\d){8}$/;

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
