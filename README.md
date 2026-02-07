# Amiwi

Amiwi is a cute desktop companion for study and work, built with Tauri + React + TypeScript.

## v0.2.0 (P1 value release)
- Floating desktop companion window (`alwaysOnTop`, draggable).
- Avatar with expressive faces/states.
- Local phrase engine by language, mode, and tone.
- Onboarding in 1 minute.
- Settings persisted locally:
  - language (`es` / `en`)
  - phrase tone
  - phrase frequency
  - avatar opacity and size
  - enable/disable phrases
  - music reaction toggle
- Focus timer mode (25/5).
- Music Reactor:
  - load local song
  - Amiwi reacts with music mood + phrase set while playback is active
- Weekly stats (persisted):
  - focus minutes (week and today)
  - focus sessions
  - music minutes
  - day streak

## Run locally
```bash
npm install
npm run tauri dev
```

## Build installers
```bash
npm run tauri build
```

Installers are generated in `src-tauri/target/release/bundle/`.

## CI cross-platform builds
- Workflow: `.github/workflows/release.yml`
- Trigger: push tags `v*`
- Output: Windows and macOS release artifacts uploaded to GitHub Releases.

## Product planning
Main planning and prioritization documents:
- `MASTER_PLAN.md`
- `NEXT_STEPS_BACKLOG.md`
