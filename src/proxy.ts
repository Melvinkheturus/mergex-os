import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes — no authentication required
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/unauthorized(.*)",
  "/api/auth/webhook(.*)",       // Clerk webhook — verified by svix signature
  "/api/auth/employee-verify(.*)", // Employee credential check
  "/api/auth/invite-validate(.*)", // Invite token validation
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes through without auth
  if (isPublicRoute(req)) return;

  // Everything else (including /dashboard/**) requires auth
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
