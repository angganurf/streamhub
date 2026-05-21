"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getR2Config } from "@/lib/r2Client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function createAdAction(data: {
  name: string;
  type: string;
  provider: string;
  placement: string;
  status: string;
  title?: string;
  targetUrl?: string;
  imageKey?: string;
  imageUrl?: string;
  scriptCode?: string;
  bannerSize?: string;
}) {
  try {
    const { publicUrl } = await getR2Config();
    const imageUrl = data.imageKey ? `${publicUrl}/${data.imageKey}` : null;

    const ad = await prisma.ad.create({
      data: {
        name: data.name,
        type: data.type as Parameters<typeof prisma.ad.create>[0]["data"]["type"],
        provider: data.provider as Parameters<typeof prisma.ad.create>[0]["data"]["provider"],
        placement: data.placement as Parameters<typeof prisma.ad.create>[0]["data"]["placement"],
        status: data.status as Parameters<typeof prisma.ad.create>[0]["data"]["status"],
        title: data.title || null,
        targetUrl: data.targetUrl || null,
        imageKey: data.imageKey || null,
        imageUrl: data.imageUrl || imageUrl || null,
        scriptCode: data.scriptCode || null,
        bannerSize: data.bannerSize || null,
      },
    });

    revalidatePath("/admin/ads");
    return { success: true, ad };
  } catch (error) {
    console.error("Failed to create ad:", error);
    return { success: false, error: "Database error" };
  }
}

export async function updateAdAction(
  id: string,
  data: {
    name: string;
    type: string;
    provider: string;
    placement: string;
    status: string;
    title?: string;
    targetUrl?: string;
    imageKey?: string;
    imageUrl?: string;
    scriptCode?: string;
    bannerSize?: string;
  }
) {
  try {
    const updateData: Record<string, unknown> = {
      name: data.name,
      type: data.type,
      provider: data.provider,
      placement: data.placement,
      status: data.status,
      title: data.title || null,
      targetUrl: data.targetUrl || null,
      scriptCode: data.scriptCode || null,
      bannerSize: data.bannerSize || null,
    };

    if (data.imageUrl) {
      updateData.imageUrl = data.imageUrl;
    }

    if (data.imageKey) {
      const { publicUrl } = await getR2Config();
      updateData.imageKey = data.imageKey;
      updateData.imageUrl = `${publicUrl}/${data.imageKey}`;
    }

    await prisma.ad.update({ where: { id }, data: updateData });

    revalidatePath("/admin/ads");
    return { success: true };
  } catch (error) {
    console.error("Failed to update ad:", error);
    return { success: false, error: "Database error" };
  }
}

export async function deleteAdAction(id: string) {
  try {
    const ad = await prisma.ad.findUnique({ where: { id } });
    if (!ad) return { success: false, error: "Ad not found" };

    // Delete R2 files
    try {
      const { client, bucket } = await getR2Config();
      if (ad.imageKey) {
        await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: ad.imageKey }));
      }
      if (ad.videoKey) {
        await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: ad.videoKey }));
      }
    } catch (e) {
      console.error("Failed to delete R2 objects:", e);
    }

    await prisma.ad.delete({ where: { id } });

    revalidatePath("/admin/ads");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete ad:", error);
    return { success: false, error: "Database error" };
  }
}
