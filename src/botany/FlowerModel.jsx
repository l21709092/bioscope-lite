import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const FLOWER_CENTER = new THREE.Vector3(0, 0.45, 0);
const OVULE_POSITIONS = [
  [-0.24, 0.15, 0.2], [-0.04, 0.22, 0.29], [0.18, 0.1, 0.24],
  [-0.2, -0.1, 0.29], [0.04, -0.07, 0.35], [0.23, -0.14, 0.22],
  [-0.08, -0.32, 0.26], [0.16, -0.33, 0.2]
];
const POLLEN_ROUTE = [
  [0.62, 2.38, 0.02], [0.44, 2.68, 0.08], [0.2, 2.82, 0.17], [0.02, 2.79, 0.22]
];
const TUBE_ROUTE = [
  [0.02, 2.73, 0.22], [-0.02, 2.2, 0.24], [0.02, 1.67, 0.27],
  [0.02, 1.35, 0.29], [0.04, 1.08, 0.3], [0.04, 0.91, 0.34]
];
const EGG_SPERM_ROUTE = [[0.04, 0.91, 0.34], [0, 1.05, 0.38], [-0.04, 1.18, 0.38]];
const CENTRAL_SPERM_ROUTE = [[0.04, 0.91, 0.34], [0.01, 1.06, 0.37], [-0.04, 1.22, 0.36]];
const HOVER_INFO = {
  petal: ["Petal", "Attracts insect pollinators"],
  sepal: ["Sepal", "Shields flower buds"],
  anther: ["Anther", "Makes pollen grains"],
  filament: ["Filament", "Holds pollen sacs"],
  stigma: ["Stigma", "Catches incoming pollen"],
  style: ["Style", "Guides pollen tubes"],
  ovary: ["Ovary", "Houses developing ovules"],
  ovule: ["Ovule", "Becomes a seed"],
  receptacle: ["Receptacle", "Supports floral organs"]
};
const FlowerInteractionContext = createContext({ hoveredId: null, onPartHover: null, onPartLeave: null });

