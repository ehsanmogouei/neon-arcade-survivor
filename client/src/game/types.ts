// Signal Cathedral style reminder: dark instrument-field, high-contrast semantic signals, and explicit game state over decorative UI.
import type { Scene } from "@babylonjs/core/scene";

export type GameMode = "title" | "playing" | "paused" | "gameover";
export type EnemyType = "hunter" | "orbiter" | "shard";

export interface GameSnapshot {
  mode: GameMode;
  score: number;
  wave: number;
  health: number;
  multiplier: number;
  chainProgress: number;
  dashCooldown: number;
  dashReady: boolean;
  enemies: number;
  objective: string;
  banner: string;
  bannerTone: "cyan" | "coral" | "lime" | "paper";
}

export interface GameHandle {
  scene: Scene;
  world: import("./GameWorld").GameWorld;
  dispose: () => void;
}

export interface SemanticInput {
  moveX: number;
  moveZ: number;
  dashPressed: boolean;
  pausePressed: boolean;
  restartPressed: boolean;
}

export interface EnemyConfig {
  type: EnemyType;
  x: number;
  z: number;
}

export interface SnapshotListener {
  (snapshot: GameSnapshot): void;
}
