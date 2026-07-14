import pino from "pino";
import { env } from "@/config/env";

/**
 * Single structured logger instance for the whole app. Structured
 * (JSON) logs are queryable in production log aggregators; `pino-pretty`
 * is used only in development for readability. Feature code should
 * never call `console.log` — it should import `logger` or a scoped
 * child logger via `createLogger` so every log line carries consistent
 * metadata (level, timestamp, environment, module name).
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  base: { env: env.NODE_ENV },
  transport:
    env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } }
      : undefined,
});

/**
 * Creates a child logger scoped to a module/feature, e.g.:
 *   const log = createLogger("lib:database-service");
 * All entries from `log` include `{ module: "lib:database-service" }`,
 * making it trivial to filter logs by subsystem.
 */
export function createLogger(module: string): pino.Logger {
  return logger.child({ module });
}
