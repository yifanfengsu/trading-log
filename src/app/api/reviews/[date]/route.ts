import { NextResponse } from "next/server";

import { deleteReview, upsertReview } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In Next.js 16 the dynamic route `params` is a Promise and must be awaited.
// Daily reviews are keyed by their date, so the segment carries the date key.
type RouteParams = { params: Promise<{ date: string }> };

// PUT /api/reviews/:date — upsert a single review (camelCase DailyReview body).
export async function PUT(request: Request, { params }: RouteParams) {
  const { date } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const merged =
    typeof body === "object" && body !== null && !Array.isArray(body)
      ? { ...(body as Record<string, unknown>), date }
      : body;

  try {
    return NextResponse.json(upsertReview(merged));
  } catch (error) {
    console.error("[api/reviews/:date] PUT failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save review" },
      { status: 400 },
    );
  }
}

// DELETE /api/reviews/:date — remove the review for a given date.
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { date } = await params;

  try {
    const deleted = deleteReview(date);

    if (!deleted) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[api/reviews/:date] DELETE failed", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 },
    );
  }
}
