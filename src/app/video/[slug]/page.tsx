import { notFound } from "next/navigation";
import { Header } from "@/components/public/header";
import { VideoPlayer } from "@/components/public/video-player";
import { AdBanner } from "@/components/ads/AdBanner";
import { PopunderScriptRenderer } from "@/components/ads/PopunderScriptRenderer";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Plus, Flag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { ShareButton } from "@/components/public/share-button";

export default async function VideoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch video from DB
  const video = await prisma.video.findUnique({
    where: { slug },
  });

  if (!video || video.status !== "PUBLISHED") {
    notFound();
  }

  // Increment views (In a high-traffic production app, this should be a client-side API call or buffered)
  await prisma.video.update({
    where: { id: video.id },
    data: { views: { increment: 1 } },
  });

  const channelName = "Admin User"; // Mocked channel name
  const viewsText = video.views >= 1000000 
    ? `${(video.views / 1000000).toFixed(1)}M views` 
    : video.views >= 1000 
      ? `${(video.views / 1000).toFixed(1)}K views` 
      : `${video.views} views`;
  const dateText = formatDistanceToNow(new Date(video.createdAt), { addSuffix: true });

  // Fetch related videos
  const relatedVideos = await prisma.video.findMany({
    where: { 
      status: "PUBLISHED", 
      visibility: "PUBLIC",
      id: { not: video.id }
    },
    take: 8,
    orderBy: { views: "desc" },
  });

  return (
    <>
      <Header />
      <PopunderScriptRenderer />
      
      <main className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          {/* Main Video Player */}
          <VideoPlayer 
            videoUrl={video.videoUrl || ""} 
            posterUrl={video.thumbnailUrl || undefined} 
            nextVideoUrl={relatedVideos[0] ? `/video/${relatedVideos[0].slug}` : undefined}
          />
          
          {/* Ad below player */}
          <AdBanner placement="VIDEO_AFTER_PLAYER" />

          {/* Video Metadata */}
          <div className="mt-4">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary overflow-hidden shrink-0">
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${channelName}`} alt={channelName} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg leading-tight">{channelName}</h3>
                  <p className="text-sm text-muted-foreground">145K subscribers</p>
                </div>
                <Button className="ml-4 rounded-full font-semibold">Subscribe</Button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                <div className="flex items-center bg-secondary rounded-full overflow-hidden">
                  <Button variant="ghost" className="px-4 hover:bg-secondary/80 rounded-none h-10 gap-2">
                    <ThumbsUp className="h-4 w-4" /> 24K
                  </Button>
                  <div className="w-[1px] h-6 bg-border" />
                  <Button variant="ghost" className="px-4 hover:bg-secondary/80 rounded-none h-10">
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
                <ShareButton />
                <Button variant="secondary" className="rounded-full gap-2">
                  <Plus className="h-4 w-4" /> Save
                </Button>
                <Button variant="secondary" size="icon" className="rounded-full shrink-0">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-6 bg-secondary/50 rounded-xl p-4">
              <div className="font-semibold text-sm flex gap-2">
                <span>{viewsText}</span>
                <span>•</span>
                <span>{dateText}</span>
              </div>
              <p className="mt-2 text-sm whitespace-pre-line">
                {video.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar / Related Videos */}
        <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 flex flex-col gap-4">
          <AdBanner placement="VIDEO_SIDEBAR" />
          <h3 className="font-bold text-lg">Related Videos</h3>
          <div className="flex flex-col gap-3">
            {relatedVideos.map((rv) => (
              <div key={rv.id} className="flex gap-3 group">
                <a href={`/video/${rv.slug}`} className="relative w-40 aspect-video shrink-0 rounded-lg overflow-hidden bg-muted group-hover:ring-1 ring-primary">
                  <img src={rv.thumbnailUrl || "/placeholder-video.jpg"} alt={rv.title} className="object-cover w-full h-full" />
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">
                    {rv.duration ? `${Math.floor(rv.duration / 60)}:${(rv.duration % 60).toString().padStart(2, '0')}` : '0:00'}
                  </div>
                </a>
                <div className="flex flex-col min-w-0">
                  <a href={`/video/${rv.slug}`} className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {rv.title}
                  </a>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{channelName}</p>
                  <p className="text-xs text-muted-foreground">{rv.views} views • {formatDistanceToNow(new Date(rv.createdAt), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
            {relatedVideos.length === 0 && (
              <p className="text-sm text-muted-foreground">No related videos found.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
