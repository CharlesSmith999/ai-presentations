import type { ConsultationRepository } from "@/features/presentation-consulting/domain/repositories/consultation.repository";
import { CreateConsultationUseCase } from "@/features/presentation-consulting/domain/use-cases/create-consultation.use-case";
import { GenerateConsultationOutlineUseCase } from "@/features/presentation-consulting/domain/use-cases/generate-consultation-outline.use-case";
import type {
  CreateConsultationDto,
  ConsultationResponseDto,
} from "@/features/presentation-consulting/application/dto/consultation.dto";
import { toConsultationResponseDto } from "@/features/presentation-consulting/application/dto/consultation.dto";
import { asConsultationId, asUserId, type PaginatedResult } from "@/shared/types/ids";
import { appConfig } from "@/config/app-config";

/**
 * The seam between "the outside world" (API route handlers, server
 * actions) and the domain layer's use-cases. Composes use-cases plus
 * DTO mapping so route handlers and server actions stay thin.
 */
export class ConsultationService {
  private readonly createConsultation: CreateConsultationUseCase;
  private readonly generateOutline: GenerateConsultationOutlineUseCase;

  constructor(private readonly consultationRepository: ConsultationRepository) {
    this.createConsultation = new CreateConsultationUseCase(consultationRepository);
    this.generateOutline = new GenerateConsultationOutlineUseCase(consultationRepository);
  }

  async create(ownerId: string, dto: CreateConsultationDto): Promise<ConsultationResponseDto> {
    const consultation = await this.createConsultation.execute({
      ownerId: asUserId(ownerId),
      goal: dto.goal,
      audienceDescription: dto.audienceDescription,
      context: dto.context,
      constraints: dto.constraints,
    });

    return toConsultationResponseDto(consultation);
  }

  async generateOutlineFor(consultationId: string): Promise<ConsultationResponseDto> {
    await this.generateOutline.execute(asConsultationId(consultationId));
    const updated = await this.consultationRepository.findById(asConsultationId(consultationId));
    // `updated` cannot be null here: the use-case above throws NotFoundError first if missing.
    return toConsultationResponseDto(updated!);
  }

  async getById(consultationId: string): Promise<ConsultationResponseDto | null> {
    const consultation = await this.consultationRepository.findById(asConsultationId(consultationId));
    return consultation ? toConsultationResponseDto(consultation) : null;
  }

  async listForOwner(ownerId: string, page: number): Promise<PaginatedResult<ConsultationResponseDto>> {
    const result = await this.consultationRepository.findByOwner(
      asUserId(ownerId),
      page,
      appConfig.pagination.defaultPageSize,
    );

    return { ...result, items: result.items.map(toConsultationResponseDto) };
  }
}
