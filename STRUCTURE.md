# Structure: Neon Arcade Survivor

## Runtime layering

React is the picture frame: it mounts the full-screen canvas and renders the HUD/command rail overlay. Babylon.js is the canvas: it owns the scene, camera, materials, meshes, render loop, and resize behavior. Plain TypeScript game modules are the painting: they own gameplay rules and state without importing React.

## File layout

```text
client/src/
  App.tsx                         # sole route: GameCanvas
  components/
    GameCanvas.tsx                # lifecycle-safe Babylon host + React HUD bridge
  game/
    types.ts                      # shared gameplay data and event types
    InputManager.ts               # semantic keyboard actions and cleanup
    Player.ts                     # movement, dash, aim, health, mesh ownership
    Enemy.ts                      # hunter, orbiter, shard behavior and mesh ownership
    Projectile.ts                 # projectile motion, lifetime, collision radius
    Pickup.ts                     # chartreuse energy pickups and collection state
    GameWorld.ts                  # state machine, spawning, scoring, collisions
    scene.ts                      # createGameScene(engine, canvas): GameHandle
    materials.ts                  # procedural/texture-backed Babylon materials
  pages/
    Home.tsx                      # retained scaffold file; not used by root route
  index.css                       # Signal Cathedral theme and HUD styling
```

## Ownership

`GameWorld` owns the playfield bounds, current mode, wave timer, score, chain multiplier, spawn schedule, and all active entities. `Player`, `Enemy`, `Projectile`, and `Pickup` each own their Babylon mesh and mutable simulation state, expose `update(deltaSeconds)` and `dispose()` methods, and do not know about React.

`InputManager` converts raw keyboard events into semantic actions: `moveX`, `moveY`, `dashPressed`, `pausePressed`, and `restartPressed`. It is created by `GameWorld` and disposed by the scene handle. `scene.ts` builds the camera, lighting, arena material, calibration geometry, world, and render loop integration.

The HUD receives a serializable snapshot through a small callback from the world. It renders score, wave, health, multiplier, cooldown, mode, and objective text. It never mutates Babylon objects or gameplay state directly; buttons call narrow world commands such as `togglePause()` and `restart()`.

## Game modes

The explicit mode state machine is `title -> playing -> paused -> playing`, with `playing -> gameover` when health reaches zero and `gameover -> title` on restart. `?demo` starts in `playing` after a short title cue and enables deterministic AutoPilot; normal mode waits for the player to press Enter or click the launch control.

## Camera and spatial model

Use a fixed orthographic camera at a three-quarter top-down angle looking at the arena origin. The game is intentionally screen-space readable: X/Z movement maps cleanly to horizontal/vertical input, the player remains within a rectangular arena, and HUD overlays are positioned in CSS rather than projected from Babylon meshes.

## Asset strategy

Use procedural mesh primitives for the player, three enemy families, projectiles, pickups, boundaries, reticle, and hit rings. Bind the generated arena texture to a large tiled ground plane when available, and use the generated transparent logo in the React HUD. This keeps the game responsive while preserving a real art direction rather than a flat placeholder scene.
