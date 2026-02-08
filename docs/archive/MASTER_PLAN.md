# Amiwi - Master Plan de Construccion

Fecha base: 2026-02-07
Owner inicial: Equipo Amiwi
Estado: Draft ejecutable v3

## 1) Resumen ejecutivo
Amiwi es un companion virtual de escritorio para estudio y trabajo. Reduce friccion emocional y sostiene foco con presencia visual cute, frases utiles, micro-rituales y reacciones contextuales.

## 2) Mision, vision y objetivo
### Mision
Acompañar a las personas mientras estudian o trabajan con apoyo emocional ligero, util y constante.

### Vision
Ser el companion virtual #1 en habla hispana y luego global, instalable en Windows/macOS y altamente personalizable.

### Objetivo anual
Lanzar Amiwi en Windows y macOS, validar PMF inicial y construir una base activa recurrente.

## 3) Alcance por prioridad
## P0 (lanzamiento de valor)
- Ventana flotante always-on-top y draggable.
- Avatar con estados emocionales.
- Frases contextuales locales.
- Onboarding rapido (idioma y tono).
- Ajustes persistentes.
- Modo foco 25/5.
- Instaladores Windows/macOS.

## P1 (retencion)
- Reaccion a musica.
- Biblioteca de frases por mood.
- Estadisticas semanales.
- Rutinas de uso diario.

## P1.5 (expansion de experiencia)
- Modo minimalista.
- Avatares seleccionables.
- Interaccion de cuidado (dar snack + hambre).
- Frases ocasionales configurables.
- Minimizacion rapida del floating.
- Flujo de instalacion simplificado.

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
- RF-05 Persistencia local de settings, stats y pet state.
- RF-06 Temporizador de foco.
- RF-07 Reaccion musical durante reproduccion.
- RF-08 Deteccion musical del sistema (beta).
- RF-09 Interaccion "dar snack" + hambre.
- RF-10 Instaladores para Windows y macOS.

### No funcionales
- RNF-01 Arranque rapido.
- RNF-02 Bajo consumo de recursos.
- RNF-03 UX fluida y estable.
- RNF-04 Privacidad por defecto.
- RNF-05 i18n desde dia 1.

## 5) Estrategia de producto y tecnica
- Principio: valor en menos de 3 minutos.
- Stack: Tauri + React + TypeScript.
- i18n local por JSON (`es`, `en`).
- Arquitectura modular para escalar a P2.

## 6) Marketing y GTM
### Posicionamiento
"Amiwi: tu companion cute de foco para estudiar y trabajar."

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
- Minutos con musica por usuario.
- Uso de minimal mode y interacciones pet.
- Crash-free rate y tiempo de arranque.

## 8) Plan 90 dias
- Semanas 1-4: MVP P0 funcional y empaquetado.
- Semanas 5-8: P1 (music + stats) y beta cerrada.
- Semanas 9-12: P1.5 (minimal, pet, assets), quality hardening y lanzamiento amplio.

## 9) Estado actual (v0.3.0)
Completado en esta version:
- Base Tauri + React + TS.
- UI cute funcional con caritas/estados.
- Motor de frases local en `es/en` por modo y tono.
- Onboarding inicial.
- Settings persistentes.
- Modo foco 25/5.
- Music Reactor local.
- Deteccion de musica del sistema (beta por presencia de procesos).
- Modo minimalista + minimizar rapido.
- Avatares seleccionables (`blob`, `cat`, `bunny`, `fox`).
- Interaccion de snack y barra de hambre.
- Estadisticas semanales persistentes (foco/musica/snacks/racha).
- Build de instaladores Windows validado.
