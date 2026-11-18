import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { sampleCycle } from "../data/heartdata";

const HEART_MODEL_URL = "/anatomy/heart.glb";

// Preload model
useGLTF.preload(HEART_MODEL_URL);

// Anatomical landmarks specifically measured for the realistic heart model
const REALISTIC_HEART_LANDMARKS = [
  {
    name: "Ascending Aorta & Arch",
    position: [0.08, 0.72, -0.05],
    role: "Largest systemic artery; ejects oxygenated blood to the body under high pressure (~120 mmHg)",
    region: "aorta",
    system: "Cardiovascular",
    color: "#ff2a3c",
  },
  {
    name: "Superior Vena Cava",
    position: [-0.44, 0.62, -0.16],
    role: "Large venous trunk returning deoxygenated blood from the head, neck, and upper limbs",
    region: "svc",
    system: "Cardiovascular",
    color: "#2f7bff",
  },
  {
    name: "Pulmonary Trunk",
    position: [0.04, 0.44, 0.32],
    role: "Emerges from right ventricle, bifurcating into left and right pulmonary arteries to lungs",
    region: "pulmonary_trunk",
    system: "Cardiovascular",
    color: "#38bdf8",
  },
  {
    name: "Left Anterior Descending (LAD) Artery",
    position: [0.04, -0.12, 0.46],
    role: "Major coronary artery traversing anterior interventricular sulcus (clinically 'the widowmaker')",
    region: "lad",
    system: "Cardiovascular",
    color: "#fb7185",
  },
  {
    name: "Right Atrium",
    position: [-0.46, 0.12, 0.16],
    role: "Thin-walled chamber receiving venous blood from superior/inferior vena cava and coronary sinus",
    region: "right_atrium",
    system: "Cardiovascular",
    color: "#3b82f6",
  },
  {
    name: "Right Ventricle",
    position: [-0.22, -0.28, 0.34],
    role: "Muscular pump propelling deoxygenated blood into the low-resistance pulmonary circuit",
    region: "right_ventricle",
    system: "Cardiovascular",
    color: "#2563eb",
  },
  {
    name: "Left Ventricle",
    position: [0.36, -0.32, 0.18],
    role: "Thick muscular myocardium generating high pressure to perfuse the entire systemic circulation",
    region: "left_ventricle",
    system: "Cardiovascular",
    color: "#dc2626",
  },
  {
    name: "Apex of the Heart",
    position: [0.22, -0.82, 0.12],
    role: "Inferolateral tip of the heart formed by the left ventricle; site of apical impulse (PMI)",
    region: "apex",
    system: "Cardiovascular",
    color: "#b91c1c",
  },
];

// Helper to determine anatomical region based on 3D hit point on the normalized heart
function getHeartSubstructureFromPoint(x, y, z) {
  // Coordinates are relative to normalized heart centered at [0, 0, 0]
  if (y > 0.55 && x > -0.2 && x < 0.28 && z < 0.15) {
    return REALISTIC_HEART_LANDMARKS[0]; // Ascending Aorta & Arch
  }
  if (y > 0.45 && x <= -0.25) {
    return REALISTIC_HEART_LANDMARKS[1]; // Superior Vena Cava
  }
  if (y > 0.25 && z > 0.22 && x > -0.15 && x < 0.22) {
    return REALISTIC_HEART_LANDMARKS[2]; // Pulmonary Trunk
  }
  if (y < -0.7) {
    return REALISTIC_HEART_LANDMARKS[7]; // Apex
  }
  if (z > 0.32 && Math.abs(x - 0.05) < 0.15 && y < 0.1 && y > -0.55) {
    return REALISTIC_HEART_LANDMARKS[3]; // LAD
  }
  if (x > 0.15 && y < 0.1) {
    return REALISTIC_HEART_LANDMARKS[6]; // Left Ventricle
  }
  if (x <= 0.15 && y < 0.0 && z > 0.1) {
    return REALISTIC_HEART_LANDMARKS[5]; // Right Ventricle
  }
  if (x < -0.2 && y >= -0.1) {
    return REALISTIC_HEART_LANDMARKS[4]; // Right Atrium
  }
  return {
    name: "Myocardium (Cardiac Muscle)",
    role: "Involuntary striated cardiac muscle cells connected by intercalated discs",
    system: "Cardiovascular",
    color: "#e11d48",
  };
}

