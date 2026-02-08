import { defaultSettings, STORAGE_KEY } from "../domain/config";
import type { Settings } from "../domain/types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function randomPick<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

export function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function resolveAsset(path: string): string {
  const clean = path.replace(/^\//, "");
  return `${import.meta.env.BASE_URL}${clean}`;
}

export function loadSettings(): Settings {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;
    const mergedBubbleModules = {
      ...defaultSettings.bubbleModules,
      ...parsed.bubbleModules,
    };
    const hasAnyBubble = Object.values(mergedBubbleModules).some(Boolean);
    return {
      ...defaultSettings,
      ...parsed,
      // Keep free movement stable across upgrades; avoid restoring stale "anchoring" behavior.
      snapToEdgeEnabled: false,
      clickThroughPermanent: false,
      bubbleModules: hasAnyBubble ? mergedBubbleModules : defaultSettings.bubbleModules,
      phraseFrequencySec: clamp(parsed.phraseFrequencySec ?? 85, 20, 300),
      opacity: clamp(parsed.opacity ?? 1, 0.55, 1),
      size: clamp(parsed.size ?? 1, 0.8, 1.4),
      mascotScale: clamp(parsed.mascotScale ?? 1, 0.7, 1.45),
      customFocusMin: clamp(parsed.customFocusMin ?? 30, 5, 120),
      customBreakMin: clamp(parsed.customBreakMin ?? 5, 1, 30),
      autoHideSeconds: clamp(parsed.autoHideSeconds ?? 6, 3, 30),
      snapMarginPx: clamp(parsed.snapMarginPx ?? 12, 4, 40),
      cuteBubblesEnabled: parsed.cuteBubblesEnabled ?? true,
    };
  } catch {
    return defaultSettings;
  }
}
