import { NextResponse } from "next/server";

import { importBackupData } from "@/lib/db";
import { restoreScreenshots } from "@/lib/uploads";

// Writes to a local SQLite file via a native module — must run on the Node.js
// runtime and must never be statically prerendered.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/backup/import — atomically replace ALL domains (trades, reviews,
// reports, playbooks, notes, goals and settings) inside a single transaction.
// Accepts the `data` object of a BackupFile. Used by the settings "restore
// backup" flow so a failed import can never leave a half-restored state.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const summary = importBackupData(body);

    // Restore screenshot files after the DB transaction commits, so a failed
    // import never writes orphan files. Best-effort: missing/invalid images are
    // skipped and only the count is reported.
    const screenshots =
      typeof body === "object" && body !== null && !Array.isArray(body)
        ? (body as Record<string, unknown>).screenshots
        : undefined;
    const restoredScreenshots = await restoreScreenshots(screenshots);

    return NextResponse.json({ ...summary, screenshots: restoredScreenshots });
  } catch (error) {
    console.error("[api/backup/import] POST failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import backup" },
      { status: 400 },
    );
  }
}
