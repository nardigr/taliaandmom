import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

const COOKIE_NAME = "talja_chat_auth";
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

function getSecret(): string {
  return env.AUTH_SECRET;
}

function encodeBase64Url(data: string): string {
  return Buffer.from(data, "utf-8").toString("base64url");
}

function decodeBase64Url(data: string): string {
  return Buffer.from(data, "base64url").toString("utf-8");
}

export function createChatAuthToken(sessionId: string): string {
  const payload = { sid: sessionId, exp: Date.now() + MAX_AGE_SEC * 1000 };
  const payloadB64 = encodeBase64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", getSecret()).update(payloadB64).digest("base64url");
  return `${payloadB64}.${signature}`;
}

export function verifyChatAuthToken(token: string, sessionId: string): boolean {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return false;

    const expectedSig = createHmac("sha256", getSecret()).update(payloadB64).digest("base64url");
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return false;

    const payload = JSON.parse(decodeBase64Url(payloadB64)) as { sid?: string; exp?: number };
    if (!payload.sid || payload.sid !== sessionId) return false;
    if (payload.exp && payload.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export function isChatSessionAuthorized(request: NextRequest, sessionId: string): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyChatAuthToken(token, sessionId);
}

export function attachChatAuthCookie(response: NextResponse, sessionId: string): void {
  response.cookies.set(COOKIE_NAME, createChatAuthToken(sessionId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}
