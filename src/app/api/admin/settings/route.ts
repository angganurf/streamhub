import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateR2Cache } from "@/lib/r2Client";

const R2_KEYS = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_PUBLIC_URL"];

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findMany({
      where: { key: { in: R2_KEYS } },
    });

    const result: Record<string, string> = {};
    for (const s of settings) {
      // Mask the secret key
      if (s.key === "R2_SECRET_ACCESS_KEY" && s.value) {
        result[s.key] = s.value.substring(0, 4) + "••••••••" + s.value.substring(s.value.length - 4);
      } else {
        result[s.key] = s.value;
      }
    }

    return NextResponse.json({ settings: result });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { settings } = body as { settings: Record<string, string> };

    if (!settings) {
      return NextResponse.json({ error: "Settings required" }, { status: 400 });
    }

    for (const [key, value] of Object.entries(settings)) {
      if (!R2_KEYS.includes(key)) continue;
      // Don't overwrite secret with masked version
      if (key === "R2_SECRET_ACCESS_KEY" && value.includes("••••")) continue;

      await prisma.siteSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    invalidateR2Cache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
