# UX Requirements Checklist (v0.8 Iteration)

Fecha: 2026-02-07
Producto: Amiwi Desktop

## 1) Core UX del widget
- [x] Modo widget minimal por defecto (mascota + acciones rapidas).
- [x] Estilo visual modernizado tipo liquid-glass.
- [x] Experiencia flotante compacta sin paneles pesados por defecto.
- [x] Botones nativos de ventana (minimizar, agrandar/restaurar, cerrar).
- [x] Transparencia y always-on-top activados para uso diario.
- [x] Auto-hide/dormant configurable por inactividad.
- [x] Pulse temporal de click-through para no bloquear escritorio.
- [ ] Click-through permanente configurable por perfil.
- [ ] Snap inteligente de posicion al borde de pantalla.

## 2) Mascota, assets y expresion
- [x] Selector de avatar: cloud, pixel, blob, cat, bunny, fox.
- [x] Reaccion visual a musica.
- [x] Reaccion visual al alimentar.
- [x] Frases bonitas flotantes visibles en modo widget.
- [ ] Paquete premium de assets de alta calidad (idle/focus/celebrate/sleep).
- [ ] Variaciones por personalidad (calma, energetic, playful).

## 3) Productividad y compania
- [x] Pomodoro rapido desde widget.
- [x] Ajustes de duracion foco/descanso.
- [x] Frecuencia/tamano/opacidad de frases configurables.
- [x] Deteccion opcional de musica del sistema (beta).
- [ ] Mini reloj pomodoro siempre visible en modo ultra-minimal.
- [ ] Reacciones contextuales mas finas por nivel de carga y franja horaria.

## 4) Instalador y onboarding
- [x] Instalador Windows MSI + EXE generado.
- [x] Scripts de instalacion simplificada.
- [ ] Flujo instalacion one-click con opcion Quick recomendada por defecto.
- [ ] Onboarding 60s guiado con preview de modos.
- [ ] Selector de idioma en primer arranque (auto + manual).

## 5) Calidad y hardening
- [x] Build frontend OK.
- [x] Build Rust/Tauri OK.
- [x] Bundle instaladores OK.
- [ ] Suite automatizada E2E para widget/minimal/music/feed/pomodoro.
- [ ] Telemetria opt-in para medir friccion UX.
- [ ] Matriz QA formal Windows/macOS (DPI, multi-monitor, escalado).

## 6) Prioridad recomendada inmediata
1. Hardening UX: click-through permanente, snap, mini pomodoro persistente.
2. Calidad visual: mejorar pack de personajes/animaciones.
3. Onboarding e idioma auto-detect + selector rapido.
4. E2E + telemetria opt-in para validar retencion.
