"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import type { ReviewBehaviorInsights as ReviewBehaviorInsightsData } from "@/lib/analytics-calculations";
import { cn, formatCurrency } from "@/lib/utils";

interface ReviewBehaviorInsightsProps {
  insights: ReviewBehaviorInsightsData;
}

interface InsightMetricProps {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative" | "accent";
}

const toneClassMap = {
  neutral: "text-slate-950",
  positive: "text-emerald-600",
  negative: "text-rose-600",
  accent: "text-[var(--accent)]",
} as const;

function formatScore(value: number) {
  return `${value.toFixed(1)} / 5`;
}

function getPnlTone(value: number) {
  if (value > 0) {
    return "positive";
  }

  if (value < 0) {
    return "negative";
  }

  return "neutral";
}

function InsightMetric({
  label,
  value,
  tone = "neutral",
}: InsightMetricProps) {
  return (
    <div className="rounded-[18px] bg-[rgba(15,23,42,0.03)] px-4 py-3">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className={cn("mt-1 text-lg font-semibold", toneClassMap[tone])}>
        {value}
      </p>
    </div>
  );
}

export default function ReviewBehaviorInsights({
  insights,
}: ReviewBehaviorInsightsProps) {
  const { dictionary: copy } = useLanguage();
  const { settings } = useUserSettings();

  return (
    <section className="panel-card p-5 lg:p-6">
      <h2 className="panel-title">{copy.analyticsPage.reviewBehaviorInsights}</h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <InsightMetric
          label={copy.analyticsPage.reviewedTradingDays}
          value={String(insights.reviewedTradingDays)}
          tone="accent"
        />
        <InsightMetric
          label={copy.analyticsPage.unreviewedTradingDays}
          value={String(insights.unreviewedTradingDays)}
        />
        <InsightMetric
          label={copy.analyticsPage.reviewedDaysPnl}
          value={formatCurrency(insights.reviewedDaysPnl, settings.currency)}
          tone={getPnlTone(insights.reviewedDaysPnl)}
        />
        <InsightMetric
          label={copy.analyticsPage.unreviewedDaysPnl}
          value={formatCurrency(insights.unreviewedDaysPnl, settings.currency)}
          tone={getPnlTone(insights.unreviewedDaysPnl)}
        />
        <InsightMetric
          label={copy.analyticsPage.averageExecutionScore}
          value={formatScore(insights.averageExecutionScore)}
          tone="accent"
        />
      </div>

      {insights.emotionStats.length === 0 ? (
        <div className="mt-5 rounded-[20px] border border-dashed border-[rgba(148,163,184,0.22)] bg-[rgba(250,250,255,0.72)] px-4 py-10 text-center text-sm font-medium text-slate-400">
          {copy.analyticsPage.noReviewData}
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[680px] border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.08em] text-slate-400">
                <th className="px-3 pb-2 font-medium">
                  {copy.analyticsPage.emotion}
                </th>
                <th className="px-3 pb-2 font-medium">
                  {copy.analyticsPage.reviewedDays}
                </th>
                <th className="px-3 pb-2 font-medium">
                  {copy.metrics.netPnl.label}
                </th>
                <th className="px-3 pb-2 font-medium">
                  {copy.analyticsPage.avgDailyPnl}
                </th>
                <th className="px-3 pb-2 font-medium">
                  {copy.analyticsPage.avgScore}
                </th>
              </tr>
            </thead>
            <tbody>
              {insights.emotionStats.map((row) => (
                <tr key={row.emotion} className="text-sm">
                  <td className="rounded-l-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-3 font-semibold text-slate-900">
                    {copy.calendarPage.emotions[row.emotion]}
                  </td>
                  <td className="bg-[rgba(250,250,255,0.88)] px-3 py-3 font-medium text-slate-600">
                    {row.reviewedDays}
                  </td>
                  <td
                    className={cn(
                      "bg-[rgba(250,250,255,0.88)] px-3 py-3 font-semibold",
                      row.netPnl >= 0 ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {formatCurrency(row.netPnl, settings.currency)}
                  </td>
                  <td
                    className={cn(
                      "bg-[rgba(250,250,255,0.88)] px-3 py-3 font-semibold",
                      row.avgDailyPnl >= 0
                        ? "text-emerald-600"
                        : "text-rose-600",
                    )}
                  >
                    {formatCurrency(row.avgDailyPnl, settings.currency)}
                  </td>
                  <td className="rounded-r-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-3 font-medium text-slate-600">
                    {formatScore(row.avgScore)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
