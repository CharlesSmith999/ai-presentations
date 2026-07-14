import type { PrismaClient } from "@prisma/client";
import type { ConsultationRepository } from "@/features/presentation-consulting/domain/repositories/consultation.repository";
import type { Consultation } from "@/features/presentation-consulting/domain/entities/consultation.entity";
import type { ConsultationId, UserId, PaginatedResult } from "@/shared/types/ids";
import { toDomainEntity, toPersistenceRecord } from "@/features/presentation-consulting/infrastructure/mappers/consultation.mapper";
import { DatabaseError } from "@/shared/errors/app-error";
import { createLogger } from "@/shared/logging/logger";

const log = createLogger("presentation-consulting:prisma-repository");

/**
 * Concrete adapter implementing `ConsultationRepository` with Prisma.
 * The only class in this feature allowed to import `@prisma/client`
 * types. Every Prisma-specific error is caught here and re-thrown as a
 * domain-level `DatabaseError`.
 */
export class PrismaConsultationRepository implements ConsultationRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: ConsultationId): Promise<Consultation | null> {
    try {
      const record = await this.db.consultationRecord.findUnique({ where: { id } });
      return record ? toDomainEntity(record) : null;
    } catch (error) {
      log.error({ err: error, id }, "Failed to find consultation by id");
      throw new DatabaseError("Failed to load consultation", { cause: error });
    }
  }

  async findByOwner(ownerId: UserId, page: number, pageSize: number): Promise<PaginatedResult<Consultation>> {
    try {
      const [records, total] = await Promise.all([
        this.db.consultationRecord.findMany({
          where: { ownerId },
          orderBy: { updatedAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        this.db.consultationRecord.count({ where: { ownerId } }),
      ]);

      return {
        items: records.map(toDomainEntity),
        total,
        page,
        pageSize,
        hasNextPage: page * pageSize < total,
      };
    } catch (error) {
      log.error({ err: error, ownerId }, "Failed to list consultations for owner");
      throw new DatabaseError("Failed to load consultations", { cause: error });
    }
  }

  async save(consultation: Consultation): Promise<void> {
    try {
      const data = toPersistenceRecord(consultation);
      await this.db.consultationRecord.upsert({
        where: { id: consultation.id },
        create: data,
        update: data,
      });
    } catch (error) {
      log.error({ err: error, id: consultation.id }, "Failed to save consultation");
      throw new DatabaseError("Failed to save consultation", { cause: error });
    }
  }

  async delete(id: ConsultationId): Promise<void> {
    try {
      await this.db.consultationRecord.delete({ where: { id } });
    } catch (error) {
      log.error({ err: error, id }, "Failed to delete consultation");
      throw new DatabaseError("Failed to delete consultation", { cause: error });
    }
  }
}
