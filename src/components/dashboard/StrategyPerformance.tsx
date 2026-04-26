"use client";

import { ArrowRight } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import type { StrategyStats } from "@/lib/trade-calculations";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

interface StrategyPerformanceProps {
  rows: StrategyStats[];
}

export default function StrategyPerformance({
  rows,
}: StrategyPerformanceProps) {
  const { dictionary: copy } = useLanguage();
  const { settings } = useUserSettings();

  return (
    <section className="panel-card p-5 lg:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="panel-title">{copy.strategyPerformance.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {copy.strategyPerformance.subtitle}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]"
        >
          {copy.strategyPerformance.viewAll}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="mt-5 flex min-h-[248px] items-center justify-center rounded-[20px] border border-dashed border-[rgba(148,163,184,0.22)] bg-[rgba(250,250,255,0.72)] text-sm font-medium text-slate-400">
          {copy.emptyState}
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.08em] text-slate-400">
                <th className="px-3 pb-2 font-medium">
                  {copy.strategyPerformance.strategy}
                </th>
                <th className="px-3 pb-2 font-medium">
                  {copy.strategyPerformance.netPnl}
                </th>
                <th className="px-3 pb-2 font-medium">
                  {copy.strategyPerformance.winRate}
                </th>
                <th className="px-3 pb-2 font-medium">
                  {copy.strategyPerformance.profitFactor}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const winRateWidth = `${Math.min(row.winRate, 100)}%`;
                const factorWidth = `${
                  Number.isFinite(row.profitFactor)
                    ? Math.min((row.profitFactor / 2.5) * 100, 100)
                    : 100
                }%`;

                return (
                  <tr key={row.setup} className="bg-transparent">
                    <td className="rounded-l-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-4">
                      <div className="font-semibold text-slate-900">
                        {copy.strategies[row.setup]}
                      </div>
                    </td>
                    <td
                      className={cn(
                        "bg-[rgba(250,250,255,0.88)] px-3 py-4 font-semibold",
                        row.netPnl >= 0 ? "text-emerald-600" : "text-rose-600",
                      )}
                    >
                      {formatCurrency(row.netPnl, settings.currency)}
                    </td>
                    <td className="bg-[rgba(250,250,255,0.88)] px-3 py-4">
                      <div className="min-w-[132px]">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="font-semibold text-slate-900">
                            {formatPercent(row.winRate)}
                          </span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-[rgba(108,77,255,0.08)]">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#8a74ff,#6c4dff)]"
                            style={{ width: winRateWidth }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="rounded-r-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-4">
                      <div className="min-w-[132px]">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span
                            className={cn(
                              "font-semibold",
                              row.profitFactor >= 1.5 ||
                                row.profitFactor === Infinity
                                ? "text-[var(--accent)]"
                                : "text-slate-900",
                            )}
                          >
                            {formatNumber(row.profitFactor)}
                          </span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-[rgba(108,77,255,0.08)]">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#d5ccff,#6c4dff)]"
                            style={{ width: factorWidth }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
