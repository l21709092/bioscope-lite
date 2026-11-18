import { useEffect, useMemo, useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const LUNG_PARTS = {
  rightLung: { id: "lung_right", label: "Right lung", role: "The larger lung has three lobes: upper, middle and lower." },
  rightUpper: { id: "lung_right_upper_lobe", label: "Right upper lobe", role: "The upper lobe expands as the chest cavity grows during inhalation." },
  rightMiddle: { id: "lung_right_middle_lobe", label: "Right middle lobe", role: "The right middle lobe lies between the horizontal and oblique fissures." },
  rightLower: { id: "lung_right_lower_lobe", label: "Right lower lobe", role: "The lower lobe rests above the diaphragm and receives air through smaller bronchi." },
  leftLung: { id: "lung_left", label: "Left lung", role: "The left lung has two lobes and a cardiac notch that leaves room for the heart." },
  leftUpper: { id: "lung_left_upper_lobe", label: "Left upper lobe", role: "The upper lobe surrounds the cardiac notch and receives air from the left bronchus." },
  leftLower: { id: "lung_left_lower_lobe", label: "Left lower lobe", role: "The lower lobe rests above the diaphragm and expands during inhalation." },
  trachea: { id: "lung_trachea", label: "Trachea", role: "Rings of cartilage keep this main airway open as air travels to the bronchi." },
  bronchi: { id: "lung_bronchi", label: "Primary bronchi", role: "The trachea divides into two bronchi that carry air into the right and left lungs." },
  bronchioles: { id: "lung_bronchioles", label: "Bronchioles", role: "Small branching airways distribute air toward the alveolar sacs." },
  diaphragm: { id: "lung_diaphragm", label: "Diaphragm", role: "This muscle contracts downward to increase chest volume during inhalation." },
  alveoli: { id: "lung_alveoli", label: "Alveoli", role: "Thin air sacs exchange oxygen and carbon dioxide by diffusion." },
};

function makeLungShape(isLeft) {
  const shape = new THREE.Shape();
  if (isLeft) {
    shape.moveTo(-0.12, 0.57);
    shape.bezierCurveTo(-0.48, 0.49, -0.54, 0.16, -0.45, -0.18);
    shape.bezierCurveTo(-0.39, -0.47, -0.18, -0.6, 0.12, -0.58);
    shape.bezierCurveTo(0.37, -0.55, 0.46, -0.25, 0.4, 0.08);
    shape.bezierCurveTo(0.37, 0.26, 0.28, 0.41, 0.14, 0.52);
    shape.bezierCurveTo(0.06, 0.58, -0.03, 0.59, -0.12, 0.57);
  } else {
    shape.moveTo(-0.13, 0.58);
    shape.bezierCurveTo(-0.43, 0.52, -0.55, 0.25, -0.51, -0.12);
    shape.bezierCurveTo(-0.48, -0.47, -0.22, -0.62, 0.1, -0.59);
    shape.bezierCurveTo(0.4, -0.56, 0.48, -0.22, 0.42, 0.15);
    shape.bezierCurveTo(0.37, 0.43, 0.16, 0.59, -0.13, 0.58);
  }
  return shape;
}

function LungShape({ isLeft, breathing, xray, onSelectPart, part, selectedPart, onHoverPart, onLeave }) {
  const geometry = useMemo(() => {
    const result = new THREE.ExtrudeGeometry(makeLungShape(isLeft), {
      depth: 0.22,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.035,
      bevelThickness: 0.025,
      curveSegments: 20,
    });
    result.translate(0, 0, -0.11);
    return result;
  }, [isLeft]);
  const groupRef = useRef(null);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const autonomousCycle = (_.clock.elapsedTime % 4) / 4;
    const autonomousBreath = autonomousCycle < 0.38 ? Math.sin((autonomousCycle / 0.38) * Math.PI) : 0;
    const expansion = 1 + (breathing ?? autonomousBreath) * 0.055;
    groupRef.current.scale.x = THREE.MathUtils.damp(groupRef.current.scale.x, expansion, 5, delta);
    groupRef.current.scale.y = THREE.MathUtils.damp(groupRef.current.scale.y, expansion, 5, delta);
  });

  return (
    <group ref={groupRef}>
      <mesh
        geometry={geometry}
        onClick={(event) => { event.stopPropagation(); onSelectPart(part.id); }}
        onPointerOver={(event) => { event.stopPropagation(); onHoverPart(part, event.point); }}
        onPointerOut={() => onLeave(part.id)}
      >
        <meshStandardMaterial
          color={selectedPart === part.id ? "#5eead4" : isLeft ? "#b95568" : "#c55b6a"}
          roughness={0.58}
          metalness={0.01}
          transparent={xray}
          opacity={xray ? 0.22 : 1}
          depthWrite={!xray}
          side={THREE.DoubleSide}
        />
      </mesh>
      {isLeft ? (
        <mesh position={[0.02, 0.02, 0.126]} rotation={[0, 0, -0.62]}>
          <boxGeometry args={[0.86, 0.012, 0.01]} />
          <meshBasicMaterial color="#743d50" transparent opacity={0.72} depthWrite={false} />
        </mesh>
      ) : (
        <>
          <mesh position={[0, 0.13, 0.126]}>
            <boxGeometry args={[0.84, 0.012, 0.01]} />
            <meshBasicMaterial color="#743d50" transparent opacity={0.72} depthWrite={false} />
          </mesh>
          <mesh position={[0, -0.02, 0.127]} rotation={[0, 0, -0.7]}>
            <boxGeometry args={[0.88, 0.012, 0.01]} />
            <meshBasicMaterial color="#743d50" transparent opacity={0.72} depthWrite={false} />
          </mesh>
        </>
      )}
      {(isLeft
        ? [
            { ...LUNG_PARTS.leftUpper, position: [-0.04, 0.25, 0.17] },
            { ...LUNG_PARTS.leftLower, position: [-0.02, -0.27, 0.17] },
          ]
        : [
            { ...LUNG_PARTS.rightUpper, position: [-0.04, 0.3, 0.17] },
            { ...LUNG_PARTS.rightMiddle, position: [-0.02, 0.02, 0.17] },
            { ...LUNG_PARTS.rightLower, position: [-0.01, -0.31, 0.17] },
          ]).map((lobe) => (
            <mesh
              key={lobe.id}
              position={lobe.position}
              onClick={(event) => { event.stopPropagation(); onSelectPart(lobe.id); }}
              onPointerOver={(event) => { event.stopPropagation(); onHoverPart(lobe, event.point); }}
              onPointerOut={() => onLeave(lobe.id)}
            >
              <sphereGeometry args={[0.18, 16, 12]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          ))}
    </group>
  );
}

