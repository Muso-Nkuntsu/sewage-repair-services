import { z } from "zod";
import { INSPECTION_STATUSES } from "../constants";
import { optionalText } from "./common";

export const inspectionSchema = z.object({
  location: z.string().trim().min(2, "Location is required.").max(191, "Location is too long."),
  inspectionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid inspection date."),
  inspectorName: z
    .string()
    .trim()
    .min(1, "Inspector / team is required.")
    .max(100, "Inspector name is too long."),
  findings: optionalText(z.string().trim().max(2000, "Findings are too long.")),
  status: z.enum(INSPECTION_STATUSES, {
    errorMap: () => ({ message: "Invalid inspection status." }),
  }),
});

export type InspectionInput = z.infer<typeof inspectionSchema>;

/** Stores a yyyy-mm-dd date as 08:00 South African time on that day. */
export function inspectionDateFromInput(value: string): Date {
  return new Date(`${value}T08:00:00+02:00`);
}
