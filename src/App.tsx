import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./App.css";

type Lang = "es" | "en";
type Mode = "study" | "work" | "break";
type Mood = "happy" | "focus" | "tired" | "break" | "celebrate";
type AvatarStyle = "blob" | "cat" | "bunny" | "fox" | "cloud" | "pixel";
type PomodoroPreset = "25-5" | "50-10" | "custom";
type FocusPhase = "focus" | "break";

type Settings = {
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
};

type MusicDetection = {
  active: boolean;
  source: string;
  method: string;
};

const STORAGE_KEY = "amiwi.widget.settings";

const copy = {
  es: {
    title: "Amiwi",
    subtitle: "widget mode",
    focus: "Foco",
    work: "Trabajo",
    rest: "Descanso",
    settings: "Ajustes",
    close: "Cerrar",
    nowPlaying: "Musica",
    noMusic: "sin musica",
    start: "Iniciar",
    stop: "Detener",
    feed: "Snack",
    preset: "Pomodoro",
    focusMin: "Foco (min)",
    breakMin: "Descanso (min)",
    avatar: "Avatar",
    language: "Idioma",
    opacity: "Opacidad",
    size: "Tamano",
    phraseFreq: "Frecuencia frases",
    mode: "Modo",
    alwaysOnTop: "Siempre arriba",
    detectSystemMusic: "Detectar musica del sistema",
    reactMusic: "Reaccionar a musica",
    uploadTrack: "Cargar cancion",
    autoHide: "Auto ocultar",
    autoHideSec: "Segundos para ocultar",
    clickThroughPulse: "Click-through 8s",
    clickThroughHint: "modo pasivo activo",
    phraseStudy: [
      "Vamos, paso a paso. Estoy contigo.",
      "Un bloque mas y celebramos.",
      "Tu enfoque hoy esta hermoso."
    ],
    phraseWork: [
      "Una tarea a la vez, con claridad.",
      "Prioriza lo importante y avanza.",
      "Buen ritmo, sigue asi."
    ],
    phraseBreak: [
      "Respira, descansa, vuelve fuerte.",
      "Pausa corta, energia alta.",
      "Descansar tambien es progreso."
    ],
    phraseMusic: [
      "Ese beat esta perfecto para tu foco.",
      "Flow activado, seguimos.",
      "Tu energia subio, se nota."
    ],
    phraseFeed: [
      "Snack recibido, alegria al maximo.",
      "Gracias por cuidarme.",
      "Con snack todo fluye mejor."
    ],
    phraseMorning: [
      "Buenos dias. Hoy se avanza bonito.",
      "Manana de enfoque suave y constante."
    ],
    phraseNight: [
      "Cierre tranquilo, buen trabajo hoy.",
      "Noche de calma: una cosa a la vez."
    ],
    phraseDeepFocus: [
      "Respira hondo, bloque profundo activo.",
      "Silencio interno, foco total."
    ]
  },
  en: {
    title: "Amiwi",
    subtitle: "widget mode",
    focus: "Focus",
    work: "Work",
    rest: "Break",
    settings: "Settings",
    close: "Close",
    nowPlaying: "Music",
    noMusic: "no music",
    start: "Start",
    stop: "Stop",
    feed: "Snack",
    preset: "Pomodoro",
    focusMin: "Focus (min)",
    breakMin: "Break (min)",
    avatar: "Avatar",
    language: "Language",
    opacity: "Opacity",
    size: "Size",
    phraseFreq: "Phrase frequency",
    mode: "Mode",
    alwaysOnTop: "Always on top",
    detectSystemMusic: "Detect system music",
    reactMusic: "React to music",
    uploadTrack: "Load track",
    autoHide: "Auto hide",
    autoHideSec: "Seconds to hide",
    clickThroughPulse: "Click-through 8s",
    clickThroughHint: "passive mode enabled",
    phraseStudy: [
      "One step at a time. I am with you.",
      "One more block and we celebrate.",
      "Your focus today is beautiful."
    ],
    phraseWork: [
      "One task at a time, clear execution.",
      "Prioritize what matters and move.",
      "Great pace, keep going."
    ],
    phraseBreak: [
      "Breathe, rest, come back stronger.",
      "Short break, high energy.",
      "Rest is progress too."
    ],
    phraseMusic: [
      "That beat is perfect for your flow.",
      "Flow mode enabled, keep moving.",
      "Your energy is visibly up."
    ],
    phraseFeed: [
      "Snack received, joy maxed out.",
      "Thanks for taking care of me.",
      "With snacks, everything flows better."
    ],
    phraseMorning: [
      "Good morning. Let us move with calm focus.",
      "Fresh start, clear mind, steady progress."
    ],
    phraseNight: [
      "Calm finish. Great work today.",
      "Night focus: one thing at a time."
    ],
    phraseDeepFocus: [
      "Deep focus block is active.",
      "Quiet mode inside, full execution."
    ]
  }
} as const;

