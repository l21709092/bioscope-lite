import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

const processInfo = {
  replication: {
    name: "DNA replication",
    steps: [
      ["Unwind the helix", "A molecular zipper begins to open the DNA ladder.", "Helicase separates the parental strands at a replication fork."],
      ["Separate the strands", "Each old strand is exposed so it can guide a new partner.", "Single-strand binding proteins stabilize unwound template DNA."],
      ["Place a primer", "A short starter gives the copying enzyme a place to begin.", "Primase synthesizes an RNA primer that provides a free 3′-OH group."],
      ["Polymerase moves", "DNA polymerase travels along each template strand.", "DNA polymerases extend a primer in the 5′ to 3′ direction."],
      ["Add matching letters", "Free nucleotides pair with the exposed template bases.", "Complementary dNTPs are incorporated; the lagging strand is made in Okazaki fragments."],
      ["Two DNA molecules", "Each finished helix contains one old strand and one new strand.", "Replication is semiconservative: each daughter duplex contains one parental and one newly synthesized strand."]
    ]
  },
  transcription: {
    name: "Transcription",
    steps: [
      ["Bind the DNA", "RNA polymerase finds a start region and attaches to DNA.", "RNA polymerase and transcription factors recognize a promoter."],
      ["Open a small window", "The enzyme opens only a short section of the DNA ladder.", "A transcription bubble exposes the template strand while the rest of the duplex remains paired."],
      ["Build an RNA copy", "RNA letters pair with the DNA template; RNA uses U instead of T.", "RNA polymerase synthesizes RNA 5′ to 3′, complementary to the DNA template strand."],
      ["Release the transcript", "The RNA message separates, and the DNA strands close again.", "After termination, the transcript is released and the DNA duplex re-anneals."]
    ]
  },
  translation: {
    name: "Translation",
    steps: [
      ["Bind the message", "The ribosome attaches to an mRNA strand.", "The small ribosomal subunit binds mRNA and positions the start codon."],
      ["Read a codon", "The ribosome reads mRNA three letters at a time.", "Each codon is a three-nucleotide unit that specifies an amino acid or stop signal."],
      ["Match a tRNA", "A tRNA with a matching three-letter anticodon docks on the mRNA.", "Codon–anticodon pairing positions an aminoacyl-tRNA in the ribosomal A site."],
      ["Deliver an amino acid", "The tRNA brings the amino acid named by that codon.", "A charged tRNA delivers its amino acid to the ribosomal active site."],
      ["Join the chain", "The ribosome links the new amino acid to the growing chain.", "Peptidyl transferase activity in the large subunit forms the peptide bond."],
      ["Move to the next codon", "The ribosome advances and the growing protein chain gets longer.", "Translocation moves the ribosome by one codon; tRNAs shift through the A, P and E sites."]
    ]
  }
};

const colorByBase = { A: "#40b8e6", T: "#f5a64e", G: "#a58cf5", C: "#66d39b", U: "#f1d469" };
const smooth = value => THREE.MathUtils.smoothstep(value, 0, 1);

function Rod({ start, end, color = "#b7cbe0", radius = 0.045, opacity = 1 }) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const length = Math.hypot(dx, dy);
  return <mesh position={[(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2]} rotation={[0, 0, -Math.atan2(dx, dy)]}>
    <cylinderGeometry args={[radius, radius, length, 8]} />
    <meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} />
  </mesh>;
}

