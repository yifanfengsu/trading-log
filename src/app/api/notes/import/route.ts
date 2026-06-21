import { NextResponse } from "next/server";

import { replaceAllNotes } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/notes/import — atomically replace ALL notes with the supplied list
// inside a single transaction. Accepts either a bare array of notes or
// `{ notes: [...] }`. Used by the one-time localStorage -> SQLite migration and
// by backup restore / clear / reset-to-seed.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const notes = Array.isArray(body)
    ? body
    : typeof body === "object" &&
        body !== null &&
        Array.isArray((body as { notes?: unknown }).notes)
      ? (body as { notes: unknown[] }).notes
      : null;

  if (notes === null) {
    return NextResponse.json(
      { error: "Expected an array of notes" },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(replaceAllNotes(notes));
  } catch (error) {
    console.error("[api/notes/import] POST failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import notes" },
      { status: 400 },
    );
  }
}
