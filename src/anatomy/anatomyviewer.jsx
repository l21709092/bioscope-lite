import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { ANATOMY_BY_KEY } from "./anatomydata";
import { useAnatomy } from "./anatomystate";

const MODEL_URLS = {
  male: "/anatomy/anatomy-male.glb",
  female: "/anatomy/anatomy-female.glb",
};

function modelOpacity(structure, system, query, selected, hovered) {
  if (!structure) return 0;
  const match = !query || structure.label.toLowerCase().includes(query);
  if (system !== "all" && structure.system !== system && !selected) return 0.015;
  if (query && !match && !selected) return 0.08;
  if (selected || hovered) return 1;
  if (system === "all") {
    if (structure.system === "skin") return 0.13;
    if (structure.system === "muscles") return 0.34;
    if (structure.system === "skeleton") return 0.48;
  }
  return 0.94;
}

function AnatomyModel({ setHoverPointInfo, onReady }) {
  const { sex, system, query, selectedId, hoverId, spread, onSelect, onHover } = useAnatomy();
  const { scene: source } = useGLTF(MODEL_URLS[sex], false, true);
  const model = useMemo(() => source.clone(true), [source]);
  const meshes = useRef([]);

  useEffect(() => {
    const records = [];
    model.traverse((object) => {
      if (!object.isMesh || !ANATOMY_BY_KEY[object.name]) return;
      const center = new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
      const direction = new THREE.Vector3(
        center.x,
        (center.y - 1.05) * 0.22,
        center.z + 0.12
      ).normalize().multiplyScalar(0.8);
      const materials = (Array.isArray(object.material) ? object.material : [object.material])
        .filter(Boolean)
        .map((material) => material.clone());
      object.material = Array.isArray(object.material) ? materials : materials[0];
      records.push({ object, origin: object.position.clone(), direction, materials });
    });
    meshes.current = records;
    return () => records.forEach(({ materials }) => materials.forEach((material) => material.dispose()));
  }, [model]);

  useEffect(() => { onReady?.(); }, [model, onReady]);

  useEffect(() => {
    meshes.current.forEach(({ object, origin, direction, materials }) => {
      const structure = ANATOMY_BY_KEY[object.name];
      const selected = selectedId === object.name;
      const hovered = hoverId === object.name;
      const opacity = modelOpacity(structure, system, query, selected, hovered);
      object.position.copy(origin).addScaledVector(direction, spread);
      object.renderOrder = selected ? 3 : 1;
      materials.forEach((material) => {
        material.transparent = opacity < 0.995;
        material.opacity = opacity;
        material.depthWrite = opacity > 0.52;
        material.emissive?.set(structure.color);
        material.emissiveIntensity = selected ? 0.35 : hovered ? 0.25 : 0;
        material.needsUpdate = true;
      });
    });
  }, [system, query, selectedId, hoverId, spread, model]);

  return (
    <group>
      <primitive
        object={model}
        onClick={(event) => {
          const key = event.object.name;
          if (ANATOMY_BY_KEY[key]) {
            event.stopPropagation();
            onSelect(key);
          }
        }}
        onPointerMove={(event) => {
          const key = event.object.name;
          const structure = ANATOMY_BY_KEY[key];
          if (structure) {
            event.stopPropagation();
            onHover(key);
            document.body.style.cursor = "pointer";
            setHoverPointInfo({
              name: key,
              label: structure.label,
              system: structure.system,
              color: structure.color,
              point: [event.point.x, event.point.y, event.point.z],
              screenPosition: (() => {
                const bounds = event.nativeEvent.currentTarget?.getBoundingClientRect?.();
                return bounds
                  ? { x: event.nativeEvent.clientX - bounds.left, y: event.nativeEvent.clientY - bounds.top }
                  : null;
              })(),
            });
          } else {
            setHoverPointInfo(null);
          }
        }}
        onPointerOut={() => {
          onHover(null);
          setHoverPointInfo(null);
          document.body.style.cursor = "";
        }}
      />

    </group>
  );
}

function CameraRig() {
  const controls = useRef(null);
  const { camera } = useThree();
  const { viewKey } = useAnatomy();
  useEffect(() => {
    if (controls.current) {
      controls.current.target.set(0, 1.05, 0);
      camera.position.set(1.85, 1.32, 3.15);
      controls.current.update();
    }
  }, [viewKey, camera]);
  useFrame(() => controls.current?.update());
  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={1.05}
      maxDistance={6.5}
      maxPolarAngle={Math.PI * 0.92}
    />
  );
}

function Scene({ setHoverPointInfo, onReady }) {
  return (
    <>
      <color attach="background" args={["#07111f"]} />
      <fog attach="fog" args={["#07111f", 4, 9]} />
      <hemisphereLight args={["#d9f5ff", "#11243a", 1.1]} />
      <directionalLight position={[3, 5, 4]} intensity={2.1} />
      <directionalLight position={[-4, 1, 1]} intensity={0.7} color="#63dff0" />
      <pointLight position={[0, 1.3, 2]} intensity={0.7} color="#7cf5d5" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[1.2, 64]} />
        <meshStandardMaterial color="#0c2033" roughness={0.85} metalness={0.15} />
      </mesh>
      <Suspense
        fallback={null}
      >
        <AnatomyModel
          setHoverPointInfo={setHoverPointInfo}
          onReady={onReady}
        />
      </Suspense>
      <CameraRig />
    </>
  );
}

export default function AnatomyViewer() {
  const [hoverPointInfo, setHoverPointInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const handleReady = useCallback(() => setLoading(false), []);

  return (
    <div className="anatomy-stage">
      <Canvas
        camera={{ position: [1.85, 1.32, 3.15], fov: 42 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <Scene
          setHoverPointInfo={setHoverPointInfo}
          onReady={handleReady}
        />
      </Canvas>
      {hoverPointInfo?.screenPosition && (
        <div
          className="anatomy-hover-overlay"
          style={{ left: hoverPointInfo.screenPosition.x, top: hoverPointInfo.screenPosition.y }}
        >
          <div className="anatomy-3d-hover-tag animate-tag-in">
            <span className="hover-tag-dot" style={{ background: hoverPointInfo.color || "#5eead4" }} />
            <div className="hover-tag-content">
              <span className="hover-tag-title">{hoverPointInfo.label}</span>
              <span className="hover-tag-sys">{hoverPointInfo.system}</span>
            </div>
          </div>
        </div>
      )}
      {loading && <div className="model-loading anatomy-loading-overlay" role="status">Loading 3D Anatomy Model…</div>}
    </div>
  );
}
