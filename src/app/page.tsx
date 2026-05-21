import { Header } from "@/components/public/header";
import { CategoryPills } from "@/components/public/category-pills";
import { VideoGrid } from "@/components/public/video-grid";
import { Pagination } from "@/components/public/pagination";
import { AdBanner } from "@/components/ads/AdBanner";
import { prisma } from "@/lib/prisma";
import { Globe } from "lucide-react";

export const revalidate = 60;

export default async function Home(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }
) {
  const searchParams = await props.searchParams;
  const page = parseInt((searchParams?.page as string) || "1", 10);
  const limit = 34; // exactly 34 videos as requested
  const skip = (page - 1) * limit;

  // Run count and fetch in parallel
  const [videos, totalCount] = await Promise.all([
    prisma.video.findMany({
      where: { status: "PUBLISHED", visibility: "PUBLIC" },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.video.count({
      where: { status: "PUBLISHED", visibility: "PUBLIC" },
    })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

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

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto">
        
        {/* Ad: Home Top */}
        <AdBanner placement="HOME_TOP" />

        {/* Page Title */}
        <div className="flex items-center gap-2 px-4 md:px-6 pt-6 pb-2">
          <h1 className="text-xl font-bold tracking-tight text-white">
            Trending videos Internationally
          </h1>
          <Globe className="h-5 w-5 text-[#2b82d9]" />
        </div>

        {/* Categories / Tags */}
        <div className="px-4 md:px-6">
          <CategoryPills />
        </div>

        {/* Ad: Home Middle */}
        <AdBanner placement="HOME_MIDDLE" />

        {/* Video Grid */}
        <div className="mt-4">
          {formattedVideos.length > 0 ? (
            <>
              <VideoGrid videos={formattedVideos} />
              <Pagination totalPages={totalPages} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <p className="text-xl font-bold">No videos found</p>
              <p className="text-sm">Be the first to upload a video!</p>
            </div>
          )}
        </div>

        {/* Ad: Home Sidebar (placed at bottom since there is no sidebar) */}
        <AdBanner placement="HOME_SIDEBAR" />
      </main>
    </div>
  );
}
