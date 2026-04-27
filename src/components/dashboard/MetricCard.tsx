"use client";

import {
  Percent,
  ShieldAlert,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import StatCard from "@/components/ui/StatCard";
import { type MetricData, type MetricId } from "@/lib/mock-data";
import { formatMetricValue, formatProfitFactor } from "@/lib/utils";

interface MetricCardProps {
  metric: MetricData;
}

const iconMap: Record<MetricId, LucideIcon> = {
  netPnl: Wallet,
  winRate: Percent,
  profitFactor: TrendingUp,
  maxDrawdown: ShieldAlert,
};

export default function MetricCard({ metric }: MetricCardProps) {
  const { dictionary: copy } = useLanguage();
  const { settings } = useUserSettings();
  const Icon = iconMap[metric.id];
  const value =
    metric.id === "profitFactor"
      ? formatProfitFactor(metric.value)
      : formatMetricValue(
          metric.value,
          metric.valueFormat,
          metric.valueDigits ?? 2,
          settings.currency,
        );

  return (
    <StatCard
      label={copy.metrics[metric.id].label}
      description={copy.metrics[metric.id].helper}
      value={value}
      delta={copy.basedOnCurrentTrades}
      icon={Icon}
      tone={metric.valueTone}
    />
  );
}
