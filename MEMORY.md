# Memory

## Current implementation

The playable demo is built on React 19, Vite, Tailwind 4, and Babylon.js 9.24. React only owns the HUD and lifecycle-safe canvas host. `GameWorld` owns the title, playing, paused, and gameover modes along with player, enemy, projectile, pickup, scoring, and deterministic `?demo` behavior.

The visual language is Signal Cathedral. The generated arena texture and logo use lifecycle-safe `/manus-storage/...` URLs recorded in `ASSETS.md`; runtime entities are procedural meshes so the scene remains responsive and deployment-safe. The HUD uses Rajdhani for display values and IBM Plex Mono for telemetry. The review amendments were accepted: persistent arena calibration, stronger coral threat language, and a more meaningful reticle/split-beam mark.

## Verification notes

TypeScript check passes. The production build passes. WebDev screenshots show the title state at desktop and mobile sizes, and the deterministic demo shows live score, hostile count, player signal, multiple procedural enemy silhouettes, chartreuse pickup signals, coral danger cues, and wave telemetry. Browser logs show Babylon WebGL2 initialization without runtime errors; the React DevTools message is informational.

The project is ready for a checkpoint. Do not use a temporary exposed link as the deliverable; the intended handoff is the saved WebDev version and the user should publish through the Management UI.
