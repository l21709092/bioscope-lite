import { Suspense, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { Activity, AirVent, Eye, Layers, Pause, Play, RotateCcw, Wind } from "lucide-react";
import LungAnatomyModel from "./LungModel";

const MODES = [
  ["overview", "Anatomy"],
  ["airways", "Airways"],
  ["breathing", "Breathing"],
  ["gas-exchange", "Gas exchange"],
];

function LungCamera({ mode, resetKey }) {
  const { camera, controls } = useThree();
  useEffect(() => {
    const close = mode === "gas-exchange";
    camera.position.set(close ? 0.2 : 0.15, close ? 0.12 : 0.2, close ? 2.45 : 3.9);
    camera.lookAt(close ? 0.15 : 0, 0, 0);
    if (controls) {
      controls.target.set(close ? 0.15 : 0, 0, 0);
      controls.update();
    }
  }, [camera, controls, mode, resetKey]);
  return <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={1.6} maxDistance={7} />;
}

function inhalationAt(progress) {
  return progress < 0.42 ? Math.sin((progress / 0.42) * Math.PI) : 0;
}

export default function LungExplorer({ onSelectPart = () => {}, selectedPart = null }) {
  const [mode, setMode] = useState("overview");
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(3);
  const [progress, setProgress] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [showLabels, setShowLabels] = useState(true);
  const [showStructures, setShowStructures] = useState(true);
  const [xray, setXray] = useState(false);
  const [hoveredPart, setHoveredPart] = useState(null);
  const breath = inhalationAt(progress);
  const inhaling = progress < 0.42;
  const phaseTitle = inhaling ? "Inspiration · air moves in" : "Expiration · air moves out";
  const phaseDescription = inhaling
    ? "The diaphragm contracts and moves down. The chest cavity gets larger, pressure inside the lungs falls slightly, and air flows in."
    : "The diaphragm relaxes and rises. The chest cavity gets smaller, elastic lung tissue recoils, and air flows out."

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => {
      setProgress((current) => (current + (0.1 * speed) / 5) % 1);
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing, speed]);

  const restart = () => {
    setProgress(0);
    setResetKey((value) => value + 1);
    setMode("overview");
  };

  const choosePhase = (nextProgress) => {
    setProgress(nextProgress);
    setPlaying(false);
  };

  return (
    <div className="lung-explorer">
      <div className="lung-mode-tabs" role="tablist" aria-label="Lung exploration mode">
        {MODES.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={mode === id} className={mode === id ? "active" : ""} onClick={() => setMode(id)}>
            {label}
          </button>
        ))}
      </div>
      <div className="lung-canvas-stage" role="img" aria-label="Interactive three-dimensional lungs, airways, diaphragm and alveolar gas exchange model">
        <Canvas camera={{ position: [0.15, 0.2, 3.9], fov: 37, near: 0.1, far: 30 }} dpr={[1, 1.5]}>
          <color attach="background" args={["#08101d"]} />
          <ambientLight intensity={0.78} />
          <hemisphereLight args={["#fff4ec", "#17283c", 1.1]} />
          <directionalLight position={[3, 4, 5]} intensity={1.45} />
          <pointLight position={[-2, 1, 2]} intensity={0.65} color="#fda4af" />
          <Suspense fallback={null}>
            {showStructures && <LungAnatomyModel
              mode={mode}
              breath={breath}
              progress={progress * 2.5}
              xray={xray}
              labels={showLabels}
              selectedPart={selectedPart}
              onSelectPart={onSelectPart}
              onHoverPart={setHoveredPart}
            />}
            {showLabels && hoveredPart?.point && (
              <Html position={hoveredPart.point} center style={{ pointerEvents: "none" }}>
                <span className="lung-hover-label">{hoveredPart.label}</span>
              </Html>
            )}
          </Suspense>
          <LungCamera mode={mode} resetKey={resetKey} />
        </Canvas>
        <span className="lung-stage-hint"><Wind size={13} /> Drag to orbit · scroll to zoom · click a structure to inspect</span>
      </div>
      <div className="lung-simulation-controls">
        <div className="lung-cycle-copy" aria-live="polite">
          <span className="lung-phase-label"><Activity size={14} />{phaseTitle}</span>
          <p>{mode === "gas-exchange"
            ? "Oxygen diffuses from the alveolar air into nearby capillary blood. Carbon dioxide diffuses from blood into the alveolus, down each gas’s partial-pressure gradient."
            : phaseDescription}</p>
        </div>
        <div className="lung-progress" role="progressbar" aria-label="Breathing cycle" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="lung-control-row">
          <button type="button" onClick={() => setPlaying((value) => !value)}>{playing ? <Pause size={15} /> : <Play size={15} />}{playing ? "Pause" : "Play"}</button>
          <button type="button" onClick={() => choosePhase(0.16)}>Inspiration</button>
          <button type="button" onClick={() => choosePhase(0.62)}>Expiration</button>
          <button type="button" onClick={restart}><RotateCcw size={15} />Restart</button>
          <label>Speed
            <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
              <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option><option value={2}>2×</option><option value={3}>3×</option>
            </select>
          </label>
          <button type="button" aria-pressed={showLabels} onClick={() => setShowLabels((value) => !value)}><Eye size={15} />{showLabels ? "Labels on" : "Labels off"}</button>
          <button type="button" aria-pressed={showStructures} onClick={() => setShowStructures((value) => !value)}><Layers size={15} />{showStructures ? "Structures on" : "Structures off"}</button>
          {mode !== "gas-exchange" && <button type="button" aria-pressed={xray} onClick={() => setXray((value) => !value)}><Eye size={15} />{xray ? "X-ray on" : "X-ray off"}</button>}
          <button type="button" onClick={() => setResetKey((value) => value + 1)}><AirVent size={15} />Reset camera</button>
        </div>
      </div>
    </div>
  );
}

