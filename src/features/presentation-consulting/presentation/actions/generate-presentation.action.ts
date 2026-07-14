"use server";

import { nanoid } from "nanoid";
import { requireCurrentUserId } from "@/lib/auth/current-user";
import { getContainer } from "@/di/container";
import { ValidationError } from "@/shared/errors/app-error";
import { buildSlidePlanFromOutline } from "@/presentation-engine/strategy/outline-to-slide-plan.strategy";
import { PptxRenderer } from "@/renderer/pptx/pptx-renderer";
import { uploadPresentationFile, getSignedDownloadUrl } from "@/lib/storage/supabase-client";

export interface GeneratePresentationResult {
  downloadUrl: string;
  slideCount: number;
}

/**
 * Sequences presentation-engine -> renderer -> storage for a single
 * consultation. Mirrors `/api/v1/presentations` exactly, so the portal
 * UI and any external API client get identical behavior from the same
 * underlying layers.
 */
export async function generatePresentationAction(consultationId: string): Promise<GeneratePresentationResult> {
  const userId = await requireCurrentUserId();

  const { consultationService } = getContainer();
  const consultation = await consultationService.getById(consultationId);

  if (!consultation) {
    throw new ValidationError("Consultation not found");
  }
  if (!consultation.outline) {
    throw new ValidationError("Generate the outline before rendering a deck");
  }

  const slidePlan = buildSlidePlanFromOutline(consultation.outline);
  const renderer = new PptxRenderer();
  const fileBuffer = await renderer.render(slidePlan);

  const storagePath = `${userId}/${consultationId}/${nanoid()}.${renderer.fileExtension}`;
  await uploadPresentationFile(storagePath, fileBuffer);
  const downloadUrl = await getSignedDownloadUrl(storagePath);

  return { downloadUrl, slideCount: slidePlan.slides.length };
}
