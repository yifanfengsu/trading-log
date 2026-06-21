import { NextResponse } from "next/server";

import { getAllGoals, insertGoal } from "@/lib/db";

// Reads/writes a local file via a native module — must run on the Node.js
// runtime and must never be statically prerendered.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/goals — all goals, most recently updated first (the UI re-sorts).
export async function GET() {
  try {
    return NextResponse.json(getAllGoals());
  } catch (error) {
    console.error("[api/goals] GET failed", error);
    return NextResponse.json({ error: "Failed to load goals" }, { status: 500 });
  }
}

// POST /api/goals — insert a single goal (camelCase Goal shape, id included).
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    return NextResponse.json(insertGoal(body), { status: 201 });
  } catch (error) {
    console.error("[api/goals] POST failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create goal" },
      { status: 400 },
    );
  }
}
