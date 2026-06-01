import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { seedBrandDefaults } from "@/lib/crm/seed-defaults";

interface BrandInput {
  name: string;
  slug: string;
}

interface PrefsInput {
  timezone: string;
  currency: string;
}

interface RequestBody {
  brands: BrandInput[];
  prefs: PrefsInput;
  invites: string[];
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: RequestBody = await req.json();
  const { brands, invites } = body;

  if (!brands || brands.length === 0) {
    return NextResponse.json({ error: "At least one brand is required" }, { status: 400 });
  }

  try {
    // 1. Create brands
    await db.brand.createMany({
      data: brands.map((b: BrandInput) => ({ name: b.name, slug: b.slug })),
      skipDuplicates: true,
    });

    // Seed CRM defaults for these new brands
    const createdBrands = await db.brand.findMany({
      where: {
        slug: {
          in: brands.map((b: BrandInput) => b.slug),
        },
      },
    });
    await Promise.all(createdBrands.map((b: { id: string }) => seedBrandDefaults(b.id)));

    // 2. Update user onboardingState in DB
    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (dbUser) {
      await db.user.update({
        where: { id: dbUser.id },
        data: { onboardingState: "PROFILE_SETUP" }, // platform done, now profile
      });
    }

    // 3. Update Clerk publicMetadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingState: "PROFILE_SETUP",
        role: "super_admin",
      },
    });

    // 4. Create Clerk invitations (optional)
    if (invites && invites.length > 0) {
      await Promise.allSettled(
        invites.map((email: string) =>
          client.invitations.createInvitation({
            emailAddress: email,
            redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/sign-up`,
            ignoreExisting: true,
          })
        )
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[platform-complete] error:", err);
    return NextResponse.json({ error: "Setup failed. Please try again." }, { status: 500 });
  }
}
