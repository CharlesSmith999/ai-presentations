import { prisma } from "@/lib/db/prisma";
import { PrismaConsultationRepository } from "@/features/presentation-consulting/infrastructure/repositories/prisma-consultation.repository";
import { ConsultationService } from "@/features/presentation-consulting/application/services/consultation.service";

/**
 * Composition root: the one place in the application where concrete
 * infrastructure classes are instantiated and handed to application
 * services as their interface-typed dependencies. Route handlers and
 * server actions import from *this* file, never
 * `new PrismaConsultationRepository(...)` directly.
 *
 * Kept as manual construction (no reflection-based IoC framework) —
 * this is a single Next.js app, not a large multi-module backend, so a
 * lightweight composition root is more maintainable than adding a DI
 * framework dependency.
 */
function buildContainer() {
  const consultationRepository = new PrismaConsultationRepository(prisma);
  const consultationService = new ConsultationService(consultationRepository);

  return {
    consultationService,
  };
}

let cachedContainer: ReturnType<typeof buildContainer> | undefined;

export function getContainer(): ReturnType<typeof buildContainer> {
  if (!cachedContainer) {
    cachedContainer = buildContainer();
  }
  return cachedContainer;
}
