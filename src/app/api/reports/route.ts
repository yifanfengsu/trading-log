import { NextResponse } from "next/server";

import { getAllReports, upsertReport } from "@/lib/db";

// Reads/writes a local file via a native module — must run on the Node.js
// runtime and must never be statically prerendered.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/reports — all period reports, most recently updated first.
export async function GET() {
  try {
    return NextResponse.json(getAllReports());
  } catch (error) {
    console.error("[api/reports] GET failed", error);
    return NextResponse.json(
      { error: "Failed to load reports" },
      { status: 500 },
    );
  }
}

// POST /api/reports — upsert a single report keyed on its id (camelCase
// PeriodReport shape). Mirrors the provider's upsertReport.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    return NextResponse.json(upsertReport(body));
  } catch (error) {
    console.error("[api/reports] POST failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save report" },
      { status: 400 },
    );
  }
}
