"use client";

import { Clipboard, Download, Save } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { ReportPeriodType } from "@/lib/report-types";
import { cn } from "@/lib/utils";

interface ReportFiltersProps {
  periodType: ReportPeriodType;
  periodKey: string;
  rangeLabel: string;
  saveLabel: string;
  copyLabel: string;
  onPeriodTypeChange: (periodType: ReportPeriodType) => void;
  onPeriodKeyChange: (periodKey: string) => void;
  onSave: () => void;
  onCopyMarkdown: () => void;
  onDownloadMarkdown: () => void;
}

const fieldClass =
  "h-11 w-full rounded-2xl border border-[rgba(148,163,184,0.18)] bg-white px-3 text-sm font-medium text-slate-600 outline-none transition-colors focus:border-[rgba(108,77,255,0.38)]";

export default function ReportFilters({
  periodType,
  periodKey,
  rangeLabel,
  saveLabel,
  copyLabel,
  onPeriodTypeChange,
  onPeriodKeyChange,
  onSave,
  onCopyMarkdown,
  onDownloadMarkdown,
}: ReportFiltersProps) {
  const { dictionary: copy } = useLanguage();
  const options: Array<{ value: ReportPeriodType; label: string }> = [
    { value: "weekly", label: copy.reportsPage.weekly },
    { value: "monthly", label: copy.reportsPage.monthly },
  ];

  return (
    <section className="panel-card p-4 lg:p-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(240px,0.78fr)_minmax(190px,0.56fr)_minmax(240px,0.9fr)_auto] xl:items-end">
        <div className="grid gap-1.5">
          <span className="px-1 text-xs font-semibold text-slate-400">
            {copy.reportsPage.reportType}
          </span>
          <div className="grid h-11 grid-cols-2 rounded-2xl border border-[rgba(148,163,184,0.16)] bg-white p-1">
            {options.map((option) => {
              const isActive = periodType === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onPeriodTypeChange(option.value)}
                  aria-pressed={isActive}
                  className={cn(
                    "rounded-[14px] px-3 text-sm font-semibold transition-all",
                    isActive
                      ? "bg-[var(--accent)] text-white shadow-[0_10px_18px_rgba(108,77,255,0.20)]"
                      : "text-slate-500 hover:text-slate-900",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="grid gap-1.5">
          <span className="px-1 text-xs font-semibold text-slate-400">
            {copy.reportsPage.period}
          </span>
          <input
            type={periodType === "weekly" ? "week" : "month"}
            value={periodKey}
            onChange={(event) => onPeriodKeyChange(event.target.value)}
            className={fieldClass}
          />
        </label>

        <div className="grid gap-1.5">
          <span className="px-1 text-xs font-semibold text-slate-400">
            {copy.reportsPage.period}
          </span>
          <div className="flex h-11 items-center rounded-2xl border border-[rgba(108,77,255,0.12)] bg-[rgba(108,77,255,0.08)] px-3 text-sm font-semibold text-[var(--accent)]">
            {rangeLabel}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 xl:flex xl:justify-end">
          <button
            type="button"
            onClick={onSave}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.22)] transition-colors hover:bg-[var(--accent-strong)]"
          >
            <Save className="h-4 w-4" />
            {saveLabel}
          </button>
          <button
            type="button"
            onClick={onCopyMarkdown}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[rgba(148,163,184,0.18)] bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:border-[rgba(108,77,255,0.22)] hover:text-slate-900"
          >
            <Clipboard className="h-4 w-4" />
            {copyLabel}
          </button>
          <button
            type="button"
            onClick={onDownloadMarkdown}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[rgba(148,163,184,0.18)] bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:border-[rgba(108,77,255,0.22)] hover:text-slate-900"
          >
            <Download className="h-4 w-4" />
            {copy.reportsPage.downloadMarkdown}
          </button>
        </div>
      </div>
    </section>
  );
}
