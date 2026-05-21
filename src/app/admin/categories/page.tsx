"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash, Loader2, X, Check } from "lucide-react";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "./actions";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { videos: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch (e) {
      console.error("Failed to fetch categories", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const result = await createCategoryAction({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    });
    if (result.success) {
      setName("");
      setSlug("");
      setShowCreate(false);
      fetchCategories();
    } else {
      alert(result.error);
    }
    setSaving(false);
  };

  const handleUpdate = async (id: string) => {
    if (!name.trim()) return;
    setSaving(true);
    const result = await updateCategoryAction(id, { name, slug });
    if (result.success) {
      setEditId(null);
      setName("");
      setSlug("");
      fetchCategories();
    } else {
      alert(result.error);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Delete category "${catName}"? Videos in this category will become uncategorized.`)) return;
    setDeleting(id);
    const result = await deleteCategoryAction(id);
    if (result.success) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert(result.error);
    }
    setDeleting(null);
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setShowCreate(false);
  };

  const cancelEdit = () => {
    setEditId(null);
    setName("");
    setSlug("");
    setShowCreate(false);
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
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <Button className="gap-2" onClick={() => { setShowCreate(true); setEditId(null); setName(""); setSlug(""); }}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>New Category</CardTitle></CardHeader>
          <CardContent className="flex gap-4 items-end">
            <div className="grid gap-2 flex-1">
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }} placeholder="Category name" autoFocus />
            </div>
            <div className="grid gap-2 flex-1">
              <label className="text-sm font-medium">Slug</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="category-slug" />
            </div>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
            <Button variant="outline" onClick={cancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>
                  {editId === cat.id ? (
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" />
                  ) : (
                    <span className="font-medium">{cat.name}</span>
                  )}
                </TableCell>
                <TableCell>
                  {editId === cat.id ? (
                    <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="max-w-xs" />
                  ) : (
                    <span className="text-muted-foreground">{cat.slug}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {editId === cat.id ? (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleUpdate(cat.id)} disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-500" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => startEdit(cat)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={deleting === cat.id}
                        >
                          {deleting === cat.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                  No categories yet. Create your first category!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
