import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Eye,
  Activity,
  Layers,
  Sparkles,
  MapPin,
  Heart,
} from "lucide-react";
import RealisticHeart from "../anatomy/RealisticHeart";
import LungAnatomyModel from "../anatomy/LungModel";
import {
  BPM_MAX,
  BPM_MIN,
  CARDIAC_PHASES,
  VESSELS,
  createFlowParticles,
  flowSpeed,
  sampleFlowParticle,
  sampleCycle,
} from "../data/heartdata";
import { useAnatomy } from "../anatomy/anatomystate";

// Audio synthesizer for realistic cardiac valve closure sounds (S1 "Lub", S2 "Dub")
class StethoscopeAudio {
  constructor() {
    this.ctx = null;
    this.enabled = false;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled && !this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended" && this.enabled) {
      this.ctx.resume();
    }
    return this.enabled;
  }

  playS1() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      // Lower pitch, resonant closure of mitral and tricuspid valves
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(36, t + 0.13);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.32, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch {
      // Audio context error ignore
    }
  }

  playS2() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      // Higher pitch, crisper closure of aortic and pulmonary semilunar valves
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(54, t + 0.08);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.26, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch {
      // Audio context error ignore
    }
  }
}

// Global audio singleton for stability
const stethoscope = new StethoscopeAudio();

const HEART_FOCUS_POINTS = {
  right_atrium: [-0.2, 0.12, 0.08],
  right_ventricle: [-0.16, -0.16, 0.08],
  left_atrium: [0.16, 0.14, 0.06],
  left_ventricle: [0.16, -0.16, 0.06],
  tricuspid_valve: [-0.14, -0.01, 0.18],
  pulmonary_valve: [-0.05, 0.08, 0.15],
  mitral_valve: [0.1, -0.01, 0.16],
  aortic_valve: [0.03, 0.1, 0.12],
  aorta: [0.02, 0.52, 0],
  svc: [-0.04, 0.7, 0.14],
  ivc: [0, -0.65, 0.16],
  "pulmonary-right": [-0.5, 0.32, 0.1],
  "pulmonary-left": [0.5, 0.35, 0.1],
  "vein-right": [-0.4, 0.13, 0.1],
  "vein-left": [0.4, 0.15, 0.1],
};

// Vessel metadata for hover inspection
const VESSEL_METADATA = {
  svc: {
    label: "Superior Vena Cava (SVC)",
    role: "Large vein draining deoxygenated venous blood from head, neck, and upper limbs directly into right atrium",
    color: "#2563eb",
  },
  ivc: {
    label: "Inferior Vena Cava (IVC)",
    role: "Largest vein in the human body; ascends retroperitoneally to deliver venous blood from abdomen and lower limbs",
    color: "#2563eb",
  },
  "right-heart": {
    label: "Right Atrioventricular Pathway (Tricuspid)",
    role: "Propels low-pressure deoxygenated blood across the tricuspid valve into the right ventricle",
    color: "#1d4ed8",
  },
  "pulmonary-right": {
    label: "Right Pulmonary Artery",
    role: "Branches from pulmonary trunk across the mediastinum to perfuse the right pulmonary lobes",
    color: "#7c3aed",
  },
  "pulmonary-left": {
    label: "Left Pulmonary Artery",
    role: "Conveys venous blood to left lung for gas exchange across alveolar-capillary membranes",
    color: "#7c3aed",
  },
  "vein-right": {
    label: "Right Pulmonary Veins",
    role: "Four veins returning freshly oxygenated blood from the pulmonary circulation into left atrium",
    color: "#ef4444",
  },
  "vein-left": {
    label: "Left Pulmonary Veins",
    role: "Carries fully oxygenated blood from left lung directly into the left atrium",
    color: "#ef4444",
  },
  "left-heart": {
    label: "Left Atrioventricular Pathway (Mitral Valve)",
    role: "Directs high-flow oxygenated blood past the bicuspid/mitral valve into the thick-walled left ventricle",
    color: "#dc2626",
  },
  aorta: {
    label: "Ascending Aorta & Systemic Arch",
    role: "Primary high-pressure systemic trunk delivering oxygenated blood to coronary, cerebral, and somatic arteries",
    color: "#ff3344",
  },
  body: {
    label: "Systemic Capillary Microcirculation Loop",
    role: "Peripheral tissue perfusion bed where oxygen and nutrients are exchanged and venous return begins",
    color: "#fb7185",
  },
};

