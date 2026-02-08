# Amiwi v0.8.23 - Update Tooltip Fade + Hover Reappear

## UX

- Update tooltip now auto-fades after ~5s.
- After fade, it reappears only when hovering over action bubbles.
- Keeps UI minimal while preserving discoverability.

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
