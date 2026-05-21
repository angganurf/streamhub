import { S3Client } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";

let cachedClient: S3Client | null = null;
let cachedBucket = "";
let cachedPublicUrl = "";
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 1 minute

async function getSettingsFromDb(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.siteSettings.findMany();
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  } catch {
    return {};
  }
}

export async function getR2Config() {
  const now = Date.now();

  if (cachedClient && now - cacheTimestamp < CACHE_TTL) {
    return { client: cachedClient, bucket: cachedBucket, publicUrl: cachedPublicUrl };
  }

  const dbSettings = await getSettingsFromDb();

  const accountId = dbSettings["R2_ACCOUNT_ID"] || process.env.R2_ACCOUNT_ID || "";
  const accessKeyId = dbSettings["R2_ACCESS_KEY_ID"] || process.env.R2_ACCESS_KEY_ID || "";
  const secretAccessKey = dbSettings["R2_SECRET_ACCESS_KEY"] || process.env.R2_SECRET_ACCESS_KEY || "";
  const bucket = dbSettings["R2_BUCKET_NAME"] || process.env.R2_BUCKET_NAME || "";
  const publicUrl = dbSettings["R2_PUBLIC_URL"] || process.env.R2_PUBLIC_URL || "";

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
  });

  cachedClient = client;
  cachedBucket = bucket;
  cachedPublicUrl = publicUrl;
  cacheTimestamp = now;

  return { client, bucket, publicUrl };
}

export function invalidateR2Cache() {
  cachedClient = null;
  cacheTimestamp = 0;
}
