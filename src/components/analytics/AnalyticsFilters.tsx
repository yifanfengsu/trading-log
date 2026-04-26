"use client";

import { RotateCcw } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { AnalyticsFilters as AnalyticsFiltersState } from "@/lib/trade-filters";
import type { TradeSetup, TradeSide } from "@/lib/trade-types";

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersState;
  symbols: string[];
  onFiltersChange: (filters: AnalyticsFiltersState) => void;
  onReset: () => void;
}

const sideOptions: Array<"all" | TradeSide> = ["all", "long", "short"];
const setupOptions: Array<"all" | TradeSetup> = [
  "all",
  "trendFollowing",
  "breakout",
  "scalping",
  "meanReversion",
  "other",
];
const resultOptions: AnalyticsFiltersState["result"][] = [
  "all",
  "winner",
  "loser",
];

const fieldClass =
  "h-11 w-full rounded-2xl border border-[rgba(148,163,184,0.18)] bg-white px-3 text-sm font-medium text-slate-600 outline-none transition-colors focus:border-[rgba(108,77,255,0.38)]";

export default function AnalyticsFilters({
  filters,
  symbols,
  onFiltersChange,
  onReset,
}: AnalyticsFiltersProps) {
  const { dictionary: copy } = useLanguage();

  function updateFilter<Key extends keyof AnalyticsFiltersState>(
    key: Key,
    value: AnalyticsFiltersState[Key],
  ) {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <section className="panel-card p-4 lg:p-5">
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[minmax(150px,0.72fr)_repeat(4,minmax(150px,0.9fr))_auto]">
        <label className="grid gap-1.5">
          <span className="px-1 text-xs font-semibold text-slate-400">
            {copy.analyticsPage.month}
          </span>
          <input
            type="month"
            value={filters.selectedMonth}
            onChange={(event) =>
              updateFilter("selectedMonth", event.target.value)
            }
            className={fieldClass}
          />
        </label>

        <label className="grid gap-1.5">
          <span className="px-1 text-xs font-semibold text-slate-400">
            {copy.recentTrades.columns.symbol}
          </span>
          <select
            value={filters.symbol}
            onChange={(event) => updateFilter("symbol", event.target.value)}
            className={fieldClass}
          >
            <option value="all">{copy.analyticsPage.allSymbols}</option>
            {symbols.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="px-1 text-xs font-semibold text-slate-400">
            {copy.recentTrades.columns.side}
          </span>
          <select
            value={filters.side}
            onChange={(event) =>
              updateFilter("side", event.target.value as AnalyticsFiltersState["side"])
            }
            className={fieldClass}
          >
            {sideOptions.map((side) => (
              <option key={side} value={side}>
                {side === "all" ? copy.tradesPage.allSides : copy.side[side]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="px-1 text-xs font-semibold text-slate-400">
            {copy.recentTrades.columns.setup}
          </span>
          <select
            value={filters.setup}
            onChange={(event) =>
              updateFilter(
                "setup",
                event.target.value as AnalyticsFiltersState["setup"],
              )
            }
            className={fieldClass}
          >
            {setupOptions.map((setup) => (
              <option key={setup} value={setup}>
                {setup === "all"
                  ? copy.tradesPage.allSetups
                  : copy.strategies[setup]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="px-1 text-xs font-semibold text-slate-400">
            {copy.tradesPage.allResults}
          </span>
          <select
            value={filters.result}
            onChange={(event) =>
              updateFilter(
                "result",
                event.target.value as AnalyticsFiltersState["result"],
              )
            }
            className={fieldClass}
          >
            {resultOptions.map((result) => {
              const label =
                result === "all"
                  ? copy.tradesPage.allResults
                  : result === "winner"
                    ? copy.tradesPage.winners
                    : copy.tradesPage.losers;

              return (
                <option key={result} value={result}>
                  {label}
                </option>
              );
            })}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(148,163,184,0.18)] bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 xl:w-auto"
          >
            <RotateCcw className="h-4 w-4" />
            {copy.tradesPage.resetFilters}
          </button>
        </div>
      </div>
    </section>
  );
}
