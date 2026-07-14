import type { ZodSchema } from "zod";
import { ValidationError } from "@/shared/errors/app-error";

/**
 * Parses `input` against `schema`, throwing a domain-level
 * `ValidationError` (not a raw `ZodError`) on failure. Used at every
 * boundary where untrusted data enters the system: API route bodies,
 * query params, and — once implemented — AI provider responses, which
 * must be validated exactly like user input since they are external,
 * untrusted data.
 */
export function parseOrThrow<T>(schema: ZodSchema<T>, input: unknown, context?: string): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    const detail = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new ValidationError(context ? `${context}: ${detail}` : detail, {
      context: { issues: result.error.issues },
    });
  }

  return result.data;
}
