import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDrafts = searchParams.get("includeDrafts") === "true";
    
    // Auth check if drafts are requested
    let canSeeDrafts = false;
    if (includeDrafts) {
      const user = await getCurrentUser();
      if (user && (user.role.name === "super_admin" || user.role.name === "admin")) {
        canSeeDrafts = true;
      }
    }

    const releases = await db.changeLog.findMany({
      where: canSeeDrafts ? {} : { status: "published" },
      orderBy: { releaseDate: "desc" },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ releases });
  } catch (error) {
    console.error("Failed to fetch releases:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = user.role.name === "super_admin" || user.role.name === "admin";
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      version,
      title,
      description,
      releaseDate,
      type,
      status,
      popupEnabled,
      popupTitle,
      popupDescription,
      items,
    } = body;

    if (!version || !title) {
      return NextResponse.json({ error: "Version and Title are required" }, { status: 400 });
    }

    // Start transaction
    const release = await db.$transaction(async (tx) => {
      // If popupEnabled is true, turn off all other popups
      if (popupEnabled) {
        await tx.changeLog.updateMany({
          where: { popupEnabled: true },
          data: { popupEnabled: false },
        });
      }

      return tx.changeLog.create({
        data: {
          version,
          title,
          description,
          releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
          type: type || "minor",
          status: status || "published",
          popupEnabled: !!popupEnabled,
          popupTitle: popupTitle || null,
          popupDescription: popupDescription || null,
          items: {
            create: (items || []).map((item: any) => ({
              type: item.type,
              category: item.category,
              subcategory: item.subcategory || null,
              description: item.description,
            })),
          },
        },
        include: {
          items: true,
        },
      });
    });

    return NextResponse.json({ release });
  } catch (error: any) {
    console.error("Failed to create release:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Version already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
