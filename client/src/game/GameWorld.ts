// Signal Cathedral style reminder: the world is a calibrated machine—explicit modes, readable signals, and no hidden gameplay coupling.
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import { Enemy } from "./Enemy";
import { InputManager } from "./InputManager";
import { COLORS, makeMaterial } from "./materials";
import { Pickup } from "./Pickup";
import { Player } from "./Player";
import { Projectile } from "./Projectile";
import type { EnemyType, GameMode, GameSnapshot, SnapshotListener } from "./types";

interface PulseEffect {
  mesh: Mesh;
  life: number;
  maxLife: number;
}

const WAVE_DURATION = 18;
const CHAIN_DURATION = 4.5;
const SPAWN_RING = [
  [-8.4, -5.1],
  [0, -5.8],
  [8.5, -4.3],
  [8.6, 0.8],
  [7.7, 5.1],
  [0.5, 5.8],
  [-8.2, 4.8],
  [-8.8, 0.2],
] as const;

export class GameWorld {
  readonly player: Player;
  private readonly scene: Scene;
  private readonly input: InputManager;
  private readonly onSnapshot: SnapshotListener;
  private readonly demo: boolean;
  private readonly enemies: Enemy[] = [];
  private readonly projectiles: Projectile[] = [];
  private readonly pickups: Pickup[] = [];
  private readonly effects: PulseEffect[] = [];
  private mode: GameMode = "title";
  private score = 0;
  private wave = 1;
  private waveTimer = 0;
  private fireTimer = 0;
  private chainTimer = 0;
  private multiplier = 1;
  private banner = "SIGNAL READY";
  private bannerTone: GameSnapshot["bannerTone"] = "cyan";
  private bannerTimer = 3;
  private snapshotTimer = 0;
  private totalTime = 0;
  private spawnIndex = 0;
  private autoDashTimer = 0;

  constructor(scene: Scene, onSnapshot: SnapshotListener, demo = false) {
    this.scene = scene;
    this.onSnapshot = onSnapshot;
    this.demo = demo;
    this.input = new InputManager();
    this.player = new Player(scene);
    if (demo) this.start();
    this.emitSnapshot(true);
  }

  start() {
    this.mode = "playing";
    this.banner = this.demo ? "WAVE 01 // SIGNAL LOCKED" : "WAVE 01 // HOLD THE SIGNAL";
    this.bannerTone = "cyan";
    this.bannerTimer = 2.7;
    if (this.enemies.length === 0) this.spawnWave();
    this.emitSnapshot(true);
  }

  togglePause() {
    if (this.mode === "playing") {
      this.mode = "paused";
      this.banner = "SYSTEM PAUSED";
      this.bannerTone = "paper";
      this.bannerTimer = 2;
    } else if (this.mode === "paused") {
      this.mode = "playing";
      this.banner = "SIGNAL RESUMED";
      this.bannerTone = "cyan";
      this.bannerTimer = 1.5;
    }
    this.emitSnapshot(true);
  }

  restart() {
    for (const enemy of this.enemies) enemy.dispose();
    for (const projectile of this.projectiles) projectile.dispose();
    for (const pickup of this.pickups) pickup.dispose();
    for (const effect of this.effects) effect.mesh.dispose(false, true);
    this.enemies.length = 0;
    this.projectiles.length = 0;
    this.pickups.length = 0;
    this.effects.length = 0;
    this.player.reset();
    this.mode = "title";
    this.score = 0;
    this.wave = 1;
    this.waveTimer = 0;
    this.fireTimer = 0;
    this.chainTimer = 0;
    this.multiplier = 1;
    this.spawnIndex = 0;
    this.banner = "SIGNAL READY";
    this.bannerTone = "cyan";
    this.bannerTimer = 3;
    if (this.demo) this.start();
    this.emitSnapshot(true);
  }

