import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adId, placement, videoId } = body;

    if (!adId || !placement) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // In a real scenario, you'd extract IP or UserAgent safely.
    // For now, we simulate logging.

    await prisma.adClick.create({
      data: {
        adId,
        placement,
        videoId,
      }
    });
    
    // Increment total clicks
    await prisma.ad.update({
      where: { id: adId },
      data: { clicks: { increment: 1 } }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to log click" }, { status: 500 });
  }
}
