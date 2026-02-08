import type { Settings } from "./types";

export const STORAGE_KEY = "amiwi.widget.settings";

export const copy = {
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
    autoHide: "Auto ocultar",
    autoHideSec: "Segundos para ocultar",
    ultraMinimal: "Ultra minimal",
    showTimerBubble: "Burbuja de tiempo",
    musicAmbient: "Color por musica",
    globalShortcut: "Atajo global",
    clickThroughPulse: "Click-through 8s",
    clickThroughHint: "modo pasivo activo",
    musicMethod: "Metodo musica",
    musicTrust: "Confiabilidad",
    musicTrusted: "nativa verificada",
    musicUntrusted: "no confiable",
    musicNativeOnly: "Reaccion solo con deteccion nativa",
    bubbleFocus: "Foco",
    bubbleFeed: "Snack",
    bubbleSettings: "Ajustes",
    bubblePhrase: "Frase",
    bubbleMusic: "Music",
    bubbleMove: "Mover",
    theme: "Tema",
    bubbleModules: "Burbujas activas",
    clickThroughPermanent: "Click-through permanente",
    snapToEdge: "Snap al borde",
    snapMargin: "Margen snap",
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
    autoHide: "Auto hide",
    autoHideSec: "Seconds to hide",
    ultraMinimal: "Ultra minimal",
    showTimerBubble: "Timer bubble",
    musicAmbient: "Music ambient color",
    globalShortcut: "Global shortcut",
    clickThroughPulse: "Click-through 8s",
    clickThroughHint: "passive mode enabled",
    musicMethod: "Music method",
    musicTrust: "Trust",
    musicTrusted: "native verified",
    musicUntrusted: "untrusted",
    musicNativeOnly: "Reaction enabled only with native detection",
    bubbleFocus: "Focus",
    bubbleFeed: "Snack",
    bubbleSettings: "Settings",
    bubblePhrase: "Phrase",
    bubbleMusic: "Music",
    bubbleMove: "Move",
    theme: "Theme",
    bubbleModules: "Enabled bubbles",
    clickThroughPermanent: "Permanent click-through",
    snapToEdge: "Snap to edge",
    snapMargin: "Snap margin",
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

export const defaultSettings: Settings = {
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
  ultraMinimal: true,
  showTimerBubble: true,
  musicAmbient: true,
  clickThroughPermanent: false,
  snapToEdgeEnabled: false,
  snapMarginPx: 12,
  themePreset: "ocean",
  bubbleModules: {
    focus: true,
    feed: true,
    phrase: true,
    music: true,
    move: true,
    settings: true,
  },
};
