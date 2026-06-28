import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/pulse/process
// Cron-compatible placeholder endpoint for Phase 0.
export async function GET(request: Request) {
  // Allow both internal (Vercel cron secret) and authenticated calls
  const cronSecret = request.headers.get("x-cron-secret");
  const isAuthorizedCron = cronSecret === process.env.CRON_SECRET;

  if (!isAuthorizedCron) {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.json({
    message: "Pulse Engine cron active. Foundation mode (Phase 0) running.",
    processedAt: new Date().toISOString(),
  });
}
