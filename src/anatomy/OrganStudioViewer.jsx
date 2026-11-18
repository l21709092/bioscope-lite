import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { ANATOMY_BY_KEY } from "./anatomydata";
import { ORGAN_MAP, ORGAN_PRESETS } from "./organStudioData";
import { RotateCw, HeartPulse, Compass, RefreshCw } from "lucide-react";
import RealisticHeart from "./RealisticHeart";
import LungExplorer from "./LungExplorer";

const MODEL_URLS = {
  male: "/anatomy/anatomy-male.glb",
  female: "/anatomy/anatomy-female.glb",
};

// Generic Isolated Organ 3D mesh extractor & renderer (for Brain, Lungs, Liver, Kidneys, etc.)
function IsolatedOrganModel({
  organPreset,
  sex,
  shadingMode,
  showPins,
  onHoverPart,
  onSelectPart,
  hoverPart,
  selectedPart,
}) {
  const { scene: source } = useGLTF(MODEL_URLS[sex], false, true);
  const groupRef = useRef(null);
  const extractedMeshes = useMemo(() => {
    if (!source || !organPreset) return [];

    const targetNames = organPreset.meshes || [organPreset.primaryKey];
    const matchingObjects = [];

    source.traverse((child) => {
      if (child.isMesh && targetNames.includes(child.name)) {
        matchingObjects.push(child);
      }
    });

    if (matchingObjects.length === 0) return [];

    const aggregateBox = new THREE.Box3();
    matchingObjects.forEach((mesh) => {
      aggregateBox.expandByObject(mesh);
    });

    const center = aggregateBox.getCenter(new THREE.Vector3());
    const size = aggregateBox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const scaleFactor = 1.75 / maxDim;

    const prepared = matchingObjects.map((mesh) => {
      const clone = mesh.clone(true);
      const struct = ANATOMY_BY_KEY[mesh.name];
      const baseColor = struct ? struct.color : organPreset.color || "#e11d48";

      const origMats = Array.isArray(clone.material) ? clone.material : [clone.material];
      const clonedMats = origMats.map((mat) => {
        const m = mat.clone();
        m.color = new THREE.Color(baseColor);
        m.roughness = 0.42;
        m.metalness = 0.08;
        return m;
      });
      clone.material = Array.isArray(clone.material) ? clonedMats : clonedMats[0];

      clone.position.sub(center).multiplyScalar(scaleFactor);
      clone.scale.multiplyScalar(scaleFactor);

      return {
        name: mesh.name,
        object: clone,
        label: struct ? struct.label : mesh.name,
        color: baseColor,
      };
    });

    return prepared;
  }, [source, organPreset]);

  useEffect(() => () => {
    extractedMeshes.forEach(({ object }) => {
      const mats = Array.isArray(object.material) ? object.material : [object.material];
      mats.forEach((material) => material?.dispose?.());
    });
  }, [extractedMeshes]);

  useEffect(() => {
    extractedMeshes.forEach(({ name, object, color }) => {
      const mats = Array.isArray(object.material) ? object.material : [object.material];
      const isHovered = hoverPart?.name === name;
      const isSelected = selectedPart === name;

      mats.forEach((mat) => {
        if (!mat) return;

        if (shadingMode === "wireframe") {
          mat.wireframe = true;
          mat.transparent = false;
          mat.opacity = 1;
          mat.color.set(isHovered ? "#5eead4" : color);
        } else if (shadingMode === "xray") {
          mat.wireframe = false;
          mat.transparent = true;
          mat.opacity = isSelected || isHovered ? 0.9 : 0.38;
          mat.depthWrite = false;
          mat.color.set(isHovered ? "#7cf5d5" : color);
        } else {
          mat.wireframe = false;
          mat.transparent = false;
          mat.opacity = 1;
          mat.depthWrite = true;
          mat.color.set(color);
        }

        if (mat.emissive) {
          mat.emissive.set(isHovered ? "#5eead4" : isSelected ? color : "#000000");
          mat.emissiveIntensity = isHovered ? 0.35 : isSelected ? 0.2 : 0;
        }
        mat.needsUpdate = true;
      });
    });
  }, [extractedMeshes, shadingMode, hoverPart, selectedPart]);

  return (
    <group ref={groupRef}>
      {extractedMeshes.map(({ name, object, label, color }) => (
        <primitive
          key={name}
          object={object}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart(name);
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
            onHoverPart({
              name,
              label,
              color,
              point: [e.point.x, e.point.y, e.point.z],
              screenX: e.clientX,
              screenY: e.clientY,
            });
          }}
          onPointerOut={() => {
            document.body.style.cursor = "";
            onHoverPart(null);
          }}
        />
      ))}

      {/* Interactive Landmark Pins */}
      {showPins &&
        organPreset?.landmarks?.map((lm, idx) => (
          <group key={idx} position={lm.position}>
            <mesh>
              <sphereGeometry args={[0.035, 16, 16]} />
              <meshStandardMaterial
                color="#5eead4"
                emissive="#14b8a6"
                emissiveIntensity={0.6}
              />
            </mesh>
            <Html center distanceFactor={6} style={{ pointerEvents: "none" }}>
              <div className="organ-landmark-pin">
                <span className="landmark-title">{lm.name}</span>
              </div>
            </Html>
          </group>
        ))}

      {/* Floating 3D Hover Label */}
      {hoverPart && hoverPart.point && (
        <Html
          position={hoverPart.point}
          center
          style={{ pointerEvents: "none", zIndex: 9999 }}
        >
          <div className="anatomy-3d-hover-tag animate-tag-in">
            <span
              className="hover-tag-dot"
              style={{ background: hoverPart.color || "#5eead4" }}
            />
            <div className="hover-tag-content">
              <span className="hover-tag-title">{hoverPart.label}</span>
              <span className="hover-tag-hint">Click to inspect</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Camera Rig
function OrganCameraRig({ presetView, autoRotate, cameraDistance = 2.4, resetKey }) {
  const controlsRef = useRef(null);
  const { camera } = useThree();

  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.target.set(0, 0, 0);

    const dist = cameraDistance;
    switch (presetView) {
      case "anterior":
        camera.position.set(0, 0, dist);
        break;
      case "posterior":
        camera.position.set(0, 0, -dist);
        break;
      case "lateral":
        camera.position.set(dist, 0, 0);
        break;
      case "superior":
        camera.position.set(0, dist, 0.01);
        break;
      default:
        camera.position.set(0.6, 0.4, dist * 0.95);
        break;
    }
    controlsRef.current.update();
  }, [presetView, camera, cameraDistance, resetKey]);

  useFrame(() => {
    if (autoRotate && controlsRef.current) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = 2.2;
    } else if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
    controlsRef.current?.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan
      enableDamping
      dampingFactor={0.08}
      minDistance={0.8}
      maxDistance={6.0}
    />
  );
}

