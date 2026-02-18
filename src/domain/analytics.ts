import { STORAGE_KEY } from "./config";

export const ANALYTICS_KEY = `${STORAGE_KEY}.analytics.v1`;

export type AnalyticsEventType =
  | "onboarding_complete"
  | "onboarding_intent_selected"
  | "profile_selected"
  | "focus_start"
  | "focus_stop"
  | "petting"
  | "shake"
  | "music_on"
  | "music_off"
  | "update_ready"
  | "update_install";

type AnalyticsEvent = {
  type: AnalyticsEventType;
  ts: number;
};

function loadEvents(): AnalyticsEvent[] {
  const raw = localStorage.getItem(ANALYTICS_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as AnalyticsEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEvents(events: AnalyticsEvent[]): void {
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events.slice(-300)));
}

export function recordAnalyticsEvent(type: AnalyticsEventType): void {
  const events = loadEvents();
  events.push({ type, ts: Date.now() });
  saveEvents(events);
}

export function getTodayAnalyticsSummary(now: Date = new Date()): Record<AnalyticsEventType, number> {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const startMs = start.getTime();
  const endMs = startMs + 24 * 60 * 60 * 1000;
  const counters = {
    onboarding_complete: 0,
    onboarding_intent_selected: 0,
    profile_selected: 0,
    focus_start: 0,
    focus_stop: 0,
    petting: 0,
    shake: 0,
    music_on: 0,
    music_off: 0,
    update_ready: 0,
    update_install: 0,
  } satisfies Record<AnalyticsEventType, number>;

  for (const event of loadEvents()) {
    if (event.ts >= startMs && event.ts < endMs) {
      counters[event.type] += 1;
    }
  }
  return counters;
}
