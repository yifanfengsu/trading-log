"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import type {
  ReportPeriodType,
  ReportStats,
  SetupReportBreakdownRow,
  SuggestedReportText,
  TagReportBreakdownRow,
} from "@/lib/report-types";
import type { Trade } from "@/lib/trade-types";
import {
  cn,
  formatCurrency,
  formatPercent,
  formatProfitFactor,
  formatRMultiple,
} from "@/lib/utils";

interface ReportPreviewProps {
  periodType: ReportPeriodType;
  rangeLabel: string;
  stats: ReportStats;
  setupBreakdown: SetupReportBreakdownRow[];
  tagBreakdown: TagReportBreakdownRow[];
  topWinners: Trade[];
  topLosers: Trade[];
  manualReport: SuggestedReportText;
}

interface PreviewMetricProps {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative" | "accent";
}

const toneClassMap = {
  neutral: "text-slate-100",
  positive: "text-emerald-300",
  negative: "text-rose-300",
  accent: "text-violet-200",
} as const;

function PreviewMetric({ label, value, tone = "neutral" }: PreviewMetricProps) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-[rgba(15,23,42,0.46)] px-4 py-3">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className={cn("mt-1 text-sm font-semibold", toneClassMap[tone])}>
        {value}
      </p>
    </div>
  );
}

function getPnlTone(value: number) {
  return value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
}

export default function ReportPreview({
  periodType,
  rangeLabel,
  stats,
  setupBreakdown,
  tagBreakdown,
  topWinners,
  topLosers,
  manualReport,
}: ReportPreviewProps) {
  const { dictionary: copy } = useLanguage();
  const { settings } = useUserSettings();
  const reviewBlocks = [
    { label: copy.reportsPage.summary, value: manualReport.summary },
    { label: copy.reportsPage.keyWins, value: manualReport.keyWins },
    { label: copy.reportsPage.keyMistakes, value: manualReport.keyMistakes },
    { label: copy.reportsPage.lessons, value: manualReport.lessons },
    { label: copy.reportsPage.nextActions, value: manualReport.nextActions },
  ];
  const topTradeRows = [...topWinners.slice(0, 2), ...topLosers.slice(0, 2)];

  return (
    <section className="panel-card p-5 lg:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="panel-title">{copy.reportsPage.reportPreview}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {periodType === "weekly"
              ? copy.reportsPage.weekly
              : copy.reportsPage.monthly}
            <span className="px-2 text-slate-300">/</span>
            {rangeLabel}
          </p>
        </div>
      </div>

      {stats.totalTrades === 0 ? (
        <div className="mt-5 rounded-[20px] border border-dashed border-[rgba(148,163,184,0.22)] bg-[rgba(15,23,42,0.42)] px-5 py-8 text-sm font-medium text-slate-400">
          {copy.reportsPage.noTradeData}
        </div>
      ) : null}

      <div className="mt-5 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            {copy.reportsPage.corePerformance}
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <PreviewMetric
              label={copy.metrics.netPnl.label}
              value={formatCurrency(stats.netPnl, settings.currency)}
              tone={getPnlTone(stats.netPnl)}
            />
            <PreviewMetric
              label={copy.tradesPage.totalTrades}
              value={String(stats.totalTrades)}
              tone="accent"
            />
            <PreviewMetric
              label={copy.metrics.winRate.label}
              value={formatPercent(stats.winRate)}
            />
            <PreviewMetric
              label={copy.metrics.profitFactor.label}
              value={formatProfitFactor(stats.profitFactor)}
              tone="accent"
            />
            <PreviewMetric
              label={copy.analyticsPage.avgR}
              value={formatRMultiple(stats.avgR)}
              tone={getPnlTone(stats.avgR)}
            />
            <PreviewMetric
              label={copy.reportsPage.reviewCompletion}
              value={formatPercent(stats.reviewCompletionRate)}
              tone="accent"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              {copy.reportsPage.setupPerformance}
            </h3>
            <div className="mt-3 space-y-2">
              {setupBreakdown.slice(0, 3).map((row) => (
                <div
                  key={row.setup}
                  className="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-[rgba(15,23,42,0.46)] px-4 py-3"
                >
                  <span className="text-sm font-medium text-slate-300">
                    {copy.strategies[row.setup]}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      row.netPnl >= 0 ? "text-emerald-300" : "text-rose-300",
                    )}
                  >
                    {formatCurrency(row.netPnl, settings.currency)}
                  </span>
                </div>
              ))}
              {setupBreakdown.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-[rgba(148,163,184,0.22)] px-4 py-6 text-center text-sm font-medium text-slate-400">
                  {copy.reportsPage.noData}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              {copy.reportsPage.tagImpact}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {tagBreakdown.slice(0, 6).map((row) => (
                <span
                  key={row.tag}
                  className={cn(
                    "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                    row.netPnl >= 0
                      ? "border border-[rgba(16,185,129,0.24)] bg-[rgba(16,185,129,0.12)] text-emerald-300"
                      : "border border-[rgba(244,63,94,0.24)] bg-[rgba(244,63,94,0.12)] text-rose-300",
                  )}
                >
                  {row.tag} · {formatCurrency(row.netPnl, settings.currency)}
                </span>
              ))}
              {tagBreakdown.length === 0 ? (
                <div className="w-full rounded-[18px] border border-dashed border-[rgba(148,163,184,0.22)] px-4 py-6 text-center text-sm font-medium text-slate-400">
                  {copy.reportsPage.noData}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            {copy.reportsPage.topWinningTrades} /{" "}
            {copy.reportsPage.topLosingTrades}
          </h3>
          {topTradeRows.length > 0 ? (
            <div className="mt-3 grid gap-2">
              {topTradeRows.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-[rgba(15,23,42,0.46)] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-100">
                      {trade.symbol}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {copy.side[trade.side]} · {copy.strategies[trade.setup]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        trade.pnl >= 0 ? "text-emerald-300" : "text-rose-300",
                      )}
                    >
                      {formatCurrency(trade.pnl, settings.currency)}
                    </p>
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        trade.rMultiple >= 0
                          ? "text-emerald-300"
                          : "text-rose-300",
                      )}
                    >
                      {formatRMultiple(trade.rMultiple)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-[18px] border border-dashed border-[rgba(148,163,184,0.22)] px-4 py-6 text-center text-sm font-medium text-slate-400">
              {copy.reportsPage.noData}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            {copy.reportsPage.periodReview}
          </h3>
          <div className="mt-3 space-y-3">
            {reviewBlocks.map((block) => (
              <div
                key={block.label}
                className="rounded-[18px] border border-white/10 bg-[rgba(15,23,42,0.46)] px-4 py-3"
              >
                <p className="text-xs font-semibold text-slate-400">
                  {block.label}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                  {block.value.trim() || copy.reportsPage.noData}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 rounded-[18px] border border-[rgba(124,92,255,0.18)] bg-[rgba(124,92,255,0.08)] px-4 py-3 text-sm font-medium text-violet-200">
        {copy.reportsPage.copyMarkdownHint}
      </p>
    </section>
  );
}
