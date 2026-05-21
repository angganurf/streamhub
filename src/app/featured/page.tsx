import { Header } from "@/components/public/header";
import { CategoryPills } from "@/components/public/category-pills";
import { VideoGrid } from "@/components/public/video-grid";
import { prisma } from "@/lib/prisma";
import { PlaySquare } from "lucide-react";

export const revalidate = 60;

export default async function FeaturedPage() {
  const videos = await prisma.video.findMany({
    where: { 
      status: "PUBLISHED", 
      visibility: "PUBLIC",
      isFeatured: true
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

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
        <div className="flex items-center gap-2 px-4 md:px-6 pt-6 pb-2">
          <h1 className="text-xl font-bold tracking-tight text-white">
            Featured Videos
          </h1>
          <PlaySquare className="h-5 w-5 text-[#ffa31a]" />
        </div>

        <div className="px-4 md:px-6">
          <CategoryPills />
        </div>

        <div className="mt-4">
          {formattedVideos.length > 0 ? (
            <VideoGrid videos={formattedVideos} />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <p className="text-xl font-bold">No featured videos found</p>
              <p className="text-sm">Mark videos as featured in the Admin Panel.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
