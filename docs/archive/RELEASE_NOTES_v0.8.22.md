# Amiwi v0.8.22 - Update Tooltip UX Polish

## UX

- Added a visible mini liquid-glass tooltip above the green update arrow.
- Tooltip shows available version clearly (`New version vX`).
- Update remains fully user-controlled (no forced auto-install).

## Files

- `src/App.tsx`
- `src/App.css`
- `src/domain/config.ts`
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

## Validation

- `npm run build` passes
- `cargo check` passes
