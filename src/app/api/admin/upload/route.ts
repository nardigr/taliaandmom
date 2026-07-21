import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveProductImage } from "@/lib/storage/local";
import { getUploadPublicPath } from "@/lib/storage/paths";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = await saveProductImage(buffer);
  const url = getUploadPublicPath(path);

  return NextResponse.json({ path, url });
}
