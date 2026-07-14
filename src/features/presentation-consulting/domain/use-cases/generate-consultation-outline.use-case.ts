import type { ConsultationRepository } from "@/features/presentation-consulting/domain/repositories/consultation.repository";
import type { ConsultationId } from "@/shared/types/ids";
import { NotFoundError } from "@/shared/errors/app-error";
import { getStructuredCompletion } from "@/ai/ai-client";
import { consultationOutlineSchema, type ConsultationOutline } from "@/ai/schemas/consultation-outline.schema";
import { buildConsultationOutlinePrompt } from "@/ai/prompts/consultation-outline.prompt";
import { createLogger } from "@/shared/logging/logger";

const log = createLogger("presentation-consulting:generate-outline");

/**
 * This is where "the intelligence behind the output" actually lives.
 * Orchestrates: loading the consultation (via the repository port),
 * asking the AI layer for a structured strategic outline, and
 * persisting the result. Imports only interfaces/abstractions
 * (`ConsultationRepository`) plus the AI layer's public surface
 * (`getStructuredCompletion`) — never a concrete Prisma client or SDK —
 * so it can be unit tested with an in-memory repository and a mocked
 * AI client, with zero network or database access.
 */
export class GenerateConsultationOutlineUseCase {
  constructor(private readonly consultationRepository: ConsultationRepository) {}

  async execute(consultationId: ConsultationId): Promise<ConsultationOutline> {
    const consultation = await this.consultationRepository.findById(consultationId);

    if (!consultation) {
      throw new NotFoundError("Consultation", consultationId);
    }

    const prompt = buildConsultationOutlinePrompt({
      goal: consultation.goal,
      audienceDescription: consultation.audienceDescription,
      context: consultation.context,
      constraints: consultation.constraints,
    });

    log.info({ consultationId }, "Requesting consultation outline from AI layer");

    const outline = await getStructuredCompletion({
      system: prompt.system,
      messages: prompt.messages,
      schema: consultationOutlineSchema,
    });

    consultation.attachOutline(outline);
    await this.consultationRepository.save(consultation);

    log.info({ consultationId }, "Consultation outline generated and persisted");

    return outline;
  }
}
