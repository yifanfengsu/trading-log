"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable, {
  dataTableCellClassName,
  dataTableHeadCellClassName,
} from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Trade } from "@/lib/trade-types";
import {
  cn,
  formatCurrency,
  formatDateTime,
  formatRMultiple,
} from "@/lib/utils";

interface ReportTopTradesProps {
  topWinners: Trade[];
  topLosers: Trade[];
}

interface TradeListProps {
  title: string;
  rows: Trade[];
  emptyLabel: string;
}

function TradeList({ title, rows, emptyLabel }: TradeListProps) {
  const { dictionary: copy, locale } = useLanguage();
  const { settings } = useUserSettings();

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {rows.length === 0 ? (
        <EmptyState title={emptyLabel} className="mt-3 min-h-[180px]" />
      ) : (
        <DataTable minWidth={620} className="mt-3">
            <thead>
              <tr>
                <th className={dataTableHeadCellClassName}>
                  {copy.recentTrades.columns.time}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.recentTrades.columns.symbol}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.recentTrades.columns.side}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.recentTrades.columns.setup}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.recentTrades.columns.pnl}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.recentTrades.columns.rMultiple}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((trade) => (
                <tr key={trade.id} className="group">
                  <td className={dataTableCellClassName}>
                    {formatDateTime(trade.closedAt, locale)}
                  </td>
                  <td className={cn(dataTableCellClassName, "font-semibold text-slate-900")}>
                    {trade.symbol}
                  </td>
                  <td className={dataTableCellClassName}>
                    <Badge variant="purple">{copy.side[trade.side]}</Badge>
                  </td>
                  <td className={dataTableCellClassName}>
                    {copy.strategies[trade.setup]}
                  </td>
                  <td
                    className={cn(
                      dataTableCellClassName,
                      "font-semibold",
                      trade.pnl >= 0 ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {formatCurrency(trade.pnl, settings.currency)}
                  </td>
                  <td
                    className={cn(
                      dataTableCellClassName,
                      "font-semibold",
                      trade.rMultiple >= 0
                        ? "text-emerald-600"
                        : "text-rose-600",
                    )}
                  >
                    {formatRMultiple(trade.rMultiple)}
                  </td>
                </tr>
              ))}
            </tbody>
        </DataTable>
      )}
    </div>
  );
}

export default function ReportTopTrades({
  topWinners,
  topLosers,
}: ReportTopTradesProps) {
  const { dictionary: copy } = useLanguage();

  return (
    <Card as="section">
      <SectionHeader
        title={`${copy.reportsPage.topWinningTrades} / ${copy.reportsPage.topLosingTrades}`}
      />
      <div className="mt-5 grid gap-6">
        <TradeList
          title={copy.reportsPage.topWinningTrades}
          rows={topWinners}
          emptyLabel={copy.analyticsPage.noWinningTrades}
        />
        <TradeList
          title={copy.reportsPage.topLosingTrades}
          rows={topLosers}
          emptyLabel={copy.analyticsPage.noLosingTrades}
        />
      </div>
    </Card>
  );
}
