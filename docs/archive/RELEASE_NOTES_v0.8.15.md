# Amiwi v0.8.15 - Critical UX Fixes from User Feedback

Fecha: 2026-02-08

## Resumen
Release centrada en corregir bloqueadores reales de uso reportados en QA visual:
- popup de ventanas de consola,
- dificultad para mover la app,
- sobreposición de elementos,
- panel de ajustes sobrecargado,
- sensación visual de “mascota encerrada”.

## Cambios principales
- Windows backend:
  - ejecución de PowerShell en modo oculto/no interactivo,
  - `CREATE_NO_WINDOW` para evitar ventanas emergentes.
- Movimiento:
  - drag nativo desde la mascota mantenido y más confiable.
- UI minimalista:
  - menos botones en modo principal,
  - eliminación de fila visual redundante.
- Layout:
  - timer reposicionado para evitar colisiones.
- Settings:
  - sección principal simplificada,
  - avanzados en bloque colapsable.
- Visual:
  - modo `mascot-only` para evitar “cuadro feo” cuando no hay panel.

## Documentación asociada
- `CRITICAL_FIXES_v0.8.13.md`

## Artefactos
- `src-tauri/target/release/bundle/msi/Amiwi_0.8.15_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/Amiwi_0.8.15_x64-setup.exe`

