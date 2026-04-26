"use client";

import { FileText, Trash2 } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { PeriodReport } from "@/lib/report-types";
import {
  formatDateTime,
  formatMonthLabel,
  formatWeekLabel,
} from "@/lib/utils";

interface SavedReportsListProps {
  reports: PeriodReport[];
  onOpen: (report: PeriodReport) => void;
  onDelete: (id: string) => void;
}

export default function SavedReportsList({
  reports,
  onOpen,
  onDelete,
}: SavedReportsListProps) {
  const { dictionary: copy, locale } = useLanguage();
  const displayReports = [...reports]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 10);

  function getPeriodLabel(report: PeriodReport) {
    return report.periodType === "weekly"
      ? formatWeekLabel(report.periodKey, locale)
      : formatMonthLabel(report.periodKey, locale);
  }

  function handleDelete(report: PeriodReport) {
    if (window.confirm(copy.reportsPage.deleteConfirm)) {
      onDelete(report.id);
    }
  }

  return (
    <section className="panel-card p-5 lg:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="panel-title">{copy.reportsPage.savedReports}</h2>
        <span className="rounded-full bg-[rgba(108,77,255,0.08)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
          {displayReports.length}
        </span>
      </div>

      {displayReports.length === 0 ? (
        <div className="mt-5 rounded-[20px] border border-dashed border-[rgba(148,163,184,0.22)] bg-[rgba(250,250,255,0.72)] px-4 py-10 text-center text-sm font-medium text-slate-400">
          {copy.reportsPage.noSavedReports}
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[760px] w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.08em] text-slate-400">
                <th className="px-3 pb-1 font-medium">
                  {copy.reportsPage.type}
                </th>
                <th className="px-3 pb-1 font-medium">
                  {copy.reportsPage.period}
                </th>
                <th className="px-3 pb-1 font-medium">
                  {copy.reportsPage.titleColumn}
                </th>
                <th className="px-3 pb-1 font-medium">
                  {copy.reportsPage.updated}
                </th>
                <th className="px-3 pb-1 text-right font-medium">
                  {copy.reportsPage.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {displayReports.map((report) => (
                <tr key={report.id} className="text-sm">
                  <td className="rounded-l-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(108,77,255,0.09)] px-3 py-1 font-semibold text-[var(--accent)]">
                      <FileText className="h-4 w-4" />
                      {report.periodType === "weekly"
                        ? copy.reportsPage.weekly
                        : copy.reportsPage.monthly}
                    </span>
                  </td>
                  <td className="bg-[rgba(250,250,255,0.88)] px-3 py-3 font-medium text-slate-600">
                    {getPeriodLabel(report)}
                  </td>
                  <td className="max-w-[300px] truncate bg-[rgba(250,250,255,0.88)] px-3 py-3 font-semibold text-slate-900">
                    {report.title}
                  </td>
                  <td className="bg-[rgba(250,250,255,0.88)] px-3 py-3 font-medium text-slate-600">
                    {formatDateTime(report.updatedAt, locale)}
                  </td>
                  <td className="rounded-r-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onOpen(report)}
                        className="inline-flex h-9 items-center rounded-full border border-[rgba(108,77,255,0.16)] bg-white px-3 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[rgba(108,77,255,0.08)]"
                      >
                        {copy.reportsPage.open}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(report)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-3 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        {copy.reportsPage.delete}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
