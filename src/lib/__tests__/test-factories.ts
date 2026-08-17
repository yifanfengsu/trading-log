import type { DailyReview } from "@/lib/review-types";
import type { Goal } from "@/lib/goal-types";
import type { Trade } from "@/lib/trade-types";

export function makeTrade(overrides: Partial<Trade> = {}): Trade {
  return {
    id: "trade-1",
    closedAt: "2026-01-15T12:00:00",
    symbol: "BTCUSDT",
    side: "long",
    setup: "breakout",
    entryPrice: 100,
    exitPrice: 110,
    quantity: 10,
    stopPrice: 95,
    riskPercent: 0.5,
    pnl: 100,
    rMultiple: 2,
    pnlSource: "computed",
    status: "closed",
    ...overrides,
  };
}

export function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: "goal-1",
    title: "Test goal",
    category: "performance",
    metric: "netPnl",
    direction: "atLeast",
    targetValue: 1_000,
    unit: "currency",
    periodType: "monthly",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function makeReview(
  overrides: Partial<DailyReview> = {},
): DailyReview {
  return {
    date: "2026-01-15",
    rulesFollowed: "yes",
    mainMistake: "none",
    marketCondition: "trend",
    tomorrowFocus: "execute",
    emotion: "calm",
    score: 4,
    updatedAt: "2026-01-15T12:00:00.000Z",
    ...overrides,
  };
}
