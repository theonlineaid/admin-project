"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  label: string;
  folder: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
};

export function CloudinaryImageField({ label, folder, value, onChange, hint }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      if (data.url) onChange(data.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="flex flex-wrap items-center gap-3">
        {value ? (
          <img src={value} alt="" className="h-16 w-16 rounded-lg border border-border object-cover" />
        ) : null}
        <div className="flex flex-1 flex-col gap-2 min-w-[200px]">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste image URL"
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onFile}
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Upload to Cloudinary"}
          </Button>
        </div>
      </div>
      {value && (
        <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => onChange("")}>
          Remove image
        </Button>
      )}
    </div>
  );
}
