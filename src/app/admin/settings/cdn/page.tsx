"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff } from "lucide-react";

export default function AdminCdnSettingsPage() {
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSecret, setShowSecret] = useState(false);

  const [accountId, setAccountId] = useState("");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [bucketName, setBucketName] = useState("");
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          const s = data.settings || {};
          setAccountId(s.R2_ACCOUNT_ID || "");
          setAccessKeyId(s.R2_ACCESS_KEY_ID || "");
          setSecretAccessKey(s.R2_SECRET_ACCESS_KEY || "");
          setBucketName(s.R2_BUCKET_NAME || "");
          setPublicUrl(s.R2_PUBLIC_URL || "");
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleTestConnection = async () => {
    setTestStatus("testing");
    setTestMessage("");
    try {
      const res = await fetch("/api/admin/settings/test-r2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, accessKeyId, secretAccessKey, bucketName }),
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus("success");
        setTestMessage("Connection successful!");
      } else {
        setTestStatus("error");
        setTestMessage(data.error || "Connection failed");
      }
    } catch {
      setTestStatus("error");
      setTestMessage("Network error");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            R2_ACCOUNT_ID: accountId,
            R2_ACCESS_KEY_ID: accessKeyId,
            R2_SECRET_ACCESS_KEY: secretAccessKey,
            R2_BUCKET_NAME: bucketName,
            R2_PUBLIC_URL: publicUrl,
          },
        }),
      });
      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">CDN & Storage Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cloudflare R2 Configuration</CardTitle>
          <CardDescription>
            Configure your Cloudflare R2 bucket credentials. These are stored encrypted in the database and used for video & thumbnail uploads.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Account ID</label>
            <Input
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="Your Cloudflare Account ID"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Access Key ID</label>
            <Input
              value={accessKeyId}
              onChange={(e) => setAccessKeyId(e.target.value)}
              placeholder="R2 Access Key ID"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Secret Access Key</label>
            <div className="relative">
              <Input
                type={showSecret ? "text" : "password"}
                value={secretAccessKey}
                onChange={(e) => setSecretAccessKey(e.target.value)}
                placeholder="R2 Secret Access Key"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Bucket Name</label>
              <Input
                value={bucketName}
                onChange={(e) => setBucketName(e.target.value)}
                placeholder="my-video-bucket"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Public URL</label>
              <Input
                value={publicUrl}
                onChange={(e) => setPublicUrl(e.target.value)}
                placeholder="https://cdn.example.com"
              />
              <p className="text-xs text-muted-foreground">The public URL for accessing uploaded files</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <div className="flex items-center gap-3">
              <Button onClick={handleTestConnection} variant="outline" disabled={testStatus === "testing"}>
                {testStatus === "testing" ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Testing...</> : "Test Connection"}
              </Button>
              {testStatus === "success" && (
                <span className="flex items-center gap-1 text-sm text-green-500">
                  <CheckCircle2 className="h-4 w-4" /> {testMessage}
                </span>
              )}
              {testStatus === "error" && (
                <span className="flex items-center gap-1 text-sm text-destructive">
                  <XCircle className="h-4 w-4" /> {testMessage}
                </span>
              )}
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : "Save Configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
