// Small helpers shared by all API route handlers.
import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { Prisma } from "@prisma/client";
import { getCurrentUser, type CurrentUser } from "./auth";
import { ReportChangeError } from "./reports";
import { zodFieldErrorsClient as zodFieldErrors } from "./validations/client";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function jsonError(status: number, message: string, fieldErrors?: Record<string, string>) {
  return NextResponse.json({ error: message, ...(fieldErrors ? { fieldErrors } : {}) }, { status });
}

/** Parses the JSON body and validates it. Throws ZodError / ApiError on bad input. */
export async function parseBody<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.");
  }
  return schema.parse(body);
}

export function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "Invalid id.");
  }
  return id;
}

export async function requireApiUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Please log in to continue.");
  return user;
}

export async function requireApiAdmin(): Promise<CurrentUser> {
  const user = await requireApiUser();
  if (user.role !== "ADMIN") throw new ApiError(403, "You do not have permission to do that.");
  return user;
}

/**
 * Wraps a route handler so every error becomes a friendly JSON response.
 * Raw database errors are logged on the server but never sent to the browser.
 */
export function handleApiError(error: unknown) {
  if (error instanceof ApiError || error instanceof ReportChangeError) {
    return jsonError(error.status, error.message);
  }
  if (error instanceof ZodError) {
    const fieldErrors = zodFieldErrors(error);
    const first = Object.values(fieldErrors)[0] ?? "Please check the form and try again.";
    return jsonError(400, first, fieldErrors);
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return jsonError(409, "A record with those details already exists.");
    }
    if (error.code === "P2025") {
      return jsonError(404, "The record could not be found.");
    }
    if (error.code === "P2003") {
      return jsonError(400, "A linked record does not exist.");
    }
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error("[database connection error]", error);
    return jsonError(503, "The database is not reachable right now. Please try again shortly.");
  }
  if (error instanceof Error && error.message.startsWith("NEXTAUTH_SECRET")) {
    console.error("[config error]", error.message);
    return jsonError(500, "Server is not configured: NEXTAUTH_SECRET is missing. See README.");
  }
  console.error("[api error]", error);
  return jsonError(500, "Something went wrong on our side. Please try again.");
}
