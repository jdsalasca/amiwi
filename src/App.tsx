import { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { LogicalSize, PhysicalPosition } from "@tauri-apps/api/dpi";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow, monitorFromPoint } from "@tauri-apps/api/window";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, Update as AppUpdate } from "@tauri-apps/plugin-updater";
import { assetByAvatarMood } from "./domain/assets";
import { copy, STORAGE_KEY } from "./domain/config";
import type { BubbleModuleId, FocusPhase, MusicDetection, Mood, PomodoroPreset, Settings } from "./domain/types";
import { clamp, formatMMSS, loadSettings, randomPick, resolveAsset } from "./utils/helpers";
import "./App.css";

type BubbleAction = {
  id: BubbleModuleId | "update";
  icon: string;
  label: string;
  onClick: () => void;
  pulse?: boolean;
  tone?: "default" | "success";
};

const WINDOW_POSITION_KEY = `${STORAGE_KEY}.window.positionByMonitor`;
const ONBOARDING_KEY = `${STORAGE_KEY}.onboarding.v1`;

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
  const [pointerGlow, setPointerGlow] = useState({ x: 50, y: 22 });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<"focus" | "calm" | "cozy">("focus");
  const [pendingUpdate, setPendingUpdate] = useState<AppUpdate | null>(null);
  const [updatingNow, setUpdatingNow] = useState(false);
  const [showUpdateTip, setShowUpdateTip] = useState(false);
  const [hoveringActions, setHoveringActions] = useState(false);
  const [animeBlinking, setAnimeBlinking] = useState(false);
  const [animeMouthOpen, setAnimeMouthOpen] = useState(false);
  const [animeStepFrame, setAnimeStepFrame] = useState(0);

  const durations = useMemo(() => getDurations(settings), [settings]);
  const [remainingSeconds, setRemainingSeconds] = useState(durations.focusSec);

  const hideTimerRef = useRef<number | null>(null);
  const pollingRef = useRef(false);
  const interactionThrottleRef = useRef(0);
  const windowDragUntilRef = useRef(0);
  const dragPermissionWarnedRef = useRef(false);
  const widgetBodyRef = useRef<HTMLElement | null>(null);
  const updaterCheckedRef = useRef(false);
  const manualDragRef = useRef({
    active: false,
    appWindowX: 0,
    appWindowY: 0,
    startScreenX: 0,
    startScreenY: 0,
    targetX: 0,
    targetY: 0,
    rafId: 0,
  });

  const t = copy[settings.language];
  const isMusicActive = settings.musicReactive && systemMusicActive;
  const isAnimeAvatar = settings.avatarStyle === "anime";
  const themeBaseHue = settings.themePreset === "mint" ? 165 : settings.themePreset === "rose" ? 345 : 205;
  const activeHue = Math.round(themeBaseHue + musicEnergy * 70);
  const stageWidth = widgetBodyRef.current?.clientWidth ?? 240;
  const stageHeight = widgetBodyRef.current?.clientHeight ?? 220;
  const mascotScale = clamp(settings.mascotScale, 0.7, 1.45);
  const mascotWidth = Math.round(170 * mascotScale);
  const mascotHeight = Math.round(124 * mascotScale);
  const position = useMemo(
    () => ({
      x: clamp((stageWidth - mascotWidth) / 2, 0, stageWidth - mascotWidth),
      y: clamp((stageHeight - mascotHeight) / 2, 0, stageHeight - mascotHeight),
    }),
    [mascotHeight, mascotWidth, stageHeight, stageWidth]
  );
  const mascotCenterX = clamp(position.x + mascotWidth / 2, 24, stageWidth - 24);
  const rawPhraseY = clamp(position.y - 38, 0, stageHeight - 38);
  const actionY = clamp(position.y + mascotHeight + 2, 0, stageHeight - 36);
  const updateTipY = clamp(actionY - 20, 0, stageHeight - 20);
  const timerX = clamp(stageWidth / 2, 26, stageWidth - 26);
  const timerY = 14;
  const phraseY = Math.abs(rawPhraseY - timerY) < 34 ? clamp(rawPhraseY + 34, 4, stageHeight - 38) : rawPhraseY;
  const musicX = clamp(position.x + mascotWidth - 24, 24, stageWidth - 24);
  const musicY = clamp(position.y + 10, 4, stageHeight - 28);
  const phaseTotalSeconds = focusPhase === "focus" ? durations.focusSec : durations.breakSec;
  const phaseProgress = clamp(1 - remainingSeconds / Math.max(phaseTotalSeconds, 1), 0, 1);
  const animeEyeX = ((pointerGlow.x - 50) / 50) * 2.2;
  const animeEyeY = ((pointerGlow.y - 50) / 50) * 1.6;
  const animeDanceProfile = useMemo<"idle" | "calm" | "groove" | "hype">(() => {
    if (!isAnimeAvatar || !isMusicActive) {
      return "idle";
    }
    const energy = clamp(musicEnergy, 0, 1);
    if (focusRunning && focusPhase === "focus") {
      if (energy > 0.62) {
        return "groove";
      }
      return "calm";
    }
    if (energy > 0.74) {
      return "hype";
    }
    if (energy > 0.4) {
      return "groove";
    }
    return "calm";
  }, [focusPhase, focusRunning, isAnimeAvatar, isMusicActive, musicEnergy]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

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
    const target = showPanel ? new LogicalSize(410, 500) : new LogicalSize(220, 240);
    const keepVisibleAfterResize = async () => {
      await appWindow.setSize(target).catch(() => undefined);
      await appWindow.setResizable(showPanel).catch(() => undefined);
      const [pos, size] = await Promise.all([appWindow.outerPosition(), appWindow.outerSize()]).catch(() => [null, null] as const);
      if (!pos || !size) {
        return;
      }
      const centerX = pos.x + Math.floor(size.width / 2);
      const centerY = pos.y + Math.floor(size.height / 2);
      const monitor = await monitorFromPoint(centerX, centerY);
      if (!monitor) {
        return;
      }
      const pad = 8;
      const area = monitor.workArea;
      const minX = area.position.x + pad;
      const maxX = area.position.x + area.size.width - size.width - pad;
      const minY = area.position.y + pad;
      const maxY = area.position.y + area.size.height - size.height - pad;
      const targetX = clamp(pos.x, minX, maxX);
      const targetY = clamp(pos.y, minY, maxY);
      if (targetX !== pos.x || targetY !== pos.y) {
        await appWindow.setPosition(new PhysicalPosition(targetX, targetY)).catch(() => undefined);
      }
    };
    void keepVisibleAfterResize();
  }, [showPanel]);

  useEffect(() => {
    if (!focusRunning) {
      setRemainingSeconds(durations.focusSec);
      setFocusPhase("focus");
    }
  }, [durations.focusSec, focusRunning]);

  useEffect(() => {
    if (import.meta.env.DEV || updaterCheckedRef.current) {
      return;
    }
    updaterCheckedRef.current = true;
    let cancelled = false;
    const runUpdater = async () => {
      try {
        const update = await check();
        if (!update || cancelled) {
          return;
        }
        setPendingUpdate(update);
        emitPhrase(`${t.updateReady}: v${update.version}`);
      } catch {
        // ignore updater errors to avoid blocking the app
      }
    };
    void runUpdater();
    return () => {
      cancelled = true;
    };
  }, [t.updateReady]);

  useEffect(() => {
    if (!pendingUpdate || updatingNow) {
      setShowUpdateTip(false);
      return;
    }
    setShowUpdateTip(true);
    const timer = window.setTimeout(() => setShowUpdateTip(false), 5000);
    return () => window.clearTimeout(timer);
  }, [pendingUpdate, updatingNow]);

  const installPendingUpdate = useCallback(async () => {
    if (!pendingUpdate || updatingNow) {
      return;
    }
    setUpdatingNow(true);
    emitPhrase(t.updatingNow);
    try {
      await pendingUpdate.downloadAndInstall();
      await relaunch();
    } catch {
      emitPhrase(t.updateFailed);
      setUpdatingNow(false);
    }
  }, [pendingUpdate, t.updateFailed, t.updatingNow, updatingNow]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]): void => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

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
    if (!isAnimeAvatar) {
      setAnimeBlinking(false);
      return;
    }
    let disposed = false;
    let blinkTimer = 0;
    let resetTimer = 0;
    const scheduleBlink = () => {
      const delay = 1900 + Math.round(Math.random() * 2600);
      blinkTimer = window.setTimeout(() => {
        if (disposed) {
          return;
        }
        setAnimeBlinking(true);
        resetTimer = window.setTimeout(() => setAnimeBlinking(false), 130);
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();
    return () => {
      disposed = true;
      window.clearTimeout(blinkTimer);
      window.clearTimeout(resetTimer);
    };
  }, [isAnimeAvatar]);

  useEffect(() => {
    if (!isAnimeAvatar) {
      setAnimeMouthOpen(false);
      return;
    }
    if (!isMusicActive && !focusRunning) {
      setAnimeMouthOpen(false);
      return;
    }
    const timer = window.setInterval(() => {
      setAnimeMouthOpen((prev) => !prev);
    }, isMusicActive ? 220 : 360);
    return () => window.clearInterval(timer);
  }, [focusRunning, isAnimeAvatar, isMusicActive]);

  useEffect(() => {
    if (!isAnimeAvatar) {
      setAnimeStepFrame(0);
      return;
    }
    const timer = window.setInterval(() => {
      setAnimeStepFrame((prev) => (prev + 1) % 4);
    }, isMusicActive ? 180 : 280);
    return () => window.clearInterval(timer);
  }, [isAnimeAvatar, isMusicActive]);

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

      await appWindow.setPosition(new PhysicalPosition(targetX, targetY)).catch((error) => {
        if (!dragPermissionWarnedRef.current) {
          // Surface permission or platform failures instead of silently swallowing drag bugs.
          console.warn("[window-drag] setPosition failed while snapping to edge.", error);
          dragPermissionWarnedRef.current = true;
        }
      });
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
      await appWindow.setPosition(new PhysicalPosition(remembered.x, remembered.y)).catch((error) => {
        if (!dragPermissionWarnedRef.current) {
          console.warn("[window-drag] setPosition failed while restoring monitor position.", error);
          dragPermissionWarnedRef.current = true;
        }
      });
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
      setFocusPhase("focus");
      setRemainingSeconds(durations.focusSec);
      setMood("focus");
      update("mode", "study");
      return true;
    });
  }, [durations.focusSec]);

  const beginManualWindowDrag = useCallback((screenX: number, screenY: number) => {
    if (showPanel) {
      return;
    }
    registerInteraction();
    windowDragUntilRef.current = Date.now() + 2400;
    const appWindow = getCurrentWindow();
    void appWindow.outerPosition().then((pos) => {
      const drag = manualDragRef.current;
      drag.active = true;
      drag.appWindowX = pos.x;
      drag.appWindowY = pos.y;
      drag.startScreenX = screenX;
      drag.startScreenY = screenY;
      drag.targetX = pos.x;
      drag.targetY = pos.y;
    }).catch((error) => {
      if (!dragPermissionWarnedRef.current) {
        console.warn("[window-drag] outerPosition failed when initializing manual drag.", error);
        dragPermissionWarnedRef.current = true;
      }
    });
  }, [registerInteraction, showPanel]);

  const startWindowDrag = useCallback((screenX: number, screenY: number) => {
    registerInteraction();
    windowDragUntilRef.current = Date.now() + 2400;
    const appWindow = getCurrentWindow();
    void appWindow.startDragging().catch((error) => {
      if (!dragPermissionWarnedRef.current) {
        console.warn("[window-drag] native startDragging failed; falling back to manual drag.", error);
        dragPermissionWarnedRef.current = true;
      }
      beginManualWindowDrag(screenX, screenY);
    });
  }, [beginManualWindowDrag, registerInteraction]);

  const handleMascotPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || showPanel) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (settings.dragAnywhereEnabled) {
      return;
    }
    startWindowDrag(event.screenX, event.screenY);
  };

  const handleShellPointerDownCapture = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 || !settings.dragAnywhereEnabled) {
      return;
    }
    const target = event.target as HTMLElement;
    if (target.closest("button, input, select, textarea, summary, details, a, label")) {
      return;
    }
    event.preventDefault();
    startWindowDrag(event.screenX, event.screenY);
  };

  const handlePanelDragPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    startWindowDrag(event.screenX, event.screenY);
  };

  useEffect(() => {
    const appWindow = getCurrentWindow();
    const flushDragFrame = () => {
      const drag = manualDragRef.current;
      drag.rafId = 0;
      if (!drag.active) {
        return;
      }
      const targetX = Math.round(drag.targetX);
      const targetY = Math.round(drag.targetY);
      void appWindow.setPosition(new PhysicalPosition(targetX, targetY)).catch((error) => {
        if (!dragPermissionWarnedRef.current) {
          console.warn("[window-drag] setPosition failed during manual drag frame.", error);
          dragPermissionWarnedRef.current = true;
        }
      });
    };
    const onPointerMove = (event: PointerEvent) => {
      const drag = manualDragRef.current;
      if (!drag.active) {
        return;
      }
      const dx = event.screenX - drag.startScreenX;
      const dy = event.screenY - drag.startScreenY;
      drag.targetX = drag.appWindowX + dx;
      drag.targetY = drag.appWindowY + dy;
      if (drag.rafId === 0) {
        drag.rafId = window.requestAnimationFrame(flushDragFrame);
      }
    };
    const stopDrag = () => {
      const drag = manualDragRef.current;
      drag.active = false;
      if (drag.rafId !== 0) {
        window.cancelAnimationFrame(drag.rafId);
        drag.rafId = 0;
      }
      windowDragUntilRef.current = Date.now() + 900;
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDrag);
    window.addEventListener("pointercancel", stopDrag);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDrag);
      window.removeEventListener("pointercancel", stopDrag);
      stopDrag();
    };
  }, []);

  const bubbleActions: BubbleAction[] = useMemo(() => {
    const actions: BubbleAction[] = [
      { id: "focus", icon: focusRunning ? "■" : "▶", label: t.bubbleFocus, onClick: quickStartFocus },
      { id: "settings", icon: "⚙", label: t.bubbleSettings, onClick: () => setShowPanel(true) },
    ];
    if (pendingUpdate) {
      actions.unshift({
        id: "update",
        icon: updatingNow ? "…" : "↟",
        label: `${t.updateNow} v${pendingUpdate.version}`,
        onClick: () => void installPendingUpdate(),
        pulse: !updatingNow,
        tone: "success",
      });
    }
    return actions;
  }, [focusRunning, installPendingUpdate, pendingUpdate, quickStartFocus, t, updatingNow]);

  const applyExperienceProfile = useCallback((profile: "focus" | "calm" | "cozy") => {
    setSelectedProfile(profile);
    if (profile === "focus") {
      setSettings((prev) => ({
        ...prev,
        themePreset: "ocean",
        avatarStyle: "fox",
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
        avatarStyle: "cloud",
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
      avatarStyle: "cat",
      mode: "break",
      phraseFrequencySec: 170,
      autoHideEnabled: false,
      musicAmbient: false,
    }));
    emitPhrase(randomPick(t.phraseBreak));
  }, [t.phraseBreak, t.phraseDeepFocus, t.phraseWork]);

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
      className={`glass-shell theme-${settings.themePreset} ${!showPanel ? "mascot-only" : ""} ${focusRunning ? "focus-running" : ""} ${dormant ? "dormant" : ""} ${settings.ultraMinimal ? "ultra-minimal" : ""} ${settings.dragAnywhereEnabled ? "drag-anywhere" : ""}`}
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
      onPointerDownCapture={handleShellPointerDownCapture}
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
        <div
          className="mascot-draggable"
          style={{ left: `${position.x}px`, top: `${position.y}px`, width: `${mascotWidth}px`, height: `${mascotHeight}px` }}
          onPointerDown={handleMascotPointerDown}
          data-tauri-drag-region
        >
          <div className="mascot-hitbox" aria-hidden="true" />
          <div className="mascot-shell" style={{ width: `${mascotWidth}px`, height: `${mascotHeight}px` }}>
            {isAnimeAvatar ? (
              <div
                className={`anime-avatar step-${animeStepFrame} dance-${animeDanceProfile} ${isMusicActive ? "music-react" : ""} ${focusRunning ? "focus-float" : ""}`}
                onDoubleClick={quickStartFocus}
                onContextMenu={openOrCloseSettings}
              >
                <div className="anime-hair" />
                <div className="anime-face">
                  <div className="anime-eye left" style={{ ["--eye-x" as string]: `${animeEyeX.toFixed(2)}px`, ["--eye-y" as string]: `${animeEyeY.toFixed(2)}px` }}>
                    <span className={`anime-pupil ${animeBlinking ? "blink" : ""}`} />
                  </div>
                  <div className="anime-eye right" style={{ ["--eye-x" as string]: `${animeEyeX.toFixed(2)}px`, ["--eye-y" as string]: `${animeEyeY.toFixed(2)}px` }}>
                    <span className={`anime-pupil ${animeBlinking ? "blink" : ""}`} />
                  </div>
                  <div className="anime-mouth-wrap">
                    <span className={`anime-mouth ${animeMouthOpen ? "open" : ""}`} />
                  </div>
                  <div className="anime-cheek left" />
                  <div className="anime-cheek right" />
                </div>
              </div>
            ) : (
              <img
                className={`avatar ${isMusicActive ? "music-react" : ""} ${focusRunning ? "focus-float" : ""}`}
                src={avatarAsset}
                alt={`${settings.avatarStyle}-${mood}`}
                loading="eager"
                decoding="async"
                draggable={false}
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
            )}
          </div>
        </div>

        <div key={phraseTick} className="floating-phrase" style={{ left: `${mascotCenterX}px`, top: `${phraseY}px` }}>
          {phrase}
        </div>

        {!showPanel && bubbleActions.length > 0 && (
          <>
            {pendingUpdate && !updatingNow && (showUpdateTip || hoveringActions) && (
              <div
                className={`bubble-update-tip ${showUpdateTip ? "intro" : "hover"}`}
                style={{ left: `${mascotCenterX}px`, top: `${updateTipY}px` }}
              >
                {t.updateAvailable} v{pendingUpdate.version}
              </div>
            )}
            <div
              className="bubble-actions"
              style={{ left: `${mascotCenterX}px`, top: `${actionY}px` }}
              onMouseEnter={() => setHoveringActions(true)}
              onMouseLeave={() => setHoveringActions(false)}
            >
              {bubbleActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className={`bubble-action ${action.pulse ? "music-pulse" : ""} ${action.tone === "success" ? "update-green" : ""}`}
                  title={action.label}
                  onClick={action.onClick}
                >
                  {action.icon}
                </button>
              ))}
            </div>
          </>
        )}

        {settings.showTimerBubble && (
          <div className="timer-bubble" style={{ left: `${timerX}px`, top: `${timerY}px` }}>
            {focusRunning ? (focusPhase === "focus" ? "🍅" : "☕") : "⏱"} {formatMMSS(remainingSeconds)}
          </div>
        )}

        {focusRunning && <div className="session-progress">{Math.round(phaseProgress * 100)}%</div>}

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
          <div
            className="panel-drag-hitbox"
            data-tauri-drag-region
            onPointerDown={handlePanelDragPointerDown}
            title={t.bubbleMove}
          />
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
              <option value="anime">Anime (beta)</option>
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

          <label className="toggle-row"><input type="checkbox" checked={settings.showTimerBubble} onChange={(event) => update("showTimerBubble", event.currentTarget.checked)} />{t.showTimerBubble}</label>

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
              <input type="range" min={0.85} max={1.35} step={0.05} value={settings.size} onChange={(event) => update("size", Number(event.currentTarget.value))} />
            </label>

            <label>
              {t.mascotSize}: {settings.mascotScale.toFixed(2)}x
              <input type="range" min={0.7} max={1.45} step={0.05} value={settings.mascotScale} onChange={(event) => update("mascotScale", Number(event.currentTarget.value))} />
            </label>

            <label className="toggle-row"><input type="checkbox" checked={settings.alwaysOnTop} onChange={(event) => update("alwaysOnTop", event.currentTarget.checked)} />{t.alwaysOnTop}</label>
            <label className="toggle-row"><input type="checkbox" checked={settings.systemMusicDetect} onChange={(event) => update("systemMusicDetect", event.currentTarget.checked)} />{t.detectSystemMusic}</label>
            <label className="toggle-row"><input type="checkbox" checked={settings.musicReactive} onChange={(event) => update("musicReactive", event.currentTarget.checked)} />{t.reactMusic}</label>
            <label className="toggle-row"><input type="checkbox" checked={settings.autoHideEnabled} onChange={(event) => update("autoHideEnabled", event.currentTarget.checked)} />{t.autoHide}</label>
            <label className="toggle-row"><input type="checkbox" checked={settings.dragAnywhereEnabled} onChange={(event) => update("dragAnywhereEnabled", event.currentTarget.checked)} />{t.dragAnywhere}</label>
            <label className="toggle-row"><input type="checkbox" checked={settings.snapToEdgeEnabled} onChange={(event) => update("snapToEdgeEnabled", event.currentTarget.checked)} />{t.snapToEdge}</label>
            <label className="toggle-row"><input type="checkbox" checked={settings.ultraMinimal} onChange={(event) => update("ultraMinimal", event.currentTarget.checked)} />{t.ultraMinimal}</label>
            <label className="toggle-row"><input type="checkbox" checked={settings.musicAmbient} onChange={(event) => update("musicAmbient", event.currentTarget.checked)} />{t.musicAmbient}</label>

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

          </details>

          <div className="panel-footer">
            <button type="button" className="chip ghost" onClick={() => { setShowOnboarding(true); setOnboardingStep(0); }}>{t.onboardingQuick}</button>
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
