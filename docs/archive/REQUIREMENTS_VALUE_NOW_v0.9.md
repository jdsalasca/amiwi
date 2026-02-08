# Amiwi - Requerimientos de Valor Inmediato (v0.9)

Fecha: 2026-02-08
Baseline: v0.8.8
Objetivo: maximizar valor percibido diario y retención en las próximas iteraciones.

## 1) Resultado de negocio esperado
- Incrementar uso diario del widget en sesiones reales de trabajo/estudio.
- Reducir fricción de interacción (menos clics para acciones clave).
- Mejorar confianza del usuario en la reacción musical del sistema.

## 2) Requerimientos funcionales priorizados

### P0 (impacto inmediato)
- RF-P0-01: Detección musical robusta por OS con estado real (`playing/paused`) y nombre de fuente legible.
- RF-P0-02: Click-through permanente con indicador visual claro de estado + salida segura siempre accesible.
- RF-P0-03: Snap inteligente configurable por monitor con restauración estable de posición.
- RF-P0-04: Perfil rápido de uso (`study`, `deep work`, `soft-care`) que ajuste frases/frecuencia/burbujas en 1 clic.
- RF-P0-05: Mini reloj pomodoro opcional persistente en ultra-minimal (visible sin abrir panel).

### P1 (retención y personalización)
- RF-P1-01: Programación de “horas activas” para frases (evitar interrupciones nocturnas).
- RF-P1-02: Biblioteca de packs de frases por personalidad (calma, energía, playful).
- RF-P1-03: Modo “quiet hours” con reducción automática de animaciones y mensajes.
- RF-P1-04: Ajuste rápido de tamaño S/M/L desde burbuja o menú compacto.

### P2 (escalamiento)
- RF-P2-01: Integración opcional con calendario (solo estado ocupado/libre).
- RF-P2-02: Sincronización de settings en cuenta (opt-in).

## 3) Requerimientos no funcionales (enfocados en valor)
- RNF-01: Respuesta visual de acciones core < 120ms percibidos.
- RNF-02: Detección musical actualizada <= 3s en estado normal.
- RNF-03: CPU idle objetivo < 3% en equipos medios.
- RNF-04: 99.6% de sesiones sin crash.
- RNF-05: Privacidad por defecto: todo local salvo features explícitamente opt-in.

## 4) Criterios de aceptación de próxima entrega
- CA-01: Usuario puede activar/desactivar click-through permanente y recupera control por atajo global sin fallos.
- CA-02: Snap respeta margen configurado y recuerda posición por monitor entre reinicios.
- CA-03: Reacción musical no marca “activa” cuando el reproductor está pausado en casos soportados por API nativa.
- CA-04: Usuario puede cambiar perfil rápido y percibe cambio inmediato en comportamiento del widget.
- CA-05: Mini reloj pomodoro aparece en ultra-minimal cuando está activo y no tapa acciones principales.

## 5) Instrumentación mínima recomendada (opt-in)
- Evento: `profile_selected` (perfil elegido).
- Evento: `music_detect_state_changed` (source, active, method).
- Evento: `click_through_toggled`.
- Evento: `snap_applied`.
- Evento: `pomodoro_started` / `pomodoro_completed`.

## 6) Orden recomendado de ejecución (2 sprints)
1. Sprint 1: RF-P0-01, RF-P0-02, RF-P0-03 + CA-01/02/03.
2. Sprint 2: RF-P0-04, RF-P0-05, RF-P1-01 + CA-04/05.

## 7) KPIs para validar valor
- Activación D1 >= 68%
- Retención D7 >= 43%
- Uso diario de modo widget >= 60%
- % usuarios con interacción diaria (burbujas/pomodoro/feed) >= 50%
- Precisión percibida de música (feedback beta) >= 80% “correcta”

