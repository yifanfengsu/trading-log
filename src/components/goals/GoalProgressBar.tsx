"use client";

import { cn, formatPercent } from "@/lib/utils";

interface GoalProgressBarProps {
  progressPercent: number;
  achieved: boolean;
  atRisk: boolean;
  showLabel?: boolean;
}

function normalizeProgress(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value, 0), 100);
}

export default function GoalProgressBar({
  progressPercent,
  achieved,
  atRisk,
  showLabel = true,
}: GoalProgressBarProps) {
  const normalizedProgress = normalizeProgress(progressPercent);

  return (
    <div className="grid gap-2">
      <div className="h-2.5 overflow-hidden rounded-full bg-[rgba(155,163,155,0.14)]">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            achieved && "bg-[var(--accent)]",
            atRisk && "bg-[var(--danger)]",
            !achieved && !atRisk && "bg-[var(--accent)]",
          )}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
      {showLabel ? (
        <p className="text-right text-xs font-semibold text-slate-400">
          {formatPercent(normalizedProgress, { digits: 0 })}
        </p>
      ) : null}
    </div>
  );
}
