// Signal Cathedral style reminder: projectiles are crisp signal lines—short-lived, readable, and never visual noise.
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import { COLORS, makeMaterial } from "./materials";

export class Projectile {
  readonly mesh: Mesh;
  private readonly velocity: Vector3;
  private life = 0;
  private readonly maxLife = 1.2;

  constructor(scene: Scene, start: Vector3, target: Vector3) {
    this.mesh = MeshBuilder.CreateCylinder("signal-projectile", { diameter: 0.11, height: 0.6, tessellation: 8 }, scene);
    this.mesh.material = makeMaterial(scene, "projectile-cyan", COLORS.paper, COLORS.cyan);
    this.mesh.position.copyFrom(start);
    this.mesh.position.y = 0.26;
    const direction = target.subtract(start);
    direction.y = 0;
    direction.normalize();
    this.velocity = direction.scale(10.5);
    this.mesh.rotation.z = Math.PI / 2;
    this.mesh.rotation.y = Math.atan2(direction.x, direction.z);
  }

  update(delta: number) {
    this.life += delta;
    this.mesh.position.addInPlace(this.velocity.scale(delta));
    this.mesh.visibility = Math.max(0, 1 - Math.max(0, this.life - 0.95) / 0.25);
    return this.life < this.maxLife && Math.abs(this.mesh.position.x) < 11 && Math.abs(this.mesh.position.z) < 8;
  }

  getPosition() {
    return this.mesh.position;
  }

  dispose() {
    this.mesh.dispose(false, true);
  }
}
