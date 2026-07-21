"use client";

import { useState } from "react";

interface Props {
  size?: number;
  className?: string;
  imageUrl?: string | null;
}

export function ChatAssistantAvatar({ size = 32, className = "", imageUrl }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const src = imageUrl?.trim() || "/images/ai-assistant.svg";

  if (imageFailed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-beige bg-cream text-choco ${className}`}
        style={{ width: size, height: size }}
      >
        <HeadsetIcon size={Math.max(14, Math.floor(size * 0.55))} />
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full border border-beige bg-cream ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        onError={() => setImageFailed(true)}
        className="block h-full w-full object-cover"
        decoding="async"
      />
    </div>
  );
}

function HeadsetIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 14v-2a8 8 0 0 1 16 0v2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="2" y="13" width="4" height="6" rx="2" fill="currentColor" />
      <rect x="18" y="13" width="4" height="6" rx="2" fill="currentColor" />
    </svg>
  );
}
