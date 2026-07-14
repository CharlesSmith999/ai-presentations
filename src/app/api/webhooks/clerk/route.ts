import { Webhook } from "svix";
import { env } from "@/config/env";
import { apiSuccess, apiError } from "@/shared/api/response";
import { ValidationError } from "@/shared/errors/app-error";
import { createLogger } from "@/shared/logging/logger";

const log = createLogger("api:webhooks:clerk");

/**
 * Verifies and logs Clerk webhook events (user.created, user.updated,
 * session.created, etc.). Signature verification uses `svix`, the
 * library Clerk's own docs specify — this is the only file in the
 * codebase that imports it.
 *
 * Scope note: this handler verifies and logs events; it does not sync
 * users into a `User` table because no `User` business model exists yet
 * (the app currently trusts Clerk as the source of truth for identity
 * and only stores a bare `ownerId` string against domain entities, e.g.
 * `Consultation.ownerId`). When a feature needs richer user data synced
 * into Postgres, add a case below that calls into a new
 * `features/users` domain use-case — do not write persistence logic
 * directly in this route handler.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.text();
    const headerPayload = {
      "svix-id": request.headers.get("svix-id") ?? "",
      "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
      "svix-signature": request.headers.get("svix-signature") ?? "",
    };

    if (!headerPayload["svix-id"] || !headerPayload["svix-timestamp"] || !headerPayload["svix-signature"]) {
      throw new ValidationError("Missing Svix signature headers");
    }

    if (!env.CLERK_WEBHOOK_SECRET) {
      throw new ValidationError("CLERK_WEBHOOK_SECRET is not configured");
    }

    const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET);

    const event = webhook.verify(payload, headerPayload) as { type: string; data: Record<string, unknown> };

    log.info({ eventType: event.type }, "Received verified Clerk webhook event");

    switch (event.type) {
      case "user.created":
      case "user.updated":
      case "user.deleted":
      case "session.created":
        // Intentionally a no-op beyond logging until a `users` feature
        // exists to own this data. See the file-level note above.
        break;
      default:
        log.warn({ eventType: event.type }, "Unhandled Clerk webhook event type");
    }

    return apiSuccess({ received: true });
  } catch (error) {
    return apiError(error);
  }
}
