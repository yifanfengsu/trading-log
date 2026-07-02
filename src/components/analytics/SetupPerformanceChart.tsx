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
import type { SetupPerformanceRow } from "@/lib/analytics-calculations";
import {
  cn,
  formatAxisCurrencyTick,
  formatCurrency,
  formatPercent,
  formatProfitFactor,
  formatRMultiple,
} from "@/lib/utils";

interface SetupPerformanceChartProps {
  rows: SetupPerformanceRow[];
}

interface SetupChartDatum extends SetupPerformanceRow {
  setupLabel: string;
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

export default function SetupPerformanceChart({
  rows,
}: SetupPerformanceChartProps) {
  const { dictionary: copy } = useLanguage();
  const { settings } = useUserSettings();
  const isClient = useIsClient();
  const data: SetupChartDatum[] = rows.map((row) => ({
    ...row,
    setupLabel: copy.strategies[row.setup],
  }));

  function renderTooltip({
    active,
    payload,
  }: TooltipContentProps) {
    const row = payload[0]?.payload as SetupChartDatum | undefined;

    if (!active || !row) {
      return null;
    }

    return (
      <div className="rounded-2xl bg-[#1e211e] p-3 text-sm text-slate-200 shadow-[0_18px_44px_rgba(0,0,0,0.42)]">
        <p className="font-semibold text-slate-50">{row.setupLabel}</p>
        <div className="mt-2 grid gap-1 text-slate-400">
          <span>
            {copy.metrics.netPnl.label}:{" "}
            {formatCurrency(row.netPnl, settings.currency)}
          </span>
          <span>{copy.analyticsPage.trades}: {row.totalTrades}</span>
          <span>{copy.metrics.winRate.label}: {formatPercent(row.winRate)}</span>
          <span>
            {copy.metrics.profitFactor.label}:{" "}
            {formatProfitFactor(row.profitFactor)}
          </span>
          <span>{copy.analyticsPage.avgR}: {formatRMultiple(row.avgR)}</span>
        </div>
      </div>
    );
  }

  return (
    <section className="panel-card p-5 lg:p-6">
      <h2 className="panel-title">{copy.analyticsPage.setupPerformance}</h2>

      {data.length === 0 ? (
        <div className="mt-5 flex min-h-[300px] items-center justify-center rounded-[20px] border border-dashed border-white/10 bg-white/[0.02] text-sm font-medium text-slate-400">
          {copy.analyticsPage.noTradeData}
        </div>
      ) : (
        <>
          <div className="mt-5 h-[300px] w-full">
            {isClient ? (
              <ResponsiveContainer>
                <BarChart
                  data={data}
                  margin={{ top: 12, right: 18, left: -18, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="rgba(148,163,184,0.07)"
                    strokeDasharray="4 6"
                  />
                  <XAxis
                    dataKey="setupLabel"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    minTickGap={16}
                    tick={{ fill: "#64748B", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    width={54}
                    tick={{ fill: "#64748B", fontSize: 12 }}
                    tickFormatter={(value: number) =>
                      formatAxisCurrencyTick(value, settings.currency)
                    }
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(124,92,255,0.08)" }}
                    content={renderTooltip}
                  />
                  <Bar dataKey="netPnl" radius={[8, 8, 8, 8]}>
                    {data.map((row) => (
                      <Cell
                        key={row.setup}
                        fill={row.netPnl >= 0 ? positiveColor : negativeColor}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-[20px] bg-[var(--card-strong)]" />
            )}
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-[720px] border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.08em] text-slate-400">
                  <th className="px-3 pb-2 font-medium">
                    {copy.recentTrades.columns.setup}
                  </th>
                  <th className="px-3 pb-2 font-medium">
                    {copy.metrics.netPnl.label}
                  </th>
                  <th className="px-3 pb-2 font-medium">
                    {copy.analyticsPage.trades}
                  </th>
                  <th className="px-3 pb-2 font-medium">
                    {copy.metrics.winRate.label}
                  </th>
                  <th className="px-3 pb-2 font-medium">
                    {copy.metrics.profitFactor.label}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.setup} className="text-sm">
                    <td className="rounded-l-[18px] bg-[rgba(30,33,30,0.50)] px-3 py-3 font-semibold text-slate-100">
                      {row.setupLabel}
                    </td>
                    <td
                      className={cn(
                        "bg-[rgba(30,33,30,0.50)] px-3 py-3 font-semibold",
                        row.netPnl >= 0 ? "text-[var(--success)]" : "text-rose-300",
                      )}
                    >
                      {formatCurrency(row.netPnl, settings.currency)}
                    </td>
                    <td className="bg-[rgba(30,33,30,0.50)] px-3 py-3 font-medium text-slate-300">
                      {row.totalTrades}
                    </td>
                    <td className="bg-[rgba(30,33,30,0.50)] px-3 py-3 font-medium text-slate-300">
                      {formatPercent(row.winRate)}
                    </td>
                    <td className="rounded-r-[18px] bg-[rgba(30,33,30,0.50)] px-3 py-3 font-medium text-slate-300">
                      {formatProfitFactor(row.profitFactor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
