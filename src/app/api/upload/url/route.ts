import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Config } from "@/lib/r2Client";

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Filename and contentType are required" }, { status: 400 });
    }

    const { client, bucket, publicUrl } = await getR2Config();

    if (!bucket) {
      return NextResponse.json({ error: "R2 bucket not configured. Go to Admin > CDN Settings." }, { status: 500 });
    }

    // Sanitize filename and create a unique key
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `uploads/${uniqueId}-${sanitizedName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

    return NextResponse.json({
      uploadUrl: presignedUrl,
      key,
      publicUrl: `${publicUrl}/${key}`,
    });
  } catch (error) {
    console.error("Presigned URL generation failed:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
