import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { getUploadsDir } from "@/lib/storage/paths";

const VARIANTS = [1600, 800, 400] as const;

async function writeRawVariants(buffer: Buffer, relativeBase: string) {
  // Fallback when sharp/native binaries are unavailable: store the same bytes
  // for each size path so the public URL still resolves.
  await Promise.all(
    VARIANTS.map(async (width) => {
      const outputPath = path.join(getUploadsDir(), `${relativeBase}-${width}.webp`);
      await fs.writeFile(outputPath, buffer);
    }),
  );
}

export async function saveProductImage(buffer: Buffer) {
  const id = randomUUID();
  const relativeBase = path.posix.join("products", id);
  const absoluteDir = path.join(getUploadsDir(), "products");

  await fs.mkdir(absoluteDir, { recursive: true });

  try {
    const sharp = (await import("sharp")).default;
    for (const width of VARIANTS) {
      const outputPath = path.join(getUploadsDir(), `${relativeBase}-${width}.webp`);
      await sharp(buffer)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outputPath);
    }
  } catch (error) {
    console.error("[storage] sharp failed, writing raw upload:", error);
    await writeRawVariants(buffer, relativeBase);
  }

  return `${relativeBase.replace(/\\/g, "/")}-800.webp`;
}

export async function deleteProductImage(relativePath: string) {
  const normalized = relativePath.replace(/\\/g, "/");
  const match = normalized.match(/^(products\/[^/]+)-(\d+)\.webp$/);
  if (!match) return;

  const base = match[1];
  await Promise.all(
    VARIANTS.map(async (width) => {
      const filePath = path.join(getUploadsDir(), `${base}-${width}.webp`);
      await fs.rm(filePath, { force: true });
    }),
  );
}
