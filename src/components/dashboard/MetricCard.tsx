"use client";

import {
  Percent,
  ShieldAlert,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import RadialProgress from "@/components/dashboard/RadialProgress";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import StatCard from "@/components/ui/StatCard";
import { type MetricData, type MetricId } from "@/lib/mock-data";
import { formatMetricValue, formatProfitFactor } from "@/lib/utils";

interface MetricCardProps {
  metric: MetricData;
}

const RING_SIZE = 56;

const iconMap: Record<MetricId, LucideIcon> = {
  netPnl: Wallet,
  winRate: Percent,
  profitFactor: TrendingUp,
  maxDrawdown: ShieldAlert,
};

// Visualization sitting beside the number, driven entirely by the metric's own
// value; the net P&L card stays number-only.
function renderVisual(metric: MetricData): ReactNode {
  const { id, value } = metric;

  if (id === "winRate") {
    // Accent-green arc = win share on the shared neutral track (red stays
    // reserved for actual loss values, not ring tracks). Center matches the
    // big number's one-decimal formatting so the card never shows two
    // conflicting values.
    return (
      <RadialProgress
        value={value}
        color="#B8F135"
        size={RING_SIZE}
        centerLabel={`${value.toFixed(1)}%`}
      />
    );
  }

  if (id === "profitFactor") {
    // Progress arc against a "full marks" benchmark of 3.0 (Infinity -> full);
    // the center shows the actual profit factor.
    const score = Number.isFinite(value)
      ? Math.min((value / 3) * 100, 100)
      : 100;
    return (
      <RadialProgress
        value={score}
        color="#B8F135"
        size={RING_SIZE}
        centerLabel={formatProfitFactor(value)}
      />
    );
  }

  if (id === "maxDrawdown") {
    // Red arc grows with drawdown magnitude (capped at 40% for a readable
    // scale); the center shows the actual drawdown percentage.
    const magnitude = (Math.min(Math.abs(value), 40) / 40) * 100;
    return (
      <RadialProgress
        value={magnitude}
        color="#FB7185"
        size={RING_SIZE}
        centerLabel={`${Math.round(Math.abs(value))}%`}
      />
    );
  }

  return null;
}

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
      icon={Icon}
      tone={metric.valueTone}
      visual={renderVisual(metric)}
    />
  );
}
