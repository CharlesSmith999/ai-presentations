import { checkDatabaseConnection } from "@/lib/db/database.service";
import { appConfig } from "@/config/app-config";
import { apiSuccess, apiError } from "@/shared/api/response";

/**
 * The one endpoint Sprint 0 ships with real behavior. It exists to
 * prove the foundation actually works end-to-end — environment
 * validation, application config, the database connection, and the API
 * response helpers — without touching any business feature.
 */
export async function GET(): Promise<Response> {
  try {
    const database = await checkDatabaseConnection();

    return apiSuccess({
      status: "ok",
      environment: appConfig.app.environment,
      database,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return apiError(error);
  }
}
