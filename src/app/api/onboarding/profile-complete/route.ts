import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

interface ProfileInput {
  firstName: string;
  lastName: string;
  username: string;
  designation: string;
}

interface PrefsInput {
  theme: string;
  activeBrandId: string;
  notificationsEnabled: boolean;
}

interface RequestBody {
  profile: ProfileInput;
  prefs: PrefsInput;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: RequestBody = await req.json();
  const { profile, prefs } = body;

  if (!profile.firstName || !profile.lastName || !profile.username) {
    return NextResponse.json({ error: "First name, last name, and username are required" }, { status: 400 });
  }

  try {
    const client = await clerkClient();

    // 1. Update Clerk user profile
    await client.users.updateUser(userId, {
      firstName: profile.firstName,
      lastName: profile.lastName,
      username: profile.username,
    });

    // 2. Update DB user - complete onboarding
    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (dbUser) {
      await db.user.update({
        where: { id: dbUser.id },
        data: {
          firstName:       profile.firstName,
          lastName:        profile.lastName,
          username:        profile.username,
          designation:     profile.designation || null,
          theme:           prefs.theme,
          activeBrandId:   prefs.activeBrandId || null,
          onboardingState: "COMPLETE",
        },
      });

      // Update notification preference
      await db.notificationPreference.upsert({
        where: { userId: dbUser.id },
        update: { inAppEnabled: prefs.notificationsEnabled },
        create: {
          userId:       dbUser.id,
          inAppEnabled: prefs.notificationsEnabled,
          emailEnabled: true,
        },
      });
    }

    // 3. Update Clerk publicMetadata - onboarding COMPLETE
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingState: "COMPLETE",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[profile-complete] error:", err);
    return NextResponse.json({ error: "Profile setup failed. Please try again." }, { status: 500 });
  }
}
