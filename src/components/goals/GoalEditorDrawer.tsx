"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

import { useGoals } from "@/components/providers/GoalStoreProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Button from "@/components/ui/Button";
import DrawerShell from "@/components/ui/DrawerShell";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
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
import {
  getCurrentMonthKey,
  getDateKeyFromLocalDate,
  getMonthRangeFromMonthKey,
} from "@/lib/utils";

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
    startDate: getDateKeyFromLocalDate(startDate),
    endDate: getDateKeyFromLocalDate(endDate),
  };
}

function getQuarterRange(date: Date) {
  const quarterStartMonth = Math.floor(date.getMonth() / 3) * 3;
  const startDate = new Date(date.getFullYear(), quarterStartMonth, 1);
  const endDate = new Date(date.getFullYear(), quarterStartMonth + 3, 0);

  return {
    startDate: getDateKeyFromLocalDate(startDate),
    endDate: getDateKeyFromLocalDate(endDate),
  };
}

function getMonthlyRange() {
  return getMonthRangeFromMonthKey(getCurrentMonthKey());
}

function getPeriodRange(periodType: GoalPeriodType) {
  if (periodType === "weekly") {
    return getWeekRange(new Date());
  }

  if (periodType === "monthly") {
    return getMonthlyRange();
  }

  if (periodType === "quarterly") {
    return getQuarterRange(new Date());
  }

  return null;
}

function getInitialFormState(goal: Goal | undefined): GoalFormState {
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
  const monthlyRange = getMonthlyRange();

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
  const { addGoal, updateGoal } = useGoals();
  const [form, setForm] = useState<GoalFormState>(() =>
    getInitialFormState(mode === "edit" ? goal : undefined),
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
    const range = getPeriodRange(periodType);
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
    <DrawerShell
      title={title}
      eyebrow={copy.menu.goals}
      closeLabel={copy.tradeForm.cancel}
      labelledById="goal-editor-title"
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" onClick={onClose} variant="secondary">
            {copy.tradeForm.cancel}
          </Button>
          <Button type="submit" form="goal-editor-form">
            {saveLabel}
          </Button>
        </div>
      }
    >
        <form
          id="goal-editor-form"
          onSubmit={handleSubmit}
          className="grid gap-4"
        >
            <label className="block text-sm font-medium text-slate-600">
              {copy.goalsPage.goalTitle}
              <Input
                type="text"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className="mt-2"
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-600">
                {copy.goalsPage.category}
                <Select
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value as GoalCategory)
                  }
                  className="mt-2"
                >
                  {goalCategories.map((category) => (
                    <option key={category} value={category}>
                      {copy.goalCategories[category]}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.goalsPage.metric}
                <Select
                  value={form.metric}
                  onChange={(event) =>
                    handleMetricChange(event.target.value as GoalMetric)
                  }
                  className="mt-2"
                >
                  {goalMetrics.map((metric) => (
                    <option key={metric} value={metric}>
                      {copy.goalMetrics[metric]}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-600">
                {copy.goalsPage.direction}
                <Select
                  value={form.direction}
                  onChange={(event) =>
                    updateField("direction", event.target.value as GoalDirection)
                  }
                  className="mt-2"
                >
                  {goalDirections.map((direction) => (
                    <option key={direction} value={direction}>
                      {copy.goalDirections[direction]}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.goalsPage.unit}
                <Select
                  value={form.unit}
                  onChange={(event) =>
                    updateField("unit", event.target.value as GoalUnit)
                  }
                  className="mt-2"
                >
                  {goalUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {copy.goalUnits[unit]}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-600">
              {copy.goalsPage.targetValue}
              <Input
                type="number"
                min="0"
                step="any"
                value={form.targetValue}
                onChange={(event) =>
                  updateField("targetValue", event.target.value)
                }
                className="mt-2"
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm font-medium text-slate-600">
                {copy.goalsPage.periodType}
                <Select
                  value={form.periodType}
                  onChange={(event) =>
                    handlePeriodTypeChange(event.target.value as GoalPeriodType)
                  }
                  className="mt-2"
                >
                  {goalPeriodTypes.map((periodType) => (
                    <option key={periodType} value={periodType}>
                      {copy.goalPeriodTypes[periodType]}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.goalsPage.startDate}
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    updateField("startDate", event.target.value)
                  }
                  className="mt-2"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.goalsPage.endDate}
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(event) =>
                    updateField("endDate", event.target.value)
                  }
                  className="mt-2"
                  required
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-600">
              {copy.goalsPage.status}
              <Select
                value={form.status}
                onChange={(event) =>
                  updateField("status", event.target.value as GoalStatus)
                }
                className="mt-2"
              >
                {goalStatuses.map((status) => (
                  <option key={status} value={status}>
                    {copy.goalStatus[status]}
                  </option>
                ))}
              </Select>
            </label>

            {form.metric === "custom" ? (
              <label className="block text-sm font-medium text-slate-600">
                {copy.goalsPage.manualCurrentValue}
                <Input
                  type="number"
                  step="any"
                  value={form.manualCurrentValue}
                  onChange={(event) =>
                    updateField("manualCurrentValue", event.target.value)
                  }
                  className="mt-2"
                />
              </label>
            ) : null}

            <label className="block text-sm font-medium text-slate-600">
              {copy.goalsPage.description}
              <Textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className="mt-2 h-24 resize-none"
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.goalsPage.notes}
              <Textarea
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                className="mt-2 h-24 resize-none"
              />
            </label>

          {error ? (
            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </p>
          ) : null}
        </form>
    </DrawerShell>
  );
}