const defaultSettings: Settings = {
  language: "es",
  avatarStyle: "cloud",
  phraseFrequencySec: 110,
  opacity: 1,
  size: 1,
  mode: "study",
  alwaysOnTop: true,
  systemMusicDetect: false,
  musicReactive: true,
  pomodoroPreset: "25-5",
  customFocusMin: 30,
  customBreakMin: 5,
  autoHideEnabled: false,
  autoHideSeconds: 12,
};

const assetByAvatarMood: Record<AvatarStyle, Record<Mood, string>> = {
  blob: {
    happy: "/avatars/blob/happy.svg",
    focus: "/avatars/blob/focus.svg",
    tired: "/avatars/blob/tired.svg",
    break: "/avatars/blob/break.svg",
    celebrate: "/avatars/blob/celebrate.svg",
  },
  cat: {
    happy: "/avatars/cat/happy.svg",
    focus: "/avatars/cat/focus.svg",
    tired: "/avatars/cat/tired.svg",
    break: "/avatars/cat/break.svg",
    celebrate: "/avatars/cat/celebrate.svg",
  },
  bunny: {
    happy: "/avatars/bunny/happy.svg",
    focus: "/avatars/bunny/focus.svg",
    tired: "/avatars/bunny/tired.svg",
    break: "/avatars/bunny/break.svg",
    celebrate: "/avatars/bunny/celebrate.svg",
  },
  fox: {
    happy: "/avatars/fox/happy.svg",
    focus: "/avatars/fox/focus.svg",
    tired: "/avatars/fox/tired.svg",
    break: "/avatars/fox/break.svg",
    celebrate: "/avatars/fox/celebrate.svg",
  },
  cloud: {
    happy: "/avatars/cloud/happy.svg",
    focus: "/avatars/cloud/focus.svg",
    tired: "/avatars/cloud/tired.svg",
    break: "/avatars/cloud/break.svg",
    celebrate: "/avatars/cloud/celebrate.svg",
  },
  pixel: {
    happy: "/avatars/pixel/happy.svg",
    focus: "/avatars/pixel/focus.svg",
    tired: "/avatars/pixel/tired.svg",
    break: "/avatars/pixel/break.svg",
    celebrate: "/avatars/pixel/celebrate.svg",
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function randomPick<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
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
      phraseFrequencySec: clamp(parsed.phraseFrequencySec ?? 85, 20, 300),
      opacity: clamp(parsed.opacity ?? 1, 0.55, 1),
      size: clamp(parsed.size ?? 1, 0.8, 1.4),
      customFocusMin: clamp(parsed.customFocusMin ?? 30, 5, 120),
      customBreakMin: clamp(parsed.customBreakMin ?? 5, 1, 30),
      autoHideSeconds: clamp(parsed.autoHideSeconds ?? 6, 3, 30),
    };
  } catch {
    return defaultSettings;
  }
}

function getDurations(settings: Settings): { focusSec: number; breakSec: number } {
  if (settings.pomodoroPreset === "50-10") {
    return { focusSec: 50 * 60, breakSec: 10 * 60 };
  }

  if (settings.pomodoroPreset === "custom") {
    return {
      focusSec: settings.customFocusMin * 60,
      breakSec: settings.customBreakMin * 60,
    };
  }

  return { focusSec: 25 * 60, breakSec: 5 * 60 };
}

