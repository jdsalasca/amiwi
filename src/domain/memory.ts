import type { PetMemoryEvent, PetMemoryEventType } from "./pets/profile";

export function summarizeTodayPetMemory(events: readonly PetMemoryEvent[], now: Date = new Date()): Record<PetMemoryEventType, number> {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const startMs = start.getTime();
  const endMs = startMs + 24 * 60 * 60 * 1000;

  const counters = {
    petting: 0,
    shake: 0,
    focus_start: 0,
    focus_stop: 0,
    music_on: 0,
    music_off: 0,
  } satisfies Record<PetMemoryEventType, number>;

  for (const event of events) {
    if (event.ts >= startMs && event.ts < endMs) {
      counters[event.type] += 1;
    }
  }
  return counters;
}
