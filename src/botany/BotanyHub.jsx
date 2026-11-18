import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Flower2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import FlowerModel from "./FlowerModel";
import FlowerVisuals from "./FlowerVisuals";
import FlowerLearning from "./FlowerLearning";
import { flowerFocusPoints, flowerMemoryHooks, flowerParts, flowerQuestions } from "./flowerData";
import "./Botany.css";

const sections = [
  ["structure", "Structure Explorer", Flower2],
  ["visuals", "Visuals", Activity],
  ["learning", "Flower Learning", BookOpen],
  ["quiz", "Test Yourself", CheckCircle2]
];
const viewModes = [
  ["overview", "Overview"],
  ["component", "Component"],
  ["interface", "Interface · Pollination"],
  ["microscopic", "Microscopic / Cellular"]
];

export default function BotanyHub() {
  const [activeSection, setActiveSection] = useState("structure");
  const [selectedId, setSelectedId] = useState("petal");
  const [viewMode, setViewMode] = useState("overview");
  const [quizIndex, setQuizIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [checked, setChecked] = useState(false);
  const [responses, setResponses] = useState({});
  const [focusRequest, setFocusRequest] = useState(null);
  const controlsRef = useRef(null);
  const selected = useMemo(() => flowerParts.find(part => part.id === selectedId) || flowerParts[0], [selectedId]);
  const question = flowerQuestions[quizIndex];
  const score = Object.entries(responses).filter(([index, value]) => value === flowerQuestions[Number(index)].correct).length;

  useEffect(() => {
    if (activeSection !== "structure" || !focusRequest) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const controls = controlsRef.current;
      const target = flowerFocusPoints[focusRequest.id];
      if (controls && target) {
        controls.target.set(target[0], target[1], target[2]);
        controls.object.position.set(target[0], target[1] + 0.08, target[2] + 6.2);
        controls.update();
      }
      setFocusRequest(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeSection, focusRequest]);

  const setMode = mode => {
    setViewMode(mode);
    const controls = controlsRef.current;
    if (!controls) return;
    controls.target.set(0, mode === "microscopic" ? 0.5 : 0.45, 0);
    controls.object.position.set(0, mode === "microscopic" ? 0.8 : 1.1, mode === "microscopic" ? 6.3 : 10.2);
    controls.update();
  };
  const zoom = factor => {
    const controls = controlsRef.current;
    if (!controls) return;
    const offset = controls.object.position.clone().sub(controls.target);
    const distance = Math.max(4.7, Math.min(15.5, offset.length() * factor));
    controls.object.position.copy(controls.target).add(offset.setLength(distance));
    controls.update();
  };
  const resetExplorer = () => {
    setSelectedId("petal");
    setMode("overview");
    controlsRef.current?.reset();
    controlsRef.current?.update();
  };
  const inspectPart = id => {
    setSelectedId(id);
    if (["ovary", "ovule"].includes(id)) zoom(0.78);
  };
  const jumpToStructure = id => {
    setSelectedId(id);
    setViewMode("component");
    setActiveSection("structure");
    setFocusRequest({ id });
  };
  const chooseAnswer = value => { setAnswer(value); setChecked(false); };
  const checkAnswer = () => {
    if (answer === null) return;
    setResponses(previous => ({ ...previous, [quizIndex]: answer }));
    setChecked(true);
  };
  const nextQuestion = () => {
    if (quizIndex === flowerQuestions.length - 1) { setQuizIndex(flowerQuestions.length); return; }
    const next = quizIndex + 1;
    setQuizIndex(next);
    setAnswer(responses[next] ?? null);
    setChecked(responses[next] !== undefined);
  };
  const previousQuestion = () => {
    if (quizIndex <= 0) return;
    const previous = quizIndex - 1;
    setQuizIndex(previous);
    setAnswer(responses[previous] ?? null);
    setChecked(responses[previous] !== undefined);
  };
  const restartQuiz = () => { setResponses({}); setQuizIndex(0); setAnswer(null); setChecked(false); };

  return <main className="botany-hub">
    <header className="botany-header">
      <div>
        <p className="botany-eyebrow">BIOSCOPE LITE / BIOLOGY STREAMS / BOTANY</p>
        <h1>Angiosperm Flower Explorer</h1>
        <p>Explore a flowering plant’s reproductive structures, follow pollen, and see how a seed begins.</p>
      </div>
      <span className="botany-lab-tag"><Flower2 size={16} /> INTERACTIVE 3D LAB</span>
    </header>

    <nav className="botany-tabs" aria-label="Botany sections">
      {sections.map(([id, label, Icon]) => <button key={id} type="button" className={activeSection === id ? "selected" : ""} aria-current={activeSection === id ? "page" : undefined} onClick={() => setActiveSection(id)}><Icon size={16} />{label}</button>)}
    </nav>

    {activeSection === "structure" && <section className="botany-structure-layout">
      <section className="botany-viewer-card">
        <div className="botany-viewer-heading"><div><span className="botany-live-dot" />LIVE 3D ANGIOSPERM FLOWER</div><span className="botany-viewer-hint">Zoom in to reveal the ovary interior</span></div>
        <div className="botany-canvas-wrap">
          <Canvas camera={{ position: [0, 1.1, 10.2], fov: 36 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
            <FlowerModel selectedId={selectedId} onSelect={inspectPart} viewMode={viewMode} controlsRef={controlsRef} />
          </Canvas>
          <div className="botany-canvas-label">Drag to orbit · scroll to zoom · hover a part for its name and role · click to inspect</div>
        </div>
        <div className="botany-view-modes" role="group" aria-label="Flower viewing mode">
          {viewModes.map(([id, label]) => <button key={id} type="button" title={id === "interface" ? "Trace pollen transfer from anther to stigma" : id === "microscopic" ? "Inspect an ovule and embryo sac" : undefined} aria-label={label} className={viewMode === id ? "selected" : ""} aria-pressed={viewMode === id} onClick={() => setMode(id)}>{label}</button>)}
        </div>
        <div className="botany-controls">
          <button type="button" onClick={() => zoom(0.82)}><ZoomIn size={16} />Zoom In</button>
          <button type="button" onClick={() => zoom(1.22)}><ZoomOut size={16} />Zoom Out</button>
          <button type="button" onClick={resetExplorer}><RotateCcw size={16} />Reset</button>
          <span className="botany-control-hint">Select a flower part to inspect it</span>
        </div>
        <p className="botany-model-note">Botanical teaching model; shapes, colors and distances are simplified and not to scale. Flower anatomy varies across angiosperm species.</p>
      </section>

      <aside className="botany-inspector" aria-live="polite">
        <p className="botany-panel-label">STRUCTURE INSPECTOR</p>
        <h2>Flower components</h2>
        <div className="botany-part-list" role="group" aria-label="Select a flower component">
          {flowerParts.map(part => <button key={part.id} type="button" className={selectedId === part.id ? "active" : ""} onClick={() => inspectPart(part.id)}>
            <i style={{ "--part-color": part.color }} />
            <span><strong>{part.name}</strong><small>{part.classification}</small></span>
            <b aria-hidden="true">›</b>
          </button>)}
        </div>
        <div className="botany-selected-description">
          <span className="botany-panel-label">SELECTED STRUCTURE</span>
          <h3>{selected.name}</h3>
          <p className="botany-scientific-name"><em>{selected.scientificName}</em></p>
          <div className="botany-detail-block"><strong>Botanical classification</strong><p>{selected.classification}</p></div>
          <div className="botany-detail-block"><strong>Biological role</strong><p>{selected.function}</p></div>
          <div className="botany-memory-hook"><span>MEMORY HOOK</span><p>{flowerMemoryHooks[selectedId] || "Follow the flower’s path: anther → stigma → style → ovary → ovule."}</p></div>
        </div>
      </aside>
    </section>}

    {activeSection === "structure" && <section className="botany-route-card">
      <div className="botany-panel-heading"><div><span className="botany-eyebrow">POLLINATION TO FERTILIZATION</span><h2>Follow the reproductive pathway</h2></div></div>
      <div className="botany-route-list"><p><i className="pollen-dot" />Anther releases pollen → compatible pollen lands on the stigma</p><p><i className="tube-dot" />Pollen grain germinates → pollen tube grows down the style to an ovule</p><p><i className="seed-dot" />Two sperm cells enter the embryo sac → double fertilization begins seed development</p></div>
    </section>}

    {activeSection === "visuals" && <FlowerVisuals />}

    {activeSection === "learning" && <FlowerLearning onJump={jumpToStructure} />}

    {activeSection === "quiz" && <section className="botany-card botany-quiz-panel">
      {quizIndex < flowerQuestions.length ? <>
        <div className="botany-panel-heading"><div><span className="botany-eyebrow">FLOWER KNOWLEDGE CHECK · {flowerQuestions.length} QUESTIONS</span><h2>Test your understanding</h2></div><span className="botany-quiz-count">Question {quizIndex + 1} of {flowerQuestions.length}</span></div>
        <div className="botany-quiz-progress">{flowerQuestions.map((item, index) => <i key={item.prompt} className={responses[index] === undefined ? (index === quizIndex ? "current" : "") : responses[index] === item.correct ? "correct" : "wrong"} />)}</div>
        <h3 className="botany-question">{question.prompt}</h3>
        <div className="botany-answer-list">{question.answers.map((item, index) => <button key={item} type="button" className={`${answer === index ? "chosen" : ""} ${checked && index === question.correct ? "correct" : ""} ${checked && answer === index && index !== question.correct ? "wrong" : ""}`} aria-pressed={answer === index} onClick={() => chooseAnswer(index)}><span>{String.fromCharCode(65 + index)}</span>{item}</button>)}</div>
        {checked && <div className={`botany-answer-feedback ${answer === question.correct ? "correct" : "wrong"}`} role="status"><strong>{answer === question.correct ? "Correct" : "Review this one"}</strong><p>{question.note}</p></div>}
        <div className="botany-quiz-actions"><button type="button" onClick={previousQuestion} disabled={quizIndex === 0}><ChevronLeft size={16} />Previous</button>{!checked ? <button type="button" className="botany-primary-button" onClick={checkAnswer} disabled={answer === null}>Check answer</button> : <button type="button" className="botany-primary-button" onClick={nextQuestion}>{quizIndex === flowerQuestions.length - 1 ? "See results" : "Next question"}<ChevronRight size={16} /></button>}</div>
      </> : <div className="botany-quiz-results"><div className="botany-score-badge">{score}<span>/{flowerQuestions.length}</span></div><div><span className="botany-eyebrow">KNOWLEDGE CHECK COMPLETE</span><h2>Your flower score</h2><p>You answered {score} of {flowerQuestions.length} questions correctly.</p></div><button type="button" className="botany-primary-button" onClick={restartQuiz}>Try again</button></div>}
    </section>}
  </main>;
}
