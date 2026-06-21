"use client";

import { useSyncExternalStore } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
} from "recharts";

import { useLanguage } from "@/components/providers/LanguageProvider";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  cn,
  formatPercent,
  formatProfitFactor,
  formatRMultiple,
} from "@/lib/utils";

interface PerformanceRadarProps {
  // Raw aggregates straight from the existing calculations (no algorithm here —
  // only the display-layer normalization below maps them onto a 0–100 scale).
  winRate: number; // percentage 0–100
  profitFactor: number; // ratio (can be Infinity)
  avgR: number; // average R multiple
  payoffRatio: number; // avg win / |avg loss| (can be Infinity)
  maxDrawdownPercent: number; // positive percentage
  consistency: number; // winning-day ratio, percentage 0–100
}

interface RadarDatum {
  key: string;
  label: string;
  score: number;
  raw: string;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function PerformanceRadar({
  winRate,
  profitFactor,
  avgR,
  payoffRatio,
  maxDrawdownPercent,
  consistency,
}: PerformanceRadarProps) {
  const { dictionary: copy } = useLanguage();
  const isClient = useIsClient();
  const labels = copy.performanceRadar;

  // ----- Display-layer normalization to a common 0–100 scale -----
  // Win rate: used as-is (already a percentage).
  // Profit factor / payoff ratio: >= 3 counts as full marks; Infinity -> 100.
  // Avg R: 0R -> 50, +2R -> 100, -2R -> 0 (50 + avgR*25).
  // Risk control: smaller drawdown is better; 0% -> 100, >= 40% -> 0.
  // Consistency: winning-day ratio, already a percentage.
  const dims: RadarDatum[] = [
    {
      key: "winRate",
      label: labels.winRate,
      score: clamp(winRate),
      raw: formatPercent(winRate),
    },
    {
      key: "profitFactor",
      label: labels.profitFactor,
      score: Number.isFinite(profitFactor)
        ? clamp((profitFactor / 3) * 100)
        : 100,
      raw: formatProfitFactor(profitFactor),
    },
    {
      key: "avgR",
      label: labels.avgR,
      score: clamp(50 + avgR * 25),
      raw: formatRMultiple(avgR),
    },
    {
      key: "payoff",
      label: labels.payoff,
      score: Number.isFinite(payoffRatio)
        ? clamp((payoffRatio / 3) * 100)
        : 100,
      raw: Number.isFinite(payoffRatio) ? payoffRatio.toFixed(2) : "∞",
    },
    {
      key: "riskControl",
      label: labels.riskControl,
      score: clamp(100 - (clamp(maxDrawdownPercent, 0, 40) / 40) * 100),
      raw: formatPercent(maxDrawdownPercent),
    },
    {
      key: "consistency",
      label: labels.consistency,
      score: clamp(consistency),
      raw: formatPercent(consistency),
    },
  ];

  const overall = Math.round(
    dims.reduce((total, dim) => total + dim.score, 0) / dims.length,
  );

  function renderTooltip({ active, payload }: TooltipContentProps) {
    const row = payload?.[0]?.payload as RadarDatum | undefined;

    if (!active || !row) {
      return null;
    }

    return (
      <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-3 text-sm text-slate-200 shadow-[0_18px_44px_rgba(2,6,23,0.42)]">
        <p className="font-semibold text-slate-50">{row.label}</p>
        <div className="mt-1 grid gap-0.5 text-slate-400">
          <span className="tabular-nums">{row.raw}</span>
          <span className="tabular-nums text-violet-200">
            {Math.round(row.score)} / 100
          </span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <SectionHeader title={labels.title} description={labels.subtitle} />

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(200px,0.72fr)]">
        <div className="h-[300px] w-full">
          {isClient ? (
            <ResponsiveContainer>
              <RadarChart data={dims} outerRadius="72%">
                <defs>
                  <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7C5CFF" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.22} />
                  </linearGradient>
                </defs>
                <PolarGrid stroke="rgba(148,163,184,0.14)" />
                <PolarAngleAxis
                  dataKey="label"
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  dataKey="score"
                  stroke="#7C5CFF"
                  strokeWidth={2}
                  fill="url(#radarFill)"
                  fillOpacity={1}
                />
                <Tooltip content={renderTooltip} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full rounded-[20px] bg-[linear-gradient(180deg,rgba(124,92,255,0.12),rgba(15,23,42,0.58))]" />
          )}
        </div>

        <div className="flex flex-col justify-center gap-3">
          <div className="rounded-[18px] border border-[rgba(124,92,255,0.24)] bg-[rgba(124,92,255,0.10)] px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
              {labels.score}
            </p>
            <p className="mt-1 text-[32px] font-bold leading-none tabular-nums text-slate-50">
              {overall}
              <span className="ml-1 text-base font-semibold text-slate-500">
                / 100
              </span>
            </p>
          </div>

          {dims.map((dim) => (
            <div key={dim.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{dim.label}</span>
                <span className="font-semibold tabular-nums text-slate-200">
                  {Math.round(dim.score)}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[rgba(148,163,184,0.14)]">
                <div
                  className={cn(
                    "h-full rounded-full bg-[linear-gradient(90deg,#7C5CFF,#22D3EE)]",
                  )}
                  style={{ width: `${clamp(dim.score)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
