import { VideoCard, VideoProps } from "./video-card";

export function VideoGrid({ videos }: { videos: VideoProps[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 md:px-6 pb-12">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
