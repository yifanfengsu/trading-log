import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Local file storage for per-trade chart screenshots (Plan A). Files live under
// <project root>/uploads/trades/ and are git-ignored; the database only stores
// the relative path (e.g. "uploads/trades/<id>-<ts>.png"). This module is the
// single place that knows the on-disk layout and enforces the traversal guard.

// All paths are anchored to this root. Kept POSIX-style in the DB / URLs.
const UPLOADS_ROOT = path.join(process.cwd(), "uploads");
const TRADES_DIRNAME = "trades";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

// Allowed image MIME types -> file extension used on disk.
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

// Content-Type returned when serving a file, keyed by extension.
const TYPE_BY_EXTENSION: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

export function isAllowedImageType(type: string): boolean {
  return Object.prototype.hasOwnProperty.call(EXTENSION_BY_TYPE, type);
}

export function getContentTypeForPath(filePath: string): string {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return TYPE_BY_EXTENSION[ext] ?? "application/octet-stream";
}

// Saves an uploaded image to uploads/trades/ and returns its relative path.
// Throws on an unsupported type so the route can answer 400.
export async function saveTradeScreenshot(
  data: ArrayBuffer,
  type: string,
  tradeId?: string,
): Promise<string> {
  const ext = EXTENSION_BY_TYPE[type];

  if (!ext) {
    throw new Error("Unsupported file type");
  }

  const dir = path.join(UPLOADS_ROOT, TRADES_DIRNAME);
  await mkdir(dir, { recursive: true });

  const safeBase =
    (tradeId ?? "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "trade";
  const filename = `${safeBase}-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

  await writeFile(path.join(dir, filename), Buffer.from(data));

  // POSIX-style relative path; the URL is "/api/" + this value.
  return `uploads/${TRADES_DIRNAME}/${filename}`;
}

// Resolves catch-all route segments (everything after /api/uploads/) to an
// absolute file path inside UPLOADS_ROOT. Returns null on any traversal attempt
// or when the resolved path escapes the uploads root.
export function resolveUploadFile(segments: string[]): string | null {
  if (!Array.isArray(segments) || segments.length === 0) {
    return null;
  }

  if (
    segments.some(
      (segment) =>
        segment.length === 0 ||
        segment === "." ||
        segment === ".." ||
        segment.includes("/") ||
        segment.includes("\\"),
    )
  ) {
    return null;
  }

  const target = path.resolve(UPLOADS_ROOT, ...segments);
  const root = path.resolve(UPLOADS_ROOT);

  if (target !== root && !target.startsWith(root + path.sep)) {
    return null;
  }

  return target;
}

// Best-effort deletion of a trade's screenshot files. Never throws — a missing
// file or permission error is logged and skipped so it cannot block a delete.
export async function deleteTradeScreenshots(paths: unknown): Promise<void> {
  if (!Array.isArray(paths)) {
    return;
  }

  for (const relativePath of paths) {
    if (typeof relativePath !== "string") {
      continue;
    }

    const normalized = relativePath.replace(/^\/+/, "");

    if (!normalized.startsWith(`uploads/${TRADES_DIRNAME}/`)) {
      continue;
    }

    const segments = normalized
      .slice("uploads/".length)
      .split("/")
      .filter(Boolean);
    const absolute = resolveUploadFile(segments);

    if (!absolute) {
      continue;
    }

    try {
      await unlink(absolute);
    } catch (error) {
      console.error("[uploads] failed to delete", relativePath, error);
    }
  }
}
