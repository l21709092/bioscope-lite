import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const cellPalette = {
  neutrophil: { cytoplasm: "#c9d4e2", membrane: "#e1eafa", nucleus: "#48418f", granule: "#d56fc9" },
  lymphocyte: { cytoplasm: "#c9d0e0", membrane: "#e2e9f4", nucleus: "#713a67", granule: "#ae7c9b" },
  monocyte: { cytoplasm: "#c7bedb", membrane: "#e2d9f1", nucleus: "#583783", granule: "#8d9bb5" },
  eosinophil: { cytoplasm: "#e8c8c9", membrane: "#f7e1e1", nucleus: "#624a82", granule: "#e34e59" },
  basophil: { cytoplasm: "#cfbdd9", membrane: "#eadcf1", nucleus: "#53386e", granule: "#4b285e" }
};

const structureMetadata = {
  membrane: { structureName: "Cell membrane", function: "Controls exchange and helps the cell sense its surroundings.", simple: "A flexible outer boundary.", scientific: "A phospholipid bilayer with proteins involved in transport, adhesion and signalling." },
  cytoplasm: { structureName: "Cytoplasm", function: "Holds the cell's internal structures and supports cellular activity.", simple: "The gel-like inside of the cell.", scientific: "Cytosol and organelles fill the space between the plasma membrane and nucleus." },
  nucleus: { structureName: "Nucleus", function: "Contains the cell's genetic material.", simple: "The compartment that stores the cell's instructions.", scientific: "A membrane-bound compartment containing genomic DNA; its lobulation is a useful morphology feature." },
  granules: { structureName: "Granules", function: "Store cell-specific substances for release or intracellular processing.", simple: "Tiny storage packets; their contents differ between cell types.", scientific: "Membrane-bound secretory compartments with type-specific abundance and contents." },
  lysosomes: { structureName: "Lysosomes", function: "Break down swallowed microbes and cell debris.", simple: "Small digestive sacs that help break down material a cell has swallowed.", scientific: "Acidic, enzyme-rich vesicles that fuse with phagosomes and other endosomal compartments." },
  antigenReceptors: { structureName: "B-cell receptors", function: "Recognize a matching antigen and help activate a B cell.", simple: "Matching sensors on a B cell's surface.", scientific: "Membrane-bound immunoglobulin receptors that bind specific antigen and signal with associated proteins." }
};

const cellScales = {
  neutrophil: [1.04, 1, 1],
  lymphocyte: [0.96, 1.02, 0.98],
  monocyte: [1.08, 1, 0.98],
  eosinophil: [1, 1.04, 0.98],
  basophil: [1.02, 0.98, 1]
};

