"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateAdAction } from "../../actions";
import { Loader2 } from "lucide-react";

const AD_TYPES = ["BANNER", "VIDEO_PREROLL", "VIDEO_MIDROLL", "VIDEO_POSTROLL", "POPUNDER_SCRIPT", "CUSTOM_SCRIPT"];
const AD_PROVIDERS = ["DIRECT", "ADSTERRA", "CUSTOM"];
const AD_PLACEMENTS = ["HOME_TOP", "HOME_MIDDLE", "HOME_SIDEBAR", "VIDEO_BEFORE_PLAYER", "VIDEO_AFTER_PLAYER", "VIDEO_SIDEBAR", "VIDEO_PREROLL", "GLOBAL_HEAD", "GLOBAL_BODY", "POPUNDER"];

interface Ad {
  id: string;
  name: string;
  type: string;
  provider: string;
  placement: string;
  status: string;
  title: string | null;
  targetUrl: string | null;
  scriptCode: string | null;
}

export function EditAdForm({ ad }: { ad: Ad }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [adType, setAdType] = useState(ad.type);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);

    const result = await updateAdAction(ad.id, {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      provider: formData.get("provider") as string,
      placement: formData.get("placement") as string,
      status: formData.get("status") as string,
      title: formData.get("title") as string,
      targetUrl: formData.get("targetUrl") as string,
      scriptCode: formData.get("scriptCode") as string,
    });

    if (result.success) {
      router.push("/admin/ads");
      router.refresh();
    } else {
      alert(result.error || "Failed to update ad");
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader><CardTitle>Ad Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Name</label>
            <Input name="name" defaultValue={ad.name} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Type</label>
              <Select name="type" defaultValue={ad.type} onValueChange={(v) => { if (v) setAdType(v); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AD_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Provider</label>
              <Select name="provider" defaultValue={ad.provider}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AD_PROVIDERS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Placement</label>
              <Select name="placement" defaultValue={ad.placement}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AD_PLACEMENTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Status</label>
              <Select name="status" defaultValue={ad.status}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Title (optional)</label>
              <Input name="title" defaultValue={ad.title || ""} />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Target URL</label>
            <Input name="targetUrl" defaultValue={ad.targetUrl || ""} />
          </div>

          {(adType === "POPUNDER_SCRIPT" || adType === "CUSTOM_SCRIPT") && (
            <div className="grid gap-2">
              <label className="text-sm font-medium">Script Code</label>
              <Textarea name="scriptCode" defaultValue={ad.scriptCode || ""} rows={6} className="font-mono text-xs" />
            </div>
          )}
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
