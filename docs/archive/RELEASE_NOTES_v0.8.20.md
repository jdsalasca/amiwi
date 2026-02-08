# Amiwi v0.8.20 - Automatic Updates Enabled

## What is now implemented

- Automatic update check on app startup.
- User prompt when a newer version is available.
- One-click in-app update download and install.
- Automatic app relaunch after successful update installation.

## Secure update pipeline

- Integrated Tauri updater plugin.
- Integrated Tauri process plugin for relaunch.
- Enabled updater artifact signing (`.sig`) in build config.
- Configured updater endpoint to GitHub latest release `latest.json`.
- Added signing secrets in GitHub repository for CI release signing.

## Important product note

Automatic desktop updates cannot safely come from raw repo source code.
They must come from built and signed artifacts. This release enables that flow.

## Files changed

- `.github/workflows/release.yml`
- `src/App.tsx`
- `src-tauri/tauri.conf.json`
- `src-tauri/src/lib.rs`
- `src-tauri/capabilities/default.json`
- `package.json`
- `src-tauri/Cargo.toml`

## Validation

- `npm run build` passes
- `cargo check` passes
- `npm run tauri build` generates installers and updater signatures

## Installer output

- `src-tauri/target/release/bundle/msi/Amiwi_0.8.20_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/Amiwi_0.8.20_x64-setup.exe`
