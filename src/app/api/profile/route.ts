import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

interface ProfileUpdateBody {
  firstName: string;
  lastName: string;
  username: string;
  designation: string;
  avatarUrl: string | null;
  theme?: string;
  activeBrandId?: string;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        Role: true,
        UserBrandAccess: {
          include: {
            Brand: { select: { id: true, name: true, slug: true } }
          }
        }
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user: dbUser });
  } catch (err: any) {
    console.error("[profile-get] error:", err);
    return NextResponse.json({ error: err.message || "Failed to retrieve profile" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: ProfileUpdateBody = await req.json();
    const { firstName, lastName, username, designation, avatarUrl, theme, activeBrandId } = body;

    if (!firstName || !lastName || !username) {
      return NextResponse.json({ error: "First name, last name, and username are required" }, { status: 400 });
    }

    const client = await clerkClient();

    // 1. Update Clerk user profile (name and username)
    await client.users.updateUser(userId, {
      firstName,
      lastName,
      username,
    });

    // 2. Update DB user profile details including display picture avatarUrl
    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    const updatedUser = await db.user.update({
      where: { id: dbUser.id },
      data: {
        firstName,
        lastName,
        username,
        designation: designation || null,
        avatarUrl: avatarUrl || null,
        theme: theme || dbUser.theme,
        activeBrandId: activeBrandId || dbUser.activeBrandId,
      },
    });

    return NextResponse.json({ ok: true, user: updatedUser });
  } catch (err: any) {
    console.error("[profile-update] error:", err);
    return NextResponse.json({ error: err.message || "Failed to update profile details. Please try again." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { activeBrandId, theme, avatarUrl, firstName, lastName } = body;

    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (activeBrandId !== undefined) data.activeBrandId = activeBrandId;
    if (theme !== undefined) data.theme = theme;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;

    const updated = await db.user.update({
      where: { id: dbUser.id },
      data,
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (err: any) {
    console.error("[profile-patch] error:", err);
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}