function VesselTubes({ onHoverPart, onSelectPart, hoverPart, visible = true }) {
  if (!visible) return null;

  return VESSELS.map((vessel) => {
    const meta = VESSEL_METADATA[vessel.id] || {
      label: vessel.name,
      role: "Vascular pathway",
      color: vessel.glass || "#38bdf8",
    };
    const isHovered = hoverPart?.name === vessel.id;

    return (
      <mesh
        key={vessel.id}
        onClick={(event) => { event.stopPropagation(); onSelectPart?.(vessel.id); }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          onHoverPart({
            name: vessel.id,
            label: meta.label,
            role: meta.role,
            system: "Cardiovascular System",
            color: meta.color,
            point: [e.point.x, e.point.y, e.point.z],
          });
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
          onHoverPart(null);
        }}
      >
        <tubeGeometry args={[vessel.curve, 56, vessel.radius, 10, false]} />
        <meshStandardMaterial
          color={vessel.glass}
          emissive={vessel.glass}
          emissiveIntensity={isHovered ? 0.95 : 0.42}
          transparent
          opacity={isHovered ? 0.65 : 0.32}
          roughness={0.25}
          depthWrite={false}
        />
      </mesh>
    );
  });
}

function BloodParticles({ visible = true, isPlaying = true, cycle, speed = 1 }) {
  const mesh = useRef(null);
  const { bpm } = useAnatomy();
  const bpmRef = useRef(bpm);
  const cycleRef = useRef(cycle);
  const speedRef = useRef(speed);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => createFlowParticles(290), []);
  const geometry = useMemo(() => new THREE.SphereGeometry(0.032, 8, 8), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        toneMapped: false,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    cycleRef.current = cycle;
  }, [cycle]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useFrame((_, delta) => {
    if (!mesh.current || !visible || !isPlaying) return;
    const particleSpeed = flowSpeed(bpmRef.current) * speedRef.current;
    const step = Math.min(delta, 0.05);

    particles.forEach((particle, index) => {
      const travel = step * particleSpeed;
      let boundary = 0;
      let segmentIndex = 0;
      for (; segmentIndex < particle.segments.length; segmentIndex += 1) {
        boundary += particle.segments[segmentIndex].length;
        if (particle.distance <= boundary) break;
      }
      const nextSegment = particle.segments[(segmentIndex + 1) % particle.segments.length];
      const nextVesselId = VESSELS[nextSegment.path].id;
      const phaseId = cycleRef.current?.phaseId;
      const inletOpen = phaseId === "atrial-systole" || phaseId === "ventricular-filling";
      const outletOpen = phaseId === "ventricular-ejection";
      const gateClosed = (["right-heart", "left-heart"].includes(nextVesselId) && !inletOpen)
        || (["pulmonary-right", "pulmonary-left", "aorta"].includes(nextVesselId) && !outletOpen);
      if (gateClosed && particle.distance + travel >= boundary) {
        particle.distance = (boundary - 0.002 + particle.length) % particle.length;
      } else {
        particle.distance = (particle.distance + travel) % particle.length;
      }
      const { vessel, t } = sampleFlowParticle(particle);
      const point = vessel.curve.getPointAt(t);
      dummy.position.copy(point);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(index, dummy.matrix);
      mesh.current.setColorAt(index, vessel.colorAt(t));
    });

    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, particles.length]}
      frustumCulled={false}
    />
  );
}

