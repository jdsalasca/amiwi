import { beforeEach, describe, expect, it } from "vitest";
import { STORAGE_KEY, defaultSettings } from "../domain/config";
import { clamp, formatMMSS, loadSettings, saveSettings } from "./helpers";

describe("helpers", () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it("clamps values", () => {
    expect(clamp(10, 0, 5)).toBe(5);
    expect(clamp(-2, 0, 5)).toBe(0);
    expect(clamp(3, 0, 5)).toBe(3);
  });

  it("formats mm:ss", () => {
    expect(formatMMSS(0)).toBe("00:00");
    expect(formatMMSS(65)).toBe("01:05");
  });

  it("loads default settings if storage is empty", () => {
    expect(loadSettings()).toEqual(defaultSettings);
  });

  it("persists settings in versioned envelope", () => {
    saveSettings(defaultSettings);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(raw).toContain("\"version\":2");
    expect(loadSettings()).toEqual(defaultSettings);
  });

  it("loads and sanitizes persisted settings", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        phraseFrequencySec: 999,
        opacity: 0.1,
        customFocusMin: 200,
        bubbleModules: {
          focus: false,
          feed: false,
          phrase: false,
          music: false,
          move: false,
          settings: false,
        },
      })
    );
    const loaded = loadSettings();
    expect(loaded.phraseFrequencySec).toBe(300);
    expect(loaded.opacity).toBe(0.55);
    expect(loaded.customFocusMin).toBe(120);
    expect(loaded.bubbleModules).toEqual(defaultSettings.bubbleModules);
    expect(loaded.snapToEdgeEnabled).toBe(false);
  });
});
