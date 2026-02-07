# Amiwi

Amiwi is a desktop companion for study and work, built with Tauri + React + TypeScript.

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
