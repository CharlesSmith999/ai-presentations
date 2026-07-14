import { prisma } from "@/lib/db/prisma";
import { DatabaseError } from "@/shared/errors/app-error";
import { createLogger } from "@/shared/logging/logger";

const log = createLogger("lib:database-service");

/**
 * The database service layer is the seam between "raw Prisma client"
 * and "feature repositories."
 *
 * Sprint 0 scope: this file does not — and should not — expose any
 * business queries (there are no models yet). What it establishes is
 * the *pattern* every future feature repository follows:
 *   - never let a raw Prisma error escape past this layer,
 *   - always re-throw as a typed `DatabaseError`,
 *   - always log with enough context to debug in production.
 *
 * Feature-specific repositories (e.g. `PrismaConsultationRepository`,
 * added in a later sprint) will live under
 * `src/features/<feature>/infrastructure/repositories/` and follow this
 * exact error-handling shape, importing `prisma` from `@/lib/db/prisma`
 * the same way this file does.
 */
export async function checkDatabaseConnection(): Promise<{ ok: true }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  } catch (error) {
    log.error({ err: error }, "Database health check failed");
    throw new DatabaseError("Unable to reach the database", { cause: error });
  }
}
