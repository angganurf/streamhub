import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AdPlacement, AdType } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get("placement") as AdPlacement;
    const type = searchParams.get("type") as AdType | null;

    if (!placement) {
      return NextResponse.json({ error: "Missing placement" }, { status: 400 });
    }

    const ads = await prisma.ad.findMany({
      where: {
        status: "ACTIVE",
        placement: placement,
        ...(type ? { type } : {}),
      },
    });

    if (ads.length === 0) {
      return NextResponse.json({ ad: null });
    }

    // Pick a random ad from the active ones for this placement
    const randomAd = ads[Math.floor(Math.random() * ads.length)];

    return NextResponse.json({ ad: randomAd });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch ad" }, { status: 500 });
  }
}
