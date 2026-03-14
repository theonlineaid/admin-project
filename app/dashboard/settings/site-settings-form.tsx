"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

export type TopbarItem = {
  id: string;
  type: "phone" | "promotion" | "address" | "custom";
  value: string;
};

const MIN_BANNERS = 3;
const MAX_BANNERS = 5;

type SiteSettings = {
  id: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  siteTitle: string | null;
  headerVariant: string | null;
  footerVariant: string | null;
  topbarEnabled: boolean;
  topbarItems: TopbarItem[] | null;
  bannerUrls: string[] | null;
};

const TOPBAR_TYPES: { value: TopbarItem["type"]; label: string }[] = [
  { value: "phone", label: "Phone" },
  { value: "promotion", label: "Promotion" },
  { value: "address", label: "Shop address" },
  { value: "custom", label: "Custom line" },
];

function newTopbarItem(): TopbarItem {
  return {
    id: crypto.randomUUID(),
    type: "custom",
    value: "",
  };
}

const HEADER_OPTIONS = [
  { value: "1", label: "Header style 1" },
  { value: "2", label: "Header style 2" },
  { value: "3", label: "Header style 3" },
  { value: "4", label: "Header style 4" },
  { value: "5", label: "Header style 5" },
];

const FOOTER_OPTIONS = [
  { value: "1", label: "Footer style 1" },
  { value: "2", label: "Footer style 2" },
  { value: "3", label: "Footer style 3" },
  { value: "4", label: "Footer style 4" },
  { value: "5", label: "Footer style 5" },
];

async function uploadFile(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Upload failed");
  }
  const data = await res.json();
  return data.url;
}

