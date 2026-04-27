"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import type { TagImpactRow } from "@/lib/analytics-calculations";
import {
  cn,
  formatCurrency,
  formatPercent,
  formatRMultiple,
} from "@/lib/utils";

interface TagImpactTableProps {
  rows: TagImpactRow[];
}

export default function TagImpactTable({ rows }: TagImpactTableProps) {
  const { dictionary: copy } = useLanguage();
  const { settings } = useUserSettings();
  const displayRows = rows.slice(0, 8);

  return (
    <section className="panel-card p-5 lg:p-6">
      <h2 className="panel-title">{copy.analyticsPage.tagImpact}</h2>

      {displayRows.length === 0 ? (
        <div className="mt-5 flex min-h-[300px] items-center justify-center rounded-[20px] border border-dashed border-[rgba(148,163,184,0.22)] bg-[rgba(250,250,255,0.72)] text-sm font-medium text-slate-400">
          {copy.analyticsPage.noTagData}
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[680px] border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.08em] text-slate-400">
                <th className="px-3 pb-2 font-medium">
                  {copy.analyticsPage.tag}
                </th>
                <th className="px-3 pb-2 font-medium">
                  {copy.analyticsPage.trades}
                </th>
                <th className="px-3 pb-2 font-medium">
                  {copy.metrics.netPnl.label}
                </th>
                <th className="px-3 pb-2 font-medium">
                  {copy.metrics.winRate.label}
                </th>
                <th className="px-3 pb-2 font-medium">
                  {copy.analyticsPage.avgR}
                </th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row) => (
                <tr key={row.tag} className="text-sm">
                  <td className="rounded-l-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-3">
                    <span className="inline-flex rounded-full bg-[rgba(108,77,255,0.09)] px-3 py-1 font-semibold text-[var(--accent)]">
                      {row.tag}
                    </span>
                  </td>
                  <td className="bg-[rgba(250,250,255,0.88)] px-3 py-3 font-medium text-slate-600">
                    {row.totalTrades}
                  </td>
                  <td
                    className={cn(
                      "bg-[rgba(250,250,255,0.88)] px-3 py-3 font-semibold",
                      row.netPnl >= 0 ? "text-emerald-600" : "text-rose-600",
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
    </section>
  );
}
