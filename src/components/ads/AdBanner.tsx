"use client";

import { useEffect, useState, useRef } from "react";

interface Ad {
  id: string;
  name: string;
  type: string;
  placement: string;
  status: string;
  title: string | null;
  targetUrl: string | null;
  imageUrl: string | null;
  scriptCode: string | null;
  bannerSize: string | null;
}

interface AdBannerProps {
  placement: string;
}

export function AdBanner({ placement }: AdBannerProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let mounted = true;
    const fetchAd = async () => {
      try {
        const res = await fetch(`/api/ads/serve?placement=${placement}&type=BANNER`);
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.ad) {
            setAd(data.ad);
          }
        }
      } catch (error) {
        console.error("Failed to fetch ad", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAd();
    return () => { mounted = false; };
  }, [placement]);

  useEffect(() => {
    // Inject Adsterra script securely into iframe
    if (ad && ad.scriptCode && iframeRef.current) {
      const doc = iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; }
              </style>
            </head>
            <body>
              ${ad.scriptCode}
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [ad]);

  if (loading) return null;

  if (!ad || !ad.scriptCode) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="w-full flex items-center justify-center bg-muted/20 border border-muted min-h-[90px] rounded-lg">
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Adsterra Banner ({placement})</span>
        </div>
      );
    }
    return null;
  }

  // Parse width and height from bannerSize string (e.g. "728x90")
  let width = 728;
  let height = 90;
  if (ad.bannerSize) {
    const parts = ad.bannerSize.split('x');
    if (parts.length === 2) {
      width = parseInt(parts[0], 10) || 728;
      height = parseInt(parts[1], 10) || 90;
    }
  }

  return (
    <div className="w-full flex justify-center my-4 overflow-hidden">
      <div className="relative group" style={{ width, height }}>
        <span className="absolute -top-4 right-0 text-[9px] text-muted-foreground px-1 bg-background/80 rounded z-10 pointer-events-none">
          Advertisement
        </span>
        <iframe
          ref={iframeRef}
          width={width}
          height={height}
          frameBorder="0"
          scrolling="no"
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
          className="rounded-md"
          title={`Adsterra Banner ${ad.bannerSize}`}
        />
        {/* We use an overlay to capture clicks for our own tracking if needed, 
            but Adsterra scripts inside the iframe will handle their own clicks/popups.
            To avoid blocking the iframe interaction, we don't put an overlay over it. */}
      </div>
    </div>
  );
}
