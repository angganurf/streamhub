"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash, Eye, Loader2 } from "lucide-react";
import { deleteVideoAction } from "./actions";
import { useRouter } from "next/navigation";

interface Video {
  id: string;
  title: string;
  slug: string;
  status: string;
  views: number;
  thumbnailUrl: string | null;
  createdAt: string;
  category: { name: string } | null;
}

export default function AdminVideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/admin/videos");
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos);
      }
    } catch (e) {
      console.error("Failed to fetch videos", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;
    setDeleting(id);
    const result = await deleteVideoAction(id);
    if (result.success) {
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } else {
      alert(result.error || "Failed to delete video");
    }
    setDeleting(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Videos</h1>
        <Link href="/admin/videos/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Upload Video
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Video</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-10 bg-muted rounded overflow-hidden shrink-0">
                      <img src={video.thumbnailUrl || "/placeholder-video.jpg"} alt="" className="object-cover w-full h-full" />
                    </div>
                    <span className="font-medium line-clamp-1">{video.title}</span>
                  </div>
                </TableCell>
                <TableCell>{video.category?.name || "—"}</TableCell>
                <TableCell>
                  <Badge variant={video.status === "PUBLISHED" ? "default" : "secondary"}>
                    {video.status}
                  </Badge>
                </TableCell>
                <TableCell>{video.views}</TableCell>
                <TableCell>{new Date(video.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/video/${video.slug}`} target="_blank">
                      <Button variant="ghost" size="icon" title="View"><Eye className="h-4 w-4" /></Button>
                    </Link>
                    <Link href={`/admin/videos/${video.id}/edit`}>
                      <Button variant="ghost" size="icon" title="Edit"><Edit className="h-4 w-4" /></Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(video.id, video.title)}
                      disabled={deleting === video.id}
                    >
                      {deleting === video.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {videos.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No videos found. Upload your first video!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
