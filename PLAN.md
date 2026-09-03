# Game Plan: Neon Arcade Survivor

## Risk Tasks

### 1. Babylon-in-React lifecycle
- **Why isolated:** React 19 development mode may mount effects twice, creating duplicate engines, render loops, and event listeners.
- **Approach:** Use the supplied lifecycle-safe `GameCanvas` pattern with a ref guard, one engine per mounted canvas, explicit scene disposal, resize handling, and input cleanup.
- **Verify:** Reload and navigate without duplicate canvases or doubled simulation speed; browser console stays free of engine lifecycle errors.

### 2. Deterministic AutoPilot demo mode
- **Why isolated:** Screenshot verification needs a stable, visibly active gameplay state without manual input, while the normal input path must remain responsive.
- **Approach:** Gate a deterministic AutoPilot behind `?demo`; move the player through a repeatable figure-eight and aim at the nearest target. Use a fixed random seed for wave spawns in demo mode.
- **Verify:** Opening `/?demo` shows the arena populated with enemies, score changes, wave progress, and hit feedback within a few seconds; repeated reloads produce the same opening layout.

### 3. Dense repeated entities and cleanup
- **Why isolated:** Enemies, projectiles, pickups, and hit rings are created and removed frequently; stale meshes or arrays could degrade or visually clutter the arena.
- **Approach:** Keep a focused `GameWorld` owner with typed collections, explicit entity `dispose()` methods, capped projectile and particle counts, and distance-based enemy despawn at arena bounds.
- **Verify:** At least three enemy archetypes remain visually distinct, hit rings disappear after their lifetime, and restarting returns the scene to a clean start state.

## Main Build

Build a top-down neon survival arena where the player moves a cyan interceptor with WASD/arrow keys, fires toward the nearest threat automatically, dashes with Space, and survives escalating waves. Hunters pursue directly, orbiters maintain a curved path, and shard enemies make short lunges. Defeated enemies drop chartreuse energy pickups that extend the score-chain timer. A concise HUD presents title, objective, score, wave, health, multiplier, and controls; pause and restart are available from the command rail.

- **Assets needed:** Generated Signal Cathedral reference screenshot, arena texture, player asset, enemy-family asset, and transparent logo mark. Runtime rendering should primarily use procedural Babylon meshes with the generated texture/mark as visual anchors.
- **Verify:**
  - Movement direction matches keyboard input and player response is immediate.
  - Dash moves the player quickly without leaving the arena; Space has a visible cooldown cue.
  - Projectiles travel toward threats; hits create brief signal bloom and increase score.
  - Enemy silhouettes and colors remain distinct across hunter, orbiter, and shard types.
  - Health, wave, score, multiplier, and objective text remain readable with no overlap on desktop and narrow screens.
  - No missing textures, obvious fallback materials, or stale entities after restart.
  - Gameplay flow matches the survival brief and can be observed in `?demo`.
  - No browser console errors during the captured run.
  - Reference consistency: dark instrument-field arena, cyan player signal, ember threat signals, chartreuse pickups, top-down composition, and asymmetric HUD rails.
  - Presentation proof: WebDev screenshots of `/` start state, `/?demo` active wave, and mobile `/?demo` responsive state.
