import { NextResponse } from "next/server";

import { deleteNote, updateNote } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In Next.js 16 the dynamic route `params` is a Promise and must be awaited.
type RouteParams = { params: Promise<{ id: string }> };

// PUT /api/notes/:id — replace a single note (camelCase Note shape in body).
export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const note = updateNote(id, body);

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("[api/notes/:id] PUT failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update note" },
      { status: 400 },
    );
  }
}

// DELETE /api/notes/:id — remove a single note.
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const deleted = deleteNote(id);

    if (!deleted) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[api/notes/:id] DELETE failed", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
