// Signal Cathedral style reminder: the scene is a dark instrument field framed by calibration geometry and restrained emissive signals.
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Scene } from "@babylonjs/core/scene";
import type { GameHandle, SnapshotListener } from "./types";
import { COLORS, makeArenaMaterial, makeLineMaterial, makeMaterial } from "./materials";
import { GameWorld } from "./GameWorld";

export async function createGameScene(engine: Engine, _canvas: HTMLCanvasElement, onSnapshot: SnapshotListener): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.027, 0.071, 0.094, 1);
  scene.fogMode = Scene.FOGMODE_EXP;
  scene.fogDensity = 0.012;
  scene.fogColor = COLORS.ink;

  const camera = new ArcRotateCamera("calibrated-camera", -Math.PI / 2, 1.04, 18, new Vector3(0, 0, 0), scene);
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
  camera.minZ = 0.1;
  camera.maxZ = 100;
  scene.activeCamera = camera;

  const light = new HemisphericLight("arena-fill", new Vector3(0, 1, 0), scene);
  light.intensity = 0.42;
  light.diffuse = COLORS.paper;
  light.groundColor = COLORS.ink;

  const glow = new GlowLayer("signal-bloom-layer", scene);
  glow.intensity = 0.42;
  glow.blurKernelSize = 28;

  const floor = MeshBuilder.CreateGround("instrument-field", { width: 22, height: 15, subdivisions: 1 }, scene);
  floor.material = makeArenaMaterial(scene);

  const boundaryMaterial = makeLineMaterial(scene, "boundary-lines", COLORS.cyan, 0.36);
  const outerBoundary = MeshBuilder.CreateTorus("outer-calibration-ring", { diameter: 11, thickness: 0.018, tessellation: 96 }, scene);
  outerBoundary.rotation.x = Math.PI / 2;
  outerBoundary.position.y = 0.025;
  outerBoundary.scaling.z = 0.66;
  outerBoundary.material = boundaryMaterial;

  for (const diameter of [4.5, 7.2]) {
    const ring = MeshBuilder.CreateTorus(`calibration-ring-${diameter}`, { diameter, thickness: 0.012, tessellation: 96 }, scene);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.026;
    ring.scaling.z = 0.66;
    ring.material = makeLineMaterial(scene, `calibration-ring-material-${diameter}`, COLORS.line, 0.4);
  }

  const tickMaterial = makeLineMaterial(scene, "boundary-ticks", COLORS.cyan, 0.65);
  for (const [x, z, width, depth] of [
    [-10.2, -6.5, 1.2, 0.045], [10.2, -6.5, 1.2, 0.045], [-10.2, 6.5, 1.2, 0.045], [10.2, 6.5, 1.2, 0.045],
    [-10.5, -5.9, 0.045, 1.1], [10.5, -5.9, 0.045, 1.1], [-10.5, 5.9, 0.045, 1.1], [10.5, 5.9, 0.045, 1.1],
  ] as const) {
    const tick = MeshBuilder.CreateBox("boundary-tick", { width, height: 0.025, depth }, scene);
    tick.position.set(x, 0.04, z);
    tick.material = tickMaterial;
  }

  const centerMarker = MeshBuilder.CreateCylinder("center-marker", { diameter: 0.16, height: 0.03, tessellation: 8 }, scene);
  centerMarker.position.y = 0.04;
  centerMarker.material = makeMaterial(scene, "center-marker-material", COLORS.line, COLORS.cyan, 0.65);

  const syncCamera = () => {
    const aspect = engine.getRenderWidth() / Math.max(1, engine.getRenderHeight());
    const viewHeight = 15.6;
    camera.orthoTop = viewHeight / 2;
    camera.orthoBottom = -viewHeight / 2;
    camera.orthoLeft = (-viewHeight * aspect) / 2;
    camera.orthoRight = (viewHeight * aspect) / 2;
  };
  syncCamera();

  const demo = new URLSearchParams(window.location.search).has("demo");
  const world = new GameWorld(scene, onSnapshot, demo);
  const observer = scene.onBeforeRenderObservable.add(() => {
    syncCamera();
    world.update(Math.min(0.05, engine.getDeltaTime() / 1000));
  });

  return {
    scene,
    world,
    dispose: () => {
      scene.onBeforeRenderObservable.remove(observer);
      world.dispose();
      scene.dispose();
    },
  };
}
