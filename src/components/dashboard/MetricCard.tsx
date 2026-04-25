"use client";

import {
  Percent,
  ShieldAlert,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { type MetricData, type MetricId } from "@/lib/mock-data";
import { cn, formatMetricValue } from "@/lib/utils";

interface MetricCardProps {
  metric: MetricData;
}

const iconMap: Record<MetricId, LucideIcon> = {
  netPnl: Wallet,
  winRate: Percent,
  profitFactor: TrendingUp,
  maxDrawdown: ShieldAlert,
};

const valueToneMap = {
  positive: "text-emerald-600",
  negative: "text-rose-600",
  neutral: "text-slate-900",
  accent: "text-slate-900",
} as const;

const badgeToneMap = {
  positive: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  negative: "bg-rose-50 text-rose-700 ring-rose-100",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  accent: "bg-[rgba(108,77,255,0.10)] text-[var(--accent)] ring-[rgba(108,77,255,0.14)]",
} as const;

export default function MetricCard({ metric }: MetricCardProps) {
  const { dictionary: copy } = useLanguage();
  const Icon = iconMap[metric.id];

  return (
    <article className="panel-card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(108,77,255,0.12)_0%,rgba(108,77,255,0)_72%)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {copy.metrics[metric.id].label}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {copy.metrics[metric.id].helper}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(108,77,255,0.10)] text-[var(--accent)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="relative mt-8 flex items-end justify-between gap-3">
        <div>
          <p
            className={cn(
              "text-[32px] font-semibold tracking-[-0.05em]",
              valueToneMap[metric.valueTone],
            )}
          >
            {formatMetricValue(
              metric.value,
              metric.valueFormat,
              metric.valueDigits ?? 2,
            )}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-sm font-semibold ring-1 ring-inset",
                badgeToneMap.neutral,
              )}
            >
              {copy.basedOnCurrentTrades}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
