import { useMemo, useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";

const HEART_MODEL_URL = "/anatomy/heart.glb";

// Preload model
useGLTF.preload(HEART_MODEL_URL);

// Anatomical landmarks specifically measured for the realistic heart model
export const REALISTIC_HEART_LANDMARKS = [
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
export function getHeartSubstructureFromPoint(x, y, z) {
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

export default function RealisticHeart({
  shadingMode = "realistic", // realistic, xray, wireframe
  showPins = true,
  isPumping = false,
  bpm = 72,
  onHoverPart = () => {},
  hoverPart = null,
  onSelectPart = () => {},
  selectedPart = null,
  scale = 0.58,
  offset = [0, 0, 0],
  translucent = false,
  emissiveIntensity = 0.15,
  highlightColor = "#5eead4",
}) {
  const { scene: source } = useGLTF(HEART_MODEL_URL);
  const heartGroupRef = useRef(null);
  const meshRef = useRef(null);
  const materialsRef = useRef([]);

  // Clone scene and set up materials
  const clonedScene = useMemo(() => {
    const clone = source.clone(true);
    const mats = [];

    clone.traverse((child) => {
      if (child.isMesh) {
        meshRef.current = child;
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

    materialsRef.current = mats;
    return clone;
  }, [source]);

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
      } else if (shadingMode === "xray" || translucent) {
        mat.wireframe = false;
        mat.transparent = true;
        mat.opacity = translucent ? 0.38 : 0.45;
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
  }, [shadingMode, translucent, hoverPart, highlightColor, emissiveIntensity]);

  // Pumping heartbeat animation
  useFrame((state) => {
    if (!isPumping || !heartGroupRef.current) return;

    const cycleDuration = 60 / Math.max(bpm, 30);
    const cycleTime = (state.clock.elapsedTime % cycleDuration) / cycleDuration;

    // Physiological cardiac cycle wringing motion:
    // Ventricular systole occurs between t = 0.15 and 0.45
    let ventricularContraction = 0;
    if (cycleTime >= 0.12 && cycleTime <= 0.42) {
      const progress = (cycleTime - 0.12) / 0.30;
      ventricularContraction = Math.sin(progress * Math.PI);
    }

    // Atrial systole occurs between t = 0.00 and 0.12
    let atrialContraction = 0;
    if (cycleTime < 0.12) {
      const progress = cycleTime / 0.12;
      atrialContraction = Math.sin(progress * Math.PI) * 0.05;
    }

    // Ventricular squeeze: inward compression along X and Z, slight shortening on Y
    const squeezeX = 1 - ventricularContraction * 0.12 + atrialContraction;
    const squeezeY = 1 - ventricularContraction * 0.04;
    const squeezeZ = 1 - ventricularContraction * 0.11 + atrialContraction;
    const torsion = ventricularContraction * 0.035; // Natural apical twist

    heartGroupRef.current.scale.set(
      scale * squeezeX,
      scale * squeezeY,
      scale * squeezeZ
    );
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
            const substruct = getHeartSubstructureFromPoint(
              e.point.x,
              e.point.y,
              e.point.z
            );
            onSelectPart(substruct.region || "heart");
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
            const substruct = getHeartSubstructureFromPoint(
              e.point.x,
              e.point.y,
              e.point.z
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
