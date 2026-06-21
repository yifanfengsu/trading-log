import { NextResponse } from "next/server";

import { deletePlaybook, updatePlaybook } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In Next.js 16 the dynamic route `params` is a Promise and must be awaited.
type RouteParams = { params: Promise<{ id: string }> };

// PUT /api/playbooks/:id — replace one playbook (camelCase Playbook in body).
export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const playbook = updatePlaybook(id, body);

    if (!playbook) {
      return NextResponse.json({ error: "Playbook not found" }, { status: 404 });
    }

    return NextResponse.json(playbook);
  } catch (error) {
    console.error("[api/playbooks/:id] PUT failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update playbook",
      },
      { status: 400 },
    );
  }
}

// DELETE /api/playbooks/:id — remove a single playbook.
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const deleted = deletePlaybook(id);

    if (!deleted) {
      return NextResponse.json({ error: "Playbook not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[api/playbooks/:id] DELETE failed", error);
    return NextResponse.json(
      { error: "Failed to delete playbook" },
      { status: 500 },
    );
  }
}
