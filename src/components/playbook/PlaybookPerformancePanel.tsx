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
    <Card as="section">
      <SectionHeader title={copy.playbookPage.playbookPerformance} />

      {rows.length === 0 ? (
        <EmptyState
          title={copy.playbookPage.noLinkedTradesYet}
          className="mt-5 min-h-[220px]"
        />
      ) : (
        <DataTable minWidth={820} className="mt-5">
            <thead>
              <tr>
                <th className={dataTableHeadCellClassName}>
                  {copy.playbookPage.playbook}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.playbookPage.setupType}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.tradesPage.totalTrades}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.strategyPerformance.netPnl}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.strategyPerformance.winRate}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.strategyPerformance.profitFactor}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.tradesPage.avgR}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ playbook, stats }) => (
                <tr key={playbook.id} className="group">
                  <td className={cn(dataTableCellClassName, "font-semibold text-slate-900")}>
                    <span className="line-clamp-1">{playbook.name}</span>
                  </td>
                  <td className={dataTableCellClassName}>
                    {copy.strategies[playbook.setup]}
                  </td>
                  <td className={dataTableCellClassName}>
                    {stats.linkedTrades}
                  </td>
                  <td
                    className={cn(
                      dataTableCellClassName,
                      "font-semibold",
                      stats.netPnl >= 0 ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {formatCurrency(stats.netPnl, settings.currency)}
                  </td>
                  <td className={dataTableCellClassName}>
                    {formatPercent(stats.winRate)}
                  </td>
                  <td className={dataTableCellClassName}>
                    {formatProfitFactor(stats.profitFactor)}
                  </td>
                  <td
                    className={cn(
                      dataTableCellClassName,
                      "font-semibold",
                      stats.avgR >= 0 ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {formatRMultiple(stats.avgR)}
                  </td>
                </tr>
              ))}
            </tbody>
        </DataTable>
      )}
    </Card>
  );
}
