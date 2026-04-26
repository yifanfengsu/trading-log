"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
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
        <div className="mt-3 rounded-[18px] border border-dashed border-[rgba(148,163,184,0.22)] bg-[rgba(250,250,255,0.72)] px-4 py-8 text-center text-sm font-medium text-slate-400">
          {emptyLabel}
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-[620px] w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.08em] text-slate-400">
                <th className="px-3 pb-1 font-medium">
                  {copy.recentTrades.columns.time}
                </th>
                <th className="px-3 pb-1 font-medium">
                  {copy.recentTrades.columns.symbol}
                </th>
                <th className="px-3 pb-1 font-medium">
                  {copy.recentTrades.columns.side}
                </th>
                <th className="px-3 pb-1 font-medium">
                  {copy.recentTrades.columns.setup}
                </th>
                <th className="px-3 pb-1 font-medium">
                  {copy.recentTrades.columns.pnl}
                </th>
                <th className="px-3 pb-1 font-medium">
                  {copy.recentTrades.columns.rMultiple}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((trade) => (
                <tr key={trade.id} className="text-sm">
                  <td className="rounded-l-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-3 font-medium text-slate-600">
                    {formatDateTime(trade.closedAt, locale)}
                  </td>
                  <td className="bg-[rgba(250,250,255,0.88)] px-3 py-3 font-semibold text-slate-900">
                    {trade.symbol}
                  </td>
                  <td className="bg-[rgba(250,250,255,0.88)] px-3 py-3 text-slate-600">
                    {copy.side[trade.side]}
                  </td>
                  <td className="bg-[rgba(250,250,255,0.88)] px-3 py-3 text-slate-600">
                    {copy.strategies[trade.setup]}
                  </td>
                  <td
                    className={cn(
                      "bg-[rgba(250,250,255,0.88)] px-3 py-3 font-semibold",
                      trade.pnl >= 0 ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {formatCurrency(trade.pnl, settings.currency)}
                  </td>
                  <td
                    className={cn(
                      "rounded-r-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-3 font-semibold",
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
          </table>
        </div>
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
    <section className="panel-card p-5 lg:p-6">
      <h2 className="panel-title">
        {copy.reportsPage.topWinningTrades} / {copy.reportsPage.topLosingTrades}
      </h2>
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
    </section>
  );
}