function makePetalGeometry() {
  const rows = 38;
  const columns = 18;
  const positions = [];
  const indices = [];
  for (let row = 0; row <= rows; row += 1) {
    const t = row / rows;
    const width = 0.53 * Math.pow(Math.sin(Math.PI * t), 0.78) * (0.64 + 0.72 * t);
    for (let column = 0; column <= columns; column += 1) {
      const across = column / columns * 2 - 1;
      const centerY = -0.14 * t * t;
      const cup = 0.18 * Math.sin(Math.PI * t) * (1 - across * across);
      const edge = -0.045 * across * across * Math.sin(Math.PI * t);
      positions.push(1.78 * t, centerY + across * width, cup + edge);
    }
  }
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const a = row * (columns + 1) + column;
      const b = a + columns + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeCurve(points) {
  return new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
}

function PartGroup({ id, selectedId, onSelect, children, position, rotation, scale, haloPosition = [0, 0, 0] }) {
  const { hoveredId, onPartHover, onPartLeave } = useContext(FlowerInteractionContext);
  const selected = selectedId === id;
  const hovered = hoveredId === id;
  return <group position={position} rotation={rotation} scale={scale}
    onClick={event => { event.stopPropagation(); onSelect?.(id); }}
    onPointerOver={event => { event.stopPropagation(); document.body.style.cursor = "pointer"; onPartHover?.(id, event.point); }}
    onPointerMove={event => { event.stopPropagation(); onPartHover?.(id, event.point); }}
    onPointerOut={event => { event.stopPropagation(); document.body.style.cursor = "auto"; onPartLeave?.(id); }}>
    {(selected || hovered) && <mesh position={haloPosition} scale={[0.56, 0.56, 0.34]}>
      <sphereGeometry args={[1, 24, 18]} />
      <meshBasicMaterial color={selected ? "#fff0b2" : "#ffe6a0"} transparent opacity={selected ? 0.22 : 0.12} depthWrite={false} />
    </mesh>}
    {children}
  </group>;
}

function FlowerPetal({ id, selectedId, onSelect, angle, sepal = false }) {
  const { hoveredId } = useContext(FlowerInteractionContext);
  const geometry = useMemo(() => makePetalGeometry(), []);
  const radialAngle = angle * Math.PI * 2 / (sepal ? 5 : 6);
  const color = sepal ? (selectedId === id || hoveredId === id ? "#c4d984" : "#52784c") : selectedId === id ? "#ffe0c5" : hoveredId === id ? "#efb1a1" : angle % 2 ? "#d27691" : "#c75c80";
  return <PartGroup id={id} selectedId={selectedId} onSelect={onSelect}
    position={[0, sepal ? 0.65 : 1.24, 0]}
    rotation={[sepal ? -0.12 : 0, radialAngle, sepal ? -0.1 : 0]}
    scale={sepal ? [0.78, 0.56, 0.72] : [1, 1, 1]}>
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshPhysicalMaterial color={color} roughness={0.48} clearcoat={0.16} side={THREE.DoubleSide} sheen={0.38} sheenColor={sepal ? "#d9e5a5" : "#f8b6cb"} />
    </mesh>
    {!sepal && <mesh position={[0.83, 0, 0.08]} scale={[0.55, 0.022, 0.018]}>
      <sphereGeometry args={[1, 18, 12]} />
      <meshStandardMaterial color="#f2b3c4" roughness={0.48} />
    </mesh>}
  </PartGroup>;
}

function ZoomDetail({ children, maxDistance = 8.1, force = false }) {
  const ref = useRef(null);
  const { camera } = useThree();
  useFrame(() => {
    if (ref.current) ref.current.visible = force || camera.position.distanceTo(FLOWER_CENTER) < maxDistance;
  });
  return <group ref={ref} visible={false}>{children}</group>;
}

function Anther({ angle, index, selectedId, onSelect }) {
  const { hoveredId } = useContext(FlowerInteractionContext);
  const radial = angle * Math.PI / 3;
  const x = Math.cos(radial) * 0.62;
  const z = Math.sin(radial) * 0.62;
  const filamentCurve = useMemo(() => makeCurve([
    [Math.cos(radial) * 0.26, 1.38, Math.sin(radial) * 0.26],
    [x * 0.68, 1.9, z * 0.68],
    [x, 2.44, z]
  ]), [radial, x, z]);
  const antherColor = selectedId === "anther" ? "#f7d28c" : hoveredId === "anther" ? "#e6bd69" : "#b98538";
  return <>
    <PartGroup id="filament" selectedId={selectedId} onSelect={onSelect}>
      <mesh>
        <tubeGeometry args={[filamentCurve, 24, 0.045, 9, false]} />
        <meshPhysicalMaterial color={selectedId === "filament" ? "#fff0c2" : hoveredId === "filament" ? "#f2dda8" : "#d5b776"} roughness={0.43} />
      </mesh>
    </PartGroup>
    <PartGroup id="anther" selectedId={selectedId} onSelect={onSelect} position={[x, 2.48, z]} rotation={[0.15, radial, 0.24]}>
      <mesh scale={[0.13, 0.28, 0.105]} castShadow>
        <capsuleGeometry args={[0.42, 0.34, 6, 12]} />
        <meshPhysicalMaterial color={antherColor} roughness={0.39} clearcoat={0.12} />
      </mesh>
      <mesh position={[0.075, -0.02, 0.015]} scale={[0.095, 0.22, 0.085]}>
        <capsuleGeometry args={[0.4, 0.3, 5, 10]} />
        <meshPhysicalMaterial color={antherColor} roughness={0.42} />
      </mesh>
    </PartGroup>
    <ZoomDetail maxDistance={8.8}>
      <PartGroup id="anther" selectedId={selectedId} onSelect={onSelect} position={[x, 2.49, z]}>
        {[-0.13, -0.04, 0.06, 0.16].map((offset, grainIndex) => <mesh key={`${index}-${grainIndex}`} position={[offset, (grainIndex % 2) * 0.08, 0.12 + (grainIndex % 3) * 0.02]} scale={[0.043, 0.043, 0.035]}>
          <dodecahedronGeometry args={[1, 1]} />
          <meshPhysicalMaterial color="#efca69" roughness={0.55} />
        </mesh>)}
      </PartGroup>
    </ZoomDetail>
  </>;
}

function Ovary({ selectedId, onSelect, forceCutaway }) {
  const { hoveredId } = useContext(FlowerInteractionContext);
  const frontMesh = useRef(null);
  const frontWall = useRef(null);
  const { camera } = useThree();
  const backOvary = useMemo(() => new THREE.SphereGeometry(1, 40, 30, Math.PI, Math.PI, 0.42, Math.PI - 0.84), []);
  const frontOvary = useMemo(() => new THREE.SphereGeometry(1, 40, 30, 0, Math.PI, 0.42, Math.PI - 0.84), []);
  useFrame(() => {
    if (!frontWall.current) return;
    const distance = camera.position.distanceTo(FLOWER_CENTER);
    const opening = forceCutaway ? 1 : 1 - THREE.MathUtils.smoothstep(distance, 5.9, 8.6);
    frontWall.current.opacity = 1 - opening;
    if (frontMesh.current) frontMesh.current.raycast = opening > 0.72 ? () => {} : THREE.Mesh.prototype.raycast;
  });
  return <PartGroup id="ovary" selectedId={selectedId} onSelect={onSelect} position={[0, 0.98, 0]}>
    <mesh geometry={backOvary} scale={[0.48, 0.58, 0.42]} castShadow>
      <meshPhysicalMaterial color={selectedId === "ovary" ? "#d7c877" : hoveredId === "ovary" ? "#c3c77a" : "#9fa55c"} roughness={0.51} clearcoat={0.12} />
    </mesh>
    <mesh ref={frontMesh} geometry={frontOvary} scale={[0.484, 0.585, 0.425]}>
      <meshPhysicalMaterial ref={frontWall} color="#e2d795" roughness={0.4} transparent opacity={1} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
    <ZoomDetail maxDistance={8.2} force={forceCutaway}>
      <mesh position={[0, 0, 0.16]} scale={[0.36, 0.43, 0.14]} raycast={() => {}}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshPhysicalMaterial color="#594c4c" roughness={0.8} />
      </mesh>
      {OVULE_POSITIONS.map((position, index) => <PartGroup key={index} id="ovule" selectedId={selectedId} onSelect={onSelect} position={position} rotation={[0, 0, (index % 2 ? -1 : 1) * 0.28]}>
        <mesh scale={[0.105, 0.18, 0.09]} castShadow>
          <sphereGeometry args={[1, 18, 14]} />
          <meshPhysicalMaterial color={selectedId === "ovule" ? "#e5c98a" : hoveredId === "ovule" ? "#cae7a3" : "#a4c988"} roughness={0.46} />
        </mesh>
        <mesh position={[0, 0.025, 0.065]} scale={[0.044, 0.095, 0.025]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#ead3a0" />
        </mesh>
        <mesh position={[0, -0.018, 0.09]} scale={[0.025, 0.025, 0.02]}>
          <sphereGeometry args={[1, 14, 12]} />
          <meshBasicMaterial color="#e3a7a4" />
        </mesh>
      </PartGroup>)}
    </ZoomDetail>
  </PartGroup>;
}

function VascularBundles({ selectedId, onSelect }) {
  const curves = useMemo(() => [
    [[-0.1, 0.53, 0.11], [-0.12, -0.16, 0.14], [-0.17, -0.82, 0.13], [-0.2, -1.6, 0.12]],
    [[0.0, 0.53, 0.12], [0.03, -0.15, 0.16], [0.05, -0.84, 0.13], [0.06, -1.6, 0.11]],
    [[0.12, 0.5, 0.08], [0.16, -0.16, 0.13], [0.19, -0.84, 0.11], [0.21, -1.6, 0.08]],
    [[-0.18, 0.48, 0.02], [-0.22, -0.14, 0.05], [-0.24, -0.82, 0.02], [-0.25, -1.57, 0.02]]
  ].map(makeCurve), []);
  return <ZoomDetail maxDistance={7.4}>
    <PartGroup id="receptacle" selectedId={selectedId} onSelect={onSelect}>
      {curves.map((curve, index) => <mesh key={index}>
        <tubeGeometry args={[curve, 28, 0.023, 7, false]} />
        <meshStandardMaterial color={index % 2 ? "#bc795b" : "#e2bd78"} roughness={0.55} />
      </mesh>)}
    </PartGroup>
  </ZoomDetail>;
}

function PollinationPath() {
  const curve = useMemo(() => makeCurve(POLLEN_ROUTE), []);
  const grainRef = useRef(null);
  useFrame(({ clock }) => {
    if (grainRef.current) grainRef.current.position.copy(curve.getPointAt((clock.elapsedTime * 0.16) % 1));
  });
  return <group>
    <Line points={POLLEN_ROUTE} color="#f2d679" lineWidth={2} transparent opacity={0.82} />
    <mesh ref={grainRef}>
      <dodecahedronGeometry args={[0.085, 1]} />
      <meshBasicMaterial color="#ffe58b" />
    </mesh>
  </group>;
}

function ReproductionAnimation({ phase, phaseProgress }) {
  const pollenRef = useRef(null);
  const tubeRef = useRef(null);
  const eggSpermRef = useRef(null);
  const centralSpermRef = useRef(null);
  const pollenCurve = useMemo(() => makeCurve(POLLEN_ROUTE), []);
  const tubeCurve = useMemo(() => makeCurve(TUBE_ROUTE), []);
  const eggSpermCurve = useMemo(() => makeCurve(EGG_SPERM_ROUTE), []);
  const centralSpermCurve = useMemo(() => makeCurve(CENTRAL_SPERM_ROUTE), []);
  useFrame(() => {
    if (pollenRef.current && phase === "pollination") pollenRef.current.position.copy(pollenCurve.getPointAt(phaseProgress));
    if (tubeRef.current) {
      const growth = phase === "germination" ? Math.max(0.015, phaseProgress) : phase === "fertilization" ? 1 : 0.001;
      tubeRef.current.scale.set(1, growth, 1);
      tubeRef.current.position.y = 2.73 * (1 - growth);
      tubeRef.current.visible = phase !== "pollination";
    }
    if (eggSpermRef.current && phase === "fertilization") eggSpermRef.current.position.copy(eggSpermCurve.getPointAt(phaseProgress));
    if (centralSpermRef.current && phase === "fertilization") centralSpermRef.current.position.copy(centralSpermCurve.getPointAt(phaseProgress));
  });
  return <group>
    {phase === "pollination" && <mesh ref={pollenRef}>
      <dodecahedronGeometry args={[0.11, 1]} />
      <meshPhysicalMaterial color="#ffe18a" emissive="#947335" emissiveIntensity={0.28} roughness={0.45} />
    </mesh>}
    <mesh ref={tubeRef}>
      <tubeGeometry args={[tubeCurve, 44, 0.035, 9, false]} />
      <meshPhysicalMaterial color="#edc86e" emissive="#7f6c38" emissiveIntensity={0.18} roughness={0.4} />
    </mesh>
    {phase === "fertilization" && <>
      <mesh ref={eggSpermRef}>
        <sphereGeometry args={[0.07, 16, 12]} />
        <meshBasicMaterial color="#fff0a5" />
      </mesh>
      <mesh ref={centralSpermRef}>
        <sphereGeometry args={[0.06, 16, 12]} />
        <meshBasicMaterial color="#f4d67d" />
      </mesh>
      <mesh position={[0.04, 0.82, 0.4]}>
        <sphereGeometry args={[0.075 + phaseProgress * 0.025, 18, 14]} />
        <meshBasicMaterial color="#e69491" />
      </mesh>
      <mesh position={[-0.025, 0.84, 0.39]}>
        <sphereGeometry args={[0.045 + phaseProgress * 0.02, 16, 12]} />
        <meshBasicMaterial color="#edce79" />
      </mesh>
    </>}
  </group>;
}

function MicroscopicOvary({ selectedId, onSelect }) {
  const { hoveredId } = useContext(FlowerInteractionContext);
  return <group position={[0, 0.5, 0]}>
    <mesh scale={[1.45, 1.95, 0.38]}>
      <sphereGeometry args={[1, 36, 26]} />
      <meshPhysicalMaterial color="#635454" roughness={0.78} />
    </mesh>
    <PartGroup id="ovule" selectedId={selectedId} onSelect={onSelect} position={[0.05, 0, 0.36]}>
      <mesh scale={[0.88, 1.48, 0.26]}>
        <sphereGeometry args={[1, 32, 22]} />
        <meshPhysicalMaterial color={hoveredId === "ovule" || selectedId === "ovule" ? "#c9e6a3" : "#a7c987"} roughness={0.42} />
      </mesh>
      <mesh position={[0, -0.53, 0.27]} scale={[0.45, 0.43, 0.17]}>
        <sphereGeometry args={[1, 22, 16]} />
        <meshPhysicalMaterial color="#e8d49b" roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.58, 0.43]} scale={[0.16, 0.17, 0.09]}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshBasicMaterial color="#de8c8b" />
      </mesh>
      {[-0.12, 0.12].map(x => <mesh key={x} position={[x, 0.12, 0.45]} scale={[0.08, 0.08, 0.06]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial color="#f0d977" />
      </mesh>)}
    </PartGroup>
  </group>;
}

function FlowerPlant({ selectedId, onSelect, viewMode, phase, phaseProgress, animate }) {
  const { hoveredId } = useContext(FlowerInteractionContext);
  const flowerRef = useRef(null);
  const ovaryForceCutaway = animate && phase === "fertilization";
  useFrame(({ clock }, delta) => {
    if (!flowerRef.current) return;
    const sway = animate ? Math.sin(clock.elapsedTime * 1.15) * 0.018 : 0;
    flowerRef.current.rotation.z = THREE.MathUtils.damp(flowerRef.current.rotation.z, sway, 3, delta);
  });
  const styleCurve = useMemo(() => makeCurve([[0, 1.34, 0], [0.015, 1.78, 0], [-0.005, 2.27, 0], [0, 2.65, 0]]), []);

  if (viewMode === "microscopic") return <MicroscopicOvary selectedId={selectedId} onSelect={onSelect} />;

  return <group ref={flowerRef}>
    <PartGroup id="receptacle" selectedId={selectedId} onSelect={onSelect}>
      <mesh position={[0, -0.68, 0]}>
        <cylinderGeometry args={[0.13, 0.23, 2.42, 24, 1]} />
        <meshPhysicalMaterial color={selectedId === "receptacle" ? "#b8ce7d" : hoveredId === "receptacle" ? "#81975c" : "#526f45"} roughness={0.68} />
      </mesh>
    </PartGroup>

    <PartGroup id="receptacle" selectedId={selectedId} onSelect={onSelect} position={[0, 0.5, 0]}>
      <mesh scale={[0.66, 0.25, 0.58]}>
        <sphereGeometry args={[1, 30, 22]} />
        <meshPhysicalMaterial color={selectedId === "receptacle" ? "#b8ce7d" : hoveredId === "receptacle" ? "#9cac65" : "#71824b"} roughness={0.55} />
      </mesh>
    </PartGroup>

    {Array.from({ length: 5 }, (_, index) => <FlowerPetal key={`sepal-${index}`} id="sepal" selectedId={selectedId} onSelect={onSelect} angle={index} sepal />)}
    {Array.from({ length: 6 }, (_, index) => <FlowerPetal key={`petal-${index}`} id="petal" selectedId={selectedId} onSelect={onSelect} angle={index} />)}

    <Ovary selectedId={selectedId} onSelect={onSelect} forceCutaway={ovaryForceCutaway} />
    <PartGroup id="style" selectedId={selectedId} onSelect={onSelect}>
      <mesh>
        <tubeGeometry args={[styleCurve, 28, 0.085, 12, false]} />
        <meshPhysicalMaterial color={selectedId === "style" ? "#d6e39d" : hoveredId === "style" ? "#b7c985" : "#83965a"} roughness={0.43} />
      </mesh>
    </PartGroup>
    <PartGroup id="stigma" selectedId={selectedId} onSelect={onSelect} position={[0, 2.75, 0]}>
      {[0, 1, 2].map(index => <mesh key={index} position={[Math.cos(index * Math.PI * 2 / 3) * 0.12, 0.025, Math.sin(index * Math.PI * 2 / 3) * 0.12]} rotation={[0.25, index * Math.PI * 2 / 3, 0.18]} scale={[0.12, 0.19, 0.13]}>
        <sphereGeometry args={[1, 20, 16]} />
        <meshPhysicalMaterial color={selectedId === "stigma" ? "#e3eab0" : hoveredId === "stigma" ? "#d2dda0" : "#a9b777"} roughness={0.48} />
      </mesh>)}
      <mesh position={[0, -0.1, 0]} scale={[0.17, 0.09, 0.17]}>
        <sphereGeometry args={[1, 20, 14]} />
        <meshStandardMaterial color="#bdc888" />
      </mesh>
    </PartGroup>

    {Array.from({ length: 6 }, (_, index) => <Anther key={`stamen-${index}`} angle={index} index={index} selectedId={selectedId} onSelect={onSelect} />)}
    <VascularBundles selectedId={selectedId} onSelect={onSelect} />

    {viewMode === "interface" && <PollinationPath />}
    {animate && <ReproductionAnimation phase={phase} phaseProgress={phaseProgress} />}
  </group>;
}

export default function FlowerModel({ selectedId, onSelect, viewMode = "overview", controlsRef, phase = "pollination", phaseProgress = 0, animate = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  const hoveredRef = useRef(null);
  const hideTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  const onPartHover = useCallback((id, point) => {
    window.clearTimeout(hideTimer.current);
    const next = { id, point: point.toArray(), fading: false };
    hoveredRef.current = next;
    setHoveredPart(next);
  }, []);
  const onPartLeave = useCallback(id => {
    const current = hoveredRef.current;
    if (!current || current.id !== id) return;
    const fading = { ...current, fading: true };
    hoveredRef.current = fading;
    setHoveredPart(fading);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (hoveredRef.current === fading) {
        hoveredRef.current = null;
        setHoveredPart(null);
      }
    }, 170);
  }, []);
  const interaction = useMemo(() => ({ hoveredId: hoveredPart?.id || null, onPartHover, onPartLeave }), [hoveredPart?.id, onPartHover, onPartLeave]);
  const hoverInfo = hoveredPart ? HOVER_INFO[hoveredPart.id] : null;

  return <>
    <hemisphereLight args={["#f5f4e8", "#24392b", 1.25]} />
    <ambientLight intensity={0.46} />
    <directionalLight position={[-4, 6, 7]} intensity={2.1} color="#fff1df" />
    <pointLight position={[3, 1.6, 4]} intensity={0.86} color="#f0b3a2" />
    <FlowerInteractionContext.Provider value={interaction}>
      <FlowerPlant selectedId={selectedId} onSelect={onSelect} viewMode={viewMode} phase={phase} phaseProgress={phaseProgress} animate={animate} />
      {hoveredPart && hoverInfo && <Html position={[hoveredPart.point[0], hoveredPart.point[1] + 0.2, hoveredPart.point[2]]} center distanceFactor={8} style={{ pointerEvents: "none" }}>
        <div className={`botany-hover-tooltip ${hoveredPart.fading ? "is-hiding" : ""}`} role="status"><strong>{hoverInfo[0]}</strong><span> · {hoverInfo[1]}</span></div>
      </Html>}
    </FlowerInteractionContext.Provider>
    <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.08} enablePan minDistance={4.7} maxDistance={15.5} target={[0, 0.45, 0]} />
  </>;
}
