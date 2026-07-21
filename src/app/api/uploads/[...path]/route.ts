import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { resolveUploadPath } from "@/lib/storage/paths";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { path: segments } = await context.params;
    const relativePath = segments.join("/");
    const filePath = resolveUploadPath(relativePath);
    const file = await readFile(filePath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
