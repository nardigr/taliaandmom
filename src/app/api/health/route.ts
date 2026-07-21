import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      db: "connected",
      at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        db: "disconnected",
        at: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
