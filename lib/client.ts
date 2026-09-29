// Client-side helper for calling our own API routes.

export class ApiRequestError extends Error {
  status: number;
  fieldErrors: Record<string, string>;
  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type ErrorBody = { error?: string; fieldErrors?: Record<string, string> };

export async function apiRequest<T>(
  url: string,
  options: { method?: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown } = {}
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers: options.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      credentials: "same-origin",
    });
  } catch {
    throw new ApiRequestError(0, "Could not reach the server. Check your connection and try again.");
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const body = (data ?? {}) as ErrorBody;
    const message =
      body.error ??
      (response.status === 401
        ? "Your session has expired. Please log in again."
        : "Something went wrong. Please try again.");
    throw new ApiRequestError(response.status, message, body.fieldErrors ?? {});
  }

  return data as T;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
