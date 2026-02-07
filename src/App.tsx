import { useEffect, useMemo, useState } from "react";
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
};

const STORAGE_KEY = "amiwi.settings";
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

function loadSettings(): Settings {
  const raw = localStorage.getItem(STORAGE_KEY);
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
    };
  } catch {
    return defaultSettings;
  }
}

function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [mood, setMood] = useState<Mood>("happy");
  const [phrase, setPhrase] = useState("");

  const [focusRunning, setFocusRunning] = useState(false);
  const [focusPhase, setFocusPhase] = useState<FocusPhase>("focus");
  const [remainingSeconds, setRemainingSeconds] = useState(FOCUS_SECONDS);

  const locale = useMemo(() => localeByLang[settings.language], [settings.language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const pool = locale.phrases[settings.tone][settings.mode];
    setPhrase(randomPick(pool));
  }, [locale, settings.tone, settings.mode]);

  useEffect(() => {
    if (!settings.phrasesEnabled) {
      return;
    }

    const tick = window.setInterval(() => {
      const pool = locale.phrases[settings.tone][settings.mode];
      setPhrase(randomPick(pool));
      setMood(settings.mode === "break" ? "break" : settings.mode === "study" ? "focus" : "happy");
    }, settings.phraseFrequencySec * 1000);

    return () => window.clearInterval(tick);
  }, [locale, settings.mode, settings.phraseFrequencySec, settings.phrasesEnabled, settings.tone]);

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
          setFocusPhase("break");
          setMood("celebrate");
          setSettings((prevSettings) => ({ ...prevSettings, mode: "break" }));
          return BREAK_SECONDS;
        }

        setFocusPhase("focus");
        setMood("focus");
        setSettings((prevSettings) => ({ ...prevSettings, mode: "study" }));
        return FOCUS_SECONDS;
      });
    }, 1000);

    return () => window.clearInterval(tick);
  }, [focusPhase, focusRunning]);

  const currentStatus = locale.status[mood];

  const onboardingDone = settings.onboarded;

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
