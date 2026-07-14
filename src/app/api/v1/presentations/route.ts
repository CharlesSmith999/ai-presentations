import { NextRequest } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { requireCurrentUserId } from "@/lib/auth/current-user";
import { getContainer } from "@/di/container";
import { parseOrThrow } from "@/shared/validation/parse";
import { apiSuccess, apiError } from "@/shared/api/response";
import { ValidationError } from "@/shared/errors/app-error";
import { buildSlidePlanFromOutline } from "@/presentation-engine/strategy/outline-to-slide-plan.strategy";
import { PptxRenderer } from "@/renderer/pptx/pptx-renderer";
import { uploadPresentationFile, getSignedDownloadUrl } from "@/lib/storage/supabase-client";

const generatePresentationSchema = z.object({
  consultationId: z.string().min(1),
});

/**
 * Wires the three "output" layers together for a single request:
 *   consulting outline -> presentation-engine (slide plan) -> renderer (bytes) -> storage (signed URL).
 * Each step is independently testable and swappable; this route only
 * sequences them and translates the result into a response.
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const userId = await requireCurrentUserId();
    const { consultationId } = parseOrThrow(generatePresentationSchema, await request.json());

    const { consultationService } = getContainer();
    const consultation = await consultationService.getById(consultationId);

    if (!consultation || consultation.id !== consultationId) {
      throw new ValidationError("Consultation not found");
    }
    if (!consultation.outline) {
      throw new ValidationError("This consultation has no outline yet — generate the outline before rendering a deck");
    }

    const slidePlan = buildSlidePlanFromOutline(consultation.outline);
    const renderer = new PptxRenderer();
    const fileBuffer = await renderer.render(slidePlan);

    const storagePath = `${userId}/${consultationId}/${nanoid()}.${renderer.fileExtension}`;
    await uploadPresentationFile(storagePath, fileBuffer);
    const downloadUrl = await getSignedDownloadUrl(storagePath);

    return apiSuccess({ downloadUrl, slideCount: slidePlan.slides.length }, 201);
  } catch (error) {
    return apiError(error);
  }
}
