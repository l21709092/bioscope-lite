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
    color: "#87ceeb"
  },
  heavy: {
    chain: "B",
    name: "Heavy Chain",
    short: "Antibody component",
    description: "The heavy chain forms the other major part of the Fab fragment. Its variable region works with the light chain to recognise the antigen.",
    function: "Helps form the antigen-binding site.",
    color: "#4682b4"
  },
  antigen: {
    chain: "E",
    name: "Lysozyme Antigen",
    short: "Target protein",
    description: "Hen egg-white lysozyme is the protein recognised by the D44.1 antibody in this experimentally determined complex.",
    function: "The target that the antibody binds.",
    color: "#d3d3d3"
  }
};

const chainColors = Object.fromEntries(
  Object.values(parts).map(part => [part.chain, part.color])
);
const interfaceColors = { antibody: "#ff6347", antigen: "#ffd700" };
const antibodyInterface = {
  chain: ["A", "B"],
  within: { distance: 5, sel: { chain: "E" } },
  byres: true
};
const antigenInterface = {
  chain: "E",
  within: { distance: 5, sel: { chain: ["A", "B"] } },
  byres: true
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

// Stable IDs and normalized response fields make this result reusable by a
// future cross-module assessment/reporting layer.
const quizQuestions = [
  {
    id: "antibody-chains",
    topicId: "antibody-structure",
    topic: "Antibody structure",
    level: "Basic",
    type: "Recall",
    prompt: "Which chains make up the antibody Fab fragment shown in this module?",
    options: ["One heavy chain and one light chain", "Two antigen chains", "Two light chains only", "One heavy chain only"],
    correctOptionId: "a",
    explanation: "A Fab fragment contains portions of one heavy chain and one light chain. In the displayed 1MLC complex, the viewer labels these antibody chains B and A, respectively."
  },
  {
    id: "pdb-chain-map",
    topicId: "antibody-structure",
    topic: "Antibody structure",
    level: "Basic",
    type: "Recall",
    prompt: "In this module's 1MLC view, which chain is labelled as the antigen?",
    options: ["Chain A", "Chain B", "Chain E", "Chain L"],
    correctOptionId: "c",
    explanation: "The viewer identifies chain E as hen egg-white lysozyme, the antigen. The A/B/E labels describe this displayed structure, not a universal chain naming rule."
  },
  {
    id: "antigen-definition",
    topicId: "antigen-recognition",
    topic: "Antigen recognition",
    level: "Basic",
    type: "Recall",
    prompt: "What is an antigen in the context of antibody recognition?",
    options: ["A target molecule recognised by an antibody", "A chain that always belongs to an antibody", "A type of covalent bond", "A measure of X-ray resolution"],
    correctOptionId: "a",
    explanation: "An antigen is the target recognised by an antibody. In this model, lysozyme is the antigen and the antibody Fab is the binding partner."
  },
  {
    id: "variable-region",
    topicId: "antigen-recognition",
    topic: "Antigen recognition",
    level: "Intermediate",
    type: "Recall",
    prompt: "Which part of an antibody contributes most directly to distinguishing one antigen surface from another?",
    options: ["The variable regions of the heavy and light chains", "The constant region alone", "The antigen's chain label", "The PDB entry number"],
    correctOptionId: "a",
    explanation: "The variable regions of both chains form the antigen-binding site and provide much of its recognition specificity. A chain label or structure identifier is only metadata."
  },
  {
    id: "component-selection",
    topicId: "structural-analysis",
    topic: "Structural analysis",
    level: "Basic",
    type: "Application",
    prompt: "You select chain B in the component inspector. Which component should the viewer focus?",
    options: ["The light chain", "The heavy chain", "The lysozyme antigen", "All chains equally"],
    correctOptionId: "b",
    explanation: "In this module's chain mapping, chain B is the heavy chain. Component mode focuses whichever chain is selected; the mapping is specific to this displayed 1MLC model."
  },
  {
    id: "interface-cutoff",
    topicId: "interface-analysis",
    topic: "Interface analysis",
    level: "Intermediate",
    type: "Application",
    prompt: "The viewer marks residues within 5 Å of the partner chain. What does this selection establish?",
    options: ["Geometric proximity under the chosen cutoff", "A measured binding energy", "That every selected atom forms a hydrogen bond", "That the interface is permanent in solution"],
    correctOptionId: "a",
    explanation: "A distance cutoff identifies nearby atoms and, with residue expansion, marks their residues. It is a geometric filter and does not by itself measure binding energy or identify a specific bond."
  },
  {
    id: "byres-expansion",
    topicId: "interface-analysis",
    topic: "Interface analysis",
    level: "Intermediate",
    type: "Reasoning",
    prompt: "Why does the viewer expand close atom contacts to whole residues for its interface display?",
    options: ["To make the structural context of each nearby residue visible", "To prove every atom in each residue contacts the partner", "To calculate the antibody's affinity", "To change the measured atom distances"],
    correctOptionId: "a",
    explanation: "Residue expansion is a visualization choice that makes complete residues easier to inspect. It does not mean every atom in an expanded residue is within 5 Å."
  },
  {
    id: "noncovalent-forces",
    topicId: "molecular-interactions",
    topic: "Molecular interactions",
    level: "Basic",
    type: "Recall",
    prompt: "Which statement best describes typical molecular forces contributing to protein-protein recognition?",
    options: ["Several non-covalent interactions can contribute together", "Recognition always requires a new covalent bond", "Only one universal interaction type is involved", "Chain proximity alone identifies the force"],
    correctOptionId: "a",
    explanation: "Protein-protein recognition can reflect a combination of non-covalent contributions, including electrostatic, hydrogen-bonding, van der Waals and hydrophobic effects. A distance display alone cannot assign which specific interaction occurs."
  },
  {
    id: "hydrogen-bond-evidence",
    topicId: "molecular-interactions",
    topic: "Molecular interactions",
    level: "Advanced",
    type: "Reasoning",
    prompt: "A contact residue appears in the 5 Å interface highlight. Can you conclude it forms a hydrogen bond with the other protein?",
    options: ["No; the cutoff shows proximity, not a bond assignment", "Yes; every highlighted contact is a hydrogen bond", "Yes, if the residue is in chain B", "No; hydrogen bonds are covalent"],
    correctOptionId: "a",
    explanation: "The highlight is based on distance between atoms, not donor-acceptor geometry or a hydrogen-bond analysis. A contact may have other explanations, so the display alone does not support that assignment."
  },
  {
    id: "atomic-view-meaning",
    topicId: "structural-analysis",
    topic: "Structural analysis",
    level: "Intermediate",
    type: "Application",
    prompt: "What is the main benefit of the Atomic mode in this module?",
    options: ["Inspect atom-level stick detail at residues selected by the interface cutoff", "Watch the proteins move over time", "Read out binding affinity directly", "Identify all chemical bonds between the proteins"],
    correctOptionId: "a",
    explanation: "Atomic mode changes the representation of the cutoff-selected interface residues to sticks while keeping cartoon context. It is a static structural view, not a simulation or an affinity calculation."
  },
  {
    id: "static-structure",
    topicId: "structural-analysis",
    topic: "Structural analysis",
    level: "Intermediate",
    type: "Reasoning",
    prompt: "What can a single experimentally determined complex structure show most directly?",
    options: ["A model of the bound arrangement captured for that experiment", "The full time course of binding", "The exact strength of binding in every condition", "That the proteins never adopt other conformations"],
    correctOptionId: "a",
    explanation: "A structure provides a model of one observed bound arrangement. It does not show the full binding pathway, all conformations, or affinity under every condition."
  },
  {
    id: "resolution-interpretation",
    topicId: "structural-analysis",
    topic: "Structural analysis",
    level: "Advanced",
    type: "Reasoning",
    prompt: "The source panel reports a 2.50 Å X-ray structure. Which interpretation is most careful?",
    options: ["It describes the reported structural resolution, not a binding distance", "It means every atom is exactly 2.50 Å from its partner", "It is the interface cutoff used by the viewer", "It is a direct measurement of binding strength"],
    correctOptionId: "a",
    explanation: "Resolution describes the detail of the crystallographic model. It is distinct from the viewer's 5 Å contact cutoff and from thermodynamic measures such as binding affinity."
  },
  {
    id: "compare-interface",
    topicId: "interface-analysis",
    topic: "Interface analysis",
    level: "Advanced",
    type: "Reasoning",
    prompt: "Two residues are both highlighted by the 5 Å rule. What can you infer about their relative energetic importance from that fact alone?",
    options: ["Nothing quantitative; proximity alone does not rank energetic contributions", "They contribute exactly the same energy", "The residue with more atoms must bind more strongly", "The antigen-side residue must be more important"],
    correctOptionId: "a",
    explanation: "The cutoff reports geometric proximity only. Ranking energetic contributions would require additional analyses and evidence beyond this view."
  },
  {
    id: "selection-vs-identity",
    topicId: "structural-analysis",
    topic: "Structural analysis",
    level: "Advanced",
    type: "Application",
    prompt: "A residue is coloured gold in Interface mode. Which conclusion is supported by the viewer's encoding?",
    options: ["It belongs to the antigen-side set selected by the 5 Å rule", "It is a specific amino acid proven to drive binding", "It forms a gold-coloured chemical bond", "It is part of antibody chain B"],
    correctOptionId: "a",
    explanation: "Gold encodes the antigen-side residue set selected by the viewer's distance rule. The colour does not identify amino-acid chemistry or prove a causal role in binding."
  },
  {
    id: "interpretation-next-step",
    topicId: "molecular-interactions",
    topic: "Molecular interactions",
    level: "Advanced",
    type: "Reasoning",
    prompt: "You want to test whether a proposed polar contact contributes to recognition. What is the best next step?",
    options: ["Use suitable geometric/chemical analysis and independent evidence", "Treat the interface colour as proof", "Assume the closest atoms form a covalent bond", "Infer the answer from chain letters"],
    correctOptionId: "a",
    explanation: "A contact hypothesis needs evidence appropriate to that interaction, such as donor/acceptor geometry and chemical context, and may benefit from additional experimental or computational analysis. The current colour coding alone is insufficient."
  }
].map(question => ({
  ...question,
  options: question.options.map((text, index) => ({
    id: String.fromCharCode(97 + index),
    text
  }))
}));

const createAssessment = () => ({
  assessmentId: "immunology-antigen-recognition-v1",
  moduleId: "immunology",
  schemaVersion: 1,
  status: "in_progress",
  startedAt: new Date().toISOString(),
  completedAt: null,
  responses: []
});

export default function ImmunologyWorkspace() {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  const [selected, setSelected] = useState("antigen");
  const [viewMode, setViewMode] = useState("overview");
  const [activeTab, setActiveTab] = useState("structure");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizIndex, setQuizIndex] = useState(0);
  const [assessment, setAssessment] = useState(createAssessment);
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

    // Rebuild styles from a clean base on each mode/selection change. Interface
    // and atomic overlays are added only after the context cartoons are set.
    viewer.setStyle({}, {});
    Object.entries(parts).forEach(([id, part]) => {
      const selectedHere = id === selected;
      if (viewMode === "overview") {
        viewer.setStyle({ chain: part.chain }, { cartoon: { color: chainColors[part.chain] } });
      } else if (viewMode === "component" && selectedHere) {
        viewer.setStyle({ chain: part.chain }, { cartoon: { color: part.color, opacity: 1 } });
      } else {
        viewer.setStyle({ chain: part.chain }, {
          cartoon: {
            color: viewMode === "component" ? "#53677b" : chainColors[part.chain],
            opacity: viewMode === "component" ? 0.2 : viewMode === "atomic" ? 0.3 : 0.72
          }
        });
      }
    });

    if (viewMode === "interface") {
      viewer.addStyle(antibodyInterface, { cartoon: { color: interfaceColors.antibody, opacity: 1 } });
      viewer.addStyle(antigenInterface, { cartoon: { color: interfaceColors.antigen, opacity: 1 } });
      viewer.zoomTo(antigenInterface, 500);
    } else if (viewMode === "atomic") {
      viewer.addStyle(antibodyInterface, { stick: { color: interfaceColors.antibody, radius: 0.18 } });
      viewer.addStyle(antigenInterface, { stick: { color: interfaceColors.antigen, radius: 0.18 } });
      viewer.zoomTo(antigenInterface, 500);
    } else if (viewMode === "component") {
      viewer.zoomTo({ chain: parts[selected]?.chain }, 500);
    } else {
      viewer.zoomTo();
    }
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
    viewerRef.current?.zoomTo();
    viewerRef.current?.render();
  };

  const currentQuestion = quizQuestions[quizIndex];
  const score = assessment.responses.filter(response => response.isCorrect).length;
  const topicResults = Object.values(quizQuestions.reduce((groups, question) => {
    const group = groups[question.topicId] || {
      topicId: question.topicId,
      topic: question.topic,
      total: 0,
      correct: 0
    };
    const response = assessment.responses.find(item => item.questionId === question.id);
    group.total += 1;
    if (response?.isCorrect) group.correct += 1;
    groups[question.topicId] = group;
    return groups;
  }, {}));

  const recordAnswer = () => {
    if (!currentQuestion || !answer) return;
    const response = {
      questionId: currentQuestion.id,
      topicId: currentQuestion.topicId,
      selectedOptionId: answer,
      isCorrect: answer === currentQuestion.correctOptionId,
      answeredAt: new Date().toISOString()
    };
    setAssessment(previous => ({
      ...previous,
      responses: [
        ...previous.responses.filter(item => item.questionId !== currentQuestion.id),
        response
      ]
    }));
    setChecked(true);
  };

  const navigateQuiz = direction => {
    const nextIndex = quizIndex + direction;
    if (nextIndex >= quizQuestions.length) {
      setAssessment(previous => ({
        ...previous,
        status: "completed",
        completedAt: previous.completedAt || new Date().toISOString()
      }));
      setQuizIndex(quizQuestions.length);
      setAnswer("");
      setChecked(false);
      return;
    }
    if (nextIndex < 0) return;
    const nextResponse = assessment.responses.find(
      response => response.questionId === quizQuestions[nextIndex].id
    );
    setQuizIndex(nextIndex);
    setAnswer(nextResponse?.selectedOptionId || "");
    setChecked(Boolean(nextResponse));
  };

  const restartQuiz = () => {
    setAssessment(createAssessment());
    setQuizIndex(0);
    setAnswer("");
    setChecked(false);
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
            <span><i style={{ background: parts.light.color }} /> Light chain A</span>
            <span><i style={{ background: parts.heavy.color }} /> Heavy chain B</span>
            <span><i style={{ background: parts.antigen.color }} /> Antigen E</span>
          </div>

          <div className="imm-view-modes" role="group" aria-label="Molecular viewing mode">
            {["overview", "component", "interface", "atomic"].map(mode => (
              <button key={mode} className={viewMode === mode ? "selected" : ""}
                aria-pressed={viewMode === mode} onClick={() => setViewMode(mode)}>
                {mode === "component" ? "Component" : mode[0].toUpperCase() + mode.slice(1)}
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
        <section className="imm-learning-card imm-quiz-card">
          <div className="imm-panel-label">KNOWLEDGE CHECK · {quizQuestions.length} QUESTIONS</div>
          {quizIndex < quizQuestions.length ? (
            <>
              <div className="imm-quiz-progress" aria-label={`Question ${quizIndex + 1} of ${quizQuestions.length}`}>
                {quizQuestions.map((question, index) => {
                  const response = assessment.responses.find(item => item.questionId === question.id);
                  const stateClass = response
                    ? response.isCorrect ? "correct" : "wrong"
                    : index === quizIndex ? "current" : "";
                  return <span key={question.id} className={stateClass} />;
                })}
              </div>
              <div className="imm-quiz-count">Question {quizIndex + 1} of {quizQuestions.length}</div>
              <div className="imm-question-meta">
                <span>{currentQuestion.topic}</span>
                <span>{currentQuestion.level}</span>
                <span>{currentQuestion.type}</span>
              </div>
              <h2>{currentQuestion.prompt}</h2>
              <div className="imm-answers imm-quiz-options">
                {currentQuestion.options.map(option => {
                  const isCorrectOption = option.id === currentQuestion.correctOptionId;
                  const isChosenWrong = checked && answer === option.id && !isCorrectOption;
                  return (
                    <button
                      key={option.id}
                      className={`${answer === option.id ? "chosen" : ""} ${checked && isCorrectOption ? "answer-correct" : ""} ${isChosenWrong ? "answer-wrong" : ""}`}
                      onClick={() => {
                        setAnswer(option.id);
                        setChecked(false);
                      }}
                      aria-pressed={answer === option.id}
                    >
                      <span className="imm-option-letter">{option.id.toUpperCase()}</span>
                      {option.text}
                    </button>
                  );
                })}
              </div>
              {checked && (
                <div className={`imm-explanation ${answer === currentQuestion.correctOptionId ? "is-correct" : "is-wrong"}`} role="status">
                  <strong>{answer === currentQuestion.correctOptionId ? "Correct" : "Review this one"}</strong>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}
              <div className="imm-quiz-actions">
                <button className="imm-quiz-secondary" onClick={() => navigateQuiz(-1)} disabled={quizIndex === 0}>
                  <ChevronLeft size={17} /> Previous
                </button>
                {!checked ? (
                  <button className="imm-check-button" disabled={!answer} onClick={recordAnswer}>
                    Check answer
                  </button>
                ) : (
                  <button className="imm-check-button" onClick={() => navigateQuiz(1)}>
                    {quizIndex === quizQuestions.length - 1 ? "See results" : "Next question"}
                    {quizIndex < quizQuestions.length - 1 && <ChevronRight size={17} />}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="imm-quiz-results">
              <div className="imm-score-badge">{score}<span>/{quizQuestions.length}</span></div>
              <h2>Quiz complete</h2>
              <p className="imm-quiz-summary">
                You answered {score} of {quizQuestions.length} questions correctly.
              </p>
              <h3>Results by topic</h3>
              <div className="imm-topic-results">
                {topicResults.map(topic => (
                  <div className="imm-topic-result" key={topic.topicId}>
                    <span>{topic.topic}</span>
                    <strong>{topic.correct} / {topic.total}</strong>
                    <div className="imm-topic-track" aria-label={`${topic.topic}: ${topic.correct} of ${topic.total} correct`}>
                      <span style={{ width: `${topic.total ? topic.correct / topic.total * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="imm-check-button" onClick={restartQuiz}>Try again</button>
            </div>
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
