"use client";

import { useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import type { SymbolPerformanceRow } from "@/lib/analytics-calculations";
import {
  formatAxisCurrencyTick,
  formatCurrency,
  formatPercent,
  formatRMultiple,
} from "@/lib/utils";

interface SymbolPerformanceChartProps {
  rows: SymbolPerformanceRow[];
}

const positiveColor = "#34D399";
const negativeColor = "#FB7185";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function SymbolPerformanceChart({
  rows,
}: SymbolPerformanceChartProps) {
  const { dictionary: copy } = useLanguage();
  const { settings } = useUserSettings();
  const isClient = useIsClient();
  const data = rows.slice(0, 8);

  function renderTooltip({
    active,
    payload,
  }: TooltipContentProps) {
    const row = payload[0]?.payload as SymbolPerformanceRow | undefined;

    if (!active || !row) {
      return null;
    }

    return (
      <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-3 text-sm text-slate-200 shadow-[0_18px_44px_rgba(2,6,23,0.42)]">
        <p className="font-semibold text-slate-50">{row.symbol}</p>
        <div className="mt-2 grid gap-1 text-slate-400">
          <span>
            {copy.metrics.netPnl.label}:{" "}
            {formatCurrency(row.netPnl, settings.currency)}
          </span>
          <span>{copy.analyticsPage.trades}: {row.totalTrades}</span>
          <span>{copy.metrics.winRate.label}: {formatPercent(row.winRate)}</span>
          <span>{copy.analyticsPage.avgR}: {formatRMultiple(row.avgR)}</span>
        </div>
      </div>
    );
  }

  return (
    <section className="panel-card min-w-0 p-5 lg:p-6">
      <h2 className="panel-title">{copy.analyticsPage.symbolPerformance}</h2>

      {data.length === 0 ? (
        <div className="mt-5 flex min-h-[300px] items-center justify-center rounded-[20px] border border-dashed border-[rgba(148,163,184,0.22)] bg-[rgba(250,250,255,0.72)] text-sm font-medium text-slate-400">
          {copy.analyticsPage.noTradeData}
        </div>
      ) : (
        <div className="mt-5 h-[300px] w-full min-w-0">
          {isClient ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 12, right: 18, left: 14, bottom: 0 }}
              >
                <CartesianGrid
                  horizontal={false}
                  stroke="rgba(148,163,184,0.12)"
                  strokeDasharray="4 6"
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                  tickFormatter={(value: number) =>
                    formatAxisCurrencyTick(value, settings.currency)
                  }
                />
                <YAxis
                  dataKey="symbol"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  width={82}
                  tick={{ fill: "#CBD5E1", fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(124,92,255,0.08)" }}
                  content={renderTooltip}
                />
                <Bar dataKey="netPnl" radius={[8, 8, 8, 8]}>
                  {data.map((row) => (
                    <Cell
                      key={row.symbol}
                      fill={row.netPnl >= 0 ? positiveColor : negativeColor}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full rounded-[20px] bg-[linear-gradient(180deg,rgba(124,92,255,0.12),rgba(15,23,42,0.58))]" />
          )}
        </div>
      )}
    </section>
  );
}
