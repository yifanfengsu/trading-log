import { describe, expect, it } from "vitest";

import { getSeedTrades } from "@/lib/mock-data";
import { DEFAULT_USER_SETTINGS } from "@/lib/settings-types";
import {
  computeInitialRisk,
  computePnl,
  computeRMultiple,
  computeRiskPercent,
} from "@/lib/trade-calculations";

describe("seed trades", () => {
  it("derives every trade through the production PnL and risk chain", () => {
    for (const trade of getSeedTrades("2026-01")) {
      expect(trade.quantity).toBeGreaterThan(0);
      expect(trade.stopPrice).toBeGreaterThan(0);
      expect(trade.pnlSource).toBe("computed");

      const quantity = trade.quantity!;
      const stopPrice = trade.stopPrice!;
      const initialRisk = computeInitialRisk({
        entryPrice: trade.entryPrice,
        stopPrice,
        quantity,
      });
      const pnl = computePnl({
        side: trade.side,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        quantity,
        fees: trade.fees,
      });

      expect(trade.pnl).toBeCloseTo(pnl, 8);
      expect(trade.rMultiple).toBeCloseTo(
        computeRMultiple({ pnl, initialRisk }),
        8,
      );
      expect(trade.riskPercent).toBeCloseTo(
        computeRiskPercent({
          initialRisk,
          accountBalance: DEFAULT_USER_SETTINGS.startingBalance,
        }),
        8,
      );
    }
  });

  it("places stops on the loss side of entry", () => {
    for (const trade of getSeedTrades("2026-01")) {
      if (trade.side === "long") {
        expect(trade.stopPrice).toBeLessThan(trade.entryPrice);
      } else {
        expect(trade.stopPrice).toBeGreaterThan(trade.entryPrice);
      }
    }
  });
});
