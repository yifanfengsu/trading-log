"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Card from "@/components/ui/Card";
import DataTable, {
  dataTableCellClassName,
  dataTableHeadCellClassName,
} from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import SectionHeader from "@/components/ui/SectionHeader";
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
    <div className="rounded-[18px] bg-[rgba(30,33,30,0.03)] px-4 py-3">
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
    <Card as="section">
      <SectionHeader title={copy.analyticsPage.reviewBehaviorInsights} />

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
        <EmptyState
          title={copy.analyticsPage.noReviewData}
          className="mt-5 min-h-[180px]"
        />
      ) : (
        <DataTable minWidth={680} className="mt-5">
            <thead>
              <tr>
                <th className={dataTableHeadCellClassName}>
                  {copy.analyticsPage.emotion}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.analyticsPage.reviewedDays}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.metrics.netPnl.label}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.analyticsPage.avgDailyPnl}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.analyticsPage.avgScore}
                </th>
              </tr>
            </thead>
            <tbody>
              {insights.emotionStats.map((row) => (
                <tr key={row.emotion} className="group">
                  <td className={cn(dataTableCellClassName, "font-semibold text-slate-900")}>
                    {copy.calendarPage.emotions[row.emotion]}
                  </td>
                  <td className={dataTableCellClassName}>
                    {row.reviewedDays}
                  </td>
                  <td
                    className={cn(
                      dataTableCellClassName,
                      "font-semibold",
                      row.netPnl >= 0 ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {formatCurrency(row.netPnl, settings.currency)}
                  </td>
                  <td
                    className={cn(
                      dataTableCellClassName,
                      "font-semibold",
                      row.avgDailyPnl >= 0
                        ? "text-emerald-600"
                        : "text-rose-600",
                    )}
                  >
                    {formatCurrency(row.avgDailyPnl, settings.currency)}
                  </td>
                  <td className={dataTableCellClassName}>
                    {formatScore(row.avgScore)}
                  </td>
                </tr>
              ))}
            </tbody>
        </DataTable>
      )}
    </Card>
  );
}
