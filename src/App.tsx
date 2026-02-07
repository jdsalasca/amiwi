import { ChangeEvent, MouseEvent as ReactMouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { assetByAvatarMood } from "./domain/assets";
import { copy, STORAGE_KEY } from "./domain/config";
import type { FocusPhase, MusicDetection, Mood, PomodoroPreset, Settings } from "./domain/types";
import { useMascotDrag } from "./hooks/useMascotDrag";
import { clamp, formatMMSS, loadSettings, randomPick, resolveAsset } from "./utils/helpers";
import "./App.css";

type BubbleAction = {
  id: string;
  icon: string;
  label: string;
  onClick: () => void;
  pulse?: boolean;
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

function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [showPanel, setShowPanel] = useState(false);
  const [mood, setMood] = useState<Mood>("happy");
  const [phrase, setPhrase] = useState("");
  const [phraseTick, setPhraseTick] = useState(0);
  const [musicPulsePhrase, setMusicPulsePhrase] = useState("");
  const [systemMusicActive, setSystemMusicActive] = useState(false);
  const [systemMusicSource, setSystemMusicSource] = useState("");
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [musicTrackUrl, setMusicTrackUrl] = useState("");
  const [musicTrackName, setMusicTrackName] = useState("");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicEnergy, setMusicEnergy] = useState(0);
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusPhase, setFocusPhase] = useState<FocusPhase>("focus");
  const [dormant, setDormant] = useState(false);
  const [clickThroughActive, setClickThroughActive] = useState(false);

  const durations = useMemo(() => getDurations(settings), [settings]);
  const [remainingSeconds, setRemainingSeconds] = useState(durations.focusSec);

  const hideTimerRef = useRef<number | null>(null);
  const pollingRef = useRef(false);
  const interactionThrottleRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const widgetBodyRef = useRef<HTMLElement | null>(null);

  const { position, startDrag } = useMascotDrag({
    containerRef: widgetBodyRef,
    storageKey: `${STORAGE_KEY}.mascot.position`,
    mascotSize: { w: 150, h: 112 },
    enabled: settings.ultraMinimal && !showPanel,
  });

  const t = copy[settings.language];
  const isMusicActive = settings.musicReactive && (musicPlaying || systemMusicActive);
  const activeHue = Math.round(200 + musicEnergy * 110);
  const globalShortcutLabel = navigator.platform.toLowerCase().includes("mac")
    ? "Cmd+Shift+A"
    : "Ctrl+Shift+A (fallback Ctrl+Alt+A)";

  const stageWidth = widgetBodyRef.current?.clientWidth ?? 240;
  const stageHeight = widgetBodyRef.current?.clientHeight ?? 220;
  const mascotCenterX = clamp(position.x + 75, 24, stageWidth - 24);
  const phraseY = clamp(position.y - 38, 0, stageHeight - 38);
  const actionY = clamp(position.y + 116, 0, stageHeight - 36);
  const timerX = clamp(position.x + 88, 24, stageWidth - 42);
  const timerY = clamp(position.y + 92, 6, stageHeight - 28);
  const musicX = clamp(position.x + 115, 24, stageWidth - 24);
  const musicY = clamp(position.y + 10, 4, stageHeight - 28);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

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
        setSystemMusicActive(res.active);
        setSystemMusicSource(res.source);
      } catch {
        if (active) {
          setSystemMusicActive(false);
          setSystemMusicSource("");
        }
      } finally {
        pollingRef.current = false;
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), 20_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [settings.systemMusicDetect]);

  useEffect(() => {
    if (!settings.musicAmbient) {
      setMusicEnergy(0);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    if (!musicPlaying || !audioRef.current) {
      if (systemMusicActive) {
        const timer = window.setInterval(() => {
          setMusicEnergy((prev) => {
            const next = 0.35 + 0.2 * Math.sin(Date.now() / 600);
            return Math.abs(next - prev) > 0.02 ? next : prev;
          });
        }, 240);
        return () => window.clearInterval(timer);
      }
      setMusicEnergy(0);
      return;
    }

    const w = window as Window & { __amiwiAudioCtx?: AudioContext };
    const ctx = w.__amiwiAudioCtx ?? new window.AudioContext();
    w.__amiwiAudioCtx = ctx;

    if (!audioSourceRef.current) {
      audioSourceRef.current = ctx.createMediaElementSource(audioRef.current);
    }
    if (!analyserRef.current) {
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 128;
      analyserRef.current.smoothingTimeConstant = 0.72;
      audioSourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(ctx.destination);
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    }

    let frameSkip = 0;
    const loop = () => {
      if (!analyserRef.current || !dataArrayRef.current) {
        return;
      }
      frameSkip += 1;
      if (frameSkip % 3 === 0) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i += 1) {
          sum += dataArrayRef.current[i];
        }
        const normalized = clamp((sum / dataArrayRef.current.length) / 255, 0, 1);
        setMusicEnergy((prev) => (Math.abs(prev - normalized) > 0.03 ? normalized : prev));
      }
      rafRef.current = window.requestAnimationFrame(loop);
    };
    rafRef.current = window.requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [musicPlaying, settings.musicAmbient, systemMusicActive]);

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
    const shouldIgnore = clickThroughActive && dormant && !showPanel;
    void getCurrentWindow().setIgnoreCursorEvents(shouldIgnore).catch(() => undefined);
    return () => {
      void getCurrentWindow().setIgnoreCursorEvents(false).catch(() => undefined);
    };
  }, [clickThroughActive, dormant, showPanel]);

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

  const handleFeed = useCallback(() => {
    setMood("celebrate");
    emitPhrase(randomPick(t.phraseFeed));
  }, [t.phraseFeed]);

  const bubbleActions: BubbleAction[] = useMemo(() => [
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
    { id: "settings", icon: "⚙", label: t.bubbleSettings, onClick: () => setShowPanel(true) },
  ], [focusRunning, handleFeed, isMusicActive, quickStartFocus, settings.musicAmbient, smartPhrasePool, t, update]);

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

  const activateClickThroughPulse = () => {
    setClickThroughActive(true);
    emitPhrase(t.clickThroughHint);
    window.setTimeout(() => setClickThroughActive(false), 8000);
  };

  const avatarAsset = useMemo(
    () => resolveAsset(assetByAvatarMood[settings.avatarStyle][mood]),
    [settings.avatarStyle, mood]
  );

  useEffect(() => {
    setAvatarBroken(false);
  }, [settings.avatarStyle, mood]);

  const openOrCloseSettings = (event: ReactMouseEvent<HTMLImageElement | HTMLDivElement>) => {
    event.preventDefault();
    setShowPanel((prev) => !prev);
  };

  return (
    <main
      className={`glass-shell ${dormant ? "dormant" : ""} ${settings.ultraMinimal ? "ultra-minimal" : ""}`}
      style={{
        opacity: settings.opacity,
        ["--accent-hue" as string]: `${activeHue}`,
        ["--music-energy" as string]: `${musicEnergy.toFixed(2)}`
      }}
      onMouseMove={registerInteraction}
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
        <div className="mascot-draggable" style={{ left: `${position.x}px`, top: `${position.y}px` }} onPointerDown={startDrag}>
          {!avatarBroken ? (
            <img
              className={`avatar ${isMusicActive ? "music-react" : ""} ${focusRunning ? "focus-float" : ""}`}
              src={avatarAsset}
              alt={`${settings.avatarStyle}-${mood}`}
              loading="eager"
              decoding="async"
              onDoubleClick={quickStartFocus}
              onContextMenu={openOrCloseSettings}
              onError={() => setAvatarBroken(true)}
            />
          ) : (
            <div className="avatar-fallback" onDoubleClick={quickStartFocus} onContextMenu={openOrCloseSettings}>
              o(=^.^=)o
            </div>
          )}
        </div>

        <div key={phraseTick} className="floating-phrase" style={{ left: `${mascotCenterX}px`, top: `${phraseY}px` }}>
          {phrase}
        </div>

        {settings.ultraMinimal && !showPanel && (
          <div className="bubble-actions" style={{ left: `${mascotCenterX}px`, top: `${actionY}px` }}>
            {bubbleActions.map((action) => (
              <button
                key={action.id}
                type="button"
                className={`bubble-action ${action.pulse ? "music-pulse" : ""}`}
                title={action.label}
                onClick={action.onClick}
              >
                {action.icon}
              </button>
            ))}
          </div>
        )}

        {settings.showTimerBubble && focusRunning && (
          <div className="timer-bubble" style={{ left: `${timerX}px`, top: `${timerY}px` }}>
            {focusPhase === "focus" ? "🍅" : "☕"} {formatMMSS(remainingSeconds)}
          </div>
        )}

        {isMusicActive && settings.musicAmbient && (
          <div className="music-react-bubble" style={{ left: `${musicX}px`, top: `${musicY}px` }}>
            {musicPulsePhrase || "♪"}
          </div>
        )}

        {showPanel && (
          <div className="music-pill">
            {t.nowPlaying}: {isMusicActive ? (systemMusicSource || musicTrackName || "active") : t.noMusic}
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
            {t.mode}
            <select value={settings.mode} onChange={(event) => update("mode", event.currentTarget.value as Settings["mode"])}>
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

          <label className="toggle-row"><input type="checkbox" checked={settings.alwaysOnTop} onChange={(event) => update("alwaysOnTop", event.currentTarget.checked)} />{t.alwaysOnTop}</label>
          <label className="toggle-row"><input type="checkbox" checked={settings.systemMusicDetect} onChange={(event) => update("systemMusicDetect", event.currentTarget.checked)} />{t.detectSystemMusic}</label>
          <label className="toggle-row"><input type="checkbox" checked={settings.musicReactive} onChange={(event) => update("musicReactive", event.currentTarget.checked)} />{t.reactMusic}</label>
          <label className="toggle-row"><input type="checkbox" checked={settings.autoHideEnabled} onChange={(event) => update("autoHideEnabled", event.currentTarget.checked)} />{t.autoHide}</label>
          <label className="toggle-row"><input type="checkbox" checked={settings.ultraMinimal} onChange={(event) => update("ultraMinimal", event.currentTarget.checked)} />{t.ultraMinimal}</label>
          <label className="toggle-row"><input type="checkbox" checked={settings.showTimerBubble} onChange={(event) => update("showTimerBubble", event.currentTarget.checked)} />{t.showTimerBubble}</label>
          <label className="toggle-row"><input type="checkbox" checked={settings.musicAmbient} onChange={(event) => update("musicAmbient", event.currentTarget.checked)} />{t.musicAmbient}</label>

          <label>{t.globalShortcut}: {globalShortcutLabel}</label>

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

          <audio ref={audioRef} controls src={musicTrackUrl} onPlay={() => setMusicPlaying(true)} onPause={() => setMusicPlaying(false)} onEnded={() => setMusicPlaying(false)} />

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
