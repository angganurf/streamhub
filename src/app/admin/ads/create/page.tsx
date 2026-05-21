"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createAdAction } from "../actions";
import { Loader2 } from "lucide-react";

const AD_TYPES = ["SMARTLINK", "POPUNDER", "SOCIAL_BAR", "BANNER"];
const BANNER_SIZES = ["468x60", "160x300", "320x50", "300x250", "160x600", "728x90"];

export default function CreateAdPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [adType, setAdType] = useState("SMARTLINK");
  const [bannerSize, setBannerSize] = useState("728x90");

  // Determine recommended placements based on banner size
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
    
    // Auto-assign placements based on AdType if not BANNER
    let placement = formData.get("placement") as string;
    if (adType === "POPUNDER") placement = "GLOBAL_HEAD";
    if (adType === "SOCIAL_BAR") placement = "GLOBAL_BODY";
    if (adType === "SMARTLINK") placement = "VIDEO_BEFORE_PLAYER";

    const result = await createAdAction({
      name: formData.get("name") as string,
      type: adType,
      provider: "ADSTERRA", // Fixed provider
      placement: placement,
      status: formData.get("status") as string,
      title: formData.get("title") as string,
      targetUrl: formData.get("targetUrl") as string,
      imageUrl: formData.get("imageUrl") as string,
      scriptCode: formData.get("scriptCode") as string,
      bannerSize: adType === "BANNER" ? bannerSize : undefined,
    });

    if (result.success) {
      router.push("/admin/ads");
      router.refresh();
    } else {
      alert(result.error || "Failed to create ad");
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Adsterra Ad</h1>
        <p className="text-muted-foreground mt-1">Add a new Adsterra advertisement format to your platform.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ad Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            
            {/* Top row: Name, Type, Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Name</label>
                <Input name="name" placeholder="Ad campaign name" required />
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
                <Select name="status" defaultValue="ACTIVE">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dynamic Fields based on AdType */}
            <div className="border-t pt-4">
              
              {adType === "SMARTLINK" && (
                <div className="grid gap-4">
                  <div className="bg-blue-500/10 text-blue-500 p-3 rounded-md text-sm">
                    <strong>Smartlink:</strong> A clickable image overlay that appears over the video player before the video starts. When clicked, it opens the Direct Link in a new tab.
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Direct Link URL</label>
                    <Input name="targetUrl" placeholder="https://www.effectivecpmnetwork.com/... (Direct Link)" required />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Overlay Image URL</label>
                    <Input name="imageUrl" placeholder="https://example.com/image.jpg (Displayed on video player)" required />
                  </div>
                </div>
              )}

              {adType === "POPUNDER" && (
                <div className="grid gap-4">
                  <div className="bg-purple-500/10 text-purple-500 p-3 rounded-md text-sm">
                    <strong>Popunder:</strong> Script placed globally before the closing <code>&lt;/head&gt;</code> tag.
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Popunder Script Code</label>
                    <Textarea name="scriptCode" placeholder={`<script src="https://pl..."></script>`} rows={4} className="font-mono text-xs" required />
                  </div>
                </div>
              )}

              {adType === "SOCIAL_BAR" && (
                <div className="grid gap-4">
                  <div className="bg-green-500/10 text-green-500 p-3 rounded-md text-sm">
                    <strong>Social Bar:</strong> Script placed globally above the closing <code>&lt;/body&gt;</code> tag.
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Social Bar Script Code</label>
                    <Textarea name="scriptCode" placeholder={`<script src="https://pl..."></script>`} rows={4} className="font-mono text-xs" required />
                  </div>
                </div>
              )}

              {adType === "BANNER" && (
                <div className="grid gap-4">
                  <div className="bg-orange-500/10 text-orange-500 p-3 rounded-md text-sm">
                    <strong>Banner:</strong> Standard banner ad scripts using <code>atOptions</code>. Choose size to see recommended placements.
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
                      <Select name="placement" defaultValue={getRecommendedPlacements()[0]}>
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
                      placeholder={`<script type="text/javascript">\n  atOptions = { 'key' : '...', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} };\n</script>\n<script type="text/javascript" src="..."></script>`} 
                      rows={8} 
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
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : "Create Ad"}
          </Button>
        </div>
      </form>
    </div>
  );
}
