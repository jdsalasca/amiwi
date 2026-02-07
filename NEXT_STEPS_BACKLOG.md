# NEXT STEPS BACKLOG

Fecha: 2026-02-07
Baseline actual: v0.2.0

## 1) Quality Backlog
### Q-P0 (proximo sprint)
- [ ] Suite de tests unitarios para motor de frases, timer foco y calculo de racha.
- [ ] Tests e2e basicos (onboarding, settings persistencia, flujo foco 25/5).
- [ ] Error boundary y manejo de fallos en carga de audio.
- [ ] Telemetria opt-in minima (eventos de activacion/retencion) sin PII.
- [ ] Perf budget formal: arranque < 5s, RAM objetivo < 250MB.

### Q-P1
- [ ] Crash reporting anonimo con opt-in.
- [ ] Trazas de diagnostico exportables por usuario.
- [ ] Soporte accesibilidad base (teclado, contraste, labels).
- [ ] Matriz QA Windows/macOS (versiones de OS y hardware objetivo).

### Q-P2
- [ ] Hardened CI/CD con firma de binarios y SBOM.
- [ ] Pruebas de regresion visual automatizadas.

## 2) Users Backlog (activation + retention)
### U-P0 (proximo sprint)
- [ ] Onboarding V2 con preview de personalidad antes de terminar.
- [ ] Primer "Aha moment" en < 60s (frase + micro logro + primer foco).
- [ ] Nudge inteligente de regreso cuando el usuario abandona foco.
- [ ] Dashboard semanal mas claro (racha, comparativo y objetivo semanal).

### U-P1
- [ ] Packs de personalidad (Dulce, Coach, Zen, Gamer).
- [ ] Rutinas configurables de inicio y cierre de jornada.
- [ ] Sistema de recompensas cosmeticas por constancia.

### U-P2
- [ ] Comunidad/galeria para compartir setups y packs.
- [ ] Cuenta opcional para sync entre equipos.

## 3) Positioning Backlog (go-to-market)
### P-P0 (proximo sprint)
- [ ] Definir narrativa unica: "acompanamiento emocional + foco ligero".
- [ ] Landing page con demo de 30s y CTA de descarga.
- [ ] Kit de contenido social (15 clips para 30 dias).
- [ ] Programa beta con 50 usuarios (estudiantes + remoto).

### P-P1
- [ ] Lanzamiento coordinado en Product Hunt, X y Discords target.
- [ ] Partnership con comunidades de estudio/productividad.
- [ ] Benchmark mensual contra apps companion/productivity.

### P-P2
- [ ] Estrategia de marca creator-friendly (skins UGC + marketplace).
- [ ] Expansion idioma 3 y 4 por prioridad de mercado.

## 4) Product/Tech Next Steps
### PT-P0 (proximo sprint)
- [ ] Deteccion de musica del sistema (sin depender de reproductor interno) por plataforma.
- [ ] Integrar atajos globales (start/stop foco, mute frases).
- [ ] Mejorar arquitectura por modulos (`core`, `features`, `infra`).

### PT-P1
- [ ] Integracion opcional Spotify y calendario.
- [ ] Experimentos A/B de frases y frecuencias.

## 5) Orden recomendado de ejecucion (siguiente release)
1. Quality P0 (tests + perf + observabilidad minima).
2. Users P0 (onboarding V2 + nudge + dashboard semanal mejorado).
3. Positioning P0 (landing + beta program + contenido).
4. Product/Tech P0 (deteccion real de musica del sistema).

## 6) KPIs target para validar progreso
- Activacion D1 >= 55%
- Retencion D7 >= 30%
- Retencion D30 >= 15%
- Crash-free sessions >= 99.5%
- Tiempo de primer valor <= 60 segundos
