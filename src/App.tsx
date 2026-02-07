import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import en from "./locales/en.json";
import es from "./locales/es.json";
import "./App.css";

type Lang = "es" | "en";
type Tone = "sweet" | "neutral" | "motivator";
type Mode = "study" | "work" | "break";
type Mood = "happy" | "focus" | "tired" | "break" | "celebrate";
type FocusPhase = "focus" | "break";

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
};

type WeeklyStats = {
  weekStartIso: string;
  focusMinutesByDay: number[];
  focusSessions: number;
  breakSessions: number;
  musicMinutes: number;
  activeDates: string[];
};

const SETTINGS_STORAGE_KEY = "amiwi.settings";
const STATS_STORAGE_KEY = "amiwi.weeklyStats";
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
};

const faceByMood: Record<Mood, string> = {
  happy: "(＾▽＾)",
  focus: "(•̀ᴗ•́)و",
  tired: "(˘･_･˘)",
  break: "( ＾◡＾)っ✿",
  celebrate: "٩(ˊᗜˋ*)و",
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

function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [stats, setStats] = useState<WeeklyStats>(() => loadWeeklyStats());
  const [showSettings, setShowSettings] = useState(false);
  const [mood, setMood] = useState<Mood>("happy");
  const [phrase, setPhrase] = useState("");

  const [focusRunning, setFocusRunning] = useState(false);
  const [focusPhase, setFocusPhase] = useState<FocusPhase>("focus");
  const [remainingSeconds, setRemainingSeconds] = useState(FOCUS_SECONDS);

  const [musicTrackName, setMusicTrackName] = useState("");
  const [musicTrackUrl, setMusicTrackUrl] = useState("");
  const [musicPlaying, setMusicPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const locale = useMemo(() => localeByLang[settings.language], [settings.language]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    setStats((prev) => normalizeWeeklyStats(prev, new Date()));
  }, []);

  useEffect(() => {
    if (settings.musicReactive && musicPlaying) {
      setPhrase(randomPick(locale.musicPhrases));
      setMood("celebrate");
      return;
    }

    const pool = locale.phrases[settings.tone][settings.mode];
    setPhrase(randomPick(pool));
  }, [locale, musicPlaying, settings.mode, settings.musicReactive, settings.tone]);

  useEffect(() => {
    if (!settings.phrasesEnabled) {
      return;
    }

    const tick = window.setInterval(() => {
      if (settings.musicReactive && musicPlaying) {
        setPhrase(randomPick(locale.musicPhrases));
        setMood((prev) => (prev === "celebrate" ? "happy" : "celebrate"));
        return;
      }

      const pool = locale.phrases[settings.tone][settings.mode];
      setPhrase(randomPick(pool));
      setMood(settings.mode === "break" ? "break" : settings.mode === "study" ? "focus" : "happy");
    }, settings.phraseFrequencySec * 1000);

    return () => window.clearInterval(tick);
  }, [locale, musicPlaying, settings.mode, settings.musicReactive, settings.phraseFrequencySec, settings.phrasesEnabled, settings.tone]);

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
    if (!(settings.musicReactive && musicPlaying)) {
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
  }, [musicPlaying, settings.musicReactive]);

  const currentStatus = locale.status[mood];
  const onboardingDone = settings.onboarded;

  const totalFocusWeek = stats.focusMinutesByDay.reduce((sum, item) => sum + item, 0);
  const todayFocus = stats.focusMinutesByDay[getWeekDayIndex(new Date())] ?? 0;
  const streakDays = computeStreakDays(stats.activeDates);

  const applySetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

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

  return (
    <main className="app-shell" style={{ opacity: settings.opacity }}>
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
            {locale.ui.tone}
            <select value={settings.tone} onChange={(event) => applySetting("tone", event.currentTarget.value as Tone)}>
              <option value="sweet">{locale.tones.sweet}</option>
              <option value="neutral">{locale.tones.neutral}</option>
              <option value="motivator">{locale.tones.motivator}</option>
            </select>
          </label>

          <button type="button" onClick={() => applySetting("onboarded", true)}>
            {locale.ui.onboardingCta}
          </button>
        </section>
      )}

      <header className="drag-zone" data-tauri-drag-region>
        <strong>{locale.appName}</strong>
        <button type="button" className="tiny" onClick={() => setShowSettings((prev) => !prev)}>
          {showSettings ? locale.ui.closeSettings : locale.ui.openSettings}
        </button>
      </header>

      <section className="avatar-card" style={{ transform: `scale(${settings.size})` }}>
        <p className="face">{faceByMood[mood]}</p>
        <p className="status">{currentStatus}</p>
        <p className="tagline">{locale.tagline}</p>
        <p className="boost">{locale.ui.todayBoost}</p>
      </section>

      <section className="speech-card">
        <h4>{locale.ui.currentPhrase}</h4>
        <p>{phrase}</p>
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

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={settings.musicReactive}
            onChange={(event) => applySetting("musicReactive", event.currentTarget.checked)}
          />
          {locale.ui.musicReactive}
        </label>

        <label>
          {locale.ui.musicPickFile}
          <input type="file" accept="audio/*" onChange={handleMusicFile} />
        </label>

        <p className="music-track">
          {locale.ui.musicNowPlaying}: {musicTrackName || locale.ui.musicNoTrack}
        </p>

        <audio
          ref={audioRef}
          controls
          src={musicTrackUrl}
          onPlay={() => {
            setMusicPlaying(true);
            if (settings.musicReactive) {
              setMood("celebrate");
              setPhrase(randomPick(locale.musicPhrases));
            }
          }}
          onPause={() => {
            setMusicPlaying(false);
            if (settings.mode === "break") {
              setMood("break");
            } else if (settings.mode === "study") {
              setMood("focus");
            } else {
              setMood("happy");
            }
          }}
          onEnded={() => setMusicPlaying(false)}
        />
      </section>

      <section className="stats-card">
        <h4>{locale.ui.weeklyStats}</h4>
        <p>{locale.ui.focusMinutesWeek}: {totalFocusWeek}</p>
        <p>{locale.ui.focusMinutesToday}: {todayFocus}</p>
        <p>{locale.ui.focusSessions}: {stats.focusSessions}</p>
        <p>{locale.ui.musicMinutesWeek}: {stats.musicMinutes}</p>
        <p>{locale.ui.streakDays}: {streakDays}</p>
      </section>

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
            {locale.ui.tone}
            <select value={settings.tone} onChange={(event) => applySetting("tone", event.currentTarget.value as Tone)}>
              <option value="sweet">{locale.tones.sweet}</option>
              <option value="neutral">{locale.tones.neutral}</option>
              <option value="motivator">{locale.tones.motivator}</option>
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
        </section>
      )}
    </main>
  );
}

export default App;
