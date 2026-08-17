"use client";

import { Download, RotateCcw, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useGoals } from "@/components/providers/GoalStoreProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useNotes } from "@/components/providers/NotesStoreProvider";
import { usePeriodReports } from "@/components/providers/PeriodReportStoreProvider";
import { usePlaybooks } from "@/components/providers/PlaybookStoreProvider";
import { useDailyReviews } from "@/components/providers/ReviewStoreProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import ImportBackupDialog from "@/components/settings/ImportBackupDialog";
import type { BackupFile } from "@/lib/backup-types";
import {
  createBackupFile,
  getBackupFileName,
  parseBackupJson,
  serializeBackup,
} from "@/lib/backup-utils";
import { downloadTextFile } from "@/lib/utils";

type ActionStatus = "exported" | "imported" | null;

export default function DataManagementSettings() {
  const { dictionary: copy } = useLanguage();
  const { settings, reloadSettings } = useUserSettings();
  const { trades, reloadTrades, resetTradesToSeed } = useTrades();
  const {
    dailyReviews,
    reloadDailyReviews,
    resetDailyReviewsToSeed,
  } = useDailyReviews();
  const { periodReports, reloadPeriodReports, clearPeriodReports } =
    usePeriodReports();
  const { playbooks, reloadPlaybooks, resetPlaybooksToSeed } = usePlaybooks();
  const { notes, reloadNotes, resetNotesToSeed } = useNotes();
  const { goals, reloadGoals, resetGoalsToSeed } = useGoals();
  const [pendingBackup, setPendingBackup] = useState<BackupFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<ActionStatus>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  function markStatus(status: ActionStatus) {
    setActionStatus(status);

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setActionStatus(null);
      timerRef.current = null;
    }, 1500);
  }

  function handleExportBackup() {
    const backup = createBackupFile({
      settings,
      trades,
      dailyReviews,
      periodReports,
      playbooks,
      notes,
      goals,
    });

    downloadTextFile(
      getBackupFileName(),
      serializeBackup(backup),
      "application/json;charset=utf-8",
    );
    setError(null);
    markStatus("exported");
  }

  async function handleImportFile(file: File | undefined) {
    if (!file) {
      setError(copy.settingsPage.chooseBackupFile);
      return;
    }

    const text = await file.text();
    const backup = parseBackupJson(text);

    if (!backup) {
      setError(copy.settingsPage.invalidBackupFile);
      setPendingBackup(null);
      return;
    }

    setError(null);
    setPendingBackup(backup);
  }

  async function handleConfirmImport() {
    if (!pendingBackup) {
      return;
    }

    try {
      // Replace every domain in one atomic transaction server-side, then reload
      // each store from SQLite so the in-memory state mirrors what actually
      // persisted (no partial restore on a mid-import failure).
      const response = await fetch("/api/backup/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingBackup.data),
      });

      if (!response.ok) {
        throw new Error(`import failed with status ${response.status}`);
      }

      await Promise.all([
        reloadTrades(),
        reloadDailyReviews(),
        reloadPeriodReports(),
        reloadPlaybooks(),
        reloadNotes(),
        reloadGoals(),
        reloadSettings(),
      ]);

      setPendingBackup(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      markStatus("imported");
    } catch (error) {
      console.error("[settings] backup import failed", error);
      setError(copy.settingsPage.invalidBackupFile);
    }
  }

  function handleCancelImport() {
    setPendingBackup(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleRestoreDemoData() {
    if (!window.confirm(copy.settingsPage.restoreDemoDataConfirm)) {
      return;
    }

    resetTradesToSeed();
    resetDailyReviewsToSeed();
    resetPlaybooksToSeed();
    resetNotesToSeed();
    resetGoalsToSeed();
    clearPeriodReports();
    setError(null);
  }

  return (
    <section className="panel-card p-5 lg:p-6">
      <h2 className="panel-title">{copy.settingsPage.dataManagement}</h2>

      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={handleExportBackup}
          className="flex min-h-12 items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-[rgba(30,33,30,0.46)] px-4 py-3 text-left text-sm font-semibold text-slate-200 shadow-[0_10px_24px_rgba(0,0,0,0.20)] transition-colors hover:border-[rgba(184,241,53,0.34)] hover:text-white"
        >
          <span>{actionStatus === "exported" ? copy.settingsPage.exported : copy.settingsPage.exportBackup}</span>
          <Download className="h-4 w-4 text-[var(--accent)]" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(event) => {
            void handleImportFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex min-h-12 items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-[rgba(30,33,30,0.46)] px-4 py-3 text-left text-sm font-semibold text-slate-200 shadow-[0_10px_24px_rgba(0,0,0,0.20)] transition-colors hover:border-[rgba(184,241,53,0.34)] hover:text-white"
        >
          <span>{actionStatus === "imported" ? copy.settingsPage.imported : copy.settingsPage.importBackup}</span>
          <Upload className="h-4 w-4 text-[var(--accent)]" />
        </button>

        <button
          type="button"
          onClick={handleRestoreDemoData}
          className="flex min-h-12 items-center justify-between gap-4 rounded-[18px] border border-[rgba(184,241,53,0.24)] bg-[rgba(184,241,53,0.10)] px-4 py-3 text-left text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[rgba(184,241,53,0.16)]"
        >
          <span>{copy.settingsPage.restoreDemoData}</span>
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {copy.settingsPage.backupIncludesPlaybooks}
        <br />
        {copy.settingsPage.backupIncludesNotes}
        <br />
        {copy.settingsPage.backupIncludesGoals}
      </p>

      {error ? (
        <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
          {error}
        </p>
      ) : null}

      <ImportBackupDialog
        open={pendingBackup !== null}
        backup={pendingBackup}
        onCancel={handleCancelImport}
        onConfirm={handleConfirmImport}
      />
    </section>
  );
}
