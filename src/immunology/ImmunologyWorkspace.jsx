import { useEffect, useRef, useState } from "react";
import * as $3Dmol from "3dmol";
import {
  RotateCcw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  ShieldCheck, BookOpen, CheckCircle2
} from "lucide-react";
import "./ImmunologyWorkspace.css";

const parts = {
  light: {
    chain: "A",
    name: "Light Chain",
    short: "Antibody component",
    description: "The light chain pairs with the heavy chain to form the antibody Fab fragment. Its variable region contributes to antigen recognition.",
    function: "Contributes to the antigen-binding surface.",
    color: "#54d6c8"
  },
  heavy: {
    chain: "B",
    name: "Heavy Chain",
    short: "Antibody component",
    description: "The heavy chain forms the other major part of the Fab fragment. Its variable region works with the light chain to recognise the antigen.",
    function: "Helps form the antigen-binding site.",
    color: "#a78bfa"
  },
  antigen: {
    chain: "E",
    name: "Lysozyme Antigen",
    short: "Target protein",
    description: "Hen egg-white lysozyme is the protein recognised by the D44.1 antibody in this experimentally determined complex.",
    function: "The target that the antibody binds.",
    color: "#fb8b75"
  }
};

const steps = [
  {
    title: "Identify the antigen",
    target: "antigen",
    description: "The immune system encounters a foreign protein. In this structure, hen egg-white lysozyme is the antigen recognised by antibody D44.1."
  },
  {
    title: "Explore the antibody",
    target: "heavy",
    description: "The antibody Fab fragment contains heavy and light chains. Their variable regions contribute to the antigen-binding site."
  },
  {
    title: "Recognise and bind",
    target: "light",
    description: "Complementary molecular surfaces at the antibody binding site interact with the antigen through non-covalent interactions."
  },
  {
    title: "Form the complex",
    target: "antigen",
    description: "The result is an antigen-antibody complex. The PDB structure captures this bound state; it does not simulate later immune responses."
  }
];

