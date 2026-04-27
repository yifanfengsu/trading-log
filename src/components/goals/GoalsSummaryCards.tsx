"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { GoalsSummary } from "@/lib/goal-calculations";
import { cn, formatPercent } from "@/lib/utils";

interface GoalsSummaryCardsProps {
  summary: GoalsSummary;
}

interface SummaryCardProps {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative" | "accent";
}

function SummaryCard({ label, value, tone = "neutral" }: SummaryCardProps) {
  return (
    <article className="panel-card p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-5 text-[30px] font-semibold tracking-[-0.04em]",
          tone === "accent" && "text-[var(--accent)]",
          tone === "positive" && "text-emerald-600",
          tone === "negative" && "text-rose-600",
          tone === "neutral" && "text-slate-950",
        )}
      >
        {value}
      </p>
    </article>
  );
}

export default function GoalsSummaryCards({ summary }: GoalsSummaryCardsProps) {
  const { dictionary: copy } = useLanguage();

  return (
    <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-5">
      <SummaryCard
        label={copy.goalsPage.totalGoals}
        value={String(summary.totalGoals)}
      />
      <SummaryCard
        label={copy.goalsPage.activeGoals}
        value={String(summary.activeGoals)}
        tone="accent"
      />
      <SummaryCard
        label={copy.goalsPage.achieved}
        value={String(summary.achievedGoals)}
        tone="positive"
      />
      <SummaryCard
        label={copy.goalsPage.atRisk}
        value={String(summary.atRiskGoals)}
        tone={summary.atRiskGoals > 0 ? "negative" : "neutral"}
      />
      <SummaryCard
        label={copy.goalsPage.avgProgress}
        value={formatPercent(summary.averageProgress, { digits: 0 })}
        tone="accent"
      />
    </section>
  );
}
