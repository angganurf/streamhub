"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, ChevronRight, ChevronLeft, RotateCcw, BadgeCheck } from "lucide-react";
import Link from "next/link";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFiltersProps {
  currentCategory: {
    id: string;
    name: string;
    slug: string;
  };
  allCategories: CategoryItem[];
  totalCount: number;
}

const DURATION_STEPS = [0, 10, 20, 30, 40];

export function CategoryFilters({
  currentCategory,
  allCategories,
  totalCount,
}: CategoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Read initial states from URL
  const initialSort = searchParams.get("sort") || "featured";
  const initialProduction = searchParams.get("production") || "all";
  const initialDuration = searchParams.get("duration") || "0-40";
  const initialInclude = searchParams.get("include") || "";
  const initialExclude = searchParams.get("exclude") || "";

  // Parse duration range
  const parseDuration = (durStr: string) => {
    const [minStr, maxStr] = durStr.split("-");
    const minVal = parseInt(minStr, 10) || 0;
    const maxVal = parseInt(maxStr, 10) || 40;
    
    const minIdx = DURATION_STEPS.indexOf(minVal) === -1 ? 0 : DURATION_STEPS.indexOf(minVal);
    const maxIdx = DURATION_STEPS.indexOf(maxVal) === -1 ? 4 : DURATION_STEPS.indexOf(maxVal);
    return [minIdx, maxIdx];
  };

  const [initialMinIdx, initialMaxIdx] = parseDuration(initialDuration);

  // States
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"main" | "include" | "exclude">("main");
  const [sort, setSort] = useState(initialSort);
  const [production, setProduction] = useState(initialProduction);
  const [durationMinIdx, setDurationMinIdx] = useState(initialMinIdx);
  const [durationMaxIdx, setDurationMaxIdx] = useState(initialMaxIdx);
  
  // Selected category slugs
  const [includedSlugs, setIncludedSlugs] = useState<string[]>(
    initialInclude ? initialInclude.split(",").filter(Boolean) : []
  );
  const [excludedSlugs, setExcludedSlugs] = useState<string[]>(
    initialExclude ? initialExclude.split(",").filter(Boolean) : []
  );

  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setView("main");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (sort !== "featured") count++;
    if (production !== "all") count++;
    if (durationMinIdx !== 0 || durationMaxIdx !== 4) count++;
    if (includedSlugs.length > 0) count++;
    if (excludedSlugs.length > 0) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Reset Filters
  const handleReset = () => {
    setSort("featured");
    setProduction("all");
    setDurationMinIdx(0);
    setDurationMaxIdx(4);
    setIncludedSlugs([]);
    setExcludedSlugs([]);
  };

  // Apply Filters
  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Set or delete params
    if (sort !== "featured") params.set("sort", sort);
    else params.delete("sort");

    if (production !== "all") params.set("production", production);
    else params.delete("production");

    const minMin = DURATION_STEPS[durationMinIdx];
    const maxMin = DURATION_STEPS[durationMaxIdx];
    if (minMin !== 0 || maxMin !== 40) {
      params.set("duration", `${minMin}-${maxMin}`);
    } else {
      params.delete("duration");
    }

    if (includedSlugs.length > 0) {
      params.set("include", includedSlugs.join(","));
    } else {
      params.delete("include");
    }

    if (excludedSlugs.length > 0) {
      params.set("exclude", excludedSlugs.join(","));
    } else {
      params.delete("exclude");
    }

    // Reset to page 1 on filter apply
    params.set("page", "1");

    setIsOpen(false);
    setView("main");
    router.push(`${pathname}?${params.toString()}`);
  };

  // Slider dragging helper
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!popoverRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const pct = clickX / width;
    
    // Find closest step index (0 to 4)
    const stepIdx = Math.round(pct * 4);
    
    // Determine which handle is closer
    const distMin = Math.abs(stepIdx - durationMinIdx);
    const distMax = Math.abs(stepIdx - durationMaxIdx);
    
    if (distMin < distMax) {
      if (stepIdx <= durationMaxIdx) {
        setDurationMinIdx(stepIdx);
      }
    } else {
      if (stepIdx >= durationMinIdx) {
        setDurationMaxIdx(stepIdx);
      }
    }
  };

  // Get active categories list for tag pills
  const otherCategories = allCategories.filter(cat => cat.slug !== currentCategory.slug).slice(0, 10);

  return (
    <div className="relative w-full font-sans pb-4">
      {/* Filters Row */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 w-full select-none">
        {/* Trigger Button */}
        <button
          ref={triggerRef}
          onClick={() => {
            setIsOpen(!isOpen);
            setView("main");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[13px] border transition-all cursor-pointer shrink-0 ${
            isOpen || activeFiltersCount > 0
              ? "bg-black border-[#ffa31a] text-[#ffa31a] shadow-[0_0_10px_rgba(255,163,26,0.15)]"
              : "bg-[#141414] border-[#2c2c2c] text-gray-300 hover:text-white hover:border-gray-500"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="flex items-center justify-center h-4.5 w-4.5 rounded-full bg-[#ffa31a] text-black text-[10px] font-extrabold font-mono shrink-0 select-none">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-[#2c2c2c] shrink-0 mx-1"></div>

        {/* Scrollable Category Tags */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {otherCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="whitespace-nowrap px-4 py-1.5 rounded-full bg-[#141414] hover:bg-[#1a1a1a] text-gray-300 hover:text-white text-[13px] font-bold border border-[#2c2c2c] hover:border-gray-500 transition-all capitalize"
            >
              {cat.name.toLowerCase()}
            </Link>
          ))}
        </div>
      </div>

      {/* Popover Filter Drawer */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute left-0 mt-2 w-full max-w-[420px] bg-[#101010] border border-[#232323] rounded-lg shadow-2xl z-50 p-6 select-none font-sans"
        >
          {view === "main" && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* SECTION: Sort by */}
              <div>
                <h3 className="text-gray-300 text-sm font-bold flex items-center gap-1.5 mb-3 tracking-wide">
                  <span className="text-[#ffa31a] font-bold">⇅</span> Sort by
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "featured", label: "Featured Recently" },
                    { id: "views", label: "Most Viewed" },
                    { id: "rated", label: "Top Rated" },
                    { id: "hottest", label: "Hottest" },
                    { id: "longest", label: "Longest" },
                    { id: "newest", label: "Newest" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSort(item.id)}
                      className={`py-2 px-3 text-left text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                        sort === item.id
                          ? "bg-black border-[#ffa31a] text-[#ffa31a] shadow-[inset_0_0_8px_rgba(255,163,26,0.05)]"
                          : "bg-[#161616] border-[#222] text-gray-400 hover:text-white hover:border-[#444]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#202020]"></div>

              {/* SECTION: Filters title */}
              <div className="space-y-5">
                <h3 className="text-gray-300 text-sm font-bold flex items-center gap-1.5 tracking-wide">
                  <SlidersHorizontal className="h-4 w-4 text-[#ffa31a]" /> Filters
                </h3>

                {/* Production Toggle Group */}
                <div className="space-y-2">
                  <span className="text-gray-400 text-xs font-bold tracking-wide">Production</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "all", label: "All" },
                      { id: "professional", label: "Professional" },
                      { id: "homemade", label: "Homemade" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setProduction(item.id)}
                        className={`py-2 px-3 text-center text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                          production === item.id
                            ? "bg-black border-[#ffa31a] text-[#ffa31a]"
                            : "bg-[#161616] border-[#222] text-gray-400 hover:text-white hover:border-[#444]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Slider */}
                <div className="space-y-3 pt-1">
                  <span className="text-gray-400 text-xs font-bold tracking-wide">Duration</span>
                  <div className="px-2 pt-2">
                    {/* Range Slider Track */}
                    <div 
                      onClick={handleTrackClick}
                      className="relative h-1.5 w-full bg-[#2a2a2a] rounded-full cursor-pointer"
                    >
                      {/* Active Fill Track */}
                      <div
                        className="absolute h-full bg-[#ffa31a] rounded-full"
                        style={{
                          left: `${durationMinIdx * 25}%`,
                          width: `${(durationMaxIdx - durationMinIdx) * 25}%`,
                        }}
                      ></div>
                      
                      {/* Min Handle */}
                      <div
                        className="absolute top-1/2 h-4.5 w-4.5 bg-white border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                        style={{ left: `${durationMinIdx * 25}%` }}
                      ></div>

                      {/* Max Handle */}
                      <div
                        className="absolute top-1/2 h-4.5 w-4.5 bg-white border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                        style={{ left: `${durationMaxIdx * 25}%` }}
                      ></div>
                    </div>

                    {/* Slider Step Labels */}
                    <div className="flex justify-between mt-3 text-[10px] font-bold text-gray-500 tracking-wider">
                      <span>0</span>
                      <span>10</span>
                      <span>20</span>
                      <span>30</span>
                      <span>40+</span>
                    </div>
                  </div>
                </div>

                {/* Included Categories */}
                <div 
                  onClick={() => setView("include")}
                  className="flex items-center justify-between py-2 px-1 hover:bg-[#151515] rounded-md transition-colors cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="text-gray-300 text-xs font-bold">Included Categories</span>
                    <span className="text-[10px] text-gray-500 font-semibold mt-0.5">Choose up to 2 categories to include</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[#ffa31a] font-bold">
                      {includedSlugs.length > 0 
                        ? allCategories
                            .filter(c => includedSlugs.includes(c.slug))
                            .map(c => c.name)
                            .join(", ")
                        : "Mature"
                      }
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </div>
                </div>

                {/* Excluded Categories */}
                <div 
                  onClick={() => setView("exclude")}
                  className="flex items-center justify-between py-2 px-1 hover:bg-[#151515] rounded-md transition-colors cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="text-gray-300 text-xs font-bold">Excluded Categories</span>
                    <span className="text-[10px] text-gray-500 font-semibold mt-0.5">Choose up to 10 categories to exclude</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={excludedSlugs.length > 0 ? "text-[#ffa31a] font-bold" : "text-gray-500 font-bold"}>
                      {excludedSlugs.length > 0
                        ? allCategories
                            .filter(c => excludedSlugs.includes(c.slug))
                            .map(c => c.name)
                            .slice(0, 2)
                            .join(", ") + (excludedSlugs.length > 2 ? ` (+${excludedSlugs.length - 2})` : "")
                        : "None"
                      }
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#202020]"></div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#181818] hover:bg-[#222] border border-[#2c2c2c] text-gray-300 hover:text-white font-bold text-xs rounded-md cursor-pointer transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 py-2.5 px-5 bg-[#ffa31a] hover:bg-[#ffb74d] text-black font-extrabold text-xs rounded-md cursor-pointer transition-colors text-center"
                >
                  Show {totalCount.toLocaleString()} Results
                </button>
              </div>
            </div>
          )}

          {/* VIEW: Include Categories Selector */}
          {view === "include" && (
            <div className="space-y-4 animate-in slide-in-from-right-10 duration-200">
              <button 
                onClick={() => setView("main")}
                className="flex items-center gap-1 text-gray-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" /> Back to filters
              </button>
              <div>
                <h3 className="text-white text-sm font-bold tracking-wide">Include Categories</h3>
                <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Select up to 2 categories to search alongside</p>
              </div>
              
              <div className="max-h-[240px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                {allCategories.map((cat) => {
                  const isSelected = includedSlugs.includes(cat.slug);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        if (isSelected) {
                          setIncludedSlugs(includedSlugs.filter(s => s !== cat.slug));
                        } else {
                          if (includedSlugs.length < 2) {
                            setIncludedSlugs([...includedSlugs, cat.slug]);
                          }
                        }
                      }}
                      className={`flex items-center justify-between py-2 px-3 rounded-md border cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-black border-[#ffa31a] text-[#ffa31a]" 
                          : "bg-[#131313] border-[#222] text-gray-400 hover:text-white hover:border-[#444]"
                      }`}
                    >
                      <span className="text-xs font-bold capitalize">{cat.name.toLowerCase()}</span>
                      {isSelected && <BadgeCheck className="h-4 w-4 text-[#ffa31a]" />}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setView("main")}
                className="w-full py-2 bg-[#ffa31a] text-black font-extrabold text-xs rounded-md text-center cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {/* VIEW: Exclude Categories Selector */}
          {view === "exclude" && (
            <div className="space-y-4 animate-in slide-in-from-right-10 duration-200">
              <button 
                onClick={() => setView("main")}
                className="flex items-center gap-1 text-gray-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" /> Back to filters
              </button>
              <div>
                <h3 className="text-white text-sm font-bold tracking-wide">Exclude Categories</h3>
                <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Select up to 10 categories to completely hide from results</p>
              </div>
              
              <div className="max-h-[240px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                {allCategories.map((cat) => {
                  const isSelected = excludedSlugs.includes(cat.slug);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        if (isSelected) {
                          setExcludedSlugs(excludedSlugs.filter(s => s !== cat.slug));
                        } else {
                          if (excludedSlugs.length < 10) {
                            setExcludedSlugs([...excludedSlugs, cat.slug]);
                          }
                        }
                      }}
                      className={`flex items-center justify-between py-2 px-3 rounded-md border cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-black border-[#ef4444] text-[#ef4444]" 
                          : "bg-[#131313] border-[#222] text-gray-400 hover:text-white hover:border-[#444]"
                      }`}
                    >
                      <span className="text-xs font-bold capitalize">{cat.name.toLowerCase()}</span>
                      {isSelected && <span className="text-[#ef4444] text-xs font-extrabold font-mono">✕</span>}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setView("main")}
                className="w-full py-2 bg-[#ffa31a] text-black font-extrabold text-xs rounded-md text-center cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
