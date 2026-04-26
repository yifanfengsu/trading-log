"use client";

import { Sparkles, Trash2 } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { SuggestedReportText } from "@/lib/report-types";
import { cn } from "@/lib/utils";

interface ReportEditorProps {
  value: SuggestedReportText;
  onChange: (value: SuggestedReportText) => void;
  onUseSuggestions: () => void;
  onClear: () => void;
}

type ReportEditorField = keyof SuggestedReportText;

const inputClass =
  "mt-2 w-full rounded-2xl border border-[rgba(148,163,184,0.18)] bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-[rgba(108,77,255,0.38)]";

export default function ReportEditor({
  value,
  onChange,
  onUseSuggestions,
  onClear,
}: ReportEditorProps) {
  const { dictionary: copy } = useLanguage();
  const fields: Array<{ key: ReportEditorField; label: string }> = [
    { key: "summary", label: copy.reportsPage.summary },
    { key: "keyWins", label: copy.reportsPage.keyWins },
    { key: "keyMistakes", label: copy.reportsPage.keyMistakes },
    { key: "lessons", label: copy.reportsPage.lessons },
    { key: "nextActions", label: copy.reportsPage.nextActions },
  ];

  function updateField(key: ReportEditorField, nextValue: string) {
    onChange({
      ...value,
      [key]: nextValue,
    });
  }

  return (
    <section className="panel-card h-fit p-5 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="panel-title">{copy.reportsPage.periodReview}</h2>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {copy.reportsPage.autoSuggestions}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onUseSuggestions}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[rgba(108,77,255,0.16)] bg-[rgba(108,77,255,0.08)] px-3 text-xs font-semibold text-[var(--accent)] transition-colors hover:border-[rgba(108,77,255,0.28)]"
          >
            <Sparkles className="h-4 w-4" />
            {copy.reportsPage.useSuggestions}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[rgba(148,163,184,0.18)] bg-white px-3 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
          >
            <Trash2 className="h-4 w-4" />
            {copy.reportsPage.clear}
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {fields.map((field) => (
          <label
            key={field.key}
            className="block text-sm font-medium text-slate-600"
          >
            {field.label}
            <textarea
              value={value[field.key]}
              onChange={(event) => updateField(field.key, event.target.value)}
              className={cn(inputClass, "min-h-24 resize-none py-3")}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
