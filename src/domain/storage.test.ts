import { beforeEach, describe, expect, it } from "vitest";
import { PET_BOND_KEY, PET_MEMORY_KEY, WINDOW_POSITION_KEY, loadPetBond, loadPetMemory, loadStoredWindowPositions, monitorStorageKey } from "./storage";

describe("storage helpers", () => {
  beforeEach(() => {
    localStorage.removeItem(WINDOW_POSITION_KEY);
    localStorage.removeItem(PET_BOND_KEY);
    localStorage.removeItem(PET_MEMORY_KEY);
  });

  it("builds monitor storage keys", () => {
    expect(
      monitorStorageKey({
        name: "main",
        position: { x: 10, y: 20 },
        size: { width: 1920, height: 1080 },
      })
    ).toBe("main:10,20:1920x1080");
  });

  it("loads stored positions safely", () => {
    localStorage.setItem(WINDOW_POSITION_KEY, "{\"a\":{\"x\":1,\"y\":2}}");
    expect(loadStoredWindowPositions()).toEqual({ a: { x: 1, y: 2 } });

    localStorage.setItem(WINDOW_POSITION_KEY, "bad-json");
    expect(loadStoredWindowPositions()).toEqual({});
  });

  it("loads pet bond safely", () => {
    expect(loadPetBond(58)).toBe(58);
    localStorage.setItem(PET_BOND_KEY, "77");
    expect(loadPetBond(58)).toBe(77);
    localStorage.setItem(PET_BOND_KEY, "not-number");
    expect(loadPetBond(58)).toBe(58);
  });

  it("loads pet memory safely", () => {
    expect(loadPetMemory()).toEqual([]);
    localStorage.setItem(PET_MEMORY_KEY, JSON.stringify([{ type: "petting", ts: 1 }, { type: "shake", ts: 2 }]));
    expect(loadPetMemory(1)).toEqual([{ type: "shake", ts: 2 }]);
    localStorage.setItem(PET_MEMORY_KEY, "bad-json");
    expect(loadPetMemory()).toEqual([]);
  });
});
