"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import { getPlaybookStats } from "@/lib/playbook-calculations";
import type { Playbook } from "@/lib/playbook-types";
import type { Trade } from "@/lib/trade-types";
import {
  cn,
  formatCurrency,
  formatPercent,
  formatProfitFactor,
  formatRMultiple,
} from "@/lib/utils";

interface PlaybookPerformancePanelProps {
  playbooks: Playbook[];
  trades: Trade[];
}

export default function PlaybookPerformancePanel({
  playbooks,
  trades,
}: PlaybookPerformancePanelProps) {
  const { dictionary: copy } = useLanguage();
  const { settings } = useUserSettings();
  const rows = playbooks
    .map((playbook) => ({
      playbook,
      stats: getPlaybookStats(trades, playbook),
    }))
    .filter((row) => row.stats.linkedTrades > 0)
    .sort((a, b) => b.stats.netPnl - a.stats.netPnl)
    .slice(0, 8);

  return (
    <section className="panel-card p-5 lg:p-6">
      <h2 className="panel-title">{copy.playbookPage.playbookPerformance}</h2>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-[18px] bg-[rgba(250,250,255,0.88)] px-4 py-8 text-center text-sm font-medium text-slate-400">
          {copy.playbookPage.noLinkedTradesYet}
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[820px] w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.08em] text-slate-400">
                <th className="px-3 pb-2 font-medium">
                  {copy.playbookPage.playbook}
                </th>
                <th className="px-3 pb-2 font-medium">
                  {copy.playbookPage.setupType}
                </th>
                <th className="px-3 pb-2 font-medium">
                  {copy.tradesPage.totalTrades}
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
                <th className="px-3 pb-2 font-medium">
                  {copy.tradesPage.avgR}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ playbook, stats }) => (
                <tr key={playbook.id} className="text-sm text-slate-600">
                  <td className="rounded-l-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-4 font-semibold text-slate-900">
                    <span className="line-clamp-1">{playbook.name}</span>
                  </td>
                  <td className="bg-[rgba(250,250,255,0.88)] px-3 py-4">
                    {copy.strategies[playbook.setup]}
                  </td>
                  <td className="bg-[rgba(250,250,255,0.88)] px-3 py-4">
                    {stats.linkedTrades}
                  </td>
                  <td
                    className={cn(
                      "bg-[rgba(250,250,255,0.88)] px-3 py-4 font-semibold",
                      stats.netPnl >= 0 ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {formatCurrency(stats.netPnl, settings.currency)}
                  </td>
                  <td className="bg-[rgba(250,250,255,0.88)] px-3 py-4">
                    {formatPercent(stats.winRate)}
                  </td>
                  <td className="bg-[rgba(250,250,255,0.88)] px-3 py-4">
                    {formatProfitFactor(stats.profitFactor)}
                  </td>
                  <td
                    className={cn(
                      "rounded-r-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-4 font-semibold",
                      stats.avgR >= 0 ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {formatRMultiple(stats.avgR)}
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
