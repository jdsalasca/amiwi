import { MouseEvent as ReactMouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { LogicalSize, PhysicalPosition } from "@tauri-apps/api/dpi";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow, monitorFromPoint } from "@tauri-apps/api/window";
import { assetByAvatarMood } from "./domain/assets";
import { copy, STORAGE_KEY } from "./domain/config";
import type { BubbleModuleId, FocusPhase, MusicDetection, Mood, PomodoroPreset, Settings } from "./domain/types";
import { clamp, formatMMSS, loadSettings, randomPick, resolveAsset } from "./utils/helpers";
import "./App.css";

type BubbleAction = {
  id: BubbleModuleId;
  icon: string;
  label: string;
  onClick: () => void;
  onPointerDown?: (event: React.PointerEvent<HTMLButtonElement>) => void;
  pulse?: boolean;
};

const WINDOW_POSITION_KEY = `${STORAGE_KEY}.window.positionByMonitor`;
const DAILY_STATS_KEY = `${STORAGE_KEY}.daily.stats`;
const ONBOARDING_KEY = `${STORAGE_KEY}.onboarding.v1`;

type DailyStats = {
  date: string;
  focusStarts: number;
  snacks: number;
};

function getDurations(settings: Settings): { focusSec: number; breakSec: number } {
  if (settings.pomodoroPreset === "50-10") {
    return { focusSec: 50 * 60, breakSec: 10 * 60 };
  }
  if (settings.pomodoroPreset === "custom") {
    return { focusSec: settings.customFocusMin * 60, breakSec: settings.customBreakMin * 60 };
  }
  return { focusSec: 25 * 60, breakSec: 5 * 60 };
}

function playSoftBeep(): void {
  try {
    const audioContextRef = window as Window & { __amiwiAudioCtx?: AudioContext };
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
    // noop
  }
}

function monitorStorageKey(monitor: { name: string | null; position: { x: number; y: number }; size: { width: number; height: number } }): string {
  return `${monitor.name ?? "monitor"}:${monitor.position.x},${monitor.position.y}:${monitor.size.width}x${monitor.size.height}`;
}

function loadStoredWindowPositions(): Record<string, { x: number; y: number }> {
  const raw = localStorage.getItem(WINDOW_POSITION_KEY);
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, { x: number; y: number }>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadDailyStats(): DailyStats {
  const fallback: DailyStats = { date: todayIsoDate(), focusStarts: 0, snacks: 0 };
  const raw = localStorage.getItem(DAILY_STATS_KEY);
  if (!raw) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<DailyStats>;
    const parsedDate = typeof parsed.date === "string" ? parsed.date : fallback.date;
    if (parsedDate !== fallback.date) {
      return fallback;
    }
    return {
      date: parsedDate,
      focusStarts: Number.isFinite(parsed.focusStarts) ? Number(parsed.focusStarts) : 0,
      snacks: Number.isFinite(parsed.snacks) ? Number(parsed.snacks) : 0,
    };
  } catch {
    return fallback;
  }
}

