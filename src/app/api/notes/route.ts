import { NextResponse } from "next/server";

import { getAllNotes, insertNote } from "@/lib/db";

// Reads/writes a local file via a native module — must run on the Node.js
// runtime and must never be statically prerendered.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/notes — all notes, most recently updated first (the UI re-sorts).
export async function GET() {
  try {
    return NextResponse.json(getAllNotes());
  } catch (error) {
    console.error("[api/notes] GET failed", error);
    return NextResponse.json({ error: "Failed to load notes" }, { status: 500 });
  }
}

// POST /api/notes — insert a single note (camelCase Note shape, id included).
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    return NextResponse.json(insertNote(body), { status: 201 });
  } catch (error) {
    console.error("[api/notes] POST failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create note" },
      { status: 400 },
    );
  }
}