function ReplicationScene({ stage, progress }) {
  const phase = Math.min(1, (stage + progress) / 6);
  const fork = THREE.MathUtils.lerp(-2.5, 2.5, phase);
  const bases = "ATGCCGTA";
  return <group>
    {Array.from({ length: 9 }, (_, index) => {
      const x = -3.1 + index * 0.78;
      const open = smooth((x - fork + 0.7) / 1.35);
      const split = open * 0.76;
      const pair = bases[index % bases.length];
      const partner = ({ A: "T", T: "A", G: "C", C: "G" })[pair];
      return <group key={index}>
        <mesh position={[x, 0.25 + split, 0]}><sphereGeometry args={[0.1, 12, 10]} /><meshStandardMaterial color="#67a7ff" /></mesh>
        <mesh position={[x, -0.25 - split, 0]}><sphereGeometry args={[0.1, 12, 10]} /><meshStandardMaterial color="#58d4bd" /></mesh>
        {open < 0.64 && <>
          <Rod start={[x, 0.15 + split, 0]} end={[x, -0.15 - split, 0]} color="#d0dced" opacity={1 - open} />
          <mesh position={[x, 0, 0.08]}><boxGeometry args={[0.2, 0.13, 0.08]} /><meshStandardMaterial color={colorByBase[pair]} transparent opacity={1 - open} /></mesh>
          <mesh position={[x, 0, -0.08]}><boxGeometry args={[0.2, 0.13, 0.08]} /><meshStandardMaterial color={colorByBase[partner]} transparent opacity={1 - open} /></mesh>
        </>}
        {open > 0.2 && index < phase * 8 && <>
          <Rod start={[x, 0.25 + split, 0]} end={[x, 0.63 + split, 0]} color="#85e2b2" radius={0.035} opacity={open} />
          <Rod start={[x, -0.25 - split, 0]} end={[x, -0.63 - split, 0]} color="#83c6ff" radius={0.035} opacity={open} />
        </>}
      </group>;
    })}
    <mesh position={[fork, 0, 0.2]}><octahedronGeometry args={[0.3, 1]} /><meshStandardMaterial color="#f2c56d" emissive="#76582a" emissiveIntensity={0.35} /></mesh>
    <Html position={[fork, 0.55, 0.2]} center distanceFactor={8}><span className="mb-scene-tag">HELICASE / REPLICATION FORK</span></Html>
    {stage >= 2 && <Html position={[-1.8, -1.35, 0.2]} center distanceFactor={8}><span className="mb-scene-tag">RNA PRIMER</span></Html>}
    {stage >= 3 && <>
      <mesh position={[fork - 0.35, 0.85, 0.25]}><sphereGeometry args={[0.22, 16, 12]} /><meshStandardMaterial color="#79dfac" emissive="#2d7657" emissiveIntensity={0.3} /></mesh>
      <mesh position={[fork - 0.35, -0.85, 0.25]}><sphereGeometry args={[0.22, 16, 12]} /><meshStandardMaterial color="#79dfac" emissive="#2d7657" emissiveIntensity={0.3} /></mesh>
      <Html position={[fork - 0.35, 1.22, 0.25]} center distanceFactor={8}><span className="mb-scene-tag">DNA POLYMERASE</span></Html>
    </>}
    {stage >= 4 && Array.from({ length: 7 }, (_, index) => <mesh key={index} position={[1.5 + index % 3 * 0.35, (index % 2 ? 1 : -1) * (0.95 + (index % 3) * 0.17), 0.2]}>
      <sphereGeometry args={[0.075, 10, 8]} /><meshStandardMaterial color={colorByBase["ATGC"[index % 4]]} emissive={colorByBase["ATGC"[index % 4]]} emissiveIntensity={0.2} />
    </mesh>)}
    <Html position={[0, -1.85, 0]} center distanceFactor={9}><span className="mb-scene-tag">PARENTAL STRANDS · NEW COMPLEMENTARY DNA</span></Html>
  </group>;
}

function TranscriptionScene({ stage, progress }) {
  const phase = Math.min(1, (stage + progress) / 4);
  const enzymeX = THREE.MathUtils.lerp(-2.3, 2.1, phase);
  const templateLength = THREE.MathUtils.lerp(0.5, 4.5, phase);
  return <group>
    <Rod start={[-3.2, 0.58, 0]} end={[3.2, 0.58, 0]} color="#73a1ff" radius={0.08} />
    <Rod start={[-3.2, -0.58, 0]} end={[3.2, -0.58, 0]} color="#58d1ba" radius={0.08} />
    {Array.from({ length: 9 }, (_, index) => {
      const x = -2.8 + index * 0.7;
      const window = Math.abs(x - enzymeX) < 0.8;
      return <group key={index}>
        {!window && <Rod start={[x, 0.52, 0]} end={[x, -0.52, 0]} color="#bdcbe0" opacity={0.8} />}
        {window && <>
          <mesh position={[x, 0.53, 0]}><sphereGeometry args={[0.09, 10, 8]} /><meshStandardMaterial color="#73a1ff" /></mesh>
          <mesh position={[x, -0.53, 0]}><sphereGeometry args={[0.09, 10, 8]} /><meshStandardMaterial color="#58d1ba" /></mesh>
        </>}
      </group>;
    })}
    <mesh position={[enzymeX, 0, 0.15]}><torusGeometry args={[0.67, 0.17, 12, 28]} /><meshStandardMaterial color="#f2a866" emissive="#754621" emissiveIntensity={0.24} /></mesh>
    <Html position={[enzymeX, 1.02, 0.2]} center distanceFactor={8}><span className="mb-scene-tag">RNA POLYMERASE</span></Html>
    {stage >= 2 && Array.from({ length: Math.max(2, Math.ceil(templateLength * 1.3)) }, (_, index) => {
      const x = enzymeX - 0.35 - index * 0.3;
      return <group key={index}>
        <mesh position={[x, -1.05 - Math.sin(index * 0.5) * 0.11, 0.28]}><sphereGeometry args={[0.11, 12, 10]} /><meshStandardMaterial color={colorByBase["AUGCU"[index % 5]]} emissive="#357a74" emissiveIntensity={0.18} /></mesh>
      </group>;
    })}
    {stage === 1 && <Html position={[0, -1.5, 0.2]} center distanceFactor={8}><span className="mb-scene-tag">LOCAL DNA OPENING</span></Html>}
    {stage >= 2 && <Html position={[-2.8, -1.55, 0.2]} center distanceFactor={8}><span className="mb-scene-tag">GROWING RNA TRANSCRIPT · U REPLACES T</span></Html>}
  </group>;
}

