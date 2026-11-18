import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { WBCModel } from "./WBCCell3D";

const signalPositions = Array.from({ length: 56 }, (_, index) => {
  const layer = Math.floor(index / 14);
  const withinLayer = index % 14;
  const x = 3.25 - layer * 0.82 + (withinLayer % 4) * 0.2;
  const y = -2.08 + Math.floor(withinLayer / 4) * 0.29 + (withinLayer % 2) * 0.08;
  const z = (withinLayer % 3 - 1) * 0.36;
  return [x, y, z];
});

function Bacterium({ position = [0, 0, 0], scale = 1, opacity = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh rotation={[0.2, 0.1, -0.35]}>
        <capsuleGeometry args={[0.17, 0.43, 6, 12]} />
        <meshPhysicalMaterial color="#e67b68" roughness={0.35} transparent opacity={opacity} />
      </mesh>
      {[-1, 1].map(side => (
        <mesh key={side} position={[side * 0.25, 0.04, 0.02]} rotation={[0, 0, side * 0.4]}>
          <coneGeometry args={[0.09, 0.2, 8]} />
          <meshStandardMaterial color="#f3ad8d" transparent opacity={opacity} />
        </mesh>
      ))}
      <mesh position={[0, 0.1, 0.15]}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <meshBasicMaterial color="#fff0c7" transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function BloodCell({ phase, initial, active }) {
  const ref = useRef(null);
  useFrame(() => {
    if (!ref.current || !active) return;
    ref.current.position.x = ((initial + phase * 0.7 + 5.4) % 10.8) - 5.4;
    ref.current.rotation.y += 0.002;
  });
  return (
    <group ref={ref} position={[initial, 0.55, (initial % 3 - 1) * 0.25]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[0.43, 0.43, 0.2]}>
        <torusGeometry args={[0.55, 0.22, 12, 28]} />
        <meshStandardMaterial color="#9b4d58" roughness={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[0.34, 0.34, 0.2]}>
        <cylinderGeometry args={[0.32, 0.32, 0.03, 28]} />
        <meshStandardMaterial color="#cf7c79" roughness={0.48} />
      </mesh>
    </group>
  );
}

function EndothelialCell({ position, attached }) {
  return (
    <group position={position}>
      <mesh scale={[0.68, 0.16, 0.45]}>
        <sphereGeometry args={[1, 28, 20]} />
        <meshPhysicalMaterial color={attached ? "#c77483" : "#965b70"} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.18, 0]} scale={[0.18, 0.08, 0.12]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#542e53" />
      </mesh>
    </group>
  );
}

function JourneyScene({ stage, progress, playing, speed }) {
  const neutrophil = useRef(null);
  const bacterium = useRef(null);
  const bacteriaBody = useRef(null);
  const phagosome = useRef(null);
  const lysosome = useRef(null);
  const pseudopods = useRef(null);
  const progressEase = THREE.MathUtils.smoothstep;
  const endothelialX = useMemo(() => [-4.8, -3.6, -2.4, -1.2, -0.8, 1.8, 2.85, 4.05, 5.25], []);

  useFrame(() => {
      const cycle = stage + progress;
      const positions = [
        [-3.65, 0.05],
        [THREE.MathUtils.lerp(-3.65, 0.45, progressEase(progress, 0, 1)), 0.02],
        [0.45, 0.02],
        [0.45, THREE.MathUtils.lerp(0.02, -1.72, progressEase(progress, 0, 1))],
        [THREE.MathUtils.lerp(0.45, 2.28, progressEase(progress, 0, 1)), -1.82],
        [2.28, -1.82]
      ];
      const [x, y] = positions[stage] || positions[0];
      neutrophil.current.position.set(x, y, 0);
      if (stage === 1) neutrophil.current.rotation.z = progress * Math.PI * 2.4;
      else neutrophil.current.rotation.z = stage === 2 ? -0.2 : 0;

      const squeeze = stage === 3 ? Math.sin(progress * Math.PI) : 0;
      neutrophil.current.scale.set(0.43 + squeeze * 0.1, 0.43 - squeeze * 0.2, 0.43 + squeeze * 0.08);

      const bacteriaY = stage === 0 ? THREE.MathUtils.lerp(-0.7, -2.08, progressEase(progress, 0.2, 0.75)) : -2.08;
      bacterium.current.position.set(3.45, bacteriaY, 0.05);
      bacterium.current.rotation.z = Math.sin(cycle * 2) * 0.18;
      if (stage === 5) {
        const engulf = progressEase(progress, 0.2, 0.68);
        const bacteriaX = 2.28 + THREE.MathUtils.lerp(0.74, 0.05, engulf);
        const bacteriaY = -1.82 + THREE.MathUtils.lerp(0.05, 0.02, engulf);
        bacterium.current.position.set(bacteriaX, bacteriaY, 0.03);
        const digestion = progressEase(progress, 0.7, 0.99);
        if (bacteriaBody.current) bacteriaBody.current.scale.setScalar(1 - digestion * 0.98);
        if (phagosome.current) {
          phagosome.current.visible = progress > 0.42;
          phagosome.current.scale.setScalar(0.18 + engulf * 0.32);
          phagosome.current.position.set(bacteriaX, bacteriaY, 0.12);
        }
        if (lysosome.current) {
          const fusion = progressEase(progress, 0.62, 0.9);
          lysosome.current.visible = progress > 0.62;
          lysosome.current.position.set(1.43 + fusion * 0.28, -1.82, 0.32);
        }
        if (pseudopods.current) {
          const extend = progressEase(progress, 0.12, 0.4);
          const close = progressEase(progress, 0.68, 0.9);
          pseudopods.current.visible = progress > 0.12 && progress < 0.97;
          pseudopods.current.position.set(2.28, -1.82, 0.38);
          pseudopods.current.scale.setScalar(0.43 * extend * (1 - close * 0.72));
        }
      } else {
        if (bacteriaBody.current) bacteriaBody.current.scale.setScalar(1);
        if (phagosome.current) {
          phagosome.current.visible = false;
          phagosome.current.position.set(2.92, -1.8, 0.2);
        }
        if (lysosome.current) {
          lysosome.current.visible = false;
          lysosome.current.position.set(1.43, -1.82, 0.32);
        }
        if (pseudopods.current) pseudopods.current.visible = false;
      }
      void speed;
  });

  return (
    <>
      <hemisphereLight args={["#d6f2ff", "#342d49", 1.25]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[-3, 5, 7]} intensity={2.1} color="#fff1de" />
      <pointLight position={[3, -2, 1]} intensity={12} distance={8} color="#f26b62" />

      <mesh position={[0, 0.22, -1.45]} scale={[5.4, 1.68, 0.13]}>
        <sphereGeometry args={[1, 40, 28]} />
        <meshPhysicalMaterial color="#9a3d55" roughness={0.34} transparent opacity={0.14} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.23, -0.55]}>
        <boxGeometry args={[10.2, 0.18, 1.1]} />
        <meshPhysicalMaterial color="#9f536c" roughness={0.46} transparent opacity={0.78} />
      </mesh>
      <mesh position={[0, -0.88, -0.55]}>
        <boxGeometry args={[10.2, 0.18, 1.1]} />
        <meshPhysicalMaterial color="#a65b70" roughness={0.5} transparent opacity={0.8} />
      </mesh>
      {endothelialX.map(x => (
        <EndothelialCell key={x} position={[x, -0.71, 0.22]} attached={stage === 2 && Math.abs(x - 0.5) < 1.5} />
      ))}
      {Array.from({ length: 5 }, (_, index) => <BloodCell key={index} initial={-4.5 + index * 2.3} phase={stage + progress} active={playing} />)}

      <mesh position={[0, -2.45, -1.1]} scale={[5.4, 0.95, 0.14]}>
        <sphereGeometry args={[1, 42, 28]} />
        <meshPhysicalMaterial color="#3d665f" roughness={0.66} transparent opacity={0.62} />
      </mesh>
      {Array.from({ length: 7 }, (_, index) => (
        <mesh key={index} position={[-4.1 + index * 1.35, -2.4 + Math.sin(index * 2) * 0.24, -0.15]} rotation={[0, 0, index * 0.31]}>
          <capsuleGeometry args={[0.035, 0.62, 3, 6]} />
          <meshStandardMaterial color="#a8c19b" transparent opacity={0.3} />
        </mesh>
      ))}
      {[[2.5, -2.52, 0.25], [3.25, -2.65, -0.12], [4.05, -2.48, 0.24], [2.05, -2.83, -0.16]].map((position, index) => (
        <group key={index} position={position}>
          <mesh scale={index === 1 ? [0.42, 0.35, 0.32] : [0.34, 0.29, 0.25]}>
            <sphereGeometry args={[1, 20, 14]} />
            <meshStandardMaterial color={index === 1 ? "#8e5b5e" : "#668b7b"} roughness={0.65} />
          </mesh>
          <mesh position={[0.03, 0.025, 0.23]} scale={[0.12, 0.09, 0.06]}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshStandardMaterial color={index === 1 ? "#632f50" : "#405c5b"} />
          </mesh>
        </group>
      ))}
      <mesh position={[3.33, -2.16, -0.52]}>
        <sphereGeometry args={[1.2, 32, 24]} />
        <meshBasicMaterial color="#ed675b" transparent opacity={0.12} />
      </mesh>
      {signalPositions.map((position, index) => (
        <mesh key={index} position={position} scale={1 + (playing ? Math.sin((stage + progress + index) * 3) * 0.12 : 0)}>
          <sphereGeometry args={[index % 3 === 0 ? 0.045 : 0.029, 8, 8]} />
          <meshBasicMaterial color="#62ecdb" transparent opacity={stage === 0 ? 0.18 + progress * 0.5 : 0.68} />
        </mesh>
      ))}
      {stage === 4 && <group position={[1.45, -2.56, 0.38]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh position={[0, 0.48, 0]}><cylinderGeometry args={[0.024, 0.024, 0.95, 8]} /><meshBasicMaterial color="#6ef1e1" /></mesh>
        <mesh position={[0, 1.04, 0]}><coneGeometry args={[0.11, 0.28, 10]} /><meshBasicMaterial color="#6ef1e1" /></mesh>
        <Html position={[0, 1.42, 0]} center distanceFactor={9}><span className="journey-scene-label">DIRECTION OF CHEMOTAXIS</span></Html>
      </group>}

      <group ref={neutrophil} position={[-3.65, 0.05, 0.38]} scale={0.43}>
        <WBCModel type="neutrophil" selectedStructure={stage === 3 ? "membrane" : stage === 5 ? "granules" : null} interactive={false} />
      </group>
      <group ref={bacterium} position={[3.45, -2.08, 0.05]}>
        <group ref={bacteriaBody}><Bacterium /></group>
      </group>
      <group ref={pseudopods} visible={false}>
        {[
          [[0.96, 0.64, 0], [1.38, 0.62, 0], [1.72, 0.43, 0], [1.86, 0.14, 0]],
          [[0.96, -0.64, 0], [1.38, -0.62, 0], [1.72, -0.43, 0], [1.86, -0.14, 0]]
        ].map((points, index) => <mesh key={index}>
          <tubeGeometry args={[new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point))), 32, 0.13, 10, false]} />
          <meshPhysicalMaterial color="#d9f1e8" roughness={0.28} transparent opacity={0.88} side={THREE.DoubleSide} />
        </mesh>)}
      </group>
      <mesh ref={phagosome} position={[2.92, -1.8, 0.2]} visible={false}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshPhysicalMaterial color="#f2bf62" roughness={0.28} transparent opacity={0.23} wireframe />
      </mesh>
      <mesh ref={lysosome} position={[1.43, -1.82, 0.32]} visible={false}>
        <sphereGeometry args={[0.12, 14, 12]} />
        <meshStandardMaterial color="#cf8ce1" emissive="#733b93" emissiveIntensity={0.5} />
      </mesh>
      {stage === 2 && (
        <group position={[0.45, -0.5, 0.45]}>
          {[-0.3, 0, 0.3].map(x => <mesh key={x} position={[x, -0.17, 0]}><cylinderGeometry args={[0.025, 0.025, 0.3, 7]} /><meshBasicMaterial color="#f2cf69" /></mesh>)}
          <Html position={[0, 0.18, 0]} center distanceFactor={9}><span className="journey-scene-label">INTEGRINS GRIP</span></Html>
        </group>
      )}
      <Html position={[-3.6, 1.55, 0]} center distanceFactor={9}><span className="journey-scene-label">BLOOD VESSEL</span></Html>
      <Html position={[-2.1, -1.35, 0]} center distanceFactor={9}><span className="journey-scene-label">ENDOTHELIUM</span></Html>
      <Html position={[3.2, -3.08, 0]} center distanceFactor={9}><span className="journey-scene-label">INFECTED TISSUE</span></Html>
      <Html position={[3.5, -1.55, 0]} center distanceFactor={9}><span className="journey-scene-label">CHEMICAL SIGNALS</span></Html>
    </>
  );
}

export default function WBCJourney3D({ stage, progress, playing, speed, enabled = true }) {
  return (
    <Canvas className="wbc-journey-canvas" frameloop={enabled ? "always" : "never"} camera={{ position: [0, 0.15, 10.2], fov: 39 }} dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }}>
      <JourneyScene stage={stage} progress={progress} playing={playing} speed={speed} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={7} maxDistance={14} enablePan={false} />
    </Canvas>
  );
}
