# Amiwi Requirements v0.8.0

Fecha: 2026-02-07
Producto: Amiwi
Tipo: Companion desktop para estudio y trabajo

## 1) Mission
Acompañar a las personas mientras estudian y trabajan con una mascota virtual cute que mejore foco, estado de animo y constancia sin friccion.

## 2) Vision
Ser el companion de escritorio mas querido para productividad emocional: ligero, bonito, util y presente en el dia a dia de usuarios en Windows y macOS.

## 3) Objetivo de producto (12 meses)
- Construir una experiencia companion-first que se mantenga activa durante sesiones reales de trabajo/estudio.
- Validar retencion y uso diario con un loop simple: presencia + frases + foco + cuidado.
- Entregar distribucion simple e instalacion sin friccion en Windows/macOS.

## 4) Estrategia
1. Valor inmediato: widget minimal + companion visual + frases bonitas + pomodoro rapido.
2. Habit loop: interacciones de cuidado (snack/reacciones), micro-refuerzo emocional y progreso.
3. Friccion minima: instalador facil, onboarding corto, idioma automatico.
4. Calidad: estabilidad, bajo consumo, UX consistente en multipantalla.

## 5) Posicionamiento y marketing
- Claim: "Amiwi, tu companion cute para foco y bienestar diario".
- ICP inicial: estudiantes universitarios y trabajadores remotos 18-35.
- Go-to-market inicial:
  - demos cortas semanales (music reaction, pomodoro, pet care)
  - beta cerrada con feedback continuo
  - contenido social con before/after del workflow.

## 6) Scope release actual (v0.8.0)
### Entregado
- Widget minimal liquid-glass por defecto.
- Frases flotantes contextuales con configuracion.
- Reaccion a musica (local + opcion deteccion sistema beta).
- Interaccion de snack con reacciones.
- Pomodoro rapido en widget.
- Auto-hide por inactividad y click-through pulse.
- Instaladores Windows MSI/EXE generados.

### Fuera de scope v0.8.0
- Deteccion multimedia nativa robusta por OS.
- Onboarding guiado completo y selector idioma de primer uso.
- Sistema completo de progreso/gamificacion.

## 7) Requerimientos funcionales priorizados
### P0 (must-have)
- [x] El companion debe iniciar en modo widget minimal.
- [x] Debe permanecer always-on-top y ser no intrusivo.
- [x] Debe mostrar frases ocasionales configurables.
- [x] Debe permitir accion de alimentar y reaccion visual.
- [x] Debe ofrecer pomodoro start/stop rapido.
- [x] Debe reaccionar cuando detecta musica.
- [x] Debe incluir controles de ventana (min, max, close).
- [x] Debe generar instalador funcional Windows.

### P1 (should-have)
- [ ] Idioma auto + selector manual en onboarding.
- [ ] Click-through permanente con shortcut de seguridad.
- [ ] Snap automatico al borde de pantalla.
- [ ] Biblioteca visual de personajes premium por estados.
- [ ] Onboarding guiado de 60 segundos.

### P2 (nice-to-have)
- [ ] Integracion con calendario/tareas.
- [ ] Sincronizacion cloud de configuracion.
- [ ] Marketplace de skins/frases comunitarias curadas.

## 8) Requerimientos no funcionales
- Rendimiento:
  - inicio de app < 3s en hardware medio.
  - consumo idle objetivo < 3% CPU promedio.
- Estabilidad:
  - crash-free sessions >= 99.6%.
- UX:
  - interacciones core en <= 1 click desde widget.
- Distribucion:
  - instalacion Windows en <= 90s con flujo quick.

## 9) Criterios de aceptacion v0.8.0
- Build frontend, cargo check y tauri build pasan sin error.
- App abre en modo minimal con compañero visible.
- Usuario puede iniciar/detener pomodoro y dar snack.
- Frases flotantes aparecen sin bloquear uso principal del escritorio.
- Instaladores MSI y EXE se generan correctamente.

## 10) Metricas de exito
- Activacion D1 >= 65%
- Retencion D7 >= 40%
- Retencion D30 >= 22%
- % sesiones en modo widget >= 55%
- % usuarios que alimentan/interactuan >= 45%

## 11) Riesgos y mitigaciones
- Riesgo: deteccion de musica inexacta.
  - Mitigacion: implementar APIs nativas por OS (P0 siguiente).
- Riesgo: companion intrusivo en flujo de trabajo.
  - Mitigacion: auto-hide, click-through, modo silencioso.
- Riesgo: percepcion visual inconsistente por assets.
  - Mitigacion: paquete artistico unificado y QA visual por resolucion.
