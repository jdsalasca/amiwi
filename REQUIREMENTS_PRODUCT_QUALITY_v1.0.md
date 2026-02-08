# Amiwi - Requerimientos de Calidad de Producto (v1.0)

Fecha: 2026-02-08
Baseline: v0.8.9
Objetivo: convertir Amiwi en un companion usable, bonito y consistente para uso diario.

## 1) Principios de producto
- Companion-first: la mascota y sus acciones deben ser visibles y útiles sin abrir paneles.
- Cero fricción: mover ventana, iniciar foco y abrir ajustes en 1 gesto.
- Calidad visual: estética liquid-glass coherente, limpia y tierna.
- Menos ruido: eliminar features que no aportan valor diario.

## 2) Decisiones de alcance inmediato
- Se elimina la carga manual de canciones y reproductor embebido.
- La reacción musical solo cuenta con señal del sistema.
- Si no hay detección nativa confiable, no se escala la funcionalidad de música.

## 3) Requerimientos funcionales prioritarios

### P0 - Usabilidad base (must-have)
- RF-01: La app debe moverse por toda la pantalla y entre monitores con drag directo sobre la mascota.
- RF-02: Las burbujas de acciones deben mostrarse en modo widget siempre que el panel esté cerrado.
- RF-03: La burbuja de cronómetro debe ser visible (cuando esté habilitada), en ejecución y en reposo.
- RF-04: Debe existir una burbuja dedicada para mover ventana (`move`).
- RF-05: Debe mantenerse un atajo global de rescate para abrir ajustes.

### P1 - Calidad visual y mascota
- RF-06: La UI debe mantener estilo liquid-glass con profundidad, brillo y legibilidad.
- RF-07: El avatar nunca debe caer en fallback ASCII; fallback debe ser una mascota visual cute real.
- RF-08: Tema visual por presets (`ocean`, `mint`, `rose`) coherente en botones y superficie.
- RF-09: Animaciones suaves con respeto a `prefers-reduced-motion`.

### P1 - Música del sistema (strict)
- RF-10: Reacción musical solo si método de detección es nativo válido.
- RF-11: Métodos heurísticos no deben disparar estado musical activo.
- RF-12: Mostrar estado de fuente musical solo cuando sea confiable.

## 4) Requerimientos no funcionales
- RNF-01: Interacciones core percibidas < 120ms.
- RNF-02: Build frontend y `cargo check` deben pasar en cada entrega.
- RNF-03: Sin bloqueos de interacción por click-through o snap durante movimiento.
- RNF-04: Fallbacks visuales sin texto “técnico” ni placeholders feos.

## 5) Criterios de aceptación
- CA-01: Usuario puede arrastrar la ventana entre pantallas con la mascota en menos de 2 segundos.
- CA-02: Usuario ve burbujas al abrir el widget sin entrar a settings.
- CA-03: Burbuja de cronómetro visible con estado `⏱` en reposo y `🍅/☕` en ejecución.
- CA-04: Si falla asset de avatar, sigue mostrándose un avatar real (no ASCII).
- CA-05: Sin archivo de música cargado manualmente en la experiencia.
- CA-06: Reacción musical solo activa con método nativo soportado.

## 6) Prioridad de ejecución recomendada
1. Usabilidad de movimiento + burbujas + cronómetro (P0).
2. Refinamiento visual liquid-glass y avatar cute fallback (P1 visual).
3. Endurecimiento de música nativa estricta (P1 música).

