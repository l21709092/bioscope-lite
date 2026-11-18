import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Dna, Waves } from "lucide-react";
import { structureCards } from "./molecularData";

function Bond({ start, end, color = "#c8d5e8", radius = 0.05 }) {
  const direction = new THREE.Vector3(...end).sub(new THREE.Vector3(...start));
  const center = new THREE.Vector3(...start).add(new THREE.Vector3(...end)).multiplyScalar(0.5);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  return <mesh position={center} quaternion={quaternion}>
    <cylinderGeometry args={[radius, radius, direction.length(), 8]} />
    <meshStandardMaterial color={color} />
  </mesh>;
}

function RNAScene({ folded }) {
  const positions = useMemo(() => Array.from({ length: 22 }, (_, index) => {
    const x = -2.8 + index * 0.27;
    const loop = folded && index > 5 && index < 17 ? Math.sin((index - 5) / 12 * Math.PI) * 1.1 : Math.sin(index * 0.72) * 0.36;
    const z = Math.cos(index * 0.58) * 0.45;
    return [x, loop, z];
  }), [folded]);
  return <group>
    {positions.map((position, index) => <group key={index}>
      <mesh position={position}><sphereGeometry args={[0.105, 12, 10]} /><meshStandardMaterial color={index % 4 === 0 ? "#f2c46c" : "#62d5be"} /></mesh>
      {index < positions.length - 1 && <Bond start={position} end={positions[index + 1]} color="#71a9a9" radius={0.035} />}
    </group>)}
    <Html position={[0, 1.75, 0]} center distanceFactor={8}><span className="mb-scene-tag">SINGLE RNA STRAND · FOLDING</span></Html>
    <Html position={[-2.5, -1.5, 0]} center distanceFactor={8}><span className="mb-scene-tag">RIBOSE + URACIL (U)</span></Html>
  </group>;
}

function RibosomeScene({ activeSite }) {
  return <group>
    <mesh position={[0, 0.55, -0.15]} scale={[1.65, 0.72, 0.64]}><sphereGeometry args={[1, 32, 24]} /><meshPhysicalMaterial color="#ad91d4" roughness={0.5} transparent opacity={0.78} /></mesh>
    <mesh position={[0, -0.45, -0.1]} scale={[1.2, 0.38, 0.5]}><sphereGeometry args={[1, 30, 20]} /><meshPhysicalMaterial color="#73c8ad" roughness={0.5} transparent opacity={0.78} /></mesh>
    <Bond start={[-3.1, -0.1, 0.25]} end={[3.1, -0.1, 0.25]} color="#67d2c1" radius={0.095} />
    {[-1, 0, 1].map((site, index) => <group key={site} position={[site * 0.77, 0.35, 0.7]}>
      <mesh position={[0, -0.15, 0]}><torusGeometry args={[0.28, activeSite === index ? 0.075 : 0.04, 8, 24]} /><meshStandardMaterial color={activeSite === index ? "#ffe08c" : "#9fb7d0"} emissive={activeSite === index ? "#86601d" : "#000000"} emissiveIntensity={0.25} /></mesh>
      <Bond start={[0, -0.1, 0]} end={[0, 0.7, 0]} color="#f1cc74" radius={0.06} />
      <Bond start={[0, 0.7, 0]} end={[-0.24, 1.02, 0]} color="#f1cc74" radius={0.06} />
      <Bond start={[0, 0.7, 0]} end={[0.24, 1.02, 0]} color="#f1cc74" radius={0.06} />
      {activeSite === index && <mesh position={[0.36, 1.12, 0]}><sphereGeometry args={[0.14, 14, 12]} /><meshStandardMaterial color="#73e0b2" /></mesh>}
    </group>)}
    <Html position={[0, 1.7, 0.4]} center distanceFactor={8}><span className="mb-scene-tag">LARGE SUBUNIT</span></Html>
    <Html position={[0, -1.05, 0.3]} center distanceFactor={8}><span className="mb-scene-tag">SMALL SUBUNIT · mRNA</span></Html>
    <Html position={[0, 1.18, 1.2]} center distanceFactor={8}><span className="mb-scene-tag">A · P · E SITES</span></Html>
  </group>;
}

