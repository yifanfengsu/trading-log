"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
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

      <div className="mt-4 h-[280px] w-full">
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
                  <stop offset="0%" stopColor="#B8F135" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#B8F135" stopOpacity={0} />
                </linearGradient>
                {/* Soft halo for the glow underlay; the generous filter region
                    keeps the blur from clipping at the path's bounding box. */}
                <filter
                  id="equityGlow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="5" />
                </filter>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tickMargin={14}
                ticks={chartTicks}
                minTickGap={32}
                tick={{ fill: "#5F675F", fontSize: 12 }}
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
                tick={{ fill: "#5F675F", fontSize: 12 }}
                tickFormatter={(value: number) =>
                  formatAxisCurrencyTick(value, settings.currency)
                }
              />
              <Tooltip
                cursor={{ stroke: "rgba(184,241,53,0.28)", strokeWidth: 1.5 }}
                contentStyle={{
                  borderRadius: 16,
                  border: "none",
                  boxShadow: "0 18px 44px rgba(0,0,0,0.42)",
                  backgroundColor: "#1E211E",
                  color: "#F2F4F2",
                }}
                labelStyle={{ color: "#F2F4F2", fontWeight: 600 }}
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
              {/* Glow underlay: a wide low-opacity copy of the line, blurred
                  into a halo by the filter. Excluded from tooltip and dots so
                  only the main line below carries the data affordances. */}
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#B8F135"
                strokeWidth={9}
                strokeOpacity={0.3}
                fill="none"
                filter="url(#equityGlow)"
                dot={false}
                activeDot={false}
                tooltipType="none"
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#B8F135"
                strokeWidth={2.5}
                fill="url(#equityGradient)"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "#B8F135",
                  stroke: "#141614",
                  strokeWidth: 3,
                }}
              />
              <ReferenceDot
                x={lastPoint.date}
                y={lastPoint.equity}
                r={5}
                fill="#B8F135"
                stroke="#141614"
                strokeWidth={3}
                label={{
                  value: formatCompactCurrency(lastPoint.equity, settings.currency),
                  position: "right",
                  fill: "#B8F135",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-[20px] bg-[var(--card-strong)]" />
        )}
      </div>
    </Card>
  );
}
