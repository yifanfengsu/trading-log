import { NextResponse } from "next/server";

import {
  MAX_UPLOAD_BYTES,
  isAllowedImageType,
  saveTradeScreenshot,
} from "@/lib/uploads";

// Writes a file to the local filesystem — must run on the Node.js runtime and
// must never be statically prerendered.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/uploads — multipart/form-data with a `file` (image) field and an
// optional `tradeId`. Saves the image under uploads/trades/ and returns its
// relative path: { path: "uploads/trades/<file>" }.
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 },
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!isAllowedImageType(file.type)) {
    return NextResponse.json(
      { error: "Only PNG, JPEG, WebP, or GIF images are allowed" },
      { status: 415 },
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "File exceeds the 5MB size limit" },
      { status: 413 },
    );
  }

  const tradeIdValue = formData.get("tradeId");
  const tradeId = typeof tradeIdValue === "string" ? tradeIdValue : undefined;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const relativePath = await saveTradeScreenshot(
      arrayBuffer,
      file.type,
      tradeId,
    );

    return NextResponse.json({ path: relativePath }, { status: 201 });
  } catch (error) {
    console.error("[api/uploads] POST failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
