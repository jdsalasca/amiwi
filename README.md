# Amiwi

Amiwi is a desktop companion for study and work, built with Tauri + React + TypeScript.

## v0.5.0 (UX boost)
- Widget-first default experience (mascot visible from launch).
- Cleaner day-to-day controls:
  - Minimal/Expand toggle
  - Settings toggle
  - Minimize, Maximize/Restore, Close
- Real visual assets for avatars (initial packs):
  - `cloud` SVG states
  - `pixel` SVG states
- Profile-based onboarding:
  - Quick setup presets (Study, Work, Balanced)
  - Advanced setup flow
- Pomodoro mini clock in widget mode (timer + Start/Stop).
- Phrases visible directly in widget mode.
- Expanded mode with tabs (`Focus`, `Pet`, `Music`, `Stats`, `Style`).
- Existing music reaction, pet feeding, and weekly stats retained.

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
