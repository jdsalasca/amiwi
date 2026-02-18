# UX Backlog - Product Final

## Visual Audit Findings
- Settings panel had low hierarchy: many controls appeared as a flat list.
- Primary action (start focus) was not clearly dominant in settings flow.
- Session feedback existed in widget but not surfaced clearly inside panel.
- Onboarding lacked visible step progress.

## Implemented Now
- [x] Reworked settings information architecture into sections:
  - `Sesion actual / Current session`
  - `Identidad y estilo / Identity and style`
  - `Preferencias rapidas / Quick preferences`
  - `Opciones avanzadas / Advanced options`
- [x] Added clear primary CTA for focus start/stop inside settings panel.
- [x] Added session progress bar and remaining time context.
- [x] Improved panel visual polish:
  - richer panel background
  - section cards
  - refined scrollbars
  - stronger hierarchy with title rows and status pill
- [x] Added onboarding step progress indicator (3-step tracker).

## Next P1 UX Improvements
- [ ] Add contextual empty states when no music/focus activity is detected.
- [ ] Add keyboard-first navigation order and focus rings audit.
- [ ] Add lightweight "reset this section" actions for each settings block.
- [ ] Improve bilingual microcopy consistency (ES/EN tone + accents).

## Next P2 UX Improvements
- [ ] Add progressive disclosure for power toggles (reduce option fatigue).
- [ ] Add user-safe guardrails for risky toggles (click-through, always-on-top).
- [ ] Add quick preset comparison modal with expected behavior preview.
