import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import en from "./locales/en.json";
import es from "./locales/es.json";
import "./App.css";

type Lang = "es" | "en";
type Tone = "sweet" | "neutral" | "motivator";
type Mode = "study" | "work" | "break";
type Mood = "happy" | "focus" | "tired" | "break" | "celebrate";
type FocusPhase = "focus" | "break";
type AvatarStyle = "blob" | "cat" | "bunny" | "fox" | "cloud" | "pixel";

type Settings = {
  language: Lang;
  tone: Tone;
  mode: Mode;
  phraseFrequencySec: number;
  opacity: number;
  size: number;
  phrasesEnabled: boolean;
  onboarded: boolean;
  musicReactive: boolean;
  minimalMode: boolean;
  avatarStyle: AvatarStyle;
  occasionalSayings: boolean;
  systemMusicDetect: boolean;
};

type WeeklyStats = {
  weekStartIso: string;
  focusMinutesByDay: number[];
  focusSessions: number;
  breakSessions: number;
  musicMinutes: number;
  feedCount: number;
  activeDates: string[];
};

type PetState = {
  hunger: number;
  feedTotal: number;
  lastUpdatedAt: string;
};

type MusicDetection = {
  active: boolean;
  source: string;
  method: string;
};

const SETTINGS_STORAGE_KEY = "amiwi.settings";
const STATS_STORAGE_KEY = "amiwi.weeklyStats";
const PET_STORAGE_KEY = "amiwi.petState";
const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

const localeByLang = { es, en };

const defaultSettings: Settings = {
  language: "es",
  tone: "sweet",
  mode: "study",
  phraseFrequencySec: 90,
  opacity: 1,
  size: 1,
  phrasesEnabled: true,
  onboarded: false,
  musicReactive: true,
  minimalMode: true,
  avatarStyle: "blob",
  occasionalSayings: true,
  systemMusicDetect: true,
};

const faceByAvatar: Record<AvatarStyle, Record<Mood, string>> = {
  blob: {
    happy: "(＾▽＾)",
    focus: "(•̀ᴗ•́)و",
    tired: "(˘･_･˘)",
    break: "( ＾◡＾)っ✿",
    celebrate: "٩(ˊᗜˋ*)و",
  },
  cat: {
    happy: "^._.^",
    focus: "ฅ^•ﻌ•^ฅ",
    tired: "=^._.^=",
    break: "(=^-ω-^=)",
    celebrate: "ฅ(＾・ω・＾ฅ)",
  },
  bunny: {
    happy: "(\_/)",
    focus: "(\_/)>",
    tired: "(\_/)..",
    break: "(\_/ )~",
    celebrate: "(\_/ )ﾉ",
  },
  fox: {
    happy: "🦊",
    focus: "🦊✨",
    tired: "🦊💤",
    break: "🦊☁",
    celebrate: "🦊🎉",
  },
  cloud: {
    happy: "☁︎(◕‿◕)",
    focus: "☁︎(•̀ᴗ•́)",
    tired: "☁︎(˘･_･˘)",
    break: "☁︎( ＾◡＾)",
    celebrate: "☁︎✧٩(ˊᗜˋ*)و",
  },
  pixel: {
    happy: "[ ^_^ ]",
    focus: "[ >_< ]",
    tired: "[ -_- ]",
    break: "[ ~_~ ]",
    celebrate: "[ +_+ ]",
  },
};

function randomPick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function getIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getWeekStartIso(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const mondayDistance = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - mondayDistance);
  d.setHours(0, 0, 0, 0);
  return getIsoDate(d);
}

