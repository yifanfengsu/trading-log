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
import type { WeekdayPerformanceRow } from "@/lib/analytics-calculations";
import {
  formatAxisCurrencyTick,
  formatCurrency,
  formatPercent,
  formatRMultiple,
} from "@/lib/utils";

interface WeekdayPerformanceChartProps {
  rows: WeekdayPerformanceRow[];
}

interface WeekdayChartDatum extends WeekdayPerformanceRow {
  weekdayLabel: string;
}

const positiveColor = "#16a34a";
const negativeColor = "#e11d48";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function WeekdayPerformanceChart({
  rows,
}: WeekdayPerformanceChartProps) {
  const { dictionary: copy } = useLanguage();
  const isClient = useIsClient();
  const data: WeekdayChartDatum[] = rows.map((row) => ({
    ...row,
    weekdayLabel: copy.analyticsPage.weekdays[row.weekday - 1],
  }));

  function renderTooltip({
    active,
    payload,
  }: TooltipContentProps) {
    const row = payload[0]?.payload as WeekdayChartDatum | undefined;

    if (!active || !row) {
      return null;
    }

    return (
      <div className="rounded-2xl border border-[rgba(108,77,255,0.14)] bg-white/95 p-3 text-sm shadow-[0_12px_32px_rgba(31,15,86,0.10)]">
        <p className="font-semibold text-slate-950">{row.weekdayLabel}</p>
        <div className="mt-2 grid gap-1 text-slate-500">
          <span>{copy.metrics.netPnl.label}: {formatCurrency(row.netPnl)}</span>
          <span>{copy.analyticsPage.trades}: {row.totalTrades}</span>
          <span>{copy.metrics.winRate.label}: {formatPercent(row.winRate)}</span>
          <span>{copy.analyticsPage.avgR}: {formatRMultiple(row.avgR)}</span>
        </div>
      </div>
    );
  }

  return (
    <section className="panel-card p-5 lg:p-6">
      <h2 className="panel-title">{copy.analyticsPage.weekdayPerformance}</h2>

      {data.length === 0 ? (
        <div className="mt-5 flex min-h-[300px] items-center justify-center rounded-[20px] border border-dashed border-[rgba(148,163,184,0.22)] bg-[rgba(250,250,255,0.72)] text-sm font-medium text-slate-400">
          {copy.analyticsPage.noTradeData}
        </div>
      ) : (
        <div className="mt-5 h-[300px] w-full">
          {isClient ? (
            <ResponsiveContainer>
              <BarChart
                data={data}
                margin={{ top: 12, right: 18, left: -18, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(148,163,184,0.18)"
                  strokeDasharray="4 6"
                />
                <XAxis
                  dataKey="weekdayLabel"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  tick={{ fill: "#8c88a6", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  width={54}
                  tick={{ fill: "#8c88a6", fontSize: 12 }}
                  tickFormatter={formatAxisCurrencyTick}
                />
                <Tooltip
                  cursor={{ fill: "rgba(108,77,255,0.06)" }}
                  content={renderTooltip}
                />
                <Bar dataKey="netPnl" radius={[8, 8, 8, 8]}>
                  {data.map((row) => (
                    <Cell
                      key={row.weekday}
                      fill={row.netPnl >= 0 ? positiveColor : negativeColor}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full rounded-[20px] bg-[linear-gradient(180deg,rgba(108,77,255,0.10),rgba(255,255,255,0.75))]" />
          )}
        </div>
      )}
    </section>
  );
}
