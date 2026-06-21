import { NextResponse } from "next/server";

import { replaceAllPlaybooks } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/playbooks/import — atomically replace ALL playbooks with the
// supplied list inside a single transaction. Accepts either a bare array or
// `{ playbooks: [...] }`. Used by the one-time localStorage -> SQLite migration
// and by backup restore / clear / reset-to-seed.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const playbooks = Array.isArray(body)
    ? body
    : typeof body === "object" &&
        body !== null &&
        Array.isArray((body as { playbooks?: unknown }).playbooks)
      ? (body as { playbooks: unknown[] }).playbooks
      : null;

  if (playbooks === null) {
    return NextResponse.json(
      { error: "Expected an array of playbooks" },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(replaceAllPlaybooks(playbooks));
  } catch (error) {
    console.error("[api/playbooks/import] POST failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to import playbooks",
      },
      { status: 400 },
    );
  }
}
