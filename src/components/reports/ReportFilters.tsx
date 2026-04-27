"use client";

import { Clipboard, Download, Save } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
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
    <Card density="compact">
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
          <Input
            type={periodType === "weekly" ? "week" : "month"}
            value={periodKey}
            onChange={(event) => onPeriodKeyChange(event.target.value)}
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
          <Button onClick={onSave} className="rounded-2xl">
            <Save className="h-4 w-4" />
            {saveLabel}
          </Button>
          <Button
            onClick={onCopyMarkdown}
            variant="secondary"
            className="rounded-2xl"
          >
            <Clipboard className="h-4 w-4" />
            {copyLabel}
          </Button>
          <Button
            onClick={onDownloadMarkdown}
            variant="secondary"
            className="rounded-2xl"
          >
            <Download className="h-4 w-4" />
            {copy.reportsPage.downloadMarkdown}
          </Button>
        </div>
      </div>
    </Card>
  );
}
