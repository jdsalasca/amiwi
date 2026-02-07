# Amiwi

Amiwi is a cute desktop companion for study and work, built with Tauri + React + TypeScript.

## v0.1.0 (MVP)
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
- Focus timer mode (25/5).

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

## Product planning
Main planning and prioritization document:
- `MASTER_PLAN.md`
