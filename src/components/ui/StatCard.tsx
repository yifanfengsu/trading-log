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
  neutral: "text-slate-50",
  positive: "text-emerald-300",
  negative: "text-rose-300",
  accent: "text-cyan-200",
};

const deltaToneClassMap: Record<StatTone, string> = {
  neutral:
    "border-[rgba(148,163,184,0.18)] bg-[rgba(148,163,184,0.10)] text-slate-300",
  positive:
    "border-[rgba(16,185,129,0.24)] bg-[rgba(16,185,129,0.12)] text-emerald-300",
  negative:
    "border-[rgba(244,63,94,0.24)] bg-[rgba(244,63,94,0.12)] text-rose-300",
  accent:
    "border-[rgba(124,92,255,0.32)] bg-[rgba(124,92,255,0.12)] text-violet-200",
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
      className={cn(
        "relative min-h-[168px] overflow-hidden",
        tone === "positive" &&
          "shadow-[0_22px_70px_rgba(2,6,23,0.32),0_0_34px_rgba(16,185,129,0.08)]",
        tone === "negative" &&
          "shadow-[0_22px_70px_rgba(2,6,23,0.32),0_0_34px_rgba(244,63,94,0.08)]",
        className,
      )}
      hover
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(124,92,255,0.58),rgba(34,211,238,0.34),transparent)]" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-slate-400">
            {label}
          </p>
          {description ? (
            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              {description}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(124,92,255,0.26),rgba(34,211,238,0.14))] text-cyan-100 ring-1 ring-inset ring-white/10">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <p
          className={cn(
            "min-w-0 text-[34px] font-bold leading-none tracking-tight tabular-nums sm:text-[40px]",
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
              "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold",
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
