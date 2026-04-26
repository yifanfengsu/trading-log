"use client";

import { ArrowDown, ArrowUp, Eye, NotebookPen, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { usePlaybooks } from "@/components/providers/PlaybookStoreProvider";
import { useTradeDrawer } from "@/components/providers/TradeDrawerProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import type { TradeSortKey, TradeSortState } from "@/lib/trade-filters";
import type { Trade } from "@/lib/trade-types";
import {
  cn,
  formatCurrency,
  formatRMultiple,
  formatRisk,
  formatTradePrice,
  formatTradeTimestamp,
} from "@/lib/utils";

interface TradesTableProps {
  trades: Trade[];
  hasAnyTrades: boolean;
  sortState: TradeSortState;
  onSort: (key: TradeSortKey) => void;
  onView: (trade: Trade) => void;
  onResetFilters: () => void;
}

interface SortableHeaderProps {
  label: string;
  sortKey: TradeSortKey;
  sortState: TradeSortState;
  onSort: (key: TradeSortKey) => void;
}

function SortableHeader({
  label,
  sortKey,
  sortState,
  onSort,
}: SortableHeaderProps) {
  const isActive = sortState?.key === sortKey;
  const Icon = sortState?.direction === "desc" ? ArrowDown : ArrowUp;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className="inline-flex items-center gap-1 font-medium text-slate-400 transition-colors hover:text-slate-700"
    >
      {label}
      {isActive ? <Icon className="h-3.5 w-3.5" /> : null}
    </button>
  );
}

function getSymbolBadge(symbol: string) {
  const asset = symbol.replace("USDT", "");

  if (asset === "BTC") {
    return {
      label: "B",
      className: "bg-amber-50 text-amber-600 ring-amber-100",
    };
  }

  if (asset === "ETH") {
    return {
      label: "E",
      className: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    };
  }

  return {
    label: asset.slice(0, 1) || "T",
    className: "bg-cyan-50 text-cyan-600 ring-cyan-100",
  };
}

