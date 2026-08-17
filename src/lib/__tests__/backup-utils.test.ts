import { describe, expect, it } from "vitest";

import { parseBackupJson } from "@/lib/backup-utils";
import { DEFAULT_USER_SETTINGS } from "@/lib/settings-types";
import { makeTrade } from "@/lib/__tests__/test-factories";

function makeBackup(data: Record<string, unknown> = {}) {
  return JSON.stringify({
    app: "trade-journal",
    version: 1,
    exportedAt: "2026-08-17T12:00:00.000Z",
    data,
  });
}

describe("backup parsing", () => {
  it("accepts a legacy minimal backup and supplies safe defaults", () => {
    const parsed = parseBackupJson(makeBackup());

    expect(parsed?.data.settings).toEqual(DEFAULT_USER_SETTINGS);
    expect(parsed?.data.trades).toEqual([]);
    expect(parsed?.data.goals).toEqual([]);
  });

  it("preserves valid trades and embedded screenshots", () => {
    const trade = makeTrade({ screenshots: ["uploads/trades/chart.png"] });
    const parsed = parseBackupJson(
      makeBackup({
        trades: [trade],
        screenshots: {
          "uploads/trades/chart.png": "data:image/png;base64,AAAA",
        },
      }),
    );

    expect(parsed?.data.trades).toEqual([trade]);
    expect(parsed?.data.screenshots).toEqual({
      "uploads/trades/chart.png": "data:image/png;base64,AAAA",
    });
  });

  it.each([
    ["malformed JSON", "{"],
    ["wrong application", JSON.stringify({ app: "other", version: 1, exportedAt: "2026-08-17T12:00:00.000Z", data: {} })],
    ["invalid trade", makeBackup({ trades: [{ id: "broken" }] })],
  ])("rejects %s", (_label, json) => {
    expect(parseBackupJson(json)).toBeNull();
  });

  it("drops a malformed optional screenshot map without rejecting other data", () => {
    const parsed = parseBackupJson(makeBackup({ screenshots: { path: 123 } }));

    expect(parsed).not.toBeNull();
    expect(parsed?.data.screenshots).toBeUndefined();
  });
});
