# OPTIMIZATION_STABILITY_PLAN_v0.8.2

Fecha: 2026-02-07
Objetivo: entregar una app usable todos los dias, visualmente cuidada y estable.

## P0 (ejecutado en 0.8.2)
- [x] Reducir overhead de interaccion con throttle en eventos de mouse.
- [x] Evitar recreacion innecesaria de recursos de audio (AudioContext reutilizable).
- [x] Mejorar robustez de acciones primarias con botones `type=button`.
- [x] Reducir costo de render visual (blur/sombra/animaciones ajustadas).
- [x] Soporte `prefers-reduced-motion` para estabilidad en equipos sensibles.

## P1 (siguiente entrega)
- [ ] Instrumentar metricas locales de CPU/FPS en modo debug.
- [ ] Virtualizar/limitar panel de settings cuando no esta visible.
- [ ] Sustituir deteccion beta de musica por API nativa por SO.
- [ ] Ajustar colas de frases para evitar solapamiento en sesiones largas.

## P2 (producto premium)
- [ ] Pipeline de assets optimizados (SVGO + empaquetado por densidad).
- [ ] Perfil de energia (modo battery saver).
- [ ] A/B testing visual para conversion de onboarding.

## Checklist de validacion para release
- [x] `npm run build`
- [x] `cargo check`
- [x] `npm run tauri build`
- [ ] Smoke test manual 45 min continuo (pendiente usuario interno)
- [ ] Prueba DPI alta + multi-monitor (pendiente QA)
