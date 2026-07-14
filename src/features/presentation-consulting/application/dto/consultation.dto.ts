import { z } from "zod";
import type { Consultation } from "@/features/presentation-consulting/domain/entities/consultation.entity";

/**
 * Input DTO schema: validates the *shape* of data arriving at the API
 * boundary. Business-rule validation (e.g. minimum meaningful length)
 * stays in the use-case.
 */
export const createConsultationDtoSchema = z.object({
  goal: z.string().min(1).max(2000),
  audienceDescription: z.string().min(1).max(2000),
  context: z.string().min(1).max(5000),
  constraints: z.array(z.string().min(1).max(500)).max(20).default([]),
});

export type CreateConsultationDto = z.infer<typeof createConsultationDtoSchema>;

/**
 * Output DTO: explicit fields returned to clients, rather than the
 * entity directly, so an internal-only field added to the entity later
 * never leaks to the wire by accident.
 */
export interface ConsultationResponseDto {
  id: string;
  goal: string;
  audienceDescription: string;
  context: string;
  constraints: string[];
  status: string;
  outline: Consultation["outline"];
  createdAt: string;
  updatedAt: string;
}

export function toConsultationResponseDto(consultation: Consultation): ConsultationResponseDto {
  return {
    id: consultation.id,
    goal: consultation.goal,
    audienceDescription: consultation.audienceDescription,
    context: consultation.context,
    constraints: consultation.constraints,
    status: consultation.status,
    outline: consultation.outline,
    createdAt: consultation.createdAt.toISOString(),
    updatedAt: consultation.updatedAt.toISOString(),
  };
}
