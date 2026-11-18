import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import FlowerModel from "./FlowerModel";
import { pollinationPhases } from "./flowerData";

export default function FlowerVisuals() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phaseIndexRef = useRef(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const phaseProgressRef = useRef(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const phase = pollinationPhases[phaseIndex];

  useEffect(() => {
    phaseIndexRef.current = phaseIndex;
    phaseProgressRef.current = phaseProgress;
  }, [phaseIndex, phaseProgress]);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => {
      const currentIndex = phaseIndexRef.current;
      const nextProgress = phaseProgressRef.current + 0.035 * speed / pollinationPhases[currentIndex].duration;
      if (nextProgress >= 1) {
        const nextIndex = (currentIndex + 1) % pollinationPhases.length;
        phaseIndexRef.current = nextIndex;
        phaseProgressRef.current = 0;
        setPhaseIndex(nextIndex);
        setPhaseProgress(0);
      } else {
        phaseProgressRef.current = nextProgress;
        setPhaseProgress(nextProgress);
      }
    }, 45);
    return () => window.clearInterval(timer);
  }, [playing, speed]);

  const choosePhase = index => {
    setPlaying(false);
    phaseIndexRef.current = index;
    phaseProgressRef.current = 0;
    setPhaseIndex(index);
    setPhaseProgress(0);
  };
  const stepPhase = direction => choosePhase((phaseIndex + direction + pollinationPhases.length) % pollinationPhases.length);
  const restart = () => choosePhase(0);

  return <section className="botany-card botany-cycle-panel">
    <div className="botany-panel-heading">
      <div><span className="botany-eyebrow">3D ANGIOSPERM REPRODUCTION</span><h2>Follow pollen to a new seed</h2></div>
      <span className={`botany-live-state ${playing ? "is-playing" : ""}`}><i />{playing ? "LIVE SIMULATION" : "PAUSED"}</span>
    </div>
    <div className="botany-phase-tabs" role="group" aria-label="Choose a reproduction phase">
      {pollinationPhases.map((item, index) => <button key={item.id} type="button" className={phaseIndex === index ? "active" : ""} aria-pressed={phaseIndex === index} onClick={() => choosePhase(index)}>
        <span>0{index + 1}</span>{item.name}
      </button>)}
    </div>
    <div className="botany-cycle-layout">
      <div className="botany-cycle-viewer">
        <div className="botany-viewer-top"><span><i /> LIVE 3D FLOWER</span><span>ANTHER → STIGMA → OVARY</span></div>
        <div className="botany-cycle-canvas-wrap">
          <Canvas camera={{ position: [0, 1.1, 10.2], fov: 36 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
            <FlowerModel viewMode="overview" selectedId={null} onSelect={() => {}} phase={phase.id} phaseProgress={phaseProgress} animate />
          </Canvas>
          <div className="botany-cycle-phase-badge">PHASE {phaseIndex + 1} / 3 · {phase.name.toUpperCase()}</div>
          <div className="botany-cycle-beat-track" aria-label={`${Math.round(phaseProgress * 100)} percent through ${phase.name}`}><i style={{ width: `${phaseProgress * 100}%` }} /></div>
        </div>
        <div className="botany-cycle-controls">
          <button type="button" onClick={() => stepPhase(-1)}><ChevronLeft size={16} />Previous phase</button>
          <button type="button" className="botany-play-button" onClick={() => setPlaying(value => !value)}>{playing ? <Pause size={16} /> : <Play size={16} />}{playing ? "Pause" : "Play"}</button>
          <button type="button" onClick={() => stepPhase(1)}>Next phase<ChevronRight size={16} /></button>
          <button type="button" onClick={restart}><RotateCcw size={15} />Restart</button>
          <label>Speed<select value={speed} onChange={event => setSpeed(Number(event.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option></select></label>
        </div>
      </div>
      <aside className="botany-phase-explanation" aria-live="polite">
        <span className="botany-eyebrow">PHASE {phaseIndex + 1} · {phase.name.toUpperCase()}</span>
        <h3>{phase.name}</h3>
        <p>{phase.simple}</p>
        <div className="botany-science-note"><strong>What is happening?</strong><p>{phase.science}</p></div>
        {phase.id === "fertilization" && <div className="botany-double-fertilization"><span>1</span> sperm + egg → zygote <span>2</span> sperm + central cell → endosperm</div>}
      </aside>
    </div>
    <p className="botany-model-note">Teaching simulation: flower shape, timing and cell positions are simplified. In nature, pollen tubes grow through living style tissue and double fertilization occurs inside an ovule.</p>
  </section>;
}
