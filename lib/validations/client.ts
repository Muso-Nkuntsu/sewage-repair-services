import type { ZodError } from "zod";

/** Client-side version of the API's field-error mapping: { field: "first message" }. */
export function zodFieldErrorsClient(error: ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
