import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, Eye, Megaphone, HardDrive } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [totalVideos, publishedVideos, draftVideos] = await Promise.all([
    prisma.video.count(),
    prisma.video.count({ where: { status: "PUBLISHED" } }),
    prisma.video.count({ where: { status: "DRAFT" } }),
  ]);

  const viewsResult = await prisma.video.aggregate({
    _sum: { views: true },
  });
  const totalViews = viewsResult._sum.views || 0;

  const activeAds = await prisma.ad.count({ where: { status: "ACTIVE" } });
  
  const latestVideos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const adPerformance = await prisma.ad.findMany({
    orderBy: { impressions: "desc" },
    take: 5,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVideos}</div>
            <p className="text-xs text-muted-foreground mt-1">{publishedVideos} published, {draftVideos} draft</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalViews >= 1000000 ? `${(totalViews / 1000000).toFixed(1)}M` : totalViews}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all videos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAds}</div>
            <p className="text-xs text-muted-foreground mt-1">Running campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Setup</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R2 Active</div>
            <p className="text-xs text-muted-foreground mt-1">Bucket: {process.env.R2_BUCKET_NAME || 'Not Configured'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Latest Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {latestVideos.map(video => (
                <div key={video.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-10 bg-muted rounded overflow-hidden">
                      <img src={video.thumbnailUrl || "/placeholder-video.jpg"} alt="" className="object-cover w-full h-full" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{video.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(video.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{video.views} views</div>
                </div>
              ))}
              {latestVideos.length === 0 && <p className="text-sm text-muted-foreground">No videos uploaded yet.</p>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ad Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {adPerformance.map((ad) => (
                <div key={ad.id} className="flex flex-col gap-1 border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{ad.name}</span>
                    <span className="text-muted-foreground">{ad.status}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{ad.impressions} Impr.</span>
                    <span>{ad.clicks} Clicks</span>
                  </div>
                </div>
              ))}
              {adPerformance.length === 0 && <p className="text-sm text-muted-foreground">No ads created yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
