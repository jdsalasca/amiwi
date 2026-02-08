# Amiwi v0.8.24 - Critical Windows Dragging Fix

## Critical fix

- Window dragging is now enabled from almost the entire non-interactive surface, not only mascot pixels.
- Decorative overlay bubbles no longer intercept pointer events.
- This removes the "anchored / cannot move" behavior reported on Windows.

## Technical changes

- Added shell-level pointer capture path to start manual window dragging.
- Kept controls exclusion (`button`, `input`, `select`, etc.) to avoid accidental drag on settings/actions.
- Removed drag-region dependency from mascot itself to avoid conflicts with manual movement path.
- Set `pointer-events: none` on non-interactive overlays:
  - floating phrase
  - timer bubble
  - update tip
  - music reactive bubble
  - session progress

## Files

- `src/App.tsx`
- `src/App.css`
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

## Validation

- `npm run build` passes
- `cargo check` passes
