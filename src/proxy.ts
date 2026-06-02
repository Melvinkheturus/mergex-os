import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public routes - accessible without authentication
const isPublicRoute = createRouteMatcher([
  "/",               // landing page
  "/sign-in(.*)",    // Clerk sign-in
  "/sign-up(.*)",    // Clerk sign-up (invite flow)
  "/invite(.*)",     // Custom invite activation page
  "/forgot-password(.*)", // Forgot password / recovery code
  "/api/auth/webhook(.*)", // Clerk webhook - must be public
  "/api/auth/invite-lookup(.*)", // Invite token lookup
  "/api/auth/recovery-code/verify(.*)", // Recovery code verification
]);

// Onboarding routes - blocked from normal app access
const isOnboardingRoute = createRouteMatcher([
  "/onboarding(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Retrieve current auth state
  const { userId, sessionClaims } = await auth();

  // If already authenticated and trying to access auth pages (sign-in or sign-up)
  if (userId && (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))) {
    const onboardingState = (sessionClaims?.publicMetadata as { onboardingState?: string })?.onboardingState;
    if (onboardingState === "PLATFORM_SETUP") {
      return NextResponse.redirect(new URL("/onboarding/platform", request.url));
    }
    if (onboardingState === "PROFILE_SETUP") {
      return NextResponse.redirect(new URL("/onboarding/profile", request.url));
    }
    // COMPLETE - redirect directly to active brand workspace or hub
    return NextResponse.redirect(await resolvePostLoginRedirect(userId, request.url));
  }

  // Always allow public routes
  if (isPublicRoute(request)) return;

  // Require authentication for all other routes
  if (!userId) {
    await auth.protect();
    return;
  }

  const onboardingState = (sessionClaims?.publicMetadata as { onboardingState?: string })?.onboardingState;

  if (onboardingState === "PLATFORM_SETUP") {
    // Must complete platform setup first
    if (!isOnboardingRoute(request)) {
      return NextResponse.redirect(new URL("/onboarding/platform", request.url));
    }
    // Block access to profile onboarding until platform setup is done
    if (pathname.startsWith("/onboarding/profile")) {
      return NextResponse.redirect(new URL("/onboarding/platform", request.url));
    }
    return;
  }

  if (onboardingState === "PROFILE_SETUP") {
    // Must complete personal profile setup
    if (!isOnboardingRoute(request)) {
      return NextResponse.redirect(new URL("/onboarding/profile", request.url));
    }
    return;
  }

  // onboardingState === "COMPLETE" or undefined (existing users before this feature)
  // Block access to onboarding routes once complete
  if (isOnboardingRoute(request)) {
    return NextResponse.redirect(await resolvePostLoginRedirect(userId, request.url));
  }
});

// ── Resolve post-login destination from DB activeBrandId ──────────────────
async function resolvePostLoginRedirect(clerkUserId: string, requestUrl: string): Promise<URL> {
  try {
    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { activeBrandId: true },
    });
    if (user?.activeBrandId) {
      const brand = await db.brand.findUnique({
        where: { id: user.activeBrandId },
        select: { slug: true, status: true },
      });
      if (brand && brand.status === "active") {
        return new URL(`/workspaces/${brand.slug}/dashboard`, requestUrl);
      }
    }
  } catch {
    // DB unreachable during cold start - fall through to hub
  }
  return new URL("/workspaces", requestUrl);
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
