"use server";

import { prisma } from "@/lib/prisma";

export async function getSidebarCategories() {
  try {
    const categories = await prisma.videoCategory.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
    return { success: true, categories };
  } catch (error) {
    console.error("Failed to fetch sidebar categories:", error);
    return { success: false, categories: [] };
  }
}

export async function getMegaMenuCategories() {
  try {
    const categories = await prisma.videoCategory.findMany({
      orderBy: {
        videos: {
          _count: 'desc'
        }
      },
      take: 12,
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { videos: true }
        },
        videos: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { thumbnailUrl: true }
        }
      }
    });

    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      videoCount: cat._count.videos,
      thumbnailUrl: cat.videos[0]?.thumbnailUrl || "/placeholder-video.jpg"
    }));

    return { success: true, categories: formattedCategories };
  } catch (error) {
    console.error("Failed to fetch mega menu categories:", error);
    return { success: false, categories: [] };
  }
}

export interface GetCategoryPageDataParams {
  slug: string;
  page?: number;
  limit?: number;
  sort?: string;
  production?: string;
  duration?: string;
  include?: string;
  exclude?: string;
}

export async function getCategoryPageData({
  slug,
  page = 1,
  limit = 32,
  sort = "featured",
  production = "all",
  duration = "0-40",
  include = "",
  exclude = ""
}: GetCategoryPageDataParams) {
  try {
    // 1. Fetch current category details
    const currentCategory = await prisma.videoCategory.findUnique({
      where: { slug },
    });

    if (!currentCategory) {
      return { success: false, error: "Category not found" };
    }

    // 2. Fetch all categories (to populate include/exclude selectors)
    const allCategories = await prisma.videoCategory.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      }
    });

    // 3. Build query filter conditions
    const where: any = {
      status: "PUBLISHED",
      visibility: "PUBLIC",
    };

    // Category inclusion (default to active category, plus optional included ones)
    let categoryIds = [currentCategory.id];
    if (include) {
      const includeSlugs = include.split(",").filter(Boolean);
      if (includeSlugs.length > 0) {
        const includedCats = await prisma.videoCategory.findMany({
          where: { slug: { in: includeSlugs } },
          select: { id: true }
        });
        const includedIds = includedCats.map(c => c.id);
        categoryIds = Array.from(new Set([...categoryIds, ...includedIds]));
      }
    }

    // Category exclusion
    let excludeIds: string[] = [];
    if (exclude) {
      const excludeSlugs = exclude.split(",").filter(Boolean);
      if (excludeSlugs.length > 0) {
        const excludedCats = await prisma.videoCategory.findMany({
          where: { slug: { in: excludeSlugs } },
          select: { id: true }
        });
        excludeIds = excludedCats.map(c => c.id);
      }
    }

    // Combine category ids
    const activeCategoryIds = categoryIds.filter(id => !excludeIds.includes(id));
    where.categoryId = { in: activeCategoryIds };

    // Duration filter mapping (in minutes)
    if (duration) {
      const [minStr, maxStr] = duration.split("-");
      const minMin = parseInt(minStr, 10) || 0;
      const maxMin = parseInt(maxStr, 10) || 40;
      
      const minSec = minMin * 60;
      if (maxMin >= 40) {
        // 40+ minutes: only filter lower bound
        where.duration = { gte: minSec };
      } else {
        const maxSec = maxMin * 60;
        where.duration = { gte: minSec, lte: maxSec };
      }
    }

    // Production type filter (mocked via title & description keyword search)
    if (production === "homemade") {
      where.OR = [
        { title: { contains: "homemade", mode: "insensitive" } },
        { title: { contains: "amateur", mode: "insensitive" } },
        { title: { contains: "real", mode: "insensitive" } },
        { description: { contains: "homemade", mode: "insensitive" } },
        { description: { contains: "amateur", mode: "insensitive" } },
        { description: { contains: "real", mode: "insensitive" } },
      ];
    } else if (production === "professional") {
      where.NOT = [
        { title: { contains: "homemade", mode: "insensitive" } },
        { title: { contains: "amateur", mode: "insensitive" } },
        { title: { contains: "real", mode: "insensitive" } },
        { description: { contains: "homemade", mode: "insensitive" } },
        { description: { contains: "amateur", mode: "insensitive" } },
        { description: { contains: "real", mode: "insensitive" } },
      ];
    }

    // 4. Determine ordering
    let orderBy: any = { createdAt: "desc" };
    if (sort === "views") {
      orderBy = { views: "desc" };
    } else if (sort === "rated" || sort === "hottest") {
      // Sort by views desc, isFeatured desc as a mock for popularity/rating
      orderBy = [
        { views: "desc" },
        { isFeatured: "desc" }
      ];
    } else if (sort === "longest") {
      orderBy = { duration: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "featured") {
      orderBy = [
        { isFeatured: "desc" },
        { createdAt: "desc" }
      ];
    }

    // 5. Execute paginated query
    const skip = (page - 1) * limit;
    const take = limit;

    const [videos, totalCount] = await Promise.all([
      prisma.video.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.video.count({
        where,
      })
    ]);

    // Format videos to match VideoProps schema
    const formattedVideos = videos.map(v => ({
      id: v.id,
      slug: v.slug,
      title: v.title,
      thumbnailUrl: v.thumbnailUrl || "/placeholder-video.jpg",
      duration: v.duration || 0,
      views: v.views,
      channelName: "Admin User",
      createdAt: v.createdAt,
    }));

    return {
      success: true,
      category: currentCategory,
      videos: formattedVideos,
      totalCount,
      allCategories,
    };

  } catch (error) {
    console.error("Failed to fetch category page data:", error);
    return { success: false, error: "Database error" };
  }
}

