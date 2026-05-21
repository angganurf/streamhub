import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
// Import EditVideoForm client component explicitly
import { EditVideoForm } from "./form";

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = await prisma.video.findUnique({ where: { id } });

  if (!video) {
    notFound();
  }

  const categories = await prisma.videoCategory.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Edit Video</h1>
      <EditVideoForm video={video} categories={categories} />
    </div>
  );
}
