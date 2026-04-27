"use client";

import { RotateCcw, Search } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { GoalFilters } from "@/lib/goal-calculations";
import {
  goalCategories,
  goalMetrics,
  goalPeriodTypes,
  goalStatuses,
  type GoalCategory,
  type GoalMetric,
  type GoalPeriodType,
  type GoalStatus,
} from "@/lib/goal-types";

interface GoalsToolbarProps {
  filters: GoalFilters;
  onFiltersChange: (filters: GoalFilters) => void;
  onReset: () => void;
}

const controlClass =
  "h-11 w-full rounded-2xl border border-[rgba(148,163,184,0.18)] bg-white px-3 text-sm font-medium text-slate-600 outline-none transition-colors focus:border-[rgba(108,77,255,0.38)]";

export default function GoalsToolbar({
  filters,
  onFiltersChange,
  onReset,
}: GoalsToolbarProps) {
  const { dictionary: copy } = useLanguage();

  function updateFilter<Key extends keyof GoalFilters>(
    key: Key,
    value: GoalFilters[Key],
  ) {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <section className="panel-card p-4 lg:p-5">
      <div className="grid gap-3 xl:grid-cols-[minmax(240px,1.35fr)_repeat(4,minmax(150px,1fr))_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
            placeholder={copy.goalsPage.searchPlaceholder}
            className={`${controlClass} pl-10`}
          />
        </label>

        <select
          value={filters.category}
          onChange={(event) =>
            updateFilter("category", event.target.value as "all" | GoalCategory)
          }
          className={controlClass}
        >
          <option value="all">{copy.goalsPage.allCategories}</option>
          {goalCategories.map((category) => (
            <option key={category} value={category}>
              {copy.goalCategories[category]}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(event) =>
            updateFilter("status", event.target.value as "all" | GoalStatus)
          }
          className={controlClass}
        >
          <option value="all">{copy.goalsPage.allStatuses}</option>
          {goalStatuses.map((status) => (
            <option key={status} value={status}>
              {copy.goalStatus[status]}
            </option>
          ))}
        </select>

        <select
          value={filters.metric}
          onChange={(event) =>
            updateFilter("metric", event.target.value as "all" | GoalMetric)
          }
          className={controlClass}
        >
          <option value="all">{copy.goalsPage.allMetrics}</option>
          {goalMetrics.map((metric) => (
            <option key={metric} value={metric}>
              {copy.goalMetrics[metric]}
            </option>
          ))}
        </select>

        <select
          value={filters.periodType}
          onChange={(event) =>
            updateFilter(
              "periodType",
              event.target.value as "all" | GoalPeriodType,
            )
          }
          className={controlClass}
        >
          <option value="all">{copy.goalsPage.allPeriods}</option>
          {goalPeriodTypes.map((periodType) => (
            <option key={periodType} value={periodType}>
              {copy.goalPeriodTypes[periodType]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[rgba(148,163,184,0.18)] bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
        >
          <RotateCcw className="h-4 w-4" />
          {copy.goalsPage.resetFilters}
        </button>
      </div>
    </section>
  );
}
