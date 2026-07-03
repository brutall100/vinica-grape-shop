import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

/**
 * Stores an uploaded image and returns its public URL.
 * Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set (production),
 * otherwise writes to public/uploads (local development).
 */
export async function saveUpload(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error("UNSUPPORTED_TYPE");
  if (file.size > MAX_SIZE) throw new Error("FILE_TOO_LARGE");

  const filename = `${randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`products/${filename}`, file, { access: "public" });
    return blob.url;
  }

  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(dir, filename), buffer);
  return `/uploads/${filename}`;
}
