import { useState } from "react";
import { BookOpen, Check, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { dnaLearningSections } from "./molecularData";

export default function DNALearning({ onComplete }) {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [visited, setVisited] = useState(() => new Set([0]));
  const [choice, setChoice] = useState(null);
  const [checked, setChecked] = useState(false);
  const section = dnaLearningSections[sectionIndex];
  const progress = Math.round(visited.size / dnaLearningSections.length * 100);

  const openSection = index => {
    setSectionIndex(index);
    setVisited(previous => new Set([...previous, index]));
    setChoice(null);
    setChecked(false);
  };
  const checkAnswer = () => {
    if (choice === null) return;
    setChecked(true);
    if (choice === section.correct && visited.size === dnaLearningSections.length) onComplete?.("dna-learning");
  };
  const reset = () => { setSectionIndex(0); setVisited(new Set([0])); setChoice(null); setChecked(false); };

  return <section className="mb-card dna-learning-panel">
    <div className="mb-panel-heading">
      <div><span className="mb-kicker">DNA LEARNING · 5 SHORT LESSONS</span><h2>{section.title}</h2></div>
      <div className="dna-learning-progress-label"><strong>{progress}%</strong><span>explored</span></div>
    </div>
    <div className="dna-learning-progress"><i style={{ width: `${progress}%` }} /></div>
    <div className="dna-learning-tabs" role="group" aria-label="DNA learning sections">
      {dnaLearningSections.map((item, index) => <button key={item.label} className={sectionIndex === index ? "active" : visited.has(index) ? "done" : ""} onClick={() => openSection(index)} aria-pressed={sectionIndex === index}><span>{index + 1}</span>{item.label}</button>)}
    </div>
    <div className="dna-learning-body">
      <div className="dna-learning-explanation">
        <span className="mb-kicker">UNDERSTAND IT</span>
        <p>{section.simple}</p>
        <details><summary><BookOpen size={14} /> Science behind it</summary><p>{section.science}</p></details>
      </div>
      <div className="dna-learning-check">
        <span className="mb-kicker">QUICK CHECK · LESSON {sectionIndex + 1}</span>
        <h3>{section.check}</h3>
        <div className="dna-learning-options">
          {section.options.map((option, index) => <button key={option} disabled={checked} onClick={() => setChoice(index)} className={`${choice === index ? "chosen" : ""} ${checked && index === section.correct ? "correct" : checked && choice === index ? "wrong" : ""}`} aria-pressed={choice === index}>{option}</button>)}
        </div>
        {checked && <div className={`dna-learning-feedback ${choice === section.correct ? "correct" : "review"}`} role="status"><strong>{choice === section.correct ? "That’s right" : "Review this idea"}</strong><p>{section.science}</p></div>}
        {!checked && <button className="mb-primary-button" disabled={choice === null} onClick={checkAnswer}><Check size={15} />Check answer</button>}
      </div>
    </div>
    <div className="dna-learning-actions">
      <button onClick={() => openSection(Math.max(0, sectionIndex - 1))} disabled={sectionIndex === 0}><ChevronLeft size={16} />Previous</button>
      {sectionIndex < dnaLearningSections.length - 1 ? <button className="mb-primary-button" onClick={() => openSection(sectionIndex + 1)}>Next lesson<ChevronRight size={16} /></button> : <button className="mb-primary-button" onClick={() => { onComplete?.("dna-learning"); reset(); }}>Restart lessons<RotateCcw size={15} /></button>}
    </div>
  </section>;
}
