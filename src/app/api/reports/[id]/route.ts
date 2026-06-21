import { NextResponse } from "next/server";

import { deleteReport, upsertReport } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In Next.js 16 the dynamic route `params` is a Promise and must be awaited.
type RouteParams = { params: Promise<{ id: string }> };

// PUT /api/reports/:id — upsert a single report (camelCase PeriodReport body).
export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const merged =
    typeof body === "object" && body !== null && !Array.isArray(body)
      ? { ...(body as Record<string, unknown>), id }
      : body;

  try {
    return NextResponse.json(upsertReport(merged));
  } catch (error) {
    console.error("[api/reports/:id] PUT failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save report" },
      { status: 400 },
    );
  }
}

// DELETE /api/reports/:id — remove a single report.
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const deleted = deleteReport(id);

    if (!deleted) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[api/reports/:id] DELETE failed", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 },
    );
  }
}
