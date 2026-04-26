"use client";

import {
  Activity,
  ListChecks,
  Percent,
  ShieldAlert,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { AnalyticsSummary } from "@/lib/analytics-calculations";
import {
  cn,
  formatCurrency,
  formatPercent,
  formatProfitFactor,
  formatRMultiple,
} from "@/lib/utils";

interface AnalyticsSummaryCardsProps {
  summary: AnalyticsSummary;
}

interface SummaryItem {
  key: string;
  label: string;
  value: string;
  tone: "neutral" | "positive" | "negative" | "accent";
  icon: LucideIcon;
}

const toneClassMap = {
  neutral: "text-slate-950",
  positive: "text-emerald-600",
  negative: "text-rose-600",
  accent: "text-[var(--accent)]",
} as const;

export default function AnalyticsSummaryCards({
  summary,
}: AnalyticsSummaryCardsProps) {
  const { dictionary: copy } = useLanguage();
  const items: SummaryItem[] = [
    {
      key: "netPnl",
      label: copy.metrics.netPnl.label,
      value: formatCurrency(summary.netPnl),
      tone:
        summary.netPnl > 0
          ? "positive"
          : summary.netPnl < 0
            ? "negative"
            : "neutral",
      icon: Wallet,
    },
    {
      key: "totalTrades",
      label: copy.tradesPage.totalTrades,
      value: String(summary.totalTrades),
      tone: "accent",
      icon: ListChecks,
    },
    {
      key: "winRate",
      label: copy.metrics.winRate.label,
      value: formatPercent(summary.winRate),
      tone: "neutral",
      icon: Percent,
    },
    {
      key: "profitFactor",
      label: copy.metrics.profitFactor.label,
      value: formatProfitFactor(summary.profitFactor),
      tone: "accent",
      icon: TrendingUp,
    },
    {
      key: "avgR",
      label: copy.analyticsPage.avgR,
      value: formatRMultiple(summary.avgR),
      tone:
        summary.avgR > 0
          ? "positive"
          : summary.avgR < 0
            ? "negative"
            : "neutral",
      icon: Activity,
    },
    {
      key: "maxDrawdown",
      label: copy.analyticsPage.maxDrawdown,
      value: formatPercent(summary.maxDrawdownPercent),
      tone: summary.maxDrawdownPercent > 0 ? "negative" : "neutral",
      icon: ShieldAlert,
    },
  ];

  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article key={item.key} className="panel-card p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(108,77,255,0.10)] text-[var(--accent)]">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p
              className={cn(
                "mt-5 text-[28px] font-semibold tracking-[-0.04em]",
                toneClassMap[item.tone],
              )}
            >
              {item.value}
            </p>
          </article>
        );
      })}
    </section>
  );
}