function getWeekDayIndex(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function computeStreakDays(activeDates: string[]): number {
  const uniqueDates = unique(activeDates);
  if (uniqueDates.length === 0) {
    return 0;
  }

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (true) {
    const key = getIsoDate(cursor);
    if (!uniqueDates.includes(key)) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function loadSettings(): Settings {
  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      ...defaultSettings,
      ...parsed,
      phraseFrequencySec: clamp(parsed.phraseFrequencySec ?? 90, 20, 600),
      opacity: clamp(parsed.opacity ?? 1, 0.4, 1),
      size: clamp(parsed.size ?? 1, 0.8, 1.4),
      musicReactive: parsed.musicReactive ?? true,
      minimalMode: parsed.minimalMode ?? true,
      occasionalSayings: parsed.occasionalSayings ?? true,
      systemMusicDetect: parsed.systemMusicDetect ?? true,
    };
  } catch {
    return defaultSettings;
  }
}

function defaultWeeklyStats(now: Date): WeeklyStats {
  return {
    weekStartIso: getWeekStartIso(now),
    focusMinutesByDay: [0, 0, 0, 0, 0, 0, 0],
    focusSessions: 0,
    breakSessions: 0,
    musicMinutes: 0,
    feedCount: 0,
    activeDates: [],
  };
}

function normalizeWeeklyStats(candidate: WeeklyStats, now: Date): WeeklyStats {
  if (candidate.weekStartIso !== getWeekStartIso(now)) {
    return defaultWeeklyStats(now);
  }

  const focusMinutesByDay = [...candidate.focusMinutesByDay];
  while (focusMinutesByDay.length < 7) {
    focusMinutesByDay.push(0);
  }

  return {
    ...candidate,
    focusMinutesByDay: focusMinutesByDay.slice(0, 7),
    feedCount: candidate.feedCount ?? 0,
    activeDates: unique(candidate.activeDates),
  };
}

function loadWeeklyStats(): WeeklyStats {
  const now = new Date();
  const raw = localStorage.getItem(STATS_STORAGE_KEY);
  if (!raw) {
    return defaultWeeklyStats(now);
  }

  try {
    const parsed = JSON.parse(raw) as WeeklyStats;
    return normalizeWeeklyStats(parsed, now);
  } catch {
    return defaultWeeklyStats(now);
  }
}

function defaultPetState(now: Date): PetState {
  return {
    hunger: 70,
    feedTotal: 0,
    lastUpdatedAt: now.toISOString(),
  };
}

function applyPetDecay(pet: PetState, now: Date): PetState {
  const last = new Date(pet.lastUpdatedAt);
  const elapsedMinutes = Math.max(0, Math.floor((now.getTime() - last.getTime()) / 60_000));
  const hunger = clamp(pet.hunger - elapsedMinutes, 0, 100);
  return {
    ...pet,
    hunger,
    lastUpdatedAt: now.toISOString(),
  };
}

function loadPetState(): PetState {
  const now = new Date();
  const raw = localStorage.getItem(PET_STORAGE_KEY);
  if (!raw) {
    return defaultPetState(now);
  }

  try {
    const parsed = JSON.parse(raw) as PetState;
    const normalized: PetState = {
      hunger: clamp(parsed.hunger ?? 70, 0, 100),
      feedTotal: parsed.feedTotal ?? 0,
      lastUpdatedAt: parsed.lastUpdatedAt ?? now.toISOString(),
    };

    return applyPetDecay(normalized, now);
  } catch {
    return defaultPetState(now);
  }
}

async function minimizeWindow(): Promise<void> {
  try {
    await getCurrentWindow().minimize();
  } catch {
    // No-op
  }
}

async function toggleMaximizeWindow(): Promise<void> {
  try {
    const appWindow = getCurrentWindow();
    const isMax = await appWindow.isMaximized();
    if (isMax) {
      await appWindow.unmaximize();
      return;
    }

    await appWindow.maximize();
  } catch {
    // No-op
  }
}

async function closeWindow(): Promise<void> {
  try {
    await getCurrentWindow().close();
  } catch {
    // No-op
  }
}

function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [stats, setStats] = useState<WeeklyStats>(() => loadWeeklyStats());
  const [pet, setPet] = useState<PetState>(() => loadPetState());
  const [showSettings, setShowSettings] = useState(false);
  const [mood, setMood] = useState<Mood>("happy");
  const [phrase, setPhrase] = useState("");
  const [musicSystemSource, setMusicSystemSource] = useState("");

  const [focusRunning, setFocusRunning] = useState(false);
  const [focusPhase, setFocusPhase] = useState<FocusPhase>("focus");
  const [remainingSeconds, setRemainingSeconds] = useState(FOCUS_SECONDS);

  const [musicTrackName, setMusicTrackName] = useState("");
  const [musicTrackUrl, setMusicTrackUrl] = useState("");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [systemMusicActive, setSystemMusicActive] = useState(false);

  const locale = useMemo(() => localeByLang[settings.language], [settings.language]);
  const isMusicActive = settings.musicReactive && (musicPlaying || systemMusicActive);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(pet));
  }, [pet]);

  useEffect(() => {
    setStats((prev) => normalizeWeeklyStats(prev, new Date()));
  }, []);

  useEffect(() => {
    if (isMusicActive) {
      setPhrase(randomPick(locale.musicPhrases));
      setMood("celebrate");
      return;
    }

    if (pet.hunger < 20) {
      setPhrase(randomPick(locale.petHungryPhrases));
      setMood("tired");
      return;
    }

    const pool = locale.phrases[settings.tone][settings.mode];
    setPhrase(randomPick(pool));
  }, [isMusicActive, locale, pet.hunger, settings.mode, settings.tone]);

  useEffect(() => {
    if (!settings.phrasesEnabled) {
      return;
    }

    const tick = window.setInterval(() => {
      if (isMusicActive) {
        setPhrase(randomPick(locale.musicPhrases));
        setMood((prev) => (prev === "celebrate" ? "happy" : "celebrate"));
        return;
      }

      if (pet.hunger < 20) {
        setPhrase(randomPick(locale.petHungryPhrases));
        setMood("tired");
        return;
      }

      const pool = locale.phrases[settings.tone][settings.mode];
      setPhrase(randomPick(pool));
      setMood(settings.mode === "break" ? "break" : settings.mode === "study" ? "focus" : "happy");
    }, settings.phraseFrequencySec * 1000);

    return () => window.clearInterval(tick);
  }, [isMusicActive, locale, pet.hunger, settings.mode, settings.phrasesEnabled, settings.phraseFrequencySec, settings.tone]);

  useEffect(() => {
    if (!settings.occasionalSayings) {
      return;
    }

    let cancelled = false;
    let timeoutId = 0;

    const schedule = () => {
      timeoutId = window.setTimeout(() => {
        if (cancelled) {
          return;
        }

        if (!isMusicActive) {
          setPhrase(randomPick(locale.occasionalPhrases));
          setMood("happy");
        }

        schedule();
      }, randomPick([120_000, 180_000, 240_000, 300_000]));
    };

    schedule();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isMusicActive, locale, settings.occasionalSayings]);

  useEffect(() => {
    if (!focusRunning) {
      return;
    }

    const tick = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        if (focusPhase === "focus") {
          const now = new Date();
          const dayIndex = getWeekDayIndex(now);
          const todayIso = getIsoDate(now);

          setStats((prevStats) => {
            const next = normalizeWeeklyStats(prevStats, now);
            next.focusMinutesByDay[dayIndex] += 25;
            next.focusSessions += 1;
            next.activeDates = unique([...next.activeDates, todayIso]).slice(-40);
            return { ...next };
          });

          setFocusPhase("break");
          setMood("celebrate");
          setSettings((prevSettings) => ({ ...prevSettings, mode: "break" }));
          return BREAK_SECONDS;
        }

        setStats((prevStats) => ({ ...prevStats, breakSessions: prevStats.breakSessions + 1 }));
        setFocusPhase("focus");
        setMood("focus");
        setSettings((prevSettings) => ({ ...prevSettings, mode: "study" }));
        return FOCUS_SECONDS;
      });
    }, 1000);

    return () => window.clearInterval(tick);
  }, [focusPhase, focusRunning]);

  useEffect(() => {
    if (!isMusicActive) {
      return;
    }

    const timer = window.setInterval(() => {
      setStats((prevStats) => {
        const now = new Date();
        const next = normalizeWeeklyStats(prevStats, now);
        next.musicMinutes += 1;
        return { ...next };
      });
    }, 60_000);

    return () => window.clearInterval(timer);
  }, [isMusicActive]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setPet((prevPet) => applyPetDecay(prevPet, new Date()));
    }, 60_000);

    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!settings.systemMusicDetect) {
      setSystemMusicActive(false);
      setMusicSystemSource("");
      return;
    }

    let active = true;

    const checkMusic = async () => {
      try {
        const result = await invoke<MusicDetection>("detect_system_music");
        if (!active) {
          return;
        }

        setSystemMusicActive(result.active);
        setMusicSystemSource(result.source);
      } catch {
        if (!active) {
          return;
        }

        setSystemMusicActive(false);
        setMusicSystemSource("");
      }
    };

    void checkMusic();
    const timer = window.setInterval(() => {
      void checkMusic();
    }, 20_000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [settings.systemMusicDetect]);

  const applySetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const currentStatus = locale.status[mood];
  const onboardingDone = settings.onboarded;
  const totalFocusWeek = stats.focusMinutesByDay.reduce((sum, item) => sum + item, 0);
  const todayFocus = stats.focusMinutesByDay[getWeekDayIndex(new Date())] ?? 0;
  const streakDays = computeStreakDays(stats.activeDates);

  const startFocus = () => {
    setFocusRunning(true);
    setFocusPhase("focus");
    setRemainingSeconds(FOCUS_SECONDS);
    setMood("focus");
    applySetting("mode", "study");
  };

  const stopFocus = () => {
    setFocusRunning(false);
    setRemainingSeconds(FOCUS_SECONDS);
    setFocusPhase("focus");
    setMood("happy");
  };

  const handleMusicFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      return;
    }

    if (musicTrackUrl) {
      URL.revokeObjectURL(musicTrackUrl);
    }

    const url = URL.createObjectURL(file);
    setMusicTrackUrl(url);
    setMusicTrackName(file.name);
  };

  const feedCompanion = () => {
    setPet((prev) => ({
      hunger: clamp(prev.hunger + 25, 0, 100),
      feedTotal: prev.feedTotal + 1,
      lastUpdatedAt: new Date().toISOString(),
    }));

    setStats((prev) => ({ ...prev, feedCount: prev.feedCount + 1 }));
    setMood("celebrate");
    setPhrase(randomPick(locale.feedPhrases));
  };

  return (
    <main className={`app-shell ${settings.minimalMode ? "widget-mode" : ""}`} style={{ opacity: settings.opacity }}>
      {!onboardingDone && (
        <section className="onboarding">
          <h2>{locale.ui.onboardingTitle}</h2>

          <label>
            {locale.ui.language}
            <select
              value={settings.language}
              onChange={(event) => applySetting("language", event.currentTarget.value as Lang)}
            >
              <option value="es">Espanol</option>
              <option value="en">English</option>
            </select>
          </label>

          <label>
            {locale.ui.avatar}
            <select
              value={settings.avatarStyle}
              onChange={(event) => applySetting("avatarStyle", event.currentTarget.value as AvatarStyle)}
            >
              <option value="blob">Blob</option>
              <option value="cloud">Cloud</option>
              <option value="pixel">Pixel</option>
              <option value="cat">Cat</option>
              <option value="bunny">Bunny</option>
              <option value="fox">Fox</option>
            </select>
          </label>

          <button type="button" onClick={() => applySetting("onboarded", true)}>
            {locale.ui.onboardingCta}
          </button>
        </section>
      )}

      <header className="drag-zone" data-tauri-drag-region>
        <strong>{locale.appName}</strong>
        <div className="header-actions">
          <button type="button" className="tiny" onClick={() => applySetting("minimalMode", !settings.minimalMode)}>
            {settings.minimalMode ? locale.ui.expand : locale.ui.minimal}
          </button>
          <button type="button" className="tiny" onClick={() => setShowSettings((prev) => !prev)}>
            {showSettings ? locale.ui.closeSettings : locale.ui.openSettings}
          </button>
          <button type="button" className="win-btn" onClick={() => void minimizeWindow()} title="Minimize">
            _
          </button>
          <button type="button" className="win-btn" onClick={() => void toggleMaximizeWindow()} title="Maximize">
            □
          </button>
          <button type="button" className="win-btn close" onClick={() => void closeWindow()} title="Close">
            ✕
          </button>
        </div>
      </header>

      <section className={`avatar-card ${settings.minimalMode ? "minimal-card" : ""}`} style={{ transform: `scale(${settings.size})` }}>
        <p className="face">{faceByAvatar[settings.avatarStyle][mood]}</p>
        <p className="status">{currentStatus}</p>

        {settings.minimalMode ? (
          <>
            <p className="widget-phrase">{phrase}</p>
            <div className="pomodoro-chip">
              <span>{focusPhase === "focus" ? "🍅" : "☕"}</span>
              <span>{formatMMSS(remainingSeconds)}</span>
              {!focusRunning ? (
                <button type="button" onClick={startFocus}>Start</button>
              ) : (
                <button type="button" onClick={stopFocus}>Stop</button>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="tagline">{locale.tagline}</p>
            <p className="boost">{locale.ui.todayBoost}</p>
          </>
        )}
      </section>

      {!settings.minimalMode && (
        <>
          <section className="speech-card">
            <h4>{locale.ui.currentPhrase}</h4>
            <p>{phrase}</p>
          </section>

          <section className="pet-card">
            <h4>{locale.ui.petTitle}</h4>
            <p>
              {locale.ui.hunger}: {pet.hunger}%
            </p>
            <div className="hunger-bar">
              <span style={{ width: `${pet.hunger}%` }} />
            </div>
            <button type="button" onClick={feedCompanion}>
              {locale.ui.feedButton}
            </button>
          </section>

          <section className="actions-card">
            <label>
              {locale.ui.mode}
              <select value={settings.mode} onChange={(event) => applySetting("mode", event.currentTarget.value as Mode)}>
                <option value="study">{locale.modes.study}</option>
                <option value="work">{locale.modes.work}</option>
                <option value="break">{locale.modes.break}</option>
              </select>
            </label>

            <div className="focus-row">
              {!focusRunning ? (
                <button type="button" onClick={startFocus}>
                  {locale.ui.focusStart}
                </button>
              ) : (
                <button type="button" onClick={stopFocus}>
                  {locale.ui.focusStop}
                </button>
              )}
              <span>
                {focusPhase === "focus" ? locale.ui.focusRunning : locale.ui.breakRunning}: {formatMMSS(remainingSeconds)}
              </span>
            </div>
          </section>

          <section className="music-card">
            <h4>{locale.ui.musicTitle}</h4>
            <p className="music-track">System: {systemMusicActive ? musicSystemSource || "active" : "inactive"}</p>

            <label>
              {locale.ui.musicPickFile}
              <input type="file" accept="audio/*" onChange={handleMusicFile} />
            </label>

            <p className="music-track">
              {locale.ui.musicNowPlaying}: {musicTrackName || locale.ui.musicNoTrack}
            </p>

            <audio
              controls
              src={musicTrackUrl}
              onPlay={() => setMusicPlaying(true)}
              onPause={() => setMusicPlaying(false)}
              onEnded={() => setMusicPlaying(false)}
            />
          </section>

          <section className="stats-card">
            <h4>{locale.ui.weeklyStats}</h4>
            <p>{locale.ui.focusMinutesWeek}: {totalFocusWeek}</p>
            <p>{locale.ui.focusMinutesToday}: {todayFocus}</p>
            <p>{locale.ui.focusSessions}: {stats.focusSessions}</p>
            <p>{locale.ui.musicMinutesWeek}: {stats.musicMinutes}</p>
            <p>{locale.ui.feedCountWeek}: {stats.feedCount}</p>
            <p>{locale.ui.streakDays}: {streakDays}</p>
          </section>
        </>
      )}

      {showSettings && (
        <section className="settings-panel">
          <label>
            {locale.ui.language}
            <select
              value={settings.language}
              onChange={(event) => applySetting("language", event.currentTarget.value as Lang)}
            >
              <option value="es">Espanol</option>
              <option value="en">English</option>
            </select>
          </label>

          <label>
            {locale.ui.avatar}
            <select
              value={settings.avatarStyle}
              onChange={(event) => applySetting("avatarStyle", event.currentTarget.value as AvatarStyle)}
            >
              <option value="blob">Blob</option>
              <option value="cloud">Cloud</option>
              <option value="pixel">Pixel</option>
              <option value="cat">Cat</option>
              <option value="bunny">Bunny</option>
              <option value="fox">Fox</option>
            </select>
          </label>

          <label>
            {locale.ui.frequency}: {settings.phraseFrequencySec} {locale.ui.seconds}
            <input
              type="range"
              min={20}
              max={300}
              value={settings.phraseFrequencySec}
              onChange={(event) => applySetting("phraseFrequencySec", Number(event.currentTarget.value))}
            />
          </label>

          <label>
            {locale.ui.size}: {settings.size.toFixed(1)}x
            <input
              type="range"
              min={0.8}
              max={1.4}
              step={0.1}
              value={settings.size}
              onChange={(event) => applySetting("size", Number(event.currentTarget.value))}
            />
          </label>

          <label>
            {locale.ui.opacity}: {settings.opacity.toFixed(1)}
            <input
              type="range"
              min={0.4}
              max={1}
              step={0.1}
              value={settings.opacity}
              onChange={(event) => applySetting("opacity", Number(event.currentTarget.value))}
            />
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={settings.phrasesEnabled}
              onChange={(event) => applySetting("phrasesEnabled", event.currentTarget.checked)}
            />
            {locale.ui.phrasesEnabled}
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={settings.minimalMode}
              onChange={(event) => applySetting("minimalMode", event.currentTarget.checked)}
            />
            {locale.ui.minimal}
          </label>
        </section>
      )}
    </main>
  );
}

export default App;
