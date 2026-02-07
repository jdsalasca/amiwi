export type Lang = "es" | "en";
export type Mode = "study" | "work" | "break";
export type Mood = "happy" | "focus" | "tired" | "break" | "celebrate";
export type AvatarStyle = "blob" | "cat" | "bunny" | "fox" | "cloud" | "pixel";
export type PomodoroPreset = "25-5" | "50-10" | "custom";
export type FocusPhase = "focus" | "break";

export type Settings = {
  language: Lang;
  avatarStyle: AvatarStyle;
  phraseFrequencySec: number;
  opacity: number;
  size: number;
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
};

export type MusicDetection = {
  active: boolean;
  source: string;
  method: string;
};

