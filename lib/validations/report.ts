import { z } from "zod";
import { ISSUE_TYPES, REPORT_STATUSES } from "../constants";
import { optionalText, phoneSchema } from "./common";

export const createReportSchema = z.object({
  issueType: z.enum(ISSUE_TYPES, {
    errorMap: () => ({ message: "Please choose the type of problem." }),
  }),
  location: z
    .string()
    .trim()
    .min(2, "Please enter the area or extension, e.g. Ext. 12.")
    .max(191, "Location is too long."),
  landmark: optionalText(z.string().trim().max(191, "Street / landmark is too long.")),
  description: z
    .string()
    .trim()
    .min(10, "Please describe the problem in at least 10 characters.")
    .max(2000, "Description is too long (maximum 2000 characters)."),
  contactPhone: optionalText(phoneSchema),
});

const statusSchema = z.enum(REPORT_STATUSES, {
  errorMap: () => ({ message: "Invalid report status." }),
});

/** Admin edits via PUT /api/reports/[id]. Residents may only send { status: "CANCELLED" }. */
export const updateReportSchema = z
  .object({
    status: statusSchema.optional(),
    eta: z.union([z.string().trim().max(100, "ETA is too long."), z.null()]).optional(),
    assignedTeamId: z.union([z.number().int().positive("Invalid team."), z.null()]).optional(),
  })
  .refine(
    (data) => data.status !== undefined || data.eta !== undefined || data.assignedTeamId !== undefined,
    { message: "Nothing to update.", path: ["form"] }
  );

export const assignTeamSchema = z.object({
  teamId: z.number({ invalid_type_error: "Please choose a team." }).int().positive("Please choose a team."),
  eta: optionalText(z.string().trim().max(100, "ETA is too long.")),
});

export const repairUpdateSchema = z.object({
  comment: z
    .string()
    .trim()
    .min(3, "Please write an update (at least 3 characters).")
    .max(2000, "Update is too long."),
  status: statusSchema.optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
export type AssignTeamInput = z.infer<typeof assignTeamSchema>;
export type RepairUpdateInput = z.infer<typeof repairUpdateSchema>;
