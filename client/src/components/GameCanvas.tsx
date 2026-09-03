// Signal Cathedral style reminder: React is the picture frame; keep the full-bleed arena visible and anchor HUD like calibrated instrumentation.
import { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene } from "@/game/scene";
import type { GameHandle, GameSnapshot } from "@/game/types";
import { LOGO_TEXTURE_URL } from "@/game/materials";

const INITIAL_SNAPSHOT: GameSnapshot = {
  mode: "title",
  score: 0,
  wave: 1,
  health: 100,
  multiplier: 1,
  chainProgress: 0,
  dashCooldown: 0,
  dashReady: true,
  enemies: 0,
  objective: "PRESS ENTER OR LAUNCH TO BEGIN",
  banner: "SIGNAL READY",
  bannerTone: "cyan",
};

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const handleRef = useRef<GameHandle | null>(null);
  const [snapshot, setSnapshot] = useState<GameSnapshot>(INITIAL_SNAPSHOT);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;
    let cancelled = false;
    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true,
    });

    createGameScene(engine, canvas, setSnapshot).then((handle) => {
      if (cancelled) {
        handle.dispose();
        engine.dispose();
        return;
      }
      handleRef.current = handle;
      engine.runRenderLoop(() => handle.scene.render());
    });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      handleRef.current?.dispose();
      handleRef.current = null;
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  const launch = () => {
    const world = handleRef.current?.world;
    if (!world) return;
    if (snapshot.mode === "title" || snapshot.mode === "gameover") world.start();
    else if (snapshot.mode === "paused") world.togglePause();
  };

  const restart = () => handleRef.current?.world.restart();
  const togglePause = () => handleRef.current?.world.togglePause();
  const healthWidth = `${Math.max(0, snapshot.health)}%`;
  const chainWidth = `${Math.max(0, snapshot.chainProgress)}%`;
  const isMenu = snapshot.mode === "title" || snapshot.mode === "gameover";

  return (
    <main className="game-shell">
      <canvas ref={canvasRef} className="game-canvas" aria-label="Signal Cathedral game arena" />
      <div className="grain" aria-hidden="true" />
      <div className="scan-flash" aria-hidden="true" />
      <div className="arena-overlay" aria-hidden="true">
        <div className="arena-corner corner-tl" /><div className="arena-corner corner-tr" /><div className="arena-corner corner-bl" /><div className="arena-corner corner-br" />
        <div className="arena-ring ring-outer" /><div className="arena-ring ring-inner" />
        <div className="arena-crosshair"><i /><i /><i /><i /><b /></div>
        <div className="arena-readout readout-left">VECTOR FIELD // 09.6</div>
        <div className="arena-readout readout-right">CALIBRATED / 360°</div>
        {snapshot.mode === "playing" && <><div className="coral-signal threat-one" /><div className="coral-signal threat-two" /><div className="coral-signal threat-three" /></>}
      </div>

      <aside className="mission-rail" aria-label="Mission telemetry">
        <div className="brand-lockup">
          <div className="brand-symbol"><span className="symbol-beam" /><span className="symbol-core" /><span className="symbol-corner symbol-tl" /><span className="symbol-corner symbol-tr" /><span className="symbol-corner symbol-bl" /><span className="symbol-corner symbol-br" /><img src={LOGO_TEXTURE_URL} alt="" className="brand-mark" /></div>
          <div>
            <p className="eyebrow">SIGNAL / 01</p>
            <h1>Signal<br />Cathedral</h1>
          </div>
        </div>
        <div className="rail-rule" />
        <section className="mission-block">
          <p className="eyebrow">Current directive</p>
          <p className="directive">Hold the signal.<br />Break the swarm.</p>
          <div className="status-line"><span className="status-dot" /> LIVE TELEMETRY</div>
        </section>
        <div className="rail-footer">
          <span>BUILD 0.1.4</span>
          <span>NEO / ARCADE</span>
        </div>
      </aside>

      <section className="telemetry-stack" aria-label="Score telemetry">
        <div className="telemetry-card score-card">
          <div className="card-heading"><span>SCORE</span><span className="tiny-ticks">///</span></div>
          <strong className="score-value">{String(snapshot.score).padStart(6, "0")}</strong>
          <div className="chain-row"><span>CHAIN x{snapshot.multiplier}</span><span>{snapshot.enemies} HOSTILES</span></div>
          <div className="progress-track chain-track"><span style={{ width: chainWidth }} /></div>
        </div>
        <div className="telemetry-card wave-card">
          <div className="card-heading"><span>WAVE</span><span className="wave-number">{String(snapshot.wave).padStart(2, "0")}</span></div>
          <div className="health-label"><span>HULL INTEGRITY</span><span>{Math.round(snapshot.health)}%</span></div>
          <div className="progress-track health-track"><span style={{ width: healthWidth }} /></div>
          <div className="dash-label"><span>DASH COIL</span><span className={snapshot.dashReady ? "ready" : "cooling"}>{snapshot.dashReady ? "READY" : `${snapshot.dashCooldown.toFixed(1)}s`}</span></div>
        </div>
      </section>

      <div className="top-status"><span className="status-dot" /> <span>ARENA LINK STABLE</span><span className="top-status-divider" /> <span>07:42:18</span></div>

      <div className="objective-bar"><span className="objective-index">OBJ / {snapshot.mode === "gameover" ? "XX" : String(snapshot.wave).padStart(2, "0")}</span><span>{snapshot.objective}</span></div>

      {snapshot.banner && <div className={`signal-banner banner-${snapshot.bannerTone}`} role="status">{snapshot.banner}</div>}

      {isMenu && (
        <section className="command-console" aria-label="Game start console">
          <div className="console-top"><span>{snapshot.mode === "gameover" ? "CATHEDRAL OFFLINE" : "READY STATE"}</span><span>///</span></div>
          <h2>{snapshot.mode === "gameover" ? "Signal lost." : "Enter the arena."}</h2>
          <p>{snapshot.mode === "gameover" ? "The swarm crossed the perimeter. Reboot the signal and try a sharper line." : "Auto-fire is active. Your job is to move, dash, and keep the chain alive."}</p>
          <button className="launch-button" onClick={launch}><span>{snapshot.mode === "gameover" ? "REBOOT SIGNAL" : "LAUNCH RUN"}</span><span className="button-glyph">↗</span></button>
          <div className="console-hint"><span>ENTER</span><span>to launch</span></div>
        </section>
      )}

      {snapshot.mode === "paused" && (
        <section className="pause-card" aria-label="Paused game">
          <p className="eyebrow">SYSTEM HOLD</p>
          <h2>Telemetry frozen.</h2>
          <button className="text-button" onClick={togglePause}>RESUME SIGNAL <span>↗</span></button>
        </section>
      )}

      <div className="controls-rail">
        <div><span className="keycap">W</span><span className="keycap">A</span><span className="keycap">S</span><span className="keycap">D</span><span className="control-label">MOVE</span></div>
        <div><span className="keycap wide">SPACE</span><span className="control-label">DASH</span></div>
        <button className="pause-button" onClick={togglePause} aria-label={snapshot.mode === "paused" ? "Resume game" : "Pause game"}>{snapshot.mode === "paused" ? "RESUME" : "PAUSE"}</button>
        <button className="reset-button" onClick={restart}>RESET ↺</button>
      </div>
    </main>
  );
}
