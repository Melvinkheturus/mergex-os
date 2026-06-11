import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const existing = await db.changeLog.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 });
    }

    const updated = await db.$transaction(async (tx) => {
      // If popupEnabled is toggled to true, turn off other popups
      if (popupEnabled) {
        await tx.changeLog.updateMany({
          where: {
            id: { not: id },
            popupEnabled: true,
          },
          data: { popupEnabled: false },
        });
      }

      // Update release fields
      await tx.changeLog.update({
        where: { id },
        data: {
          version: version ?? existing.version,
          title: title ?? existing.title,
          description: description ?? existing.description,
          releaseDate: releaseDate ? new Date(releaseDate) : existing.releaseDate,
          type: type ?? existing.type,
          status: status ?? existing.status,
          popupEnabled: popupEnabled !== undefined ? !!popupEnabled : existing.popupEnabled,
          popupTitle: popupTitle !== undefined ? (popupTitle || null) : existing.popupTitle,
          popupDescription: popupDescription !== undefined ? (popupDescription || null) : existing.popupDescription,
        },
      });

      // If items are provided, replace them
      if (items && Array.isArray(items)) {
        // Delete all old items first
        await tx.changeLogItem.deleteMany({
          where: { changelogId: id },
        });

        // Insert new ones
        if (items.length > 0) {
          await tx.changeLogItem.createMany({
            data: items.map((item: any) => ({
              changelogId: id,
              type: item.type,
              category: item.category,
              subcategory: item.subcategory || null,
              description: item.description,
            })),
          });
        }
      }

      return tx.changeLog.findUnique({
        where: { id },
        include: { items: true },
      });
    });

    return NextResponse.json({ release: updated });
  } catch (error) {
    console.error("Failed to update release:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = user.role.name === "super_admin" || user.role.name === "admin";
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await db.changeLog.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete release:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