function TranslationScene({ stage, progress }) {
  const phase = Math.min(1, (stage + progress) / 6);
  const codons = ["AUG", "GGC", "UAC", "CGA", "UAA"];
  const chainLength = stage < 2 ? 1 : Math.min(5, stage + (progress > 0.5 ? 1 : 0));
  return <group>
    <mesh position={[0, 0.45, -0.15]} scale={[1.85, 0.78, 0.58]}><sphereGeometry args={[1, 30, 22]} /><meshPhysicalMaterial color="#a38bd3" roughness={0.5} transparent opacity={0.78} /></mesh>
    <mesh position={[0, -0.5, -0.1]} scale={[1.35, 0.43, 0.48]}><sphereGeometry args={[1, 28, 20]} /><meshPhysicalMaterial color="#7bcaaf" roughness={0.48} transparent opacity={0.72} /></mesh>
    <Rod start={[-3.3, -0.16, 0.25]} end={[3.3, -0.16, 0.25]} color="#67cabc" radius={0.1} />
    {codons.map((codon, index) => <group key={codon} position={[-2.25 + index * 1.1, -0.16, 0.36]}>
      {codon.split("").map((base, letter) => <mesh key={letter} position={[(letter - 1) * 0.2, 0, 0]}><sphereGeometry args={[0.09, 10, 8]} /><meshStandardMaterial color={colorByBase[base]} /></mesh>)}
      <Html position={[0, -0.39, 0]} center distanceFactor={9}><span className="mb-scene-tag mb-codon-tag">{codon}</span></Html>
    </group>)}
    {stage >= 1 && <group position={[-0.25 + phase * 0.2, 0.43 + (stage >= 4 ? 0.5 : 0), 0.75]}>
      <Rod start={[0, -0.45, 0]} end={[0, 0.16, 0]} color="#f3d278" radius={0.075} />
      <Rod start={[0, 0.16, 0]} end={[-0.28, 0.42, 0]} color="#f3d278" radius={0.075} />
      <Rod start={[0, 0.16, 0]} end={[0.28, 0.42, 0]} color="#f3d278" radius={0.075} />
      <mesh position={[0, -0.49, 0]}><sphereGeometry args={[0.15, 14, 12]} /><meshStandardMaterial color="#f4c66b" /></mesh>
      <Html position={[0.45, 0.25, 0]} center distanceFactor={8}><span className="mb-scene-tag">tRNA · ANTICODON</span></Html>
    </group>}
    {Array.from({ length: chainLength }, (_, index) => <mesh key={index} position={[-0.8 + index * 0.36, 1.25 + Math.sin(index * 0.9) * 0.13, 0.6]}>
      <sphereGeometry args={[0.16, 14, 12]} /><meshStandardMaterial color={index === chainLength - 1 ? "#f3c56f" : "#73e0b2"} emissive="#23674e" emissiveIntensity={0.2} />
    </mesh>)}
    <Html position={[0, 1.8, 0.55]} center distanceFactor={8}><span className="mb-scene-tag">GROWING POLYPEPTIDE</span></Html>
    {stage === 0 && <Html position={[-2.5, 0.65, 0.3]} center distanceFactor={8}><span className="mb-scene-tag">SMALL + LARGE RIBOSOMAL SUBUNITS</span></Html>}
  </group>;
}

