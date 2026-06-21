import { NextResponse } from "next/server";

import { replaceAllReports } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/reports/import — atomically replace ALL period reports with the
// supplied list inside a single transaction. Accepts either a bare array or
// `{ periodReports: [...] }`. Used by the one-time localStorage -> SQLite
// migration and by backup restore / clear.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const reports = Array.isArray(body)
    ? body
    : typeof body === "object" &&
        body !== null &&
        Array.isArray((body as { periodReports?: unknown }).periodReports)
      ? (body as { periodReports: unknown[] }).periodReports
      : null;

  if (reports === null) {
    return NextResponse.json(
      { error: "Expected an array of reports" },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(replaceAllReports(reports));
  } catch (error) {
    console.error("[api/reports/import] POST failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to import reports",
      },
      { status: 400 },
    );
  }
}