export default function ImmunologyWorkspace() {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  const [selected, setSelected] = useState("antigen");
  const [viewMode, setViewMode] = useState("overview");
  const [activeTab, setActiveTab] = useState("structure");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let disposed = false;
    let viewer = null;

    async function loadStructure() {
      try {
        viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: "#0a1422",
          antialias: true
        });

        viewerRef.current = viewer;

        const response = await fetch(
          "https://files.rcsb.org/download/1MLC.pdb"
        );

        if (!response.ok) throw new Error("Could not load PDB structure.");

        const pdb = await response.text();

        // Show the first biological complex: chains A, B and E.
        const focusedPdb = pdb.split(/\r?\n/).filter(line => {
          if (line.startsWith("ATOM  ") || line.startsWith("HETATM")) {
            return ["A", "B", "E"].includes(line[21]);
          }
          return true;
        }).join("\n");

        if (disposed) return;


viewer.addModel(focusedPdb, "pdb");

// BASE COLOURS
viewer.setStyle({ chain: "A" }, {
  cartoon: { color: "#87CEEB" }
});

viewer.setStyle({ chain: "B" }, {
  cartoon: { color: "#4682B4" }
});

viewer.setStyle({ chain: "E" }, {
  cartoon: { color: "#D3D3D3" }
});

// ANTIGEN INTERFACE - GOLD
viewer.setStyle(
  {
    chain: "E",
    within: {
      distance: 5,
      sel: { chain: ["A", "B"] }
    },
    byres: true
  },
  {
    cartoon: { color: "#FFD700" },
    stick: { radius: 0.15, colorscheme: "Jmol" }
  }
);

// ANTIBODY INTERFACE - RED
viewer.setStyle(
  {
    chain: ["A", "B"],
    within: {
      distance: 5,
      sel: { chain: "E" }
    },
    byres: true
  },
  {
    cartoon: { color: "#FF6347" },
    stick: { radius: 0.15, colorscheme: "Jmol" }
  }
);


viewer.setClickable({}, true, atom => {
  const chainMap = { A: "light", B: "heavy", E: "antigen" };
  if (chainMap[atom.chain]) {
    setSelected(chainMap[atom.chain]);
  }
});

        viewer.zoomTo();
        viewer.render();
        setLoading(false);
      } catch (err) {
        if (!disposed) {
          setError(err.message || "Unable to load molecular structure.");
          setLoading(false);
        }
      }
    }

    loadStructure();

    return () => {
      disposed = true;
      if (viewer) viewer.clear();
      viewerRef.current = null;
    };
  }, []);


  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const chain = parts[selected]?.chain;
    // Reset all atom styles first so switching modes never leaves stale sticks.
    viewer.setStyle({}, {});

    Object.entries(parts).forEach(([id, part]) => {
      const isSelected = id === selected;
      if (viewMode === "overview") {
        viewer.setStyle({ chain: part.chain }, { cartoon: { color: part.color } });
      } else if (!isSelected) {
        viewer.setStyle({ chain: part.chain }, { cartoon: { color: "#64748b", opacity: 0.2 } });
      } else if (viewMode === "detailed") {
        viewer.setStyle({ chain: part.chain }, { cartoon: { color: part.color, opacity: 1 } });
      } else {
        viewer.setStyle({ chain: part.chain }, { stick: { colorscheme: "Jmol", radius: 0.14 } });
      }
    });

    if (viewMode === "overview") viewer.zoomTo();
    else viewer.zoomTo({ chain }, 500);
    viewer.render();
  }, [selected, viewMode, loading]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.setHoverDuration(250);
    viewer.setHoverable({}, true, (atom, activeViewer) => {
      if (atom.label) return;
      atom.label = activeViewer.addLabel(
        `Atom: ${atom.atom}\nResidue: ${atom.resn} ${atom.resi}\nChain: ${atom.chain}\nElement: ${atom.elem}`,
        { position: atom, backgroundColor: "#10283c", backgroundOpacity: 0.95,
          fontColor: "#ffffff", borderColor: "#54d6c8", borderThickness: 1,
          fontSize: 12, inFront: true }
      );
    }, (atom, activeViewer) => {
      if (atom.label) {
        activeViewer.removeLabel(atom.label);
        delete atom.label;
      }
    });
  }, [loading]);

  const focusPart = id => setSelected(id);


  const moveStep = direction => {
    const next = Math.max(0, Math.min(steps.length - 1, step + direction));
    setStep(next);
    focusPart(steps[next].target);
  };

  const zoomIn = () => {
    viewerRef.current?.zoom(1.3, 300);
    viewerRef.current?.render();
  };

  const zoomOut = () => {
    viewerRef.current?.zoom(0.75, 300);
    viewerRef.current?.render();
  };

  const resetView = () => {
    setViewMode("overview");
  };

  const current = parts[selected];

  return (
    <main className="immunology-workspace">
      <header className="imm-heading">
        <div>
          <p className="imm-eyebrow">
            BIOSCOPE LITE / BIOLOGY STREAMS / IMMUNOLOGY
          </p>
          <h1>Immunology Explorer</h1>
          <p className="imm-subtitle">
            Discover how antibodies recognise and bind to antigens.
          </p>
        </div>
        <span className="imm-tag"><ShieldCheck size={15} /> INTERACTIVE LAB</span>
      </header>

      <nav className="imm-tabs">
        <button
          className={activeTab === "structure" ? "selected" : ""}
          onClick={() => setActiveTab("structure")}
        >
          <BookOpen size={16} /> Structure explorer
        </button>
        <button
          className={activeTab === "mechanism" ? "selected" : ""}
          onClick={() => setActiveTab("mechanism")}
        >
          <ShieldCheck size={16} /> Binding mechanism
        </button>
        <button
          className={activeTab === "quiz" ? "selected" : ""}
          onClick={() => setActiveTab("quiz")}
        >
          <CheckCircle2 size={16} /> Test yourself
        </button>
      </nav>

      <div className="imm-grid">
        <section className="imm-viewer-card">
          <div className="imm-viewer-heading">
            <div>
              <span className="imm-live-dot" />
              LIVE 3D MOLECULAR VIEWER
            </div>
            <span>PDB: 1MLC</span>
          </div>

          <div className="imm-canvas-wrap">
            <div ref={containerRef} className="imm-canvas" />
            {loading && <div className="imm-overlay">Loading antibody structure...</div>}
            {error && <div className="imm-overlay imm-error">{error}</div>}
          </div>

          <div className="imm-legend">
            <span><i style={{ background: "#54d6c8" }} /> Light chain A</span>
            <span><i style={{ background: "#a78bfa" }} /> Heavy chain B</span>
            <span><i style={{ background: "#fb8b75" }} /> Antigen E</span>
          </div>

          <div className="imm-view-modes" role="group" aria-label="Molecular viewing mode">
            {["overview", "detailed", "atomic"].map(mode => (
              <button key={mode} className={viewMode === mode ? "selected" : ""}
                aria-pressed={viewMode === mode} onClick={() => setViewMode(mode)}>
                {mode[0].toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          <div className="imm-controls">
            <button onClick={zoomIn}><ZoomIn size={16} /> Zoom in</button>
            <button onClick={zoomOut}><ZoomOut size={16} /> Zoom out</button>
            <button onClick={resetView}><RotateCcw size={16} /> Reset</button>
          </div>
          <p className="imm-hint">Drag to rotate · Scroll to zoom · Select a component to inspect</p>
        </section>

        <aside className="imm-info-card">
          <p className="imm-panel-label">COMPONENT INSPECTOR</p>
          <h2>Explore components</h2>

          <div className="imm-part-list">
            {Object.entries(parts).map(([id, part]) => (
              <button
                key={id}
                className={"imm-part-button " + (selected === id ? "active" : "")}
                onClick={() => focusPart(id)}
              >
                <span className="imm-color-dot" style={{ background: part.color }} />
                <span>
                  <strong>{part.name}</strong>
                  <small>Chain {part.chain} · {part.short}</small>
                </span>
                <span className="imm-arrow">›</span>
              </button>
            ))}
          </div>

          <div className="imm-description">
            <span className="imm-panel-label">SELECTED COMPONENT</span>
            <h3>{current.name}</h3>
            <p>{current.description}</p>
            <div className="imm-function">
              <strong>Biological role</strong>
              <p>{current.function}</p>
            </div>
          </div>

          <div className="imm-source">
            <strong>Scientific source</strong>
            <a href="https://www.rcsb.org/structure/1MLC" target="_blank" rel="noreferrer">
              RCSB Protein Data Bank · 1MLC ↗
            </a>
            <small>X-ray diffraction · 2.50 Å</small>
          </div>
        </aside>
      </div>

      {activeTab === "mechanism" && (
        <section className="imm-learning-card">
          <div className="imm-panel-label">GUIDED MECHANISM · STEP {step + 1} OF {steps.length}</div>
          <div className="imm-progress">
            {steps.map((item, index) => (
              <button
                key={item.title}
                className={index <= step ? "done" : ""}
                onClick={() => {
                  setStep(index);
                  focusPart(item.target);
                }}
                aria-label={"Go to " + item.title}
              />
            ))}
          </div>
          <h2>{steps[step].title}</h2>
          <p>{steps[step].description}</p>
          <div className="imm-step-actions">
            <button onClick={() => moveStep(-1)} disabled={step === 0}>
              <ChevronLeft size={17} /> Previous
            </button>
            <button onClick={() => moveStep(1)} disabled={step === steps.length - 1}>
              Next step <ChevronRight size={17} />
            </button>
          </div>
        </section>
      )}

      {activeTab === "quiz" && (
        <section className="imm-learning-card">
          <div className="imm-panel-label">KNOWLEDGE CHECK · 01</div>
          <h2>Which chain represents the lysozyme antigen in this model?</h2>
          <div className="imm-answers">
            {["Chain A", "Chain B", "Chain E"].map(option => (
              <button
                key={option}
                className={answer === option ? "chosen" : ""}
                onClick={() => {
                  setAnswer(option);
                  setChecked(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            className="imm-check-button"
            disabled={!answer}
            onClick={() => setChecked(true)}
          >
            Check answer
          </button>
          {checked && (
            <p className={answer === "Chain E" ? "imm-correct" : "imm-wrong"}>
              {answer === "Chain E"
                ? "Correct! Chain E is hen egg-white lysozyme, the antigen."
                : "Not quite. Chain E is the lysozyme antigen. Chains A and B form the antibody Fab."}
            </p>
          )}
        </section>
      )}

      {activeTab === "structure" && (
        <section className="imm-learning-card">
          <div className="imm-panel-label">LEARNING OBJECTIVE</div>
          <h2>Understand antigen recognition</h2>
          <p>
            Explore the antibody's heavy and light chains, identify the antigen,
            and see how their surfaces form a bound complex. Click the coloured
            components above to inspect each one.
          </p>
          <p className="imm-note">
            This structure shows an antibody Fab fragment, not a complete Y-shaped
            antibody. Its binding interaction is experimentally observed, not a
            live molecular dynamics simulation.
          </p>
        </section>
      )}
    </main>
  );
}
