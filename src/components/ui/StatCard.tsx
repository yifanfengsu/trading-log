"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type StatTone = "neutral" | "positive" | "negative" | "accent";

interface StatCardProps {
  label: string;
  value: string;
  description?: string;
  delta?: string;
  icon?: LucideIcon;
  tone?: StatTone;
  // Optional small visualization rendered in the lower area of the card. Other
  // StatCard usages omit it and stay number-only.
  visual?: ReactNode;
  className?: string;
}

const valueToneClassMap: Record<StatTone, string> = {
  neutral: "text-[var(--foreground)]",
  positive: "text-[var(--success)]",
  negative: "text-rose-300",
  accent: "text-[var(--accent)]",
};

const deltaToneClassMap: Record<StatTone, string> = {
  neutral: "bg-white/[0.06] text-[var(--muted)]",
  positive: "bg-[var(--success-soft)] text-[var(--success)]",
  negative: "bg-[var(--danger-soft)] text-rose-300",
  accent: "bg-[var(--accent-soft)] text-[var(--accent)]",
};

export default function StatCard({
  label,
  value,
  description,
  delta,
  icon: Icon,
  tone = "neutral",
  visual,
  className,
}: StatCardProps) {
  return (
    <Card
      as="article"
      density="spacious"
      className={cn("relative min-h-[168px] overflow-hidden", className)}
      hover
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--weak)]">
            {label}
          </p>
          {description ? (
            <p className="mt-1.5 text-xs leading-5 text-[var(--weak)]">
              {description}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <p
          className={cn(
            "min-w-0 text-[40px] font-bold leading-none tracking-tight tabular-nums sm:text-[48px]",
            valueToneClassMap[tone],
          )}
        >
          {value}
        </p>
        {visual ? (
          <div className="shrink-0">{visual}</div>
        ) : delta ? (
          <span
            className={cn(
              "inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
              deltaToneClassMap[tone],
            )}
          >
            {delta}
          </span>
        ) : null}
      </div>
    </Card>
  );
}
