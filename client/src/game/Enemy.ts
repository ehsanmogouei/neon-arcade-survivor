// Signal Cathedral style reminder: threat silhouettes must teach the player through color and motion before text does.
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import { COLORS, makeLineMaterial, makeMaterial } from "./materials";
import type { EnemyType } from "./types";

export class Enemy {
  readonly type: EnemyType;
  readonly mesh: Mesh;
  private readonly scene: Scene;
  private readonly homeAngle: number;
  private readonly phase: number;
  private pulse = 0;
  private life = 0;
  private orbitRadius = 0;
  private lunging = 0;

  constructor(scene: Scene, type: EnemyType, x: number, z: number, seed = 1) {
    this.scene = scene;
    this.type = type;
    this.homeAngle = Math.atan2(z, x);
    this.phase = seed * 0.73;
    this.mesh = this.createMesh(scene);
    this.mesh.position.set(x, 0.24, z);
    this.orbitRadius = Math.max(2.4, Math.hypot(x, z));
  }

  private createMesh(scene: Scene) {
    if (this.type === "hunter") {
      const mesh = MeshBuilder.CreateBox("hunter-diamond", { width: 0.7, height: 0.24, depth: 0.7 }, scene);
      mesh.rotation.y = Math.PI / 4;
      mesh.material = makeMaterial(scene, "hunter-coral", COLORS.coral, COLORS.coral);
      const core = MeshBuilder.CreateBox("hunter-core", { width: 0.18, height: 0.08, depth: 0.18 }, scene);
      core.parent = mesh;
      core.material = makeMaterial(scene, "hunter-core-paper", COLORS.paper, COLORS.paper);
      return mesh;
    }
    if (this.type === "orbiter") {
      const mesh = MeshBuilder.CreateTorus("orbiter-ring", { diameter: 0.9, thickness: 0.13, tessellation: 18 }, scene);
      mesh.rotation.x = Math.PI / 2;
      mesh.material = makeMaterial(scene, "orbiter-violet", COLORS.violet, COLORS.violet);
      const node = MeshBuilder.CreateSphere("orbiter-node", { diameter: 0.25, segments: 8 }, scene);
      node.parent = mesh;
      node.position.x = 0.55;
      node.material = makeMaterial(scene, "orbiter-node", COLORS.paper, COLORS.violet);
      return mesh;
    }
    const mesh = MeshBuilder.CreateBox("shard", { width: 0.28, height: 0.16, depth: 0.62 }, scene);
    mesh.rotation.y = Math.PI / 4;
    mesh.material = makeMaterial(scene, "shard-amber", COLORS.amber, COLORS.amber);
    return mesh;
  }

  update(delta: number, target: Vector3, wave: number) {
    this.life += delta;
    this.pulse = Math.max(0, this.pulse - delta);
    const toPlayer = target.subtract(this.mesh.position);
    toPlayer.y = 0;
    const distance = toPlayer.length();

    if (this.type === "hunter") {
      if (distance > 0.05) this.mesh.position.addInPlace(toPlayer.normalize().scale((0.45 + wave * 0.045) * delta));
      this.mesh.rotation.y += delta * 2.5;
    } else if (this.type === "orbiter") {
      const angle = this.homeAngle + this.life * (0.45 + wave * 0.015) + this.phase;
      const desired = target.add(new Vector3(Math.cos(angle) * this.orbitRadius, 0, Math.sin(angle) * this.orbitRadius));
      const drift = desired.subtract(this.mesh.position);
      drift.y = 0;
      if (drift.length() > 0.05) this.mesh.position.addInPlace(drift.normalize().scale(1.5 * delta));
      this.mesh.rotation.y -= delta * 2;
    } else {
      if (this.lunging > 0) {
        this.lunging -= delta;
        if (distance > 0.05) this.mesh.position.addInPlace(toPlayer.normalize().scale(3.9 * delta));
      } else if (Math.sin(this.life * 2.7 + this.phase) > 0.93) {
        this.lunging = 0.28;
      } else if (distance > 0.05) {
        this.mesh.position.addInPlace(toPlayer.normalize().scale(0.7 * delta));
      }
      this.mesh.rotation.y += delta * 5;
    }

    const flash = this.pulse > 0 ? 1.16 : 1;
    this.mesh.scaling.setAll(flash + Math.sin(this.life * 5 + this.phase) * 0.025);
    return distance < (this.type === "shard" ? 0.55 : 0.75);
  }

  hit() {
    this.pulse = 0.12;
  }

  distanceTo(point: Vector3) {
    return Vector3.Distance(this.mesh.position, point);
  }

  getPosition() {
    return this.mesh.position;
  }

  dispose() {
    this.mesh.dispose(false, true);
  }
}
