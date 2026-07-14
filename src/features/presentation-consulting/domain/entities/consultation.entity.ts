import type { ConsultationId, UserId } from "@/shared/types/ids";
import type { ConsultationOutline } from "@/ai/schemas/consultation-outline.schema";

export type ConsultationStatus = "gathering_requirements" | "outline_ready" | "presentation_generated" | "archived";

/**
 * Domain entity: framework-free, ORM-free representation of a
 * consultation. Mapped to/from the Prisma model at the infrastructure
 * boundary (see infrastructure/mappers) so a Prisma schema change never
 * forces a change in domain logic, and vice versa.
 */
export class Consultation {
  constructor(
    public readonly id: ConsultationId,
    public readonly ownerId: UserId,
    public readonly goal: string,
    public readonly audienceDescription: string,
    public readonly context: string,
    public readonly constraints: string[],
    public status: ConsultationStatus,
    public outline: ConsultationOutline | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  attachOutline(outline: ConsultationOutline): void {
    this.outline = outline;
    this.status = "outline_ready";
    this.updatedAt = new Date();
  }

  markPresentationGenerated(): void {
    if (this.status !== "outline_ready") {
      throw new Error(
        `Cannot generate a presentation for consultation ${this.id}: outline must be ready first (current status: ${this.status})`,
      );
    }
    this.status = "presentation_generated";
    this.updatedAt = new Date();
  }
}