function Airway({ points, radius, part, onSelectPart, onHoverPart, onLeave, active }) {
  const pointKey = points.map((point) => point.join(",")).join(";");
  const stablePoints = useMemo(() => pointKey.split(";").map((point) => point.split(",").map(Number)), [pointKey]);
  const geometry = useMemo(() => {
    const path = new THREE.CatmullRomCurve3(stablePoints.map((point) => new THREE.Vector3(...point)));
    return new THREE.TubeGeometry(path, 28, radius, 8, false);
  }, [stablePoints, radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh
      geometry={geometry}
      onClick={(event) => { event.stopPropagation(); onSelectPart(part.id); }}
      onPointerOver={(event) => { event.stopPropagation(); onHoverPart(part, event.point); }}
      onPointerOut={() => onLeave(part.id)}
    >
      <meshStandardMaterial color={active ? "#f6d9bd" : "#d4ad91"} roughness={0.4} />
    </mesh>
  );
}

function GasExchangeDetail({ onSelectPart, selectedPart, onHoverPart, onLeave, progress, labels }) {
  const alveoli = [[-0.2, 0.1, 0], [0.05, 0.22, 0.04], [0.28, 0.09, 0.02], [-0.05, -0.12, -0.02], [0.21, -0.17, 0.03]];
  const capillary = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.52, -0.26, 0.1), new THREE.Vector3(-0.42, 0.28, 0.12),
      new THREE.Vector3(0.1, 0.42, 0.14), new THREE.Vector3(0.52, 0.18, 0.12),
      new THREE.Vector3(0.49, -0.28, 0.1), new THREE.Vector3(0.05, -0.42, 0.1),
      new THREE.Vector3(-0.52, -0.26, 0.1),
    ]);
    return new THREE.TubeGeometry(curve, 80, 0.035, 8, false);
  }, []);
  const transfer = progress % 1;
  const oxygenPosition = [-0.06 + Math.sin(transfer * Math.PI * 2) * 0.08, 0.22 - transfer * 0.28, 0.24];
  const carbonPosition = [0.2 + Math.sin(transfer * Math.PI * 2 + 1) * 0.06, -0.16 + transfer * 0.34, 0.25];

  useEffect(() => () => capillary.dispose(), [capillary]);

  return (
    <group position={[0.15, 0, 0.28]}>
      <mesh geometry={capillary}><meshStandardMaterial color="#a33e59" roughness={0.46} /></mesh>
      {[0, 1, 2, 3].map((index) => {
        const position = [-0.32 + ((transfer + index / 4) % 1) * 0.64, -0.08 + index % 2 * 0.16, 0.17];
        return (
          <mesh key={`rbc-${index}`} position={position} scale={[1.45, 0.8, 0.55]}>
            <sphereGeometry args={[0.055, 14, 10]} />
            <meshStandardMaterial color={index < 2 ? "#a92742" : "#ce344c"} roughness={0.48} />
          </mesh>
        );
      })}
      {alveoli.map((position, index) => (
        <mesh
          key={index}
          position={position}
          onClick={(event) => { event.stopPropagation(); onSelectPart(LUNG_PARTS.alveoli.id); }}
          onPointerOver={(event) => { event.stopPropagation(); onHoverPart(LUNG_PARTS.alveoli, event.point); }}
          onPointerOut={() => onLeave(LUNG_PARTS.alveoli.id)}
        >
          <sphereGeometry args={[0.17, 20, 16]} />
          <meshStandardMaterial color={selectedPart === LUNG_PARTS.alveoli.id ? "#5eead4" : "#f29a9c"} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={oxygenPosition}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={carbonPosition}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      {labels && <>
        <Html position={[-0.52, 0.5, 0.2]} center><span className="lung-gas-label oxygen">O₂ → blood</span></Html>
        <Html position={[0.48, -0.47, 0.2]} center><span className="lung-gas-label carbon">CO₂ → alveolus</span></Html>
      </>}
    </group>
  );
}

export default function LungAnatomyModel({
  onHoverPart = () => {},
  onSelectPart = () => {},
  selectedPart = null,
  mode = "overview",
  breath = 0,
  progress = 0,
  xray = false,
  labels = true,
}) {
  const isGasExchange = mode === "gas-exchange";
  const airwayActive = mode === "airways";
  const hovering = useRef(null);
  const diaphragmRef = useRef(null);
  useFrame((state) => {
    if (!diaphragmRef.current) return;
    const cycle = (state.clock.elapsedTime % 4) / 4;
    const animatedBreath = cycle < 0.38 ? Math.sin((cycle / 0.38) * Math.PI) : 0;
    diaphragmRef.current.position.y = -0.56 - (breath ?? animatedBreath) * 0.09;
  });
  const onHover = (part, point) => {
    hovering.current = part.id;
    onHoverPart({ name: part.id, label: part.label, role: part.role, system: "Respiratory System", color: "#f59eaa", point: [point.x, point.y, point.z] });
  };
  const onLeave = (id) => {
    if (hovering.current !== id) return;
    hovering.current = null;
    onHoverPart(null);
  };

  return (
    <group>
      {!isGasExchange && (
        <>
          <group position={[-1.05, 0.06, 0.03]}>
            <LungShape isLeft={false} breathing={breath} xray={xray} part={LUNG_PARTS.rightLung} selectedPart={selectedPart} onSelectPart={onSelectPart} onHoverPart={onHover} onLeave={onLeave} />
          </group>
          <group position={[1.05, 0.06, 0.03]}>
            <LungShape isLeft breathing={breath} xray={xray} part={LUNG_PARTS.leftLung} selectedPart={selectedPart} onSelectPart={onSelectPart} onHoverPart={onHover} onLeave={onLeave} />
          </group>
          <group>
            <Airway points={[[0, 0.78, 0.2], [0, 0.15, 0.2]]} radius={0.075} part={LUNG_PARTS.trachea} active={airwayActive} onSelectPart={onSelectPart} onHoverPart={onHover} onLeave={onLeave} />
            <Airway points={[[0, 0.16, 0.2], [-0.48, 0.05, 0.2], [-0.84, -0.06, 0.2]]} radius={0.045} part={LUNG_PARTS.bronchi} active={airwayActive} onSelectPart={onSelectPart} onHoverPart={onHover} onLeave={onLeave} />
            <Airway points={[[0, 0.16, 0.2], [0.48, 0.05, 0.2], [0.84, -0.06, 0.2]]} radius={0.045} part={LUNG_PARTS.bronchi} active={airwayActive} onSelectPart={onSelectPart} onHoverPart={onHover} onLeave={onLeave} />
            {[-1, 1].flatMap((sign) => [0, 1, 2].map((index) => (
              <Airway key={`${sign}-${index}`} points={[[sign * (0.46 + index * 0.04), 0.04 - index * 0.14, 0.19], [sign * (0.67 + index * 0.06), -0.1 - index * 0.14, 0.19]]} radius={0.018} part={LUNG_PARTS.bronchioles} active={airwayActive} onSelectPart={onSelectPart} onHoverPart={onHover} onLeave={onLeave} />
            )))}
          </group>
          <group
            ref={diaphragmRef}
            position={[0, -0.56, 0.01]}
            onClick={(event) => { event.stopPropagation(); onSelectPart(LUNG_PARTS.diaphragm.id); }}
            onPointerOver={(event) => { event.stopPropagation(); onHover(LUNG_PARTS.diaphragm, event.point); }}
            onPointerOut={() => onLeave(LUNG_PARTS.diaphragm.id)}
          >
            <mesh scale={[1.04, 0.11, 0.32]}>
              <sphereGeometry args={[0.72, 32, 18]} />
              <meshStandardMaterial color={selectedPart === LUNG_PARTS.diaphragm.id ? "#5eead4" : "#dbac84"} roughness={0.64} />
            </mesh>
          </group>
        </>
      )}
      {isGasExchange && (
        <GasExchangeDetail onSelectPart={onSelectPart} selectedPart={selectedPart} onHoverPart={onHover} onLeave={onLeave} progress={progress} labels={labels} />
      )}
    </group>
  );
}

