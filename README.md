# Amiwi

Amiwi is a desktop companion pet: a tiny creature that lives on your screen, blinks, follows your cursor, dances when music plays, and reacts when you drag or shake it.

Built with Tauri 2 + React 19 + TypeScript. No accounts, no cloud, no noise — just a pet.

## What it does today

- Living behavior: blinking, eye tracking, mouth movement, dance profiles, drag and shake reactions.
- Liquid-glass micro-widget UX with bubble actions and contextual feedback.
- Bond system: the more time you spend with it, the more it says back.
- Adapts to focus mode and system music.
- Stable on Windows and macOS: draggable, auto-updater, monitor-safe positioning.

## Install

Download the latest build from [Releases](https://github.com/jdsalasca/amiwi/releases).

## Run locally

```bash
npm install
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

## Tests

```bash
npm run test:run
```

## Project structure

- `src/`: React app, UI logic, pet interactions.
- `src-tauri/`: Tauri backend, native packaging and updater.
- `public/avatars/`: avatar assets.
- `scripts/`: install helpers.
- `docs/`: product vision, backlog, and archived release notes.

## Docs

- `INSTALL.md`: installation guide.
- `docs/PRODUCT_VISION.md`: where Amiwi is going.
- `docs/README.md`: docs index.

## License

MIT — see [LICENSE](./LICENSE).
