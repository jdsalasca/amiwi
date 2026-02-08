# Amiwi v0.8.18 - Drag Unlock Hotfix

## Fixes

- Removed click-through interaction path that could leave the widget effectively non-draggable.
- Strengthened drag start handling with pointer events on the main shell.
- Kept native Tauri drag-region support on mascot container.
- Disabled browser image dragging on avatar to avoid drag conflicts.

## Files

- `src/App.tsx`
- `src/App.css`
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

## Validation

- `npm run build` passes
- `cargo check` passes

## Installer output

- `src-tauri/target/release/bundle/msi/Amiwi_0.8.18_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/Amiwi_0.8.18_x64-setup.exe`
