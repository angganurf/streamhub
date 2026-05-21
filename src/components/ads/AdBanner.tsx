"use client";

import { useEffect, useState } from "react";
import { Ad } from "@prisma/client";

interface AdBannerProps {
  placement: string;
}

export function AdBanner({ placement }: AdBannerProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch(`/api/ads/serve?placement=${placement}&type=BANNER`);
        if (res.ok) {
          const data = await res.json();
          setAd(data.ad);
          
          if (data.ad) {
            // Track impression
            await fetch('/api/ads/impression', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ adId: data.ad.id, placement })
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch ad", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [placement]);

  if (loading) return null;

  if (!ad) {
    // Development placeholder if no active ads
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="w-full flex items-center justify-center bg-muted/20 border border-muted min-h-[90px] rounded-lg">
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Advertisement ({placement})</span>
        </div>
      );
    }
    return null;
  }

  const handleClick = () => {
    // Track click
    fetch('/api/ads/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId: ad.id, placement })
    });
  };

  return (
    <div className="w-full flex justify-center my-4">
      <a href={ad.targetUrl || "#"} target="_blank" rel="noopener noreferrer" onClick={handleClick} className="block relative group">
        <span className="absolute -top-2 right-0 bg-background/80 text-[10px] text-muted-foreground px-1 rounded">AD</span>
        <img src={ad.imageUrl || "https://picsum.photos/seed/ad1/728/90"} alt={ad.title || "Advertisement"} className="max-w-full h-auto rounded-lg shadow-md group-hover:opacity-90 transition-opacity" />
      </a>
    </div>
  );
}
