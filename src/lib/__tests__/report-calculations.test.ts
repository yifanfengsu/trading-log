import { describe, expect, it } from "vitest";

import {
  getMonthRangeFromMonthKey,
  getWeekKeyFromDateKey,
  getWeekRangeFromWeekKey,
} from "@/lib/report-calculations";

describe("report date ranges", () => {
  it.each([
    ["2020-12-31", "2020-W53"],
    ["2021-01-01", "2020-W53"],
    ["2021-01-04", "2021-W01"],
    ["2026-12-31", "2026-W53"],
  ])("maps %s to ISO week %s", (dateKey, weekKey) => {
    expect(getWeekKeyFromDateKey(dateKey)).toBe(weekKey);
  });

  it("resolves an ISO week that crosses a calendar-year boundary", () => {
    expect(getWeekRangeFromWeekKey("2020-W53")).toEqual({
      startDate: "2020-12-28",
      endDate: "2021-01-03",
    });
  });

  it.each([
    ["2024-02", "2024-02-01", "2024-02-29"],
    ["2025-02", "2025-02-01", "2025-02-28"],
    ["2026-12", "2026-12-01", "2026-12-31"],
  ])("returns month-end boundaries for %s", (monthKey, startDate, endDate) => {
    expect(getMonthRangeFromMonthKey(monthKey)).toEqual({ startDate, endDate });
  });
});
