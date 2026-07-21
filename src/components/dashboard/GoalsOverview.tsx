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
  positive: "text-[var(--success)]",
  negative: "text-rose-300",
  accent: "text-[var(--accent)]",
} as const;

function SummaryTile({ label, value, tone = "neutral" }: SummaryTileProps) {
  return (
    <div className="rounded-[var(--radius-inner)] border border-[var(--inner-border)] bg-[var(--card-strong)] px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--weak)]">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-[17px] font-semibold tabular-nums",
          tileToneClasses[tone],
        )}
      >
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
      className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
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
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
      <Card>
        <SectionHeader
          title={copy.dashboardPage.goalsOverview}
          action={manageLink}
        />

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
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
          <p className="mt-4 rounded-[var(--radius-inner)] border border-[var(--inner-border)] bg-[var(--card-strong)] px-4 py-8 text-center text-sm font-medium text-slate-400">
            {copy.goalsPage.noData}
          </p>
        ) : (
          <div className="mt-4 grid gap-2">
            {activeGoals.map(({ goal, progress }) => (
              <article
                key={goal.id}
                className="rounded-[var(--radius-inner)] border border-[var(--inner-border)] bg-[var(--card-strong)] px-3 py-2.5"
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
