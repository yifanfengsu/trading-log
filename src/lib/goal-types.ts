import { isFiniteNumber, isRecord } from "@/lib/guards";
import {
  getCurrentMonthKey,
  getLocalDateTime,
  getMonthRangeFromMonthKey,
  isValidDateKey,
} from "@/lib/utils";

export type GoalCategory =
  | "performance"
  | "risk"
  | "process"
  | "behavior"
  | "custom";

export type GoalMetric =
  | "netPnl"
  | "winRate"
  | "profitFactor"
  | "avgR"
  | "maxDrawdownPercent"
  | "maxDailyLoss"
  | "totalTrades"
  | "reviewCompletionRate"
  | "reviewedDays"
  | "custom";

export type GoalDirection = "atLeast" | "atMost";

export type GoalPeriodType = "weekly" | "monthly" | "quarterly" | "custom";

export type GoalStatus = "active" | "paused" | "completed" | "archived";

export type GoalUnit =
  | "currency"
  | "percent"
  | "number"
  | "r"
  | "trades"
  | "days";

export type Goal = {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  metric: GoalMetric;
  direction: GoalDirection;
  targetValue: number;
  unit: GoalUnit;
  periodType: GoalPeriodType;
  startDate: string;
  endDate: string;
  status: GoalStatus;
  manualCurrentValue?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type GoalInput = Omit<Goal, "id" | "createdAt" | "updatedAt">;
export type GoalPatch = Partial<GoalInput>;

export type GoalProgress = {
  currentValue: number;
  targetValue: number;
  progressPercent: number;
  remainingValue: number;
  achieved: boolean;
  atRisk: boolean;
};

export const goalCategories = [
  "performance",
  "risk",
  "process",
  "behavior",
  "custom",
] as const satisfies readonly GoalCategory[];

export const goalMetrics = [
  "netPnl",
  "winRate",
  "profitFactor",
  "avgR",
  "maxDrawdownPercent",
  "maxDailyLoss",
  "totalTrades",
  "reviewCompletionRate",
  "reviewedDays",
  "custom",
] as const satisfies readonly GoalMetric[];

export const goalDirections = [
  "atLeast",
  "atMost",
] as const satisfies readonly GoalDirection[];

export const goalPeriodTypes = [
  "weekly",
  "monthly",
  "quarterly",
  "custom",
] as const satisfies readonly GoalPeriodType[];

export const goalStatuses = [
  "active",
  "paused",
  "completed",
  "archived",
] as const satisfies readonly GoalStatus[];

export const goalUnits = [
  "currency",
  "percent",
  "number",
  "r",
  "trades",
  "days",
] as const satisfies readonly GoalUnit[];

export function isGoalCategory(value: unknown): value is GoalCategory {
  return goalCategories.some((category) => category === value);
}

export function isGoalMetric(value: unknown): value is GoalMetric {
  return goalMetrics.some((metric) => metric === value);
}

export function isGoalDirection(value: unknown): value is GoalDirection {
  return goalDirections.some((direction) => direction === value);
}

export function isGoalPeriodType(value: unknown): value is GoalPeriodType {
  return goalPeriodTypes.some((periodType) => periodType === value);
}

export function isGoalStatus(value: unknown): value is GoalStatus {
  return goalStatuses.some((status) => status === value);
}

export function isGoalUnit(value: unknown): value is GoalUnit {
  return goalUnits.some((unit) => unit === value);
}

export function getGoalMetricDefaults(metric: GoalMetric): {
  category: GoalCategory;
  direction: GoalDirection;
  unit: GoalUnit;
} {
  if (metric === "netPnl") {
    return { category: "performance", direction: "atLeast", unit: "currency" };
  }

  if (metric === "winRate") {
    return { category: "performance", direction: "atLeast", unit: "percent" };
  }

  if (metric === "profitFactor") {
    return { category: "performance", direction: "atLeast", unit: "number" };
  }

  if (metric === "avgR") {
    return { category: "performance", direction: "atLeast", unit: "r" };
  }

  if (metric === "maxDrawdownPercent") {
    return { category: "risk", direction: "atMost", unit: "percent" };
  }

  if (metric === "maxDailyLoss") {
    return { category: "risk", direction: "atMost", unit: "currency" };
  }

  if (metric === "totalTrades") {
    return { category: "behavior", direction: "atMost", unit: "trades" };
  }

  if (metric === "reviewCompletionRate") {
    return { category: "process", direction: "atLeast", unit: "percent" };
  }

  if (metric === "reviewedDays") {
    return { category: "process", direction: "atLeast", unit: "days" };
  }

  return { category: "custom", direction: "atLeast", unit: "number" };
}

export function normalizeGoal(value: unknown, index = 0): Goal | null {
  if (!isRecord(value)) {
    return null;
  }

  const metric = isGoalMetric(value.metric) ? value.metric : "custom";
  const metricDefaults = getGoalMetricDefaults(metric);
  const fallbackRange = getMonthRangeFromMonthKey(getCurrentMonthKey());
  const fallbackCreatedAt = getLocalDateTime();
  const startDate = isValidDateKey(String(value.startDate))
    ? String(value.startDate)
    : fallbackRange.startDate;
  const rawEndDate = isValidDateKey(String(value.endDate))
    ? String(value.endDate)
    : fallbackRange.endDate;
  const endDate = rawEndDate >= startDate ? rawEndDate : startDate;
  const targetValue = isFiniteNumber(value.targetValue) ? value.targetValue : 0;
  const manualCurrentValue = isFiniteNumber(value.manualCurrentValue)
    ? value.manualCurrentValue
    : undefined;

  return {
    id:
      typeof value.id === "string" && value.id.trim().length > 0
        ? value.id
        : `goal-${index}`,
    title:
      typeof value.title === "string" && value.title.trim().length > 0
        ? value.title
        : "Untitled Goal",
    description:
      typeof value.description === "string" ? value.description : undefined,
    category: isGoalCategory(value.category)
      ? value.category
      : metricDefaults.category,
    metric,
    direction: isGoalDirection(value.direction)
      ? value.direction
      : metricDefaults.direction,
    targetValue: Math.max(targetValue, 0),
    unit: isGoalUnit(value.unit) ? value.unit : metricDefaults.unit,
    periodType: isGoalPeriodType(value.periodType)
      ? value.periodType
      : "custom",
    startDate,
    endDate,
    status: isGoalStatus(value.status) ? value.status : "active",
    manualCurrentValue,
    notes: typeof value.notes === "string" ? value.notes : undefined,
    createdAt:
      typeof value.createdAt === "string" ? value.createdAt : fallbackCreatedAt,
    updatedAt:
      typeof value.updatedAt === "string" ? value.updatedAt : fallbackCreatedAt,
  };
}

export function normalizeGoals(value: unknown): Goal[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  return value
    .map((item, index) => normalizeGoal(item, index))
    .filter((goal): goal is Goal => goal !== null);
}
