import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { WBCModel } from "./WBCCell3D";

function Bacterium({ position = [0, 0, 0], color = "#df806d", scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh rotation={[0.2, 0.1, -0.35]}><capsuleGeometry args={[0.15, 0.4, 5, 12]} /><meshPhysicalMaterial color={color} roughness={0.35} /></mesh>
      {[-1, 1].map(side => <mesh key={side} position={[side * 0.22, 0.03, 0]} rotation={[0, 0, side * 0.4]}><coneGeometry args={[0.07, 0.16, 8]} /><meshStandardMaterial color="#f2b49a" /></mesh>)}
    </group>
  );
}

function Antibody({ position, active }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI]} scale={active ? 0.8 : 0.58}>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.035, 0.035, 0.36, 8]} /><meshStandardMaterial color="#f4cb6c" emissive="#9c7a33" emissiveIntensity={0.2} /></mesh>
      {[-1, 1].map(side => <mesh key={side} position={[side * 0.12, 0.38, 0]} rotation={[0, 0, side * -0.68]}><cylinderGeometry args={[0.035, 0.035, 0.31, 8]} /><meshStandardMaterial color="#f4cb6c" /></mesh>)}
    </group>
  );
}

function ProcessScene({ type, stage, progress, playing }) {
  const cell = useRef(null);
  const target = useRef(null);
  const histamine = useRef(null);
  const parasite = useRef(null);
  const debris = useRef(null);
  const antibodyRefs = useRef([]);
  const phagosome = useRef(null);
  const lysosome = useRef(null);
  const pseudopods = useRef(null);

  useFrame(() => {
    const t = THREE.MathUtils.smoothstep(progress, 0, 1);
    if (cell.current) {
      if (type === "monocyte") {
        const x = stage === 0 ? THREE.MathUtils.lerp(-1.9, -0.5, t) : stage === 1 ? THREE.MathUtils.lerp(-0.5, 0.15, t) : 0.15;
        const y = stage === 0 ? 0.08 : stage === 1 ? THREE.MathUtils.lerp(0.08, -0.65, t) : -0.65;
        const macrophage = stage >= 2 ? THREE.MathUtils.lerp(0.43, 0.55, t) : 0.43;
        const squeeze = stage === 1 ? Math.sin(t * Math.PI) * 0.14 : 0;
        cell.current.position.set(x, y, 0);
        cell.current.scale.set(macrophage, macrophage - squeeze, macrophage);
      } else if (type === "neutrophil") {
        const positions = [
          [-1.8, 0.08],
          [THREE.MathUtils.lerp(-1.8, -0.4, t), 0.02],
          [-0.4, 0.02],
          [-0.4, THREE.MathUtils.lerp(0.02, -0.88, t)],
          [THREE.MathUtils.lerp(-0.4, 0.65, t), -0.94],
          [0.65, -0.94]
        ];
        cell.current.position.set(positions[stage][0], positions[stage][1], 0);
        const squash = stage === 3 ? Math.sin(t * Math.PI) * 0.17 : 0;
        cell.current.scale.set(0.43 + squash, 0.43 - squash, 0.43);
      } else if (type === "eosinophil") {
        cell.current.position.set(stage === 0 ? THREE.MathUtils.lerp(-1.15, 0.25, t) : 0.25, 0, 0);
        cell.current.rotation.z = stage === 1 ? t * 0.12 : 0;
      } else if (type === "basophil") {
        cell.current.position.set(-1.55, 0.05, 0);
        cell.current.scale.setScalar(0.43 + (stage === 0 ? Math.sin(t * Math.PI) * 0.025 : stage === 1 ? t * 0.025 : 0));
      } else {
        cell.current.position.set(stage === 4 ? -2.5 : -1.55, stage === 4 ? 0.95 : 0, 0);
        cell.current.scale.setScalar(stage === 4 ? 0.27 : stage === 2 ? 0.43 + t * 0.12 : stage === 3 ? 0.55 : stage === 1 ? 0.43 + Math.sin(t * Math.PI) * 0.04 : 0.43);
      }
    }

    if (target.current) {
      if (type === "neutrophil") {
        const x = stage > 4 ? THREE.MathUtils.lerp(1.15, 0.75, t) : stage === 4 ? THREE.MathUtils.lerp(2.2, 1.15, t) : 2.2;
        target.current.position.set(x, -1.2, 0);
        target.current.scale.setScalar(stage === 5 ? 1 - THREE.MathUtils.smoothstep(t, 0.7, 1) * 0.98 : 1);
        if (phagosome.current) {
          phagosome.current.visible = stage === 5 && t > 0.42;
          phagosome.current.position.set(x, -1.2, 0.1);
          phagosome.current.scale.setScalar(0.18 + THREE.MathUtils.smoothstep(t, 0.2, 0.68) * 0.32);
        }
        if (lysosome.current) {
          const fusion = THREE.MathUtils.smoothstep(t, 0.62, 0.9);
          lysosome.current.visible = stage === 5 && t > 0.62;
          lysosome.current.position.set(0.65 - 0.7 + fusion * 0.18, -1.2, 0.28);
        }
        if (pseudopods.current) {
          const extend = THREE.MathUtils.smoothstep(t, 0.12, 0.4);
          const close = THREE.MathUtils.smoothstep(t, 0.68, 0.9);
          pseudopods.current.visible = stage === 5 && t > 0.12 && t < 0.97;
          pseudopods.current.position.set(0.65, -0.94, 0.38);
          pseudopods.current.scale.setScalar(0.43 * extend * (1 - close * 0.72));
        }
      } else if (type === "lymphocyte") {
        target.current.position.set(-1.55, stage === 0 ? THREE.MathUtils.lerp(1.95, 1.14, t) : 1.14, 0);
      } else if (type === "monocyte") {
        target.current.position.set(stage >= 3 ? THREE.MathUtils.lerp(2.25, 0.3, t) : 2.25, -0.8, 0);
        target.current.scale.setScalar(stage === 3 ? 1 - t * 0.55 : 1);
      } else if (type === "eosinophil") {
        target.current.position.set(1.6, 0, 0);
        target.current.rotation.z = stage >= 2 ? Math.sin(t * Math.PI) * 0.22 : 0;
        target.current.scale.setScalar(stage === 3 ? 1 - t * 0.32 : 1);
      } else {
        target.current.position.set(1.6, 0.1, 0);
      }
    }

    if (type === "basophil" && histamine.current) {
      histamine.current.children.forEach((particle, index) => {
        const release = stage >= 2 ? t : 0;
        const mobilize = stage === 1 ? t : stage >= 2 ? 1 : 0;
        particle.visible = stage >= 1 && mobilize > (index % 5) * 0.12;
        particle.position.set(-1.55 + (index % 5 - 2) * 0.1 + mobilize * 0.68 + release * 0.85, 0.05 + (index % 7 - 3) * 0.1 - release * 0.7 + Math.sin(release * Math.PI * 2 + index) * 0.06, (index % 3 - 1) * 0.2);
      });
    }
    if (type === "eosinophil" && parasite.current) {
      parasite.current.children.forEach((particle, index) => {
        const release = stage >= 2 ? t : 0;
        particle.visible = stage >= 2 && release > (index % 6) * 0.1;
        particle.position.set(-0.52 + release * 1.7, -0.66 + (index % 6) * 0.25 + Math.sin(release * 5 + index) * 0.08, (index % 3 - 1) * 0.16);
      });
    }
    if (type === "lymphocyte") {
      antibodyRefs.current.forEach((item, index) => {
        if (!item) return;
        const amount = stage === 2 ? t : stage === 3 ? 1 : 0;
        item.visible = stage >= 2 && amount > (index % 4) * 0.15;
        item.position.x = -1.7 + (index % 3) * 0.15;
        item.position.y = -0.15 + (index % 5) * 0.12 + amount * 1.05;
      });
    }
    if (type === "monocyte" && debris.current) {
      debris.current.children.forEach((item, index) => {
        if (stage >= 3) {
          const amount = t;
          item.position.x = 0.45 - amount * 0.4 + (index % 3) * 0.08;
          item.material.opacity = 1 - amount * 0.62;
        } else item.material.opacity = 1;
      });
    }
    void playing;
  });

  const selectedStructure = type === "eosinophil" || type === "basophil" ? "granules" : type === "neutrophil" ? "membrane" : type === "lymphocyte" ? "antigenReceptors" : null;

  return (
    <>
      <hemisphereLight args={["#dff3ff", "#2c3046", 1.2]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[-3, 4, 6]} intensity={1.9} color="#fff1df" />
      <pointLight position={[2, 0, 2]} intensity={7} distance={7} color={type === "eosinophil" ? "#f59b50" : type === "basophil" ? "#d47ac3" : "#62d8d0"} />

      {(type === "monocyte" || type === "neutrophil") && <>
        <mesh position={[0, 0.68, -0.8]}><boxGeometry args={[8.8, 0.12, 0.65]} /><meshPhysicalMaterial color="#a55e73" transparent opacity={0.7} /></mesh>
        <mesh position={[0, -0.42, -0.8]}><boxGeometry args={[8.8, 0.12, 0.65]} /><meshPhysicalMaterial color="#a55e73" transparent opacity={0.7} /></mesh>
        {Array.from({ length: 6 }, (_, index) => <mesh key={index} position={[-3.5 + index * 1.4, -0.32, 0.02]} scale={[0.48, 0.13, 0.36]}><sphereGeometry args={[1, 18, 12]} /><meshStandardMaterial color="#9a5c71" /></mesh>)}
      </>}
      {type === "basophil" && <>
        <mesh position={[0.7, -1.44, -0.9]}><boxGeometry args={[8.5, 0.26, 0.65]} /><meshPhysicalMaterial color="#9d596d" transparent opacity={stage >= 3 ? 0.52 : 0.86} /></mesh>
        <mesh position={[0.7, -1.27, -0.8]}><boxGeometry args={[8.5, 0.05, 0.65]} /><meshBasicMaterial color="#f06fa7" transparent opacity={stage >= 3 ? 0.45 : 0.15} /></mesh>
      </>}
      {type === "eosinophil" && <mesh position={[0, -1.6, -0.9]}><boxGeometry args={[8.5, 0.08, 0.5]} /><meshStandardMaterial color="#46555c" /></mesh>}

      {type === "lymphocyte" && stage === 4 && (
        <group position={[0, -1.4, -0.8]}>
          <mesh><sphereGeometry args={[0.74, 26, 20]} /><meshPhysicalMaterial color="#d06762" roughness={0.4} /></mesh>
          {Array.from({ length: 6 }, (_, index) => <mesh key={index} position={[Math.cos(index) * 0.7, Math.sin(index) * 0.6, 0.12]}><sphereGeometry args={[0.08, 10, 8]} /><meshBasicMaterial color="#f5bd72" /></mesh>)}
          <Html position={[0, -0.95, 0]} center distanceFactor={8}><span className="process-scene-label">INFECTED CELL</span></Html>
        </group>
      )}
      {type === "lymphocyte" && stage === 4 && <>
        <group position={[1.1, 1.15, -0.35]} scale={0.18}><WBCModel type="lymphocyte" selectedStructure="antigenReceptors" /></group>
        <Html position={[1.1, 0.72, 0]} center distanceFactor={8}><span className="process-scene-label">HELPER T CELL · COORDINATES</span></Html>
        <group position={[-0.78, -0.58, 0.4]} scale={0.18}><WBCModel type="lymphocyte" /></group>
        <Html position={[-0.78, -0.98, 0.4]} center distanceFactor={8}><span className="process-scene-label">CYTOTOXIC T CELL · KILLS INFECTED CELL</span></Html>
        <group position={[2.05, 1.32, -0.42]} scale={0.16}><WBCModel type="lymphocyte" /></group>
        <group position={[2.55, 1.12, -0.42]} scale={0.16}><WBCModel type="lymphocyte" /></group>
        <Html position={[2.3, 0.72, 0]} center distanceFactor={8}><span className="process-scene-label">MEMORY B &amp; T CELLS</span></Html>
      </>}
      {type === "lymphocyte" && stage !== 4 && <group ref={target}><Bacterium scale={0.8} color="#c79a5f" /></group>}
      {type === "lymphocyte" && stage !== 4 && <Html position={[-1.55, 1.87, 0]} center distanceFactor={8}><span className="process-scene-label">MATCHING ANTIGEN</span></Html>}
      {type === "neutrophil" && <group ref={target}><Bacterium /></group>}
      {type === "monocyte" && <group ref={target}>{Array.from({ length: 5 }, (_, index) => <mesh key={index} position={[index * 0.12, index * 0.12, 0]}><dodecahedronGeometry args={[0.21, 0]} /><meshStandardMaterial color="#a9c0a1" transparent /></mesh>)}</group>}
      {type === "eosinophil" && (
        <group ref={target}>
          <group ref={parasite}>{Array.from({ length: 20 }, (_, index) => <mesh key={index} position={[-0.52 + (index % 4) * 0.25, -0.66 + Math.floor(index / 4) * 0.25, (index % 3 - 1) * 0.16]}><sphereGeometry args={[0.065, 10, 8]} /><meshBasicMaterial color="#e29e54" /></mesh>)}</group>
          <mesh rotation={[0, 0, -0.18]}><capsuleGeometry args={[0.24, 1.05, 8, 14]} /><meshPhysicalMaterial color="#87947e" roughness={0.52} /></mesh>
          <mesh position={[0.05, 0.16, 0.21]}><torusGeometry args={[0.25, 0.045, 8, 20]} /><meshStandardMaterial color="#d2c99b" /></mesh>
        </group>
      )}
      {type === "eosinophil" && stage >= 1 && <group position={[0.77, 0, 0.34]}>
        {[-0.16, 0, 0.16].map(offset => <mesh key={offset} position={[0, offset, 0]} scale={[1, 0.6, 1]}><sphereGeometry args={[0.07, 10, 8]} /><meshBasicMaterial color="#f4db87" /></mesh>)}
      </group>}
      {type === "basophil" && <group ref={target} position={[1.6, 0.1, 0]}>
        <mesh><icosahedronGeometry args={[0.42, 1]} /><meshPhysicalMaterial color="#d8a477" roughness={0.4} /></mesh>
        {[-1, 1].map(side => <mesh key={side} position={[side * 0.3, 0.32, 0]} rotation={[0, 0, side * -0.6]}><cylinderGeometry args={[0.035, 0.035, 0.4, 7]} /><meshStandardMaterial color="#f4cb6c" /></mesh>)}
      </group>}

      <group ref={cell} position={type === "neutrophil" ? [-1.8, -1.2, 0] : type === "monocyte" ? [-1.9, 0.8, 0] : type === "eosinophil" ? [-1.15, 0, 0] : type === "basophil" ? [-1.55, 0.05, 0] : [-1.55, 0, 0]} scale={0.43}>
        <WBCModel type={type} selectedStructure={selectedStructure} interactive={false} />
        {type === "lymphocyte" && stage >= 2 && stage < 4 && <group position={[0, 0, 0.35]}>
          {[-0.08, 0.08, 0.24].map((y, index) => <mesh key={index} position={[0.86, y, 0]}>
            <tubeGeometry args={[new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.16, 0.08, 0.03), new THREE.Vector3(0.34, 0.04, 0), new THREE.Vector3(0.48, -0.03, -0.02)]), 20, 0.035, 8, false]} />
            <meshStandardMaterial color="#83d9d4" emissive="#236b73" emissiveIntensity={0.25} />
          </mesh>)}
        </group>}
      </group>
      {type === "lymphocyte" && stage >= 2 && stage < 4 && Array.from({ length: 10 }, (_, index) => (
        <group key={index} ref={element => antibodyRefs.current[index] = element} position={[0, -0.7, 0.2]}>
          <Antibody position={[0, 0, 0]} active={stage >= 3} />
        </group>
      ))}
      {type === "basophil" && <group ref={histamine}>
        {Array.from({ length: 25 }, (_, index) => <mesh key={index} position={[0, 0, 0]}><sphereGeometry args={[0.07, 10, 8]} /><meshBasicMaterial color="#d47ac3" transparent opacity={0.85} /></mesh>)}
      </group>}
      {type === "monocyte" && stage >= 3 && <group ref={debris}>
        {Array.from({ length: 7 }, (_, index) => <mesh key={index} position={[1.8, -0.8, 0]}><dodecahedronGeometry args={[0.13, 0]} /><meshBasicMaterial color="#d5bb88" transparent opacity={0.9} /></mesh>)}
      </group>}
      {type === "neutrophil" && <>
        <group ref={pseudopods} visible={false}>
          {[
            [[0.96, 0.64, 0], [1.38, 0.62, 0], [1.72, 0.43, 0], [1.86, 0.14, 0]],
            [[0.96, -0.64, 0], [1.38, -0.62, 0], [1.72, -0.43, 0], [1.86, -0.14, 0]]
          ].map((points, index) => <mesh key={index}>
            <tubeGeometry args={[new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point))), 28, 0.13, 10, false]} />
            <meshPhysicalMaterial color="#d9f1e8" transparent opacity={0.88} />
          </mesh>)}
        </group>
        <mesh ref={phagosome} position={[1.15, -1.2, 0.1]} visible={false}><sphereGeometry args={[1, 24, 18]} /><meshPhysicalMaterial color="#f2bf62" transparent opacity={0.23} wireframe /></mesh>
        <mesh ref={lysosome} position={[0, -1.2, 0.28]} visible={false}><sphereGeometry args={[0.12, 14, 12]} /><meshStandardMaterial color="#cf8ce1" emissive="#733b93" emissiveIntensity={0.5} /></mesh>
      </>}
      {type === "monocyte" && <Html position={[-2.4, 1.9, 0]} center distanceFactor={8}><span className="process-scene-label">{stage >= 2 ? "MACROPHAGE" : "MONOCYTE"}</span></Html>}
      {type !== "monocyte" && <Html position={[-2.4, 1.9, 0]} center distanceFactor={8}><span className="process-scene-label">{type === "lymphocyte" ? stage === 4 ? "LYMPHOCYTE ROLES" : stage >= 2 ? "PLASMA CELL · ANTIBODY FACTORY" : "B CELL" : type.toUpperCase()}</span></Html>}
    </>
  );
}

export default function WBCProcess3D({ type, stage, progress, playing, enabled = true }) {
  return (
    <Canvas className="wbc-process-canvas" frameloop={enabled ? "always" : "never"} camera={{ position: [0, 0, 7.6], fov: 39 }} dpr={[1, 1.45]} gl={{ antialias: true, powerPreference: "high-performance" }}>
      <ProcessScene type={type} stage={stage} progress={progress} playing={playing} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={5} maxDistance={10} enablePan={false} />
    </Canvas>
  );
}
