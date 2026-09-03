// Signal Cathedral style reminder: chartreuse means reward and momentum—bright, sparse, and unmistakable.
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import { COLORS, makeMaterial } from "./materials";

export class Pickup {
  readonly mesh: Mesh;
  private life = 0;

  constructor(scene: Scene, position: Vector3) {
    this.mesh = MeshBuilder.CreateTorus("energy-pickup", { diameter: 0.44, thickness: 0.1, tessellation: 12 }, scene);
    this.mesh.rotation.x = Math.PI / 2;
    this.mesh.position.copyFrom(position);
    this.mesh.position.y = 0.2;
    this.mesh.material = makeMaterial(scene, "pickup-lime", COLORS.lime, COLORS.lime);
  }

  update(delta: number) {
    this.life += delta;
    this.mesh.rotation.y += delta * 3;
    this.mesh.position.y = 0.22 + Math.sin(this.life * 4) * 0.08;
    this.mesh.scaling.setAll(1 + Math.sin(this.life * 5) * 0.08);
  }

  distanceTo(point: Vector3) {
    return Vector3.Distance(this.mesh.position, point);
  }

  dispose() {
    this.mesh.dispose(false, true);
  }
}
