# Amiwi Product Backlog

## P0 - Immediate (current sprint)

- [ ] Split `src/App.tsx` into domain modules and hooks.
  - Goal: reduce regression risk and accelerate iteration.
  - Done when: core logic (session, storage, interaction, updater) is extracted and covered by tests.

- [ ] Add automated testing baseline.
  - Goal: protect core behavior.
  - Done when: unit tests run in CI for settings loading, session durations, and pet profile behaviors.

- [ ] Add pull request CI quality gate.
  - Goal: catch failures before release tags.
  - Done when: PR workflow runs install, test, and build on each PR.

- [ ] Fix release installer scripts (`latest` and versioned).
  - Goal: reliable install path for Windows/macOS.
  - Done when: scripts resolve exact release assets via GitHub API and fail clearly if missing.

- [ ] Harden desktop security defaults.
  - Goal: reduce attack surface in Tauri app.
  - Done when: CSP is explicit (not `null`) and unused plugins/permissions are removed.

## P1 - Product value and retention

- [ ] Expand bond progression with visible milestones.
- [ ] Add useful daily memory summaries.
- [ ] Improve onboarding with adaptive profiles based on user intent.
- [ ] Improve system music detection reliability and trust messaging.

## P2 - Scale and growth

- [ ] Add settings schema migrations with versioning.
- [ ] Add privacy-safe analytics and event instrumentation.
- [ ] Expand pet personality system with modular profile packs.
