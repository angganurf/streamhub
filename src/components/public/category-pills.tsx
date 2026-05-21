"use client";

import { useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CategoryPills() {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Generic tags matching the requested visual layout style
  const defaultTags = [
    "best videos", "trending now", "new releases", "vlog", "gaming", 
    "music", "entertainment", "education", "movies", "sports",
    "documentary", "lifestyle", "technology", "comedy", "animation"
  ];

  const scroll = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group flex items-center py-3 w-full">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto no-scrollbar gap-2 scroll-smooth w-full"
      >
        {defaultTags.map((tag, idx) => (
          <button
            key={idx}
            className="whitespace-nowrap px-4 py-1.5 rounded-full bg-[#1a1a1a] hover:bg-[#333] text-gray-300 hover:text-white text-[13px] font-bold border border-[#333] hover:border-gray-500 transition-all capitalize tracking-wide"
          >
            {tag}
          </button>
        ))}
      </div>
      
      {/* Right Scroll Button */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end w-16 bg-gradient-to-l from-black to-transparent pointer-events-none">
        <button
          onClick={scroll}
          className="pointer-events-auto h-8 w-8 rounded-full bg-black border border-[#333] flex items-center justify-center text-white hover:bg-[#333] transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
