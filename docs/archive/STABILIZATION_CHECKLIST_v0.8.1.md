# STABILIZATION_CHECKLIST_v0.8.1

Fecha: 2026-02-07
Objetivo: estabilizar Amiwi para uso diario real (rapido, confiable, util)

## P0 - Bloqueadores de producto (resueltos en 0.8.1)
- [x] Botones de ventana no responden por `data-tauri-drag-region` mal aplicado.
- [x] Rutas de SVG fragiles en build empaquetado (resolucion con `BASE_URL`).
- [x] Deteccion de musica potencialmente bloqueante (timeout + `spawn_blocking`).
- [x] Polling de auto-hide agresivo (refactor a timeout por interaccion).

## P1 - Calidad UX inmediata
- [ ] Test manual guiado por escenario: 30 min uso continuo sin freeze.
- [ ] Reducir mas complejidad visual en hardware bajo.
- [ ] Medicion de FPS/CPU en idle y con panel abierto.
- [ ] Mejorar coherencia visual de assets por avatar.

## P2 - Producto y valor
- [ ] Onboarding breve con perfil recomendado + idioma automatico.
- [ ] Modo ultra-minimal (solo mascota + reloj).
- [ ] Reacciones companion mas ricas (jugar/dormir/higiene).
- [ ] Telemetria opt-in para priorizar roadmap por datos reales.

## Criterios de salida de estabilizacion
- [ ] Cero bloqueos reportados en smoke tests de 1 hora.
- [ ] CPU idle objetivo < 3% en equipos medios.
- [ ] Tiempo de respuesta de botones < 100ms percibidos.
- [ ] Carga de avatar correcta en Windows y macOS.
