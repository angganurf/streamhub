import { VideoCard, VideoProps } from "./video-card";
import { NativeBanner } from "../ads/NativeBanner";

interface Ad {
  id: string;
  scriptCode: string | null;
  gridPosition: number | null;
}

export function VideoGrid({ videos, gridAds = [] }: { videos: VideoProps[], gridAds?: Ad[] }) {
  const items: (VideoProps | Ad)[] = [];
  
  // Sort ads by gridPosition
  const sortedAds = [...gridAds].sort((a, b) => (a.gridPosition || 0) - (b.gridPosition || 0));
  
  let adIndex = 0;
  let videoCount = 0;

  for (let i = 0; i < videos.length; i++) {
    items.push(videos[i]);
    videoCount++;
    
    // Insert any ads that are meant to be exactly after this video
    while (adIndex < sortedAds.length && sortedAds[adIndex].gridPosition === videoCount) {
      items.push(sortedAds[adIndex]);
      adIndex++;
    }
  }

  // Append any remaining ads at the end if the video count is smaller than the grid position
  while (adIndex < sortedAds.length) {
    items.push(sortedAds[adIndex]);
    adIndex++;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 md:px-6 pb-12">
      {items.map((item, index) => {
        if ('scriptCode' in item) {
          return <NativeBanner key={item.id} ad={item as Ad} />;
        }
        return <VideoCard key={(item as VideoProps).id} video={item as VideoProps} />;
      })}
    </div>
  );
}
