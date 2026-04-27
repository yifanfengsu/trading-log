"use client";

import type { LucideIcon } from "lucide-react";

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
  className?: string;
}

const valueToneClassMap: Record<StatTone, string> = {
  neutral: "text-slate-950",
  positive: "text-emerald-600",
  negative: "text-rose-600",
  accent: "text-violet-600",
};

const deltaToneClassMap: Record<StatTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  positive: "border-emerald-100 bg-emerald-50 text-emerald-700",
  negative: "border-rose-100 bg-rose-50 text-rose-600",
  accent: "border-violet-100 bg-violet-50 text-violet-600",
};

export default function StatCard({
  label,
  value,
  description,
  delta,
  icon: Icon,
  tone = "neutral",
  className,
}: StatCardProps) {
  return (
    <Card as="article" className={cn("min-h-[150px]", className)} hover>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          {description ? (
            <p className="mt-1 text-sm leading-5 text-slate-400">
              {description}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-inset ring-violet-100">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      <div className="mt-7 flex flex-wrap items-end justify-between gap-3">
        <p
          className={cn(
            "text-[30px] font-semibold leading-none tracking-normal",
            valueToneClassMap[tone],
          )}
        >
          {value}
        </p>
        {delta ? (
          <span
            className={cn(
              "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
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
