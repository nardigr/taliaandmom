"use client";

import { useState } from "react";
import { getProductImageUrl } from "@/lib/images";
import { t } from "@/lib/i18n/sq";

type ContentImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  /** Softer preview for logos (contain, not crop) */
  variant?: "default" | "logo";
};

function toDisplayUrl(value: string): string {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
    return value;
  }
  return getProductImageUrl(value);
}

export function ContentImageUpload({
  value,
  onChange,
  variant = "default",
}: ContentImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const displayUrl = toDisplayUrl(value);

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = (await res.json()) as { path?: string; url?: string; error?: string };
      if (!res.ok) throw new Error(data.error || t.gabimRuajtjes);

      const url =
        data.url ||
        (data.path ? getProductImageUrl(data.path) : "");
      if (!url) throw new Error(t.gabimRuajtjes);

      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.gabimRuajtjes);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {displayUrl ? (
        <div className="space-y-2">
          {variant === "logo" ? (
            <div className="flex h-16 items-center rounded-lg border border-beige bg-ivory px-4 sm:h-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl}
                alt=""
                className="h-10 w-auto max-w-[220px] object-contain object-left sm:h-12"
              />
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={displayUrl}
              alt=""
              className="max-h-48 rounded-lg border border-beige object-cover"
            />
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-sm text-choco-soft hover:text-choco"
          >
            {t.hiqImazhin}
          </button>
        </div>
      ) : null}
      <label className="inline-flex cursor-pointer items-center rounded-lg border border-beige bg-cream px-4 py-2 text-sm text-choco hover:bg-ivory">
        {uploading ? t.dukeUDerguar : t.ngarkoImazh}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleUpload(file);
            event.target.value = "";
          }}
        />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
