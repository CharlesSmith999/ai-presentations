import { NextRequest } from "next/server";
import { requireCurrentUserId } from "@/lib/auth/current-user";
import { getContainer } from "@/di/container";
import { createConsultationDtoSchema } from "@/features/presentation-consulting/application/dto/consultation.dto";
import { parseOrThrow } from "@/shared/validation/parse";
import { apiSuccess, apiError } from "@/shared/api/response";

/**
 * Route handlers stay thin: parse input, resolve identity, delegate to
 * the application service, return through the shared response envelope.
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const userId = await requireCurrentUserId();
    const body = parseOrThrow(createConsultationDtoSchema, await request.json(), "Invalid consultation payload");

    const consultation = await getContainer().consultationService.create(userId, body);

    return apiSuccess(consultation, 201);
  } catch (error) {
    return apiError(error);
  }
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const userId = await requireCurrentUserId();
    const page = Number(request.nextUrl.searchParams.get("page") ?? "1");

    const result = await getContainer().consultationService.listForOwner(userId, Number.isFinite(page) ? page : 1);

    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
