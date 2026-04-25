"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { EquityCurvePoint } from "@/lib/trade-calculations";
import {
  formatAxisCurrencyTick,
  formatCompactCurrency,
  formatCurrency,
  formatMonthRange,
  formatShortDateLabel,
} from "@/lib/utils";

interface EquityCurveProps {
  data: EquityCurvePoint[];
  selectedMonth: string;
}

export default function EquityCurve({ data, selectedMonth }: EquityCurveProps) {
  const { dictionary: copy, locale } = useLanguage();
  const lastPoint = data[data.length - 1];
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const chartTicks = Array.from(
    new Set(
      data.length > 2
        ? [data[0].date, data[Math.floor(data.length / 2)].date, data[data.length - 1].date]
        : data.map((point) => point.date),
    ),
  );

  return (
    <section className="panel-card p-5 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="panel-title">{copy.equityCurve.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {formatMonthRange(selectedMonth, locale)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="soft-pill">
            {copy.chooseMetric}
          </button>
          <button type="button" className="soft-pill">
            {copy.lineChart}
          </button>
        </div>
      </div>

      <div className="mt-6 h-[320px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-[20px] border border-dashed border-[rgba(148,163,184,0.22)] bg-[rgba(250,250,255,0.72)] text-sm font-medium text-slate-400">
            {copy.emptyState}
          </div>
        ) : isClient ? (
          <ResponsiveContainer>
            <AreaChart
              data={data}
              margin={{ top: 12, right: 72, left: -18, bottom: 0 }}
            >
              <defs>
                <linearGradient id="equityGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6C4DFF" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#6C4DFF" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="rgba(148,163,184,0.18)"
                strokeDasharray="4 6"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tickMargin={14}
                ticks={chartTicks}
                minTickGap={32}
                tick={{ fill: "#8c88a6", fontSize: 12 }}
                tickFormatter={(value: string) =>
                  formatShortDateLabel(value, locale)
                }
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                width={54}
                domain={[-4000, 12000]}
                ticks={[-4000, 0, 4000, 8000, 12000]}
                tick={{ fill: "#8c88a6", fontSize: 12 }}
                tickFormatter={formatAxisCurrencyTick}
              />
              <Tooltip
                cursor={{ stroke: "rgba(108,77,255,0.18)", strokeWidth: 1.5 }}
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid rgba(108,77,255,0.12)",
                  boxShadow: "0 12px 32px rgba(31, 15, 86, 0.08)",
                  backgroundColor: "rgba(255,255,255,0.96)",
                }}
                labelStyle={{ color: "#171228", fontWeight: 600 }}
                formatter={(value) =>
                  formatCurrency(Number(value ?? 0), { digits: 0 })
                }
                labelFormatter={(label) =>
                  formatShortDateLabel(String(label), locale)
                }
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#6C4DFF"
                strokeWidth={3}
                fill="url(#equityGradient)"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "#6C4DFF",
                  stroke: "#ffffff",
                  strokeWidth: 3,
                }}
              />
              <ReferenceDot
                x={lastPoint.date}
                y={lastPoint.equity}
                r={5}
                fill="#6C4DFF"
                stroke="#fff"
                strokeWidth={3}
                label={{
                  value: formatCompactCurrency(lastPoint.equity),
                  position: "right",
                  fill: "#6C4DFF",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-[20px] bg-[linear-gradient(180deg,rgba(108,77,255,0.10),rgba(255,255,255,0.75))]" />
        )}
      </div>
    </section>
  );
}
