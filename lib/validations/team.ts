import { z } from "zod";
import { TEAM_STATUSES } from "../constants";
import { optionalText, phoneSchema } from "./common";

export const teamSchema = z.object({
  name: z.string().trim().min(1, "Team name is required.").max(100, "Team name is too long."),
  contactNumber: optionalText(phoneSchema),
  technicianCount: z.coerce
    .number({ invalid_type_error: "Enter the number of technicians." })
    .int("Enter a whole number.")
    .min(1, "A team needs at least 1 technician.")
    .max(50, "That is too many technicians for one team."),
  status: z.enum(TEAM_STATUSES, { errorMap: () => ({ message: "Invalid team status." }) }),
});

export type TeamInput = z.infer<typeof teamSchema>;