function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [showPanel, setShowPanel] = useState(false);
  const [mood, setMood] = useState<Mood>("happy");
  const [phrase, setPhrase] = useState("");
  const [phraseTick, setPhraseTick] = useState(0);
  const [musicPulsePhrase, setMusicPulsePhrase] = useState("");
  const [systemMusicActive, setSystemMusicActive] = useState(false);
  const [systemMusicSource, setSystemMusicSource] = useState("");
  const [systemMusicMethod, setSystemMusicMethod] = useState("none");
  const [systemMusicTrusted, setSystemMusicTrusted] = useState(false);
  const [musicEnergy, setMusicEnergy] = useState(0);
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusPhase, setFocusPhase] = useState<FocusPhase>("focus");
  const [dormant, setDormant] = useState(false);
  const [clickThroughActive, setClickThroughActive] = useState(false);
  const [dailyStats, setDailyStats] = useState<DailyStats>(() => loadDailyStats());
  const [pointerGlow, setPointerGlow] = useState({ x: 50, y: 22 });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<"focus" | "calm" | "cozy">("focus");

  const durations = useMemo(() => getDurations(settings), [settings]);
  const [remainingSeconds, setRemainingSeconds] = useState(durations.focusSec);

  const hideTimerRef = useRef<number | null>(null);
  const pollingRef = useRef(false);
  const interactionThrottleRef = useRef(0);
  const windowDragUntilRef = useRef(0);
  const widgetBodyRef = useRef<HTMLElement | null>(null);

  const t = copy[settings.language];
  const isMusicActive = settings.musicReactive && systemMusicActive;
  const themeBaseHue = settings.themePreset === "mint" ? 165 : settings.themePreset === "rose" ? 345 : 205;
  const activeHue = Math.round(themeBaseHue + musicEnergy * 70);
  const globalShortcutLabel = navigator.platform.toLowerCase().includes("mac")
    ? "Cmd+Shift+A"
    : "Ctrl+Shift+A (fallback Ctrl+Alt+A)";

  const stageWidth = widgetBodyRef.current?.clientWidth ?? 240;
  const stageHeight = widgetBodyRef.current?.clientHeight ?? 220;
  const position = useMemo(
    () => ({ x: clamp((stageWidth - 150) / 2, 0, stageWidth - 150), y: clamp((stageHeight - 122) / 2, 0, stageHeight - 122) }),
    [stageHeight, stageWidth]
  );
  const mascotCenterX = clamp(position.x + 75, 24, stageWidth - 24);
  const phraseY = clamp(position.y - 38, 0, stageHeight - 38);
  const actionY = clamp(position.y + 116, 0, stageHeight - 36);
  const timerX = clamp(stageWidth / 2, 26, stageWidth - 26);
  const timerY = 22;
  const musicX = clamp(position.x + 115, 24, stageWidth - 24);
  const musicY = clamp(position.y + 10, 4, stageHeight - 28);
  const phaseTotalSeconds = focusPhase === "focus" ? durations.focusSec : durations.breakSec;
  const phaseProgress = clamp(1 - remainingSeconds / Math.max(phaseTotalSeconds, 1), 0, 1);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(dailyStats));
  }, [dailyStats]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const today = todayIsoDate();
      setDailyStats((prev) => (prev.date === today ? prev : { date: today, focusStarts: 0, snacks: 0 }));
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen) {
      setShowOnboarding(true);
      setOnboardingStep(0);
    }
  }, []);

  useEffect(() => {
    void getCurrentWindow().setAlwaysOnTop(settings.alwaysOnTop).catch(() => undefined);
  }, [settings.alwaysOnTop]);

  useEffect(() => {
    const appWindow = getCurrentWindow();
    const target = showPanel ? new LogicalSize(420, 520) : new LogicalSize(240, 260);
    void appWindow.setSize(target).catch(() => undefined);
    void appWindow.setResizable(showPanel).catch(() => undefined);
  }, [showPanel]);

  useEffect(() => {
    if (!focusRunning) {
      setRemainingSeconds(durations.focusSec);
      setFocusPhase("focus");
    }
  }, [durations.focusSec, focusRunning]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]): void => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const bumpDailyMetric = useCallback((metric: "focusStarts" | "snacks") => {
    const today = todayIsoDate();
    setDailyStats((prev) => {
      const base = prev.date === today ? prev : { date: today, focusStarts: 0, snacks: 0 };
      return { ...base, [metric]: base[metric] + 1 };
    });
  }, []);

  const emitPhrase = (text: string): void => {
    setPhrase(text);
    setPhraseTick((prev) => prev + 1);
  };

  const smartPhrasePool = useCallback((): readonly string[] => {
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
  }, [focusPhase, focusRunning, isMusicActive, settings.mode, t]);

  useEffect(() => {
    emitPhrase(randomPick(smartPhrasePool()));
    if (isMusicActive) {
      setMood("celebrate");
      return;
    }
    setMood(settings.mode === "study" ? "focus" : settings.mode === "work" ? "happy" : "break");
  }, [isMusicActive, settings.mode, smartPhrasePool]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      emitPhrase(randomPick(smartPhrasePool()));
    }, settings.phraseFrequencySec * 1000);
    return () => window.clearInterval(timer);
  }, [settings.phraseFrequencySec, smartPhrasePool]);

  useEffect(() => {
    if (!isMusicActive) {
      setMusicPulsePhrase("");
      return;
    }
    setMusicPulsePhrase("♪");
    const timer = window.setInterval(() => {
      setMusicPulsePhrase(randomPick(t.phraseMusic));
    }, 9000);
    return () => window.clearInterval(timer);
  }, [isMusicActive, t.phraseMusic]);

  useEffect(() => {
    if (!settings.systemMusicDetect) {
      setSystemMusicActive(false);
      setSystemMusicSource("");
      setSystemMusicMethod("disabled");
      setSystemMusicTrusted(false);
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
          window.setTimeout(() => resolve({ active: false, source: "", method: "timeout" }), 1500);
        });
        const detection = invoke<MusicDetection>("detect_system_music");
        const res = await Promise.race([detection, timeout]);
        if (!active) {
          return;
        }
        const nativeMethod = ["windows_gsmtc", "applescript_native", "itunes_com"].some((method) => res.method.includes(method));
        const accepted = nativeMethod && res.active;
        setSystemMusicMethod(res.method || "unknown");
        setSystemMusicTrusted(nativeMethod);
        setSystemMusicActive(accepted);
        setSystemMusicSource(accepted ? res.source : "");
      } catch {
        if (active) {
          setSystemMusicActive(false);
          setSystemMusicSource("");
          setSystemMusicMethod("error");
          setSystemMusicTrusted(false);
        }
      } finally {
        pollingRef.current = false;
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), 12_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [settings.systemMusicDetect]);

  useEffect(() => {
    if (!settings.musicAmbient) {
      setMusicEnergy(0);
      return;
    }
    if (!systemMusicActive) {
      setMusicEnergy(0);
      return;
    }
    const timer = window.setInterval(() => {
      const wave = 0.34 + 0.2 * Math.sin(Date.now() / 480);
      setMusicEnergy((prev) => (Math.abs(prev - wave) > 0.02 ? wave : prev));
    }, 180);
    return () => window.clearInterval(timer);
  }, [settings.musicAmbient, systemMusicActive]);

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
  }, [durations.breakSec, durations.focusSec, focusPhase, focusRunning, t.phraseBreak, t.phraseDeepFocus]);

  useEffect(() => {
    const shouldIgnore = !showPanel && (settings.clickThroughPermanent || (clickThroughActive && dormant));
    void getCurrentWindow().setIgnoreCursorEvents(shouldIgnore).catch(() => undefined);
    return () => {
      void getCurrentWindow().setIgnoreCursorEvents(false).catch(() => undefined);
    };
  }, [clickThroughActive, dormant, settings.clickThroughPermanent, showPanel]);

  const registerInteraction = useCallback((): void => {
    const now = Date.now();
    if (now - interactionThrottleRef.current < 180 && !dormant) {
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
      hideTimerRef.current = window.setTimeout(() => setDormant(true), settings.autoHideSeconds * 1000);
    }
  }, [dormant, settings.autoHideEnabled, settings.autoHideSeconds, showPanel]);

  useEffect(() => {
    registerInteraction();
    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, [registerInteraction]);

  useEffect(() => {
    let disposed = false;
    const unlistenPromise = listen("amiwi://toggle-settings", async () => {
      if (disposed) {
        return;
      }
      const appWindow = getCurrentWindow();
      await appWindow.show().catch(() => undefined);
      await appWindow.unminimize().catch(() => undefined);
      await appWindow.setFocus().catch(() => undefined);
      setShowPanel((prev) => !prev);
      registerInteraction();
    });
    return () => {
      disposed = true;
      void unlistenPromise.then((unlisten) => unlisten()).catch(() => undefined);
    };
  }, [registerInteraction]);

  useEffect(() => {
    if (!settings.snapToEdgeEnabled) {
      return;
    }

    const appWindow = getCurrentWindow();
    let disposed = false;
    let moveTimeout: number | null = null;

    const persistByMonitor = async (x: number, y: number) => {
      const size = await appWindow.outerSize();
      const monitor = await monitorFromPoint(x + Math.floor(size.width / 2), y + Math.floor(size.height / 2));
      if (!monitor) {
        return;
      }
      const key = monitorStorageKey(monitor);
      const map = loadStoredWindowPositions();
      map[key] = { x, y };
      localStorage.setItem(WINDOW_POSITION_KEY, JSON.stringify(map));
    };

    const snapToClosestEdge = async () => {
      if (disposed || showPanel) {
        return;
      }
      const [pos, size] = await Promise.all([appWindow.outerPosition(), appWindow.outerSize()]);
      const centerX = pos.x + Math.floor(size.width / 2);
      const centerY = pos.y + Math.floor(size.height / 2);
      const monitor = await monitorFromPoint(centerX, centerY);
      if (!monitor) {
        return;
      }
      const area = monitor.workArea;
      const minX = area.position.x + settings.snapMarginPx;
      const maxX = area.position.x + area.size.width - size.width - settings.snapMarginPx;
      const minY = area.position.y + settings.snapMarginPx;
      const maxY = area.position.y + area.size.height - size.height - settings.snapMarginPx;
      const leftDistance = Math.abs(pos.x - minX);
      const rightDistance = Math.abs(maxX - pos.x);
      const topDistance = Math.abs(pos.y - minY);
      const bottomDistance = Math.abs(maxY - pos.y);
      const minDistance = Math.min(leftDistance, rightDistance, topDistance, bottomDistance);

      let targetX = clamp(pos.x, minX, maxX);
      let targetY = clamp(pos.y, minY, maxY);

      if (minDistance === leftDistance) {
        targetX = minX;
      } else if (minDistance === rightDistance) {
        targetX = maxX;
      } else if (minDistance === topDistance) {
        targetY = minY;
      } else {
        targetY = maxY;
      }

      if (Math.abs(targetX - pos.x) <= 1 && Math.abs(targetY - pos.y) <= 1) {
        await persistByMonitor(pos.x, pos.y);
        return;
      }

      await appWindow.setPosition(new PhysicalPosition(targetX, targetY)).catch(() => undefined);
      await persistByMonitor(targetX, targetY);
    };

    const restoreForMonitor = async () => {
      const [pos, size] = await Promise.all([appWindow.outerPosition(), appWindow.outerSize()]);
      const monitor = await monitorFromPoint(pos.x + Math.floor(size.width / 2), pos.y + Math.floor(size.height / 2));
      if (!monitor) {
        return;
      }
      const map = loadStoredWindowPositions();
      const remembered = map[monitorStorageKey(monitor)];
      if (!remembered) {
        return;
      }
      await appWindow.setPosition(new PhysicalPosition(remembered.x, remembered.y)).catch(() => undefined);
    };

    void restoreForMonitor();
    const unlistenPromise = appWindow.onMoved(() => {
      if (showPanel) {
        return;
      }
      if (Date.now() < windowDragUntilRef.current) {
        windowDragUntilRef.current = Date.now() + 500;
        return;
      }
      if (moveTimeout !== null) {
        window.clearTimeout(moveTimeout);
      }
      moveTimeout = window.setTimeout(() => {
        void snapToClosestEdge();
      }, 420);
    });

    return () => {
      disposed = true;
      if (moveTimeout !== null) {
        window.clearTimeout(moveTimeout);
      }
      void unlistenPromise.then((unlisten) => unlisten()).catch(() => undefined);
    };
  }, [settings.snapMarginPx, settings.snapToEdgeEnabled, showPanel]);

  const quickStartFocus = useCallback(() => {
    setFocusRunning((prev) => {
      if (prev) {
        setFocusPhase("focus");
        setRemainingSeconds(durations.focusSec);
        setMood("happy");
        return false;
      }
      bumpDailyMetric("focusStarts");
      setFocusPhase("focus");
      setRemainingSeconds(durations.focusSec);
      setMood("focus");
      update("mode", "study");
      return true;
    });
  }, [bumpDailyMetric, durations.focusSec]);

  const handleFeed = useCallback(() => {
    bumpDailyMetric("snacks");
    setMood("celebrate");
    emitPhrase(randomPick(t.phraseFeed));
  }, [bumpDailyMetric, t.phraseFeed]);

  const startWindowDrag = useCallback((event?: React.PointerEvent<HTMLElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    registerInteraction();
    windowDragUntilRef.current = Date.now() + 1800;
    void getCurrentWindow().startDragging().catch(() => undefined);
  }, [registerInteraction]);

  const handleMascotPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    startWindowDrag(event);
  };

  const bubbleActions: BubbleAction[] = useMemo(() => {
    const all: BubbleAction[] = [
      { id: "focus", icon: focusRunning ? "■" : "▶", label: t.bubbleFocus, onClick: quickStartFocus },
      { id: "feed", icon: "🍪", label: t.bubbleFeed, onClick: handleFeed },
      { id: "phrase", icon: "💬", label: t.bubblePhrase, onClick: () => emitPhrase(randomPick(smartPhrasePool())) },
      {
        id: "music",
        icon: "♪",
        label: t.bubbleMusic,
        onClick: () => update("musicAmbient", !settings.musicAmbient),
        pulse: isMusicActive
      },
      {
        id: "move",
        icon: "↕",
        label: t.bubbleMove,
        onClick: () => undefined,
        onPointerDown: (event) => startWindowDrag(event),
      },
      { id: "settings", icon: "⚙", label: t.bubbleSettings, onClick: () => setShowPanel(true) },
    ];
    return all.filter((action) => settings.bubbleModules[action.id]);
  }, [focusRunning, handleFeed, isMusicActive, quickStartFocus, settings.bubbleModules, settings.musicAmbient, smartPhrasePool, startWindowDrag, t, update]);

  const applyExperienceProfile = useCallback((profile: "focus" | "calm" | "cozy") => {
    setSelectedProfile(profile);
    if (profile === "focus") {
      setSettings((prev) => ({
        ...prev,
        themePreset: "ocean",
        mode: "study",
        phraseFrequencySec: 85,
        autoHideEnabled: true,
        autoHideSeconds: 8,
      }));
      emitPhrase(randomPick(t.phraseDeepFocus));
      return;
    }
    if (profile === "calm") {
      setSettings((prev) => ({
        ...prev,
        themePreset: "mint",
        mode: "work",
        phraseFrequencySec: 130,
        autoHideEnabled: true,
        autoHideSeconds: 14,
      }));
      emitPhrase(randomPick(t.phraseWork));
      return;
    }
    setSettings((prev) => ({
      ...prev,
      themePreset: "rose",
      mode: "break",
      phraseFrequencySec: 170,
      autoHideEnabled: false,
      musicAmbient: false,
    }));
    emitPhrase(randomPick(t.phraseBreak));
  }, [t.phraseBreak, t.phraseDeepFocus, t.phraseWork]);

  const activateClickThroughPulse = () => {
    setClickThroughActive(true);
    emitPhrase(t.clickThroughHint);
    window.setTimeout(() => setClickThroughActive(false), 8000);
  };

  const avatarAsset = useMemo(() => resolveAsset(assetByAvatarMood[settings.avatarStyle][mood]), [settings.avatarStyle, mood]);
  const fallbackAvatarAsset = useMemo(() => resolveAsset(assetByAvatarMood.cloud.happy), []);

  const openOrCloseSettings = (event: ReactMouseEvent<HTMLImageElement | HTMLDivElement>) => {
    event.preventDefault();
    setShowPanel((prev) => !prev);
  };

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "done");
    setShowOnboarding(false);
    setOnboardingStep(0);
    emitPhrase(randomPick(smartPhrasePool()));
  };

  const handleShellMouseMove = (event: ReactMouseEvent<HTMLElement>) => {
    registerInteraction();
    const rect = event.currentTarget.getBoundingClientRect();
    const x = clamp(((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100, 0, 100);
    const y = clamp(((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100, 0, 100);
    setPointerGlow((prev) => (
      Math.abs(prev.x - x) > 0.6 || Math.abs(prev.y - y) > 0.6 ? { x, y } : prev
    ));
  };

  return (
    <main
      className={`glass-shell theme-${settings.themePreset} ${!showPanel ? "mascot-only" : ""} ${focusRunning ? "focus-running" : ""} ${dormant ? "dormant" : ""} ${settings.ultraMinimal ? "ultra-minimal" : ""}`}
      style={{
        opacity: settings.opacity,
        ["--accent-hue" as string]: `${activeHue}`,
        ["--music-energy" as string]: `${musicEnergy.toFixed(2)}`,
        ["--glass-x" as string]: `${pointerGlow.x.toFixed(1)}%`,
        ["--glass-y" as string]: `${pointerGlow.y.toFixed(1)}%`,
      }}
      onMouseMove={handleShellMouseMove}
      onMouseEnter={registerInteraction}
      onMouseDown={registerInteraction}
    >
      {(!settings.ultraMinimal || showPanel) && (
        <div className="glass-header">
          <div className="drag-region" data-tauri-drag-region>
            <strong>{t.title}</strong>
            <small>{t.subtitle}</small>
          </div>
          <div className="window-controls">
            <button type="button" className="chip" onClick={() => setShowPanel((prev) => !prev)}>⚙</button>
            <button type="button" className="win" onClick={() => void getCurrentWindow().minimize()}>_</button>
            <button type="button" className="win close" onClick={() => void getCurrentWindow().close()}>✕</button>
          </div>
        </div>
      )}

      <section ref={widgetBodyRef} className="widget-body" style={{ transform: `scale(${settings.size})` }}>
        <div className="impact-pill">
          🔥 {dailyStats.focusStarts} foco | 🍪 {dailyStats.snacks}
        </div>

        <div className="mascot-draggable" style={{ left: `${position.x}px`, top: `${position.y}px` }} onPointerDown={handleMascotPointerDown}>
          <img
            className={`avatar ${isMusicActive ? "music-react" : ""} ${focusRunning ? "focus-float" : ""}`}
            src={avatarAsset}
            alt={`${settings.avatarStyle}-${mood}`}
            loading="eager"
            decoding="async"
            onDoubleClick={quickStartFocus}
            onContextMenu={openOrCloseSettings}
            onError={(event) => {
              if (event.currentTarget.dataset.fallbackApplied === "1") {
                return;
              }
              event.currentTarget.dataset.fallbackApplied = "1";
              event.currentTarget.src = fallbackAvatarAsset;
            }}
          />
        </div>

        <div key={phraseTick} className="floating-phrase" style={{ left: `${mascotCenterX}px`, top: `${phraseY}px` }}>
          {phrase}
        </div>

        {!showPanel && bubbleActions.length > 0 && (
          <div className="bubble-actions" style={{ left: `${mascotCenterX}px`, top: `${actionY}px` }}>
            {bubbleActions.map((action) => (
              <button
                key={action.id}
                type="button"
                className={`bubble-action ${action.pulse ? "music-pulse" : ""}`}
                title={action.label}
                onPointerDown={action.onPointerDown}
                onClick={action.onClick}
              >
                {action.icon}
              </button>
            ))}
          </div>
        )}

        {settings.showTimerBubble && (
          <div className="timer-bubble" style={{ left: `${timerX}px`, top: `${timerY}px` }}>
            {focusRunning ? (focusPhase === "focus" ? "🍅" : "☕") : "⏱"} {formatMMSS(remainingSeconds)}
          </div>
        )}

        {focusRunning && (
          <div className="session-progress">
            <div className="session-progress-track">
              <div className="session-progress-fill" style={{ width: `${Math.round(phaseProgress * 100)}%` }} />
            </div>
            <span>{Math.round(phaseProgress * 100)}%</span>
          </div>
        )}

        {isMusicActive && settings.musicAmbient && (
          <div className="music-react-bubble" style={{ left: `${musicX}px`, top: `${musicY}px` }}>
            {musicPulsePhrase || "♪"}
          </div>
        )}

        {showPanel && (
          <div className="music-meta">
            <div className="music-pill">
              {t.nowPlaying}: {isMusicActive ? (systemMusicSource || "active") : t.noMusic}
            </div>
            <div className="music-details">
              <span>{t.musicMethod}: {systemMusicMethod}</span>
              <span>{t.musicTrust}: {systemMusicTrusted ? t.musicTrusted : t.musicUntrusted}</span>
            </div>
            {!systemMusicTrusted && settings.systemMusicDetect && <small>{t.musicNativeOnly}</small>}
          </div>
        )}
      </section>

      {showPanel && (
        <section className="settings-panel">
          <label>
            {t.language}
            <select value={settings.language} onChange={(event) => update("language", event.currentTarget.value as Settings["language"])}>
              <option value="es">Espanol</option>
              <option value="en">English</option>
            </select>
          </label>

          <label>
            {t.avatar}
            <select value={settings.avatarStyle} onChange={(event) => update("avatarStyle", event.currentTarget.value as Settings["avatarStyle"])}>
              <option value="cloud">Cloud</option>
              <option value="pixel">Pixel</option>
              <option value="blob">Blob</option>
              <option value="cat">Cat</option>
              <option value="bunny">Bunny</option>
              <option value="fox">Fox</option>
            </select>
          </label>

          <label>
            {t.theme}
            <select value={settings.themePreset} onChange={(event) => update("themePreset", event.currentTarget.value as Settings["themePreset"])}>
              <option value="ocean">Ocean</option>
              <option value="mint">Mint</option>
              <option value="rose">Rose</option>
            </select>
          </label>

          <label>
            Vibe
            <div className="onboarding-row">
              <button type="button" className={`experience-chip ${selectedProfile === "focus" ? "active" : ""}`} onClick={() => applyExperienceProfile("focus")}>Focus</button>
              <button type="button" className={`experience-chip ${selectedProfile === "calm" ? "active" : ""}`} onClick={() => applyExperienceProfile("calm")}>Calm</button>
              <button type="button" className={`experience-chip ${selectedProfile === "cozy" ? "active" : ""}`} onClick={() => applyExperienceProfile("cozy")}>Cozy</button>
            </div>
          </label>

          <label>
            {t.mode}
            <select value={settings.mode} onChange={(event) => update("mode", event.currentTarget.value as Settings["mode"])}>
              <option value="study">{t.focus}</option>
              <option value="work">{t.work}</option>
              <option value="break">{t.rest}</option>
            </select>
          </label>

          <label className="toggle-row"><input type="checkbox" checked={settings.alwaysOnTop} onChange={(event) => update("alwaysOnTop", event.currentTarget.checked)} />{t.alwaysOnTop}</label>
          <label className="toggle-row"><input type="checkbox" checked={settings.systemMusicDetect} onChange={(event) => update("systemMusicDetect", event.currentTarget.checked)} />{t.detectSystemMusic}</label>
          <label className="toggle-row"><input type="checkbox" checked={settings.ultraMinimal} onChange={(event) => update("ultraMinimal", event.currentTarget.checked)} />{t.ultraMinimal}</label>
          <label className="toggle-row"><input type="checkbox" checked={settings.showTimerBubble} onChange={(event) => update("showTimerBubble", event.currentTarget.checked)} />{t.showTimerBubble}</label>
          <label className="toggle-row"><input type="checkbox" checked={settings.musicAmbient} onChange={(event) => update("musicAmbient", event.currentTarget.checked)} />{t.musicAmbient}</label>

          <label>{t.globalShortcut}: {globalShortcutLabel}</label>

          <button type="button" className="chip ghost" onClick={() => { setShowOnboarding(true); setOnboardingStep(0); }}>
            {t.onboardingQuick}
          </button>

          <details className="advanced-settings">
            <summary>{t.advancedSettings}</summary>
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

            <label className="toggle-row"><input type="checkbox" checked={settings.musicReactive} onChange={(event) => update("musicReactive", event.currentTarget.checked)} />{t.reactMusic}</label>
            <label className="toggle-row"><input type="checkbox" checked={settings.autoHideEnabled} onChange={(event) => update("autoHideEnabled", event.currentTarget.checked)} />{t.autoHide}</label>
            <label className="toggle-row"><input type="checkbox" checked={settings.clickThroughPermanent} onChange={(event) => update("clickThroughPermanent", event.currentTarget.checked)} />{t.clickThroughPermanent}</label>
            <label className="toggle-row"><input type="checkbox" checked={settings.snapToEdgeEnabled} onChange={(event) => update("snapToEdgeEnabled", event.currentTarget.checked)} />{t.snapToEdge}</label>

            {settings.autoHideEnabled && (
              <label>
                {t.autoHideSec}: {settings.autoHideSeconds}s
                <input type="range" min={3} max={30} value={settings.autoHideSeconds} onChange={(event) => update("autoHideSeconds", Number(event.currentTarget.value))} />
              </label>
            )}

            {settings.snapToEdgeEnabled && (
              <label>
                {t.snapMargin}: {settings.snapMarginPx}px
                <input type="range" min={4} max={40} value={settings.snapMarginPx} onChange={(event) => update("snapMarginPx", Number(event.currentTarget.value))} />
              </label>
            )}

            <div className="bubble-modules-wrap">
              <span className="field-label">{t.bubbleModules}</span>
              <div className="bubble-modules-grid">
                {([
                  ["focus", t.bubbleFocus],
                  ["feed", t.bubbleFeed],
                  ["phrase", t.bubblePhrase],
                  ["music", t.bubbleMusic],
                  ["move", t.bubbleMove],
                  ["settings", t.bubbleSettings],
                ] as const).map(([id, label]) => (
                  <label key={id} className="toggle-row bubble-module-toggle">
                    <input
                      type="checkbox"
                      checked={settings.bubbleModules[id]}
                      onChange={(event) =>
                        update("bubbleModules", {
                          ...settings.bubbleModules,
                          [id]: event.currentTarget.checked,
                        })
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </details>

          <div className="panel-footer">
            <button type="button" className="chip" onClick={activateClickThroughPulse}>{t.clickThroughPulse}</button>
            <button type="button" className="chip" onClick={() => setShowPanel(false)}>{t.close}</button>
          </div>
        </section>
      )}

      {showOnboarding && (
        <section className="onboarding-overlay" onMouseDown={(event) => event.stopPropagation()}>
          <div className="onboarding-card">
            <h3>{t.onboardingTitle}</h3>
            <small>{onboardingStep === 0 ? t.onboardingStep1 : onboardingStep === 1 ? t.onboardingStep2 : t.onboardingStep3}</small>
            <p>{onboardingStep === 0 ? t.onboardingHint1 : onboardingStep === 1 ? t.onboardingHint2 : t.onboardingHint3}</p>

            {onboardingStep === 0 && (
              <div className="onboarding-row">
                <button type="button" className={`experience-chip ${settings.language === "es" ? "active" : ""}`} onClick={() => update("language", "es")}>Español</button>
                <button type="button" className={`experience-chip ${settings.language === "en" ? "active" : ""}`} onClick={() => update("language", "en")}>English</button>
              </div>
            )}

            {onboardingStep === 1 && (
              <div className="onboarding-row">
                <button type="button" className={`experience-chip ${selectedProfile === "focus" ? "active" : ""}`} onClick={() => applyExperienceProfile("focus")}>Focus</button>
                <button type="button" className={`experience-chip ${selectedProfile === "calm" ? "active" : ""}`} onClick={() => applyExperienceProfile("calm")}>Calm</button>
                <button type="button" className={`experience-chip ${selectedProfile === "cozy" ? "active" : ""}`} onClick={() => applyExperienceProfile("cozy")}>Cozy</button>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="onboarding-summary">
                <span>{t.language}: {settings.language.toUpperCase()}</span>
                <span>{t.theme}: {settings.themePreset}</span>
                <span>{t.mode}: {settings.mode}</span>
              </div>
            )}

            <div className="onboarding-actions">
              {onboardingStep > 0 && <button type="button" className="chip ghost" onClick={() => setOnboardingStep((prev) => prev - 1)}>{t.onboardingBack}</button>}
              {onboardingStep < 2 && <button type="button" className="chip" onClick={() => setOnboardingStep((prev) => prev + 1)}>{t.onboardingNext}</button>}
              {onboardingStep === 2 && <button type="button" className="chip" onClick={completeOnboarding}>{t.onboardingDone}</button>}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
