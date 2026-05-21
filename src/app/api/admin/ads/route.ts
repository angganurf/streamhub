import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const ads = await prisma.ad.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ ads });
  } catch (error) {
    console.error("Failed to fetch ads:", error);
    return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 });
  }
}
