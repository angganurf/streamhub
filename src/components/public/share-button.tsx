"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ShareButton() {
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Set the dynamic URL on client-side mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger render={
        <Button variant="secondary" className="rounded-full gap-2 hover:bg-neutral-800 transition-colors h-10 px-4 cursor-pointer">
          <Share2 className="h-4 w-4" /> Share
        </Button>
      } />
      
      <DialogContent className="bg-[#101010] border border-[#232323] rounded-xl text-white max-w-md w-[calc(100%-2rem)] p-6 font-sans">
        <DialogHeader className="gap-1.5 pb-2">
          <DialogTitle className="text-white text-lg font-extrabold flex items-center gap-2">
            <Share2 className="h-5 w-5 text-[#ffa31a]" /> Share Video
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-xs font-semibold leading-normal">
            Copy the link below to share this premium video with others.
          </DialogDescription>
        </DialogHeader>

        {/* Link input and Copy button row */}
        <div className="flex items-center gap-2 mt-4">
          <input
            type="text"
            readOnly
            value={shareUrl || "Loading..."}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className="flex-1 bg-[#181818] border border-[#2c2c2c] rounded-md px-3 py-2 text-xs text-gray-300 font-semibold select-all h-9 flex items-center focus:outline-none focus:ring-1 focus:ring-[#ffa31a] focus:border-[#ffa31a]"
          />
          
          <button
            onClick={handleCopy}
            disabled={!shareUrl}
            className={`flex items-center gap-1.5 h-9 px-4 rounded-md font-bold text-xs cursor-pointer transition-all ${
              copied 
                ? "bg-[#22c55e] text-white" 
                : "bg-[#ffa31a] hover:bg-[#ffb74d] text-black"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
