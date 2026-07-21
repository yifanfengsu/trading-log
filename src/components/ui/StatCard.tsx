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
      density="normal"
      className={cn("relative overflow-hidden", className)}
      hover
    >
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--weak)]">
          {label}
        </p>
        {Icon ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icon className="h-[15px] w-[15px]" />
          </div>
        ) : null}
      </div>
      <div className="mt-3.5 flex items-center justify-between gap-3">
        {/* The value never shrinks; the visual yields (down to nothing) so a
            long number can never overlap it. */}
        <p
          className={cn(
            "shrink-0 text-[28px] font-bold leading-none tracking-[-0.02em] tabular-nums sm:text-[32px]",
            valueToneClassMap[tone],
          )}
        >
          {value}
        </p>
        {visual ? (
          <div className="flex min-w-0 flex-1 items-center justify-end">
            {visual}
          </div>
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
      {/* Helper text reads as a footnote to the number rather than pushing it
          down the card. */}
      {description ? (
        <p className="mt-3 line-clamp-2 text-[11px] leading-4 text-[var(--weak)]">
          {description}
        </p>
      ) : null}
    </Card>
  );
}
