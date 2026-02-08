# Amiwi v0.8.12 - Liquid-Glass Quality Upgrade

Fecha: 2026-02-08

## Highlights
- Rework visual liquid-glass con más profundidad y brillo reactivo.
- Mejor claridad de foco con barra de progreso de sesión en widget.
- Pulido de UX para percepción premium y uso diario más claro.

## Cambios principales
- Superficie glass reactiva al cursor:
  - highlight dinámico por posición (`--glass-x`, `--glass-y`)
  - capa de profundidad animada (`liquidFloat`)
- Estado de foco reforzado:
  - estilo `focus-running` con glow contextual.
  - barra de progreso de sesión con porcentaje visible.
- Limpieza de estilos legacy no utilizados para mantener base más mantenible.

## Archivos clave
- `src/App.tsx`
- `src/App.css`

## Artefactos
- `src-tauri/target/release/bundle/msi/Amiwi_0.8.12_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/Amiwi_0.8.12_x64-setup.exe`

