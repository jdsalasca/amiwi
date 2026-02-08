# Amiwi

Amiwi is a desktop companion pet built with Tauri + React + TypeScript.

Goal: create a living pet experience on desktop with strong user interaction, expressive animation, and minimal friction.

## Current product focus
- Living pet behavior: blink, eye tracking, mouth movement, dance profiles, drag reactions, shake gestures.
- Liquid-glass micro-widget UX with bubble actions and contextual feedback.
- Stable desktop behavior on Windows/macOS: draggable, update-ready, and monitor-safe positioning.

## Run locally
```bash
npm install
npm run tauri dev
```

## Build
```bash
npm run tauri build
```

## Project structure
- `src/`: React app, UI logic, pet interactions.
- `src-tauri/`: Tauri backend/config, native packaging and updater.
- `public/avatars/`: avatar assets.
- `scripts/`: install helpers.
- `docs/`: product docs and archived historical notes.

## Docs
- `INSTALL.md`: installation guide.
- `docs/README.md`: docs index.
- `docs/PRODUCT_VISION.md`: product direction and interaction roadmap.
- `docs/archive/`: previous plans, requirements, and release notes.

## Core interaction loop (now)
1. User interacts with pet (`mimar`, drag, shake, focus start).
2. Pet reacts visually (bubble bursts, emotes, motion, dance profile).
3. Bond and contextual phrases reinforce user-pet connection.
4. Ambient behavior adapts to system music + focus mode.
