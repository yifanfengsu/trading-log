import { NextResponse } from "next/server";

import { getAllPlaybooks, insertPlaybook } from "@/lib/db";

// Reads/writes a local file via a native module — must run on the Node.js
// runtime and must never be statically prerendered.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/playbooks — all playbooks, most recently updated first (UI re-sorts).
export async function GET() {
  try {
    return NextResponse.json(getAllPlaybooks());
  } catch (error) {
    console.error("[api/playbooks] GET failed", error);
    return NextResponse.json(
      { error: "Failed to load playbooks" },
      { status: 500 },
    );
  }
}

// POST /api/playbooks — insert one playbook (camelCase Playbook shape, id incl).
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    return NextResponse.json(insertPlaybook(body), { status: 201 });
  } catch (error) {
    console.error("[api/playbooks] POST failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create playbook",
      },
      { status: 400 },
    );
  }
}
