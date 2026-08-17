import { NextResponse } from "next/server";

import { importBackupData } from "@/lib/db";
import {
  collectScreenshotPaths,
  deleteOrphanedTradeScreenshots,
  restoreScreenshots,
} from "@/lib/uploads";

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

    const data =
      typeof body === "object" && body !== null && !Array.isArray(body)
        ? (body as Record<string, unknown>)
        : undefined;

    // Restore screenshot files after the DB transaction commits, so a failed
    // import never writes orphan files. Best-effort: missing/invalid images are
    // skipped and only the count is reported.
    const restoredScreenshots = await restoreScreenshots(data?.screenshots);

    // Delete screenshots on disk that the imported trades no longer reference.
    const removedScreenshots = await deleteOrphanedTradeScreenshots(
      collectScreenshotPaths(data?.trades),
    );

    return NextResponse.json({
      ...summary,
      screenshots: restoredScreenshots,
      removedScreenshots,
    });
  } catch (error) {
    console.error("[api/backup/import] POST failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import backup" },
      { status: 400 },
    );
  }
}
