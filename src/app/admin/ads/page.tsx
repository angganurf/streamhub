"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash, PlaySquare, Image as ImageIcon, Code, Loader2 } from "lucide-react";
import { deleteAdAction } from "./actions";

interface Ad {
  id: string;
  name: string;
  type: string;
  provider: string;
  placement: string;
  status: string;
  impressions: number;
  clicks: number;
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await fetch("/api/admin/ads");
      if (res.ok) {
        const data = await res.json();
        setAds(data.ads);
      }
    } catch (e) {
      console.error("Failed to fetch ads", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ad "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    const result = await deleteAdAction(id);
    if (result.success) {
      setAds((prev) => prev.filter((a) => a.id !== id));
    } else {
      alert(result.error || "Failed to delete ad");
    }
    setDeleting(null);
  };

  const getIcon = (type: string) => {
    if (type.includes("VIDEO")) return <PlaySquare className="h-4 w-4" />;
    if (type.includes("SCRIPT") || type.includes("POPUNDER")) return <Code className="h-4 w-4" />;
    return <ImageIcon className="h-4 w-4" />;
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
        <h1 className="text-3xl font-bold tracking-tight">Advertisements</h1>
        <Link href="/admin/ads/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Ad
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Metrics</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell className="font-medium">{ad.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getIcon(ad.type)}
                    <span className="text-xs">{ad.type}</span>
                  </div>
                </TableCell>
                <TableCell><span className="text-xs">{ad.placement}</span></TableCell>
                <TableCell>
                  <Badge variant={ad.status === "ACTIVE" ? "default" : "secondary"}>
                    {ad.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="text-sm">
                    <div>{ad.impressions} Impr.</div>
                    <div className="text-muted-foreground">{ad.clicks} Clicks</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/ads/${ad.id}/edit`}>
                      <Button variant="ghost" size="icon" title="Edit"><Edit className="h-4 w-4" /></Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(ad.id, ad.name)}
                      disabled={deleting === ad.id}
                    >
                      {deleting === ad.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {ads.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No ads found. Create an ad campaign!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
