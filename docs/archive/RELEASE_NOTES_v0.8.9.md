# Amiwi v0.8.9 - Release Notes

Fecha de release: 2026-02-08
Build: Desktop (Tauri) Windows x64

## Highlights
- Movimiento real de la app entre monitores, sin quedarse bloqueada en una sola pantalla.
- Nuevo control `↕` en burbujas para mover la ventana completa.
- Atajo de interacción: `Shift + drag` sobre la mascota para arrastrar la ventana del desktop.
- Mejoras en la detección de música del sistema (ruta nativa primero + fallback robusto).
- Instalador con branding actualizado usando imagen de gatito.

## Cambios funcionales
- Bubble module `move` agregado al widget minimal.
- Snap al borde ajustado para no interrumpir movimiento entre pantallas.
- Modelo de settings consolidado para:
  - `clickThroughPermanent`
  - `snapToEdgeEnabled`
  - `snapMarginPx`
  - `themePreset`
  - `bubbleModules`

## Instalador y branding
- Íconos de app/instalador regenerados desde imagen personalizada.
- NSIS:
  - `installerIcon`
  - `headerImage`
  - `sidebarImage`
- WiX MSI:
  - `bannerPath`
  - `dialogImagePath`

## Artefactos generados
- `src-tauri/target/release/bundle/msi/Amiwi_0.8.9_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/Amiwi_0.8.9_x64-setup.exe`

## Nota operativa
- En modo ultra-minimal, para mover ventana:
  - usa burbuja `↕`, o
  - mantén `Shift` mientras arrastras la mascota.

