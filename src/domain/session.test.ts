import { describe, expect, it } from "vitest";
import { defaultSettings } from "./config";
import { getDurations } from "./session";

describe("getDurations", () => {
  it("returns default 25-5 durations", () => {
    const durations = getDurations({ ...defaultSettings, pomodoroPreset: "25-5" });
    expect(durations).toEqual({ focusSec: 1500, breakSec: 300 });
  });

  it("returns 50-10 durations", () => {
    const durations = getDurations({ ...defaultSettings, pomodoroPreset: "50-10" });
    expect(durations).toEqual({ focusSec: 3000, breakSec: 600 });
  });

  it("returns custom durations", () => {
    const durations = getDurations({
      ...defaultSettings,
      pomodoroPreset: "custom",
      customFocusMin: 42,
      customBreakMin: 9,
    });
    expect(durations).toEqual({ focusSec: 2520, breakSec: 540 });
  });
});
