import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function POST(request: Request) {
  try {
    const { accountId, accessKeyId, secretAccessKey, bucketName } = await request.json();

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const testClient = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
      requestChecksumCalculation: "WHEN_REQUIRED",
    });

    // Test access using ListObjectsV2 (only requires Object Read permissions)
    await testClient.send(new ListObjectsV2Command({ Bucket: bucketName, MaxKeys: 1 }));

    return NextResponse.json({ success: true, message: "Connection successful. Remember to configure CORS in Cloudflare Dashboard!" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
