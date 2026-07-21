import path from "path";
import { env } from "@/lib/env";

const DEFAULT_UPLOADS_DIR = path.join(process.cwd(), "uploads");

export function getUploadsDir() {
  const configured = env.UPLOADS_DIR;
  if (!configured || configured === "./uploads") {
    return DEFAULT_UPLOADS_DIR;
  }

  if (path.isAbsolute(configured)) {
    return configured;
  }

  return path.join(process.cwd(), configured);
}

export function resolveUploadPath(relativePath: string) {
  const uploadsDir = getUploadsDir();
  const resolved = path.resolve(uploadsDir, relativePath);

  if (!resolved.startsWith(uploadsDir + path.sep) && resolved !== uploadsDir) {
    throw new Error("Invalid upload path");
  }

  return resolved;
}

export function getUploadPublicPath(relativePath: string) {
  return `/api/uploads/${relativePath.replace(/\\/g, "/")}`;
}
