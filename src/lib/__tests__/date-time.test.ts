import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  formatDateTime,
  getDateKey,
  getLocalDateTime,
} from "@/lib/utils";

const originalTimezone = process.env.TZ;

describe("local date-time handling", () => {
  beforeAll(() => {
    process.env.TZ = "Asia/Shanghai";
  });

  afterAll(() => {
    process.env.TZ = originalTimezone;
  });

  it("converts timezone-aware UTC values across the local date boundary", () => {
    const utcValue = "2026-01-01T16:30:00.000Z";

    expect(getDateKey(utcValue)).toBe("2026-01-02");
    expect(formatDateTime(utcValue, "zh")).toBe("2026-01-02 00:30");
  });

  it("keeps timezone-free wall-clock values unchanged", () => {
    const localValue = "2026-01-02T00:30:00.000";

    expect(getDateKey(localValue)).toBe("2026-01-02");
    expect(formatDateTime(localValue, "zh")).toBe("2026-01-02 00:30");
  });

  it("serializes a Date as a timezone-free local timestamp", () => {
    const date = new Date(2026, 0, 2, 0, 30, 45, 7);

    expect(getLocalDateTime(date)).toBe("2026-01-02T00:30:45.007");
  });
});
