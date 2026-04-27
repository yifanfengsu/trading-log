"use client";

import { Sparkles, Trash2 } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import Textarea from "@/components/ui/Textarea";
import type { SuggestedReportText } from "@/lib/report-types";

interface ReportEditorProps {
  value: SuggestedReportText;
  onChange: (value: SuggestedReportText) => void;
  onUseSuggestions: () => void;
  onClear: () => void;
}

type ReportEditorField = keyof SuggestedReportText;

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
    <Card as="section" className="h-fit">
      <SectionHeader
        title={copy.reportsPage.periodReview}
        description={copy.reportsPage.autoSuggestions}
        action={
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={onUseSuggestions}
              variant="outline"
              size="sm"
            >
              <Sparkles className="h-4 w-4" />
              {copy.reportsPage.useSuggestions}
            </Button>
            <Button
              type="button"
              onClick={onClear}
              variant="secondary"
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
              {copy.reportsPage.clear}
            </Button>
          </div>
        }
      />

      <div className="mt-5 space-y-4">
        {fields.map((field) => (
          <label
            key={field.key}
            className="block text-sm font-medium text-slate-600"
          >
            {field.label}
            <Textarea
              value={value[field.key]}
              onChange={(event) => updateField(field.key, event.target.value)}
              className="mt-2 min-h-24 resize-none"
            />
          </label>
        ))}
      </div>
    </Card>
  );
}
