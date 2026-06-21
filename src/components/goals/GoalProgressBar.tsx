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
      <div className="h-2.5 overflow-hidden rounded-full bg-[rgba(148,163,184,0.14)]">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            achieved &&
              "bg-[linear-gradient(90deg,#10B981,#34D399)] shadow-[0_0_14px_rgba(16,185,129,0.28)]",
            atRisk &&
              "bg-[linear-gradient(90deg,#F43F5E,#FB7185)] shadow-[0_0_14px_rgba(244,63,94,0.28)]",
            !achieved &&
              !atRisk &&
              "bg-[linear-gradient(90deg,#7C5CFF,#22D3EE)] shadow-[0_0_14px_rgba(124,92,255,0.30)]",
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
