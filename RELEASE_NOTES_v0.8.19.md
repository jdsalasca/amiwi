# Amiwi v0.8.19 - Draggable Window Reliability Fix

## What was fixed

- Replaced fragile drag path with manual pointer-based window dragging via `setPosition`.
- Removed drag-event competition on shell capture that could block movement.
- Prevented stale settings from re-enabling anchoring behavior by forcing:
  - `snapToEdgeEnabled = false`
  - `clickThroughPermanent = false`

## Files

- `src/App.tsx`
- `src/utils/helpers.ts`
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

## Validation

- `npm run build` passes
- `cargo check` passes

## Installer output

- `src-tauri/target/release/bundle/msi/Amiwi_0.8.19_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/Amiwi_0.8.19_x64-setup.exe`