export default function TradesTable({
  trades,
  hasAnyTrades,
  sortState,
  onSort,
  onView,
  onResetFilters,
}: TradesTableProps) {
  const { dictionary: copy } = useLanguage();
  const router = useRouter();
  const { settings } = useUserSettings();
  const { deleteTrade } = useTrades();
  const { getPlaybookById } = usePlaybooks();
  const { openCreateTrade, openEditTrade } = useTradeDrawer();

  function handleDelete(trade: Trade) {
    if (window.confirm(copy.tradeForm.deleteConfirm)) {
      deleteTrade(trade.id);
    }
  }

  function handleAddNote(trade: Trade) {
    router.push(`/notes?tradeId=${encodeURIComponent(trade.id)}`);
  }

  return (
    <section className="panel-card p-5 lg:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="panel-title">{copy.tradesPage.filteredResults}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {trades.length} {copy.tradesPage.tradeCountLabel}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1380px] w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.08em] text-slate-400">
              <th className="px-3 pb-2">
                <SortableHeader
                  label={copy.recentTrades.columns.time}
                  sortKey="closedAt"
                  sortState={sortState}
                  onSort={onSort}
                />
              </th>
              <th className="px-3 pb-2">
                <SortableHeader
                  label={copy.recentTrades.columns.symbol}
                  sortKey="symbol"
                  sortState={sortState}
                  onSort={onSort}
                />
              </th>
              <th className="px-3 pb-2 font-medium">
                {copy.recentTrades.columns.side}
              </th>
              <th className="px-3 pb-2 font-medium">
                {copy.recentTrades.columns.setup}
              </th>
              <th className="px-3 pb-2 font-medium">
                {copy.playbookPage.playbook}
              </th>
              <th className="px-3 pb-2 font-medium">
                {copy.recentTrades.columns.entry}
              </th>
              <th className="px-3 pb-2 font-medium">
                {copy.recentTrades.columns.exit}
              </th>
              <th className="px-3 pb-2 font-medium">
                {copy.recentTrades.columns.risk}
              </th>
              <th className="px-3 pb-2">
                <SortableHeader
                  label={copy.recentTrades.columns.pnl}
                  sortKey="pnl"
                  sortState={sortState}
                  onSort={onSort}
                />
              </th>
              <th className="px-3 pb-2">
                <SortableHeader
                  label={copy.recentTrades.columns.rMultiple}
                  sortKey="rMultiple"
                  sortState={sortState}
                  onSort={onSort}
                />
              </th>
              <th className="px-3 pb-2 font-medium">
                {copy.tradesPage.notes}
              </th>
              <th className="px-3 pb-2 font-medium">
                {copy.recentTrades.columns.status}
              </th>
              <th className="px-3 pb-2 font-medium">
                {copy.tradesPage.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 ? (
              <tr>
                <td
                  colSpan={13}
                  className="rounded-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-14 text-center"
                >
                  <p className="text-sm font-semibold text-slate-500">
                    {hasAnyTrades ? copy.tradesPage.noFilterResults : copy.emptyState}
                  </p>
                  <button
                    type="button"
                    onClick={hasAnyTrades ? onResetFilters : openCreateTrade}
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.18)]"
                  >
                    {hasAnyTrades ? copy.tradesPage.resetFilters : copy.addTrade}
                  </button>
                </td>
              </tr>
            ) : (
              trades.map((trade) => {
                const badge = getSymbolBadge(trade.symbol);

                return (
                  <tr key={trade.id} className="text-sm text-slate-600">
                    <td className="rounded-l-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-4 font-medium text-slate-700">
                      {formatTradeTimestamp(trade.closedAt)}
                    </td>
                    <td className="bg-[rgba(250,250,255,0.88)] px-3 py-4">
                      <div className="flex items-center gap-3 font-semibold text-slate-900">
                        <span
                          className={cn(
                            "inline-flex h-9 w-9 items-center justify-center rounded-full text-sm ring-1 ring-inset",
                            badge.className,
                          )}
                        >
                          {badge.label}
                        </span>
                        {trade.symbol}
                      </div>
                    </td>
                    <td className="bg-[rgba(250,250,255,0.88)] px-3 py-4">
                      <span className="inline-flex rounded-full bg-[rgba(108,77,255,0.08)] px-3 py-1 font-medium text-[var(--accent)]">
                        {copy.side[trade.side]}
                      </span>
                    </td>
                    <td className="bg-[rgba(250,250,255,0.88)] px-3 py-4 font-medium text-slate-700">
                      {copy.strategies[trade.setup]}
                    </td>
                    <td className="bg-[rgba(250,250,255,0.88)] px-3 py-4 font-medium text-slate-700">
                      <span className="line-clamp-1">
                        {trade.playbookId
                          ? (getPlaybookById(trade.playbookId)?.name ??
                            copy.playbookPage.deletedPlaybook)
                          : "—"}
                      </span>
                    </td>
                    <td className="bg-[rgba(250,250,255,0.88)] px-3 py-4">
                      {formatTradePrice(trade.entryPrice)}
                    </td>
                    <td className="bg-[rgba(250,250,255,0.88)] px-3 py-4">
                      {formatTradePrice(trade.exitPrice)}
                    </td>
                    <td className="bg-[rgba(250,250,255,0.88)] px-3 py-4">
                      {formatRisk(trade.riskPercent)}
                    </td>
                    <td
                      className={cn(
                        "bg-[rgba(250,250,255,0.88)] px-3 py-4 font-semibold",
                        trade.pnl >= 0 ? "text-emerald-600" : "text-rose-600",
                      )}
                    >
                      {formatCurrency(trade.pnl, settings.currency)}
                    </td>
                    <td
                      className={cn(
                        "bg-[rgba(250,250,255,0.88)] px-3 py-4 font-semibold",
                        trade.rMultiple >= 0
                          ? "text-emerald-600"
                          : "text-rose-600",
                      )}
                    >
                      {formatRMultiple(trade.rMultiple)}
                    </td>
                    <td className="max-w-[180px] bg-[rgba(250,250,255,0.88)] px-3 py-4">
                      <span className="line-clamp-1">
                        {trade.notes || copy.tradesPage.noNotes}
                      </span>
                    </td>
                    <td className="bg-[rgba(250,250,255,0.88)] px-3 py-4">
                      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                        {copy.status[trade.status]}
                      </span>
                    </td>
                    <td className="rounded-r-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onView(trade)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                          aria-label={copy.tradesPage.viewDetails}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditTrade(trade)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(108,77,255,0.08)] text-[var(--accent)] transition-colors hover:bg-[rgba(108,77,255,0.14)]"
                          aria-label={copy.tradesPage.editTrade}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddNote(trade)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(108,77,255,0.08)] text-[var(--accent)] transition-colors hover:bg-[rgba(108,77,255,0.14)]"
                          aria-label={copy.notesPage.addNote}
                        >
                          <NotebookPen className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(trade)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100"
                          aria-label={copy.tradesPage.deleteTrade}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
