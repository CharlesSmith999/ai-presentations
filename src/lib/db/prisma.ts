import { PrismaClient } from "@prisma/client";
import { env } from "@/config/env";

/**
 * Next.js dev mode hot-reloads modules, which would otherwise create a
 * new PrismaClient (and a new connection pool) on every file save.
 * Caching the instance on `globalThis` in development avoids exhausting
 * the database's connection limit. In production, module caching means
 * this constructor runs once per process regardless.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
