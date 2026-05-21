import { notFound } from "next/navigation";
import { Header } from "@/components/public/header";
import { VideoGrid } from "@/components/public/video-grid";
import { BadgeCheck } from "lucide-react";
import { getCategoryPageData } from "@/actions/categories";
import { CategoryFilters } from "@/components/public/category-filters";
import { CategoryPagination } from "@/components/public/category-pagination";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryPageData({ slug });
  if (data.success && data.category) {
    return {
      title: `${data.category.name} Videos - StreamHub`,
      description: data.category.description || `Discover the best ${data.category.name} videos on StreamHub`,
    };
  }
  return {
    title: "Category Not Found - StreamHub",
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sParams = await searchParams;

  const page = parseInt(sParams.page as string, 10) || 1;
  const sort = (sParams.sort as string) || "featured";
  const production = (sParams.production as string) || "all";
  const duration = (sParams.duration as string) || "0-40";
  const include = (sParams.include as string) || "";
  const exclude = (sParams.exclude as string) || "";

  const limit = 32;

  const res = await getCategoryPageData({
    slug,
    page,
    limit,
    sort,
    production,
    duration,
    include,
    exclude,
  });

  if (!res.success || !res.category || !res.videos) {
    notFound();
  }

  const { category, videos, totalCount, allCategories } = res;

  const startIdx = totalCount > 0 ? (page - 1) * limit + 1 : 0;
  const endIdx = Math.min(page * limit, totalCount);

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto px-4 md:px-6 pt-6">
        
        {/* Category Header */}
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white capitalize">
              {category.name.toLowerCase()} Videos
            </h1>
            <BadgeCheck className="h-4.5 w-4.5 text-[#2b82d9]" strokeWidth={2.5} />
          </div>
          <p className="text-[11px] text-gray-500 font-bold tracking-wider">
            Showing {startIdx}-{endIdx} of {totalCount.toLocaleString()}
          </p>
        </div>

        {/* Filters and Tags Row */}
        <CategoryFilters 
          currentCategory={{ id: category.id, name: category.name, slug: category.slug }}
          allCategories={allCategories || []}
          totalCount={totalCount}
        />

        {/* Video Grid */}
        <div className="mt-4 flex-1">
          {videos.length > 0 ? (
            <VideoGrid videos={videos} />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500 bg-[#070707] border border-[#161616] rounded-md">
              <p className="text-lg font-bold text-gray-400">No videos found</p>
              <p className="text-xs text-gray-600 mt-1">Try adjusting your filters or search options to find more content.</p>
            </div>
          )}
        </div>

        {/* Custom Pagination & Recommendation Tags */}
        <CategoryPagination
          currentCategoryName={category.name}
          currentPage={page}
          totalCount={totalCount}
          limit={limit}
          allCategories={allCategories || []}
        />
      </main>
    </div>
  );
}
