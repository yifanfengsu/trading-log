"use client";

import { ArrowRightLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/components/providers/LanguageProvider";
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
import type { Trade } from "@/lib/trade-types";
import {
  cn,
  formatCurrency,
  formatRMultiple,
  formatRisk,
  formatTradeTimestamp,
  formatTradePrice,
} from "@/lib/utils";

interface RecentTradesProps {
  rows: Trade[];
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
    label: "S",
    className:
      "bg-[rgba(34,211,238,0.12)] text-cyan-200 ring-[rgba(34,211,238,0.22)]",
  };
}

export default function RecentTrades({ rows }: RecentTradesProps) {
  const { dictionary: copy } = useLanguage();
  const { settings } = useUserSettings();
  const { deleteTrade } = useTrades();
  const { openEditTrade } = useTradeDrawer();

  function handleDelete(trade: Trade) {
    if (window.confirm(copy.tradeForm.deleteConfirm)) {
      deleteTrade(trade.id);
    }
  }

  return (
    <Card>
      <SectionHeader
        title={copy.recentTrades.title}
        description={copy.recentTrades.subtitle}
        action={
          <Link
            href="/trades"
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-200 transition-colors hover:text-cyan-200"
          >
            {copy.recentTrades.viewAll}
            <ArrowRightLeft className="h-4 w-4" />
          </Link>
        }
      />

      <DataTable minWidth={1180} className="mt-5">
          <thead>
            <tr className="table-head-row">
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
                {copy.recentTrades.columns.entry}
              </th>
              <th className={dataTableHeadCellClassName}>
                {copy.recentTrades.columns.exit}
              </th>
              <th className={dataTableHeadCellClassName}>
                {copy.recentTrades.columns.risk}
              </th>
              <th className={dataTableHeadCellClassName}>
                {copy.recentTrades.columns.pnl}
              </th>
              <th className={dataTableHeadCellClassName}>
                {copy.recentTrades.columns.rMultiple}
              </th>
              <th className={dataTableHeadCellClassName}>
                {copy.recentTrades.columns.status}
              </th>
              <th className={dataTableHeadCellClassName}>
                {copy.recentTrades.columns.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="rounded-[18px] bg-[rgba(15,23,42,0.46)] px-3 py-6"
                >
                  <EmptyState title={copy.emptyState} className="min-h-[180px]" />
                </td>
              </tr>
            ) : rows.map((row) => {
              const badge = getSymbolBadge(row.symbol);

              return (
                <tr key={row.id} className="table-row-surface">
                  <td className={cn(dataTableCellClassName, "font-medium text-slate-300")}>
                    {formatTradeTimestamp(row.closedAt)}
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
                      {row.symbol}
                    </div>
                  </td>
                  <td className={dataTableCellClassName}>
                    <Badge variant="purple">
                      {copy.side[row.side]}
                    </Badge>
                  </td>
                  <td className={cn(dataTableCellClassName, "font-medium text-slate-300")}>
                    {copy.strategies[row.setup]}
                  </td>
                  <td className={dataTableCellClassName}>
                    {formatTradePrice(row.entryPrice)}
                  </td>
                  <td className={dataTableCellClassName}>
                    {formatTradePrice(row.exitPrice)}
                  </td>
                  <td className={dataTableCellClassName}>
                    {formatRisk(row.riskPercent)}
                  </td>
                  <td
                    className={cn(
                      dataTableCellClassName,
                      "font-semibold",
                      row.pnl >= 0 ? "text-emerald-300" : "text-rose-300",
                    )}
                  >
                    {formatCurrency(row.pnl, settings.currency)}
                  </td>
                  <td
                    className={cn(
                      dataTableCellClassName,
                      "font-semibold",
                      row.rMultiple >= 0 ? "text-emerald-300" : "text-rose-300",
                    )}
                  >
                    {formatRMultiple(row.rMultiple)}
                  </td>
                  <td className={dataTableCellClassName}>
                    <Badge variant="green">
                      {copy.status[row.status]}
                    </Badge>
                  </td>
                  <td className={dataTableCellClassName}>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => openEditTrade(row)}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={copy.recentTrades.edit}
                        title={copy.recentTrades.edit}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(row)}
                        variant="danger"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={copy.recentTrades.delete}
                        title={copy.recentTrades.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
      </DataTable>
    </Card>
  );
}
