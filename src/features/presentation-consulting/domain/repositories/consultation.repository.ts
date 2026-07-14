import type { Consultation } from "@/features/presentation-consulting/domain/entities/consultation.entity";
import type { ConsultationId, UserId, PaginatedResult } from "@/shared/types/ids";

/**
 * Port: the domain/application layers depend on this interface only.
 * The concrete implementation (Prisma-backed) lives in the
 * infrastructure layer and is wired up via the DI container.
 */
export interface ConsultationRepository {
  findById(id: ConsultationId): Promise<Consultation | null>;
  findByOwner(ownerId: UserId, page: number, pageSize: number): Promise<PaginatedResult<Consultation>>;
  save(consultation: Consultation): Promise<void>;
  delete(id: ConsultationId): Promise<void>;
}
