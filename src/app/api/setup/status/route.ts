import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/setup/status
 * Returns whether the platform has been initialized.
 * Called by the setup wizard on mount to self-guard.
 */
export async function GET() {
  // Query the platform settings singleton to check if initialized
  const settings = await db.platformSettings.findUnique({
    where: { id: "singleton" },
    select: { initialized: true },
  });
  return NextResponse.json({ initialized: !!settings?.initialized });
}
