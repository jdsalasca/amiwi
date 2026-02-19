import { describe, expect, it } from "vitest";
import { resolvePetProfile } from "./profile";

describe("pet profile resolver", () => {
  it("returns anime 90s theme when selected", () => {
    const profile = resolvePetProfile("anime90s");
    expect(profile.getRichTheme()).toEqual({ speciesClass: "anime-90s", earShape: "cat" });
  });

  it("returns cat beta profile when selected", () => {
    const profile = resolvePetProfile("cat_beta");
    expect(profile.getRichTheme()).toEqual({ speciesClass: "cat-beta", earShape: "cat" });
  });

  it("returns default profile for mochi avatar", () => {
    const profile = resolvePetProfile("mochi");
    expect(profile.getRichTheme()).toBeNull();
  });
});
