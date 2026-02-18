import { beforeEach, describe, expect, it, vi } from "vitest";
import { ANALYTICS_KEY, getTodayAnalyticsSummary, recordAnalyticsEvent } from "./analytics";

describe("analytics", () => {
  beforeEach(() => {
    localStorage.removeItem(ANALYTICS_KEY);
  });

  it("records events and summarizes today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-18T10:00:00.000Z"));
    recordAnalyticsEvent("focus_start");
    recordAnalyticsEvent("petting");
    recordAnalyticsEvent("focus_stop");
    const summary = getTodayAnalyticsSummary(new Date("2026-02-18T23:00:00.000Z"));
    expect(summary.focus_start).toBe(1);
    expect(summary.focus_stop).toBe(1);
    expect(summary.petting).toBe(1);
    vi.useRealTimers();
  });
});
