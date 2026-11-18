import { useMemo, useState } from "react";
import { ExternalLink, HelpCircle, RotateCcw } from "lucide-react";
import Viewer from "../components/viewer";
import { dnaComponents } from "./molecularData";

const sequence = "CGCGAATTCGCG";
const complement = { A: "T", T: "A", G: "C", C: "G" };

function DNASchematicFallback({ selected, onSelect, showLabels }) {
  const rows = useMemo(() => sequence.split("").map((base, index) => ({ base, partner: complement[base], index })), []);
  return (
    <svg className="dna-fallback-svg" viewBox="0 0 360 420" role="img" aria-label="Schematic of the 1BNA DNA sequence and complementary bases">
      {showLabels && <text x="180" y="20" textAnchor="middle" className="dna-svg-caption">EDUCATIONAL SCHEMATIC · NOT ATOMIC COORDINATES</text>}
      <path d="M112 38 C234 80 56 125 236 168 C300 210 72 251 215 294 C278 336 77 372 154 404" fill="none" stroke="#75a0ff" strokeWidth="7" />
      <path d="M248 38 C126 80 304 125 124 168 C60 210 288 251 145 294 C82 336 283 372 206 404" fill="none" stroke="#55d1ba" strokeWidth="7" />
      {rows.map(({ base, partner, index }) => {
        const y = 48 + index * 30;
        const x1 = 139 + Math.sin(index * 0.62) * 29;
        const x2 = 221 - Math.sin(index * 0.62) * 29;
        const firstId = ({ A: "adenine", T: "thymine", G: "guanine", C: "cytosine" })[base];
        const secondId = ({ A: "adenine", T: "thymine", G: "guanine", C: "cytosine" })[partner];
        const active = selected === "basePair" || selected === "hydrogenBonds";
        return <g key={index}>
          <line x1={x1} x2={x2} y1={y} y2={y} className={active ? "dna-fallback-rung selected" : "dna-fallback-rung"} onClick={() => onSelect("basePair")} />
          <g className={`dna-fallback-base ${selected === firstId ? "selected" : ""}`} onClick={() => onSelect(firstId)} role="button" tabIndex="0" aria-label={`${base} base, complementary pair ${base}-${partner}`}>
            <rect x={x1 - 17} y={y - 9} width="34" height="18" rx="7" />{showLabels && <text x={x1} y={y + 4} textAnchor="middle">{base}</text>}
          </g>
          <g className={`dna-fallback-base ${selected === secondId ? "selected" : ""}`} onClick={() => onSelect(secondId)} role="button" tabIndex="0" aria-label={`${partner} base, complementary pair ${base}-${partner}`}>
            <rect x={x2 - 17} y={y - 9} width="34" height="18" rx="7" />{showLabels && <text x={x2} y={y + 4} textAnchor="middle">{partner}</text>}
          </g>
          {Array.from({ length: base === "G" || base === "C" ? 3 : 2 }, (_, bond) => <circle key={bond} cx={(x1 + x2) / 2} cy={y - 4 + bond * 4} r="1.5" className="dna-fallback-hbond" />)}
        </g>;
      })}
      {showLabels && <><text x="112" y="414" className="dna-svg-rail">5′</text><text x="248" y="414" className="dna-svg-rail">3′</text></>}
    </svg>
  );
}

