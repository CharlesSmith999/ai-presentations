import { Prisma } from "@prisma/client";
import type { ConsultationRecord } from "@prisma/client";
import {
  Consultation,
  type ConsultationStatus,
} from "@/features/presentation-consulting/domain/entities/consultation.entity";
import { consultationOutlineSchema, type ConsultationOutline } from "@/ai/schemas/consultation-outline.schema";
import { asConsultationId, asUserId } from "@/shared/types/ids";
import { AppError } from "@/shared/errors/app-error";

/**
 * Translates between the Prisma persistence shape and the
 * framework-free domain entity. This is the only place in the codebase
 * where both types are known simultaneously — it exists specifically so
 * a Prisma schema migration never forces a change to domain logic, and
 * the domain entity never needs to know Prisma exists.
 */
export function toDomainEntity(record: ConsultationRecord): Consultation {
  return new Consultation(
    asConsultationId(record.id),
    asUserId(record.ownerId),
    record.goal,
    record.audienceDescription,
    record.context,
    record.constraints,
    record.status as ConsultationStatus,
    parseOutlineOrNull(record.outline),
    record.createdAt,
    record.updatedAt,
  );
}

export interface ConsultationPersistenceData {
  id: string;
  ownerId: string;
  goal: string;
  audienceDescription: string;
  context: string;
  constraints: string[];
  status: string;
  outline: Prisma.InputJsonValue | typeof Prisma.JsonNull;
}

/**
 * Prisma's generated input types require an explicit `Prisma.JsonNull`
 * marker for a JSON column that should be stored as SQL NULL — a plain
 * JS `null` is not assignable there, since Prisma also needs to
 * distinguish "leave this field alone" (`undefined`) from "set it to
 * JSON null" (`Prisma.JsonNull`). This mapping is the one place that
 * translates our domain's plain `null` into that Prisma-specific shape.
 */
export function toPersistenceRecord(entity: Consultation): ConsultationPersistenceData {
  return {
    id: entity.id,
    ownerId: entity.ownerId,
    goal: entity.goal,
    audienceDescription: entity.audienceDescription,
    context: entity.context,
    constraints: entity.constraints,
    status: entity.status,
    outline: entity.outline === null ? Prisma.JsonNull : (entity.outline as unknown as Prisma.InputJsonValue),
  };
}

function parseOutlineOrNull(raw: unknown): ConsultationOutline | null {
  if (raw === null || raw === undefined) return null;

  const result = consultationOutlineSchema.safeParse(raw);
  if (!result.success) {
    throw new AppError("Stored consultation outline failed schema validation", "DATABASE_ERROR", {
      context: { issues: result.error.issues },
    });
  }
  return result.data;
}
