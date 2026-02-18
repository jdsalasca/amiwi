import { STORAGE_KEY } from "./config";
import type { PetMemoryEvent } from "./pets/profile";

export const WINDOW_POSITION_KEY = `${STORAGE_KEY}.window.positionByMonitor`;
export const ONBOARDING_KEY = `${STORAGE_KEY}.onboarding.v1`;
export const PET_BOND_KEY = `${STORAGE_KEY}.pet.bond.v1`;
export const PET_MEMORY_KEY = `${STORAGE_KEY}.pet.memory.v1`;

type MonitorDescriptor = {
  name: string | null;
  position: { x: number; y: number };
  size: { width: number; height: number };
};

export function monitorStorageKey(monitor: MonitorDescriptor): string {
  return `${monitor.name ?? "monitor"}:${monitor.position.x},${monitor.position.y}:${monitor.size.width}x${monitor.size.height}`;
}

export function loadStoredWindowPositions(): Record<string, { x: number; y: number }> {
  const raw = localStorage.getItem(WINDOW_POSITION_KEY);
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, { x: number; y: number }>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export function loadPetBond(fallback: number): number {
  const raw = localStorage.getItem(PET_BOND_KEY);
  const parsed = raw ? Number(raw) : fallback;
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function loadPetMemory(limit: number = 8): PetMemoryEvent[] {
  const raw = localStorage.getItem(PET_MEMORY_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as PetMemoryEvent[];
    return Array.isArray(parsed) ? parsed.slice(-limit) : [];
  } catch {
    return [];
  }
}
