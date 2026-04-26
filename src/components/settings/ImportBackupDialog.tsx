"use client";

import { X } from "lucide-react";
import { createPortal } from "react-dom";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { BackupFile } from "@/lib/backup-types";
import { getBackupSummary } from "@/lib/backup-utils";
import { formatDateTime } from "@/lib/utils";

interface ImportBackupDialogProps {
  open: boolean;
  backup: BackupFile | null;
  onCancel: () => void;
  onConfirm: () => void;
}

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(148,163,184,0.12)] py-3 last:border-b-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-right text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export default function ImportBackupDialog({
  open,
  backup,
  onCancel,
  onConfirm,
}: ImportBackupDialogProps) {
  const { dictionary: copy, locale } = useLanguage();

  if (!open || !backup) {
    return null;
  }

  const summary = getBackupSummary(backup);

  const dialog = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto px-4 py-4 sm:py-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/24 backdrop-blur-[2px]"
        onClick={onCancel}
        aria-label={copy.tradeForm.cancel}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-backup-title"
        className="panel-card relative my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-[560px] flex-col overflow-hidden p-0"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[rgba(148,163,184,0.14)] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              {copy.settingsPage.backupAndRestore}
            </p>
            <h2
              id="import-backup-title"
              className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950"
            >
              {copy.settingsPage.importBackup}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(15,23,42,0.04)] text-slate-500 transition-colors hover:bg-[rgba(15,23,42,0.08)] hover:text-slate-900"
            aria-label={copy.tradeForm.cancel}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="rounded-[20px] bg-[rgba(250,250,255,0.88)] px-4">
            <SummaryRow
              label={copy.settingsPage.tradesCount}
              value={String(summary.tradesCount)}
            />
            <SummaryRow
              label={copy.settingsPage.dailyReviewsCount}
              value={String(summary.dailyReviewsCount)}
            />
            <SummaryRow
              label={copy.settingsPage.periodReportsCount}
              value={String(summary.periodReportsCount)}
            />
            <SummaryRow
              label={copy.settingsPage.playbooksCount}
              value={String(summary.playbooksCount)}
            />
            <SummaryRow
              label={copy.settingsPage.exportedAt}
              value={formatDateTime(summary.exportedAt, locale)}
            />
          </div>
          <p className="mt-4 rounded-[18px] bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            {copy.settingsPage.importReplaceConfirm}
          </p>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[rgba(148,163,184,0.14)] bg-white/92 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[rgba(148,163,184,0.18)] bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
          >
            {copy.tradeForm.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.22)] transition-colors hover:bg-[var(--accent-strong)]"
          >
            {copy.settingsPage.confirmImport}
          </button>
        </div>
      </section>
    </div>
  );

  return createPortal(dialog, document.body);
}
