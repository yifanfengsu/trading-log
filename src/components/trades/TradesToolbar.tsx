"use client";

import { RotateCcw, Search } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { TradeFilters } from "@/lib/trade-filters";
import type { TradeSetup, TradeSide } from "@/lib/trade-types";

interface TradesToolbarProps {
  filters: TradeFilters;
  onFiltersChange: (filters: TradeFilters) => void;
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
const resultOptions: TradeFilters["result"][] = ["all", "winner", "loser"];

const fieldClass =
  "h-11 rounded-2xl border border-[rgba(148,163,184,0.18)] bg-white px-3 text-sm font-medium text-slate-600 outline-none transition-colors placeholder:text-slate-300 focus:border-[rgba(108,77,255,0.38)]";

export default function TradesToolbar({
  filters,
  onFiltersChange,
  onReset,
}: TradesToolbarProps) {
  const { dictionary: copy } = useLanguage();

  function updateFilter<Key extends keyof TradeFilters>(
    key: Key,
    value: TradeFilters[Key],
  ) {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <section className="panel-card p-4 lg:p-5">
      <div className="grid gap-3 xl:grid-cols-[minmax(220px,1.2fr)_repeat(5,minmax(140px,0.75fr))_auto]">
        <label className="relative">
          <span className="sr-only">{copy.tradesPage.searchSymbol}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
            placeholder={copy.tradesPage.searchSymbol}
            className={`${fieldClass} w-full pl-9`}
          />
        </label>

        <select
          value={filters.side}
          onChange={(event) =>
            updateFilter("side", event.target.value as TradeFilters["side"])
          }
          className={fieldClass}
        >
          {sideOptions.map((side) => (
            <option key={side} value={side}>
              {side === "all" ? copy.tradesPage.allSides : copy.side[side]}
            </option>
          ))}
        </select>

        <select
          value={filters.setup}
          onChange={(event) =>
            updateFilter("setup", event.target.value as TradeFilters["setup"])
          }
          className={fieldClass}
        >
          {setupOptions.map((setup) => (
            <option key={setup} value={setup}>
              {setup === "all" ? copy.tradesPage.allSetups : copy.strategies[setup]}
            </option>
          ))}
        </select>

        <select
          value={filters.result}
          onChange={(event) =>
            updateFilter("result", event.target.value as TradeFilters["result"])
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

        <label>
          <span className="sr-only">{copy.tradesPage.startDate}</span>
          <input
            type="date"
            value={filters.startDate}
            onChange={(event) => updateFilter("startDate", event.target.value)}
            className={`${fieldClass} w-full`}
            aria-label={copy.tradesPage.startDate}
          />
        </label>

        <label>
          <span className="sr-only">{copy.tradesPage.endDate}</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(event) => updateFilter("endDate", event.target.value)}
            className={`${fieldClass} w-full`}
            aria-label={copy.tradesPage.endDate}
          />
        </label>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[rgba(148,163,184,0.18)] bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
        >
          <RotateCcw className="h-4 w-4" />
          {copy.tradesPage.reset}
        </button>
      </div>
    </section>
  );
}
