# Amiwi v0.8.21 - User-Controlled Update Bubble (Liquid Glass)

## UX changes

- Removed automatic update install popup flow.
- Added a green liquid-glass update bubble with arrow when a new version is available.
- Update installation is now explicit user choice.
- During install, bubble switches to loading state and app relaunches after success.

## Technical

- Startup update check still runs automatically in background.
- If update is found, app stores update object and exposes it through bubble actions.
- Added localized copy for update states (ES/EN).

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
