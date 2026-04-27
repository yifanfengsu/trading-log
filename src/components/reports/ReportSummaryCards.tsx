"use client";

import {
  Activity,
  CheckCircle2,
  ListChecks,
  Percent,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import StatCard from "@/components/ui/StatCard";
import type { ReportStats } from "@/lib/report-types";
import {
  formatCurrency,
  formatPercent,
  formatProfitFactor,
  formatRMultiple,
} from "@/lib/utils";

interface ReportSummaryCardsProps {
  stats: ReportStats;
}

interface SummaryItem {
  key: string;
  label: string;
  value: string;
  tone: "neutral" | "positive" | "negative" | "accent";
  icon: LucideIcon;
}

export default function ReportSummaryCards({ stats }: ReportSummaryCardsProps) {
  const { dictionary: copy } = useLanguage();
  const { settings } = useUserSettings();
  const items: SummaryItem[] = [
    {
      key: "netPnl",
      label: copy.metrics.netPnl.label,
      value: formatCurrency(stats.netPnl, settings.currency),
      tone:
        stats.netPnl > 0
          ? "positive"
          : stats.netPnl < 0
            ? "negative"
            : "neutral",
      icon: Wallet,
    },
    {
      key: "totalTrades",
      label: copy.tradesPage.totalTrades,
      value: String(stats.totalTrades),
      tone: "accent",
      icon: ListChecks,
    },
    {
      key: "winRate",
      label: copy.metrics.winRate.label,
      value: formatPercent(stats.winRate),
      tone: "neutral",
      icon: Percent,
    },
    {
      key: "profitFactor",
      label: copy.metrics.profitFactor.label,
      value: formatProfitFactor(stats.profitFactor),
      tone: "accent",
      icon: TrendingUp,
    },
    {
      key: "avgR",
      label: copy.analyticsPage.avgR,
      value: formatRMultiple(stats.avgR),
      tone:
        stats.avgR > 0
          ? "positive"
          : stats.avgR < 0
            ? "negative"
            : "neutral",
      icon: Activity,
    },
    {
      key: "reviewCompletion",
      label: copy.reportsPage.reviewCompletion,
      value: formatPercent(stats.reviewCompletionRate),
      tone: "accent",
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
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
