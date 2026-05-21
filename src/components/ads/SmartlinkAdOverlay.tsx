"use client";

import { useState, useEffect } from "react";
import { Ad } from "@prisma/client";

interface SmartlinkAdOverlayProps {
  onDismiss: () => void;
  posterUrl?: string;
}

export function SmartlinkAdOverlay({ onDismiss, posterUrl }: SmartlinkAdOverlayProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchAd = async () => {
      try {
        const res = await fetch(`/api/ads/serve?placement=VIDEO_BEFORE_PLAYER`);
        if (res.ok) {
          const data = await res.json();
          // Filter to only SMARTLINK types if the API returns something else
          if (mounted && data.ad && data.ad.type === "SMARTLINK") {
            setAd(data.ad);
          } else {
            // No smartlink found, just play video
            if (mounted) onDismiss();
          }
        } else {
          if (mounted) onDismiss();
        }
      } catch (e) {
        console.error("Failed to fetch smartlink ad", e);
        if (mounted) onDismiss();
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAd();

    return () => {
      mounted = false;
    };
  }, [onDismiss]);

  const handleClick = async () => {
    if (!ad) return;

    // Track click
    try {
      await fetch('/api/ads/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id, placement: 'VIDEO_BEFORE_PLAYER' })
      });
    } catch (e) {
      console.error(e);
    }

    // Open link in new tab
    if (ad.targetUrl) {
      window.open(ad.targetUrl, "_blank", "noopener,noreferrer");
    }

    // Dismiss overlay so video can play
    onDismiss();
  };

  if (loading) {
    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!ad) {
    return null; // Should have already called onDismiss
  }

  // Impression tracking
  useEffect(() => {
    fetch('/api/ads/impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId: ad.id, placement: 'VIDEO_BEFORE_PLAYER' })
    }).catch(console.error);
  }, [ad.id]);

  return (
    <div 
      onClick={handleClick}
      className="absolute inset-0 z-50 cursor-pointer bg-black/80 flex items-center justify-center overflow-hidden group"
    >
      {/* Background Poster (optional blur) */}
      {posterUrl && (
        <img 
          src={posterUrl} 
          alt="Video Thumbnail" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm pointer-events-none"
        />
      )}

      {/* Adsterra Smartlink Overlay Image */}
      <div className="relative z-10 max-w-[80%] max-h-[80%] flex flex-col items-center justify-center transition-transform transform group-hover:scale-105 duration-300">
        <img 
          src={ad.imageUrl || "https://picsum.photos/seed/ad-thumb/800/450"} 
          alt="Advertisement" 
          className="rounded-xl shadow-2xl object-contain max-h-[60vh] border border-white/10"
        />
        
        {/* Play Icon Hint (since user expects to click to play video) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 rounded-xl">
           <div className="h-16 w-16 rounded-full bg-[#ffa31a]/90 text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,163,26,0.5)]">
            <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current ml-1" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 text-[10px] text-white/50 uppercase tracking-widest px-2 py-1 bg-black/40 rounded backdrop-blur-sm pointer-events-none z-20">
        Advertisement
      </div>
    </div>
  );
}
