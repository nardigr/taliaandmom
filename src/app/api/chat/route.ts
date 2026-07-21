import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getRequestIp } from "@/lib/request-ip";
import {
  attachChatAuthCookie,
  isChatSessionAuthorized,
} from "@/lib/chat-session-auth";
import {
  generateChatReply,
  type ChatHistoryItem,
} from "@/lib/ai/gemini";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { buildTools } from "@/lib/ai/tools";
import { isAiAssistantEnabled } from "@/lib/ai/assistant-config";
import {
  checkIpRateLimit,
  checkSessionMessageLimit,
  getMaxSessionMessages,
} from "@/lib/ai/chat-rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HISTORY_LIMIT = 30;

const postSchema = z.object({
  sessionId: z.string().uuid().nullish(),
  message: z.string().trim().min(1).max(2000),
});

function hashIp(ip: string): string {
  if (!ip || ip === "unknown") return "";
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  const enabled = await isAiAssistantEnabled();

  if (!sessionId) {
    return NextResponse.json({ enabled });
  }

  if (!isChatSessionAuthorized(request, sessionId)) {
    return NextResponse.json({ enabled, session: null });
  }

  const session = await db.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: HISTORY_LIMIT,
      },
    },
  });

  if (!session || session.status !== "active") {
    return NextResponse.json({ enabled, session: null });
  }

  return NextResponse.json({
    enabled: true,
    session: {
      id: session.id,
      messages: session.messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        })),
    },
  });
}

export async function POST(request: NextRequest) {
  if (!(await isAiAssistantEnabled())) {
    return NextResponse.json(
      { error: "Asistenti AI është i çaktivizuar." },
      { status: 503 },
    );
  }

  const ip = getRequestIp(request.headers);
  const ipKey = hashIp(ip);
  const rl = checkIpRateLimit(ipKey || ip || "unknown");
  if (rl.blocked) {
    return NextResponse.json(
      {
        error: "Shumë mesazhe. Provoni përsëri pas pak.",
        retryAfterSec: rl.retryAfterSec,
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: z.infer<typeof postSchema>;
  try {
    body = postSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Të dhëna të pavlefshme" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Kërkesë e pavlefshme" }, { status: 400 });
  }

  let session = body.sessionId
    ? await db.chatSession.findUnique({
        where: { id: body.sessionId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: HISTORY_LIMIT,
          },
        },
      })
    : null;

  if (session && !isChatSessionAuthorized(request, session.id)) {
    session = null;
  }

  if (!session) {
    session = await db.chatSession.create({
      data: {
        locale: "sq",
        ipHash: ipKey || null,
        userAgent: request.headers.get("user-agent")?.slice(0, 500) || null,
        status: "active",
      },
      include: { messages: true },
    });
  }

  const sessionLimit = checkSessionMessageLimit(session.messageCount);
  if (sessionLimit.blocked) {
    return NextResponse.json(
      {
        error: `Keni arritur limitin e ${getMaxSessionMessages()} mesazheve për bisedë. Filloni një bisedë të re.`,
        sessionId: session.id,
      },
      { status: 429 },
    );
  }

  const history: ChatHistoryItem[] = session.messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

  const systemPrompt = await buildSystemPrompt();

  const recentUserMessages = [
    ...session.messages.filter((m) => m.role === "user").map((m) => m.content),
    body.message,
  ];

  const tools = buildTools({ sessionId: session.id, recentUserMessages });

  await db.chatMessage.create({
    data: { sessionId: session.id, role: "user", content: body.message },
  });

  let reply;
  try {
    reply = await generateChatReply({
      systemPrompt,
      history,
      userMessage: body.message,
      tools,
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[chat] gemini error:", errMsg, err);
    await db.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "system",
        content: `[error] ${errMsg}`,
      },
    });
    return NextResponse.json(
      {
        error: "Asistenti nuk është i disponueshëm për momentin. Provoni përsëri pas pak.",
        debug: process.env.NODE_ENV === "production" ? undefined : errMsg,
      },
      { status: 502 },
    );
  }

  for (const ev of reply.toolEvents) {
    await db.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "tool",
        content: ev.name,
        toolName: ev.name,
        toolArgs: JSON.parse(JSON.stringify(ev.args ?? {})),
        toolResult: JSON.parse(JSON.stringify(ev.result ?? {})),
      },
    });
  }

  const replyText = reply.text || "Faleminderit!";

  await db.chatMessage.create({
    data: { sessionId: session.id, role: "assistant", content: replyText },
  });

  await db.chatSession.update({
    where: { id: session.id },
    data: {
      lastActivityAt: new Date(),
      messageCount: { increment: 2 },
    },
  });

  const response = NextResponse.json({
    sessionId: session.id,
    reply: replyText,
    actions: reply.toolEvents.map((e) => ({
      name: e.name,
      ok:
        typeof e.result === "object" && e.result !== null
          ? ((e.result as Record<string, unknown>).ok ?? null)
          : null,
    })),
  });
  attachChatAuthCookie(response, session.id);
  return response;
}
