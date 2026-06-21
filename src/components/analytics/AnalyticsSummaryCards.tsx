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
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import StatCard from "@/components/ui/StatCard";
import type { AnalyticsSummary } from "@/lib/analytics-calculations";
import {
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

export default function AnalyticsSummaryCards({
  summary,
}: AnalyticsSummaryCardsProps) {
  const { dictionary: copy } = useLanguage();
  const { settings } = useUserSettings();
  const items: SummaryItem[] = [
    {
      key: "netPnl",
      label: copy.metrics.netPnl.label,
      value: formatCurrency(summary.netPnl, settings.currency),
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
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <StatCard
            key={item.key}
            label={item.label}
            value={item.value}
            tone={item.tone}
            icon={Icon}
            className="min-h-[132px]"
          />
        );
      })}
    </section>
  );
}
