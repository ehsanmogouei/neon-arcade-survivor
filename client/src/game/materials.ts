// Signal Cathedral style reminder: use restrained glow as semantic signal; keep geometry hard-edged and palette-driven.
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import type { Scene } from "@babylonjs/core/scene";

export const ARENA_TEXTURE_URL = "/manus-storage/signal-cathedral-arena-texture_328077bc.png";
export const LOGO_TEXTURE_URL = "/manus-storage/signal-cathedral-logo_fba2d161.png";

export const COLORS = {
  ink: new Color3(0.027, 0.071, 0.094),
  panel: new Color3(0.051, 0.125, 0.145),
  line: new Color3(0.114, 0.255, 0.275),
  cyan: new Color3(0.271, 0.941, 0.902),
  coral: new Color3(1, 0.365, 0.365),
  lime: new Color3(0.851, 1, 0.408),
  violet: new Color3(0.816, 0.365, 1),
  amber: new Color3(1, 0.667, 0.243),
  paper: new Color3(0.906, 0.953, 0.91),
  muted: new Color3(0.533, 0.659, 0.643),
} as const;

export function makeMaterial(scene: Scene, name: string, color: Color3, emissive = color, alpha = 1) {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = color;
  material.emissiveColor = emissive;
  material.specularColor = Color3.Black();
  material.alpha = alpha;
  material.backFaceCulling = false;
  return material;
}

export function makeArenaMaterial(scene: Scene) {
  const material = new StandardMaterial("arena-instrument-field", scene);
  const texture = new Texture(ARENA_TEXTURE_URL, scene, true, false);
  texture.uScale = 6;
  texture.vScale = 6;
  material.diffuseTexture = texture;
  material.diffuseColor = COLORS.ink;
  material.emissiveColor = new Color3(0.01, 0.035, 0.04);
  material.specularColor = Color3.Black();
  return material;
}

export function makeLineMaterial(scene: Scene, name: string, color = COLORS.line, alpha = 0.8) {
  const material = makeMaterial(scene, name, color, color, alpha);
  material.disableLighting = true;
  return material;
}
