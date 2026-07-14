import { requireCurrentUserId } from "@/lib/auth/current-user";

/**
 * Every route nested under the `(dashboard)` route group renders behind
 * this layout. `src/middleware.ts` already blocks unauthenticated
 * requests from reaching here at all; calling `requireCurrentUserId()`
 * again is defense in depth and gives every nested Server Component
 * access to a guaranteed, typed user id without re-deriving it.
 *
 * This is the "protected route structure" Sprint 0 establishes — later
 * sprints add pages under `(dashboard)/` (e.g. `(dashboard)/consultations`)
 * and they inherit this protection automatically by virtue of the route
 * group, with zero per-page auth boilerplate.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  await requireCurrentUserId();

  return <div className="min-h-screen">{children}</div>;
}
