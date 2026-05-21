import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditAdForm } from "./form";

export default async function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ad = await prisma.ad.findUnique({ where: { id } });

  if (!ad) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Edit Ad</h1>
      <EditAdForm ad={ad} />
    </div>
  );
}
