import { describe, expect, it } from "vitest";

import {
  computeInitialRisk,
  computePnl,
  computeRMultiple,
  computeRiskPercent,
  getMaxDrawdown,
} from "@/lib/trade-calculations";
import { makeTrade } from "@/lib/__tests__/test-factories";

describe("trade calculations", () => {
  it("computes long and short PnL after fees", () => {
    expect(
      computePnl({
        side: "long",
        entryPrice: 100,
        exitPrice: 112,
        quantity: 5,
        fees: 10,
      }),
    ).toBe(50);
    expect(
      computePnl({
        side: "short",
        entryPrice: 100,
        exitPrice: 92,
        quantity: 5,
        fees: 5,
      }),
    ).toBe(35);
  });

  it("derives initial risk, R multiple, and fixed-balance risk percent", () => {
    const initialRisk = computeInitialRisk({
      entryPrice: 100,
      stopPrice: 96,
      quantity: 25,
    });

    expect(initialRisk).toBe(100);
    expect(computeRMultiple({ pnl: 250, initialRisk })).toBe(2.5);
    expect(computeRiskPercent({ initialRisk, accountBalance: 10_000 })).toBe(1);
    expect(computeRMultiple({ pnl: 250, initialRisk: 0 })).toBe(0);
  });

  it("finds the deepest peak-to-trough drawdown in chronological order", () => {
    const trades = [
      makeTrade({ id: "4", closedAt: "2026-01-04T12:00:00", pnl: 200 }),
      makeTrade({ id: "1", closedAt: "2026-01-01T12:00:00", pnl: 1_000 }),
      makeTrade({ id: "3", closedAt: "2026-01-03T12:00:00", pnl: -600 }),
      makeTrade({ id: "2", closedAt: "2026-01-02T12:00:00", pnl: -300 }),
    ];

    expect(getMaxDrawdown(trades, 10_000)).toEqual({
      amount: 900,
      percent: 9,
    });
  });
});
