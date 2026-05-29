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
  defaultBrandId?: string;
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: ProfileUpdateBody = await req.json();
    const { firstName, lastName, username, designation, avatarUrl, theme, defaultBrandId } = body;

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
        defaultBrandId: defaultBrandId || dbUser.defaultBrandId,
      },
    });

    return NextResponse.json({ ok: true, user: updatedUser });
  } catch (err: any) {
    console.error("[profile-update] error:", err);
    return NextResponse.json({ error: err.message || "Failed to update profile details. Please try again." }, { status: 500 });
  }
}
