"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateAdAction } from "../../actions";
import { Loader2 } from "lucide-react";

const AD_TYPES = ["SMARTLINK", "POPUNDER", "SOCIAL_BAR", "BANNER", "NATIVE_BANNER"];
const BANNER_SIZES = ["468x60", "160x300", "320x50", "300x250", "160x600", "728x90"];

interface Ad {
  id: string;
  name: string;
  type: string;
  provider: string;
  placement: string;
  status: string;
  title: string | null;
  targetUrl: string | null;
  imageUrl: string | null;
  scriptCode: string | null;
  bannerSize: string | null;
  gridPosition: number | null;
  autoDirectDelay: number | null;
}

export function EditAdForm({ ad }: { ad: Ad }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [adType, setAdType] = useState(AD_TYPES.includes(ad.type) ? ad.type : "SMARTLINK");
  const [bannerSize, setBannerSize] = useState(ad.bannerSize || "728x90");
  const [gridPosition, setGridPosition] = useState(ad.gridPosition?.toString() || "3");
  const [enableAutoDirect, setEnableAutoDirect] = useState(ad.autoDirectDelay !== null);

  const getRecommendedPlacements = () => {
    switch (bannerSize) {
      case "468x60":
        return ["VIDEO_BEFORE_PLAYER", "VIDEO_AFTER_PLAYER", "HOME_MIDDLE"];
      case "728x90":
        return ["HOME_TOP", "HOME_MIDDLE", "VIDEO_BEFORE_PLAYER", "VIDEO_AFTER_PLAYER"];
      case "300x250":
      case "160x300":
      case "160x600":
        return ["HOME_SIDEBAR", "VIDEO_SIDEBAR"];
      case "320x50":
        return ["HOME_TOP", "HOME_MIDDLE"];
      default:
        return ["HOME_TOP", "HOME_MIDDLE", "HOME_SIDEBAR", "VIDEO_BEFORE_PLAYER", "VIDEO_AFTER_PLAYER", "VIDEO_SIDEBAR"];
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);

    let placement = formData.get("placement") as string || ad.placement;
    if (adType === "POPUNDER") placement = "GLOBAL_HEAD";
    if (adType === "SOCIAL_BAR") placement = "GLOBAL_BODY";
    if (adType === "SMARTLINK") placement = "VIDEO_BEFORE_PLAYER";
    if (adType === "NATIVE_BANNER") placement = "HOME_GRID";

    const result = await updateAdAction(ad.id, {
      name: formData.get("name") as string,
      type: adType,
      provider: "ADSTERRA",
      placement: placement,
      status: formData.get("status") as string,
      title: formData.get("title") as string,
      targetUrl: formData.get("targetUrl") as string,
      imageUrl: formData.get("imageUrl") as string,
      scriptCode: formData.get("scriptCode") as string,
      bannerSize: adType === "BANNER" ? bannerSize : undefined,
      gridPosition: adType === "NATIVE_BANNER" ? parseInt(gridPosition, 10) : undefined,
      autoDirectDelay: enableAutoDirect && formData.get("autoDirectDelay") ? parseInt(formData.get("autoDirectDelay") as string, 10) : undefined,
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
        <CardHeader>
          <CardTitle>Edit Adsterra Ad</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Name</label>
              <Input name="name" defaultValue={ad.name} required />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={adType} onValueChange={(val) => { if (val) setAdType(val) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AD_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

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
          </div>

          <div className="border-t pt-4">
            
            {adType === "SMARTLINK" && (
              <div className="grid gap-4">
                <div className="bg-blue-500/10 text-blue-500 p-3 rounded-md text-sm">
                  <strong>Smartlink:</strong> Clickable image overlay over the video player. You can optionally enable Auto Redirect.
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Direct Link URL</label>
                  <Input name="targetUrl" defaultValue={ad.targetUrl || ""} placeholder="https://..." required />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Overlay Image URL</label>
                  <Input name="imageUrl" defaultValue={ad.imageUrl || ""} placeholder="https://..." required />
                </div>
                <div className="flex items-center gap-2 border-t pt-4">
                  <Switch
                    checked={enableAutoDirect}
                    onCheckedChange={setEnableAutoDirect}
                  />
                  <label className="text-sm font-medium">Enable Auto Redirect</label>
                </div>
                {enableAutoDirect && (
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Auto Redirect Delay (seconds)</label>
                    <Input type="number" name="autoDirectDelay" defaultValue={ad.autoDirectDelay?.toString() || ""} placeholder="0 for immediate" required min="0" />
                  </div>
                )}
              </div>
            )}

            {adType === "POPUNDER" && (
              <div className="grid gap-4">
                <div className="bg-purple-500/10 text-purple-500 p-3 rounded-md text-sm">
                  <strong>Popunder:</strong> Script placed globally before <code>&lt;/head&gt;</code>.
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Popunder Script Code</label>
                  <Textarea name="scriptCode" defaultValue={ad.scriptCode || ""} rows={4} className="font-mono text-xs" required />
                </div>
              </div>
            )}

            {adType === "SOCIAL_BAR" && (
              <div className="grid gap-4">
                <div className="bg-green-500/10 text-green-500 p-3 rounded-md text-sm">
                  <strong>Social Bar:</strong> Script placed globally above <code>&lt;/body&gt;</code>.
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Social Bar Script Code</label>
                  <Textarea name="scriptCode" defaultValue={ad.scriptCode || ""} rows={4} className="font-mono text-xs" required />
                </div>
              </div>
            )}

            {adType === "BANNER" && (
              <div className="grid gap-4">
                <div className="bg-orange-500/10 text-orange-500 p-3 rounded-md text-sm">
                  <strong>Banner:</strong> Standard banner ad scripts using <code>atOptions</code>.
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Banner Size</label>
                    <Select value={bannerSize} onValueChange={(val) => { if (val) setBannerSize(val) }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BANNER_SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Recommended Placement</label>
                    <Select name="placement" defaultValue={ad.placement || getRecommendedPlacements()[0]}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {getRecommendedPlacements().map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Banner Script Code</label>
                  <Textarea 
                    name="scriptCode" 
                    defaultValue={ad.scriptCode || ""} 
                    rows={8} 
                    className="font-mono text-xs" 
                    required 
                  />
                </div>
              </div>
            )}

            {adType === "NATIVE_BANNER" && (
              <div className="grid gap-4">
                <div className="bg-yellow-500/10 text-yellow-500 p-3 rounded-md text-sm">
                  <strong>Native Banner:</strong> Appears directly in the video grid on the homepage (camouflaged among videos).
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Grid Position (After X videos)</label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={gridPosition} 
                    onChange={(e) => setGridPosition(e.target.value)} 
                    required 
                    placeholder="e.g. 3 (Appears after 3rd video)" 
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Native Banner Script Code</label>
                  <Textarea 
                    name="scriptCode" 
                    defaultValue={ad.scriptCode || ""} 
                    placeholder={`<script async="async" data-cfasync="false" src="..."></script>\n<div id="container-..."></div>`} 
                    rows={6} 
                    className="font-mono text-xs" 
                    required 
                  />
                </div>
              </div>
            )}

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
