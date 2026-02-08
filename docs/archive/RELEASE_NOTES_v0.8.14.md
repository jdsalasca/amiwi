# Amiwi v0.8.14 - Critical Stability + UX Cleanup

Fecha: 2026-02-08

## Highlights
- Fix crítico para evitar popups de consola en Windows.
- Limpieza fuerte de UI/UX para reducir ruido y sobreposición.
- Ajustes simplificados (esencial + avanzado colapsable).
- Mascot-only visual para eliminar sensación de “cuadro feo”.

## Cambios principales
- Windows music detection backend:
  - `powershell` oculto y no interactivo.
  - `CREATE_NO_WINDOW` para suprimir ventanas de consola.
- Widget:
  - menos elementos superpuestos.
  - timer en posición estable.
  - se quitó una fila visual redundante.
- Settings:
  - controles esenciales visibles.
  - opciones avanzadas dentro de sección colapsable.
- Visual:
  - modo `mascot-only` para mejorar apariencia cuando panel está cerrado.

## Documentos de control
- `CRITICAL_FIXES_v0.8.13.md`

## Artefactos
- `src-tauri/target/release/bundle/msi/Amiwi_0.8.14_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/Amiwi_0.8.14_x64-setup.exe`

