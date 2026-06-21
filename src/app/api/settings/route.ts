import { NextResponse } from "next/server";

import { getUserSettings, saveUserSettings } from "@/lib/db";

// Reads/writes a local file via a native module — must run on the Node.js
// runtime and must never be statically prerendered.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Settings are a single global object, not a list, so the route exposes a
// read (GET) and a whole-object upsert (PUT) against one fixed row.

// GET /api/settings — the stored settings, or the defaults when none exist yet.
export async function GET() {
  try {
    return NextResponse.json(getUserSettings());
  } catch (error) {
    console.error("[api/settings] GET failed", error);
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 },
    );
  }
}

// PUT /api/settings — upsert the whole settings object (camelCase UserSettings).
// Used on mount-migration, for updates, reset-to-defaults and backup restore.
export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    return NextResponse.json(saveUserSettings(body));
  } catch (error) {
    console.error("[api/settings] PUT failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save settings",
      },
      { status: 400 },
    );
  }
}
