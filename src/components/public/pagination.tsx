"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  totalPages: number;
}

export function Pagination({ totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const safeTotalPages = Math.max(1, totalPages);

  // Logic to build pagination array (like 1, 2, 3, 4, 5, ..., 10)
  const getPages = () => {
    const pages = [];
    if (safeTotalPages <= 7) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', safeTotalPages);
      } else if (currentPage >= safeTotalPages - 3) {
        pages.push(1, '...', safeTotalPages - 4, safeTotalPages - 3, safeTotalPages - 2, safeTotalPages - 1, safeTotalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', safeTotalPages);
      }
    }
    return pages;
  };

  const pages = getPages();

  return (
    <div className="flex items-center justify-center gap-1 my-10 font-sans">
      {/* Prev Button */}
      {currentPage === 1 ? (
        <div className="h-10 px-4 flex items-center justify-center bg-[#1a1a1a] text-gray-600 text-sm font-bold opacity-50 cursor-not-allowed">
          Prev
        </div>
      ) : (
        <Link href={createPageURL(currentPage - 1)}>
          <div className="h-10 px-4 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#2b2b2b] text-gray-400 hover:text-white transition-colors text-sm font-bold cursor-pointer">
            Prev
          </div>
        </Link>
      )}

      {/* Page Numbers */}
      {pages.map((p, i) => {
        if (p === '...') {
          return (
            <div key={`dots-${i}`} className="h-10 w-10 flex items-center justify-center bg-[#1a1a1a] text-gray-400 text-sm font-bold">
              ...
            </div>
          );
        }

        const isCurrent = p === currentPage;
        
        return (
          <Link key={`page-${p}`} href={createPageURL(p)}>
            <div className={`h-10 w-10 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors ${
              isCurrent 
                ? "bg-[#2b2b2b] text-white" 
                : "bg-[#1a1a1a] hover:bg-[#2b2b2b] text-gray-400 hover:text-white"
            }`}>
              {p}
            </div>
          </Link>
        );
      })}

      {/* Next Button */}
      {currentPage >= safeTotalPages ? (
        <div className="h-10 px-4 flex items-center justify-center bg-[#ffa31a]/50 text-black/50 text-sm font-bold opacity-50 cursor-not-allowed">
          Next
        </div>
      ) : (
        <Link href={createPageURL(currentPage + 1)}>
          <div className="h-10 px-4 flex items-center justify-center bg-[#ffa31a] hover:bg-[#ffb03a] text-black transition-colors text-sm font-bold cursor-pointer">
            Next
          </div>
        </Link>
      )}
    </div>
  );
}
