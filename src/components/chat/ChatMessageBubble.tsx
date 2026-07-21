"use client";

import { useMemo } from "react";
import { ChatAssistantAvatar } from "./ChatAssistantAvatar";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Props {
  message: ChatMessage;
  assistantAvatarUrl?: string | null;
}

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
      return (
        <div key={i} className="flex gap-2">
          <span className="text-choco-soft">•</span>
          <span>{renderInline(line.trim().replace(/^[-•]\s+/, ""))}</span>
        </div>
      );
    }
    if (!line.trim()) return <div key={i} className="h-2" />;
    return <div key={i}>{renderInline(line)}</div>;
  });
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function ChatMessageBubble({ message, assistantAvatarUrl }: Props) {
  const isUser = message.role === "user";
  const rendered = useMemo(() => renderContent(message.content), [message.content]);

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-choco text-ivory" : "bg-transparent"
        }`}
      >
        {isUser ? (
          <UserIcon />
        ) : (
          <ChatAssistantAvatar size={32} imageUrl={assistantAvatarUrl} />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-tr-sm bg-choco text-ivory"
            : "rounded-tl-sm border border-beige bg-cream text-ink"
        }`}
      >
        <div className="space-y-1">{rendered}</div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 20c1.5-4 5-6 7-6s5.5 2 7 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
