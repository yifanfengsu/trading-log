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
import type { RMultipleDistributionRow } from "@/lib/analytics-calculations";
import { formatCurrency } from "@/lib/utils";

interface RMultipleDistributionProps {
  rows: RMultipleDistributionRow[];
}

const positiveColor = "#34D399";
const negativeColor = "#FB7185";
const neutralColor = "#7C5CFF";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function RMultipleDistribution({
  rows,
}: RMultipleDistributionProps) {
  const { dictionary: copy } = useLanguage();
  const { settings } = useUserSettings();
  const isClient = useIsClient();

  function renderTooltip({
    active,
    payload,
  }: TooltipContentProps) {
    const row = payload[0]?.payload as RMultipleDistributionRow | undefined;

    if (!active || !row) {
      return null;
    }

    return (
      <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-3 text-sm text-slate-200 shadow-[0_18px_44px_rgba(2,6,23,0.42)]">
        <p className="font-semibold text-slate-50">{row.bucket}</p>
        <div className="mt-2 grid gap-1 text-slate-400">
          <span>{copy.analyticsPage.trades}: {row.count}</span>
          <span>
            {copy.metrics.netPnl.label}:{" "}
            {formatCurrency(row.netPnl, settings.currency)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <section className="panel-card p-5 lg:p-6">
      <h2 className="panel-title">{copy.analyticsPage.rMultipleDistribution}</h2>

      {rows.length === 0 ? (
        <div className="mt-5 flex min-h-[300px] items-center justify-center rounded-[20px] border border-dashed border-[rgba(148,163,184,0.22)] bg-[rgba(250,250,255,0.72)] text-sm font-medium text-slate-400">
          {copy.analyticsPage.noTradeData}
        </div>
      ) : (
        <>
          <div className="mt-5 h-[300px] w-full">
            {isClient ? (
              <ResponsiveContainer>
                <BarChart
                  data={rows}
                  margin={{ top: 12, right: 18, left: -18, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="rgba(148,163,184,0.07)"
                    strokeDasharray="4 6"
                  />
                  <XAxis
                    dataKey="bucket"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    tick={{ fill: "#64748B", fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    width={36}
                    tick={{ fill: "#64748B", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(124,92,255,0.08)" }}
                    content={renderTooltip}
                  />
                  <Bar dataKey="count" radius={[8, 8, 8, 8]}>
                    {rows.map((row) => (
                      <Cell
                        key={row.bucket}
                        fill={
                          row.netPnl > 0
                            ? positiveColor
                            : row.netPnl < 0
                              ? negativeColor
                              : neutralColor
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-[20px] bg-[linear-gradient(180deg,rgba(124,92,255,0.12),rgba(15,23,42,0.58))]" />
            )}
          </div>
          <p className="mt-4 rounded-[18px] border border-[rgba(124,92,255,0.18)] bg-[rgba(124,92,255,0.08)] px-4 py-3 text-sm text-slate-300">
            {copy.analyticsPage.rMultipleInsight}
          </p>
        </>
      )}
    </section>
  );
}