function randomSource(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function inNuclearRegion(type, point) {
  const [x, y, z] = point;
  if (type === "lymphocyte") return Math.hypot(x / 0.72, y / 0.78, z / 0.58) < 1;
  if (type === "neutrophil") {
    return [[-0.52, 0.04], [-0.18, 0.16], [0.19, 0.08], [0.52, -0.04]]
      .some(([cx, cy]) => Math.hypot((x - cx) / 0.32, (y - cy) / 0.39, z / 0.32) < 1);
  }
  if (type === "eosinophil") return [-0.31, 0.31].some(cx => Math.hypot((x - cx) / 0.41, y / 0.49, z / 0.39) < 1);
  if (type === "basophil") return [-0.27, 0.27].some(cx => Math.hypot((x - cx) / 0.39, y / 0.48, z / 0.39) < 1);
  const radialDistance = Math.hypot(x / 0.52, y / 0.62);
  const angle = Math.atan2(y / 0.62, x / 0.52);
  const openSide = Math.abs(angle) < 0.48;
  return !openSide && Math.abs(radialDistance - 1) < 0.25 && Math.abs(z) < 0.23;
}

function makeGranules(type) {
  const count = { neutrophil: 145, lymphocyte: 12, monocyte: 92, eosinophil: 112, basophil: 175 }[type];
  const random = randomSource({ neutrophil: 31, lymphocyte: 47, monocyte: 61, eosinophil: 73, basophil: 89 }[type]);
  const points = [];
  let attempts = 0;
  while (points.length < count && attempts < count * 12) {
    attempts += 1;
    const point = [random() * 2 - 1, random() * 2 - 1, random() * 2 - 1];
    const radius = Math.hypot(...point);
    if (radius > 1 || radius < 0.35 || inNuclearRegion(type, point)) continue;
    const scale = type === "eosinophil" ? 0.039 + random() * 0.015
      : type === "basophil" ? 0.034 + random() * 0.014
        : type === "lymphocyte" ? 0.018 + random() * 0.01
          : 0.023 + random() * 0.013;
    points.push({ position: point.map(value => value * 1.51), scale });
  }
  return points;
}

function makeMembraneGeometry(type, radius = 1.72) {
  const geometry = new THREE.SphereGeometry(radius, 80, 64);
  const positions = geometry.attributes.position;
  const seed = { neutrophil: 2, lymphocyte: 5, monocyte: 8, eosinophil: 11, basophil: 14 }[type];
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const z = positions.getZ(index);
    const folds = 0.014 * Math.sin(x * 9 + seed) * Math.cos(y * 8 - seed) * Math.sin(z * 10);
    const fineTexture = 0.006 * Math.sin(x * 17 + y * 5 + seed) * Math.cos(z * 15 - y * 3);
    const noise = 1 + folds + fineTexture;
    positions.setXYZ(index, x * noise, y * noise, z * noise);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function PartMesh({ selected, structureId, children, ...props }) {
  return (
    <group
      {...props}
      userData={{ structureId, ...structureMetadata[structureId] }}
    >
      {children(selected)}
    </group>
  );
}

function NucleusMaterial({ type, selected }) {
  return <meshPhysicalMaterial color={cellPalette[type].nucleus} roughness={0.34} clearcoat={0.18} emissive={selected ? "#284b50" : "#000000"} emissiveIntensity={selected ? 0.7 : 0} />;
}

function Nucleus({ type, selected }) {
  const lobes = type === "neutrophil" ? [
    [-0.78, 0.06, 0, [0.48, 0.59, 0.48]], [-0.27, 0.24, 0, [0.48, 0.58, 0.49]],
    [0.28, 0.12, 0, [0.49, 0.58, 0.49]], [0.78, -0.06, 0, [0.47, 0.56, 0.47]]
  ] : type === "eosinophil" ? [
    [-0.47, 0, 0, [0.62, 0.74, 0.58]], [0.47, 0, 0, [0.62, 0.74, 0.58]]
  ] : [[-0.4, 0.03, 0, [0.58, 0.72, 0.58]], [0.4, 0.03, 0, [0.58, 0.72, 0.58]]];

  return (
    <PartMesh structureId="nucleus" selected={selected}>
      {isSelected => type === "monocyte" ? (
        <mesh>
          <tubeGeometry args={[new THREE.CatmullRomCurve3(
            Array.from({ length: 44 }, (_, index) => {
              const angle = 0.48 + (Math.PI * 2 - 0.96) * index / 43;
              return new THREE.Vector3(Math.cos(angle) * 0.79, Math.sin(angle) * 0.94, 0.02 * Math.sin(angle * 2));
            }), 120, 0.31, 20, false
          )]} />
          <NucleusMaterial type={type} selected={isSelected} />
        </mesh>
      ) : type === "lymphocyte" ? (
        <mesh scale={[1, 1.08, 0.82]}>
          <sphereGeometry args={[1.04, 64, 48]} /><NucleusMaterial type={type} selected={isSelected} />
        </mesh>
      ) : (
        <group>
          {type === "neutrophil" && <mesh><tubeGeometry args={[new THREE.CatmullRomCurve3(lobes.map(([x, y]) => new THREE.Vector3(x, y, 0))), 48, 0.16, 14, false]} /><meshPhysicalMaterial color={cellPalette[type].nucleus} roughness={0.36} /></mesh>}
          {type === "eosinophil" && <mesh><tubeGeometry args={[new THREE.CatmullRomCurve3([new THREE.Vector3(-0.36, 0, 0), new THREE.Vector3(0, 0.02, 0.02), new THREE.Vector3(0.36, 0, 0)]), 24, 0.13, 12, false]} /><meshPhysicalMaterial color={cellPalette[type].nucleus} roughness={0.36} /></mesh>}
          {lobes.map(([x, y, z, scale], index) => (
            <mesh key={index} position={[x, y, z]} scale={scale}>
              <sphereGeometry args={[1, 48, 36]} /><NucleusMaterial type={type} selected={isSelected} />
            </mesh>
          ))}
        </group>
      )}
    </PartMesh>
  );
}

export function WBCModel({ type, selectedStructure, hoveredStructure, cutaway = false, position = [0, 0, 0], scale = 1, showLabels = false, labelStructure = hoveredStructure || selectedStructure }) {
  const palette = cellPalette[type];
  const membraneGeometry = useMemo(() => makeMembraneGeometry(type), [type]);
  const granules = useMemo(() => makeGranules(type), [type]);
  const lysosomes = useMemo(() => {
    const candidates = makeGranules(type);
    const count = Math.min(5, candidates.length);
    return Array.from({ length: count }, (_, index) => ({
      position: candidates[Math.floor(index * candidates.length / count)].position,
      scale: 0.07
    }));
  }, [type]);
  const selected = key => selectedStructure === key || hoveredStructure === key;
  const labelPositions = {
    membrane: [1.2, 0.95, 0.64],
    cytoplasm: [-1.18, 0.72, 0.48],
    nucleus: [0, 1.08, 0.48],
    granules: granules[0]?.position || [-1.16, -0.9, 0.68],
    lysosomes: lysosomes[0]?.position || [1.18, -1.03, 0.54],
    antigenReceptors: [0, 1.65, 0.68]
  };

  return (
    <group position={position} scale={scale}>
      <PartMesh structureId="cytoplasm" selected={selected("cytoplasm")}>
        {isSelected => <mesh scale={cellScales[type]}>
          <sphereGeometry args={[1.59, 64, 48]} />
          <meshPhysicalMaterial color={palette.cytoplasm} roughness={0.44} metalness={0.01} transparent opacity={cutaway ? 0.06 : 0.19} depthWrite={false} clearcoat={0.22} emissive={isSelected ? "#1d5c5a" : "#000000"} emissiveIntensity={isSelected ? 0.48 : 0} />
        </mesh>}
      </PartMesh>

      <Nucleus type={type} selected={selected("nucleus")} />

      <GranuleInstances type={type} points={granules} selected={selected("granules")} />

      <PartMesh structureId="membrane" selected={selected("membrane")}>
        {isSelected => <mesh geometry={membraneGeometry} scale={cellScales[type]}>
          <meshPhysicalMaterial color={palette.membrane} roughness={0.24} metalness={0.02} transparent opacity={cutaway ? 0.08 : 0.24} depthWrite={false} side={THREE.DoubleSide} clearcoat={0.8} clearcoatRoughness={0.2} emissive={isSelected ? "#2c9386" : "#000000"} emissiveIntensity={isSelected ? 0.38 : 0} />
        </mesh>}
      </PartMesh>

      <GranuleInstances type="lysosome" points={lysosomes} selected={selected("lysosomes")} structureId="lysosomes" />
      {type === "lymphocyte" && <PartMesh structureId="antigenReceptors" selected={selected("antigenReceptors")}>
        {isSelected => <group>
          {[[-0.56, 1.27, 0.7], [0, 1.48, 0.62], [0.56, 1.27, 0.7]].map((position, index) => <group key={index} position={position} scale={0.13}>
            <mesh position={[0, 0.48, 0]}><cylinderGeometry args={[0.07, 0.07, 0.65, 8]} /><meshStandardMaterial color={isSelected ? "#5eead4" : "#80c6d1"} emissive={isSelected ? "#20a99a" : "#000000"} emissiveIntensity={isSelected ? 0.7 : 0} /></mesh>
            {[-1, 1].map(side => <mesh key={side} position={[side * 0.22, 0.75, 0]} rotation={[0, 0, side * -0.58]}><cylinderGeometry args={[0.06, 0.06, 0.48, 8]} /><meshStandardMaterial color={isSelected ? "#5eead4" : "#80c6d1"} emissive={isSelected ? "#20a99a" : "#000000"} emissiveIntensity={isSelected ? 0.7 : 0} /></mesh>)}
          </group>)}
        </group>}
      </PartMesh>}
      {showLabels && structureMetadata[labelStructure] && <Html position={labelPositions[labelStructure]} center distanceFactor={7}>
        <div className="wbc-floating-structure-label">
          <strong>{structureMetadata[labelStructure].structureName}</strong>
          <span>{structureMetadata[labelStructure].simple}</span>
        </div>
      </Html>}
    </group>
  );
}

function GranuleInstances({ points, type, selected, structureId = "granules" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    points.forEach(({ position, scale }, index) => {
      dummy.position.set(...position);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      ref.current.setMatrixAt(index, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [points]);

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, points.length]}
      userData={{ structureId, ...structureMetadata[structureId] }}
    >
      <icosahedronGeometry args={[1, type === "eosinophil" || type === "basophil" ? 2 : 1]} />
      <meshPhysicalMaterial color={type === "lysosome" ? "#b979d1" : cellPalette[type].granule} roughness={0.32} clearcoat={0.24} emissive={selected ? "#59394f" : "#000000"} emissiveIntensity={selected ? 0.48 : 0} />
    </instancedMesh>
  );
}

function IdleRotation({ interactionRef, children }) {
  const groupRef = useRef(null);
  useFrame((_, delta) => {
    if (groupRef.current && !interactionRef.current) groupRef.current.rotation.y += delta * 0.035;
  });
  return <group ref={groupRef}>{children}</group>;
}

function ComparisonModels({ comparisonTypes, interactionRef }) {
  const viewport = useThree(state => state.viewport);
  const scale = Math.min(0.82, viewport.width / (comparisonTypes.length * 3.4 + (comparisonTypes.length - 1) * 0.45));
  const spacing = 3.85 * scale;
  return (
    <IdleRotation interactionRef={interactionRef}>
      {comparisonTypes.map((compareType, index) => (
        <WBCModel key={`${compareType}-${index}`} type={compareType} position={[(index - (comparisonTypes.length - 1) / 2) * spacing, 0, 0]} scale={scale} interactive={false} />
      ))}
    </IdleRotation>
  );
}

function StructureRaycaster({ onHoverStructure, onSelectStructure }) {
  const { camera, gl, scene } = useThree();
  const pointer = useMemo(() => new THREE.Vector2(), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  useEffect(() => {
    const canvas = gl.domElement;
    const getStructure = event => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return null;
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const priority = { antigenReceptors: 0, nucleus: 1, granules: 2, lysosomes: 3, cytoplasm: 4, membrane: 5 };
      const intersections = raycaster.intersectObjects(scene.children, true).map(item => {
        let object = item.object;
        while (object && !object.userData?.structureId) object = object.parent;
        return object?.userData?.structureId ? { id: object.userData.structureId, distance: item.distance } : null;
      }).filter(Boolean);
      intersections.sort((a, b) => (priority[a.id] ?? 10) - (priority[b.id] ?? 10) || a.distance - b.distance);
      return intersections[0]?.id || null;
    };
    const trackStructure = event => {
      const id = getStructure(event);
      document.body.style.cursor = id ? "pointer" : "auto";
      onHoverStructure(id);
    };
    const pinStructure = event => {
      if (event.button !== 0) return;
      const id = getStructure(event);
      if (id) onSelectStructure(id);
    };
    const clearStructure = () => {
      document.body.style.cursor = "auto";
      onHoverStructure(null);
    };
    canvas.addEventListener("pointermove", trackStructure);
    canvas.addEventListener("click", pinStructure);
    canvas.addEventListener("pointerleave", clearStructure);
    return () => {
      canvas.removeEventListener("pointermove", trackStructure);
      canvas.removeEventListener("click", pinStructure);
      canvas.removeEventListener("pointerleave", clearStructure);
    };
  }, [camera, gl, onHoverStructure, onSelectStructure, pointer, raycaster, scene]);

  return null;
}

export default function WBCCell3D({ type, selectedStructure, hoveredStructure, onSelectStructure, onHoverStructure = () => {}, showLabels = true, cutaway, controlsRef, comparisonTypes, enabled = true }) {
  const comparison = Boolean(comparisonTypes);
  const interactionRef = useRef(false);
  return (
    <Canvas
      className={comparison ? "wbc-comparison-canvas" : "wbc-3d-canvas"}
      frameloop={enabled ? "always" : "never"}
      camera={{ position: [0, 0, comparison ? 5.4 : 5.2], fov: 39 }}
      dpr={[1, 1.45]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => { gl.setClearColor("#0b1522", 1); }}
    >
      <hemisphereLight args={["#e4f4ff", "#243044", 1.05]} />
      <ambientLight intensity={0.24} />
      <directionalLight castShadow position={[-3.5, 5, 5]} intensity={1.5} color="#fff2df" shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[4, -2, 3]} intensity={15} distance={9} color="#77c8d8" />
      <pointLight position={[-3, -1, -3]} intensity={10} distance={8} color="#aa84df" />
      {comparison ? (
        <ComparisonModels comparisonTypes={comparisonTypes} interactionRef={interactionRef} />
      ) : (
        <>
          <IdleRotation interactionRef={interactionRef}>
            <WBCModel type={type} selectedStructure={selectedStructure} hoveredStructure={hoveredStructure} cutaway={cutaway} showLabels={showLabels} />
          </IdleRotation>
          <StructureRaycaster onHoverStructure={onHoverStructure} onSelectStructure={onSelectStructure} />
          <ContactShadows position={[0, -1.65, 0]} opacity={0.18} scale={4.5} blur={3} far={3} resolution={384} />
        </>
      )}
      <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.075} minDistance={3.5} maxDistance={9} enablePan={false} rotateSpeed={0.62} onStart={() => { interactionRef.current = true; }} onEnd={() => { interactionRef.current = false; }} />
    </Canvas>
  );
}
