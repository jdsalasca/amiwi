# Amiwi

Amiwi is a desktop companion for study and work, built with Tauri + React + TypeScript.

## v0.8.4 (mascot-only minimal mode + music ambience)
- Ultra-minimal now behaves as mascot-only: no visible controls/chrome unless user opens settings.
- Settings can be toggled directly from mascot via right-click.
- Fast focus toggle via mascot double-click.
- Timer bubble is optional and user-controlled (`showTimerBubble`).
- Dynamic ambient color reacts to music energy:
  - waveform energy from local track with `AnalyserNode`
  - lightweight pulse fallback for system-music detection.
- Performance-safe approach: throttled updates and low-cost analyzer settings.

## v0.8.3 (minimal widget value pass)
- Ultra-minimal mode enabled by default to keep the companion unobtrusive.
- Header/window chrome now appears contextually on hover/focus for cleaner daily use.
- Quick dock simplified (start/stop, timer, snack) with icon-first controls.
- Music pill hidden in idle minimal state to reduce visual noise.
- New toggle in settings: `Ultra minimal`.

## v0.8.2 (optimization + presentation + stability)
- Reduced interaction overhead with throttled idle tracking and smarter timeout handling.
- Improved responsiveness of primary actions and control buttons.
- Reused audio context for softer/lighter alert playback.
- Tuned visual system for smoother rendering (lighter effects, motion-reduction support).
- Strengthened widget consistency with fixed minimum layout and safer avatar rendering path.

## v0.8.1 (stability hotfix)
- Fixed window button reliability (drag region no longer captures control clicks).
- Reduced UI jank from expensive effects and high-frequency idle polling.
- Hardened system music detection with timeout and non-blocking backend execution.
- Improved avatar asset loading path resolution for packaged app builds.
- Added visual fallback when an avatar asset fails to load.

## v0.8.0 (minimal liquid-glass widget)
- Strong UX rework to a compact floating widget with liquid-glass style.
- Default companion-first view with transparent background feel and reduced visual noise.
- Contextual floating phrases (study/work/music/break/feed + time of day).
- Music reaction preserved:
  - local browser audio detection
  - optional system-level detection via Tauri command.
- Pet loop improvements:
  - hunger feedback
  - snack action with reaction states.
- Pomodoro fast controls in widget mode.
- Auto-hide (dormant mode) after inactivity with configurable timeout.
- Optional click-through pulse for desktop coexistence.
- Settings panel simplified for daily-use toggles.
- Native window controls retained (minimize, maximize/restore, close).

## Run locally
```bash
npm install
npm run tauri dev
```

## Build installers
```bash
npm run tauri build
```

## Easy installation
- Guide: `INSTALL.md`
- Scripts:
  - `scripts/install-windows.ps1 -Quick` (silent quick install)
  - `scripts/install-windows.ps1` (guided install)
  - `scripts/install-macos.sh`

## Product docs
- `REQUIREMENTS_v0.8.md`
- `UX_REQUIREMENTS_CHECKLIST.md`
- `NEXT_STEPS_BACKLOG.md`
- `MASTER_PLAN.md`
