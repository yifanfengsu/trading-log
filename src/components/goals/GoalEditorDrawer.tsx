"use client";

import { X } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { useGoals } from "@/components/providers/GoalStoreProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSelectedMonth } from "@/components/providers/SelectedMonthProvider";
import {
  goalCategories,
  goalDirections,
  goalMetrics,
  goalPeriodTypes,
  goalStatuses,
  goalUnits,
  getGoalMetricDefaults,
  type Goal,
  type GoalCategory,
  type GoalDirection,
  type GoalInput,
  type GoalMetric,
  type GoalPeriodType,
  type GoalStatus,
  type GoalUnit,
} from "@/lib/goal-types";
import { getMonthEndDateKey } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface GoalEditorDrawerProps {
  mode: "create" | "edit";
  goal?: Goal;
  onClose: () => void;
}

interface GoalFormState {
  title: string;
  category: GoalCategory;
  metric: GoalMetric;
  direction: GoalDirection;
  targetValue: string;
  unit: GoalUnit;
  periodType: GoalPeriodType;
  startDate: string;
  endDate: string;
  status: GoalStatus;
  manualCurrentValue: string;
  description: string;
  notes: string;
}

const inputClass =
  "mt-2 h-11 w-full rounded-2xl border border-[rgba(148,163,184,0.18)] bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-[rgba(108,77,255,0.38)]";

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function getWeekRange(date: Date) {
  const dayOfWeek = date.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const startDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + mondayOffset,
  );
  const endDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate() + 6,
  );

  return {
    startDate: toDateKey(startDate),
    endDate: toDateKey(endDate),
  };
}

function getQuarterRange(date: Date) {
  const quarterStartMonth = Math.floor(date.getMonth() / 3) * 3;
  const startDate = new Date(date.getFullYear(), quarterStartMonth, 1);
  const endDate = new Date(date.getFullYear(), quarterStartMonth + 3, 0);

  return {
    startDate: toDateKey(startDate),
    endDate: toDateKey(endDate),
  };
}

function getMonthlyRange(selectedMonth: string) {
  return {
    startDate: `${selectedMonth}-01`,
    endDate: getMonthEndDateKey(selectedMonth),
  };
}

function getPeriodRange(periodType: GoalPeriodType, selectedMonth: string) {
  if (periodType === "weekly") {
    return getWeekRange(new Date());
  }

  if (periodType === "monthly") {
    return getMonthlyRange(selectedMonth);
  }

  if (periodType === "quarterly") {
    return getQuarterRange(new Date());
  }

  return null;
}

function getInitialFormState(goal: Goal | undefined, selectedMonth: string): GoalFormState {
  if (goal) {
    return {
      title: goal.title,
      category: goal.category,
      metric: goal.metric,
      direction: goal.direction,
      targetValue: String(goal.targetValue),
      unit: goal.unit,
      periodType: goal.periodType,
      startDate: goal.startDate,
      endDate: goal.endDate,
      status: goal.status,
      manualCurrentValue:
        goal.manualCurrentValue === undefined
          ? ""
          : String(goal.manualCurrentValue),
      description: goal.description ?? "",
      notes: goal.notes ?? "",
    };
  }

  const metricDefaults = getGoalMetricDefaults("netPnl");
  const monthlyRange = getMonthlyRange(selectedMonth);

  return {
    title: "",
    category: metricDefaults.category,
    metric: "netPnl",
    direction: metricDefaults.direction,
    targetValue: "",
    unit: metricDefaults.unit,
    periodType: "monthly",
    startDate: monthlyRange.startDate,
    endDate: monthlyRange.endDate,
    status: "active",
    manualCurrentValue: "",
    description: "",
    notes: "",
  };
}

