import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from "react";
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
  Compass,
  Heart,
} from "lucide-react";
import RealisticHeart from "../anatomy/RealisticHeart";
import {
  BPM_MAX,
  BPM_MIN,
  CHAMBERS,
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

function VesselTubes({ onHoverPart, hoverPart, visible = true }) {
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

function BloodParticles({ visible = true, isPlaying = true }) {
  const mesh = useRef(null);
  const { bpm } = useAnatomy();
  const bpmRef = useRef(bpm);
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

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useFrame((_, delta) => {
    if (!mesh.current || !visible || !isPlaying) return;
    const speed = flowSpeed(bpmRef.current);
    const step = Math.min(delta, 0.05);

    particles.forEach((particle, index) => {
      particle.distance = (particle.distance + step * speed) % particle.length;
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

function AnatomicalLungs({ onHoverPart, cycle, visible = true }) {
  if (!visible) return null;

  // Gentle pulmonary expansion in sync with cycle
  const lungPulse = 1 + Math.sin(cycle.phase * Math.PI * 2) * 0.022;
  const lungEmissive = 0.14 + (cycle.phase > 0.35 && cycle.phase < 0.72 ? 0.38 : 0.08);

  return (
    <group>
      {/* Right Lung (3 lobes: superior, middle, inferior) */}
      <group
        position={CHAMBERS.lungRight}
        scale={[0.66 * lungPulse, 0.86 * lungPulse, 0.45 * lungPulse]}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          onHoverPart({
            name: "right_lung",
            label: "Right Lung (3 Lobes)",
            role: "Site of alveolar oxygen uptake; receives deoxygenated blood from right pulmonary artery",
            system: "Respiratory / Pulmonary Circuit",
            color: "#fb7185",
            point: [e.point.x, e.point.y, e.point.z],
          });
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
          onHoverPart(null);
        }}
      >
        <mesh>
          <sphereGeometry args={[0.55, 26, 20]} />
          <meshStandardMaterial
            color="#fda4af"
            emissive="#fb7185"
            emissiveIntensity={lungEmissive}
            transparent
            opacity={0.3}
            roughness={0.4}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Left Lung (2 lobes with cardiac notch accommodating heart apex) */}
      <group
        position={CHAMBERS.lungLeft}
        scale={[0.58 * lungPulse, 0.80 * lungPulse, 0.42 * lungPulse]}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          onHoverPart({
            name: "left_lung",
            label: "Left Lung (2 Lobes & Cardiac Notch)",
            role: "Contains cardiac impression; exchanges CO2 for O2 before sending blood to left pulmonary veins",
            system: "Respiratory / Pulmonary Circuit",
            color: "#fb7185",
            point: [e.point.x, e.point.y, e.point.z],
          });
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
          onHoverPart(null);
        }}
      >
        <mesh>
          <sphereGeometry args={[0.55, 26, 20]} />
          <meshStandardMaterial
            color="#fda4af"
            emissive="#fb7185"
            emissiveIntensity={lungEmissive}
            transparent
            opacity={0.3}
            roughness={0.4}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

function CirculationCamera({ cameraPreset, setCameraPreset }) {
  const controls = useRef(null);
  const { camera } = useThree();

  useEffect(() => {
    if (!controls.current) return;
    controls.current.target.set(0, 0.05, 0);

    let pos = [0.15, 0.35, 4.4];
    if (cameraPreset === "anterior") {
      pos = [0.15, 0.25, 4.1];
    } else if (cameraPreset === "posterior") {
      pos = [0, 0.3, -4.3];
    } else if (cameraPreset === "superior") {
      pos = [0.05, 3.9, 1.8];
    } else if (cameraPreset === "closeUp") {
      pos = [0.08, -0.06, 2.5];
    }

    gsap.to(camera.position, {
      x: pos[0],
      y: pos[1],
      z: pos[2],
      duration: 0.85,
      ease: "power2.out",
      onUpdate: () => controls.current && controls.current.update(),
    });
  }, [cameraPreset, camera]);

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

function getDetailedPhase(phase) {
  if (phase < 0.14) {
    return {
      title: "Atrial Systole (P-Wave)",
      desc: "SA node fires; atria contract to pump the final 20% blood volume into ventricles.",
      status: "Atrial Inflow",
    };
  }
  if (phase < 0.22) {
    return {
      title: "Isovolumetric Contraction (S1 'Lub')",
      desc: "Ventricles contract; AV valves snap shut (S1 heart sound); ventricular pressure surges.",
      status: "AV Valves Closed",
    };
  }
  if (phase < 0.42) {
    return {
      title: "Rapid Ventricular Ejection (QRS Spike)",
      desc: "Aortic & pulmonic valves open; blood rushes into aorta and pulmonary arteries.",
      status: "Systolic Ejection",
    };
  }
  if (phase < 0.50) {
    return {
      title: "Isovolumetric Relaxation (S2 'Dub')",
      desc: "Ventricles relax; semilunar valves snap shut (S2 heart sound); prevents arterial backflow.",
      status: "Semilunar Closure",
    };
  }
  return {
    title: "Ventricular Diastole (Filling Phase)",
    desc: "Chambers expand; passive venous inflow refills right and left atria and ventricles.",
    status: "Passive Diastole",
  };
}

export default function BloodFlow() {
  const { bpm, setBpm, onPhase, onSelect } = useAnatomy();
  const [isPlaying, setIsPlaying] = useState(true);
  const [heartView, setHeartView] = useState("translucent"); // "realistic", "translucent", "wireframe"
  const [showVessels, setShowVessels] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [cameraPreset, setCameraPreset] = useState("anterior");
  const [hoveredPart, setHoveredPart] = useState(null);
  const [currentCycle, setCurrentCycle] = useState({
    phase: 0,
    atrial: 0,
    ventricular: 0,
    label: "Diastole · chambers filling",
  });

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

  const detailedPhase = useMemo(
    () => getDetailedPhase(currentCycle.phase),
    [currentCycle.phase]
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
              heartView === "wireframe"
                ? "wireframe"
                : heartView === "xray"
                ? "xray"
                : "realistic"
            }
            translucent={heartView === "translucent"}
            isPumping={isPlaying}
            bpm={bpm}
            showPins={showLandmarks}
            scale={0.58}
            offset={[0, 0, 0]}
            onHoverPart={setHoveredPart}
            hoverPart={null} // We render unified 3D hover tag below
            onSelectPart={(id) => onSelect && onSelect(id)}
          />

          {/* Vascular Tube Pipelines */}
          <VesselTubes
            onHoverPart={setHoveredPart}
            hoverPart={hoveredPart}
            visible={showVessels}
          />

          {/* Moving Blood Cell Particles */}
          <BloodParticles visible={showParticles} isPlaying={isPlaying} />

          {/* Anatomical Bilateral Lungs */}
          <AnatomicalLungs
            onHoverPart={setHoveredPart}
            cycle={currentCycle}
            visible={showVessels}
          />

          {/* Unified 3D Hover Tag on Cursor Hit Point */}
          {hoveredPart && hoveredPart.point && (
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
        />
      </Canvas>

      {/* Top Floating Controls Bar */}
      <div className="circulation-top-hud">
        {/* Heart View Shading Switcher */}
        <div className="circulation-hud-group" title="Heart Shading Mode">
          <button
            className={`circulation-hud-btn ${
              heartView === "translucent" ? "active" : ""
            }`}
            onClick={() => setHeartView("translucent")}
          >
            <Sparkles size={14} />
            <span>Translucent Hemodynamics</span>
          </button>
          <button
            className={`circulation-hud-btn ${
              heartView === "realistic" ? "active" : ""
            }`}
            onClick={() => setHeartView("realistic")}
          >
            <Heart size={14} />
            <span>Photorealistic Heart</span>
          </button>
          <button
            className={`circulation-hud-btn ${
              heartView === "wireframe" ? "active" : ""
            }`}
            onClick={() => setHeartView("wireframe")}
          >
            <Layers size={14} />
            <span>Wireframe</span>
          </button>
        </div>

        {/* Camera Views & Audio */}
        <div className="circulation-hud-group">
          <button
            className={`circulation-hud-btn ${
              cameraPreset === "anterior" ? "active" : ""
            }`}
            onClick={() => setCameraPreset("anterior")}
            title="Frontal View"
          >
            <span>Anterior</span>
          </button>
          <button
            className={`circulation-hud-btn ${
              cameraPreset === "posterior" ? "active" : ""
            }`}
            onClick={() => setCameraPreset("posterior")}
            title="Dorsal View"
          >
            <span>Posterior</span>
          </button>
          <button
            className={`circulation-hud-btn ${
              cameraPreset === "superior" ? "active" : ""
            }`}
            onClick={() => setCameraPreset("superior")}
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
              showLandmarks ? "active" : ""
            }`}
            onClick={() => setShowLandmarks((prev) => !prev)}
            title="Toggle Anatomical Landmarks"
          >
            <MapPin size={14} />
          </button>
          <button
            className={`circulation-hud-btn icon-only ${
              showParticles ? "active" : ""
            }`}
            onClick={() => setShowParticles((prev) => !prev)}
            title="Toggle Blood Cell Flow"
          >
            <Activity size={14} />
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
  onCycleUpdate,
  onPhase,
  s1FiredRef,
  s2FiredRef,
}) {
  const clockRef = useRef({ lastElapsed: 0, time: 0 });

  useFrame((state, delta) => {
    if (isPlaying) {
      clockRef.current.time += delta;
    }
    const cycle = sampleCycle(clockRef.current.time, bpmRef.current);
    onCycleUpdate(cycle);
    onPhase(cycle.label);

    // Audio S1 / S2 triggers
    const cycleDuration = 60 / Math.max(bpmRef.current, 30);
    const cycleTime = (clockRef.current.time % cycleDuration) / cycleDuration;

    if (cycleTime < 0.1) {
      s1FiredRef.current = false;
      s2FiredRef.current = false;
    }

    if (cycleTime >= 0.12 && cycleTime < 0.22 && !s1FiredRef.current) {
      s1FiredRef.current = true;
      stethoscope.playS1();
    }

    if (cycleTime >= 0.42 && cycleTime < 0.52 && !s2FiredRef.current) {
      s2FiredRef.current = true;
      stethoscope.playS2();
    }
  });

  return null;
}
