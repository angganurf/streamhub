"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { Ad } from "@prisma/client";

interface VideoPreRollAdProps {
  onComplete: () => void;
  posterUrl?: string;
}

export function VideoPreRollAd({ onComplete, posterUrl }: VideoPreRollAdProps) {
  const [skipTimeLeft, setSkipTimeLeft] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch(`/api/ads/serve?placement=VIDEO_PREROLL&type=VIDEO_PREROLL`);
        if (res.ok) {
          const data = await res.json();
          if (data.ad) {
            setAd(data.ad);
            setIsPlaying(true); // Auto-play since user already clicked Play on main player
            
            // Track impression in background immediately
            fetch('/api/ads/impression', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ adId: data.ad.id, placement: 'VIDEO_PREROLL' })
            }).catch(err => console.error("Failed to track ad impression", err));
          } else {
            // No pre-roll ad, skip immediately
            onComplete();
          }
        } else {
          onComplete();
        }
      } catch (error) {
        console.error("Failed to fetch pre-roll ad", error);
        onComplete();
      } finally {
        setLoading(false);
      }
    };
    fetchAd();
  }, [onComplete]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && skipTimeLeft > 0) {
      timer = setTimeout(() => {
        setSkipTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, skipTimeLeft]);

  const handlePlay = async () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
    if (ad) {
      // Track impression
      await fetch('/api/ads/impression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id, placement: 'VIDEO_PREROLL' })
      });
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleEnded = () => {
    onComplete();
  };
  
  const handleClick = () => {
    if (ad) {
      fetch('/api/ads/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id, placement: 'VIDEO_PREROLL' })
      });
      if (ad.targetUrl) {
        window.open(ad.targetUrl, "_blank");
      }
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 bg-[#0c0c0c] flex items-center justify-center z-10 select-none">
        {posterUrl ? (
          <img 
            src={posterUrl} 
            alt="Loading..." 
            className="absolute inset-0 object-cover w-full h-full opacity-40 pointer-events-none"
          />
        ) : null}
        <Loader2 className="h-10 w-10 text-[#ffa31a] animate-spin z-20 animate-duration-1000" />
      </div>
    );
  }
  if (!ad) return null; // Defensive check

  if (!isPlaying) {
    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
        <img src={ad.imageUrl || "https://picsum.photos/seed/ad-thumb/1280/720"} className="absolute inset-0 opacity-50 object-cover w-full h-full" alt="Ad Thumbnail" />
        <Button onClick={handlePlay} size="lg" className="z-20 rounded-full h-20 w-20 bg-primary/90 hover:bg-primary text-white">
          <Play className="h-10 w-10 ml-2" />
        </Button>
        <span className="absolute bottom-4 left-4 text-xs text-white bg-black/60 px-2 py-1 rounded">Advertisement</span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black z-10 flex flex-col cursor-pointer" onClick={handleClick}>
      <video
        ref={videoRef}
        src={ad.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
        className="w-full h-full object-contain"
        onEnded={handleEnded}
        controls={false}
        autoPlay
        onClick={(e) => {
          // Prevent pausing when clicking the video (to open ad URL)
          e.preventDefault();
        }}
      />
      <div className="absolute bottom-6 right-6 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {skipTimeLeft > 0 ? (
          <div className="bg-black/70 text-white px-4 py-2 rounded-md text-sm border border-white/20 cursor-default">
            Skip in {skipTimeLeft}s
          </div>
        ) : (
          <Button onClick={handleSkip} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20 z-20">
            Skip Ad
          </Button>
        )}
      </div>
      <span className="absolute top-4 left-4 text-xs text-white bg-black/60 px-2 py-1 rounded">Advertisement</span>
    </div>
  );
}
