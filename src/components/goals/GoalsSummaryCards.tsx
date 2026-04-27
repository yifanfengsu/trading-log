"use client";

import { AlertTriangle, CheckCircle2, Gauge, ListChecks, Target } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import StatCard from "@/components/ui/StatCard";
import type { GoalsSummary } from "@/lib/goal-calculations";
import { formatPercent } from "@/lib/utils";

interface GoalsSummaryCardsProps {
  summary: GoalsSummary;
}

export default function GoalsSummaryCards({ summary }: GoalsSummaryCardsProps) {
  const { dictionary: copy } = useLanguage();

  return (
    <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-5">
      <StatCard
        label={copy.goalsPage.totalGoals}
        value={String(summary.totalGoals)}
        icon={ListChecks}
      />
      <StatCard
        label={copy.goalsPage.activeGoals}
        value={String(summary.activeGoals)}
        tone="accent"
        icon={Target}
      />
      <StatCard
        label={copy.goalsPage.achieved}
        value={String(summary.achievedGoals)}
        tone="positive"
        icon={CheckCircle2}
      />
      <StatCard
        label={copy.goalsPage.atRisk}
        value={String(summary.atRiskGoals)}
        tone={summary.atRiskGoals > 0 ? "negative" : "neutral"}
        icon={AlertTriangle}
      />
      <StatCard
        label={copy.goalsPage.avgProgress}
        value={formatPercent(summary.averageProgress, { digits: 0 })}
        tone="accent"
        icon={Gauge}
      />
    </section>
  );
}
