"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessageBubble, type ChatMessage } from "./ChatMessageBubble";
import { ChatAssistantAvatar } from "./ChatAssistantAvatar";
import { chat } from "@/lib/i18n/sq";

interface Props {
  onClose: () => void;
  assistantName?: string | null;
  assistantAvatarUrl?: string | null;
}

const STORAGE_KEY = "talja_chat_session_id";

export function ChatPanel({ onClose, assistantName, assistantAvatarUrl }: Props) {
  const displayName = assistantName?.trim() || chat.assistantName;
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    } catch {
      saved = null;
    }
    if (saved) {
      void restoreSession(saved);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function restoreSession(id: string) {
    try {
      const res = await fetch(`/api/chat?sessionId=${encodeURIComponent(id)}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.session) {
        setSessionId(data.session.id);
        setMessages(
          data.session.messages.map((m: { id: string; role: string; content: string }) => ({
            id: m.id,
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          })),
        );
      } else {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* noop */
        }
      }
    } catch {
      /* start fresh */
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    setError(null);
    setInput("");
    setSending(true);

    const userMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(sessionId ? { sessionId } : {}),
          message: text,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? chat.errorGeneric);
        return;
      }

      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        try {
          localStorage.setItem(STORAGE_KEY, data.sessionId);
        } catch {
          /* ignore */
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply ?? "",
        },
      ]);
    } catch {
      setError(chat.errorNetwork);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function startNew() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    setSessionId(null);
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div
      className="fixed bottom-24 right-4 z-[199] flex h-[calc(100vh-8rem)] max-h-[640px] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-beige bg-ivory shadow-2xl sm:right-6"
      role="dialog"
      aria-label={chat.title}
    >
      <header className="flex items-center justify-between border-b border-beige bg-cream px-4 py-3">
        <div className="flex items-center gap-2.5">
          <ChatAssistantAvatar size={34} imageUrl={assistantAvatarUrl} />
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-choco">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {displayName}
            </h2>
            <p className="text-xs text-choco-soft">
              {chat.title} — {chat.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={startNew}
              className="rounded-md px-2 py-1 text-xs text-choco-soft transition-colors hover:bg-ivory hover:text-choco"
              aria-label={chat.newConversation}
            >
              {chat.newConversation}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-choco-soft transition-colors hover:bg-ivory hover:text-choco"
            aria-label={chat.close}
          >
            <CloseIcon />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="rounded-2xl rounded-tl-sm border border-beige bg-cream px-4 py-3 text-sm text-ink">
              {chat.welcome}
            </div>
            <div className="flex flex-wrap gap-2">
              {[chat.suggestion1, chat.suggestion2, chat.suggestion3].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setInput(s);
                    inputRef.current?.focus();
                  }}
                  className="rounded-full border border-beige bg-cream px-3 py-1.5 text-xs text-choco transition-colors hover:border-choco hover:bg-ivory"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <ChatMessageBubble key={m.id} message={m} assistantAvatarUrl={assistantAvatarUrl} />
        ))}
        {sending && (
          <div className="flex items-center gap-2 px-2 text-xs text-choco-soft">
            <SpinnerIcon />
            {chat.typing}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-rose-deep/40 bg-rose-soft px-3 py-2 text-xs text-choco">
            {error}
          </div>
        )}
      </div>

      <div className="border-t border-beige bg-cream/60 px-3 py-3">
        <div className="flex items-end gap-2 rounded-xl border border-beige bg-ivory px-3 py-2 focus-within:border-choco">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={chat.placeholder}
            rows={1}
            className="max-h-32 flex-1 resize-none border-0 bg-transparent text-sm text-ink placeholder:text-choco-soft focus:outline-none focus:ring-0"
            disabled={sending}
          />
          <button
            type="button"
            onClick={send}
            disabled={sending || !input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-choco text-ivory transition-colors hover:bg-choco-soft disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={chat.send}
          >
            <SendIcon />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] leading-tight text-choco-soft">
          {chat.disclaimer}
        </p>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12l16-8-4 16-4-6-8-2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
