import { NextResponse } from "next/server";

import { deleteTrade, updateTrade } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In Next.js 16 the dynamic route `params` is a Promise and must be awaited.
type RouteParams = { params: Promise<{ id: string }> };

// PUT /api/trades/:id — replace a single trade (camelCase Trade shape in body).
export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const trade = updateTrade(id, body);

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    return NextResponse.json(trade);
  } catch (error) {
    console.error("[api/trades/:id] PUT failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update trade" },
      { status: 400 },
    );
  }
}

// DELETE /api/trades/:id — remove a single trade.
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const deleted = deleteTrade(id);

    if (!deleted) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[api/trades/:id] DELETE failed", error);
    return NextResponse.json(
      { error: "Failed to delete trade" },
      { status: 500 },
    );
  }
}
