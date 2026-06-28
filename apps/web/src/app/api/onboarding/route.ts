import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        firstLogin: true,
        tourStates: {
          select: {
            tourId: true,
            completed: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      firstLogin: user.firstLogin,
      completedTours: user.tourStates
        .filter((state) => state.completed)
        .map((state) => state.tourId),
    });
  } catch (error: any) {
    console.error("[onboarding-get] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch onboarding state" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { action, tourId } = body;

    if (action === "complete") {
      if (!tourId) {
        return NextResponse.json(
          { error: "tourId is required for complete action" },
          { status: 400 }
        );
      }

      // Upsert tour state
      await db.userTourState.upsert({
        where: {
          userId_tourId: {
            userId: dbUser.id,
            tourId: tourId,
          },
        },
        create: {
          userId: dbUser.id,
          tourId: tourId,
          completed: true,
          completedAt: new Date(),
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
      });

      // If it was the first-login tour, update firstLogin on User
      if (tourId === "first-login") {
        await db.user.update({
          where: { id: dbUser.id },
          data: { firstLogin: false },
        });
      }

      return NextResponse.json({ ok: true });
    }

    if (action === "reset") {
      // Clear all tour states for the user
      await db.userTourState.deleteMany({
        where: { userId: dbUser.id },
      });

      // Reset firstLogin on User
      await db.user.update({
        where: { id: dbUser.id },
        data: { firstLogin: true },
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("[onboarding-post] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update onboarding state" },
      { status: 500 }
    );
  }
}
