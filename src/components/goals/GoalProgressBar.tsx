"use client";

import ProgressBar from "@/components/ui/ProgressBar";
import { formatPercent } from "@/lib/utils";

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
    <div className="grid gap-1.5">
      <ProgressBar
        value={normalizedProgress}
        tone={atRisk ? "danger" : achieved ? "success" : "accent"}
      />
      {showLabel ? (
        <p className="text-right text-xs font-semibold text-slate-400">
          {formatPercent(normalizedProgress, { digits: 0 })}
        </p>
      ) : null}
    </div>
  );
}
