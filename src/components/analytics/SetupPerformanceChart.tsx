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

const positiveColor = "#16a34a";
const negativeColor = "#e11d48";

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
      <div className="rounded-2xl border border-[rgba(108,77,255,0.14)] bg-white/95 p-3 text-sm shadow-[0_12px_32px_rgba(31,15,86,0.10)]">
        <p className="font-semibold text-slate-950">{row.setupLabel}</p>
        <div className="mt-2 grid gap-1 text-slate-500">
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
        <div className="mt-5 flex min-h-[300px] items-center justify-center rounded-[20px] border border-dashed border-[rgba(148,163,184,0.22)] bg-[rgba(250,250,255,0.72)] text-sm font-medium text-slate-400">
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
                    stroke="rgba(148,163,184,0.18)"
                    strokeDasharray="4 6"
                  />
                  <XAxis
                    dataKey="setupLabel"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    minTickGap={16}
                    tick={{ fill: "#8c88a6", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    width={54}
                    tick={{ fill: "#8c88a6", fontSize: 12 }}
                    tickFormatter={(value: number) =>
                      formatAxisCurrencyTick(value, settings.currency)
                    }
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(108,77,255,0.06)" }}
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
              <div className="h-full rounded-[20px] bg-[linear-gradient(180deg,rgba(108,77,255,0.10),rgba(255,255,255,0.75))]" />
            )}
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
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
                    <td className="rounded-l-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-3 font-semibold text-slate-900">
                      {row.setupLabel}
                    </td>
                    <td
                      className={cn(
                        "bg-[rgba(250,250,255,0.88)] px-3 py-3 font-semibold",
                        row.netPnl >= 0 ? "text-emerald-600" : "text-rose-600",
                      )}
                    >
                      {formatCurrency(row.netPnl, settings.currency)}
                    </td>
                    <td className="bg-[rgba(250,250,255,0.88)] px-3 py-3 font-medium text-slate-600">
                      {row.totalTrades}
                    </td>
                    <td className="bg-[rgba(250,250,255,0.88)] px-3 py-3 font-medium text-slate-600">
                      {formatPercent(row.winRate)}
                    </td>
                    <td className="rounded-r-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-3 font-medium text-slate-600">
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
