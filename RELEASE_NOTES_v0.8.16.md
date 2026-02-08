# Amiwi v0.8.16 - Minimal Bubble UX + Drag Reliability

## What improved

- Full-window drag reliability in mascot mode:
  - You can now drag Amiwi from any non-interactive visible area, not only from a tiny zone.
  - This improves moving the app across the desktop and between monitors.
- Minimal bubble-first UI pass:
  - Reduced quick actions to only two core controls: Focus and Settings.
  - Tightened bubble sizing/spacing and reduced visual noise.
- Cleaner settings hierarchy:
  - Primary panel now keeps only core controls.
  - Advanced options are still available under a collapsible section.
- Mascot visual quality upgrade (cat set):
  - Replaced ASCII-style faces with handcrafted vector expressions.
  - Better visual consistency with liquid-glass bubble language.
- Product footprint refinement:
  - Slightly smaller default compact window size for the floating companion mode.

## Files touched

- `src/App.tsx`
- `src/App.css`
- `src/domain/config.ts`
- `public/avatars/cat/happy.svg`
- `public/avatars/cat/focus.svg`
- `public/avatars/cat/break.svg`
- `public/avatars/cat/tired.svg`
- `public/avatars/cat/celebrate.svg`
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

## Validation

- `npm run build` passes
- `cargo check` passes

## Installer output (expected path pattern)

- `src-tauri/target/release/bundle/msi/Amiwi_0.8.16_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/Amiwi_0.8.16_x64-setup.exe`
