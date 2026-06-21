import { readFile } from "node:fs/promises";

import { NextResponse } from "next/server";

import { getContentTypeForPath, resolveUploadFile } from "@/lib/uploads";

// Serves locally-stored upload files. Reads from disk via a native API, so it
// must run on the Node.js runtime and must not be prerendered.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In Next.js 16 the dynamic route `params` is a Promise and must be awaited.
type RouteParams = { params: Promise<{ path: string[] }> };

// GET /api/uploads/<...path> — serves a file from uploads/. The catch-all
// segments are validated against the uploads root (no traversal) before reading.
// e.g. stored path "uploads/trades/x.png" is served at "/api/uploads/trades/x.png".
export async function GET(_request: Request, { params }: RouteParams) {
  const { path: segments } = await params;
  const filePath = resolveUploadFile(segments);

  if (!filePath) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const file = await readFile(filePath);

    return new NextResponse(new Uint8Array(file), {
      status: 200,
      headers: {
        "Content-Type": getContentTypeForPath(filePath),
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
