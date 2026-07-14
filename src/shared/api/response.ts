import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, ValidationError } from "@/shared/errors/app-error";
import { createLogger } from "@/shared/logging/logger";

const log = createLogger("shared:api-response");

/**
 * Consistent success envelope. Every Route Handler that returns data
 * uses `apiSuccess` instead of calling `NextResponse.json` directly, so
 * the response shape (`{ data: ... }`) is uniform across the whole API
 * surface and clients can rely on it without checking per-endpoint.
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse<{ data: T }> {
  return NextResponse.json({ data }, { status });
}

/**
 * The single funnel every Route Handler passes caught errors through.
 * Converts:
 *   - `ZodError` (raw input validation failure) -> `ValidationError` -> 400
 *   - any `AppError` subclass -> its own fixed HTTP status + code
 *   - anything else (unexpected) -> a generic 500, with the real error
 *     logged but never leaked to the client
 *
 * This is what keeps Route Handlers thin: `try { ... } catch (error) {
 * return apiError(error); }` and nothing else needs to know how to
 * format an error response.
 */
export function apiError(error: unknown): NextResponse<{ error: { code: string; message: string } }> {
  if (error instanceof ZodError) {
    const validationError = new ValidationError("Request validation failed", {
      context: { issues: error.issues },
    });
    log.warn({ err: validationError, issues: error.issues }, "Request validation failed");
    return NextResponse.json(validationError.toPublicJSON(), { status: validationError.httpStatus });
  }

  if (error instanceof AppError) {
    const level = error.httpStatus >= 500 ? "error" : "warn";
    log[level]({ err: error, code: error.code, context: error.context }, error.message);
    return NextResponse.json(error.toPublicJSON(), { status: error.httpStatus });
  }

  log.error({ err: error }, "Unhandled error in route handler");
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
    { status: 500 },
  );
}
