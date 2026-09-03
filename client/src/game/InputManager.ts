// Signal Cathedral style reminder: controls behave like direct instrumentation—immediate, terse, and stateful.
import type { SemanticInput } from "./types";

const MOVE_KEYS: Record<string, [number, number]> = {
  KeyW: [0, -1],
  ArrowUp: [0, -1],
  KeyS: [0, 1],
  ArrowDown: [0, 1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
};

export class InputManager {
  private readonly held = new Set<string>();
  private dashPressed = false;
  private pausePressed = false;
  private restartPressed = false;
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.code in MOVE_KEYS || ["Space", "Enter", "KeyP", "Escape", "KeyR"].includes(event.code)) {
      event.preventDefault();
    }
    if (event.repeat) return;
    this.held.add(event.code);
    if (event.code === "Space") this.dashPressed = true;
    if (event.code === "KeyP" || event.code === "Escape") this.pausePressed = true;
    if (event.code === "Enter" || event.code === "KeyR") this.restartPressed = true;
  };
  private readonly onKeyUp = (event: KeyboardEvent) => {
    this.held.delete(event.code);
  };

  constructor() {
    window.addEventListener("keydown", this.onKeyDown, { passive: false });
    window.addEventListener("keyup", this.onKeyUp);
  }

  read(): SemanticInput {
    let moveX = 0;
    let moveZ = 0;
    for (const code of Object.keys(MOVE_KEYS)) {
      if (!this.held.has(code)) continue;
      const [x, z] = MOVE_KEYS[code];
      moveX += x;
      moveZ += z;
    }
    const length = Math.hypot(moveX, moveZ) || 1;
    const output = {
      moveX: moveX / length,
      moveZ: moveZ / length,
      dashPressed: this.dashPressed,
      pausePressed: this.pausePressed,
      restartPressed: this.restartPressed,
    };
    this.dashPressed = false;
    this.pausePressed = false;
    this.restartPressed = false;
    return output;
  }

  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.held.clear();
  }
}