function parseNumberInput(value: string) {
  if (value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function GoalEditorDrawer({
  mode,
  goal,
  onClose,
}: GoalEditorDrawerProps) {
  const { dictionary: copy } = useLanguage();
  const { selectedMonth } = useSelectedMonth();
  const { addGoal, updateGoal } = useGoals();
  const [form, setForm] = useState<GoalFormState>(() =>
    getInitialFormState(mode === "edit" ? goal : undefined, selectedMonth),
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const title =
    mode === "create" ? copy.goalsPage.newGoal : copy.goalsPage.editGoal;
  const saveLabel =
    saved
      ? copy.goalsPage.saved
      : mode === "create"
        ? copy.goalsPage.saveGoal
        : copy.goalsPage.saveChanges;

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

  function updateField<Key extends keyof GoalFormState>(
    key: Key,
    value: GoalFormState[Key],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  }

  function handleMetricChange(metric: GoalMetric) {
    const defaults = getGoalMetricDefaults(metric);
    setForm((currentForm) => ({
      ...currentForm,
      metric,
      category: defaults.category,
      direction: defaults.direction,
      unit: defaults.unit,
      manualCurrentValue:
        metric === "custom" ? currentForm.manualCurrentValue : "",
    }));
  }

  function handlePeriodTypeChange(periodType: GoalPeriodType) {
    const range = getPeriodRange(periodType, selectedMonth);
    setForm((currentForm) => ({
      ...currentForm,
      periodType,
      ...(range ? range : {}),
    }));
  }

  function buildInput(targetValue: number, manualCurrentValue: number): GoalInput {
    return {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      metric: form.metric,
      direction: form.direction,
      targetValue,
      unit: form.unit,
      periodType: form.periodType,
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
      manualCurrentValue:
        form.metric === "custom" ? manualCurrentValue : undefined,
      notes: form.notes.trim() || undefined,
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.title.trim().length === 0) {
      setError(copy.goalsPage.titleRequired);
      return;
    }

    const targetValue = parseNumberInput(form.targetValue);

    if (targetValue === null || targetValue < 0) {
      setError(copy.goalsPage.invalidTargetValue);
      return;
    }

    if (!form.startDate) {
      setError(copy.goalsPage.startDateRequired);
      return;
    }

    if (!form.endDate) {
      setError(copy.goalsPage.endDateRequired);
      return;
    }

    if (form.endDate < form.startDate) {
      setError(copy.goalsPage.endDateBeforeStart);
      return;
    }

    const manualCurrentValue =
      form.metric === "custom"
        ? parseNumberInput(form.manualCurrentValue) ?? 0
        : 0;

    if (
      form.metric === "custom" &&
      form.manualCurrentValue.trim().length > 0 &&
      parseNumberInput(form.manualCurrentValue) === null
    ) {
      setError(copy.goalsPage.invalidTargetValue);
      return;
    }

    const input = buildInput(targetValue, manualCurrentValue);

    if (mode === "edit" && goal) {
      updateGoal(goal.id, input);
    } else {
      addGoal(input);
    }

    setError(null);
    setSaved(true);
    closeTimerRef.current = window.setTimeout(onClose, 250);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/24 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={copy.tradeForm.cancel}
      />
      <aside className="relative flex h-full w-full max-w-[620px] flex-col overflow-hidden border-l border-white/70 bg-[rgba(255,255,255,0.96)] shadow-[0_24px_80px_rgba(31,15,86,0.18)]">
        <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.14)] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              {copy.menu.goals}
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(15,23,42,0.04)] text-slate-500 transition-colors hover:bg-[rgba(15,23,42,0.08)] hover:text-slate-900"
            aria-label={copy.tradeForm.cancel}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5"
        >
          <div className="grid gap-4">
            <label className="block text-sm font-medium text-slate-600">
              {copy.goalsPage.goalTitle}
              <input
                type="text"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className={inputClass}
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-600">
                {copy.goalsPage.category}
                <select
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value as GoalCategory)
                  }
                  className={inputClass}
                >
                  {goalCategories.map((category) => (
                    <option key={category} value={category}>
                      {copy.goalCategories[category]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.goalsPage.metric}
                <select
                  value={form.metric}
                  onChange={(event) =>
                    handleMetricChange(event.target.value as GoalMetric)
                  }
                  className={inputClass}
                >
                  {goalMetrics.map((metric) => (
                    <option key={metric} value={metric}>
                      {copy.goalMetrics[metric]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-600">
                {copy.goalsPage.direction}
                <select
                  value={form.direction}
                  onChange={(event) =>
                    updateField("direction", event.target.value as GoalDirection)
                  }
                  className={inputClass}
                >
                  {goalDirections.map((direction) => (
                    <option key={direction} value={direction}>
                      {copy.goalDirections[direction]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.goalsPage.unit}
                <select
                  value={form.unit}
                  onChange={(event) =>
                    updateField("unit", event.target.value as GoalUnit)
                  }
                  className={inputClass}
                >
                  {goalUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {copy.goalUnits[unit]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-600">
              {copy.goalsPage.targetValue}
              <input
                type="number"
                min="0"
                step="any"
                value={form.targetValue}
                onChange={(event) =>
                  updateField("targetValue", event.target.value)
                }
                className={inputClass}
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm font-medium text-slate-600">
                {copy.goalsPage.periodType}
                <select
                  value={form.periodType}
                  onChange={(event) =>
                    handlePeriodTypeChange(event.target.value as GoalPeriodType)
                  }
                  className={inputClass}
                >
                  {goalPeriodTypes.map((periodType) => (
                    <option key={periodType} value={periodType}>
                      {copy.goalPeriodTypes[periodType]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.goalsPage.startDate}
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    updateField("startDate", event.target.value)
                  }
                  className={inputClass}
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.goalsPage.endDate}
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(event) =>
                    updateField("endDate", event.target.value)
                  }
                  className={inputClass}
                  required
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-600">
              {copy.goalsPage.status}
              <select
                value={form.status}
                onChange={(event) =>
                  updateField("status", event.target.value as GoalStatus)
                }
                className={inputClass}
              >
                {goalStatuses.map((status) => (
                  <option key={status} value={status}>
                    {copy.goalStatus[status]}
                  </option>
                ))}
              </select>
            </label>

            {form.metric === "custom" ? (
              <label className="block text-sm font-medium text-slate-600">
                {copy.goalsPage.manualCurrentValue}
                <input
                  type="number"
                  step="any"
                  value={form.manualCurrentValue}
                  onChange={(event) =>
                    updateField("manualCurrentValue", event.target.value)
                  }
                  className={inputClass}
                />
              </label>
            ) : null}

            <label className="block text-sm font-medium text-slate-600">
              {copy.goalsPage.description}
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className={cn(inputClass, "h-24 resize-none py-3")}
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.goalsPage.notes}
              <textarea
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                className={cn(inputClass, "h-24 resize-none py-3")}
              />
            </label>
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </p>
          ) : null}

          <div className="sticky bottom-0 -mx-6 mt-6 flex items-center justify-end gap-3 border-t border-[rgba(148,163,184,0.14)] bg-white/92 px-6 py-4 backdrop-blur">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[rgba(148,163,184,0.18)] bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              {copy.tradeForm.cancel}
            </button>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.22)] transition-colors hover:bg-[var(--accent-strong)]"
            >
              {saveLabel}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
