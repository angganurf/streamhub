"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { createVideoAction } from "../actions";
import { getSidebarCategories } from "@/actions/categories";
import { useEffect } from "react";

export default function AdminUploadVideoPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    getSidebarCategories().then(res => {
      if (res.success) {
        setCategories(res.categories);
      }
    });
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const uploadFileToR2 = async (file: File) => {
    // 1. Get Presigned URL
    const res = await fetch("/api/upload/url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });
    
    if (!res.ok) throw new Error("Failed to get upload URL");
    const { uploadUrl, key } = await res.json();

    // 2. Upload file directly to R2
    return new Promise<{ key: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", file.type);
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve({ key });
        else reject(new Error("Upload to R2 failed"));
      };
      
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData(e.currentTarget);
    const videoFile = formData.get("video") as File;
    const thumbnailFile = formData.get("thumbnail") as File;

    if (!videoFile || !thumbnailFile) {
      alert("Please select both video and thumbnail files.");
      setIsUploading(false);
      return;
    }

    try {
      // Upload Thumbnail
      const thumbResult = await uploadFileToR2(thumbnailFile);
      
      // Upload Video
      setUploadProgress(0); // reset progress for video
      const videoResult = await uploadFileToR2(videoFile);

      const result = await createVideoAction({
        title: formData.get("title") as string,
        slug: formData.get("slug") as string,
        description: formData.get("description") as string,
        categoryId: formData.get("categoryId") as string,
        status: formData.get("status") as "DRAFT" | "PUBLISHED",
        visibility: formData.get("public") === "on" ? "PUBLIC" : "PRIVATE",
        seoTitle: formData.get("title") as string, // Auto map title to seoTitle
        seoDescription: formData.get("description") as string, // Auto map description to seoDescription
        videoKey: videoResult.key,
        thumbnailKey: thumbResult.key,
        isFeatured: formData.get("isFeatured") === "on",
      });

      if (result.success) {
        alert("Video uploaded successfully!");
        router.push("/admin/videos");
      } else {
        alert(result.error || "Failed to save video to database.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during upload.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Upload Video</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Video File</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <label htmlFor="video" className="text-sm font-medium">Select Video (MP4, WebM)</label>
              <Input id="video" name="video" type="file" accept="video/mp4,video/webm" required className="cursor-pointer" />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="thumbnail" className="text-sm font-medium">Select Thumbnail (JPG, PNG)</label>
              <Input id="thumbnail" name="thumbnail" type="file" accept="image/jpeg,image/png,image/webp" required className="cursor-pointer" />
            </div>

            {isUploading && (
              <div className="w-full bg-secondary rounded-full h-2.5 mt-2">
                <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
              </div>
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
              <Input id="title" name="title" placeholder="Video Title" value={title} onChange={handleTitleChange} required />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="slug" className="text-sm font-medium">Slug (URL)</label>
              <Input id="slug" name="slug" placeholder="video-title" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea id="description" name="description" placeholder="Video Description..." rows={5} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Category</label>
                <Select name="categoryId" defaultValue="none">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Status</label>
                <Select defaultValue="PUBLISHED" name="status">
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <Switch id="public" name="public" defaultChecked value="on" />
              <label htmlFor="public" className="text-sm font-medium">Make Public</label>
            </div>
            
            <div className="flex items-center space-x-2 mt-2">
              <Switch id="isFeatured" name="isFeatured" value="on" />
              <label htmlFor="isFeatured" className="text-sm font-medium">Featured Video</label>
            </div>
          </CardContent>
        </Card>


        <div className="flex justify-end gap-4 mb-10">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? `Uploading... ${uploadProgress}%` : 'Save & Upload'}
          </Button>
        </div>
      </form>
    </div>
  );
}
