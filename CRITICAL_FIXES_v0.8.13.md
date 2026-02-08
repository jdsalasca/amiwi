# Amiwi - Fallas Críticas y Solución (v0.8.13)

Fecha: 2026-02-08

## 1) Bug crítico: ventanas CMD/PowerShell emergentes
- Síntoma: aparecen múltiples ventanas de consola y se cierran automáticamente.
- Causa: detección musical en Windows lanzando `powershell` sin modo oculto.
- Solución aplicada:
  - `-WindowStyle Hidden`
  - `-NonInteractive`
  - `creation_flags(CREATE_NO_WINDOW)`
- Archivo: `src-tauri/src/lib.rs`

## 2) Ventana difícil de mover
- Síntoma: el widget parecía atrapado en un cuadro.
- Solución aplicada:
  - drag nativo desde mascota mantenido;
  - reducción de interferencia por snap;
  - modo visual `mascot-only` para eliminar percepción de caja rígida.
- Archivos: `src/App.tsx`, `src/App.css`

## 3) Sobreposición de iconos/elementos
- Síntoma: acciones, timer y chips visuales se montaban.
- Solución aplicada:
  - timer reposicionado a zona superior estable;
  - retiro de fila extra de chips del área principal;
  - limpieza de densidad visual en widget.
- Archivos: `src/App.tsx`, `src/App.css`

## 4) Ajustes con ruido excesivo
- Síntoma: panel de settings con demasiadas opciones visibles.
- Solución aplicada:
  - panel principal reducido a controles esenciales;
  - opciones avanzadas movidas a `details` colapsable.
- Archivo: `src/App.tsx`

## 5) Estado actual recomendado para QA
- Verificar 10 ciclos de detección musical en Windows sin popup de consola.
- Mover Amiwi entre monitores con drag de mascota.
- Validar que el timer no colisiona visualmente con burbujas.
- Validar apertura/cierre de bloque avanzado de ajustes.