const INTERNAL_CHAMBERS = [
  { id: "right_atrium", name: "Right atrium", position: [-0.31, 0.18, 0.17], scale: [0.22, 0.18, 0.14], color: "#3478db", active: "atrial" },
  { id: "right_ventricle", name: "Right ventricle", position: [-0.2, -0.19, 0.2], scale: [0.23, 0.32, 0.13], color: "#2563a9", active: "ventricular" },
  { id: "left_atrium", name: "Left atrium", position: [0.22, 0.2, 0.12], scale: [0.2, 0.17, 0.12], color: "#bd4558", active: "atrial" },
  { id: "left_ventricle", name: "Left ventricle", position: [0.19, -0.18, 0.13], scale: [0.2, 0.35, 0.14], color: "#b93246", active: "ventricular" },
];

const INTERNAL_VALVES = [
  { id: "tricuspid_valve", name: "Tricuspid valve", position: [-0.24, -0.02, 0.29], state: "tricuspid" },
  { id: "pulmonary_valve", name: "Pulmonary valve", position: [-0.08, 0.1, 0.28], state: "pulmonary" },
  { id: "mitral_valve", name: "Mitral valve", position: [0.15, -0.01, 0.24], state: "mitral" },
  { id: "aortic_valve", name: "Aortic valve", position: [0.05, 0.15, 0.2], state: "aortic" },
];

function CutawayChamber({ chamber, cycle, selectedPart, showLabels, onSelectPart }) {
  const chamberRef = useRef(null);
  const selected = selectedPart === chamber.id;

  useFrame((_, delta) => {
    if (!chamberRef.current) return;
    const contraction = cycle?.[chamber.active] || 0;
    const targetY = 1 - contraction * (chamber.active === "ventricular" ? 0.12 : 0.07);
    chamberRef.current.scale.y = THREE.MathUtils.damp(chamberRef.current.scale.y, targetY, 12, delta);
  });

  return (
    <group
      position={chamber.position}
      scale={chamber.scale}
      onClick={(event) => { event.stopPropagation(); onSelectPart(chamber.id); }}
      onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      <group ref={chamberRef}>
      <mesh>
        <sphereGeometry args={[1, 24, 18]} />
        <meshStandardMaterial color={selected ? "#5eead4" : chamber.color} roughness={0.55} transparent opacity={0.82} />
      </mesh>
      <mesh scale={[0.69, 0.76, 0.7]} position={[0, -0.015, 0.13]}>
        <sphereGeometry args={[1, 20, 16]} />
        <meshStandardMaterial color="#101827" roughness={0.3} />
      </mesh>
      {showLabels && (
        <Html center distanceFactor={7} style={{ pointerEvents: "none" }}>
          <span className="heart-cutaway-label">{chamber.name}</span>
        </Html>
      )}
      </group>
    </group>
  );
}

