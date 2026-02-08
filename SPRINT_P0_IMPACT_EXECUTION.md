# Amiwi - Sprint P0 Impacto (Ejecución)

Fecha: 2026-02-08
Baseline: v0.8.10

## Objetivo del sprint
Entregar un widget companion publicable con valor visible en 1 minuto: movimiento confiable, acciones claras, timer útil y música del sistema confiable.

## Backlog ejecutable
| ID | Tarea técnica | Archivos objetivo | Validación | Estado |
|---|---|---|---|---|
| IMP-01-A | Endurecer drag multi-monitor (sin interferencia snap durante drag) | `src/App.tsx` | mover entre 2 pantallas 10 veces sin rebote | Done |
| IMP-01-B | Mantener snap opcional, desactivado por defecto | `src/domain/config.ts` | nuevo perfil inicia con snap OFF | Done |
| IMP-02-A | Mostrar burbujas en widget con panel cerrado | `src/App.tsx`, `src/App.css` | acciones visibles al abrir app | Done |
| IMP-03-A | Timer bubble persistente en reposo + running | `src/App.tsx`, `src/App.css` | `⏱` en reposo, `🍅/☕` en foco/descanso | Done |
| IMP-04-A | Reacción musical solo por método nativo confiable | `src/App.tsx`, `src-tauri/src/lib.rs` | sin falsos positivos con método no nativo | Done |
| IMP-04-B | Exponer estado/método musical en panel para transparencia | `src/App.tsx`, `src/domain/config.ts`, `src/App.css` | panel muestra método y confiabilidad | Done |
| IMP-05-A | Presets rápidos de experiencia (Focus/Calm/Cozy) | `src/App.tsx`, `src/App.css` | 1 click cambia comportamiento visual/ritmo | Done |
| IMP-06-A | Indicador de progreso diario (foco/snacks) | `src/App.tsx`, `src/App.css` | contador visible y reset diario | Done |

## Definición de terminado (DoD)
- `npm run build` pasa sin error.
- `cargo check` pasa sin error.
- `npm run tauri build` genera MSI + EXE.
- Verificación manual:
  - movimiento entre monitores OK,
  - timer visible y legible,
  - burbujas funcionales sin abrir settings,
  - música solo activa con método nativo confiable.