  update(delta: number) {
    const input = this.input.read();
    if (input.restartPressed && (this.mode === "title" || this.mode === "gameover")) {
      this.start();
      return;
    }
    if (input.pausePressed && (this.mode === "playing" || this.mode === "paused")) this.togglePause();
    if (this.mode !== "playing") {
      this.updateEffects(delta);
      this.emitSnapshot();
      return;
    }

    this.totalTime += delta;
    this.waveTimer += delta;
    this.fireTimer -= delta;
    this.chainTimer = Math.max(0, this.chainTimer - delta);
    this.bannerTimer = Math.max(0, this.bannerTimer - delta);
    if (this.chainTimer <= 0) this.multiplier = Math.max(1, this.multiplier - delta * 0.35);

    const autopilot = this.demo ? this.getAutopilot() : undefined;
    this.player.update(delta, input, autopilot);

    if (this.waveTimer >= WAVE_DURATION) {
      this.wave += 1;
      this.waveTimer = 0;
      this.banner = `WAVE ${String(this.wave).padStart(2, "0")} // SIGNAL SURGE`;
      this.bannerTone = "lime";
      this.bannerTimer = 2.4;
      this.spawnWave();
    }

    if (this.fireTimer <= 0 && this.enemies.length > 0) {
      const target = this.findNearestEnemy();
      if (target) {
        this.projectiles.push(new Projectile(this.scene, this.player.mesh.position, target.getPosition()));
        this.fireTimer = 0.38;
      }
    }

    for (const enemy of this.enemies) {
      const touching = enemy.update(delta, this.player.mesh.position, this.wave);
      if (touching && this.player.damage(enemy.type === "shard" ? 7 : 11)) {
        this.createPulse(this.player.mesh.position, COLORS.coral, 1.2);
        this.banner = "HULL BREACH // MOVE";
        this.bannerTone = "coral";
        this.bannerTimer = 0.9;
      }
    }

    for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
      const projectile = this.projectiles[i];
      if (!projectile.update(delta)) {
        projectile.dispose();
        this.projectiles.splice(i, 1);
        continue;
      }
      const target = this.enemies.find((enemy) => enemy.distanceTo(projectile.getPosition()) < 0.58);
      if (!target) continue;
      target.hit();
      const value = target.type === "hunter" ? 100 : target.type === "orbiter" ? 140 : 75;
      this.score += Math.round(value * this.multiplier);
      this.chainTimer = CHAIN_DURATION;
      this.multiplier = Math.min(9, this.multiplier + 0.35);
      this.createPulse(target.getPosition(), target.type === "orbiter" ? COLORS.violet : COLORS.coral, 0.9);
      this.pickups.push(new Pickup(this.scene, target.getPosition().clone()));
      target.dispose();
      this.enemies.splice(this.enemies.indexOf(target), 1);
      projectile.dispose();
      this.projectiles.splice(i, 1);
    }

    for (let i = this.pickups.length - 1; i >= 0; i -= 1) {
      const pickup = this.pickups[i];
      pickup.update(delta);
      if (pickup.distanceTo(this.player.mesh.position) < 0.76) {
        this.score += 45;
        this.chainTimer = Math.min(6, this.chainTimer + 2);
        this.multiplier = Math.min(9, this.multiplier + 0.7);
        this.createPulse(pickup.mesh.position, COLORS.lime, 0.8);
        pickup.dispose();
        this.pickups.splice(i, 1);
      }
    }

