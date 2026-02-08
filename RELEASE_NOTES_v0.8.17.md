# Amiwi v0.8.17 - Drag Hotfix

## Fixes

- Fixed avatar drag area so dragging is reliable on the full visible mascot body.
- Added native Tauri drag-region markers on mascot container for stronger drag behavior.
- Updated mascot geometry to match real visual bounds (no dead non-draggable zones).

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

- `src-tauri/target/release/bundle/msi/Amiwi_0.8.17_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/Amiwi_0.8.17_x64-setup.exe`
