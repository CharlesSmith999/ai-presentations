/**
 * Machine-readable error codes, as a union rather than a free-form
 * string, so every throw site and catch site is checked by the
 * compiler — a typo in an error code is a type error, not a runtime
 * surprise.
 */
export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "AI_PROVIDER_ERROR"
  | "AI_INVALID_RESPONSE"
  | "RENDER_ERROR"
  | "STORAGE_ERROR"
  | "DATABASE_ERROR"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

const HTTP_STATUS_BY_CODE: Record<AppErrorCode, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  AI_PROVIDER_ERROR: 502,
  AI_INVALID_RESPONSE: 502,
  RENDER_ERROR: 500,
  STORAGE_ERROR: 500,
  DATABASE_ERROR: 500,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export interface AppErrorOptions {
  /** Extra structured context for logs — never sent to the client verbatim. */
  context?: Record<string, unknown>;
  cause?: unknown;
}

/**
 * Base class for every error thrown intentionally inside this codebase.
 *
 * Clean Architecture wants each layer to fail in terms it understands,
 * without leaking framework/library-specific error types (Prisma
 * errors, fetch errors, SDK errors) into use-cases or components.
 * Infrastructure adapters catch those low-level errors and re-throw one
 * of the subclasses below; everything above the infrastructure layer
 * only ever needs to know about `AppError`.
 *
 * Some subclasses below (AiProviderError, AiInvalidResponseError,
 * RenderError) correspond to layers not implemented until later
 * sprints. They are included now so the error taxonomy is fixed once,
 * up front, rather than grown ad hoc feature by feature.
 */
export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly httpStatus: number;
  public readonly context: Record<string, unknown> | undefined;

  constructor(message: string, code: AppErrorCode, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = this.constructor.name;
    this.code = code;
    this.httpStatus = HTTP_STATUS_BY_CODE[code];
    this.context = options.context;
    Error.captureStackTrace?.(this, this.constructor);
  }

  /** Safe shape to serialize back to an API client — never leaks `context` or `cause`. */
  toPublicJSON(): { error: { code: AppErrorCode; message: string } } {
    return { error: { code: this.code, message: this.message } };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, options?: AppErrorOptions) {
    super(message, "VALIDATION_ERROR", options);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string, options?: AppErrorOptions) {
    super(`${resource} with id "${id}" was not found`, "NOT_FOUND", options);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication is required", options?: AppErrorOptions) {
    super(message, "UNAUTHORIZED", options);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have access to this resource", options?: AppErrorOptions) {
    super(message, "FORBIDDEN", options);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, options?: AppErrorOptions) {
    super(message, "CONFLICT", options);
  }
}

export class AiProviderError extends AppError {
  constructor(message: string, options?: AppErrorOptions) {
    super(message, "AI_PROVIDER_ERROR", options);
  }
}

export class AiInvalidResponseError extends AppError {
  constructor(message: string, options?: AppErrorOptions) {
    super(message, "AI_INVALID_RESPONSE", options);
  }
}

export class RenderError extends AppError {
  constructor(message: string, options?: AppErrorOptions) {
    super(message, "RENDER_ERROR", options);
  }
}

export class StorageError extends AppError {
  constructor(message: string, options?: AppErrorOptions) {
    super(message, "STORAGE_ERROR", options);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, options?: AppErrorOptions) {
    super(message, "DATABASE_ERROR", options);
  }
}

export class RateLimitedError extends AppError {
  constructor(message = "Too many requests", options?: AppErrorOptions) {
    super(message, "RATE_LIMITED", options);
  }
}