function CutawayValve({ valve, cycle, selectedPart, showLabels, onSelectPart }) {
  const flapsRef = useRef(null);
  const open = Boolean(cycle?.valves?.[valve.state]);
  const selected = selectedPart === valve.id;

  useFrame((_, delta) => {
    if (!flapsRef.current) return;
    const target = open ? 0.4 : -0.12;
    flapsRef.current.rotation.z = THREE.MathUtils.damp(flapsRef.current.rotation.z, target, 12, delta);
  });

  return (
    <group
      position={valve.position}
      onClick={(event) => { event.stopPropagation(); onSelectPart(valve.id); }}
      onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.075, 0.009, 8, 24]} />
        <meshStandardMaterial color={selected ? "#5eead4" : open ? "#f4ead8" : "#c5a878"} />
      </mesh>
      <group ref={flapsRef}>
        {[0, 1, 2].map((leaflet) => (
          <mesh key={leaflet} position={[Math.cos((leaflet / 3) * Math.PI * 2) * 0.034, 0, Math.sin((leaflet / 3) * Math.PI * 2) * 0.034]} rotation={[0, (leaflet / 3) * Math.PI * 2, 0]}>
            <boxGeometry args={[0.055, 0.008, 0.035]} />
            <meshStandardMaterial color={selected ? "#5eead4" : "#e9ddc9"} />
          </mesh>
        ))}
      </group>
      {showLabels && (
        <Html center distanceFactor={7} style={{ pointerEvents: "none" }}>
          <span className="heart-cutaway-label">{valve.name} · {open ? "open" : "closed"}</span>
        </Html>
      )}
    </group>
  );
}

function HeartCutaway({ visible, cycle, selectedPart, showLabels, onSelectPart }) {
  if (!visible) return null;
  return (
    <group>
      {INTERNAL_CHAMBERS.map((chamber) => (
        <CutawayChamber
          key={chamber.id}
          chamber={chamber}
          cycle={cycle}
          selectedPart={selectedPart}
          showLabels={showLabels}
          onSelectPart={onSelectPart}
        />
      ))}
      {INTERNAL_VALVES.map((valve) => (
        <CutawayValve
          key={valve.id}
          valve={valve}
          cycle={cycle}
          selectedPart={selectedPart}
          showLabels={showLabels}
          onSelectPart={onSelectPart}
        />
      ))}
    </group>
  );
}

