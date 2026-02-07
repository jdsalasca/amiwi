# Amiwi - Master Plan de Construccion

Fecha base: 2026-02-07
Owner inicial: Equipo Amiwi
Estado: Draft ejecutable v1

## 1) Resumen ejecutivo
Amiwi es un companero virtual de escritorio para estudio y trabajo. Reduce friccion emocional y sostiene foco con presencia visual cute, frases utiles, micro-rituales y reaccion contextual.

## 2) Mision, vision y objetivo
### Mision
Acompañar a las personas mientras estudian o trabajan con apoyo emocional ligero, util y constante.

### Vision
Ser el companero virtual #1 en habla hispana y luego global, instalable en Windows/macOS y altamente personalizable.

### Objetivo anual
Lanzar Amiwi en Windows y macOS, validar PMF inicial y construir una base activa recurrente.

## 3) Alcance por prioridad
## P0 (lanzamiento de valor)
- Ventana flotante always-on-top y draggable.
- Avatar con estados emocionales.
- Frases contextuales locales.
- Onboarding rapido (idioma y tono).
- Ajustes persistentes (frecuencia, opacidad, tamano, idioma, tono).
- Modo foco 25/5.
- Instaladores Windows/macOS.

## P1 (retencion)
- Reaccion a musica del sistema.
- Biblioteca de packs de frases por mood.
- Skins y personalizacion avanzada.
- Estadisticas semanales y rutinas.

## P2 (escala y monetizacion)
- Tienda de temas/skins premium.
- Sistema de personajes descargables.
- Integraciones (Spotify, Calendar, Notion).
- Sincronizacion en cuenta.

## 4) Requerimientos
### Funcionales
- RF-01 Avatar flotante no intrusivo.
- RF-02 Cambio de expresion por contexto.
- RF-03 Frases por modo/tono/idioma.
- RF-04 Onboarding y cambio de idioma.
- RF-05 Persistencia local de settings.
- RF-06 Temporizador de foco.
- RF-07 Instaladores para Windows y macOS.

### No funcionales
- RNF-01 Arranque rapido.
- RNF-02 Bajo consumo de recursos.
- RNF-03 UX fluida y estable.
- RNF-04 Privacidad por defecto (sin datos sensibles).
- RNF-05 i18n desde dia 1.

## 5) Estrategia de producto y tecnica
- Principio: valor en menos de 3 minutos.
- Stack: Tauri + React + TypeScript.
- i18n local por JSON (`es`, `en`).
- Arquitectura modular para escalar a P1/P2.

## 6) Marketing y GTM
### Posicionamiento
"Amiwi: tu companero cute de foco para estudiar y trabajar."

### Canales iniciales
- TikTok / Reels con demos cortas.
- Comunidades de estudiantes y devs.
- Product Hunt y X.

### Growth
- Referidos con recompensas cosmeticas.
- Retos semanales de foco.
- UGC de setups y personajes.

## 7) KPIs
- Activacion D1 (onboarding completado).
- Retencion D7 y D30.
- Minutos foco por usuario.
- Crash-free rate y tiempo de arranque.

## 8) Plan 90 dias
- Semanas 1-4: MVP P0 funcional y empaquetado.
- Semanas 5-8: beta cerrada, rendimiento, feedback.
- Semanas 9-12: ajustes finales y lanzamiento publico.

## 9) Estado actual (v0.1.0)
Completado en esta version:
- Base Tauri + React + TS.
- UI cute funcional con caritas/estados.
- Motor de frases local en `es/en` por modo y tono.
- Onboarding inicial.
- Settings persistentes.
- Modo foco 25/5.
- Build de instaladores Windows validado.