function ATPScene({ spinning }) {
  const rotor = useRef(null);
  useFrame((_, delta) => { if (rotor.current && spinning) rotor.current.rotation.y += delta * 1.7; });
  return <group>
    <mesh position={[0, 0, 0]} scale={[0.55, 0.72, 0.55]}><cylinderGeometry args={[1, 1, 2.5, 32]} /><meshPhysicalMaterial color="#6aa8d4" transparent opacity={0.55} /></mesh>
    <group ref={rotor}>
      <mesh position={[0, 0, 0.55]}><cylinderGeometry args={[0.17, 0.17, 2.4, 18]} /><meshStandardMaterial color="#f2c471" metalness={0.2} roughness={0.3} /></mesh>
      {[0, 1, 2].map(index => <mesh key={index} position={[Math.cos(index * Math.PI * 2 / 3) * 0.67, 1.4, Math.sin(index * Math.PI * 2 / 3) * 0.67]} scale={[0.52, 0.46, 0.48]}><sphereGeometry args={[1, 20, 16]} /><meshPhysicalMaterial color={["#b190db", "#68c8aa", "#e99478"][index]} roughness={0.42} /></mesh>)}
    </group>
    {[-1, 1].map(side => <mesh key={side} position={[side * 1.18, -0.2, 0]}><boxGeometry args={[0.18, 2.3, 1.1]} /><meshStandardMaterial color="#6a80a1" transparent opacity={0.64} /></mesh>)}
    <Html position={[0, 2.15, 0.3]} center distanceFactor={8}><span className="mb-scene-tag">F₁ CATALYTIC HEAD</span></Html>
    <Html position={[0, -1.75, 0.3]} center distanceFactor={8}><span className="mb-scene-tag">F₀ MEMBRANE ROTOR</span></Html>
    <Html position={[-2.1, 0, 0.2]} center distanceFactor={8}><span className="mb-scene-tag">H⁺ GRADIENT</span></Html>
  </group>;
}

function MembraneScene({ highlight }) {
  const lipids = Array.from({ length: 11 }, (_, index) => -2.9 + index * 0.58);
  return <group>
    <mesh position={[0, 0, -0.65]}><boxGeometry args={[7.2, 1.12, 0.08]} /><meshPhysicalMaterial color="#315f7c" transparent opacity={0.2} /></mesh>
    {lipids.map(x => <group key={x}>
      {[-0.72, 0.72].map(y => <group key={y} position={[x, y, 0]}>
        <mesh><sphereGeometry args={[0.18, 14, 12]} /><meshStandardMaterial color={highlight === "heads" ? "#fff09a" : "#68c9c0"} emissive={highlight === "heads" ? "#665522" : "#000000"} emissiveIntensity={0.2} /></mesh>
        {[-1, 1].map(side => <Bond key={side} start={[0, side * 0.12, 0]} end={[side * 0.16, -side * 0.55, 0]} color={highlight === "tails" ? "#f5ae68" : "#82a6c5"} radius={0.045} />)}
      </group>)}
    </group>)}
    <Html position={[0, 1.45, 0]} center distanceFactor={8}><span className="mb-scene-tag">WATER · HYDROPHILIC HEADS</span></Html>
    <Html position={[0, 0, 0.3]} center distanceFactor={8}><span className="mb-scene-tag">HYDROPHOBIC CORE</span></Html>
    <Html position={[0, -1.45, 0]} center distanceFactor={8}><span className="mb-scene-tag">WATER · HYDROPHILIC HEADS</span></Html>
  </group>;
}

function StructureScene({ id, folded, activeSite, spinning, highlight }) {
  return <>
    <hemisphereLight args={["#dcecff", "#263347", 1.2]} />
    <ambientLight intensity={0.5} />
    <directionalLight position={[-3, 4, 6]} intensity={1.8} color="#fff0dc" />
    {id === "rna" ? <RNAScene folded={folded} /> : id === "ribosome" ? <RibosomeScene activeSite={activeSite} /> : id === "atp" ? <ATPScene spinning={spinning} /> : <MembraneScene highlight={highlight} />}
  </>;
}

