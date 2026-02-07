# Amiwi

Amiwi is a desktop companion for study and work, built with Tauri + React + TypeScript.

## v0.7.0 (liquid-glass minimal rework)
- Widget-first default experience.
- Quick onboarding presets + advanced setup.
- Profile suggestion on first run (time-based).
- Preview/tour timer (30s) on onboarding.
- Better desktop controls:
  - minimize
  - maximize/restore
  - close
- Real visual assets for all avatar styles by mood:
  - cloud, pixel, blob, cat, bunny, fox
- Pomodoro UX upgrade:
  - presets: 25/5, 50/10, custom
  - custom focus/break sliders
  - gentle sound alerts on phase switch
  - mini-clock in widget mode
- Phrases visible in widget mode.
- Expanded mode with tabs (`Focus`, `Pet`, `Music`, `Stats`, `Style`).
- Existing system music reaction, pet feeding, and weekly stats preserved.

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
- `REQUIREMENTS_v0.3.md`
- `UX_REQUIREMENTS_CHECKLIST.md`
- `NEXT_STEPS_BACKLOG.md`
- `MASTER_PLAN.md`
