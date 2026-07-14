"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUserId } from "@/lib/auth/current-user";
import { getContainer } from "@/di/container";
import type { ConsultationResponseDto } from "@/features/presentation-consulting/application/dto/consultation.dto";

export async function generateOutlineAction(consultationId: string): Promise<ConsultationResponseDto> {
  await requireCurrentUserId();
  const result = await getContainer().consultationService.generateOutlineFor(consultationId);
  revalidatePath(`/dashboard/consultations/${consultationId}`);
  return result;
}
