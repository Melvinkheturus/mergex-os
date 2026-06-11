import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const latestPopup = await db.changeLog.findFirst({
      where: {
        status: "published",
        popupEnabled: true,
      },
      include: {
        items: true,
      },
      orderBy: {
        releaseDate: "desc",
      },
    });

    return NextResponse.json({ release: latestPopup });
  } catch (error) {
    console.error("Failed to fetch latest popup release:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
