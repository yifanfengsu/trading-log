"use client";

import { ArrowRight, Target } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import GoalProgressBar from "@/components/goals/GoalProgressBar";
import RiskGuardrailsPanel from "@/components/goals/RiskGuardrailsPanel";
import { useGoals } from "@/components/providers/GoalStoreProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useDailyReviews } from "@/components/providers/ReviewStoreProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  getGoalProgress,
  getGoalsSummary,
  getRiskGuardrails,
} from "@/lib/goal-calculations";
import { cn, formatGoalValue, formatPercent } from "@/lib/utils";

const MAX_ACTIVE_GOALS = 4;

interface SummaryTileProps {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative" | "accent";
}

const tileToneClasses = {
  neutral: "text-slate-100",
  positive: "text-emerald-300",
  negative: "text-rose-300",
  accent: "text-violet-200",
} as const;

function SummaryTile({ label, value, tone = "neutral" }: SummaryTileProps) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-[rgba(15,23,42,0.46)] px-4 py-3">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className={cn("mt-1 text-lg font-semibold", tileToneClasses[tone])}>
        {value}
      </p>
    </div>
  );
}

export default function GoalsOverview() {
  const { dictionary: copy, locale } = useLanguage();
  const { goals } = useGoals();
  const { trades } = useTrades();
  const { dailyReviews } = useDailyReviews();
  const { settings } = useUserSettings();

  const summary = useMemo(
    () => getGoalsSummary(goals, trades, dailyReviews, settings.startingBalance),
    [dailyReviews, goals, settings.startingBalance, trades],
  );
  const guardrails = useMemo(
    () =>
      getRiskGuardrails(goals, trades, dailyReviews, settings.startingBalance),
    [dailyReviews, goals, settings.startingBalance, trades],
  );
  const activeGoals = useMemo(
    () =>
      goals
        .filter((goal) => goal.status === "active")
        .map((goal) => ({
          goal,
          progress: getGoalProgress(
            goal,
            trades,
            dailyReviews,
            settings.startingBalance,
          ),
        }))
        .sort((a, b) =>
          a.progress.atRisk === b.progress.atRisk ? 0 : a.progress.atRisk ? -1 : 1,
        )
        .slice(0, MAX_ACTIVE_GOALS),
    [dailyReviews, goals, settings.startingBalance, trades],
  );

  const manageLink = (
    <Link
      href="/goals"
      className="inline-flex items-center gap-1 text-sm font-semibold text-violet-200 transition-colors hover:text-cyan-200"
    >
      {copy.dashboardPage.manageGoals}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );

  if (goals.length === 0) {
    return (
      <Card>
        <SectionHeader
          title={copy.dashboardPage.goalsOverview}
          action={manageLink}
        />
        <EmptyState
          title={copy.goalsPage.noGoalsYet}
          icon={Target}
          className="mt-5 min-h-[200px]"
        />
      </Card>
    );
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
      <Card>
        <SectionHeader
          title={copy.dashboardPage.goalsOverview}
          action={manageLink}
        />

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryTile
            label={copy.goalsPage.activeGoals}
            value={String(summary.activeGoals)}
            tone="accent"
          />
          <SummaryTile
            label={copy.goalsPage.achieved}
            value={String(summary.achievedGoals)}
            tone="positive"
          />
          <SummaryTile
            label={copy.goalsPage.atRisk}
            value={String(summary.atRiskGoals)}
            tone={summary.atRiskGoals > 0 ? "negative" : "neutral"}
          />
          <SummaryTile
            label={copy.goalsPage.avgProgress}
            value={formatPercent(summary.averageProgress, { digits: 0 })}
            tone="accent"
          />
        </div>

        {activeGoals.length === 0 ? (
          <p className="mt-5 rounded-[18px] border border-white/10 bg-[rgba(15,23,42,0.42)] px-4 py-8 text-center text-sm font-medium text-slate-400">
            {copy.goalsPage.noData}
          </p>
        ) : (
          <div className="mt-5 grid gap-3">
            {activeGoals.map(({ goal, progress }) => (
              <article
                key={goal.id}
                className="rounded-[18px] border border-white/10 bg-[rgba(15,23,42,0.46)] px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="line-clamp-1 text-sm font-semibold text-slate-100">
                      {goal.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {copy.goalMetrics[goal.metric]}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-semibold text-slate-300">
                    {formatGoalValue(
                      progress.currentValue,
                      goal.unit,
                      locale,
                      settings.currency,
                    )}{" "}
                    /{" "}
                    {formatGoalValue(
                      progress.targetValue,
                      goal.unit,
                      locale,
                      settings.currency,
                    )}
                  </p>
                </div>
                <div className="mt-3">
                  <GoalProgressBar
                    progressPercent={progress.progressPercent}
                    achieved={progress.achieved}
                    atRisk={progress.atRisk}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      <RiskGuardrailsPanel guardrails={guardrails} />
    </section>
  );
}
