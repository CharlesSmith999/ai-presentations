import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Route protection is centralized here rather than scattered as ad-hoc
 * checks in individual pages. Anything not matched by `isPublicRoute` is
 * required to be authenticated before the request reaches a Server
 * Component or Route Handler.
 */
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/api/health", "/api/webhooks(.*)"]);

export default clerkMiddleware(async (authFn, request) => {
  if (!isPublicRoute(request)) {
    await authFn.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
