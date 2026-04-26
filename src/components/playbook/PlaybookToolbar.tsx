"use client";

import { RotateCcw, Search } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { PlaybookFilters } from "@/lib/playbook-calculations";
import type { TradeSetup } from "@/lib/trade-types";

interface PlaybookToolbarProps {
  filters: PlaybookFilters;
  onFiltersChange: (filters: PlaybookFilters) => void;
  onReset: () => void;
}

const setupOptions: TradeSetup[] = [
  "trendFollowing",
  "breakout",
  "scalping",
  "meanReversion",
  "other",
];

const controlClass =
  "h-11 rounded-2xl border border-[rgba(148,163,184,0.18)] bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-300 focus:border-[rgba(108,77,255,0.38)]";

export default function PlaybookToolbar({
  filters,
  onFiltersChange,
  onReset,
}: PlaybookToolbarProps) {
  const { dictionary: copy } = useLanguage();

  function updateFilter<Key extends keyof PlaybookFilters>(
    key: Key,
    value: PlaybookFilters[Key],
  ) {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <section className="panel-card p-4 lg:p-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_220px_200px_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
            className={`${controlClass} w-full pl-9`}
            placeholder={copy.playbookPage.searchPlaceholder}
          />
        </label>

        <select
          value={filters.setup}
          onChange={(event) =>
            updateFilter("setup", event.target.value as PlaybookFilters["setup"])
          }
          className={`${controlClass} w-full`}
        >
          <option value="all">{copy.playbookPage.allSetups}</option>
          {setupOptions.map((setup) => (
            <option key={setup} value={setup}>
              {copy.strategies[setup]}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(event) =>
            updateFilter(
              "status",
              event.target.value as PlaybookFilters["status"],
            )
          }
          className={`${controlClass} w-full`}
        >
          <option value="all">{copy.playbookPage.allStatuses}</option>
          <option value="active">{copy.playbookStatus.active}</option>
          <option value="archived">{copy.playbookStatus.archived}</option>
        </select>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[rgba(148,163,184,0.18)] bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:border-[rgba(108,77,255,0.24)] hover:text-slate-950"
        >
          <RotateCcw className="h-4 w-4" />
          {copy.tradesPage.resetFilters}
        </button>
      </div>
    </section>
  );
}
