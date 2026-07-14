/**
 * A discriminated union representing either success or failure.
 *
 * Future use-cases return `Result<T, E>` instead of throwing for
 * *expected* failure modes (e.g. "the requested plan tier doesn't allow
 * this"), forcing every caller to explicitly handle the failure branch.
 * Truly exceptional, unrecoverable conditions still throw `AppError`
 * subclasses (see shared/errors) and are caught at the API boundary via
 * `apiError`. Included in Sprint 0 so the type is available the moment
 * the first use-case needs it.
 */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok;
}

export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return !result.ok;
}
