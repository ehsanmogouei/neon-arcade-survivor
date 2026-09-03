# Assets

**Art direction:** Signal Cathedral — neo-brutalist arcade futurism inspired by vector displays and broadcast test equipment. The game uses an ink-dark blue-green arena, signal cyan for the player and navigation, ember coral for threats, chartreuse for score and pickups, warm off-white telemetry, hard geometry, thin calibration rules, and restrained emissive bloom. No generic cyberpunk clutter; glow communicates live state.

## Generated assets

| Asset | Purpose | Generated source | WebDev URL | Usage |
|---|---|---|---|---|
| Signal Cathedral reference | In-game screenshot target for camera, composition, color, object density, and HUD | `/home/ubuntu/webdev-static-assets/signal-cathedral-reference.png` | `/manus-storage/signal-cathedral-reference_b2ab0852.png` | QA target and art-direction reference |
| Arena texture | Seamless instrument-field floor texture | `/home/ubuntu/webdev-static-assets/signal-cathedral-arena-texture.png` | `/manus-storage/signal-cathedral-arena-texture_328077bc.png` | Babylon ground material texture |
| Player craft | Transparent interceptor silhouette and reticle cue | `/home/ubuntu/webdev-static-assets/signal-cathedral-player.png` | `/manus-storage/signal-cathedral-player_e4254b35.png` | Optional sprite/texture reference; runtime uses a procedural mesh echo |
| Enemy family | Transparent hunter, orbiter, and shard silhouettes | `/home/ubuntu/webdev-static-assets/signal-cathedral-enemy-family.png` | `/manus-storage/signal-cathedral-enemy-family_78fadead.png` | Optional texture reference; runtime uses distinct procedural meshes |
| Logo mark | Transparent four-corner reticle and split beam | `/home/ubuntu/webdev-static-assets/signal-cathedral-logo.png` | `/manus-storage/signal-cathedral-logo_fba2d161.png` | React HUD brand mark and favicon-sized visual |

## Asset-generation prompts

The reference screenshot prompt enumerates the player craft, three enemy archetypes, pickups, projectiles, arena surface, boundaries, and HUD so the implementation can be checked against a concrete target. The supporting prompts were derived from that target and use isolated or seamless compositions appropriate to their runtime role.

## Runtime asset policy

Large visual files remain outside the project tree under `/home/ubuntu/webdev-static-assets/` and are referenced through the lifecycle-safe `/manus-storage/...` URLs above. The game is intentionally procedural at runtime: generated art establishes the visual language while Babylon meshes keep the bundle responsive and deployment-safe.
