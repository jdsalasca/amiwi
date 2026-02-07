# NEXT STEPS BACKLOG

Fecha: 2026-02-07  
Baseline actual: v0.3.0

## 1) Product Backlog (requested experience)
### PR-P0
- [ ] Reemplazar deteccion beta por deteccion real de reproduccion (Windows GSMTC + macOS NowPlaying APIs).
- [ ] Crear sistema de assets visuales reales (PNG/SVG/Lottie) por avatar y estado.
- [ ] Agregar interacciones extra de cuidado: jugar, dormir, higiene, energia.
- [ ] Animaciones de reaccion para snack, musica y logro de foco.

### PR-P1
- [ ] Inventario de snacks/recompensas con economia ligera.
- [ ] Personalidades de avatar descargables.
- [ ] Sincronizacion de progreso entre dispositivos.

## 2) Quality Backlog
### Q-P0
- [ ] Unit tests para timer, streak, hambre, scheduler de frases.
- [ ] E2E de onboarding/minimal mode/minimize/feed/music reaction.
- [ ] Telemetria opt-in de eventos clave (activacion, retencion, feature usage).
- [ ] Presupuesto de rendimiento automatizado en CI.

### Q-P1
- [ ] Crash reporting y logs anonimos exportables.
- [ ] QA matrix formal por OS/version/hardware.
- [ ] Accesibilidad (teclado, contraste, lectores).

## 3) Users Backlog
### U-P0
- [ ] Onboarding V2 con demo interactiva de 30 segundos.
- [ ] Plantillas de companion para perfiles (estudio, trabajo, creativo).
- [ ] Nudges personalizados por horario/habito.

### U-P1
- [ ] Misiones semanales y progresion visual.
- [ ] Recompensas cosmeticas por racha.

## 4) Positioning Backlog
### POS-P0
- [ ] Mensaje unico: "cute companion + micro-coach emocional".
- [ ] Landing page con CTA e install flow en un click.
- [ ] Beta con 100 usuarios segmentados (estudiantes/remotos).
- [ ] Cadencia de contenido: 3 demos semanales (music, pet, minimal).

### POS-P1
- [ ] Partnerships con comunidades de productividad y estudio.
- [ ] Programa referral con skins desbloqueables.
- [ ] Storytelling de marca por personajes.

## 5) Installer & Distribution Backlog
### INST-P0
- [ ] Pipeline estable de artifacts Windows/macOS firmados.
- [ ] Auto-update in-app con rollback seguro.
- [ ] Instalador con opciones simples: "Quick" y "Advanced".

### INST-P1
- [ ] Publicacion en winget/chocolatey/homebrew cask.
- [ ] Telemetria de funnel de instalacion (opt-in).

## 6) KPIs target
- Activacion D1 >= 60%
- Retencion D7 >= 35%
- Retencion D30 >= 18%
- % usuarios que usan Minimal mode >= 45%
- % usuarios que usan interacciones pet >= 40%
- Crash-free sessions >= 99.5%
