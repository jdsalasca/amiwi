export type Lang = "es" | "en";
export type Mode = "study" | "work" | "break";
export type Mood = "happy" | "focus" | "tired" | "break" | "celebrate";
export type AvatarStyle = "mochi" | "cat_beta" | "anime90s";
export type PomodoroPreset = "25-5" | "50-10" | "custom";
export type FocusPhase = "focus" | "break";
export type ThemePreset = "ocean" | "mint" | "rose";
export type BubbleModuleId = "focus" | "feed" | "phrase" | "music" | "move" | "settings";
export type BubblePack = "kawaii" | "study" | "pastel" | "retro";

export type Settings = {
  language: Lang;
  avatarStyle: AvatarStyle;
  phraseFrequencySec: number;
  opacity: number;
  size: number;
  mascotScale: number;
  mode: Mode;
  alwaysOnTop: boolean;
  systemMusicDetect: boolean;
  musicReactive: boolean;
  pomodoroPreset: PomodoroPreset;
  customFocusMin: number;
  customBreakMin: number;
  autoHideEnabled: boolean;
  autoHideSeconds: number;
  ultraMinimal: boolean;
  showTimerBubble: boolean;
  musicAmbient: boolean;
  cuteBubblesEnabled: boolean;
  bubblePack: BubblePack;
  clickThroughPermanent: boolean;
  dragAnywhereEnabled: boolean;
  snapToEdgeEnabled: boolean;
  snapMarginPx: number;
  themePreset: ThemePreset;
  bubbleModules: Record<BubbleModuleId, boolean>;
};

export type MusicDetection = {
  active: boolean;
  source: string;
  method: string;
};