function CirculationCamera({ cameraPreset, setCameraPreset, resetKey, focusPart }) {
  const controls = useRef(null);
  const { camera } = useThree();

  useEffect(() => {
    if (!controls.current) return;
    const target = HEART_FOCUS_POINTS[focusPart] || [0, 0.05, 0];
    controls.current.target.set(...target);
    let pos = [0.15, 0.35, 4.4];
    if (cameraPreset === "anterior") {
      pos = [0.15, 0.25, 4.1];
    } else if (cameraPreset === "posterior") {
      pos = [0, 0.3, -4.3];
    } else if (cameraPreset === "superior") {
      pos = [0.05, 3.9, 1.8];
    } else if (cameraPreset === "closeUp") {
      pos = [target[0] + 0.08, target[1] + 0.1, focusPart ? 2.25 : 2.5];
    }

    gsap.to(camera.position, {
      x: pos[0],
      y: pos[1],
      z: pos[2],
      duration: 0.85,
      ease: "power2.out",
      onUpdate: () => controls.current && controls.current.update(),
    });
  }, [cameraPreset, camera, resetKey, focusPart]);

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableDamping
      minDistance={1.8}
      maxDistance={8}
      onChange={() => {
        if (cameraPreset) setCameraPreset(null);
      }}
    />
  );
}

function RealtimeECG({ bpm, phase, isPlaying }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Draw background grid
    ctx.fillStyle = "rgba(10, 18, 32, 0.95)";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(38, 65, 95, 0.32)";
    ctx.lineWidth = 1;
    const gridStep = 10;
    ctx.beginPath();
    for (let x = 0; x < width; x += gridStep) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += gridStep) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Lead II ECG Voltage waveform formula
    function getECGVoltage(t) {
      const cycle = t % 1;
      if (cycle < 0.08) return 0;
      // P wave (atrial depolarization)
      if (cycle >= 0.08 && cycle < 0.20) {
        return Math.sin(((cycle - 0.08) / 0.12) * Math.PI) * 0.22;
      }
      if (cycle >= 0.20 && cycle < 0.28) return 0;
      // Q wave
      if (cycle >= 0.28 && cycle < 0.30) {
        return -Math.sin(((cycle - 0.28) / 0.02) * Math.PI) * 0.12;
      }
      // R spike (ventricular depolarization)
      if (cycle >= 0.30 && cycle < 0.34) {
        return Math.sin(((cycle - 0.30) / 0.04) * Math.PI) * 0.94;
      }
      // S wave
      if (cycle >= 0.34 && cycle < 0.37) {
        return -Math.sin(((cycle - 0.34) / 0.03) * Math.PI) * 0.22;
      }
      if (cycle >= 0.37 && cycle < 0.44) return 0;
      // T wave (ventricular repolarization)
      if (cycle >= 0.44 && cycle < 0.60) {
        return Math.sin(((cycle - 0.44) / 0.16) * Math.PI) * 0.32;
      }
      return 0;
    }

    const midY = height * 0.56;
    const amp = height * 0.44;

    // Draw the glowing ECG line
    ctx.strokeStyle = "#5eead4";
    ctx.lineWidth = 1.8;
    ctx.shadowColor = "#5eead4";
    ctx.shadowBlur = 5;
    ctx.beginPath();

    const sweepX = (phase * width) % width;

    for (let x = 0; x < width; x++) {
      const cycleProgress = x / width;
      const voltage = getECGVoltage(cycleProgress);
      const y = midY - voltage * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw active conduction sweep bar
    if (isPlaying) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sweepX, 2);
      ctx.lineTo(sweepX, height - 2);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(sweepX, midY - getECGVoltage(phase) * amp, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [bpm, phase, isPlaying]);

  return (
    <div className="ecg-container">
      <div className="ecg-header">
        <span className="ecg-label">Lead II Rhythm Strip</span>
        <span className="ecg-speed">25 mm/s · 10 mm/mV</span>
      </div>
      <canvas
        ref={canvasRef}
        width={250}
        height={48}
        className="ecg-canvas"
      />
    </div>
  );
}

function rateLabel(bpm) {
  if (bpm < 65) return "Bradycardia / Rest";
  if (bpm <= 90) return "Resting Rhythm";
  if (bpm <= 125) return "Active Demand";
  return "Tachycardia / Exercise";
}

