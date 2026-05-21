"use client";

import { useEffect } from "react";

// Component to dynamically inject Adsterra global scripts (Popunder / Social Bar)
export function GlobalAdsRenderer() {
  useEffect(() => {
    let mounted = true;

    const fetchAndInjectAds = async () => {
      try {
        // Fetch POPUNDER
        const popunderRes = await fetch(`/api/ads/serve?placement=GLOBAL_HEAD`);
        if (popunderRes.ok) {
          const data = await popunderRes.json();
          if (mounted && data.ad && data.ad.scriptCode) {
            injectScript(data.ad.scriptCode, "head", data.ad.id, "GLOBAL_HEAD");
          }
        }

        // Fetch SOCIAL_BAR
        const socialBarRes = await fetch(`/api/ads/serve?placement=GLOBAL_BODY`);
        if (socialBarRes.ok) {
          const data = await socialBarRes.json();
          if (mounted && data.ad && data.ad.scriptCode) {
            injectScript(data.ad.scriptCode, "body", data.ad.id, "GLOBAL_BODY");
          }
        }
      } catch (e) {
        console.error("Failed to fetch global ads", e);
      }
    };

    const injectScript = (scriptString: string, target: "head" | "body", adId: string, placement: string) => {
      // Basic parser to extract src from string like <script src="..."></script>
      const srcMatch = scriptString.match(/src=["'](.*?)["']/);
      if (srcMatch && srcMatch[1]) {
        const script = document.createElement("script");
        script.src = srcMatch[1];
        script.async = true;
        script.onload = () => {
          // Track impression once loaded
          fetch('/api/ads/impression', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adId, placement })
          }).catch(console.error);
        };
        
        if (target === "head") {
          document.head.appendChild(script);
        } else {
          document.body.appendChild(script);
        }
      } else {
        // If it's inline code (fallback)
        const script = document.createElement("script");
        script.innerHTML = scriptString.replace(/<script[^>]*>/, "").replace(/<\/script>/, "");
        if (target === "head") {
          document.head.appendChild(script);
        } else {
          document.body.appendChild(script);
        }
      }
    };

    fetchAndInjectAds();

    return () => {
      mounted = false;
    };
  }, []);

  return null;
}
