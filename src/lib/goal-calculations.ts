import type { Goal, GoalCategory, GoalMetric, GoalPeriodType, GoalProgress, GoalStatus } from "@/lib/goal-types";
import type { DailyReview } from "@/lib/review-types";
import { getMaxDrawdown, getPeriodStats } from "@/lib/trade-calculations";
import type { Trade } from "@/lib/trade-types";
import { getDateKey } from "@/lib/utils";

export type GoalFilters = {
  query: string;
  category: "all" | GoalCategory;
  status: "all" | GoalStatus;
  metric: "all" | GoalMetric;
  periodType: "all" | GoalPeriodType;
};

export type GoalsSummary = {
  totalGoals: number;
  activeGoals: number;
  achievedGoals: number;
  atRiskGoals: number;
  averageProgress: number;
};

export type RiskGuardrail = {
  goal: Goal;
  progress: GoalProgress;
};

function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value, 0), 100);
}

function safeMetricValue(value: number) {
  return Number.isNaN(value) ? 0 : value;
}

function getAverageR(trades: Trade[]) {
  if (trades.length === 0) {
    return 0;
  }

  return trades.reduce((total, trade) => total + trade.rMultiple, 0) / trades.length;
}

function getDailyPnlEntries(trades: Trade[]) {
  const dailyPnl = new Map<string, number>();

  for (const trade of trades) {
    const dateKey = getDateKey(trade.closedAt);
    dailyPnl.set(dateKey, (dailyPnl.get(dateKey) ?? 0) + trade.pnl);
  }

  return Array.from(dailyPnl.entries()).sort(([dateA], [dateB]) =>
    dateA.localeCompare(dateB),
  );
}

function getReviewCompletionRate(trades: Trade[], reviews: DailyReview[]) {
  const tradingDays = new Set(trades.map((trade) => getDateKey(trade.closedAt)));

  if (tradingDays.size === 0) {
    return 0;
  }

  const reviewedTradingDays = reviews.filter((review) =>
    tradingDays.has(review.date),
  ).length;

  return (reviewedTradingDays / tradingDays.size) * 100;
}

function getDateKeyFromDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDateKeyTime(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}

function getGoalMidpointDateKey(goal: Goal) {
  const startTime = getDateKeyTime(goal.startDate);
  const endTime = getDateKeyTime(goal.endDate);
  const midpointTime = startTime + (endTime - startTime) / 2;

  return getDateKeyFromDate(new Date(midpointTime));
}

function isGoalPastMidpoint(goal: Goal) {
  return getDateKeyFromDate(new Date()) > getGoalMidpointDateKey(goal);
}

function compareStatus(a: GoalStatus, b: GoalStatus) {
  const rank: Record<GoalStatus, number> = {
    active: 0,
    paused: 1,
    completed: 2,
    archived: 3,
  };

  return rank[a] - rank[b];
}

export function filterTradesForGoal(trades: Trade[], goal: Goal) {
  return trades.filter((trade) => {
    const dateKey = getDateKey(trade.closedAt);
    return dateKey >= goal.startDate && dateKey <= goal.endDate;
  });
}

export function filterReviewsForGoal(reviews: DailyReview[], goal: Goal) {
  return reviews.filter(
    (review) => review.date >= goal.startDate && review.date <= goal.endDate,
  );
}

export function getGoalCurrentValue(
  goal: Goal,
  trades: Trade[],
  reviews: DailyReview[],
  startingBalance: number,
) {
  if (goal.metric === "custom") {
    return goal.manualCurrentValue ?? 0;
  }

  const goalTrades = filterTradesForGoal(trades, goal);
  const goalReviews = filterReviewsForGoal(reviews, goal);
  const stats = getPeriodStats(goalTrades);

  if (goal.metric === "netPnl") {
    return stats.netPnl;
  }

  if (goal.metric === "winRate") {
    return stats.winRate;
  }

  if (goal.metric === "profitFactor") {
    return stats.profitFactor;
  }

  if (goal.metric === "avgR") {
    return getAverageR(goalTrades);
  }

  if (goal.metric === "maxDrawdownPercent") {
    return startingBalance > 0
      ? getMaxDrawdown(goalTrades, startingBalance).percent
      : 0;
  }

  if (goal.metric === "maxDailyLoss") {
    const worstDailyPnl = getDailyPnlEntries(goalTrades).reduce(
      (worst, [, pnl]) => Math.min(worst, pnl),
      0,
    );

    return Math.abs(Math.min(worstDailyPnl, 0));
  }

  if (goal.metric === "totalTrades") {
    return goalTrades.length;
  }

  if (goal.metric === "reviewCompletionRate") {
    return getReviewCompletionRate(goalTrades, goalReviews);
  }

  if (goal.metric === "reviewedDays") {
    return new Set(goalReviews.map((review) => review.date)).size;
  }

  return 0;
}

