import { env } from "@/config/env";

/**
 * Application-level configuration derived from `env`.
 *
 * Deliberately separate from `env.ts`:
 *   - `env.ts` validates raw *inputs* from the process environment.
 *   - `app-config.ts` expresses *decisions* built from those inputs
 *     (timeouts, defaults, limits) as named, documented constants, so
 *     no "magic number" appears inline in feature code later.
 *
 * Sprint 0 note: sections below correspond to systems that exist only
 * as configuration/structure right now (ai, storage) — the values are
 * ready for the layers that will consume them in later sprints.
 */
export const appConfig = {
  app: {
    url: env.APP_URL,
    name: "AI Presentation Consultant",
    environment: env.NODE_ENV,
  },
  ai: {
    defaultProvider: env.AI_DEFAULT_PROVIDER,
    defaultModel: env.AI_DEFAULT_MODEL,
    requestTimeoutMs: env.AI_REQUEST_TIMEOUT_MS,
    maxRetries: env.AI_MAX_RETRIES,
    /** Every AI call in this product must return structured JSON, never free text — enforced when the AI layer is implemented. */
    responseFormat: "json" as const,
  },
  storage: {
    bucket: env.SUPABASE_STORAGE_BUCKET,
    maxUploadBytes: 25 * 1024 * 1024, // 25MB ceiling, enforced when uploads are implemented
    signedUrlTtlSeconds: 60 * 60,
  },
  consultation: {
    /** Max number of consulting Q&A turns before we force a synthesis step (reserved for future multi-turn dialogue). */
    maxDialogueTurns: 12,
    /** Max slides the presentation engine will plan for in a single deck. */
    maxSlidesPerDeck: 60,
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
} as const;

export type AppConfig = typeof appConfig;
