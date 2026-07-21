"use client";

import { useState } from "react";
import { ContentImageUpload } from "@/components/admin/ContentImageUpload";
import { t } from "@/lib/i18n/sq";

export function OgImageField({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div>
      <input type="hidden" name="ogImage" value={value} />
      <ContentImageUpload value={value} onChange={setValue} />
      {!value ? <p className="mt-2 text-xs text-choco-soft">/og-default.svg</p> : null}
    </div>
  );
}
