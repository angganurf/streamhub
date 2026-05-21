"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategoryAction(data: { name: string; slug: string; description?: string }) {
  try {
    await prisma.videoCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
      },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Failed to create category. Slug might already exist." };
  }
}

export async function updateCategoryAction(id: string, data: { name: string; slug: string; description?: string }) {
  try {
    await prisma.videoCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
      },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    // Unset category from videos first
    await prisma.video.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
    await prisma.videoCategory.delete({ where: { id } });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
