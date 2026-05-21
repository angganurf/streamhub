"use client";

import { useEffect, useRef } from "react";

interface Ad {
  id: string;
  scriptCode: string | null;
}

interface NativeBannerProps {
  ad: Ad;
}

export function NativeBanner({ ad }: NativeBannerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; width: 100%; height: 100%; overflow: hidden; }
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

  if (!ad || !ad.scriptCode) return null;

  return (
    <div className="w-full h-full min-h-[250px] relative rounded-xl overflow-hidden bg-muted group-hover:ring-1 ring-primary flex items-center justify-center">
      <span className="absolute -top-4 right-0 text-[9px] text-muted-foreground px-1 bg-background/80 rounded z-10 pointer-events-none">
        Advertisement
      </span>
      <iframe
        ref={iframeRef}
        width="100%"
        height="100%"
        style={{ minHeight: "250px" }}
        frameBorder="0"
        scrolling="no"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
        className="w-full h-full"
        title="Adsterra Native Banner"
      />
    </div>
  );
}
