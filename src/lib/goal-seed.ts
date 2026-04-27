import type { Goal } from "@/lib/goal-types";
import {
  formatMonthLabel,
  getCurrentMonthKey,
  getDateKeyFromLocalDate,
  getMonthRangeFromMonthKey,
} from "@/lib/utils";

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

export function getSeedGoals(baseMonthKey = getCurrentMonthKey()): Goal[] {
  const monthRange = getMonthRangeFromMonthKey(baseMonthKey);
  const weekRange = getWeekRange(new Date());
  const seedTimestamp = `${monthRange.startDate}T00:00:00.000`;
  const monthLabel = formatMonthLabel(monthRange.startDate.slice(0, 7), "zh");

  return [
    {
      id: `seed-goal-net-pnl-${monthRange.startDate.slice(0, 7)}`,
      title: `${monthLabel}净盈利目标`,
      category: "performance",
      metric: "netPnl",
      direction: "atLeast",
      targetValue: 5000,
      unit: "currency",
      periodType: "monthly",
      startDate: monthRange.startDate,
      endDate: monthRange.endDate,
      status: "active",
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
    },
    {
      id: `seed-goal-review-completion-${monthRange.startDate.slice(0, 7)}`,
      title: "复盘完成率达到 90%",
      category: "process",
      metric: "reviewCompletionRate",
      direction: "atLeast",
      targetValue: 90,
      unit: "percent",
      periodType: "monthly",
      startDate: monthRange.startDate,
      endDate: monthRange.endDate,
      status: "active",
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
    },
    {
      id: `seed-goal-max-drawdown-${monthRange.startDate.slice(0, 7)}`,
      title: "最大回撤不超过 5%",
      category: "risk",
      metric: "maxDrawdownPercent",
      direction: "atMost",
      targetValue: 5,
      unit: "percent",
      periodType: "monthly",
      startDate: monthRange.startDate,
      endDate: monthRange.endDate,
      status: "active",
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
    },
    {
      id: `seed-goal-weekly-trade-limit-${weekRange.startDate}`,
      title: "每周交易不超过 20 笔",
      category: "behavior",
      metric: "totalTrades",
      direction: "atMost",
      targetValue: 20,
      unit: "trades",
      periodType: "weekly",
      startDate: weekRange.startDate,
      endDate: weekRange.endDate,
      status: "active",
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
    },
    {
      id: `seed-goal-avg-r-${monthRange.startDate.slice(0, 7)}`,
      title: "平均 R 达到 +0.80R",
      category: "performance",
      metric: "avgR",
      direction: "atLeast",
      targetValue: 0.8,
      unit: "r",
      periodType: "monthly",
      startDate: monthRange.startDate,
      endDate: monthRange.endDate,
      status: "active",
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
    },
  ];
}

export const seedGoals: Goal[] = getSeedGoals();
