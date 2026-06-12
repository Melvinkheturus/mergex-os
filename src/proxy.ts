/**
 * !!!!!!!!!!!!!!!! ATTENTION AI AGENT !!!!!!!!!!!!!!!!
 * DO NOT DELETE THIS FILE AND DO NOT CREATE MIDDLEWARE.TS.
 * In Next.js 16+, middleware.ts is DEPRECATED and officially replaced by proxy.ts.
 * * Target Function: export function proxy(request: NextRequest) { ... }
 * Leave this file named proxy.ts.
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes - accessible without authentication
const isPublicRoute = createRouteMatcher([
  "/",               // landing page
  "/changelog(.*)",  // changelog page (public)
  "/sign-in(.*)",    // Clerk sign-in
  "/sign-up(.*)",    // Clerk sign-up (invite flow)
  "/invite(.*)",     // Custom invite activation page
  "/forgot-password(.*)", // Forgot password / recovery code
  "/setup",          // One-time platform setup wizard
  "/api/setup(.*)",  // Setup API — must be public
  "/api/auth/webhook(.*)", // Clerk webhook - must be public
  "/api/auth/invite-lookup(.*)", // Invite token lookup
  "/api/auth/recovery-code/verify(.*)", // Recovery code verification
  "/api/auth/active-brand(.*)", // Internal middleware → Node.js DB lookup
]);



export default clerkMiddleware(
  async (auth, request) => {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // ── Platform initialization gate ──────────────────────────────────────────
  // If platform not yet initialized, page traffic (except landing page) goes to /setup.
  // Skip for: landing page "/", /setup itself, /api/* routes, Next.js internals.
  if (
    pathname !== "/" &&
    !pathname.startsWith("/setup") &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_next")
  ) {
    try {
      const statusRes = await fetch(
        new URL("/api/setup/status", request.nextUrl.origin),
        { cache: "no-store" }
      );
      const { initialized } = await statusRes.json() as { initialized: boolean };
      if (!initialized) {
        return NextResponse.redirect(new URL("/setup", request.url));
      }
    } catch {
      // DB unreachable — fail open (don't block traffic, let the page load)
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Retrieve current auth state.
  // Wrapped in try/catch: if the JWT has clock-skew issues (nbf slightly in the
  // future) and Clerk throws instead of tolerating it, we treat the user as
  // unauthenticated rather than crashing into an infinite sign-in redirect loop.
  let userId: string | null = null;
  let sessionClaims: Record<string, unknown> | null = null;
  try {
    const authState = await auth();
    userId = authState.userId;
    sessionClaims = authState.sessionClaims as Record<string, unknown> | null;
  } catch {
    // Clock-skew or other transient Clerk error — treat as signed-out for routing
  }

  // Block /sign-up for unauthenticated users — invite link is the only entry point
  if (!userId && pathname.startsWith("/sign-up")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // If already authenticated and trying to access auth pages (sign-in or sign-up)
  if (userId && (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))) {

    // COMPLETE - redirect to active brand workspace, or fall through to /workspaces hub
    const postLoginUrl = await resolvePostLoginRedirect(userId, request.url);
    return NextResponse.redirect(postLoginUrl ?? new URL("/workspaces", request.url));
  }

  // Always allow public routes
  if (isPublicRoute(request)) return;

  // Require authentication for all other routes
  if (!userId) {
    await auth.protect();
    return;
  }



  // ── Already on /workspaces (the hub) — let it render, no further redirect ──
  // This prevents an infinite loop: resolvePostLoginRedirect falls back to
  // /workspaces when the user has no activeBrandId, which would re-trigger
  // middleware → loop. The workspaces hub page handles workspace selection itself.
  if (pathname === "/workspaces" || pathname === "/workspaces/") {
    return;
  }
  },
  {
    // Allow up to 60 seconds of clock skew when validating JWT nbf/exp claims.
    // This prevents the infinite redirect loop that occurs when the system clock
    // is slightly behind the Clerk token issuance time.
    clockSkewInMs: 60_000,
  }
);

// ── Resolve post-login destination from DB activeBrandId ──────────────────
// Returns the specific workspace URL if the user has an active brand,
// or null if not — callers fall back to /workspaces hub (NOT this function,
// to avoid the /workspaces → middleware → here → /workspaces loop).
async function resolvePostLoginRedirect(clerkUserId: string, requestUrl: string): Promise<URL | null> {
  try {
    const res = await fetch(
      new URL(`/api/auth/active-brand?clerkId=${encodeURIComponent(clerkUserId)}`, requestUrl),
      { cache: "no-store" }
    );
    if (res.ok) {
      const { brandSlug } = await res.json() as { brandSlug?: string };
      if (brandSlug) {
        return new URL(`/workspaces/${brandSlug}/dashboard`, requestUrl);
      }
    }
  } catch {
    // DB unreachable during cold start - return null, caller shows hub
  }
  return null; // No active brand — let the caller redirect to /workspaces hub
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
