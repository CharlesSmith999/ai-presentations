import { auth } from "@clerk/nextjs/server";
import { UnauthorizedError } from "@/shared/errors/app-error";

/**
 * Every Route Handler or Server Action that needs the caller's identity
 * calls this function instead of Clerk's `auth()` directly. This means:
 *   - an unauthenticated call surfaces as our own `UnauthorizedError`
 *     (consistent with every other error in the app), not a
 *     Clerk-specific shape;
 *   - if the auth provider is ever swapped, only this file changes.
 *
 * Middleware (`src/middleware.ts`) is the first line of defense that
 * keeps unauthenticated requests out of protected routes entirely; this
 * function is the second line of defense (defense in depth) and the way
 * a route/action gets a typed, guaranteed-present user id.
 */
export async function requireCurrentUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new UnauthorizedError("You must be signed in to perform this action");
  }

  return userId;
}
