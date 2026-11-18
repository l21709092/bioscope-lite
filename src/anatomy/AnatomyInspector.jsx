import { useState, useMemo } from "react";
import {
  BookOpen,
  Lightbulb,
  BrainCircuit,
  HelpCircle,
  Layers,
  Heart,
  ExternalLink,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { resolveEducation, GLOBAL_ANATOMY_EDUCATION } from "./anatomyEducation";
import { ORGAN_MAP } from "./organStudioData";
import { SYSTEMS, structuresFor } from "./anatomydata";

export default function AnatomyInspector({
  selectedId,
  selectedOrganId,
  topic,
  setTopic,
  setSelectedOrganId,
  sex = "female",
  onSelectPart = () => {},
  searchQuery = "",
}) {
  const [activeTab, setActiveTab] = useState("overview"); // overview, facts, mnemonics, quiz, structures
  
  // Quiz state
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [globalQuizMode, setGlobalQuizMode] = useState(false);

  // Resolve educational dataset based on active organ / selected part
  const education = useMemo(() => {
    if (globalQuizMode) return GLOBAL_ANATOMY_EDUCATION;
    if (topic === "organ" && selectedOrganId) {
      return resolveEducation(selectedOrganId);
    }
    if (selectedId) {
      return resolveEducation(selectedId);
    }
    return resolveEducation(selectedOrganId || "heart");
  }, [topic, selectedOrganId, selectedId, globalQuizMode]);

  const quizzes = education.quizzes || GLOBAL_ANATOMY_EDUCATION.quizzes;
  const currentQuestion = quizzes[currentQuizIdx] || quizzes[0];

  const handleSelectOption = (index) => {
    if (selectedOption !== null) return; // already answered
    setSelectedOption(index);
    if (index === currentQuestion.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIdx + 1 < quizzes.length) {
      setCurrentQuizIdx((idx) => idx + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuizIdx(0);
    setSelectedOption(null);
    setScore(0);
    setQuizFinished(false);
  };

  // Structures for the directory tab
  const allParts = useMemo(() => structuresFor(sex), [sex]);
  const needle = searchQuery.trim().toLowerCase();
  const filteredParts = useMemo(() => {
    if (!needle) return allParts;
    return allParts.filter(
      (p) =>
        p.label.toLowerCase().includes(needle) ||
        p.system.toLowerCase().includes(needle)
    );
  }, [allParts, needle]);

  return (
    <aside className="anatomy-inspector-card">
      {/* Header with Title, System Pill, and Quick Actions */}
      <div className="inspector-head">
        <div className="inspector-title-row">
          <div>
            <div className="inspector-eyebrow">
              <span
                className="inspector-pill-dot"
                style={{ background: education.badgeColor || "#5eead4" }}
              />
              <span>{education.system}</span>
            </div>
            <h2 className="inspector-main-title">{education.title}</h2>
            {education.latinName && (
              <span className="inspector-latin">{education.latinName}</span>
            )}
          </div>

          {/* Mode Jump Buttons */}
          <div className="inspector-quick-actions">
            {topic === "atlas" ? (
              <button
                className="action-btn-studio"
                onClick={() => {
                  if (selectedId) {
                    const matchedPreset = Object.values(ORGAN_MAP).find(
                      (p) => p.meshes.includes(selectedId) || p.primaryKey === selectedId
                    );
                    if (matchedPreset) setSelectedOrganId(matchedPreset.id);
                  }
                  setTopic("organ");
                }}
                title="Isolate and inspect this structure in 3D Organ Studio"
              >
                <Maximize2 size={13} />
                <span>Isolate in 3D</span>
              </button>
            ) : (
              <button
                className="action-btn-studio secondary"
                onClick={() => setTopic("atlas")}
                title="Return to the Full Human Body Atlas"
              >
                <Minimize2 size={13} />
                <span>Body Atlas</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick jump to Cardiac Cycle when heart is selected */}
        {(education.title.toLowerCase().includes("heart") ||
          selectedId === "heart" ||
          selectedOrganId === "heart") && (
          <button
            className="cardiac-shortcut-btn"
            onClick={() => setTopic("circulation")}
          >
            <Heart size={14} />
            <span>Launch Live Cardiac Circulation Simulation</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="inspector-tabs" role="tablist">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <BookOpen size={14} />
          <span>Overview</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "facts" ? "active" : ""}`}
          onClick={() => setActiveTab("facts")}
        >
          <Lightbulb size={14} />
          <span>Facts</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "mnemonics" ? "active" : ""}`}
          onClick={() => setActiveTab("mnemonics")}
        >
          <BrainCircuit size={14} />
          <span>Mnemonics</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "quiz" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("quiz");
            handleResetQuiz();
          }}
        >
          <HelpCircle size={14} />
          <span>Quiz</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "structures" ? "active" : ""}`}
          onClick={() => setActiveTab("structures")}
        >
          <Layers size={14} />
          <span>Catalog</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="inspector-tab-content">
          {education.stats && (
            <div className="stats-mini-grid">
              {Object.entries(education.stats).map(([k, v]) => (
                <div key={k} className="stat-mini-card">
                  <span className="stat-mini-key">{k.replace(/([A-Z])/g, " $1")}</span>
                  <strong className="stat-mini-val">{v}</strong>
                </div>
              ))}
            </div>
          )}

          <div className="overview-text-block">
            <h4 className="section-label">PHYSIOLOGICAL MECHANISM</h4>
            <p className="overview-desc">{education.overview}</p>
          </div>

          {/* Substructure / Landmark highlights */}
          {ORGAN_MAP[selectedOrganId]?.landmarks && (
            <div className="landmarks-block">
              <h4 className="section-label">ANATOMICAL LANDMARKS</h4>
              <div className="landmarks-list">
                {ORGAN_MAP[selectedOrganId].landmarks.map((lm, i) => (
                  <div key={i} className="landmark-item">
                    <span className="landmark-bullet" />
                    <div>
                      <strong className="landmark-name">{lm.name}</strong>
                      <p className="landmark-role">{lm.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: High-Yield Medical Facts */}
      {activeTab === "facts" && (
        <div className="inspector-tab-content">
          <div className="facts-intro">
            <Sparkles size={16} className="text-teal" />
            <span>High-Yield Medical & Physiological Facts</span>
          </div>

          <div className="facts-cards-stack">
            {education.facts?.map((fact) => (
              <div key={fact.id} className="fact-card">
                <div className="fact-header">
                  <span className="fact-tag">{fact.tag}</span>
                  <h4 className="fact-title">{fact.title}</h4>
                </div>
                <p className="fact-desc">{fact.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Medical Mnemonics */}
      {activeTab === "mnemonics" && (
        <div className="inspector-tab-content">
          <div className="mnemonics-intro">
            <span>High-Yield Memory Aids for Clinical Rounds & Exams</span>
          </div>

          <div className="mnemonics-stack">
            {education.mnemonics?.map((m) => (
              <div key={m.id} className="mnemonic-card">
                <div className="mnemonic-head">
                  <h4 className="mnemonic-name">{m.name}</h4>
                  <span className="mnemonic-purpose">{m.purpose}</span>
                </div>

                <div className="mnemonic-phrase-box">
                  <span className="phrase-badge">MEMORY HOOK</span>
                  <div className="phrase-text">{m.phrase}</div>
                </div>

                <div className="mnemonic-breakdown">
                  {m.breakdown?.map((item, idx) => (
                    <div key={idx} className="breakdown-row">
                      <span className="breakdown-letter">{item.letter}</span>
                      <span className="breakdown-meaning">{item.meaning}</span>
                    </div>
                  ))}
                </div>

                {m.clinicalPearl && (
                  <div className="mnemonic-pearl">
                    <strong>Clinical Pearl:</strong> {m.clinicalPearl}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Interactive Quiz Questions */}
      {activeTab === "quiz" && (
        <div className="inspector-tab-content">
          {!quizFinished ? (
            <div className="quiz-container">
              <div className="quiz-progress-row">
                <span className="quiz-step">
                  Question {currentQuizIdx + 1} of {quizzes.length}
                </span>
                <span className="quiz-score-badge">
                  Score: {score} / {quizzes.length}
                </span>
              </div>

              <div className="question-card">
                <h3 className="question-title">{currentQuestion.question}</h3>

                <div className="quiz-options-list">
                  {currentQuestion.options.map((opt, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const isCorrect = optIdx === currentQuestion.correctIndex;
                    let optionClass = "quiz-option-btn";

                    if (selectedOption !== null) {
                      if (isCorrect) optionClass += " correct";
                      else if (isSelected) optionClass += " incorrect";
                      else optionClass += " disabled";
                    }

                    return (
                      <button
                        key={optIdx}
                        className={optionClass}
                        onClick={() => handleSelectOption(optIdx)}
                        disabled={selectedOption !== null}
                      >
                        <span className="option-letter">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="option-text">{opt}</span>
                        {selectedOption !== null && isCorrect && (
                          <CheckCircle2 size={16} className="option-icon correct" />
                        )}
                        {selectedOption !== null && isSelected && !isCorrect && (
                          <XCircle size={16} className="option-icon incorrect" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                {selectedOption !== null && (
                  <div className="explanation-card animate-slide-up">
                    <div className="explanation-header">
                      {selectedOption === currentQuestion.correctIndex ? (
                        <span className="result-tag correct">
                          <CheckCircle2 size={14} /> Correct!
                        </span>
                      ) : (
                        <span className="result-tag incorrect">
                          <XCircle size={14} /> Incorrect
                        </span>
                      )}
                    </div>
                    <p className="explanation-text">{currentQuestion.explanation}</p>

                    <button
                      className="next-question-btn"
                      onClick={handleNextQuestion}
                    >
                      <span>
                        {currentQuizIdx + 1 < quizzes.length
                          ? "Next Question"
                          : "Finish Quiz"}
                      </span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Completed View */
            <div className="quiz-finished-card animate-fade-in">
              <div className="trophy-icon-wrap">
                <Sparkles size={36} className="text-teal" />
              </div>
              <h3>Quiz Complete!</h3>
              <p className="finished-score">
                You scored <strong>{score}</strong> out of{" "}
                <strong>{quizzes.length}</strong> ({Math.round((score / quizzes.length) * 100)}%)
              </p>
              <p className="finished-feedback">
                {score === quizzes.length
                  ? "Outstanding mastery! You have full command of this anatomical structure."
                  : score >= quizzes.length / 2
                  ? "Great job! Review the facts and mnemonics to solidify high-yield details."
                  : "Good effort! Go through the 3D specimen and mnemonics, then test yourself again."}
              </p>

              <div className="quiz-finish-actions">
                <button className="quiz-retry-btn" onClick={handleResetQuiz}>
                  <RotateCcw size={14} />
                  <span>Retry Quiz</span>
                </button>
                <button
                  className="quiz-global-toggle-btn"
                  onClick={() => {
                    setGlobalQuizMode(!globalQuizMode);
                    handleResetQuiz();
                  }}
                >
                  <span>{globalQuizMode ? "Organ Quiz" : "Test All Systems"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Structures Catalog */}
      {activeTab === "structures" && (
        <div className="inspector-tab-content">
          <p className="structures-meta">
            Showing {filteredParts.length} structures in the reference model:
          </p>
          <div className="structures-scroll-list">
            {SYSTEMS.filter((s) => s.id !== "all").map((system) => {
              const parts = filteredParts.filter((p) => p.system === system.id);
              if (!parts.length) return null;

              return (
                <div key={system.id} className="system-group-block">
                  <div className="system-group-header">
                    <span>{system.label}</span>
                    <small>({parts.length})</small>
                  </div>
                  <div className="system-parts-chips">
                    {parts.map((part) => (
                      <button
                        key={part.key}
                        className={`structure-chip ${selectedId === part.key ? "active" : ""}`}
                        onClick={() => onSelectPart(part.key)}
                      >
                        <span
                          className="chip-color-dot"
                          style={{ background: part.color }}
                        />
                        <span>{part.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer link to OpenStax Anatomy Textbook */}
      <div className="inspector-footer">
        <a
          href="https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction"
          target="_blank"
          rel="noreferrer"
          className="openstax-link"
        >
          <BookOpen size={14} />
          <span>OpenStax Anatomy & Physiology Reference</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </aside>
  );
}
