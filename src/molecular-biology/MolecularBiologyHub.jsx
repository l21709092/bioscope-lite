import { useCallback, useMemo, useState } from "react";
import { Activity, BookOpen, ChevronRight, Dna, FlaskConical, Layers3, Microscope, Target } from "lucide-react";
import DNAExplorer from "./DNAExplorer";
import DNAProcessVisuals from "./DNAProcessVisuals";
import DNALearning from "./DNALearning";
import MolecularChallenges from "./MolecularChallenges";
import StructureLibrary from "./StructureLibrary";
import { structureCards } from "./molecularData";
import "./MolecularBiologyHub.css";

const navigation = [
  ["dna", "Structure Explorer", Dna],
  ["visuals", "Visuals", Activity],
  ["learning", "DNA Learning", BookOpen],
  ["library", "Structure library", Layers3],
  ["challenges", "Test Yourself", Target],
  ["overview", "Overview", Microscope]
];

export default function MolecularBiologyHub({ searchQuery = "" }) {
  const [activeView, setActiveView] = useState("dna");
  const [selectedStructure, setSelectedStructure] = useState("rna");
  const [completed, setCompleted] = useState(() => new Set());
  const progress = Math.round(completed.size / 11 * 100);
  const filteredCards = useMemo(() => structureCards.filter(item => `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery]);
  const markComplete = useCallback(key => setCompleted(previous => new Set([...previous, key])), []);
  const openDNA = () => setActiveView("dna");
  const openStructure = id => { setSelectedStructure(id); setActiveView("library"); };

  return <main className="molecular-hub">
    <header className="mb-header">
      <div>
        <p className="mb-kicker">BIOSCOPE LITE / MOLECULAR BIOLOGY</p>
        <h1>Explore the molecules of life</h1>
        <p>Rotate real structures, follow molecular processes and test what you understand.</p>
      </div>
      <div className="mb-progress-card"><Activity size={17} /><span><strong>{progress}%</strong><small>learning path explored</small></span><i><b style={{ width: `${progress}%` }} /></i></div>
    </header>

    <nav className="mb-nav" aria-label="Molecular Biology sections">
      {navigation.map(([id, label, Icon]) => <button key={id} type="button" aria-current={activeView === id ? "page" : undefined} className={activeView === id ? "active" : ""} onClick={() => setActiveView(id)}><Icon size={16} />{label}</button>)}
    </nav>

    {activeView === "overview" && <>
      <section className="mb-hero">
        <div className="mb-hero-copy"><span className="mb-kicker">EXPLORE → UNDERSTAND → VISUALISE → INTERACT</span><h2>From DNA’s code to the machines that use it.</h2><p>Start with a real DNA crystal structure, then follow how cells copy genes, make RNA and build proteins.</p><div className="mb-hero-actions"><button className="mb-primary-button" onClick={openDNA}><Dna size={16} />Open DNA Explorer</button><button className="mb-secondary-button" onClick={() => setActiveView("learning")}><BookOpen size={16} />Start DNA Learning</button></div></div>
        <div className="mb-hero-art" aria-hidden="true"><div className="mb-orbit orbit-one" /><div className="mb-orbit orbit-two" /><Dna size={64} /><span>DNA → RNA → PROTEIN</span></div>
      </section>
      <section className="mb-overview-section">
        <div className="mb-panel-heading"><div><span className="mb-kicker">MOLECULAR STRUCTURE LIBRARY</span><h2>Choose your first exploration</h2></div><button className="mb-text-button" onClick={() => setActiveView("library")}>View all structures<ChevronRight size={15} /></button></div>
        <div className="mb-feature-grid">{filteredCards.slice(0, 5).map((card, index) => <button key={card.id} className={`mb-feature-card ${card.id}`} onClick={() => card.id === "dna" ? openDNA() : openStructure(card.id)} style={{ "--structure-accent": card.accent }}>
          <span className="mb-feature-number">0{index + 1}</span><span className="mb-feature-category">{card.category}</span><h3>{card.name}</h3><p>{card.description}</p><span className="mb-feature-action">Explore <ChevronRight size={14} /></span>
        </button>)}</div>
      </section>
      <section className="mb-path-row">
        <button onClick={() => setActiveView("learning")}><BookOpen size={19} /><span><strong>DNA Learning</strong><small>Five short lessons with recall checks</small></span><ChevronRight size={17} /></button>
        <button onClick={() => setActiveView("challenges")}><FlaskConical size={19} /><span><strong>Knowledge challenges</strong><small>Quiz and process-order practice</small></span><ChevronRight size={17} /></button>
      </section>
      {searchQuery && <p className="mb-search-note">The structure cards above are filtered by “{searchQuery}”.</p>}
    </>}

    {activeView === "dna" && <DNAExplorer onComplete={markComplete} />}
    {activeView === "visuals" && <DNAProcessVisuals onComplete={markComplete} />}
    {activeView === "learning" && <DNALearning onComplete={markComplete} />}
    {activeView === "library" && <StructureLibrary searchQuery={searchQuery} initialId={selectedStructure} onOpenDNA={openDNA} onSelectStructure={setSelectedStructure} onComplete={markComplete} />}
    {activeView === "challenges" && <MolecularChallenges onComplete={markComplete} />}
  </main>;
}