function getDetailedPhase(phaseId) {
  const active = CARDIAC_PHASES.find((item) => item.id === phaseId) || CARDIAC_PHASES[0];
  const descriptions = {
    "atrial-systole": "Atrial contraction tops off the ventricles. The tricuspid and mitral valves are open; the pulmonary and aortic valves are closed.",
    "isovolumetric-contraction": "The ventricles contract after the atrioventricular valves close. All four valves are briefly shut while ventricular pressure rises.",
    "ventricular-ejection": "Ventricular pressure opens the pulmonary and aortic valves. The right ventricle sends blood to the lungs and the left ventricle sends blood to the body.",
    "isovolumetric-relaxation": "The ventricles relax and the semilunar valves close. All four valves are briefly shut while ventricular pressure falls.",
    "ventricular-filling": "During diastole, blood returns to the atria and flows through the open tricuspid and mitral valves into the relaxed ventricles.",
  };
  return { title: active.label, desc: descriptions[active.id], status: active.id };
}

export default function BloodFlow() {
  const { bpm, setBpm, onPhase, onSelect } = useAnatomy();
  const [isPlaying, setIsPlaying] = useState(true);
  const [heartView, setHeartView] = useState("cutaway");
  const [showVessels, setShowVessels] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [speed, setSpeed] = useState(3);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [cameraPreset, setCameraPreset] = useState("anterior");
  const [cameraResetKey, setCameraResetKey] = useState(0);
  const [focusPart, setFocusPart] = useState(null);
  const [seekRequest, setSeekRequest] = useState({ phase: 0, key: 0 });
  const [selectedHeartPart, setSelectedHeartPart] = useState(null);
  const [hoveredPart, setHoveredPart] = useState(null);
  const [currentCycle, setCurrentCycle] = useState(() => sampleCycle(0, 72));

  const bpmRef = useRef(bpm);
  const s1FiredRef = useRef(false);
  const s2FiredRef = useRef(false);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  const toggleAudio = () => {
    const newState = stethoscope.toggle();
    setAudioEnabled(newState);
  };

  const selectHeartPart = (id) => {
    setSelectedHeartPart(id);
    setFocusPart(id);
    setCameraPreset("closeUp");
    onSelect?.(id);
  };
  const seekToPhase = (index) => {
    const phase = CARDIAC_PHASES[index];
    setSeekRequest((request) => ({ phase: phase.start + 0.005, key: request.key + 1 }));
    setIsPlaying(false);
  };
  const restartCycle = () => {
    setSeekRequest((request) => ({ phase: 0, key: request.key + 1 }));
    setIsPlaying(true);
  };

  const detailedPhase = useMemo(
    () => getDetailedPhase(currentCycle.phaseId),
    [currentCycle.phaseId]
  );

  // Cardiac output estimate: CO = SV * HR (assume standard stroke volume 70 mL)
  const cardiacOutput = useMemo(
    () => ((70 * bpm) / 1000).toFixed(1),
    [bpm]
  );

  return (
    <div className="anatomy-stage circulation-stage">
      {/* 3D Canvas Viewport */}
      <Canvas
        camera={{ position: [0.15, 0.35, 4.4], fov: 40, near: 0.1, far: 40 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#08101d"]} />
        <ambientLight intensity={0.65} />
        <hemisphereLight args={["#ffffff", "#0c1d32", 1.1]} />
        <directionalLight position={[4, 5, 6]} intensity={1.6} castShadow />
        <directionalLight position={[-4, 2, -3]} intensity={0.6} color="#63dff0" />
        <pointLight position={[0, 0.4, 1.8]} intensity={1.3} color="#fda4af" />
        <pointLight position={[0, -0.6, 1.4]} intensity={0.8} color="#93c5fd" />

        {/* Sync cycle clock & trigger audio in useFrame */}
        <CardiacCycleClock
          bpmRef={bpmRef}
          isPlaying={isPlaying}
          speed={speed}
          seekRequest={seekRequest}
          onCycleUpdate={setCurrentCycle}
          onPhase={onPhase}
          s1FiredRef={s1FiredRef}
          s2FiredRef={s2FiredRef}
        />

        <Suspense
          fallback={
            <Html center>
              <div className="model-loading">Loading Realistic 3D Heart…</div>
            </Html>
          }
        >
          {/* Exact Realistic 3D Heart from 3D Organ Studio */}
          <RealisticHeart
            shadingMode={
              "realistic"
            }
            translucent={heartView === "xray"}
            cutaway={heartView === "cutaway" || heartView === "xray"}
            cycle={currentCycle}
            labels={showLabels}
            isPumping={isPlaying}
            bpm={bpm}
            showPins={false}
            scale={0.58}
            offset={[0, 0, 0]}
            onHoverPart={setHoveredPart}
            hoverPart={null} // We render unified 3D hover tag below
            selectedPart={selectedHeartPart}
            onSelectPart={selectHeartPart}
          />

          {/* Vascular Tube Pipelines */}
          <VesselTubes
            onHoverPart={setHoveredPart}
            onSelectPart={selectHeartPart}
            hoverPart={hoveredPart}
            visible={showVessels}
          />

          {/* Moving Blood Cell Particles */}
          <BloodParticles visible={showParticles} isPlaying={isPlaying} cycle={currentCycle} speed={speed} />

          {/* Anatomical Bilateral Lungs */}
          {showVessels && <LungAnatomyModel mode="overview" onHoverPart={setHoveredPart} onSelectPart={selectHeartPart} selectedPart={selectedHeartPart} />}

          {/* Unified 3D Hover Tag on Cursor Hit Point */}
          {showLabels && hoveredPart && hoveredPart.point && (
            <Html
              position={hoveredPart.point}
              center
              style={{ pointerEvents: "none", zIndex: 9999 }}
            >
              <div className="anatomy-3d-hover-tag animate-tag-in">
                <span
                  className="hover-tag-dot"
                  style={{ background: hoveredPart.color || "#5eead4" }}
                />
                <div className="hover-tag-content">
                  <span className="hover-tag-title">{hoveredPart.label}</span>
                  <span className="hover-tag-hint">
                    {hoveredPart.role
                      ? hoveredPart.role.slice(0, 52) + "…"
                      : hoveredPart.system || "Cardiovascular"}
                  </span>
                </div>
              </div>
            </Html>
          )}
        </Suspense>

        <CirculationCamera
          cameraPreset={cameraPreset}
          setCameraPreset={setCameraPreset}
          resetKey={cameraResetKey}
          focusPart={focusPart}
        />
      </Canvas>

      {/* Top Floating Controls Bar */}
      <div className="circulation-top-hud">
        {/* Heart View Shading Switcher */}
        <div className="circulation-hud-group" title="Heart Shading Mode">
          <button
            className={`circulation-hud-btn ${
              heartView === "cutaway" ? "active" : ""
            }`}
            onClick={() => setHeartView("cutaway")}
          >
            <Sparkles size={14} />
            <span>Cutaway</span>
          </button>
          <button
            className={`circulation-hud-btn ${
              heartView === "xray" ? "active" : ""
            }`}
            onClick={() => setHeartView("xray")}
          >
            <Eye size={14} />
            <span>X-ray</span>
          </button>
          <button
            className={`circulation-hud-btn ${
              heartView === "external" ? "active" : ""
            }`}
            onClick={() => setHeartView("external")}
          >
            <Heart size={14} />
            <span>External</span>
          </button>
        </div>

        {/* Camera Views & Audio */}
        <div className="circulation-hud-group">
          <button
            className={`circulation-hud-btn ${
              cameraPreset === "anterior" ? "active" : ""
            }`}
            onClick={() => { setFocusPart(null); setCameraPreset("anterior"); }}
            title="Frontal View"
          >
            <span>Anterior</span>
          </button>
          <button
            className={`circulation-hud-btn ${
              cameraPreset === "posterior" ? "active" : ""
            }`}
            onClick={() => { setFocusPart(null); setCameraPreset("posterior"); }}
            title="Dorsal View"
          >
            <span>Posterior</span>
          </button>
          <button
            className={`circulation-hud-btn ${
              cameraPreset === "superior" ? "active" : ""
            }`}
            onClick={() => { setFocusPart(null); setCameraPreset("superior"); }}
            title="Aortic Arch & Pulmonary Trunk"
          >
            <span>Arch</span>
          </button>
          <button
            className={`circulation-hud-btn ${
              cameraPreset === "closeUp" ? "active" : ""
            }`}
            onClick={() => setCameraPreset("closeUp")}
            title="Cardiac Close-up"
          >
            <span>Focus</span>
          </button>

          {/* Stethoscope Audio Toggle */}
          <button
            className={`circulation-hud-btn ${audioEnabled ? "active-audio" : ""}`}
            onClick={toggleAudio}
            title={
              audioEnabled
                ? "Stethoscope Sound ON (Lub-Dub)"
                : "Enable Stethoscope Heart Sound (Lub-Dub)"
            }
          >
            {audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>{audioEnabled ? "Auscultation ON" : "Audio"}</span>
          </button>

          {/* Toggles */}
          <button
            className={`circulation-hud-btn icon-only ${
              showLabels ? "active" : ""
            }`}
            onClick={() => setShowLabels((prev) => !prev)}
            title={showLabels ? "Hide anatomical labels" : "Show anatomical labels"}
            aria-label={showLabels ? "Hide anatomical labels" : "Show anatomical labels"}
            aria-pressed={showLabels}
          >
            <MapPin size={14} />
          </button>
          <button
            className={`circulation-hud-btn icon-only ${
              showParticles ? "active" : ""
            }`}
            onClick={() => setShowParticles((prev) => !prev)}
            title="Toggle Blood Cell Flow"
            aria-label={showParticles ? "Hide blood flow particles" : "Show blood flow particles"}
            aria-pressed={showParticles}
          >
            <Activity size={14} />
          </button>
          <button
            className="circulation-hud-btn icon-only"
            onClick={() => setShowVessels((previous) => !previous)}
            title={showVessels ? "Hide lungs and vessels" : "Show lungs and vessels"}
            aria-label={showVessels ? "Hide lungs and vessels" : "Show lungs and vessels"}
            aria-pressed={showVessels}
          >
            <Layers size={14} />
          </button>
          <button
            className="circulation-hud-btn"
            onClick={() => { setFocusPart(null); setCameraPreset("anterior"); setCameraResetKey((key) => key + 1); }}
            title="Restore the anterior camera view"
          >
            <RotateCcw size={14} /><span>Reset camera</span>
          </button>
        </div>
      </div>

      {/* Bottom Cardiac Control & Telemetry Panel */}
      <div className="bpm-panel circulation-telemetry-panel">
        <div className="bpm-readout">
          <div>
            <div className="bpm-title-row">
              <p>Heart Rate</p>
              <button
                className="play-pause-btn"
                onClick={() => setIsPlaying((prev) => !prev)}
                title={isPlaying ? "Pause Cardiac Cycle" : "Play Cardiac Cycle"}
                aria-label={isPlaying ? "Pause cardiac cycle" : "Play cardiac cycle"}
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              </button>
            </div>
            <strong>{bpm} BPM</strong>
          </div>
          <div className="bpm-telemetry-meta">
            <span className="rate-badge">{rateLabel(bpm)}</span>
            <span className="co-badge">CO ~{cardiacOutput} L/min</span>
          </div>
        </div>

        {/* Real-time Lead II ECG Monitor Strip */}
        <RealtimeECG
          bpm={bpm}
          phase={currentCycle.phase}
          isPlaying={isPlaying}
        />

        {/* BPM Slider */}
        <input
          type="range"
          min={BPM_MIN}
          max={BPM_MAX}
          value={bpm}
          aria-label="Heart rate in beats per minute"
          onChange={(event) => setBpm(Number(event.target.value))}
        />

        <label className="heart-speed-control">Cycle speed
          <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
            <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option><option value={2}>2×</option><option value={3}>3×</option>
          </select>
        </label>

        <div className="cardiac-phase-steps" aria-label="Choose a cardiac cycle phase">
          {CARDIAC_PHASES.map((phase, index) => (
            <button key={phase.id} type="button" className={currentCycle.phaseId === phase.id ? "active" : ""} aria-pressed={currentCycle.phaseId === phase.id} onClick={() => seekToPhase(index)}>
              {index + 1}. {phase.label}
            </button>
          ))}
        </div>
        <div className="cardiac-progress-track" role="progressbar" aria-label="Progress through current heartbeat" aria-valuenow={Math.round(currentCycle.phase * 100)} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${currentCycle.phase * 100}%` }} />
        </div>
        <div className="cardiac-cycle-actions">
          <button type="button" onClick={restartCycle}><RotateCcw size={14} />Restart cycle</button>
          <span>LV pressure (illustrative): {currentCycle.ventricularPressure ?? 8} mmHg</span>
        </div>

        {/* Quick Rate Preset Chips */}
        <div className="bpm-preset-chips">
          <button
            className={`preset-chip ${bpm === 60 ? "active" : ""}`}
            onClick={() => setBpm(60)}
          >
            60 Rest
          </button>
          <button
            className={`preset-chip ${bpm === 72 ? "active" : ""}`}
            onClick={() => setBpm(72)}
          >
            72 Normal
          </button>
          <button
            className={`preset-chip ${bpm === 100 ? "active" : ""}`}
            onClick={() => setBpm(100)}
          >
            100 Brisk
          </button>
          <button
            className={`preset-chip ${bpm === 140 ? "active" : ""}`}
            onClick={() => setBpm(140)}
          >
            140 Exercise
          </button>
        </div>

        {/* Current Cardiac Cycle Stage Banner */}
        <div className="phase-pill-card">
          <div className="phase-card-header">
            <span className="phase-status-dot" />
            <span className="phase-title">{detailedPhase.title}</span>
          </div>
          <p className="phase-card-desc">{detailedPhase.desc}</p>
          <p className="phase-card-simple">{currentCycle.simple}</p>
        </div>
      </div>

      {/* Vascular Hemodynamics Legend */}
      <div className="flow-legend">
        <span>
          <i className="swatch deoxy" /> Deoxygenated (Venous / Pulmonary Arteries)
        </span>
        <span>
          <i className="swatch oxy" /> Oxygenated (Pulmonary Veins / Aorta)
        </span>
        <span>
          <i className="swatch" style={{ background: "#7c3aed" }} /> Gas Exchange Bed (Lungs)
        </span>
      </div>
    </div>
  );
}

// Inner component inside Canvas to handle cycle sampling and audio triggers
function CardiacCycleClock({
  bpmRef,
  isPlaying,
  speed,
  seekRequest,
  onCycleUpdate,
  onPhase,
  s1FiredRef,
  s2FiredRef,
}) {
  const clockRef = useRef({ time: 0, lastUiUpdate: 0, seekKey: 0 });

  useFrame((state, delta) => {
    if (clockRef.current.seekKey !== seekRequest.key) {
      clockRef.current.seekKey = seekRequest.key;
      clockRef.current.time = (seekRequest.phase * 60) / Math.max(bpmRef.current, 30);
    }
    if (isPlaying) {
      clockRef.current.time += delta * speed;
    }
    const cycle = sampleCycle(clockRef.current.time, bpmRef.current);
    const previousPhase = clockRef.current.lastCyclePhase ?? cycle.phase;
    const crossed = (boundary) => previousPhase <= cycle.phase
      ? previousPhase < boundary && cycle.phase >= boundary
      : previousPhase < boundary || cycle.phase >= boundary;
    if (cycle.phase < previousPhase) {
      s1FiredRef.current = false;
      s2FiredRef.current = false;
    }
    if (isPlaying && crossed(0.12) && !s1FiredRef.current) {
      s1FiredRef.current = true;
      stethoscope.playS1();
    }
    if (isPlaying && crossed(0.42) && !s2FiredRef.current) {
      s2FiredRef.current = true;
      stethoscope.playS2();
    }
    clockRef.current.lastCyclePhase = cycle.phase;
    const changedPhase = cycle.phaseId !== clockRef.current.lastPhase;
    if (changedPhase || state.clock.elapsedTime - clockRef.current.lastUiUpdate > 0.06) {
      clockRef.current.lastPhase = cycle.phaseId;
      clockRef.current.lastUiUpdate = state.clock.elapsedTime;
      onCycleUpdate(cycle);
      onPhase(cycle.label);
    }

    // Audio S1 / S2 triggers
  });

  return null;
}
