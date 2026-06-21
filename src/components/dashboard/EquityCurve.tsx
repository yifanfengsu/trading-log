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
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import SectionHeader from "@/components/ui/SectionHeader";
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
  const { settings } = useUserSettings();
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
    <Card>
      <SectionHeader
        title={copy.equityCurve.title}
        description={formatMonthRange(selectedMonth, locale)}
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm">
              {copy.chooseMetric}
            </Button>
            <Button type="button" variant="secondary" size="sm">
              {copy.lineChart}
            </Button>
          </div>
        }
      />

      <div className="mt-6 h-[320px] w-full">
        {data.length === 0 ? (
          <EmptyState title={copy.emptyState} className="h-full min-h-0" />
        ) : isClient ? (
          <ResponsiveContainer>
            <AreaChart
              data={data}
              margin={{ top: 12, right: 64, left: -18, bottom: 0 }}
            >
              <defs>
                <linearGradient id="equityGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#7C5CFF" stopOpacity={0.34} />
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="equityStroke" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#7C5CFF" />
                  <stop offset="100%" stopColor="#22D3EE" />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="rgba(148,163,184,0.12)"
                strokeDasharray="4 6"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tickMargin={14}
                ticks={chartTicks}
                minTickGap={32}
                tick={{ fill: "#94A3B8", fontSize: 12 }}
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
                tick={{ fill: "#94A3B8", fontSize: 12 }}
                tickFormatter={(value: number) =>
                  formatAxisCurrencyTick(value, settings.currency)
                }
              />
              <Tooltip
                cursor={{ stroke: "rgba(124,92,255,0.28)", strokeWidth: 1.5 }}
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 18px 44px rgba(2,6,23,0.42)",
                  backgroundColor: "#0F172A",
                  color: "#F8FAFC",
                }}
                labelStyle={{ color: "#F8FAFC", fontWeight: 600 }}
                formatter={(value) =>
                  formatCurrency(Number(value ?? 0), {
                    currency: settings.currency,
                    digits: 0,
                  })
                }
                labelFormatter={(label) =>
                  formatShortDateLabel(String(label), locale)
                }
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="url(#equityStroke)"
                strokeWidth={3}
                fill="url(#equityGradient)"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "#22D3EE",
                  stroke: "#0F172A",
                  strokeWidth: 3,
                }}
              />
              <ReferenceDot
                x={lastPoint.date}
                y={lastPoint.equity}
                r={5}
                fill="#22D3EE"
                stroke="#0F172A"
                strokeWidth={3}
                label={{
                  value: formatCompactCurrency(lastPoint.equity, settings.currency),
                  position: "right",
                  fill: "#22D3EE",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-[20px] bg-[linear-gradient(180deg,rgba(124,92,255,0.12),rgba(15,23,42,0.58))]" />
        )}
      </div>
    </Card>
  );
}
