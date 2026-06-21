"use client";

import {
  Percent,
  ShieldAlert,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import MiniSparkline from "@/components/dashboard/MiniSparkline";
import RadialProgress from "@/components/dashboard/RadialProgress";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import StatCard from "@/components/ui/StatCard";
import { type MetricData, type MetricId } from "@/lib/mock-data";
import { formatMetricValue, formatProfitFactor } from "@/lib/utils";

interface MetricCardProps {
  metric: MetricData;
  // Only the net P&L card uses this: the equity series already drawn by the
  // dashboard EquityCurve, reused (not recomputed) for a mini sparkline.
  sparkline?: number[];
}

const RING_SIZE = 72;

const iconMap: Record<MetricId, LucideIcon> = {
  netPnl: Wallet,
  winRate: Percent,
  profitFactor: TrendingUp,
  maxDrawdown: ShieldAlert,
};

// Visualization sitting beside the number, driven entirely by the metric's own
// value (plus, for net P&L, the reused equity series).
function renderVisual(metric: MetricData, sparkline?: number[]): ReactNode {
  const { id, value } = metric;

  if (id === "winRate") {
    // Green arc = win share; rose track hints at the losing share.
    return (
      <RadialProgress
        value={value}
        color="#34D399"
        trackColor="rgba(244,63,94,0.22)"
        size={RING_SIZE}
        centerLabel={`${Math.round(value)}%`}
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
        color="#22D3EE"
        trackColor="rgba(148,163,184,0.16)"
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
        trackColor="rgba(148,163,184,0.16)"
        size={RING_SIZE}
        centerLabel={`${Math.round(Math.abs(value))}%`}
      />
    );
  }

  // netPnl: mini sparkline from the reused equity series; without a usable
  // series the card stays number-only (no fabricated data).
  if (id === "netPnl" && sparkline && sparkline.length > 1) {
    return (
      <MiniSparkline
        data={sparkline}
        color={value >= 0 ? "#34D399" : "#FB7185"}
      />
    );
  }

  return null;
}

export default function MetricCard({ metric, sparkline }: MetricCardProps) {
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
      visual={renderVisual(metric, sparkline)}
    />
  );
}
