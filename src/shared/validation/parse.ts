import type { ZodTypeAny, z } from "zod";
import { ValidationError } from "@/shared/errors/app-error";

/**
 * Parses `input` against `schema`, throwing a domain-level
 * `ValidationError` (not a raw `ZodError`) on failure.
 *
 * Generic is constrained to `ZodTypeAny` and the return type is derived
 * via `z.infer<S>` rather than a separate `T` type parameter — binding
 * `T` directly (e.g. `ZodSchema<T>`) causes TypeScript to sometimes
 * infer the pre-`.default()` input type instead of the resolved output
 * type, which is the wrong shape for callers.
 */
export function parseOrThrow<S extends ZodTypeAny>(schema: S, input: unknown, context?: string): z.infer<S> {
  const result = schema.safeParse(input);

  if (!result.success) {
    const detail = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new ValidationError(context ? `${context}: ${detail}` : detail, {
      context: { issues: result.error.issues },
    });
  }

  return result.data;
}