function ProcessScene({ processId, stage, progress }) {
  return <>
    <hemisphereLight args={["#dcecff", "#263347", 1.2]} />
    <ambientLight intensity={0.55} />
    <directionalLight position={[-3, 5, 6]} intensity={1.8} color="#fff0dc" />
    {processId === "replication" ? <ReplicationScene stage={stage} progress={progress} /> : processId === "transcription" ? <TranscriptionScene stage={stage} progress={progress} /> : <TranslationScene stage={stage} progress={progress} />}
  </>;
}

export default function DNAProcessVisuals({ onComplete }) {
  const [processId, setProcessId] = useState("replication");
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const config = processInfo[processId];
  const stage = Math.min(config.steps.length - 1, Math.floor(elapsed));
  const progress = Math.min(1, Math.max(0, elapsed - stage));
  const stageInfo = config.steps[stage];

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => {
      const next = Math.min(config.steps.length, elapsedRef.current + 0.025 * speed);
      elapsedRef.current = next;
      setElapsed(next);
      if (next >= config.steps.length) {
          setPlaying(false);
          onComplete?.(`process-${processId}`);
      }
    }, 70);
    return () => window.clearInterval(timer);
  }, [playing, speed, config.steps.length, processId, onComplete]);

  const updateElapsed = value => { elapsedRef.current = value; setElapsed(value); };
  const changeProcess = id => { setPlaying(false); setProcessId(id); updateElapsed(0); };
  const changeStage = delta => { setPlaying(false); updateElapsed(Math.max(0, Math.min(config.steps.length - 1, stage + delta))); };
  const restart = () => { setPlaying(false); updateElapsed(0); };

  return <section className="dna-process-workspace">
    <div className="dna-process-tabs" role="group" aria-label="Choose molecular process">
      {Object.entries(processInfo).map(([id, item]) => <button key={id} className={processId === id ? "active" : ""} onClick={() => changeProcess(id)} aria-pressed={processId === id}>{item.name}</button>)}
    </div>
    <div className="dna-process-layout">
      <div className="dna-process-canvas-wrap">
        <Canvas className="dna-process-canvas" camera={{ position: [0, 0, 9], fov: 40 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
          <ProcessScene processId={processId} stage={stage} progress={progress} />
          <OrbitControls enableDamping dampingFactor={0.08} minDistance={6} maxDistance={13} enablePan={false} />
        </Canvas>
        <div className="dna-process-stage-badge">STAGE {stage + 1} / {config.steps.length} · {stageInfo[0].toUpperCase()}</div>
      </div>
      <aside className="dna-process-explanation" aria-live="polite">
        <span className="mb-kicker">{config.name.toUpperCase()}</span>
        <h3>{stageInfo[0]}</h3>
        <p>{stageInfo[1]}</p>
        <details open><summary>Science behind it</summary><p>{stageInfo[2]}</p></details>
        <div className="dna-process-progress" role="group" aria-label="Choose a process stage">
          {config.steps.map((step, index) => <button key={step[0]} className={stage === index ? "active" : stage > index ? "done" : ""} onClick={() => { setPlaying(false); updateElapsed(index); }} aria-label={`Go to stage ${index + 1}: ${step[0]}`}><span>{index + 1}</span></button>)}
        </div>
      </aside>
    </div>
    <div className="dna-process-controls">
      <button onClick={() => changeStage(-1)} disabled={stage === 0}><ChevronLeft size={16} />Previous</button>
      <button className="mb-primary-button" onClick={() => setPlaying(value => !value)}>{playing ? <Pause size={16} /> : <Play size={16} />}{playing ? "Pause" : "Play"}</button>
      <button onClick={() => changeStage(1)} disabled={stage === config.steps.length - 1}><ChevronRight size={16} />Next stage</button>
      <button onClick={restart}><RotateCcw size={15} />Restart</button>
      <label>Speed <select value={speed} onChange={event => setSpeed(Number(event.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option></select></label>
    </div>
    <p className="dna-process-footnote">The molecular actors are simplified educational diagrams. Their geometry and timing do not represent molecular dynamics.</p>
  </section>;
}
