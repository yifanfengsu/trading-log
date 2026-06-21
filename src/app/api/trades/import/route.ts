import { NextResponse } from "next/server";

import { replaceAllTrades } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/trades/import — atomically replace ALL trades with the supplied
// list inside a single transaction. Accepts either a bare array of trades or
// `{ trades: [...] }`. Used by the one-time localStorage -> SQLite migration
// and by backup restore / clear / reset-to-seed.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const trades = Array.isArray(body)
    ? body
    : typeof body === "object" &&
        body !== null &&
        Array.isArray((body as { trades?: unknown }).trades)
      ? (body as { trades: unknown[] }).trades
      : null;

  if (trades === null) {
    return NextResponse.json(
      { error: "Expected an array of trades" },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(replaceAllTrades(trades));
  } catch (error) {
    console.error("[api/trades/import] POST failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import trades" },
      { status: 400 },
    );
  }
}