export default function RealisticHeart({
  shadingMode = "realistic", // realistic, xray, wireframe
  showPins = true,
  isPumping = false,
  bpm = 72,
  animationSpeed = 1,
  onHoverPart = () => {},
  hoverPart = null,
  onSelectPart = () => {},
  selectedPart = null,
  scale = 0.58,
  offset = [0, 0, 0],
  translucent = false,
  cutaway = false,
  cycle = null,
  labels = false,
  emissiveIntensity = 0.15,
  highlightColor = "#5eead4",
}) {
  const { scene: source } = useGLTF(HEART_MODEL_URL);
  const heartGroupRef = useRef(null);
  const materialsRef = useRef([]);
  const animationTimeRef = useRef(0);

  // Clone scene and set up materials
  const clonedScene = useMemo(() => {
    const clone = source.clone(true);
    const mats = [];

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const origMats = Array.isArray(child.material)
          ? child.material
          : [child.material];

        const clonedMats = origMats.map((mat) => {
          const m = mat.clone();
          mats.push(m);
          return m;
        });

        child.material = Array.isArray(child.material) ? clonedMats : clonedMats[0];
      }
    });

    clone.userData.heartMaterials = mats;
    return clone;
  }, [source]);

  useEffect(() => {
    materialsRef.current = clonedScene.userData.heartMaterials || [];
    return () => materialsRef.current.forEach((material) => material?.dispose?.());
  }, [clonedScene]);

  // Adjust material appearance based on shading mode & translucent flag
  useEffect(() => {
    materialsRef.current.forEach((mat) => {
      if (!mat) return;

      if (shadingMode === "wireframe") {
        mat.wireframe = true;
        mat.transparent = false;
        mat.opacity = 1;
        mat.roughness = 0.5;
        mat.metalness = 0.1;
      } else if (shadingMode === "xray" || translucent || cutaway) {
        mat.wireframe = false;
        mat.transparent = true;
        mat.opacity = translucent ? 0.38 : cutaway ? 0.1 : 0.45;
        mat.depthWrite = false;
        mat.roughness = 0.2;
        mat.metalness = 0.3;
        mat.emissive = new THREE.Color("#e11d48");
        mat.emissiveIntensity = 0.25;
      } else {
        // Photorealistic PBR
        mat.wireframe = false;
        mat.transparent = false;
        mat.opacity = 1;
        mat.depthWrite = true;
        mat.roughness = 0.35;
        mat.metalness = 0.05;
        mat.emissive = new THREE.Color(hoverPart ? highlightColor : "#1f050b");
        mat.emissiveIntensity = hoverPart ? 0.28 : emissiveIntensity;
      }
      mat.needsUpdate = true;
    });
  }, [clonedScene, shadingMode, translucent, cutaway, hoverPart, highlightColor, emissiveIntensity]);

  // Pumping heartbeat animation
  useFrame((_, delta) => {
    if (!heartGroupRef.current) return;
    if (!cycle && isPumping) animationTimeRef.current += delta * animationSpeed;
    const internalCycle = cycle || sampleCycle(animationTimeRef.current, bpm);
    const ventricularContraction = isPumping ? internalCycle?.ventricular || 0 : 0;
    const atrialContraction = isPumping ? internalCycle?.atrial || 0 : 0;
    const squeezeX = 1 - ventricularContraction * 0.06 + atrialContraction * 0.025;
    const squeezeY = 1 - ventricularContraction * 0.035;
    const squeezeZ = 1 - ventricularContraction * 0.07 + atrialContraction * 0.025;
    const torsion = ventricularContraction * 0.025;
    heartGroupRef.current.scale.set(scale * squeezeX, scale * squeezeY, scale * squeezeZ);
    heartGroupRef.current.rotation.y = torsion;
  });

  return (
    <group position={offset}>
      <group
        ref={heartGroupRef}
        scale={[scale, scale, scale]}
        position={[0.04, -0.01, -0.04]}
      >
        <primitive
          object={clonedScene}
          onClick={(e) => {
            e.stopPropagation();
            const localPoint = heartGroupRef.current.worldToLocal(e.point.clone());
            const substruct = getHeartSubstructureFromPoint(
              localPoint.x,
              localPoint.y,
              localPoint.z
            );
            onSelectPart(substruct.region || "heart");
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
            const localPoint = heartGroupRef.current.worldToLocal(e.point.clone());
            const substruct = getHeartSubstructureFromPoint(
              localPoint.x,
              localPoint.y,
              localPoint.z
            );
            onHoverPart({
              name: substruct.region || "heart",
              label: substruct.name,
              system: substruct.system || "Cardiovascular",
              color: substruct.color || "#e11d48",
              role: substruct.role,
              point: [e.point.x, e.point.y, e.point.z],
            });
          }}
          onPointerOut={() => {
            document.body.style.cursor = "";
            onHoverPart(null);
          }}
        />
        <HeartCutaway
          visible={cutaway}
          cycle={cycle}
          selectedPart={selectedPart}
          showLabels={labels}
          onSelectPart={onSelectPart}
        />
      </group>


      {/* Interactive Landmark Pins */}
      {showPins &&
        REALISTIC_HEART_LANDMARKS.map((lm, idx) => (
          <group key={idx} position={lm.position}>
            <mesh>
              <sphereGeometry args={[0.035, 16, 16]} />
              <meshStandardMaterial
                color={lm.color || "#5eead4"}
                emissive={lm.color || "#5eead4"}
                emissiveIntensity={0.65}
              />
            </mesh>
            <Html center distanceFactor={6.5} style={{ pointerEvents: "none" }}>
              <div className="organ-landmark-pin">
                <span className="landmark-title">{lm.name}</span>
              </div>
            </Html>
          </group>
        ))}

      {/* Dynamic 3D Tooltip Hover Label on Cursor */}
      {hoverPart && hoverPart.point && (
        <Html
          position={hoverPart.point}
          center
          style={{ pointerEvents: "none", zIndex: 9999 }}
        >
          <div className="anatomy-3d-hover-tag animate-tag-in">
            <span
              className="hover-tag-dot"
              style={{ background: hoverPart.color || "#e11d48" }}
            />
            <div className="hover-tag-content">
              <span className="hover-tag-title">{hoverPart.label}</span>
              <span className="hover-tag-hint">
                {hoverPart.role ? hoverPart.role.slice(0, 48) + "…" : "Cardiovascular"}
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
