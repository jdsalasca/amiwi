# Amiwi - Requerimientos de Impacto y Acogida (v1.1)

Fecha: 2026-02-08
Meta: pasar de “widget funcional” a “companion memorable” para publicación abierta.

## 1) Objetivo de impacto
- Primera impresión fuerte en 10 segundos.
- Valor claro en 1 minuto de uso.
- Razón para volver diariamente sin fricción.

## 2) Requerimientos de producto (priorizados)

### P0 - Publicable
- RQ-01: Movimiento 100% confiable entre monitores en cualquier modo.
- RQ-02: Widget con acciones visibles por defecto (foco, snack, frase, mover, ajustes).
- RQ-03: Cronómetro visible y legible en reposo y ejecución.
- RQ-04: No mostrar features de bajo valor (sin carga manual de canciones).
- RQ-05: Reacción musical solo en señal nativa confiable.

### P1 - Encanto y retención
- RQ-06: Paquete visual unificado de mascota (idle/focus/celebrate/tired) con calidad consistente.
- RQ-07: Micro-progreso diario visible (foco/snacks/sesiones) dentro del widget.
- RQ-08: Presets de experiencia en 1 clic (`Focus`, `Calm`, `Cozy`).
- RQ-09: Modo “quiet” nocturno automático (menos animación y frases).

### P2 - Diferenciación
- RQ-10: Animaciones de transición entre estados del avatar (crossfade o sprite step).
- RQ-11: Biblioteca de skins/personas descargables.
- RQ-12: Sistema de recompensas cosméticas por constancia.

## 3) Criterios de aceptación
- CA-01: Usuario puede mover Amiwi entre pantallas sin quedar “pegado” ni pelear con snap.
- CA-02: Usuario entiende acciones principales sin abrir settings.
- CA-03: Usuario percibe progreso diario sin salir del widget.
- CA-04: UI mantiene coherencia visual liquid-glass en desktop y resoluciones comunes.
- CA-05: Build frontend + `cargo check` + `tauri build` pasan sin error.

## 4) Métricas recomendadas
- Activación D1 >= 70%
- Retención D7 >= 45%
- Uso diario del widget >= 62%
- Sesiones con acción companion (foco/snack/frase) >= 55%