export function getGoalProgress(
  goal: Goal,
  trades: Trade[],
  reviews: DailyReview[],
  startingBalance: number,
): GoalProgress {
  const currentValue = safeMetricValue(
    getGoalCurrentValue(goal, trades, reviews, startingBalance),
  );
  const targetValue = safeMetricValue(goal.targetValue);
  const progressPercent =
    goal.direction === "atLeast"
      ? targetValue === 0
        ? 100
        : (currentValue / targetValue) * 100
      : currentValue <= targetValue
        ? 100
        : targetValue === 0
          ? 0
          : (targetValue / currentValue) * 100;
  const achieved =
    goal.direction === "atLeast"
      ? currentValue >= targetValue
      : currentValue <= targetValue;
  const remainingValue =
    goal.direction === "atLeast"
      ? Math.max(targetValue - currentValue, 0)
      : Math.max(currentValue - targetValue, 0);
  const normalizedProgress = clampPercent(progressPercent);
  const atRisk =
    goal.status === "active" &&
    (goal.direction === "atMost"
      ? currentValue > targetValue
      : isGoalPastMidpoint(goal) && normalizedProgress < 50);

  return {
    currentValue,
    targetValue,
    progressPercent: normalizedProgress,
    remainingValue,
    achieved,
    atRisk,
  };
}

export function getGoalsSummary(
  goals: Goal[],
  trades: Trade[],
  reviews: DailyReview[],
  startingBalance: number,
): GoalsSummary {
  const activeGoals = goals.filter((goal) => goal.status === "active");
  const progressItems = goals.map((goal) =>
    getGoalProgress(goal, trades, reviews, startingBalance),
  );
  const activeProgressItems = activeGoals.map((goal) =>
    getGoalProgress(goal, trades, reviews, startingBalance),
  );

  return {
    totalGoals: goals.length,
    activeGoals: activeGoals.length,
    achievedGoals: progressItems.filter((progress) => progress.achieved).length,
    atRiskGoals: progressItems.filter((progress) => progress.atRisk).length,
    averageProgress:
      activeProgressItems.length > 0
        ? activeProgressItems.reduce(
            (total, progress) => total + progress.progressPercent,
            0,
          ) / activeProgressItems.length
        : 0,
  };
}

export function filterGoals(goals: Goal[], filters: GoalFilters) {
  const query = filters.query.trim().toLowerCase();

  return goals
    .filter((goal) => {
      const matchesQuery =
        query.length === 0 ||
        goal.title.toLowerCase().includes(query) ||
        (goal.description ?? "").toLowerCase().includes(query) ||
        (goal.notes ?? "").toLowerCase().includes(query);
      const matchesCategory =
        filters.category === "all" || goal.category === filters.category;
      const matchesStatus =
        filters.status === "all" || goal.status === filters.status;
      const matchesMetric =
        filters.metric === "all" || goal.metric === filters.metric;
      const matchesPeriod =
        filters.periodType === "all" || goal.periodType === filters.periodType;

      return (
        matchesQuery &&
        matchesCategory &&
        matchesStatus &&
        matchesMetric &&
        matchesPeriod
      );
    })
    .sort((a, b) => {
      const statusSort = compareStatus(a.status, b.status);

      if (statusSort !== 0) {
        return statusSort;
      }

      return b.updatedAt.localeCompare(a.updatedAt);
    });
}

export function getRiskGuardrails(
  goals: Goal[],
  trades: Trade[],
  reviews: DailyReview[],
  startingBalance: number,
): RiskGuardrail[] {
  return goals
    .filter(
      (goal) =>
        goal.status === "active" &&
        goal.direction === "atMost" &&
        (goal.metric === "maxDrawdownPercent" ||
          goal.metric === "maxDailyLoss" ||
          goal.metric === "totalTrades"),
    )
    .map((goal) => ({
      goal,
      progress: getGoalProgress(goal, trades, reviews, startingBalance),
    }))
    .sort((a, b) => {
      if (a.progress.atRisk !== b.progress.atRisk) {
        return a.progress.atRisk ? -1 : 1;
      }

      return b.progress.currentValue - a.progress.currentValue;
    });
}

export function getGoalRelatedStats(
  goal: Goal,
  trades: Trade[],
  reviews: DailyReview[],
) {
  const goalTrades = filterTradesForGoal(trades, goal);
  const goalReviews = filterReviewsForGoal(reviews, goal);
  const stats = getPeriodStats(goalTrades);

  return {
    totalTrades: goalTrades.length,
    netPnl: stats.netPnl,
    winRate: stats.winRate,
    reviewCompletionRate: getReviewCompletionRate(goalTrades, goalReviews),
  };
}
