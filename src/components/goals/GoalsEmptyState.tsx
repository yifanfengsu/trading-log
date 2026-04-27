"use client";

import { Plus, Target } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

interface GoalsEmptyStateProps {
  mode: "empty" | "filtered";
  onCreate: () => void;
}

export default function GoalsEmptyState({
  mode,
  onCreate,
}: GoalsEmptyStateProps) {
  const { dictionary: copy } = useLanguage();

  return (
    <section className="panel-card flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(108,77,255,0.09)] text-[var(--accent)]">
        <Target className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-slate-950">
        {mode === "empty"
          ? copy.goalsPage.noGoalsYet
          : copy.goalsPage.noFilterResults}
      </h2>
      {mode === "empty" ? (
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.22)] transition-colors hover:bg-[var(--accent-strong)]"
        >
          <Plus className="h-4 w-4" />
          {copy.goalsPage.newGoal}
        </button>
      ) : null}
    </section>
  );
}
