"use client";

import {
  Archive,
  CheckCircle2,
  Eye,
  Pause,
  Pencil,
  Play,
  RotateCcw,
} from "lucide-react";

import GoalProgressBar from "@/components/goals/GoalProgressBar";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { GoalProgress } from "@/lib/goal-types";
import type { Goal } from "@/lib/goal-types";
import type { CurrencyCode } from "@/lib/settings-types";
import {
  cn,
  formatDateRange,
  formatGoalValue,
  formatPercent,
  formatProfitFactor,
} from "@/lib/utils";

interface GoalCardProps {
  goal: Goal;
  progress: GoalProgress;
  onView: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onPause: (goal: Goal) => void;
  onResume: (goal: Goal) => void;
  onComplete: (goal: Goal) => void;
  onArchive: (goal: Goal) => void;
  onRestore: (goal: Goal) => void;
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

export default function GoalCard({
  goal,
  progress,
  onView,
  onEdit,
  onPause,
  onResume,
  onComplete,
  onArchive,
  onRestore,
}: GoalCardProps) {
  const { dictionary: copy, locale } = useLanguage();
  const { settings } = useUserSettings();
  const isArchived = goal.status === "archived";
  const isPaused = goal.status === "paused";
  const isCompleted = goal.status === "completed";
  const currentValue = formatGoalMetricValue(
    goal,
    progress.currentValue,
    locale,
    settings.currency,
  );
  const targetValue = formatGoalMetricValue(
    goal,
    progress.targetValue,
    locale,
    settings.currency,
  );
  const remainingValue = formatGoalMetricValue(
    goal,
    progress.remainingValue,
    locale,
    settings.currency,
  );

  return (
    <Card
      as="article"
      hover
      className="flex min-h-full cursor-pointer flex-col"
      onClick={() => onView(goal)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="line-clamp-1 text-lg font-semibold tracking-[-0.03em] text-slate-950">
            {goal.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="purple">
              {copy.goalCategories[goal.category]}
            </Badge>
            <Badge variant="gray">
              {copy.goalMetrics[goal.metric]}
            </Badge>
            <Badge
              variant={
                goal.status === "completed"
                  ? "green"
                  : goal.status === "active"
                    ? "purple"
                    : "gray"
              }
            >
              {copy.goalStatus[goal.status]}
            </Badge>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">
        {formatDateRange(goal.startDate, goal.endDate, locale)}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[rgba(250,250,255,0.88)] px-3 py-3">
          <p className="text-xs font-medium text-slate-400">
            {copy.goalsPage.currentValue}
          </p>
          <p
            className={cn(
              "mt-1 text-sm font-semibold text-slate-950",
              goal.metric === "netPnl" &&
                progress.currentValue > 0 &&
                "text-emerald-600",
              goal.metric === "netPnl" &&
                progress.currentValue < 0 &&
                "text-rose-600",
            )}
          >
            {currentValue}
          </p>
        </div>
        <div className="rounded-2xl bg-[rgba(250,250,255,0.88)] px-3 py-3">
          <p className="text-xs font-medium text-slate-400">
            {copy.goalsPage.targetValue}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-950">
            {targetValue}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <GoalProgressBar
          progressPercent={progress.progressPercent}
          achieved={progress.achieved || isCompleted}
          atRisk={progress.atRisk}
        />
      </div>

      <div className="mt-4 grid gap-2 rounded-[18px] bg-[rgba(250,250,255,0.72)] px-4 py-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">{copy.goalsPage.remaining}</span>
          <span
            className={cn(
              "font-semibold text-slate-900",
              progress.remainingValue === 0 && "text-emerald-600",
              progress.atRisk && "text-rose-600",
            )}
          >
            {remainingValue}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
              progress.achieved || isCompleted
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500",
            )}
          >
            {progress.achieved || isCompleted
              ? copy.goalsPage.completed
              : copy.goalsPage.notCompleted}
          </span>
          {progress.atRisk ? (
            <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
              {copy.goalsPage.atRisk}
            </span>
          ) : null}
          <span className="ml-auto text-xs font-semibold text-slate-400">
            {formatPercent(progress.progressPercent, { digits: 0 })}
          </span>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        <Button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onView(goal);
          }}
          variant="secondary"
          size="sm"
        >
          <Eye className="h-4 w-4" />
          {copy.goalsPage.view}
        </Button>
        <Button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(goal);
          }}
          variant="outline"
          size="sm"
        >
          <Pencil className="h-4 w-4" />
          {copy.goalsPage.edit}
        </Button>
        {!isArchived && !isCompleted ? (
          <Button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (isPaused) {
                onResume(goal);
              } else {
                onPause(goal);
              }
            }}
            variant="secondary"
            size="sm"
          >
            {isPaused ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
            {isPaused ? copy.goalsPage.resume : copy.goalsPage.pause}
          </Button>
        ) : null}
        {!isArchived && !isCompleted ? (
          <Button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onComplete(goal);
            }}
            variant="outline"
            size="sm"
            className="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            <CheckCircle2 className="h-4 w-4" />
            {copy.goalsPage.markComplete}
          </Button>
        ) : null}
        <Button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (isArchived) {
              onRestore(goal);
            } else {
              onArchive(goal);
            }
          }}
          variant="secondary"
          size="sm"
        >
          {isArchived ? (
            <RotateCcw className="h-4 w-4" />
          ) : (
            <Archive className="h-4 w-4" />
          )}
          {isArchived ? copy.goalsPage.restore : copy.goalsPage.archive}
        </Button>
      </div>
    </Card>
  );
}