function playSoftBeep(): void {
  try {
    const audioContextRef = (window as Window & { __amiwiAudioCtx?: AudioContext });
    const ctx = audioContextRef.__amiwiAudioCtx ?? new window.AudioContext();
    audioContextRef.__amiwiAudioCtx = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 720;
    gain.gain.value = 0.04;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch {
    // Ignore if unavailable.
  }
}

function resolveAsset(path: string): string {
  const clean = path.replace(/^\//, "");
  return `${import.meta.env.BASE_URL}${clean}`;
}

function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [showPanel, setShowPanel] = useState(false);
  const [mood, setMood] = useState<Mood>("happy");
  const [phrase, setPhrase] = useState("");
  const [phraseTick, setPhraseTick] = useState(0);
  const [systemMusicActive, setSystemMusicActive] = useState(false);
  const [systemMusicSource, setSystemMusicSource] = useState("");
  const [avatarBroken, setAvatarBroken] = useState(false);

  const [musicTrackUrl, setMusicTrackUrl] = useState("");
  const [musicTrackName, setMusicTrackName] = useState("");
  const [musicPlaying, setMusicPlaying] = useState(false);

  const durations = useMemo(() => getDurations(settings), [settings]);
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusPhase, setFocusPhase] = useState<FocusPhase>("focus");
  const [remainingSeconds, setRemainingSeconds] = useState(durations.focusSec);

  const [dormant, setDormant] = useState(false);
  const [clickThroughActive, setClickThroughActive] = useState(false);
  const hideTimerRef = useRef<number | null>(null);
  const pollingRef = useRef(false);
  const interactionThrottleRef = useRef(0);

  const t = copy[settings.language];
  const isMusicActive = settings.musicReactive && (musicPlaying || systemMusicActive);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    void getCurrentWindow().setAlwaysOnTop(settings.alwaysOnTop).catch(() => undefined);
  }, [settings.alwaysOnTop]);

  useEffect(() => {
    if (!focusRunning) {
      setRemainingSeconds(durations.focusSec);
      setFocusPhase("focus");
    }
  }, [durations.focusSec, focusRunning]);

  const emitPhrase = (text: string): void => {
    setPhrase(text);
    setPhraseTick((prev) => prev + 1);
  };

  const getSmartPhrasePool = (): readonly string[] => {
    const hour = new Date().getHours();

    if (isMusicActive) {
      return t.phraseMusic;
    }

    if (focusRunning && focusPhase === "focus") {
      return t.phraseDeepFocus;
    }

    if (hour >= 6 && hour < 11) {
      return t.phraseMorning;
    }

    if (hour >= 21 || hour < 5) {
      return t.phraseNight;
    }

    if (settings.mode === "study") {
      return t.phraseStudy;
    }

    if (settings.mode === "work") {
      return t.phraseWork;
    }

    return t.phraseBreak;
  };

  useEffect(() => {
    const pool = getSmartPhrasePool();
    emitPhrase(randomPick(pool));

    if (isMusicActive) {
      setMood("celebrate");
      return;
    }

    if (settings.mode === "study") {
      setMood("focus");
      return;
    }

    if (settings.mode === "work") {
      setMood("happy");
      return;
    }

    setMood("break");
  }, [isMusicActive, settings.mode, focusRunning, focusPhase]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      emitPhrase(randomPick(getSmartPhrasePool()));
    }, settings.phraseFrequencySec * 1000);

    return () => window.clearInterval(timer);
  }, [settings.phraseFrequencySec, isMusicActive, settings.mode, focusRunning, focusPhase]);

  useEffect(() => {
    if (!settings.systemMusicDetect) {
      setSystemMusicActive(false);
      setSystemMusicSource("");
      return;
    }

    let active = true;

    const check = async () => {
      if (pollingRef.current) {
        return;
      }

      pollingRef.current = true;
      try {
        const timeout = new Promise<MusicDetection>((resolve) => {
          window.setTimeout(() => {
            resolve({ active: false, source: "", method: "timeout" });
          }, 1500);
        });

        const detection = invoke<MusicDetection>("detect_system_music");
        const res = await Promise.race([detection, timeout]);
        if (!active) {
          return;
        }

        setSystemMusicActive(res.active);
        setSystemMusicSource(res.source);
      } catch {
        if (!active) {
          return;
        }

        setSystemMusicActive(false);
        setSystemMusicSource("");
      } finally {
        pollingRef.current = false;
      }
    };

    void check();
    const timer = window.setInterval(() => {
      void check();
    }, 20_000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [settings.systemMusicDetect]);

  useEffect(() => {
    if (!focusRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        playSoftBeep();

        if (focusPhase === "focus") {
          setFocusPhase("break");
          setMood("celebrate");
          emitPhrase(randomPick(t.phraseBreak));
          return durations.breakSec;
        }

        setFocusPhase("focus");
        setMood("focus");
        emitPhrase(randomPick(t.phraseDeepFocus));
        return durations.focusSec;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [durations.breakSec, durations.focusSec, focusPhase, focusRunning, t]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, [settings.autoHideEnabled, settings.autoHideSeconds, showPanel]);

  useEffect(() => {
    const shouldIgnore = clickThroughActive && dormant && !showPanel;
    void getCurrentWindow().setIgnoreCursorEvents(shouldIgnore).catch(() => undefined);

    return () => {
      void getCurrentWindow().setIgnoreCursorEvents(false).catch(() => undefined);
    };
  }, [clickThroughActive, dormant, showPanel]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]): void => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const registerInteraction = useCallback((): void => {
    const now = Date.now();
    const shouldThrottle = now - interactionThrottleRef.current < 180 && !dormant;
    if (shouldThrottle) {
      return;
    }
    interactionThrottleRef.current = now;

    if (dormant) {
      setDormant(false);
    }

    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (settings.autoHideEnabled && !showPanel) {
      hideTimerRef.current = window.setTimeout(() => {
        setDormant(true);
      }, settings.autoHideSeconds * 1000);
    }
  }, [dormant, settings.autoHideEnabled, settings.autoHideSeconds, showPanel]);

  useEffect(() => {
    registerInteraction();
  }, [registerInteraction]);

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

  const handleFeed = () => {
    setMood("celebrate");
    emitPhrase(randomPick(t.phraseFeed));
  };

  const quickStartFocus = () => {
    setFocusRunning((prev) => {
      if (prev) {
        setFocusPhase("focus");
        setRemainingSeconds(durations.focusSec);
        setMood("happy");
        return false;
      }

      setFocusPhase("focus");
      setRemainingSeconds(durations.focusSec);
      setMood("focus");
      update("mode", "study");
      return true;
    });
  };

  const activateClickThroughPulse = () => {
    setClickThroughActive(true);
    emitPhrase(t.clickThroughHint);
    window.setTimeout(() => {
      setClickThroughActive(false);
    }, 8000);
  };

  const avatarAsset = useMemo(
    () => resolveAsset(assetByAvatarMood[settings.avatarStyle][mood]),
    [settings.avatarStyle, mood]
  );

  useEffect(() => {
    setAvatarBroken(false);
  }, [settings.avatarStyle, mood]);

  return (
    <main
      className={`glass-shell ${dormant ? "dormant" : ""}`}
      style={{ opacity: settings.opacity }}
      onMouseMove={registerInteraction}
      onMouseEnter={registerInteraction}
      onMouseDown={registerInteraction}
    >
      <div className="glass-header">
        <div className="drag-region" data-tauri-drag-region>
          <strong>{t.title}</strong>
          <small>{t.subtitle}</small>
        </div>
        <div className="window-controls">
          <button type="button" className="chip" onClick={() => setShowPanel((prev) => !prev)}>{t.settings}</button>
          <button type="button" className="win" onClick={() => void getCurrentWindow().minimize()}>_</button>
          <button type="button" className="win" onClick={() => void getCurrentWindow().toggleMaximize()}>□</button>
          <button type="button" className="win close" onClick={() => void getCurrentWindow().close()}>✕</button>
        </div>
      </div>

      <section className="widget-body" style={{ transform: `scale(${settings.size})` }}>
        {!avatarBroken ? (
          <img
            className={`avatar ${isMusicActive ? "music-react" : ""} ${focusRunning ? "focus-float" : ""}`}
            src={avatarAsset}
            alt={`${settings.avatarStyle}-${mood}`}
            loading="eager"
            decoding="async"
            onError={() => setAvatarBroken(true)}
          />
        ) : (
          <div className="avatar-fallback" aria-label="avatar-fallback">o(=^.^=)o</div>
        )}

        <div key={phraseTick} className="floating-phrase">
          {phrase}
        </div>

        <div className="quick-row">
          <button type="button" className="chip" onClick={() => quickStartFocus()}>{focusRunning ? t.stop : t.start}</button>
          <span className="timer-pill">{focusPhase === "focus" ? "🍅" : "☕"} {formatMMSS(remainingSeconds)}</span>
          <button type="button" className="chip" onClick={handleFeed}>{t.feed}</button>
        </div>

        <div className="music-pill">
          {t.nowPlaying}: {isMusicActive ? (systemMusicSource || musicTrackName || "active") : t.noMusic}
        </div>
      </section>

      {showPanel && (
        <section className="settings-panel">
          <label>
            {t.language}
            <select value={settings.language} onChange={(event) => update("language", event.currentTarget.value as Lang)}>
              <option value="es">Espanol</option>
              <option value="en">English</option>
            </select>
          </label>

          <label>
            {t.avatar}
            <select value={settings.avatarStyle} onChange={(event) => update("avatarStyle", event.currentTarget.value as AvatarStyle)}>
              <option value="cloud">Cloud</option>
              <option value="pixel">Pixel</option>
              <option value="blob">Blob</option>
              <option value="cat">Cat</option>
              <option value="bunny">Bunny</option>
              <option value="fox">Fox</option>
            </select>
          </label>

          <label>
            {t.mode}
            <select value={settings.mode} onChange={(event) => update("mode", event.currentTarget.value as Mode)}>
              <option value="study">{t.focus}</option>
              <option value="work">{t.work}</option>
              <option value="break">{t.rest}</option>
            </select>
          </label>

          <label>
            {t.preset}
            <select value={settings.pomodoroPreset} onChange={(event) => update("pomodoroPreset", event.currentTarget.value as PomodoroPreset)}>
              <option value="25-5">25 / 5</option>
              <option value="50-10">50 / 10</option>
              <option value="custom">Custom</option>
            </select>
          </label>

          {settings.pomodoroPreset === "custom" && (
            <>
              <label>
                {t.focusMin}: {settings.customFocusMin}
                <input type="range" min={5} max={120} value={settings.customFocusMin} onChange={(event) => update("customFocusMin", Number(event.currentTarget.value))} />
              </label>
              <label>
                {t.breakMin}: {settings.customBreakMin}
                <input type="range" min={1} max={30} value={settings.customBreakMin} onChange={(event) => update("customBreakMin", Number(event.currentTarget.value))} />
              </label>
            </>
          )}

          <label>
            {t.phraseFreq}: {settings.phraseFrequencySec}s
            <input type="range" min={20} max={300} value={settings.phraseFrequencySec} onChange={(event) => update("phraseFrequencySec", Number(event.currentTarget.value))} />
          </label>

          <label>
            {t.opacity}: {settings.opacity.toFixed(2)}
            <input type="range" min={0.55} max={1} step={0.05} value={settings.opacity} onChange={(event) => update("opacity", Number(event.currentTarget.value))} />
          </label>

          <label>
            {t.size}: {settings.size.toFixed(2)}x
            <input type="range" min={0.8} max={1.4} step={0.05} value={settings.size} onChange={(event) => update("size", Number(event.currentTarget.value))} />
          </label>

          <label className="toggle-row">
            <input type="checkbox" checked={settings.alwaysOnTop} onChange={(event) => update("alwaysOnTop", event.currentTarget.checked)} />
            {t.alwaysOnTop}
          </label>

          <label className="toggle-row">
            <input type="checkbox" checked={settings.systemMusicDetect} onChange={(event) => update("systemMusicDetect", event.currentTarget.checked)} />
            {t.detectSystemMusic}
          </label>

          <label className="toggle-row">
            <input type="checkbox" checked={settings.musicReactive} onChange={(event) => update("musicReactive", event.currentTarget.checked)} />
            {t.reactMusic}
          </label>

          <label className="toggle-row">
            <input type="checkbox" checked={settings.autoHideEnabled} onChange={(event) => update("autoHideEnabled", event.currentTarget.checked)} />
            {t.autoHide}
          </label>

          {settings.autoHideEnabled && (
            <label>
              {t.autoHideSec}: {settings.autoHideSeconds}s
              <input type="range" min={3} max={30} value={settings.autoHideSeconds} onChange={(event) => update("autoHideSeconds", Number(event.currentTarget.value))} />
            </label>
          )}

          <label>
            {t.uploadTrack}
            <input type="file" accept="audio/*" onChange={handleMusicFile} />
          </label>

          <audio controls src={musicTrackUrl} onPlay={() => setMusicPlaying(true)} onPause={() => setMusicPlaying(false)} onEnded={() => setMusicPlaying(false)} />

          <div className="panel-footer">
            <button type="button" className="chip" onClick={activateClickThroughPulse}>{t.clickThroughPulse}</button>
            <button type="button" className="chip" onClick={() => setShowPanel(false)}>{t.close}</button>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
