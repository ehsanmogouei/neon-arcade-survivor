// Signal Cathedral style reminder: the player is the trustworthy cyan signal—clean silhouette, immediate controls, restrained bloom.
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import { COLORS, makeLineMaterial, makeMaterial } from "./materials";
import type { SemanticInput } from "./types";

const ARENA_X = 9.6;
const ARENA_Z = 6.6;

export class Player {
  readonly mesh: Mesh;
  private readonly reticle: Mesh;
  private readonly core: Mesh;
  private readonly scene: Scene;
  private dashDirection = new Vector3(1, 0, 0);
  private dashTime = 0;
  private dashCooldown = 0;
  private invulnerability = 0;
  private health = 100;

  constructor(scene: Scene) {
    this.scene = scene;
    this.mesh = MeshBuilder.CreateCylinder("interceptor", { diameter: 1.1, height: 0.28, tessellation: 3 }, scene);
    this.mesh.rotation.y = Math.PI / 2;
    this.mesh.material = makeMaterial(scene, "player-signal", COLORS.cyan, COLORS.cyan);
    this.mesh.position = new Vector3(-0.8, 0.22, 0.4);

    const nose = MeshBuilder.CreateBox("interceptor-nose", { width: 0.48, height: 0.13, depth: 0.18 }, scene);
    nose.parent = this.mesh;
    nose.position.x = 0.48;
    nose.material = makeMaterial(scene, "player-paper-core", COLORS.paper, COLORS.cyan);

    this.core = MeshBuilder.CreateCylinder("interceptor-core", { diameter: 0.24, height: 0.34, tessellation: 8 }, scene);
    this.core.parent = this.mesh;
    this.core.material = makeMaterial(scene, "player-core", COLORS.paper, COLORS.paper);

    this.reticle = MeshBuilder.CreateTorus("cathedral-reticle", { diameter: 1.75, thickness: 0.035, tessellation: 32 }, scene);
    this.reticle.rotation.x = Math.PI / 2;
    this.reticle.position.y = 0.03;
    this.reticle.parent = this.mesh;
    this.reticle.material = makeLineMaterial(scene, "player-reticle", COLORS.cyan, 0.75);

    for (const [x, z] of [[0.96, 0.62], [-0.96, 0.62], [0.96, -0.62], [-0.96, -0.62]]) {
      const bracket = MeshBuilder.CreateBox("reticle-bracket", { width: 0.22, height: 0.025, depth: 0.025 }, scene);
      bracket.parent = this.mesh;
      bracket.position.x = x;
      bracket.position.z = z;
      bracket.material = makeLineMaterial(scene, "reticle-bracket-material", COLORS.cyan, 0.95);
    }
  }

  update(delta: number, input: SemanticInput, autopilot?: { moveX: number; moveZ: number; dash: boolean }) {
    this.dashCooldown = Math.max(0, this.dashCooldown - delta);
    this.dashTime = Math.max(0, this.dashTime - delta);
    this.invulnerability = Math.max(0, this.invulnerability - delta);

    const moveX = autopilot?.moveX ?? input.moveX;
    const moveZ = autopilot?.moveZ ?? input.moveZ;
    const move = new Vector3(moveX, 0, moveZ);
    if (move.lengthSquared() > 0.01) {
      move.normalize();
      this.dashDirection.copyFrom(move);
    }

    const wantsDash = autopilot?.dash ?? input.dashPressed;
    if (wantsDash && this.dashCooldown <= 0) {
      this.dashTime = 0.17;
      this.dashCooldown = 1.65;
      if (move.lengthSquared() <= 0.01) this.dashDirection = new Vector3(1, 0, 0);
    }

    const speed = this.dashTime > 0 ? 16 : 4.8;
    const velocity = move.lengthSquared() > 0.01 ? move : Vector3.Zero();
    if (this.dashTime > 0) velocity.copyFrom(this.dashDirection);
    this.mesh.position.addInPlace(velocity.scale(speed * delta));
    this.mesh.position.x = Math.max(-ARENA_X, Math.min(ARENA_X, this.mesh.position.x));
    this.mesh.position.z = Math.max(-ARENA_Z, Math.min(ARENA_Z, this.mesh.position.z));

    this.mesh.scaling.setAll(this.dashTime > 0 ? 1.16 : 1);
    this.core.scaling.setAll(1 + Math.sin(this.scene.getEngine().getDeltaTime() * 0.02) * 0.02);
    this.reticle.rotation.y += delta * (this.dashTime > 0 ? 5 : 0.8);
    this.reticle.scaling.setAll(1.03 + Math.sin(performance.now() * 0.003) * 0.01);
  }

  damage(amount: number) {
    if (this.invulnerability > 0) return false;
    this.health = Math.max(0, this.health - amount);
    this.invulnerability = 0.9;
    this.mesh.visibility = 0.45;
    window.setTimeout(() => {
      if (!this.mesh.isDisposed()) this.mesh.visibility = 1;
    }, 120);
    return true;
  }

  reset() {
    this.mesh.position.set(-0.8, 0.22, 0.4);
    this.health = 100;
    this.dashCooldown = 0;
    this.invulnerability = 0;
    this.mesh.visibility = 1;
  }

  getHealth() {
    return this.health;
  }

  getDashCooldown() {
    return this.dashCooldown;
  }

  getDashReady() {
    return this.dashCooldown <= 0;
  }

  dispose() {
    this.mesh.dispose(false, true);
    this.reticle.dispose(false, true);
    this.core.dispose(false, true);
  }
}
