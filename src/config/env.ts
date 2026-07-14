import { z } from "zod";

/**
 * Single source of truth for environment configuration.
 *
 * Every configuration input the app depends on is declared here, once,
 * and validated with Zod at import time. No other file in the codebase
 * reads `process.env` directly — everything imports `env` from here.
 * This gives a hard failure at boot if configuration is missing or
 * malformed, instead of an `undefined` silently reaching business logic
 * (satisfies the "no hardcoded values" rule: nothing is a fallback
 * literal buried in feature code).
 *
 * NOTE (Sprint 0): AI provider keys are declared here because the
 * *configuration* for AI access is foundational, even though no AI
 * generation logic is implemented yet.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  // Auth (Clerk)
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1).optional(),

  // Storage (Supabase)
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default("presentations"),

  // AI providers (configuration only — no calls made in Sprint 0)
  OPENAI_API_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  AI_DEFAULT_PROVIDER: z.enum(["openai", "anthropic"]).default("anthropic"),
  AI_DEFAULT_MODEL: z.string().min(1).default("claude-sonnet-4-6"),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  AI_MAX_RETRIES: z.coerce.number().int().min(0).default(2),

  // App
  APP_URL: z.string().url().default("http://localhost:3000"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${formatted}`);
  }

  return parsed.data;
}

export const env: Env = loadEnv();
