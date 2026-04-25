"use client";

import { ArrowRightLeft } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { type RecentTrade } from "@/lib/mock-data";
import {
  cn,
  formatCurrency,
  formatRMultiple,
  formatRisk,
  formatTradePrice,
} from "@/lib/utils";

interface RecentTradesProps {
  rows: RecentTrade[];
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
    label: "S",
    className: "bg-cyan-50 text-cyan-600 ring-cyan-100",
  };
}

export default function RecentTrades({ rows }: RecentTradesProps) {
  const { dictionary: copy } = useLanguage();

  return (
    <section className="panel-card p-5 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="panel-title">{copy.recentTrades.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {copy.recentTrades.subtitle}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]"
        >
          {copy.recentTrades.viewAll}
          <ArrowRightLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[1080px] w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.08em] text-slate-400">
              <th className="px-3 pb-2 font-medium">
                {copy.recentTrades.columns.time}
              </th>
              <th className="px-3 pb-2 font-medium">
                {copy.recentTrades.columns.symbol}
              </th>
              <th className="px-3 pb-2 font-medium">
                {copy.recentTrades.columns.side}
              </th>
              <th className="px-3 pb-2 font-medium">
                {copy.recentTrades.columns.setup}
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
              <th className="px-3 pb-2 font-medium">
                {copy.recentTrades.columns.pnl}
              </th>
              <th className="px-3 pb-2 font-medium">
                {copy.recentTrades.columns.rMultiple}
              </th>
              <th className="px-3 pb-2 font-medium">
                {copy.recentTrades.columns.status}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const badge = getSymbolBadge(row.symbol);

              return (
                <tr key={`${row.time}-${row.symbol}`} className="text-sm text-slate-600">
                  <td className="rounded-l-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-4 font-medium text-slate-700">
                    {row.time}
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
                      {row.symbol}
                    </div>
                  </td>
                  <td className="bg-[rgba(250,250,255,0.88)] px-3 py-4">
                    <span className="inline-flex rounded-full bg-[rgba(108,77,255,0.08)] px-3 py-1 font-medium text-[var(--accent)]">
                      {copy.side[row.side]}
                    </span>
                  </td>
                  <td className="bg-[rgba(250,250,255,0.88)] px-3 py-4 font-medium text-slate-700">
                    {copy.strategies[row.setup]}
                  </td>
                  <td className="bg-[rgba(250,250,255,0.88)] px-3 py-4">
                    {formatTradePrice(row.entry)}
                  </td>
                  <td className="bg-[rgba(250,250,255,0.88)] px-3 py-4">
                    {formatTradePrice(row.exit)}
                  </td>
                  <td className="bg-[rgba(250,250,255,0.88)] px-3 py-4">
                    {formatRisk(row.risk)}
                  </td>
                  <td
                    className={cn(
                      "bg-[rgba(250,250,255,0.88)] px-3 py-4 font-semibold",
                      row.pnl >= 0 ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {formatCurrency(row.pnl)}
                  </td>
                  <td
                    className={cn(
                      "bg-[rgba(250,250,255,0.88)] px-3 py-4 font-semibold",
                      row.rMultiple >= 0 ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {formatRMultiple(row.rMultiple)}
                  </td>
                  <td className="rounded-r-[18px] bg-[rgba(250,250,255,0.88)] px-3 py-4">
                    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                      {copy.status[row.status]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
