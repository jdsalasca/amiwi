import { describe, expect, it } from "vitest";
import { summarizeTodayPetMemory } from "./memory";

describe("summarizeTodayPetMemory", () => {
  it("counts only events from current day", () => {
    const today = new Date(2026, 1, 18, 12, 0, 0, 0);
    const events = [
      { type: "petting", ts: new Date(2026, 1, 18, 1, 0, 0, 0).getTime() },
      { type: "focus_start", ts: new Date(2026, 1, 18, 2, 0, 0, 0).getTime() },
      { type: "focus_stop", ts: new Date(2026, 1, 17, 22, 0, 0, 0).getTime() },
    ] as const;
    const summary = summarizeTodayPetMemory(events, today);
    expect(summary.petting).toBe(1);
    expect(summary.focus_start).toBe(1);
    expect(summary.focus_stop).toBe(0);
  });
});