export function SiteSettingsForm() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [bannerFolderImages, setBannerFolderImages] = useState<{ publicId: string; secureUrl: string }[]>([]);
  const [loadingBannerFolder, setLoadingBannerFolder] = useState(false);
  const [form, setForm] = useState({
    logoUrl: "",
    faviconUrl: "",
    siteTitle: "E-commerce",
    headerVariant: "1",
    footerVariant: "1",
    topbarEnabled: false,
    topbarItems: [] as TopbarItem[],
    bannerUrls: [] as string[],
  });

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        const items = Array.isArray(data.topbarItems)
          ? (data.topbarItems as TopbarItem[]).map((i) => ({
              id: i.id ?? crypto.randomUUID(),
              type: i.type ?? "custom",
              value: i.value ?? "",
            }))
          : [];
        const banners = Array.isArray(data.bannerUrls) ? data.bannerUrls : [];
        setForm({
          logoUrl: data.logoUrl ?? "",
          faviconUrl: data.faviconUrl ?? "",
          siteTitle: data.siteTitle ?? "E-commerce",
          headerVariant: data.headerVariant ?? "1",
          footerVariant: data.footerVariant ?? "1",
          topbarEnabled: data.topbarEnabled ?? false,
          topbarItems: items,
          bannerUrls: banners,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function fetchBannerFolderImages() {
    setLoadingBannerFolder(true);
    try {
      const res = await fetch("/api/banner-images");
      const data = await res.json();
      setBannerFolderImages(Array.isArray(data.images) ? data.images : []);
    } catch {
      setBannerFolderImages([]);
    } finally {
      setLoadingBannerFolder(false);
    }
  }

  useEffect(() => {
    if (!loading) fetchBannerFolderImages();
  }, [loading]);

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logoUrl" | "faviconUrl"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    try {
      const folder = field === "logoUrl" ? "logo" : "favicon";
      const url = await uploadFile(file, folder);
      setForm((prev) => ({ ...prev, [field]: url }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  }

  async function handleBannerFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading("banner");
    try {
      const folder = "banner";
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i], folder);
        urls.push(url);
      }
      setForm((prev) => {
        const current = prev.bannerUrls;
        const toAdd = urls.slice(0, Math.max(0, MAX_BANNERS - current.length));
        const next = [...current, ...toAdd];
        return { ...prev, bannerUrls: next };
      });
      await fetchBannerFolderImages();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  }

  async function saveBannerUrls(bannerUrls: string[]) {
    const payload = bannerUrls.length >= MIN_BANNERS ? bannerUrls : null;
    const res = await fetch("/api/site-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bannerUrls: payload }),
    });
    if (!res.ok) throw new Error("Failed to save");
    const data = await res.json();
    setSettings(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoUrl: form.logoUrl || null,
          faviconUrl: form.faviconUrl || null,
          siteTitle: form.siteTitle || null,
          headerVariant: form.headerVariant,
          footerVariant: form.footerVariant,
          topbarEnabled: form.topbarEnabled,
          topbarItems: form.topbarItems.length ? form.topbarItems : null,
          bannerUrls: form.bannerUrls.length >= MIN_BANNERS ? form.bannerUrls : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setSettings(data);
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-muted-foreground">Loading settings…</div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <p className="text-sm text-muted-foreground">
            Logo, favicon, and site title
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Site title</Label>
            <Input
              value={form.siteTitle}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, siteTitle: e.target.value }))
              }
              placeholder="E-commerce"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-3 flex-wrap">
                {form.logoUrl ? (
                  <>
                    <img
                      src={form.logoUrl}
                      alt="Logo"
                      className="h-12 object-contain"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setForm((prev) => ({ ...prev, logoUrl: "" }))}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </>
                ) : (
                  <div className="h-12 w-24 rounded border border-dashed flex items-center justify-center text-muted-foreground text-xs">
                    No logo
                  </div>
                )}
                {!form.logoUrl && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "logoUrl")}
                      className="text-sm"
                      disabled={!!uploading}
                    />
                    {uploading === "logoUrl" && (
                      <span className="text-xs text-muted-foreground ml-2">
                        Uploading…
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Favicon</Label>
              <div className="flex items-center gap-3 flex-wrap">
                {form.faviconUrl ? (
                  <>
                    <img
                      src={form.faviconUrl}
                      alt="Favicon"
                      className="h-8 w-8 object-contain"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setForm((prev) => ({ ...prev, faviconUrl: "" }))}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </>
                ) : (
                  <div className="h-8 w-8 rounded border border-dashed flex items-center justify-center text-muted-foreground text-xs">
                    —
                  </div>
                )}
                {!form.faviconUrl && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "faviconUrl")}
                      className="text-sm"
                      disabled={!!uploading}
                    />
                    {uploading === "faviconUrl" && (
                      <span className="text-xs text-muted-foreground ml-2">
                        Uploading…
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Header</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose one of five header layouts for the storefront
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {HEADER_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex flex-col items-center rounded-lg border-2 px-4 py-3 cursor-pointer transition-colors ${
                  form.headerVariant === opt.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <input
                  type="radio"
                  name="headerVariant"
                  value={opt.value}
                  checked={form.headerVariant === opt.value}
                  onChange={() =>
                    setForm((prev) => ({ ...prev, headerVariant: opt.value }))
                  }
                  className="sr-only"
                />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Footer</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose one of five footer layouts for the storefront
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {FOOTER_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex flex-col items-center rounded-lg border-2 px-4 py-3 cursor-pointer transition-colors ${
                  form.footerVariant === opt.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <input
                  type="radio"
                  name="footerVariant"
                  value={opt.value}
                  checked={form.footerVariant === opt.value}
                  onChange={() =>
                    setForm((prev) => ({ ...prev, footerVariant: opt.value }))
                  }
                  className="sr-only"
                />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Banner settings</CardTitle>
          <p className="text-sm text-muted-foreground">
            Homepage banner images (3–5 images). Uploaded to Cloudinary folder: <strong>banner</strong>
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            All images in Cloudinary folder <strong>banner</strong>. Delete or upload below. Site uses 3–5 of these (saved order).
          </p>
          {loadingBannerFolder ? (
            <p className="text-sm text-muted-foreground">Loading banner images…</p>
          ) : (
            <div className="flex flex-wrap gap-3 items-start">
              {bannerFolderImages.map((img) => (
                <div key={img.publicId} className="relative group">
                  <img
                    src={img.secureUrl}
                    alt={img.publicId}
                    className="h-24 w-40 rounded-lg border border-border object-cover"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/banner-images", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ publicId: img.publicId }),
                        });
                        if (!res.ok) {
                          const data = await res.json();
                          throw new Error(data.error || "Delete failed");
                        }
                        setBannerFolderImages((prev) => prev.filter((i) => i.publicId !== img.publicId));
                        const prevUrls = form.bannerUrls;
                        const newUrls = prevUrls.filter((u) => u !== img.secureUrl);
                        if (newUrls.length !== prevUrls.length) {
                          setForm((prev) => ({ ...prev, bannerUrls: newUrls }));
                          await saveBannerUrls(newUrls);
                        }
                      } catch (err) {
                        alert(err instanceof Error ? err.message : "Failed to delete");
                      }
                    }}
                    aria-label="Delete banner"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <label className="h-24 w-40 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 gap-1">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={handleBannerFilesChange}
                  disabled={!!uploading}
                />
                {uploading === "banner" ? "Uploading…" : <Plus className="h-6 w-6" />}
                <span className="text-xs">or select multiple</span>
              </label>
            </div>
          )}
          {form.bannerUrls.length > 0 && form.bannerUrls.length < MIN_BANNERS && (
            <p className="text-sm text-amber-600">
              Add at least {MIN_BANNERS - form.bannerUrls.length} more image(s) to use on site (min {MIN_BANNERS}, max {MAX_BANNERS}).
            </p>
          )}
          {form.bannerUrls.length >= MIN_BANNERS && (
            <p className="text-sm text-muted-foreground">
              {form.bannerUrls.length} / {MAX_BANNERS} banners used on site. Order is preserved.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top bar</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enable a top bar and add lines: phone, promotion, address, or custom text
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.topbarEnabled}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, topbarEnabled: e.target.checked }))
              }
              className="rounded border-border"
            />
            <span className="text-sm font-medium">Enable top bar</span>
          </label>
          {form.topbarEnabled && (
            <div className="space-y-3">
              <Label>Top bar lines (order as shown)</Label>
              {form.topbarItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-border bg-muted/30"
                >
                  <select
                    value={item.type}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        topbarItems: prev.topbarItems.map((i) =>
                          i.id === item.id
                            ? { ...i, type: e.target.value as TopbarItem["type"] }
                            : i
                        ),
                      }))
                    }
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm w-36"
                  >
                    {TOPBAR_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={item.value}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        topbarItems: prev.topbarItems.map((i) =>
                          i.id === item.id ? { ...i, value: e.target.value } : i
                        ),
                      }))
                    }
                    placeholder={
                      item.type === "phone"
                        ? "+1 234 567 8900"
                        : item.type === "promotion"
                          ? "Free shipping over $50"
                          : item.type === "address"
                            ? "123 Main St, City"
                            : "Any text"
                    }
                    className="flex-1 min-w-[180px]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        topbarItems: prev.topbarItems.filter((i) => i.id !== item.id),
                      }))
                    }
                    className="text-destructive hover:text-destructive shrink-0"
                    aria-label="Remove line"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    topbarItems: [...prev.topbarItems, newTopbarItem()],
                  }))
                }
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add line
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
