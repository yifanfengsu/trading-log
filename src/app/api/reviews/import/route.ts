import { NextResponse } from "next/server";

import { replaceAllReviews } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/reviews/import — atomically replace ALL daily reviews with the
// supplied list inside a single transaction. Accepts either a bare array or
// `{ dailyReviews: [...] }`. Used by the one-time localStorage -> SQLite
// migration and by backup restore / clear / reset-to-seed.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const reviews = Array.isArray(body)
    ? body
    : typeof body === "object" &&
        body !== null &&
        Array.isArray((body as { dailyReviews?: unknown }).dailyReviews)
      ? (body as { dailyReviews: unknown[] }).dailyReviews
      : null;

  if (reviews === null) {
    return NextResponse.json(
      { error: "Expected an array of reviews" },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(replaceAllReviews(reviews));
  } catch (error) {
    console.error("[api/reviews/import] POST failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to import reviews",
      },
      { status: 400 },
    );
  }
}
