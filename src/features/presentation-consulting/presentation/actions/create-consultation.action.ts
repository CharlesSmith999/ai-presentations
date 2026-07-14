"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUserId } from "@/lib/auth/current-user";
import { getContainer } from "@/di/container";
import { createConsultationDtoSchema } from "@/features/presentation-consulting/application/dto/consultation.dto";
import { parseOrThrow } from "@/shared/validation/parse";
import type { ConsultationResponseDto } from "@/features/presentation-consulting/application/dto/consultation.dto";

export interface CreateConsultationFormInput {
  goal: string;
  audienceDescription: string;
  context: string;
  constraints: string;
}

/**
 * Server Action backing the "new consultation" form. Kept thin for the
 * same reason route handlers are thin: parse input, resolve identity,
 * call one service method, invalidate the list page's cache.
 */
export async function createConsultationAction(input: CreateConsultationFormInput): Promise<ConsultationResponseDto> {
  const userId = await requireCurrentUserId();

  const dto = parseOrThrow(createConsultationDtoSchema, {
    goal: input.goal,
    audienceDescription: input.audienceDescription,
    context: input.context,
    constraints: input.constraints
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0),
  });

  const consultation = await getContainer().consultationService.create(userId, dto);
  revalidatePath("/dashboard/consultations");
  return consultation;
}
