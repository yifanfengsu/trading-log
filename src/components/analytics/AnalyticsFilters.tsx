"use client";

import { RotateCcw } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toolbar from "@/components/ui/Toolbar";
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
    <Toolbar>
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[minmax(150px,0.72fr)_repeat(4,minmax(150px,0.9fr))_auto]">
        <label className="grid gap-1.5">
          <span className="px-1 text-xs font-semibold text-slate-400">
            {copy.analyticsPage.month}
          </span>
          <Input
            type="month"
            value={filters.selectedMonth}
            onChange={(event) =>
              updateFilter("selectedMonth", event.target.value)
            }
          />
        </label>

        <label className="grid gap-1.5">
          <span className="px-1 text-xs font-semibold text-slate-400">
            {copy.recentTrades.columns.symbol}
          </span>
          <Select
            value={filters.symbol}
            onChange={(event) => updateFilter("symbol", event.target.value)}
          >
            <option value="all">{copy.analyticsPage.allSymbols}</option>
            {symbols.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </Select>
        </label>

        <label className="grid gap-1.5">
          <span className="px-1 text-xs font-semibold text-slate-400">
            {copy.recentTrades.columns.side}
          </span>
          <Select
            value={filters.side}
            onChange={(event) =>
              updateFilter("side", event.target.value as AnalyticsFiltersState["side"])
            }
          >
            {sideOptions.map((side) => (
              <option key={side} value={side}>
                {side === "all" ? copy.tradesPage.allSides : copy.side[side]}
              </option>
            ))}
          </Select>
        </label>

        <label className="grid gap-1.5">
          <span className="px-1 text-xs font-semibold text-slate-400">
            {copy.recentTrades.columns.setup}
          </span>
          <Select
            value={filters.setup}
            onChange={(event) =>
              updateFilter(
                "setup",
                event.target.value as AnalyticsFiltersState["setup"],
              )
            }
          >
            {setupOptions.map((setup) => (
              <option key={setup} value={setup}>
                {setup === "all"
                  ? copy.tradesPage.allSetups
                  : copy.strategies[setup]}
              </option>
            ))}
          </Select>
        </label>

        <label className="grid gap-1.5">
          <span className="px-1 text-xs font-semibold text-slate-400">
            {copy.tradesPage.allResults}
          </span>
          <Select
            value={filters.result}
            onChange={(event) =>
              updateFilter(
                "result",
                event.target.value as AnalyticsFiltersState["result"],
              )
            }
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
          </Select>
        </label>

        <div className="flex items-end">
          <Button
            onClick={onReset}
            variant="secondary"
            className="w-full rounded-2xl xl:w-auto"
          >
            <RotateCcw className="h-4 w-4" />
            {copy.tradesPage.resetFilters}
          </Button>
        </div>
      </div>
    </Toolbar>
  );
}
