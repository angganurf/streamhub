import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { BadgeCheck, Eye, MoreVertical } from "lucide-react";

export interface VideoProps {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  views: number;
  channelName: string;
  createdAt: Date;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatViews(views: number) {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
}

export function VideoCard({ video }: { video: VideoProps }) {
  return (
    <div className="group flex flex-col gap-1.5 relative w-full font-sans">
      <Link href={`/video/${video.slug}`} className="relative aspect-video overflow-hidden bg-[#1a1a1a] rounded-[2px] transition-all">
        <img 
          src={video.thumbnailUrl || "/placeholder-video.jpg"} 
          alt={video.title}
          className="object-cover w-full h-full hover:opacity-80 transition-opacity duration-200"
        />
        <div className="absolute bottom-1 right-1 bg-black/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm tabular-nums tracking-wider">
          {formatDuration(video.duration)}
        </div>
      </Link>
      
      <div className="flex flex-col mt-1 px-1">
        {/* Row 1: Uploader, Checkmark, Views */}
        <div className="flex items-center justify-between text-xs mb-1">
          <Link href={`/channel/${video.channelName.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-1 text-[#a3a3a3] hover:text-white transition-colors truncate max-w-[70%]">
            <span className="truncate">{video.channelName}</span>
            <BadgeCheck className="h-3.5 w-3.5 text-[#2b82d9] shrink-0" strokeWidth={2.5} />
          </Link>
          <div className="flex items-center gap-1 text-[#888] shrink-0">
            <Eye className="h-3.5 w-3.5" />
            <span className="font-bold text-[10px] tracking-wider">{formatViews(video.views)}</span>
          </div>
        </div>

        {/* Row 2: Title and Options */}
        <div className="flex items-start justify-between gap-2">
          <Link href={`/video/${video.slug}`} className="text-[#e0e0e0] font-semibold text-[13px] leading-snug line-clamp-2 hover:text-[#ffa31a] transition-colors">
            {video.title}
          </Link>
          <button className="text-[#888] hover:text-white transition-colors shrink-0 pt-0.5">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
