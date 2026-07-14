import { requireCurrentUserId } from "@/lib/auth/current-user";
import { getContainer } from "@/di/container";
import { apiSuccess, apiError } from "@/shared/api/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Triggers the AI layer to produce the strategic outline for an
 * existing consultation. A separate endpoint from creation because
 * outline generation is an AI call with latency and cost — the client
 * triggers it explicitly and shows its own loading state.
 */
export async function POST(_request: Request, { params }: RouteParams): Promise<Response> {
  try {
    await requireCurrentUserId();
    const { id } = await params;

    const consultation = await getContainer().consultationService.generateOutlineFor(id);

    return apiSuccess(consultation);
  } catch (error) {
    return apiError(error);
  }
}
