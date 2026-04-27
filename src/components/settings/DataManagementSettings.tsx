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
  const { settings, updateSettings } = useUserSettings();
  const { trades, replaceTrades, resetTradesToSeed } = useTrades();
  const {
    dailyReviews,
    replaceDailyReviews,
    resetDailyReviewsToSeed,
  } = useDailyReviews();
  const { periodReports, replacePeriodReports, clearPeriodReports } =
    usePeriodReports();
  const { playbooks, replacePlaybooks, resetPlaybooksToSeed } = usePlaybooks();
  const { notes, replaceNotes, resetNotesToSeed } = useNotes();
  const { goals, replaceGoals, resetGoalsToSeed } = useGoals();
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

  function handleConfirmImport() {
    if (!pendingBackup) {
      return;
    }

    updateSettings(pendingBackup.data.settings);
    replaceTrades(pendingBackup.data.trades);
    replaceDailyReviews(pendingBackup.data.dailyReviews);
    replacePeriodReports(pendingBackup.data.periodReports);
    replacePlaybooks(pendingBackup.data.playbooks);
    replaceNotes(pendingBackup.data.notes ?? []);
    replaceGoals(pendingBackup.data.goals ?? []);
    setPendingBackup(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    markStatus("imported");
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
          className="flex min-h-12 items-center justify-between gap-4 rounded-[18px] border border-[rgba(148,163,184,0.16)] bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-[0_8px_18px_rgba(31,15,86,0.04)] transition-colors hover:border-[rgba(108,77,255,0.24)] hover:text-slate-950"
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
          className="flex min-h-12 items-center justify-between gap-4 rounded-[18px] border border-[rgba(148,163,184,0.16)] bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-[0_8px_18px_rgba(31,15,86,0.04)] transition-colors hover:border-[rgba(108,77,255,0.24)] hover:text-slate-950"
        >
          <span>{actionStatus === "imported" ? copy.settingsPage.imported : copy.settingsPage.importBackup}</span>
          <Upload className="h-4 w-4 text-[var(--accent)]" />
        </button>

        <button
          type="button"
          onClick={handleRestoreDemoData}
          className="flex min-h-12 items-center justify-between gap-4 rounded-[18px] border border-[rgba(108,77,255,0.14)] bg-[rgba(108,77,255,0.07)] px-4 py-3 text-left text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[rgba(108,77,255,0.11)]"
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
