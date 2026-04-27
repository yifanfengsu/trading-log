"use client";

import { RotateCcw, Search } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toolbar from "@/components/ui/Toolbar";
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
    <Toolbar>
      <div className="grid gap-3 xl:grid-cols-[minmax(240px,1.35fr)_repeat(4,minmax(150px,1fr))_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
            placeholder={copy.goalsPage.searchPlaceholder}
            className="pl-10"
          />
        </label>

        <Select
          value={filters.category}
          onChange={(event) =>
            updateFilter("category", event.target.value as "all" | GoalCategory)
          }
        >
          <option value="all">{copy.goalsPage.allCategories}</option>
          {goalCategories.map((category) => (
            <option key={category} value={category}>
              {copy.goalCategories[category]}
            </option>
          ))}
        </Select>

        <Select
          value={filters.status}
          onChange={(event) =>
            updateFilter("status", event.target.value as "all" | GoalStatus)
          }
        >
          <option value="all">{copy.goalsPage.allStatuses}</option>
          {goalStatuses.map((status) => (
            <option key={status} value={status}>
              {copy.goalStatus[status]}
            </option>
          ))}
        </Select>

        <Select
          value={filters.metric}
          onChange={(event) =>
            updateFilter("metric", event.target.value as "all" | GoalMetric)
          }
        >
          <option value="all">{copy.goalsPage.allMetrics}</option>
          {goalMetrics.map((metric) => (
            <option key={metric} value={metric}>
              {copy.goalMetrics[metric]}
            </option>
          ))}
        </Select>

        <Select
          value={filters.periodType}
          onChange={(event) =>
            updateFilter(
              "periodType",
              event.target.value as "all" | GoalPeriodType,
            )
          }
        >
          <option value="all">{copy.goalsPage.allPeriods}</option>
          {goalPeriodTypes.map((periodType) => (
            <option key={periodType} value={periodType}>
              {copy.goalPeriodTypes[periodType]}
            </option>
          ))}
        </Select>

        <Button onClick={onReset} variant="secondary">
          <RotateCcw className="h-4 w-4" />
          {copy.goalsPage.resetFilters}
        </Button>
      </div>
    </Toolbar>
  );
}
