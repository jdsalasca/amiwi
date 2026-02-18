import type { Settings } from "./types";

export function getDurations(settings: Settings): { focusSec: number; breakSec: number } {
  if (settings.pomodoroPreset === "50-10") {
    return { focusSec: 50 * 60, breakSec: 10 * 60 };
  }
  if (settings.pomodoroPreset === "custom") {
    return { focusSec: settings.customFocusMin * 60, breakSec: settings.customBreakMin * 60 };
  }
  return { focusSec: 25 * 60, breakSec: 5 * 60 };
}
