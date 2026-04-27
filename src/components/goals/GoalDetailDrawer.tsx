"use client";

import {
  Archive,
  CheckCircle2,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

import GoalProgressBar from "@/components/goals/GoalProgressBar";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import { getGoalRelatedStats } from "@/lib/goal-calculations";
import type { Goal, GoalProgress } from "@/lib/goal-types";
import type { DailyReview } from "@/lib/review-types";
import type { CurrencyCode } from "@/lib/settings-types";
import type { Trade } from "@/lib/trade-types";
import {
  cn,
  formatCurrency,
  formatDateLabel,
  formatDateRange,
  formatGoalValue,
  formatPercent,
  formatProfitFactor,
} from "@/lib/utils";

interface GoalDetailDrawerProps {
  goal: Goal;
  progress: GoalProgress;
  trades: Trade[];
  reviews: DailyReview[];
  onClose: () => void;
  onEdit: (goal: Goal) => void;
  onPause: (goal: Goal) => void;
  onResume: (goal: Goal) => void;
  onComplete: (goal: Goal) => void;
  onArchive: (goal: Goal) => void;
  onRestore: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
}

interface DetailRowProps {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
}

interface StatTileProps {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
}

function DetailRow({ label, value, tone = "neutral" }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(148,163,184,0.12)] py-3 last:border-b-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p
        className={cn(
          "text-right text-sm font-semibold text-slate-900",
          tone === "positive" && "text-emerald-600",
          tone === "negative" && "text-rose-600",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function StatTile({ label, value, tone = "neutral" }: StatTileProps) {
  return (
    <div className="rounded-[18px] bg-[rgba(250,250,255,0.88)] px-4 py-3">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p
        className={cn(
          "mt-2 text-base font-semibold text-slate-950",
          tone === "positive" && "text-emerald-600",
          tone === "negative" && "text-rose-600",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function formatGoalMetricValue(
  goal: Goal,
  value: number,
  locale: "zh" | "en",
  currency: CurrencyCode,
) {
  if (goal.metric === "profitFactor") {
    return formatProfitFactor(value);
  }

  return formatGoalValue(value, goal.unit, locale, currency);
}

export default function GoalDetailDrawer({
  goal,
  progress,
  trades,
  reviews,
  onClose,
  onEdit,
  onPause,
  onResume,
  onComplete,
  onArchive,
  onRestore,
  onDelete,
}: GoalDetailDrawerProps) {
  const { dictionary: copy, locale } = useLanguage();
  const { settings } = useUserSettings();
  const relatedStats = getGoalRelatedStats(goal, trades, reviews);
  const isArchived = goal.status === "archived";
  const isPaused = goal.status === "paused";
  const isCompleted = goal.status === "completed";

  function handleDelete() {
    if (window.confirm(copy.goalsPage.deleteConfirm)) {
      onDelete(goal);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/24 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={copy.tradesPage.close}
      />
      <aside className="relative flex h-full w-full max-w-[620px] flex-col overflow-hidden border-l border-white/70 bg-[rgba(255,255,255,0.96)] shadow-[0_24px_80px_rgba(31,15,86,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(148,163,184,0.14)] px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                {copy.goalsPage.goalDetails}
              </span>
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
                  goal.status === "active" &&
                    "bg-[rgba(108,77,255,0.08)] text-[var(--accent)] ring-[rgba(108,77,255,0.14)]",
                  goal.status === "paused" &&
                    "bg-slate-100 text-slate-500 ring-slate-200",
                  goal.status === "completed" &&
                    "bg-emerald-50 text-emerald-700 ring-emerald-100",
                  goal.status === "archived" &&
                    "bg-slate-100 text-slate-500 ring-slate-200",
                )}
              >
                {copy.goalStatus[goal.status]}
              </span>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">
              {goal.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(15,23,42,0.04)] text-slate-500 transition-colors hover:bg-[rgba(15,23,42,0.08)] hover:text-slate-900"
            aria-label={copy.tradesPage.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <section className="rounded-[20px] bg-[rgba(250,250,255,0.86)] px-4">
            <DetailRow
              label={copy.goalsPage.category}
              value={copy.goalCategories[goal.category]}
            />
            <DetailRow
              label={copy.goalsPage.metric}
              value={copy.goalMetrics[goal.metric]}
            />
            <DetailRow
              label={copy.goalsPage.direction}
              value={copy.goalDirections[goal.direction]}
            />
            <DetailRow
              label={copy.goalsPage.periodType}
              value={copy.goalPeriodTypes[goal.periodType]}
            />
            <DetailRow
              label={copy.reportsPage.period}
              value={formatDateRange(goal.startDate, goal.endDate, locale)}
            />
            <DetailRow
              label={copy.goalsPage.startDate}
              value={formatDateLabel(goal.startDate, locale)}
            />
            <DetailRow
              label={copy.goalsPage.endDate}
              value={formatDateLabel(goal.endDate, locale)}
            />
          </section>

          <section className="mt-5">
            <h3 className="text-sm font-semibold text-slate-900">
              {copy.goalsPage.description}
            </h3>
            <div className="mt-2 rounded-[18px] bg-[rgba(15,23,42,0.04)] p-4 text-sm leading-6 text-slate-600">
              {goal.description || "—"}
            </div>
          </section>

          <section className="mt-5">
            <h3 className="text-sm font-semibold text-slate-900">
              {copy.goalsPage.notes}
            </h3>
            <div className="mt-2 rounded-[18px] bg-[rgba(15,23,42,0.04)] p-4 text-sm leading-6 text-slate-600">
              {goal.notes || "—"}
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              {copy.goalsPage.progress}
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <StatTile
                label={copy.goalsPage.currentValue}
                value={formatGoalMetricValue(
                  goal,
                  progress.currentValue,
                  locale,
                  settings.currency,
                )}
              />
              <StatTile
                label={copy.goalsPage.targetValue}
                value={formatGoalMetricValue(
                  goal,
                  progress.targetValue,
                  locale,
                  settings.currency,
                )}
              />
              <StatTile
                label={copy.goalsPage.remaining}
                value={formatGoalMetricValue(
                  goal,
                  progress.remainingValue,
                  locale,
                  settings.currency,
                )}
                tone={
                  progress.atRisk
                    ? "negative"
                    : progress.remainingValue === 0
                      ? "positive"
                      : "neutral"
                }
              />
            </div>
            <div className="mt-4 rounded-[18px] bg-[rgba(250,250,255,0.88)] p-4">
              <GoalProgressBar
                progressPercent={progress.progressPercent}
                achieved={progress.achieved || isCompleted}
                atRisk={progress.atRisk}
              />
              <div className="mt-4 grid gap-2 text-sm">
                <DetailRow
                  label={copy.goalsPage.achieved}
                  value={
                    progress.achieved || isCompleted
                      ? copy.goalsPage.completed
                      : copy.goalsPage.notCompleted
                  }
                  tone={progress.achieved || isCompleted ? "positive" : "neutral"}
                />
                <DetailRow
                  label={copy.goalsPage.atRisk}
                  value={progress.atRisk ? copy.goalsPage.atRisk : copy.goalsPage.normal}
                  tone={progress.atRisk ? "negative" : "positive"}
                />
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              {copy.goalsPage.relatedData}
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <StatTile
                label={copy.goalsPage.periodTrades}
                value={formatGoalValue(
                  relatedStats.totalTrades,
                  "trades",
                  locale,
                  settings.currency,
                )}
              />
              <StatTile
                label={copy.goalsPage.periodNetPnl}
                value={formatCurrency(relatedStats.netPnl, settings.currency)}
                tone={
                  relatedStats.netPnl > 0
                    ? "positive"
                    : relatedStats.netPnl < 0
                      ? "negative"
                      : "neutral"
                }
              />
              <StatTile
                label={copy.goalsPage.periodWinRate}
                value={formatPercent(relatedStats.winRate)}
              />
              <StatTile
                label={copy.goalsPage.periodReviewCompletion}
                value={formatPercent(relatedStats.reviewCompletionRate)}
              />
            </div>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[rgba(148,163,184,0.14)] bg-white/92 px-6 py-4 backdrop-blur">
          <button
            type="button"
            onClick={() => onEdit(goal)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.22)] transition-colors hover:bg-[var(--accent-strong)]"
          >
            <Pencil className="h-4 w-4" />
            {copy.goalsPage.edit}
          </button>
          {!isArchived && !isCompleted ? (
            <button
              type="button"
              onClick={() => (isPaused ? onResume(goal) : onPause(goal))}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[rgba(148,163,184,0.18)] bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
              {isPaused ? copy.goalsPage.resume : copy.goalsPage.pause}
            </button>
          ) : null}
          {!isArchived && !isCompleted ? (
            <button
              type="button"
              onClick={() => onComplete(goal)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              <CheckCircle2 className="h-4 w-4" />
              {copy.goalsPage.markComplete}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => (isArchived ? onRestore(goal) : onArchive(goal))}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[rgba(148,163,184,0.18)] bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
          >
            {isArchived ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
            {isArchived ? copy.goalsPage.restore : copy.goalsPage.archive}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-rose-50 px-5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100"
          >
            <Trash2 className="h-4 w-4" />
            {copy.goalsPage.delete}
          </button>
        </div>
      </aside>
    </div>
  );
}