export default function OrganStudioViewer({
  organId = "heart",
  sex = "female",
  selectedPart = null,
  onSelectPart = () => {},
}) {
  const [shadingMode, setShadingMode] = useState("realistic");
  const [showPins, setShowPins] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isPumping, setIsPumping] = useState(true);
  const [heartSpeed, setHeartSpeed] = useState(3);
  const [presetView, setPresetView] = useState("isometric");
  const [cameraResetKey, setCameraResetKey] = useState(0);
  const [hoverPart, setHoverPart] = useState(null);

  const organPreset = useMemo(
    () => ORGAN_MAP[organId] || ORGAN_PRESETS[0],
    [organId]
  );

  const isHeart = organPreset.id === "heart";
  const isLungs = organPreset.id === "lungs";

  if (isLungs) {
    return <LungExplorer onSelectPart={onSelectPart} selectedPart={selectedPart} />;
  }

  return (
    <div className="organ-studio-container">
      {/* 3D Viewport Controls HUD */}
      <div className="organ-studio-hud">
        <div className="hud-group">
          <span className="hud-label">Camera Angle:</span>
          <button
            className={`hud-btn ${presetView === "anterior" ? "active" : ""}`}
            onClick={() => setPresetView("anterior")}
            title="Anterior (Front) View"
          >
            Front
          </button>
          <button
            className={`hud-btn ${presetView === "posterior" ? "active" : ""}`}
            onClick={() => setPresetView("posterior")}
            title="Posterior (Back) View"
          >
            Back
          </button>
          <button
            className={`hud-btn ${presetView === "lateral" ? "active" : ""}`}
            onClick={() => setPresetView("lateral")}
            title="Lateral (Side) View"
          >
            Side
          </button>
          <button
            className={`hud-btn ${presetView === "superior" ? "active" : ""}`}
            onClick={() => setPresetView("superior")}
            title="Superior (Top) View"
          >
            Top
          </button>
          <button
            className="hud-btn"
            onClick={() => { setPresetView("isometric"); setCameraResetKey((key) => key + 1); }}
            title="Reset to 3D View"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        <div className="hud-group">
          {isHeart && (
            <button
              className={`hud-btn icon-btn ${isPumping ? "active" : ""}`}
              onClick={() => setIsPumping(!isPumping)}
              title="Toggle Live Heartbeat Pump Motion"
            >
              <HeartPulse size={14} className={isPumping ? "text-red-400" : ""} />
              <span>{isPumping ? "Pumping" : "Static"}</span>
            </button>
          )}

          <button
            className={`hud-btn icon-btn ${autoRotate ? "active" : ""}`}
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle 360° Auto-Rotation"
          >
            <RotateCw size={14} />
            <span>Turn</span>
          </button>

          <button
            className={`hud-btn icon-btn ${showPins ? "active" : ""}`}
            onClick={() => setShowPins(!showPins)}
            title="Toggle Anatomical Landmark Pins"
          >
            <Compass size={14} />
            <span>Pins</span>
          </button>

          <div className="hud-shading-switch">
            <button
              className={`hud-btn ${shadingMode === "realistic" ? "active" : ""}`}
              onClick={() => setShadingMode("realistic")}
              title="Photorealistic Surface Shading"
            >
              Solid
            </button>
            <button
              className={`hud-btn ${shadingMode === "xray" ? "active" : ""}`}
              onClick={() => setShadingMode("xray")}
              title="Translucent X-Ray Glass"
            >
              X-Ray
            </button>
            {isHeart ? (
              <button
                className={`hud-btn ${shadingMode === "cutaway" ? "active" : ""}`}
                onClick={() => setShadingMode("cutaway")}
                title="Reveal the internal chambers and valves"
              >Cutaway</button>
            ) : (
              <button
                className={`hud-btn ${shadingMode === "wireframe" ? "active" : ""}`}
                onClick={() => setShadingMode("wireframe")}
                title="Wireframe Mesh"
              >Wire</button>
            )}
          </div>

          {isHeart && <label className="heart-studio-speed">Cycle speed
            <select value={heartSpeed} onChange={(event) => setHeartSpeed(Number(event.target.value))}>
              <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option><option value={2}>2×</option><option value={3}>3×</option>
            </select>
          </label>}
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="anatomy-stage organ-stage">
        <Canvas
          camera={{
            position: [0.6, 0.4, isHeart ? 2.8 : organPreset.cameraDistance || 2.4],
            fov: 42,
          }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#07111f"]} />
          <fog attach="fog" args={["#07111f", 4.5, 9.5]} />
          <ambientLight intensity={1.1} />
          <hemisphereLight args={["#ffffff", "#0c1d32", 1.3]} />
          <directionalLight position={[3, 5, 4]} intensity={2.4} />
          <directionalLight position={[-4, 2, -2]} intensity={1.0} color="#63dff0" />
          <pointLight position={[0, -1.2, 2.2]} intensity={1.1} color="#ff7b88" />

          {/* Pedestal platform ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]}>
            <circleGeometry args={[1.35, 64]} />
            <meshStandardMaterial color="#0c2033" roughness={0.85} metalness={0.15} />
          </mesh>

          <Suspense
            fallback={
              <Html center>
                <div className="model-loading">
                  Rendering {isHeart ? "Realistic 3D Heart" : organPreset.name}…
                </div>
              </Html>
            }
          >
            {isHeart ? (
              <RealisticHeart
                shadingMode={shadingMode}
                cutaway={shadingMode === "cutaway"}
                translucent={shadingMode === "xray"}
                labels={showPins}
                showPins={showPins}
                isPumping={isPumping}
                animationSpeed={heartSpeed}
                bpm={72}
                onHoverPart={setHoverPart}
                hoverPart={hoverPart}
                onSelectPart={onSelectPart}
                selectedPart={selectedPart}
                scale={0.58}
              />
            ) : (
              <IsolatedOrganModel
                organPreset={organPreset}
                sex={sex}
                shadingMode={shadingMode}
                showPins={showPins}
                onHoverPart={setHoverPart}
                onSelectPart={onSelectPart}
                hoverPart={hoverPart}
                selectedPart={selectedPart}
              />
            )}
          </Suspense>

          <OrganCameraRig
            presetView={presetView}
            autoRotate={autoRotate}
            cameraDistance={isHeart ? 2.8 : organPreset.cameraDistance}
            resetKey={cameraResetKey}
          />
        </Canvas>
      </div>
    </div>
  );
}
