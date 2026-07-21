"use client";

import { cn } from "@/lib/utils";

type ProgressTone = "accent" | "success" | "danger" | "warning" | "neutral";
type ProgressSize = "sm" | "md";

interface ProgressBarProps {
  // Already a 0–100 percentage; values outside the range are clamped here so
  // callers can pass raw ratios without guarding.
  value: number;
  tone?: ProgressTone;
  size?: ProgressSize;
  className?: string;
}

// Brightness tracks how much attention the bar deserves, not how "good" it is.
// An in-progress bar is still actionable, so it gets the accent gradient; a met
// goal is done and recedes into the darker accent. Without this, a dashboard
// where most goals are achieved turned into a wall of full-width neon slabs —
// the loudest thing on the page carrying the least information.
const toneClassMap: Record<ProgressTone, string> = {
  accent:
    "bg-[linear-gradient(90deg,var(--accent-strong)_0%,var(--accent)_100%)] opacity-85",
  success: "bg-[var(--accent-strong)] opacity-65",
  danger: "bg-[var(--danger)]",
  warning: "bg-[var(--warning)]",
  neutral: "bg-white/25",
};

const sizeClassMap: Record<ProgressSize, string> = {
  sm: "h-1",
  md: "h-1.5",
};

function normalize(value: number) {
  if (!Number.isFinite(value)) {
    return 100;
  }

  return Math.min(Math.max(value, 0), 100);
}

export default function ProgressBar({
  value,
  tone = "accent",
  size = "md",
  className,
}: ProgressBarProps) {
  const percent = normalize(value);

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-white/[0.06]",
        sizeClassMap[size],
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-all", toneClassMap[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
