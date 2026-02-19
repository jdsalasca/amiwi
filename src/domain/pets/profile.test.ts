import { describe, expect, it } from "vitest";
import { resolvePetProfile } from "./profile";

describe("pet profile resolver", () => {
  it("returns cat beta theme for anime style", () => {
    const profile = resolvePetProfile("anime");
    expect(profile.getRichTheme()).toEqual({ speciesClass: "cat-beta", earShape: "cat" });
  });

  it("returns bunny beta profile when selected", () => {
    const profile = resolvePetProfile("bunny_beta");
    expect(profile.getRichTheme()).toEqual({ speciesClass: "bunny-beta", earShape: "bunny" });
  });

  it("returns anime 90s theme when selected", () => {
    const profile = resolvePetProfile("anime90s");
    expect(profile.getRichTheme()).toEqual({ speciesClass: "anime-90s", earShape: "cat" });
  });

  it("returns default profile for base avatars", () => {
    const profile = resolvePetProfile("cat");
    expect(profile.getRichTheme()).toBeNull();
  });
});
