"use client";

import { useEffect, useState } from "react";
import { Ad } from "@prisma/client";

// This component safely renders active custom scripts/popunders from the database
export function PopunderScriptRenderer() {
  const [scripts, setScripts] = useState<Ad[]>([]);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const res = await fetch(`/api/ads/serve?placement=POPUNDER`); // Or GLOBAL_BODY
        if (res.ok) {
          const data = await res.json();
          // The API returns one random ad. If we wanted all active scripts, we'd need a different endpoint.
          // For simplicity, we just execute the one returned if it's a script.
          if (data.ad && data.ad.scriptCode) {
            setScripts([data.ad]);
            
            // Track impression
            await fetch('/api/ads/impression', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ adId: data.ad.id, placement: 'POPUNDER' })
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch ad scripts", e);
      }
    };
    fetchScripts();
  }, []);

  useEffect(() => {
    scripts.forEach(script => {
      try {
        // Note: using eval or new Function is dangerous. 
        // For safety, only admin can create these scripts.
        if (script.scriptCode) {
          const fn = new Function(script.scriptCode);
          fn();
        }
      } catch (e) {
        console.error("Failed to execute ad script", e);
      }
    });
  }, [scripts]);

  return null;
}
