import { NextResponse } from "next/server";

import { deleteGoal, updateGoal } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In Next.js 16 the dynamic route `params` is a Promise and must be awaited.
type RouteParams = { params: Promise<{ id: string }> };

// PUT /api/goals/:id — replace a single goal (camelCase Goal shape in body).
export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const goal = updateGoal(id, body);

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error("[api/goals/:id] PUT failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update goal" },
      { status: 400 },
    );
  }
}

// DELETE /api/goals/:id — remove a single goal.
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const deleted = deleteGoal(id);

    if (!deleted) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[api/goals/:id] DELETE failed", error);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}
