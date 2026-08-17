import { describe, expect, it } from "vitest";

import {
  getGoalCurrentValue,
  getGoalProgress,
} from "@/lib/goal-calculations";
import { makeGoal, makeReview, makeTrade } from "@/lib/__tests__/test-factories";

describe("goal calculations", () => {
  it("clamps at-least progress while preserving remaining value", () => {
    const goal = makeGoal({ targetValue: 1_000 });
    const trades = [
      makeTrade({ id: "win", pnl: 600 }),
      makeTrade({ id: "loss", pnl: -100 }),
    ];

    expect(getGoalProgress(goal, trades, [], 100_000)).toMatchObject({
      currentValue: 500,
      progressPercent: 50,
      remainingValue: 500,
      achieved: false,
    });
  });

  it("treats at-most risk goals as achieved at or below the limit", () => {
    const goal = makeGoal({
      metric: "maxDailyLoss",
      category: "risk",
      direction: "atMost",
      targetValue: 300,
    });
    const trades = [
      makeTrade({ id: "a", pnl: -200, closedAt: "2026-01-10T09:00:00" }),
      makeTrade({ id: "b", pnl: -50, closedAt: "2026-01-10T15:00:00" }),
    ];

    expect(getGoalProgress(goal, trades, [], 100_000)).toMatchObject({
      currentValue: 250,
      progressPercent: 100,
      remainingValue: 0,
      achieved: true,
      atRisk: false,
    });
  });

  it("calculates review completion only across trading days in the goal range", () => {
    const goal = makeGoal({
      metric: "reviewCompletionRate",
      category: "process",
      unit: "percent",
      targetValue: 100,
    });
    const trades = [
      makeTrade({ id: "a", closedAt: "2026-01-10T09:00:00" }),
      makeTrade({ id: "b", closedAt: "2026-01-11T09:00:00" }),
      makeTrade({ id: "outside", closedAt: "2026-02-01T09:00:00" }),
    ];
    const reviews = [
      makeReview({ date: "2026-01-10" }),
      makeReview({ date: "2026-01-12" }),
    ];

    expect(getGoalCurrentValue(goal, trades, reviews, 100_000)).toBe(50);
  });
});
