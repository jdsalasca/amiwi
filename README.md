# Amiwi

Amiwi is a cute desktop companion for study and work, built with Tauri + React + TypeScript.

## v0.3.0 (requested experience release)
- Floating desktop companion window (`alwaysOnTop`, draggable).
- Fast floating controls:
  - `Minimal` compact mode.
  - `Minimize` button for taskbar/dock.
- Avatar packs (`blob`, `cat`, `bunny`, `fox`) with mood reactions.
- Local phrase engine by language, mode, and tone.
- Occasional supportive sayings (toggleable).
- Onboarding in 1 minute.
- Settings persisted locally:
  - language (`es` / `en`)
  - avatar pack
  - phrase tone and frequency
  - occasional sayings
  - avatar opacity and size
  - music reaction and system detection toggle
- Focus timer mode (25/5).
- Music Reactor:
  - local song playback reaction
  - system music detection (beta, process-presence method)
- Pet interaction:
  - hunger meter
  - feed/snack action with reactions
- Weekly stats (persisted):
  - focus minutes (week and today)
  - focus sessions
  - music minutes
  - snacks given
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

## Easy installation
- Guide: `INSTALL.md`
- Scripts:
  - `scripts/install-windows.ps1`
  - `scripts/install-macos.sh`

## CI cross-platform builds
- Workflow: `.github/workflows/release.yml`
- Trigger: push tags `v*`
- Output: Windows and macOS release artifacts uploaded to GitHub Releases.

## Product planning and requirements
- `MASTER_PLAN.md`
- `REQUIREMENTS_v0.3.md`
- `NEXT_STEPS_BACKLOG.md`