const structureLearning = {
  rna: { title: "RNA: a flexible message and tool", simple: "RNA is usually single-stranded. It can carry instructions, help build proteins, or perform other jobs in a cell.", science: "RNA contains ribose and uses uracil. Its sequence can fold through complementary pairing into stems, loops and other secondary structures.", cues: ["Single strand", "Folded hairpin", "Uracil base"] },
  ribosome: { title: "Ribosome: a protein-building machine", simple: "The ribosome reads an mRNA message. Matching tRNAs bring amino acids, which the ribosome joins into a chain.", science: "The ribosome is a ribonucleoprotein complex. The small subunit decodes mRNA; the large subunit catalyzes peptide-bond formation.", cues: ["A site · accept", "P site · hold chain", "E site · exit"] },
  atp: { title: "ATP synthase: a rotary enzyme", simple: "A flow of protons turns part of this enzyme. The rotation helps the other part make ATP, a cell’s usable energy carrier.", science: "Proton-motive force drives rotation of the F₀ motor and central stalk, which changes catalytic conformations in F₁ and supports ATP synthesis.", cues: ["Proton gradient", "Rotor turns", "ATP is formed"] },
  membrane: { title: "Cell membrane: a selective boundary", simple: "Phospholipids line up in two layers. Their water-friendly heads face outward and their water-avoiding tails point inward.", science: "Amphipathic phospholipids form a bilayer with a hydrophobic interior. Proteins, sterols and carbohydrates add transport, signalling and structural functions.", cues: ["Hydrophilic heads", "Hydrophobic tails", "Bilayer"] }
};

export default function StructureLibrary({ searchQuery = "", initialId = "rna", onOpenDNA, onSelectStructure, onComplete }) {
  const [structureId, setStructureId] = useState(initialId === "dna" ? "rna" : initialId);
  const [folded, setFolded] = useState(false);
  const [activeSite, setActiveSite] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [highlight, setHighlight] = useState("heads");
  const [activeCue, setActiveCue] = useState(0);
  const available = structureCards.filter(item => item.id !== "dna");
  const filtered = available.filter(item => `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(searchQuery.toLowerCase()));
  const current = structureLearning[structureId];
  const choose = id => {
    if (id === "dna") { onOpenDNA?.(); return; }
    setStructureId(id);
    onSelectStructure?.(id);
    setActiveCue(0);
    setFolded(false);
    setActiveSite(1);
    setSpinning(false);
    setHighlight("heads");
    onComplete?.(`structure-${id}`);
  };

  return <section className="mb-card structure-library">
    <div className="mb-panel-heading"><div><span className="mb-kicker">MOLECULAR STRUCTURE LIBRARY</span><h2>Choose a structure to explore</h2></div></div>
    <div className="mb-library-layout">
      <div className="mb-library-list">
        {filtered.map(item => <button key={item.id} className={structureId === item.id ? "active" : ""} onClick={() => choose(item.id)} aria-pressed={structureId === item.id}>
          <span className="mb-library-swatch" style={{ "--structure-accent": item.accent }} />
          <span><strong>{item.name}</strong><small>{item.category}</small><em>{item.description}</em></span>
        </button>)}
        {filtered.length === 0 && <p className="mb-empty-search">No molecular structures match that search.</p>}
        <button className="mb-library-dna-link" onClick={() => onOpenDNA?.()}><Dna size={16} />Open experimental DNA structure</button>
      </div>
      <div className="mb-library-detail">
        {current && <>
          <div className={`mb-structure-canvas ${structureId}`}>
            <Canvas className="mb-structure-canvas-inner" camera={{ position: [0, 0, 8], fov: 38 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
              <StructureScene id={structureId} folded={folded} activeSite={activeSite} spinning={spinning} highlight={highlight} />
              <OrbitControls enableDamping dampingFactor={0.08} minDistance={5} maxDistance={12} enablePan={false} />
            </Canvas>
          </div>
          <div className="mb-structure-detail-heading"><span className="mb-kicker">{structureCards.find(item => item.id === structureId)?.category.toUpperCase()}</span><h3>{current.title}</h3><p>{current.simple}</p><details><summary>Science behind it</summary><p>{current.science}</p></details></div>
          <div className="mb-structure-cues" role="group" aria-label={`${structureCards.find(item => item.id === structureId)?.name} visual controls`}>
            {current.cues.map((cue, index) => <button key={cue} className={index === activeCue ? "active" : ""} onClick={() => {
              setActiveCue(index);
              if (structureId === "rna") setFolded(index === 1);
              if (structureId === "ribosome") setActiveSite(index);
              if (structureId === "atp") setSpinning(index > 0);
              if (structureId === "membrane") setHighlight(index === 1 ? "tails" : "heads");
            }} aria-pressed={index === activeCue}><Waves size={14} />{cue}</button>)}
            {structureId === "atp" && <button onClick={() => setSpinning(value => !value)}>{spinning ? "Pause rotor" : "Spin rotor"}</button>}
          </div>
          <p className="mb-structure-note">Illustrative teaching schematic, not an experimentally deposited atomic-coordinate model.</p>
          {structureId === "atp" && <p className="mb-structure-note">The rotor animation does not calculate proton flow or molecular forces.</p>}
        </>}
      </div>
    </div>
  </section>;
}
