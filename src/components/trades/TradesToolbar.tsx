"use client";

import { RotateCcw, Search } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toolbar from "@/components/ui/Toolbar";
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
    <Toolbar>
      <div className="grid gap-3 xl:grid-cols-[minmax(220px,1.2fr)_repeat(5,minmax(140px,0.75fr))_auto]">
        <label className="relative">
          <span className="sr-only">{copy.tradesPage.searchSymbol}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
            placeholder={copy.tradesPage.searchSymbol}
            className="pl-9"
          />
        </label>

        <Select
          value={filters.side}
          onChange={(event) =>
            updateFilter("side", event.target.value as TradeFilters["side"])
          }
        >
          {sideOptions.map((side) => (
            <option key={side} value={side}>
              {side === "all" ? copy.tradesPage.allSides : copy.side[side]}
            </option>
          ))}
        </Select>

        <Select
          value={filters.setup}
          onChange={(event) =>
            updateFilter("setup", event.target.value as TradeFilters["setup"])
          }
        >
          {setupOptions.map((setup) => (
            <option key={setup} value={setup}>
              {setup === "all" ? copy.tradesPage.allSetups : copy.strategies[setup]}
            </option>
          ))}
        </Select>

        <Select
          value={filters.result}
          onChange={(event) =>
            updateFilter("result", event.target.value as TradeFilters["result"])
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

        <label>
          <span className="sr-only">{copy.tradesPage.startDate}</span>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(event) => updateFilter("startDate", event.target.value)}
            aria-label={copy.tradesPage.startDate}
          />
        </label>

        <label>
          <span className="sr-only">{copy.tradesPage.endDate}</span>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(event) => updateFilter("endDate", event.target.value)}
            aria-label={copy.tradesPage.endDate}
          />
        </label>

        <Button onClick={onReset} variant="secondary" className="rounded-2xl">
          <RotateCcw className="h-4 w-4" />
          {copy.tradesPage.reset}
        </Button>
      </div>
    </Toolbar>
  );
}