    this.updateEffects(delta);
    if (this.player.getHealth() <= 0) {
      this.mode = "gameover";
      this.banner = "SIGNAL LOST";
      this.bannerTone = "coral";
      this.bannerTimer = 99;
    }
    this.emitSnapshot();
  }

  private spawnWave() {
    const count = Math.min(10, 3 + this.wave);
    for (let i = 0; i < count; i += 1) {
      const type: EnemyType = i % 5 === 0 ? "orbiter" : i % 3 === 0 ? "shard" : "hunter";
      const [x, z] = this.demo ? SPAWN_RING[(this.spawnIndex + i) % SPAWN_RING.length] : this.randomEdgePosition(i);
      this.enemies.push(new Enemy(this.scene, type, x, z, this.spawnIndex + i + this.wave));
    }
    this.spawnIndex += count;
  }

  private randomEdgePosition(index: number): [number, number] {
    const edge = (index + this.wave) % 4;
    const side = -0.78 + Math.random() * 1.56;
    if (edge === 0) return [side * 10.2, -7.2];
    if (edge === 1) return [10.6, side * 6.8];
    if (edge === 2) return [side * 10.2, 7.2];
    return [-10.6, side * 6.8];
  }

  private getAutopilot() {
    const time = this.totalTime;
    this.autoDashTimer -= 1 / 60;
    if (this.autoDashTimer <= 0 && time > 2) this.autoDashTimer = 4.6;
    return {
      moveX: Math.cos(time * 0.58),
      moveZ: Math.sin(time * 0.85),
      dash: this.autoDashTimer > 4.48,
    };
  }

  private findNearestEnemy() {
    let nearest: Enemy | undefined;
    let distance = Number.POSITIVE_INFINITY;
    for (const enemy of this.enemies) {
      const current = enemy.distanceTo(this.player.mesh.position);
      if (current < distance) {
        nearest = enemy;
        distance = current;
      }
    }
    return nearest;
  }

  private createPulse(position: Vector3, color: typeof COLORS.cyan, size: number) {
    const ring = MeshBuilder.CreateTorus("signal-bloom", { diameter: 0.75, thickness: 0.04, tessellation: 24 }, this.scene);
    ring.rotation.x = Math.PI / 2;
    ring.position.copyFrom(position);
    ring.position.y = 0.14;
    ring.material = makeMaterial(this.scene, "signal-bloom-material", color, color, 0.92);
    this.effects.push({ mesh: ring, life: 0, maxLife: size === 1.2 ? 0.36 : 0.26 });
  }

  private updateEffects(delta: number) {
    for (let i = this.effects.length - 1; i >= 0; i -= 1) {
      const effect = this.effects[i];
      effect.life += delta;
      const progress = effect.life / effect.maxLife;
      effect.mesh.scaling.setAll(0.7 + progress * 2.2);
      effect.mesh.visibility = Math.max(0, 1 - progress);
      if (progress >= 1) {
        effect.mesh.dispose(false, true);
        this.effects.splice(i, 1);
      }
    }
  }

  private emitSnapshot(force = false) {
    this.snapshotTimer += 1 / 60;
    if (!force && this.snapshotTimer < 0.06) return;
    this.snapshotTimer = 0;
    const objective = this.mode === "title" ? "PRESS ENTER OR LAUNCH TO BEGIN" : this.mode === "gameover" ? "PRESS R TO REBOOT THE CATHEDRAL" : this.mode === "paused" ? "SYSTEM HOLD // PRESS P TO RESUME" : "SURVIVE THE SIGNAL // CLEAR THE WAVE";
    this.onSnapshot({
      mode: this.mode,
      score: this.score,
      wave: this.wave,
      health: this.player.getHealth(),
      multiplier: Math.max(1, Math.floor(this.multiplier)),
      chainProgress: Math.min(100, (this.chainTimer / CHAIN_DURATION) * 100),
      dashCooldown: this.player.getDashCooldown(),
      dashReady: this.player.getDashReady(),
      enemies: this.enemies.length,
      objective,
      banner: this.bannerTimer > 0 ? this.banner : "",
      bannerTone: this.bannerTone,
    });
  }

  dispose() {
    this.input.dispose();
    this.player.dispose();
    for (const enemy of this.enemies) enemy.dispose();
    for (const projectile of this.projectiles) projectile.dispose();
    for (const pickup of this.pickups) pickup.dispose();
    for (const effect of this.effects) effect.mesh.dispose(false, true);
    this.enemies.length = 0;
    this.projectiles.length = 0;
    this.pickups.length = 0;
    this.effects.length = 0;
  }
}
