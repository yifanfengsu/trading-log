import { NextResponse } from "next/server";

import { getAllTrades, insertTrade } from "@/lib/db";

// Reads/writes a local file via a native module — must run on the Node.js
// runtime and must never be statically prerendered.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/trades — all trades, newest first (the UI re-sorts as needed).
export async function GET() {
  try {
    return NextResponse.json(getAllTrades());
  } catch (error) {
    console.error("[api/trades] GET failed", error);
    return NextResponse.json(
      { error: "Failed to load trades" },
      { status: 500 },
    );
  }
}

// POST /api/trades — insert a single trade (camelCase Trade shape, id included).
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    return NextResponse.json(insertTrade(body), { status: 201 });
  } catch (error) {
    console.error("[api/trades] POST failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create trade" },
      { status: 400 },
    );
  }
}
