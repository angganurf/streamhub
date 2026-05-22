"use client";

import { useEffect } from "react";

export function AutoRedirectAd({ targetUrl, delaySeconds }: { targetUrl: string, delaySeconds: number }) {
  useEffect(() => {
    if (!targetUrl) return;
    
    const timeout = setTimeout(() => {
      window.location.href = targetUrl;
    }, delaySeconds * 1000);

    return () => clearTimeout(timeout);
  }, [targetUrl, delaySeconds]);

  return null;
}
