import { NextResponse } from "next/server";

import { getAllReviews, upsertReview } from "@/lib/db";

// Reads/writes a local file via a native module — must run on the Node.js
// runtime and must never be statically prerendered.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/reviews — all daily reviews, newest date first (the UI re-sorts).
export async function GET() {
  try {
    return NextResponse.json(getAllReviews());
  } catch (error) {
    console.error("[api/reviews] GET failed", error);
    return NextResponse.json(
      { error: "Failed to load reviews" },
      { status: 500 },
    );
  }
}

// POST /api/reviews — upsert a single review keyed on its date (camelCase
// DailyReview shape). Mirrors the provider's upsertReview.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    return NextResponse.json(upsertReview(body));
  } catch (error) {
    console.error("[api/reviews] POST failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save review" },
      { status: 400 },
    );
  }
}
