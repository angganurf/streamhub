"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface CategoryPaginationProps {
  currentCategoryName: string;
  currentPage: number;
  totalCount: number;
  limit: number;
  allCategories: CategoryItem[];
}

export function CategoryPagination({
  currentCategoryName,
  currentPage,
  totalCount,
  limit,
  allCategories,
}: CategoryPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const totalPages = Math.ceil(totalCount / limit);

  // If there's only 1 page, we can still render the pagination layout 
  // to preserve visual styling but make numbers simple.
  const activePages = totalPages || 1;

  // Generate page numbers range matching Screenshot 3 styling 
  // (e.g. 1, 2, 3, 4, 5, 10)
  const getPageNumbers = () => {
    const pages: number[] = [];
    
    // Always render 1 to 5 if available
    const maxVisible = Math.min(activePages, 5);
    for (let i = 1; i <= maxVisible; i++) {
      pages.push(i);
    }
    
    // If total pages is larger than 5, render the last page too (like "10" in the screenshot)
    if (activePages > 5) {
      if (!pages.includes(activePages)) {
        pages.push(activePages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Create page link merging current query parameters
  const createPageUrl = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  // Frequently combined categories (take other categories for recommendations)
  const combinedCategories = allCategories
    .filter(cat => cat.name.toLowerCase() !== currentCategoryName.toLowerCase())
    .slice(0, 10);

  return (
    <div className="w-full flex flex-col items-center gap-8 py-10 border-t border-[#1a1a1a] select-none font-sans mt-8">
      
      {/* SECTION: Frequently Combined With */}
      {combinedCategories.length > 0 && (
        <div className="w-full flex flex-col items-center gap-4 text-center">
          <h3 className="text-white text-base md:text-lg font-extrabold tracking-wide capitalize">
            {currentCategoryName.toLowerCase()} Is Frequently Combined With:
          </h3>
          <div className="flex flex-wrap justify-center gap-2 max-w-[900px] px-4">
            {combinedCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="px-3.5 py-1.5 rounded bg-[#121212] hover:bg-[#1f1f1f] text-gray-300 hover:text-white text-[12px] font-bold transition-all capitalize hover:scale-105"
              >
                {cat.name.toLowerCase()}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: Pagination Controls */}
      <div className="flex items-center justify-center gap-2 md:gap-3 mt-2 px-4">
        {/* Prev Button */}
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="px-4 py-2 text-sm font-bold text-gray-300 hover:text-white transition-colors"
          >
            Prev
          </Link>
        ) : (
          <span className="px-4 py-2 text-sm font-bold text-[#3a3a3a] cursor-not-allowed select-none">
            Prev
          </span>
        )}

        {/* Page Numbers */}
        <div className="flex items-center gap-1.5">
          {pageNumbers.map((page, index) => {
            const isActive = currentPage === page;
            const isLastVisibleIdx = index === pageNumbers.length - 1;
            const showEllipsis = isLastVisibleIdx && activePages > 5 && pageNumbers[index - 1] < page - 1;

            return (
              <div key={page} className="flex items-center gap-1.5">
                {showEllipsis && (
                  <span className="text-gray-600 text-xs font-bold px-1 select-none">...</span>
                )}
                <Link
                  href={createPageUrl(page)}
                  className={`flex items-center justify-center h-9 w-9 text-sm font-extrabold rounded-xs transition-all ${
                    isActive
                      ? "bg-[#141414] text-white outline outline-2 outline-[#ffa31a] outline-offset-0"
                      : "bg-[#121212] text-gray-400 hover:text-white hover:bg-[#202020] border border-transparent"
                  }`}
                >
                  {page}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Next Button */}
        {currentPage < activePages ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="ml-2 px-6 py-2 bg-[#ffa31a] hover:bg-[#ffb74d] text-black font-extrabold text-sm rounded-md transition-colors"
          >
            Next
          </Link>
        ) : (
          <span className="ml-2 px-6 py-2 bg-[#1f1f1f] text-gray-500 font-extrabold text-sm rounded-md cursor-not-allowed select-none">
            Next
          </span>
        )}
      </div>
      
    </div>
  );
}