export default function DNAExplorer({ onComplete }) {
  const [selectedComponent, setSelectedComponent] = useState("basePair");
  const [hoveredComponent, setHoveredComponent] = useState(null);
  const [selectedAtom, setSelectedAtom] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");
  const selectedInfo = dnaComponents.find(item => item.id === (hoveredComponent?.componentId || selectedComponent)) || dnaComponents[0];

  const handleSelect = atom => {
    setSelectedAtom(atom);
    setSelectedComponent(atom.componentId);
    setHoveredComponent(null);
    onComplete?.("dna-structure");
  };

  const handleComponentSelect = componentId => {
    setSelectedComponent(componentId);
    setHoveredComponent(null);
    setSelectedAtom(null);
    onComplete?.("dna-structure");
  };

  return (
    <section className="mb-card dna-explorer">
      <div className="mb-panel-heading">
        <div><span className="mb-kicker">STRUCTURE EXPLORER</span><h2>Explore the double helix</h2></div>
        <span className="dna-live-tag"><i /> LIVE 3D · PDB 1BNA</span>
      </div>

        <p className="mb-intro-copy">Drag to rotate, right-drag to pan, and scroll or use the controls to zoom. Component labels fade in as you move closer. Click any atom to inspect its nucleotide and role.</p>
        <div className="dna-component-list" role="group" aria-label="DNA structures">
          {dnaComponents.map(item => <button key={item.id} className={(hoveredComponent?.componentId || selectedComponent) === item.id ? "active" : ""} onClick={() => handleComponentSelect(item.id)} aria-pressed={selectedComponent === item.id}>
            <i className={`dna-component-dot ${item.id}`} />{item.name}
          </button>)}
        </div>
        <div className="dna-explorer-layout">
          <div className="dna-structure-column">
            <div className="dna-structure-tools">
              <button onClick={() => { setHoveredComponent(null); setSelectedAtom(null); handleComponentSelect("basePair"); }}><RotateCcw size={14} />Reset inspection</button>
              <a href="https://www.rcsb.org/structure/1BNA" target="_blank" rel="noreferrer">RCSB PDB: 1BNA <ExternalLink size={13} /></a>
            </div>
            <Viewer
              molecularMode
              onSelect={handleSelect}
              onHover={setHoveredComponent}
              focusedComponent={hoveredComponent?.componentId || selectedComponent}
              onLoadStatus={setLoadStatus}
            />
            {loadStatus === "error" && <div className="dna-fallback-wrap">
              <div><strong>Offline structure view</strong><span>The RCSB coordinates could not be loaded. This sequence diagram is schematic; it does not show atomic coordinates.</span></div>
              <DNASchematicFallback selected={hoveredComponent?.componentId || selectedComponent} onSelect={handleComponentSelect} showLabels />
            </div>}
            <p className="dna-source-note">1BNA is an experimental X-ray structure of a short B-DNA dodecamer. It is a static coordinate model, not a molecular dynamics simulation.</p>
          </div>
          <aside className="dna-inspector" aria-live="polite">
            <span className="mb-kicker">STRUCTURE INSPECTOR · {hoveredComponent ? "HOVER" : "SELECTED"}</span>
            <h3>{selectedInfo.name}</h3>
            <strong>{selectedInfo.short}</strong>
            <p>{selectedInfo.simple}</p>
            <div className="dna-inspector-function"><strong>Biological function</strong><p>{selectedInfo.function || selectedInfo.simple}</p></div>
            <details className="dna-inspector-properties"><summary>Properties</summary><p>{selectedInfo.properties || selectedInfo.science}</p></details>
            <details><summary><HelpCircle size={14} /> Science behind it</summary><p>{selectedInfo.science}</p></details>
            {selectedAtom && <div className="dna-atom-meta"><span>Selected atom</span><b>{selectedAtom.atom} · {selectedAtom.element}</b><span>Residue / chain</span><b>{selectedAtom.residue}{selectedAtom.residueNumber} · {selectedAtom.chain}</b></div>}
            {selectedComponent === "hydrogenBonds" && <p className="dna-inference-note">Hydrogen-bond connectors are calculated from donor and acceptor atom coordinates in this deposited structure. They are not explicit hydrogen atoms.</p>}
            <div className="dna-color-key"><span><i className="a" />Adenine</span><span><i className="t" />Thymine</span><span><i className="g" />Guanine</span><span><i className="c" />Cytosine</span></div>
          </aside>
        </div>
    </section>
  );
}
