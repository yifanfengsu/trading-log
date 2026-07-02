"use client";

import { createPortal } from "react-dom";

import { useLanguage } from "@/components/providers/LanguageProvider";
import Button from "@/components/ui/Button";
import DialogShell from "@/components/ui/DialogShell";
import type { BackupFile } from "@/lib/backup-types";
import { getBackupSummary } from "@/lib/backup-utils";
import { formatDateTime } from "@/lib/utils";
import { useEscapeKey } from "@/lib/use-escape-key";

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
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(155,163,155,0.12)] py-3 last:border-b-0">
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

  useEscapeKey(onCancel, open);

  if (!open || !backup) {
    return null;
  }

  const summary = getBackupSummary(backup);

  const dialog = (
    <DialogShell
      title={copy.settingsPage.importBackup}
      eyebrow={copy.settingsPage.backupAndRestore}
      closeLabel={copy.tradeForm.cancel}
      labelledById="import-backup-title"
      onClose={onCancel}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {copy.tradeForm.cancel}
          </Button>
          <Button type="button" onClick={onConfirm}>
            {copy.settingsPage.confirmImport}
          </Button>
        </div>
      }
    >
          <div className="rounded-[20px] border border-slate-100 bg-slate-50/70 px-4">
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
              label={copy.settingsPage.notesCount}
              value={String(summary.notesCount)}
            />
            <SummaryRow
              label={copy.settingsPage.goalsCount}
              value={String(summary.goalsCount)}
            />
            <SummaryRow
              label={copy.settingsPage.exportedAt}
              value={formatDateTime(summary.exportedAt, locale)}
            />
          </div>
          <p className="mt-4 rounded-[18px] bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            {copy.settingsPage.importReplaceConfirm}
          </p>
    </DialogShell>
  );

  return createPortal(dialog, document.body);
}
