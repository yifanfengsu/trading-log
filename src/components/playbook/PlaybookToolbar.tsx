"use client";

import { RotateCcw, Search } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toolbar from "@/components/ui/Toolbar";
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
    <Toolbar>
      <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_220px_200px_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
            className="pl-9"
            placeholder={copy.playbookPage.searchPlaceholder}
          />
        </label>

        <Select
          value={filters.setup}
          onChange={(event) =>
            updateFilter("setup", event.target.value as PlaybookFilters["setup"])
          }
        >
          <option value="all">{copy.playbookPage.allSetups}</option>
          {setupOptions.map((setup) => (
            <option key={setup} value={setup}>
              {copy.strategies[setup]}
            </option>
          ))}
        </Select>

        <Select
          value={filters.status}
          onChange={(event) =>
            updateFilter(
              "status",
              event.target.value as PlaybookFilters["status"],
            )
          }
        >
          <option value="all">{copy.playbookPage.allStatuses}</option>
          <option value="active">{copy.playbookStatus.active}</option>
          <option value="archived">{copy.playbookStatus.archived}</option>
        </Select>

        <Button onClick={onReset} variant="secondary" className="rounded-2xl">
          <RotateCcw className="h-4 w-4" />
          {copy.tradesPage.resetFilters}
        </Button>
      </div>
    </Toolbar>
  );
}
