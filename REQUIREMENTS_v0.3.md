# Amiwi Requirements v0.3

Fecha: 2026-02-07  
Release objetivo: v0.3.0  
Estado: Implementado (baseline) + plan incremental

## 1) Objetivo del release
Entregar un companion de escritorio mas vivo y util: reaccion a musica del sistema (beta), modo minimalista, avatar seleccionable por assets, interaccion de cuidado (dar de comer), reacciones contextuales y flujo mas facil para minimizar e instalar.

## 2) Requerimientos funcionales
- RF-101: Detectar actividad musical del sistema (beta, best-effort por proceso) en Windows/macOS.
- RF-102: Reaccionar visualmente con estados/frases cuando haya musica activa.
- RF-103: Permitir modo minimalista para reducir ruido visual.
- RF-104: Permitir seleccion de avatar/asset pack (`blob`, `cat`, `bunny`, `fox`).
- RF-105: Emitir frases ocasionales aparte de frases por frecuencia.
- RF-106: Soportar interaccion `dar snack` y mostrar nivel de hambre.
- RF-107: Actualizar reacciones segun hambre (estado cansado/frases de hambre).
- RF-108: Proveer boton de minimizar rapido del floating.
- RF-109: Persistir configuraciones y estados (settings, stats, pet).
- RF-110: Incluir guia de instalacion simplificada con scripts.

## 3) Requerimientos no funcionales
- RNF-101: Mantener arranque rapido y UI fluida para companion siempre visible.
- RNF-102: Mantener compatibilidad Windows/macOS para build de release.
- RNF-103: Evitar uso de datos personales sensibles; datos locales por defecto.
- RNF-104: Evitar bloqueos por errores de deteccion musical (fallback seguro).

## 4) Criterios de aceptacion
- CA-101: El usuario puede activar/desactivar deteccion musical del sistema.
- CA-102: El avatar cambia a modo celebracion cuando hay musica activa.
- CA-103: El usuario puede alternar Minimal/Expandir desde el header.
- CA-104: El usuario puede cambiar avatar desde onboarding y settings.
- CA-105: El usuario puede dar snack y el hambre sube inmediatamente.
- CA-106: El hambre baja con el tiempo y produce frases de hambre.
- CA-107: El boton minimizar funciona en desktop build.
- CA-108: `INSTALL.md` y scripts de instalacion quedan en repo.

## 5) Limitaciones actuales
- Deteccion de musica del sistema es `process_presence_beta`: detecta apps musicales en ejecucion, no confirma reproduccion real en todos los casos.
- Script de instalacion macOS requiere disponibilidad de artefacto DMG publicado para la version indicada.

## 6) Trazabilidad a implementacion
- Deteccion sistema: `src-tauri/src/lib.rs`
- Companion UI y logica P1/P1.5: `src/App.tsx`, `src/App.css`
- Textos i18n: `src/locales/es.json`, `src/locales/en.json`
- Instalacion simplificada: `INSTALL.md`, `scripts/install-windows.ps1`, `scripts/install-macos.sh`
