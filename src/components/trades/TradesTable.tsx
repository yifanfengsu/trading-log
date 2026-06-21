"use client";

import { ArrowDown, ArrowUp, Eye, NotebookPen, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { usePlaybooks } from "@/components/providers/PlaybookStoreProvider";
import { useTradeDrawer } from "@/components/providers/TradeDrawerProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable, {
  dataTableCellClassName,
  dataTableHeadCellClassName,
} from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import SectionHeader from "@/components/ui/SectionHeader";
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
      className="inline-flex items-center gap-1 font-medium text-slate-400 transition-colors hover:text-slate-100"
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
      className:
        "bg-[rgba(245,158,11,0.12)] text-amber-300 ring-[rgba(245,158,11,0.22)]",
    };
  }

  if (asset === "ETH") {
    return {
      label: "E",
      className:
        "bg-[rgba(99,102,241,0.14)] text-indigo-200 ring-[rgba(99,102,241,0.24)]",
    };
  }

  return {
    label: asset.slice(0, 1) || "T",
    className:
      "bg-[rgba(34,211,238,0.12)] text-cyan-200 ring-[rgba(34,211,238,0.22)]",
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
    <Card>
      <SectionHeader
        title={copy.tradesPage.filteredResults}
        description={`${trades.length} ${copy.tradesPage.tradeCountLabel}`}
      />

      <DataTable minWidth={1380} className="mt-5">
          <thead>
            <tr className="table-head-row">
              <th className={dataTableHeadCellClassName}>
                <SortableHeader
                  label={copy.recentTrades.columns.time}
                  sortKey="closedAt"
                  sortState={sortState}
                  onSort={onSort}
                />
              </th>
              <th className={dataTableHeadCellClassName}>
                <SortableHeader
                  label={copy.recentTrades.columns.symbol}
                  sortKey="symbol"
                  sortState={sortState}
                  onSort={onSort}
                />
              </th>
              <th className={dataTableHeadCellClassName}>
                {copy.recentTrades.columns.side}
              </th>
              <th className={dataTableHeadCellClassName}>
                {copy.recentTrades.columns.setup}
              </th>
              <th className={dataTableHeadCellClassName}>
                {copy.playbookPage.playbook}
              </th>
              <th className={dataTableHeadCellClassName}>
                {copy.recentTrades.columns.entry}
              </th>
              <th className={dataTableHeadCellClassName}>
                {copy.recentTrades.columns.exit}
              </th>
              <th className={dataTableHeadCellClassName}>
                {copy.recentTrades.columns.risk}
              </th>
              <th className={dataTableHeadCellClassName}>
                <SortableHeader
                  label={copy.recentTrades.columns.pnl}
                  sortKey="pnl"
                  sortState={sortState}
                  onSort={onSort}
                />
              </th>
              <th className={dataTableHeadCellClassName}>
                <SortableHeader
                  label={copy.recentTrades.columns.rMultiple}
                  sortKey="rMultiple"
                  sortState={sortState}
                  onSort={onSort}
                />
              </th>
              <th className={dataTableHeadCellClassName}>
                {copy.tradesPage.notes}
              </th>
              <th className={dataTableHeadCellClassName}>
                {copy.recentTrades.columns.status}
              </th>
              <th className={dataTableHeadCellClassName}>
                {copy.tradesPage.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 ? (
              <tr>
                <td
                  colSpan={13}
                  className="rounded-[18px] bg-[rgba(15,23,42,0.46)] px-3 py-6 text-center"
                >
                  <EmptyState
                    title={
                      hasAnyTrades
                        ? copy.tradesPage.noFilterResults
                        : copy.emptyState
                    }
                    className="min-h-[220px]"
                    action={
                      <Button
                    onClick={hasAnyTrades ? onResetFilters : openCreateTrade}
                  >
                    {hasAnyTrades ? copy.tradesPage.resetFilters : copy.addTrade}
                      </Button>
                    }
                  />
                </td>
              </tr>
            ) : (
              trades.map((trade) => {
                const badge = getSymbolBadge(trade.symbol);

                return (
                  <tr key={trade.id} className="group table-row-surface">
                    <td className={cn(dataTableCellClassName, "font-medium text-slate-300")}>
                      {formatTradeTimestamp(trade.closedAt)}
                    </td>
                    <td className={dataTableCellClassName}>
                      <div className="flex items-center gap-3 font-semibold text-slate-100">
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
                    <td className={dataTableCellClassName}>
                      <Badge variant="purple">
                        {copy.side[trade.side]}
                      </Badge>
                    </td>
                    <td className={cn(dataTableCellClassName, "font-medium text-slate-300")}>
                      {copy.strategies[trade.setup]}
                    </td>
                    <td className={cn(dataTableCellClassName, "font-medium text-slate-300")}>
                      <span className="line-clamp-1">
                        {trade.playbookId
                          ? (getPlaybookById(trade.playbookId)?.name ??
                            copy.playbookPage.deletedPlaybook)
                          : "—"}
                      </span>
                    </td>
                    <td className={dataTableCellClassName}>
                      {formatTradePrice(trade.entryPrice)}
                    </td>
                    <td className={dataTableCellClassName}>
                      {formatTradePrice(trade.exitPrice)}
                    </td>
                    <td className={dataTableCellClassName}>
                      {formatRisk(trade.riskPercent)}
                    </td>
                    <td
                      className={cn(
                        dataTableCellClassName,
                        "font-semibold",
                        trade.pnl >= 0 ? "text-emerald-300" : "text-rose-300",
                      )}
                    >
                      {formatCurrency(trade.pnl, settings.currency)}
                    </td>
                    <td
                      className={cn(
                        dataTableCellClassName,
                        "font-semibold",
                        trade.rMultiple >= 0
                          ? "text-emerald-300"
                          : "text-rose-300",
                      )}
                    >
                      {formatRMultiple(trade.rMultiple)}
                    </td>
                    <td className={cn(dataTableCellClassName, "max-w-[180px]")}>
                      <span className="line-clamp-1">
                        {trade.notes || copy.tradesPage.noNotes}
                      </span>
                    </td>
                    <td className={dataTableCellClassName}>
                      <Badge variant="green">
                        {copy.status[trade.status]}
                      </Badge>
                    </td>
                    <td className={dataTableCellClassName}>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => onView(trade)}
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={copy.tradesPage.viewDetails}
                          title={copy.tradesPage.viewDetails}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => openEditTrade(trade)}
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={copy.tradesPage.editTrade}
                          title={copy.tradesPage.editTrade}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleAddNote(trade)}
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={copy.notesPage.addNote}
                          title={copy.notesPage.addNote}
                        >
                          <NotebookPen className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(trade)}
                          variant="danger"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={copy.tradesPage.deleteTrade}
                          title={copy.tradesPage.deleteTrade}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
      </DataTable>
    </Card>
  );
}
