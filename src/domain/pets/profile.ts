import type { FocusPhase, Mode, Mood, AvatarStyle } from "../types";

export type PetMemoryEventType = "petting" | "shake" | "focus_start" | "focus_stop" | "music_on" | "music_off";

export type PetMemoryEvent = {
  type: PetMemoryEventType;
  ts: number;
};

export type PetProfileContext = {
  language: "es" | "en";
  mode: Mode;
  mood: Mood;
  focusRunning: boolean;
  focusPhase: FocusPhase;
  isMusicActive: boolean;
  bond: number;
};

export type RichPetTheme = {
  speciesClass: "cat-beta" | "bunny-beta" | "anime-90s";
  earShape: "cat" | "bunny";
};

export abstract class PetProfile {
  constructor(public readonly style: AvatarStyle, public readonly displayName: string) {}

  abstract getBubbleIcons(ctx: PetProfileContext): readonly string[];

  abstract getMemoryPhrase(event: PetMemoryEventType, ctx: PetProfileContext): string | null;

  getRichTheme(): RichPetTheme | null {
    return null;
  }
}

class DefaultPetProfile extends PetProfile {
  getBubbleIcons(ctx: PetProfileContext): readonly string[] {
    if (ctx.isMusicActive) {
      return ["🫧", "🎵", "🎶", "✨", "💗", "🌟", "🧸"];
    }
    if (ctx.focusRunning && ctx.focusPhase === "focus") {
      return ["📘", "📚", "✏️", "✨", "🫧", "🌟", "🐾"];
    }
    if (ctx.mode === "work") {
      return ["☕", "✅", "📘", "🫧", "✨", "🐾"];
    }
    if (ctx.mode === "break") {
      return ["💗", "🌸", "🫧", "⭐", "🧸", "🐥"];
    }
    return ["💗", "🫧", "⭐", "📘", "🐾", "🌸", "✨", "🧸"];
  }

  getMemoryPhrase(event: PetMemoryEventType, ctx: PetProfileContext): string | null {
    if (event === "petting") {
      return ctx.language === "es" ? "te siento cerca y me gusta" : "I feel close to you and I like it";
    }
    if (event === "shake") {
      return ctx.language === "es" ? "wow, eso tuvo mucha energia" : "wow, that had so much energy";
    }
    return null;
  }
}

class CatBetaProfile extends PetProfile {
  getBubbleIcons(ctx: PetProfileContext): readonly string[] {
    const base = ["🐾", "🧶", "💗", "✨", "⭐", "🫧", "📘", "🧸"];
    if (ctx.isMusicActive) {
      return [...base, "🎵", "🎶"];
    }
    if (ctx.focusRunning && ctx.focusPhase === "focus") {
      return [...base, "📚", "✏️", "☕"];
    }
    return base;
  }

  getMemoryPhrase(event: PetMemoryEventType, ctx: PetProfileContext): string | null {
    if (event === "petting") {
      return ctx.language === "es" ? "mrrr... eso estuvo tierno" : "mrrr... that felt sweet";
    }
    if (event === "shake") {
      return ctx.language === "es" ? "miau! casi salgo volando" : "meow! I almost flew away";
    }
    if (event === "focus_start") {
      return ctx.language === "es" ? "modo cazadora de foco activado" : "focus hunter mode enabled";
    }
    return null;
  }

  override getRichTheme(): RichPetTheme {
    return { speciesClass: "cat-beta", earShape: "cat" };
  }
}

class BunnyBetaProfile extends PetProfile {
  getBubbleIcons(ctx: PetProfileContext): readonly string[] {
    const base = ["🐇", "🥕", "💗", "🌸", "🫧", "✨", "📘", "⭐"];
    if (ctx.isMusicActive) {
      return [...base, "🎵", "🎶"];
    }
    if (ctx.mode === "break") {
      return [...base, "🧸", "🌼"];
    }
    return base;
  }

  getMemoryPhrase(event: PetMemoryEventType, ctx: PetProfileContext): string | null {
    if (event === "petting") {
      return ctx.language === "es" ? "saltito feliz! gracias por mimarme" : "happy hop! thanks for petting me";
    }
    if (event === "shake") {
      return ctx.language === "es" ? "mis orejitas hicieron boing" : "my ears went boing";
    }
    if (event === "focus_start") {
      return ctx.language === "es" ? "hop hop, acompaño tu foco" : "hop hop, I will guard your focus";
    }
    return null;
  }

  override getRichTheme(): RichPetTheme {
    return { speciesClass: "bunny-beta", earShape: "bunny" };
  }
}

class Anime90sProfile extends PetProfile {
  getBubbleIcons(ctx: PetProfileContext): readonly string[] {
    const base = ["🌙", "✨", "💫", "🪽", "🫧", "💗", "📼", "🎧"];
    if (ctx.isMusicActive) {
      return [...base, "🎵", "🎶", "💿"];
    }
    if (ctx.focusRunning && ctx.focusPhase === "focus") {
      return [...base, "📘", "🖊️", "☕"];
    }
    return base;
  }

  getMemoryPhrase(event: PetMemoryEventType, ctx: PetProfileContext): string | null {
    if (event === "petting") {
      return ctx.language === "es" ? "kyaa... me hiciste sonreir" : "kyaa... you made me smile";
    }
    if (event === "shake") {
      return ctx.language === "es" ? "ay! mi moño noventero" : "ah! my 90s bow";
    }
    if (event === "focus_start") {
      return ctx.language === "es" ? "modo magical focus activado" : "magical focus mode on";
    }
    return null;
  }

  override getRichTheme(): RichPetTheme {
    return { speciesClass: "anime-90s", earShape: "cat" };
  }
}

const DEFAULT = new DefaultPetProfile("blob", "Default");
const CAT_BETA = new CatBetaProfile("cat_beta", "Cat Beta");
const BUNNY_BETA = new BunnyBetaProfile("bunny_beta", "Bunny Beta");
const ANIME_90S = new Anime90sProfile("anime90s", "Anime 90s");

export function resolvePetProfile(style: AvatarStyle): PetProfile {
  if (style === "cat_beta") {
    return CAT_BETA;
  }
  if (style === "bunny_beta") {
    return BUNNY_BETA;
  }
  if (style === "anime90s") {
    return ANIME_90S;
  }
  if (style === "anime") {
    return CAT_BETA;
  }
  return DEFAULT;
}
