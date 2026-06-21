import { NextResponse } from "next/server";

import { replaceAllGoals } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/goals/import — atomically replace ALL goals with the supplied list
// inside a single transaction. Accepts either a bare array of goals or
// `{ goals: [...] }`. Used by the one-time localStorage -> SQLite migration and
// by backup restore / clear / reset-to-seed.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const goals = Array.isArray(body)
    ? body
    : typeof body === "object" &&
        body !== null &&
        Array.isArray((body as { goals?: unknown }).goals)
      ? (body as { goals: unknown[] }).goals
      : null;

  if (goals === null) {
    return NextResponse.json(
      { error: "Expected an array of goals" },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(replaceAllGoals(goals));
  } catch (error) {
    console.error("[api/goals/import] POST failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import goals" },
      { status: 400 },
    );
  }
}
