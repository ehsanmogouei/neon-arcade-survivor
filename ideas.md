# Neon Arcade Survivor — Design Brainstorm

## Three stylistic approaches

### Theme Name: Signal Cathedral
Very Brief Intro: A dark, neon-lit arcade survival game shaped like a broadcast shrine: disciplined cyan geometry, electric coral threats, and ceremonial UI marks. The mood is urgent but composed, like surviving inside a beautiful machine.
Probability: 0.07

### Theme Name: Sunroom Circuit
Very Brief Intro: A bright, tactile retro-futurist playground with warm paper tones, cobalt ink, and tomato-red game pieces. The mood is optimistic, physical, and screen-printed rather than glossy.
Probability: 0.04

### Theme Name: Mosslight Drift
Very Brief Intro: A nocturnal bioluminescent arena where soft green spores and amber fireflies replace hard sci-fi, with quiet watercolor-like depth and natural asymmetry. The mood is curious, calm, and slightly mysterious.
Probability: 0.02

## Chosen Direction: Signal Cathedral

### Design Movement
Neo-brutalist arcade futurism with references to 1980s vector displays, Japanese game-center marquees, and the disciplined graphic language of broadcast test equipment. It is dark neon only because the game fantasy is specifically about reading danger in a high-contrast signal field; avoid generic cyberpunk clutter.

### Core Principles
1. **Readability under pressure:** Gameplay state is always legible within one glance. HUD panels stay compact, high-contrast, and anchored to the arena edges.
2. **Sacred geometry, not decoration:** Rings, crosshairs, scanlines, and radial markers communicate game state before they decorate it.
3. **Mechanical warmth:** The interface should feel machined and hand-tuned rather than glassy. Use hard corners, thin rules, subtle grain, and controlled glow.
4. **Threat has a signature:** Every enemy archetype has a distinct silhouette and color behavior so the player can learn through motion.

### Color Philosophy
The arena is near-black blue-green so the playable field recedes and the signals can speak. Cyan is the player's trustworthy navigation signal; ember coral marks incoming danger; acid chartreuse marks score and successful chains; warm off-white is reserved for instructions and high-value readouts. Glow is a scarce semantic resource: it appears around live objects and state transitions, never as a blanket effect.

Palette: ink `#071218`, panel `#0D2025`, line `#1D4146`, signal cyan `#45F0E6`, ember `#FF5D5D`, chain lime `#D9FF68`, paper `#E7F3E8`, muted `#88A8A4`.

### Layout Paradigm
A full-bleed arena framed by a left-side mission rail and a top-right telemetry stack. The playfield is not a centered card: it occupies the viewport like a machine window, with the interface clipped into the edges. The start overlay uses an offset lower-left command block so the center remains visually playable. On small screens, the rail collapses into a slim top telemetry strip and the command block becomes bottom-anchored.

### Signature Elements
1. **Cathedral reticle:** Four corner brackets and a thin circular targeting ring around the player, subtly pulsing only when an enemy is in range.
2. **Broadcast ticks:** Short segmented rules and tiny monospace labels at panel edges, echoing a calibrated instrument.
3. **Signal bloom:** A brief ring expansion on successful hits and a horizontal scan flash when a wave begins or ends.

### Interaction Philosophy
Controls feel like direct instrumentation. WASD/arrow movement is immediate, and pointer/touch input is optional rather than hidden. Buttons use terse verbs and physical press feedback. Pausing should feel like lowering a safety cover; restarting should clear the machine decisively without confusing intermediate states.

### Animation
Movement is crisp with tiny trailing particles, not floaty easing. Enemies drift with distinct motion profiles: hunters accelerate in short bursts, orbiters arc steadily, and shards telegraph then lunge. UI panels enter with 180ms ease-out translation from their anchored edge. Wave transitions use a 240ms scanline sweep; hit feedback expands a ring from 0.7 to 1.0 scale while fading. Respect reduced motion by removing screen shake and particle trails while keeping state changes visible through color and line weight.

### Typography System
Use **Rajdhani** for display labels and score readouts: wide, engineered, and highly legible at arcade scale. Use **IBM Plex Mono** for telemetry, instructions, and tiny labels. Hierarchy: 11px uppercase mono metadata with tracking; 15–18px Rajdhani controls; 32–56px Rajdhani score/wave numerals; 72px+ only for the title lockup. Avoid Inter and generic rounded UI fonts.

### Brand Essence
Signal Cathedral is a high-clarity neon survival arena for players who enjoy mastering patterns under pressure; it turns arcade danger into a readable instrument panel. Personality: **precise, electric, ceremonial**.

### Brand Voice
Headlines sound like machine commands with a little ritual. CTAs are short, active, and never generic. Microcopy explains the next decision, not the whole game.

Example lines:
- “Hold the signal. Break the swarm.”
- “Wave 01 is listening.”

### Wordmark & Logo
The mark is a four-corner reticle enclosing a split vertical beam, with one deliberate gap at the lower-right corner to imply movement. It must work as a bold symbol without text. The wordmark is set in custom condensed Rajdhani lettering with the crossbars on A and E shortened like calibration ticks; never render the name in a default font as the logo.

### Signature Brand Color
**Signal Cyan `#45F0E6`** — a cool, almost-white cyan that owns the player's side of the machine and remains distinct from the ember and lime state colors.

### File-level style reminder
Every CSS, component, page, and game module should preserve the Signal Cathedral rules: dark instrument-field background, cyan player signal, coral threat signal, chartreuse score signal, asymmetrical instrument-panel layout, high-contrast Rajdhani + IBM Plex Mono typography, restrained glow, and motion that communicates state rather than decoration.

### Implementation notes
- Keep React as the picture frame and Babylon.js as the canvas.
- Use procedural Babylon meshes for arena geometry and generated textures/assets for the art direction.
- Use `?demo` for deterministic AutoPilot verification.
- Preserve a small asset set: one art-direction reference, one arena texture, one player/reticle texture, one enemy texture family, and the transparent logo mark.
- No fabricated reviews, ratings, testimonials, or user-generated content.

## Style Decisions

- In every active/demo presentation, the arena remains a visible calibrated machine window with persistent reticle geometry and readable player/threat signals.
- Ember coral `#FF5D5D` communicates hostile state; signal cyan remains reserved for player trust and navigation.
- The logo lockup includes a meaningful four-corner reticle and split-beam symbol, while the wordmark uses calibrated spacing and condensed display treatment.
- Broadcast-test motifs extend into the center field through segmented rules, corner brackets, scanline structure, and small vector readouts.
