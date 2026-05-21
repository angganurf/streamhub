"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getMegaMenuCategories } from "@/actions/categories";

interface Category {
  id: string;
  name: string;
  slug: string;
  videoCount: number;
  thumbnailUrl: string;
}

export function CategoryMegaMenu({ 
  children, 
  isActive 
}: { 
  children: React.ReactNode; 
  isActive: boolean;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchCats() {
      const res = await getMegaMenuCategories();
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    }
    fetchCats();
  }, []);

  return (
    <div 
      className="group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className={`whitespace-nowrap px-4 py-3 hover:text-white transition-colors border-b-2 cursor-pointer flex items-center gap-1 ${
        isActive ? "border-[#ffa31a] text-white" : "border-transparent"
      }`}>
        {children}
        <span className="text-[10px] translate-y-[1px]">▼</span>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full w-full bg-black border-t border-[#333] z-50 shadow-2xl cursor-default pb-8">
          <div className="max-w-[1600px] mx-auto w-full px-4 py-6">
            
            <div className="flex gap-12">
              
              {/* Left Side: Most Popular Categories */}
              <div className="flex-1">
                <Link href="/categories" className="inline-flex items-center gap-1 mb-4 hover:text-white group/title">
                  <h3 className="text-white text-base font-bold">Most Popular</h3>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover/title:text-white transition-colors" />
                </Link>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {categories.map((cat) => (
                    <Link 
                      key={cat.id} 
                      href={`/category/${cat.slug}`}
                      className="group/item relative rounded-sm overflow-hidden aspect-[4/3] bg-[#1a1a1a]"
                    >
                      <img 
                        src={cat.thumbnailUrl} 
                        alt={cat.name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-105 opacity-90 group-hover/item:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 z-10">
                        <div className="text-white font-bold text-[13px] drop-shadow-md capitalize truncate">{cat.name}</div>
                        <div className="text-gray-400 text-[10px] font-semibold">{cat.videoCount.toLocaleString()} Videos</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
