"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getR2Config } from "@/lib/r2Client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function createVideoAction(data: {
  title: string;
  slug: string;
  description: string;
  categoryId?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  visibility: "PUBLIC" | "PRIVATE";
  seoTitle?: string;
  seoDescription?: string;
  videoKey: string;
  thumbnailKey: string;
  isFeatured?: boolean;
}) {
  try {
    const { publicUrl } = await getR2Config();
    const videoUrl = `${publicUrl}/${data.videoKey}`;
    const thumbnailUrl = `${publicUrl}/${data.thumbnailKey}`;

    const newVideo = await prisma.video.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || "",
        status: data.status,
        visibility: data.visibility,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        videoKey: data.videoKey,
        videoUrl,
        thumbnailKey: data.thumbnailKey,
        thumbnailUrl,
        duration: Math.floor(Math.random() * 600) + 60,
        isFeatured: data.isFeatured || false,
        ...((data.categoryId && data.categoryId !== "none") ? { categoryId: data.categoryId } : {}),
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/videos");

    return { success: true, video: newVideo };
  } catch (error) {
    console.error("Failed to create video:", error);
    return { success: false, error: "Database error" };
  }
}

export async function updateVideoAction(
  id: string,
  data: {
    title: string;
    slug: string;
    description?: string;
    categoryId?: string | null;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    visibility: "PUBLIC" | "PRIVATE";
    seoTitle?: string;
    seoDescription?: string;
    thumbnailKey?: string;
    isFeatured?: boolean;
  }
) {
  try {
    const updateData: Record<string, unknown> = {
      title: data.title,
      slug: data.slug,
      description: data.description || "",
      status: data.status,
      visibility: data.visibility,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      categoryId: data.categoryId === "none" ? null : (data.categoryId || null),
      isFeatured: data.isFeatured !== undefined ? data.isFeatured : undefined,
    };

    if (data.thumbnailKey) {
      const { publicUrl } = await getR2Config();
      updateData.thumbnailKey = data.thumbnailKey;
      updateData.thumbnailUrl = `${publicUrl}/${data.thumbnailKey}`;
    }

    await prisma.video.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/");
    revalidatePath("/admin/videos");
    revalidatePath(`/video/${data.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update video:", error);
    return { success: false, error: "Database error" };
  }
}

export async function deleteVideoAction(id: string) {
  try {
    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) return { success: false, error: "Video not found" };

    // Delete files from R2
    try {
      const { client, bucket } = await getR2Config();
      if (video.videoKey) {
        await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: video.videoKey }));
      }
      if (video.thumbnailKey) {
        await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: video.thumbnailKey }));
      }
    } catch (e) {
      console.error("Failed to delete R2 objects (continuing):", e);
    }

    // Delete related records first
    await prisma.video.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/admin/videos");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete video:", error);
    return { success: false, error: "Database error" };
  }
}
