import { nanoid } from "nanoid";
import { Consultation } from "@/features/presentation-consulting/domain/entities/consultation.entity";
import type { ConsultationRepository } from "@/features/presentation-consulting/domain/repositories/consultation.repository";
import { asConsultationId, type UserId } from "@/shared/types/ids";
import { ValidationError } from "@/shared/errors/app-error";

export interface CreateConsultationInput {
  ownerId: UserId;
  goal: string;
  audienceDescription: string;
  context: string;
  constraints: string[];
}

/**
 * Encapsulates the invariants for creating a consultation so no caller
 * — API route, server action, admin tool — can create an invalid one by
 * skipping validation. Input-shape validation (types) happens with Zod
 * at the API boundary; business-rule validation belongs here.
 */
export class CreateConsultationUseCase {
  constructor(private readonly consultationRepository: ConsultationRepository) {}

  async execute(input: CreateConsultationInput): Promise<Consultation> {
    if (input.goal.trim().length < 10) {
      throw new ValidationError(
        "The presentation goal must be at least 10 characters — be specific about what this deck needs to achieve.",
      );
    }

    const now = new Date();
    const consultation = new Consultation(
      asConsultationId(nanoid()),
      input.ownerId,
      input.goal.trim(),
      input.audienceDescription.trim(),
      input.context.trim(),
      input.constraints,
      "gathering_requirements",
      null,
      now,
      now,
    );

    await this.consultationRepository.save(consultation);
    return consultation;
  }
}
