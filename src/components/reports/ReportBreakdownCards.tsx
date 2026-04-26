"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import type {
  DailyReportBreakdownRow,
  SetupReportBreakdownRow,
  TagReportBreakdownRow,
} from "@/lib/report-types";
import {
  cn,
  formatCurrency,
  formatDateTime,
  formatPercent,
  formatRMultiple,
} from "@/lib/utils";

interface ReportBreakdownCardsProps {
  dailyBreakdown: DailyReportBreakdownRow[];
  setupBreakdown: SetupReportBreakdownRow[];
  tagBreakdown: TagReportBreakdownRow[];
}

interface EmptyStateProps {
  label: string;
}

function EmptyState({ label }: EmptyStateProps) {
  return (
    <div className="rounded-[18px] border border-dashed border-[rgba(148,163,184,0.22)] bg-[rgba(250,250,255,0.72)] px-4 py-8 text-center text-sm font-medium text-slate-400">
      {label}
    </div>
  );
}

export default function ReportBreakdownCards({
  dailyBreakdown,
  setupBreakdown,
  tagBreakdown,
}: ReportBreakdownCardsProps) {
  const { dictionary: copy, locale } = useLanguage();
  const { settings } = useUserSettings();

  return (
    <section className="panel-card p-5 lg:p-6">
      <div className="grid gap-7">
        <div>
          <h2 className="panel-title">{copy.reportsPage.dailyBreakdown}</h2>
          {dailyBreakdown.length === 0 ? (
            <div className="mt-4">
              <EmptyState label={copy.reportsPage.noData} />
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[560px] w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.08em] text-slate-400">
                    <th className="px-3 pb-1 font-medium">
                      {copy.recentTrades.columns.time}
                    </th>
                    <th className="px-3 pb-1 font-medium">
                      {copy.recentTrades.columns.pnl}
                    </th>
                    <th className="px-3 pb-1 font-medium">
                      {copy.analyticsPage.trades}
                    </th>
                    <th className="px-3 pb-1 font-medium">
                      {copy.reportsPage.periodReview}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dailyBreakdown.slice(0, 8).map((row) => (
                    <tr key={row.date} className="text-sm">
                      <td className="rounded-l-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-3 font-medium text-slate-600">
                        {formatDateTime(row.date, locale)}
                      </td>
                      <td
                        className={cn(
                          "bg-[rgba(250,250,255,0.88)] px-3 py-3 font-semibold",
                          row.pnl >= 0 ? "text-emerald-600" : "text-rose-600",
                        )}
                      >
                        {formatCurrency(row.pnl, settings.currency)}
                      </td>
                      <td className="bg-[rgba(250,250,255,0.88)] px-3 py-3 font-medium text-slate-600">
                        {row.trades}
                      </td>
                      <td className="rounded-r-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                            row.reviewed
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-500",
                          )}
                        >
                          {row.reviewed
                            ? copy.reportsPage.reviewed
                            : copy.reportsPage.notReviewed}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h2 className="panel-title">{copy.reportsPage.setupBreakdown}</h2>
          {setupBreakdown.length === 0 ? (
            <div className="mt-4">
              <EmptyState label={copy.reportsPage.noData} />
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[620px] w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.08em] text-slate-400">
                    <th className="px-3 pb-1 font-medium">
                      {copy.recentTrades.columns.setup}
                    </th>
                    <th className="px-3 pb-1 font-medium">
                      {copy.analyticsPage.trades}
                    </th>
                    <th className="px-3 pb-1 font-medium">
                      {copy.metrics.netPnl.label}
                    </th>
                    <th className="px-3 pb-1 font-medium">
                      {copy.metrics.winRate.label}
                    </th>
                    <th className="px-3 pb-1 font-medium">
                      {copy.analyticsPage.avgR}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {setupBreakdown.slice(0, 8).map((row) => (
                    <tr key={row.setup} className="text-sm">
                      <td className="rounded-l-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-3 font-semibold text-slate-900">
                        {copy.strategies[row.setup]}
                      </td>
                      <td className="bg-[rgba(250,250,255,0.88)] px-3 py-3 font-medium text-slate-600">
                        {row.trades}
                      </td>
                      <td
                        className={cn(
                          "bg-[rgba(250,250,255,0.88)] px-3 py-3 font-semibold",
                          row.netPnl >= 0
                            ? "text-emerald-600"
                            : "text-rose-600",
                        )}
                      >
                        {formatCurrency(row.netPnl, settings.currency)}
                      </td>
                      <td className="bg-[rgba(250,250,255,0.88)] px-3 py-3 font-medium text-slate-600">
                        {formatPercent(row.winRate)}
                      </td>
                      <td
                        className={cn(
                          "rounded-r-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-3 font-semibold",
                          row.avgR > 0
                            ? "text-emerald-600"
                            : row.avgR < 0
                              ? "text-rose-600"
                              : "text-slate-600",
                        )}
                      >
                        {formatRMultiple(row.avgR)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h2 className="panel-title">{copy.reportsPage.tagBreakdown}</h2>
          {tagBreakdown.length === 0 ? (
            <div className="mt-4">
              <EmptyState label={copy.reportsPage.noData} />
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[620px] w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.08em] text-slate-400">
                    <th className="px-3 pb-1 font-medium">
                      {copy.analyticsPage.tag}
                    </th>
                    <th className="px-3 pb-1 font-medium">
                      {copy.analyticsPage.trades}
                    </th>
                    <th className="px-3 pb-1 font-medium">
                      {copy.metrics.netPnl.label}
                    </th>
                    <th className="px-3 pb-1 font-medium">
                      {copy.metrics.winRate.label}
                    </th>
                    <th className="px-3 pb-1 font-medium">
                      {copy.analyticsPage.avgR}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tagBreakdown.slice(0, 8).map((row) => (
                    <tr key={row.tag} className="text-sm">
                      <td className="rounded-l-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-3">
                        <span className="inline-flex rounded-full bg-[rgba(108,77,255,0.09)] px-3 py-1 font-semibold text-[var(--accent)]">
                          {row.tag}
                        </span>
                      </td>
                      <td className="bg-[rgba(250,250,255,0.88)] px-3 py-3 font-medium text-slate-600">
                        {row.trades}
                      </td>
                      <td
                        className={cn(
                          "bg-[rgba(250,250,255,0.88)] px-3 py-3 font-semibold",
                          row.netPnl >= 0
                            ? "text-emerald-600"
                            : "text-rose-600",
                        )}
                      >
                        {formatCurrency(row.netPnl, settings.currency)}
                      </td>
                      <td className="bg-[rgba(250,250,255,0.88)] px-3 py-3 font-medium text-slate-600">
                        {formatPercent(row.winRate)}
                      </td>
                      <td
                        className={cn(
                          "rounded-r-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-3 font-semibold",
                          row.avgR > 0
                            ? "text-emerald-600"
                            : row.avgR < 0
                              ? "text-rose-600"
                              : "text-slate-600",
                        )}
                      >
                        {formatRMultiple(row.avgR)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
