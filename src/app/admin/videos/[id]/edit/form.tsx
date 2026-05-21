"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { updateVideoAction } from "../../actions";
import { Loader2 } from "lucide-react";

interface Video {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  categoryId: string | null;
  status: string;
  visibility: string;
  seoTitle: string | null;
  seoDescription: string | null;
  thumbnailUrl: string | null;
  isFeatured: boolean;
}

interface Category {
  id: string;
  name: string;
}

export function EditVideoForm({ video, categories }: { video: Video; categories: Category[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);

    const result = await updateVideoAction(video.id, {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      categoryId: formData.get("categoryId") as string || null,
      status: formData.get("status") as "DRAFT" | "PUBLISHED",
      visibility: formData.get("public") === "on" ? "PUBLIC" : "PRIVATE",
      seoTitle: formData.get("seoTitle") as string,
      seoDescription: formData.get("seoDesc") as string,
      isFeatured: formData.get("isFeatured") === "on",
    });

    if (result.success) {
      router.push("/admin/videos");
      router.refresh();
    } else {
      alert(result.error || "Failed to update video");
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Thumbnail</CardTitle>
        </CardHeader>
        <CardContent>
          {video.thumbnailUrl && (
            <img src={video.thumbnailUrl} alt="Thumbnail" className="w-64 aspect-video object-cover rounded-lg bg-muted" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input id="title" name="title" defaultValue={video.title} required />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="slug" className="text-sm font-medium">Slug (URL)</label>
            <Input id="slug" name="slug" defaultValue={video.slug} required />
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea id="description" name="description" defaultValue={video.description || ""} rows={5} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Status</label>
              <Select defaultValue={video.status} name="status">
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Category</label>
              <Select defaultValue={video.categoryId || "none"} name="categoryId">
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <Switch id="public" name="public" defaultChecked={video.visibility === "PUBLIC"} value="on" />
            <label htmlFor="public" className="text-sm font-medium">Make Public</label>
          </div>
          
          <div className="flex items-center space-x-2 mt-2">
            <Switch id="isFeatured" name="isFeatured" defaultChecked={video.isFeatured} value="on" />
            <label htmlFor="isFeatured" className="text-sm font-medium">Featured Video</label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO Meta</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="seoTitle" className="text-sm font-medium">SEO Title</label>
            <Input id="seoTitle" name="seoTitle" defaultValue={video.seoTitle || ""} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="seoDesc" className="text-sm font-medium">SEO Description</label>
            <Textarea id="seoDesc" name="seoDesc" defaultValue={video.seoDescription || ""} rows={3} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 mb-10">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
