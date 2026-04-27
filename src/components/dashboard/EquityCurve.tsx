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
                  <stop offset="0%" stopColor="#6D5DF6" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#6D5DF6" stopOpacity={0.02} />
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
                tickFormatter={(value: number) =>
                  formatAxisCurrencyTick(value, settings.currency)
                }
              />
              <Tooltip
                cursor={{ stroke: "rgba(108,77,255,0.18)", strokeWidth: 1.5 }}
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid rgba(109,93,246,0.14)",
                  boxShadow: "0 14px 34px rgba(30,41,59,0.10)",
                  backgroundColor: "rgba(255,255,255,0.98)",
                }}
                labelStyle={{ color: "#172033", fontWeight: 600 }}
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
                stroke="#6D5DF6"
                strokeWidth={3}
                fill="url(#equityGradient)"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "#6D5DF6",
                  stroke: "#ffffff",
                  strokeWidth: 3,
                }}
              />
              <ReferenceDot
                x={lastPoint.date}
                y={lastPoint.equity}
                r={5}
                fill="#6D5DF6"
                stroke="#fff"
                strokeWidth={3}
                label={{
                  value: formatCompactCurrency(lastPoint.equity, settings.currency),
                  position: "right",
                  fill: "#6D5DF6",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-[20px] bg-[linear-gradient(180deg,rgba(109,93,246,0.10),rgba(255,255,255,0.75))]" />
        )}
      </div>
    </Card>
  );
}
