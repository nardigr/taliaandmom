"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { ChatPanel } from "./ChatPanel";
import { AiFabIcon } from "./AiFabIcon";
import { chat } from "@/lib/i18n/sq";

interface Props {
  enabled: boolean;
  assistantName?: string | null;
  assistantAvatarUrl?: string | null;
  fabCaptionTemplate?: string | null;
}

const HIDE_PREFIXES = ["/admin", "/_next", "/api"];

function applyFabCaption(template: string, displayName: string) {
  return template.split("{name}").join(displayName);
}

export function ChatWidget({
  enabled,
  assistantName,
  assistantAvatarUrl,
  fabCaptionTemplate,
}: Props) {
  const pathname = usePathname() || "";
  const displayName = assistantName?.trim() || chat.assistantName;
  const fabText = fabCaptionTemplate?.trim()
    ? applyFabCaption(fabCaptionTemplate.trim(), displayName)
    : chat.fabCaption.replace("{name}", displayName);
  const [open, setOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (localStorage.getItem("talja_chat_seen")) setShowBadge(false);
    } catch {
      /* noop */
    }
  }, []);

  if (!enabled) return null;
  if (HIDE_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  function openChat() {
    setOpen(true);
    if (showBadge) {
      setShowBadge(false);
      try {
        localStorage.setItem("talja_chat_seen", "1");
      } catch {
        /* noop */
      }
    }
  }

  function closeChat() {
    setOpen(false);
  }

  function toggleChat() {
    if (open) closeChat();
    else openChat();
  }

  const panel =
    open && mounted
      ? createPortal(
          <ChatPanel
            onClose={closeChat}
            assistantName={assistantName}
            assistantAvatarUrl={assistantAvatarUrl}
          />,
          document.body,
        )
      : null;

  return (
    <>
      {panel}
      <div className="fixed bottom-6 right-4 z-[200] flex max-w-[min(100vw-1.5rem,24rem)] flex-col items-end gap-2 sm:right-6 sm:max-w-none sm:flex-row-reverse sm:items-center sm:gap-3">
        {!open && (
          <button
            type="button"
            onClick={openChat}
            className="cursor-pointer rounded-2xl border border-beige bg-choco px-3 py-2 text-right text-xs font-medium leading-snug text-ivory shadow-lg transition-colors hover:bg-choco-soft sm:max-w-[min(18rem,calc(100vw-8rem))] sm:text-sm"
          >
            {fabText}
          </button>
        )}
        <button
          type="button"
          onClick={toggleChat}
          aria-label={open ? chat.close : chat.openWithAssistant.replace("{name}", displayName)}
          aria-expanded={open}
          className="relative flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full bg-rose-deep text-ivory shadow-lg ring-2 ring-ivory/80 transition-all hover:scale-105 hover:bg-rose"
        >
          {open ? <CloseIcon /> : <AiFabIcon />}
          {!open && showBadge && (
            <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-choco text-[10px] font-bold text-ivory ring-2 ring-rose-deep">
              !
            </span>
          )}
        </button>
      </div>
    </>
  );
}

function CloseIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
