# UX Requirements Checklist (Next Improvements)

Fecha: 2026-02-07
Producto: Amiwi Desktop

## 1) Window & Widget UX
- [x] Widget mode por defecto (solo mascota visible al iniciar).
- [x] Botones de control de ventana (minimizar, agrandar/restaurar, cerrar) visibles en app.
- [x] Toggle rapido `Minimal/Expandir`.
- [x] Ventana redimensionable para adaptarse al flujo del usuario.
- [ ] Atajo global para mostrar/ocultar widget.
- [ ] Modo \"click-through\" opcional para no bloquear clics del escritorio.

## 2) Mascot & Visual Design
- [x] Selector de estilos de avatar.
- [x] Nuevas opciones solicitadas: `cloud` y `pixel`.
- [x] Assets visuales reales para `cloud` y `pixel` por estado (SVG).
- [x] Sustituir caras ASCII por assets visuales en todos los avatares disponibles.
- [ ] Biblioteca de personajes cute coherente (idle, focus, celebrate, hungry, sleep).
- [ ] Editor simple para elegir tema visual y tamaño por perfil.

## 3) Pomodoro & Focus UX
- [x] Pomodoro visible en modo widget con reloj/contador.
- [x] Botones Start/Stop accesibles desde widget.
- [x] Selector de presets (25/5, 50/10, custom) en UI.
- [x] Preset custom con minutos de foco/descanso configurables.
- [ ] Notificaciones visuales/sonoras suaves al cambiar fase.
- [ ] Historial de ciclos completados por dia/semana.

## 4) Phrases & Companion Behavior
- [x] Frases visibles en modo widget.
- [x] Frases ocasionales (configurables).
- [ ] Motor contextual avanzado (hora, energia, carga de trabajo).
- [ ] Modo \"silencioso\" inteligente durante reuniones/presentaciones.
- [ ] Variantes de tono por personalidad del avatar.

## 5) Pet Interaction
- [x] Sistema basico de hambre y accion de dar snack.
- [x] Reacciones del avatar al recibir comida.
- [ ] Mas interacciones: jugar, dormir, higiene, energia social.
- [ ] Inventario de snacks y recompensas cosmeticas.
- [ ] Balance de progresion para evitar fatiga de uso.

## 6) Installer & Onboarding
- [x] Guia de instalacion simplificada (`INSTALL.md`).
- [x] Script rapido para instalacion Windows y macOS.
- [x] Instalador Windows con modo `Quick` (silencioso) y guiado.
- [ ] Instalador macOS equivalente con perfil quick/advanced.
- [x] Primera ejecucion con preview/tour rapido de 30s.
- [x] Setup recomendado automaticamente por perfil sugerido.

## 7) Polish de calidad UX
- [ ] QA visual en Windows/macOS (escalado, DPI, multiple monitors).
- [ ] Accesibilidad base (teclado, contraste, labels).
- [ ] Telemetria opt-in de friccion UX (donde abandonan o cierran).
- [ ] Tests E2E para modos widget/full/settings.

## 8) Prioridad sugerida
1. Assets visuales reales de personaje + estados (impacto UX mayor).
2. Pomodoro presets y notificaciones suaves.
3. Mejoras de instalador y onboarding interactivo.
4. Interacciones pet avanzadas + progression.
5. Accesibilidad y hardening de calidad.
