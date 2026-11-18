import { useMemo, useState } from "react";
import { HeartPulse, Sparkles, User } from "lucide-react";
import AnatomyViewer from "./anatomyviewer";
import AnatomyControls from "./anatomycontrols";
import OrganStudioViewer from "./OrganStudioViewer";
import OrganSelectorStrip from "./OrganSelectorStrip";
import AnatomyInspector from "./AnatomyInspector";
import BloodFlow from "../simulations/bloodflow";
import { structuresFor } from "./anatomydata";
import { AnatomyContext } from "./anatomystate";
import { ORGAN_MAP, findPresetForPart } from "./organStudioData";

export default function AnatomySection({ searchQuery = "" }) {
  // Topics: "atlas" (Full 3D Body), "organ" (Isolated 3D Organ Studio), "circulation" (Cardiac Cycle)
  const [topic, setTopic] = useState("atlas");
  const [selectedOrganId, setSelectedOrganId] = useState("heart");
  const [system, setSystem] = useState("all");
  const [sex, setSex] = useState("female");
  const [spread, setSpread] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [viewKey, setViewKey] = useState(0);
  const [bpm, setBpm] = useState(72);
  const [phase, setPhase] = useState("Diastole · chambers filling");

  const onSelect = (id) => {
    setSelectedId(id);
    // If the selected part maps to an organ preset, also update selectedOrganId
    const preset = findPresetForPart(id);
    if (preset) {
      setSelectedOrganId(preset.id);
    }
  };

  const onHover = (id) => setHoverId((current) => (current === id ? current : id));

  const onResetView = () => {
    setSelectedId(null);
    setSpread(0);
    setViewKey((key) => key + 1);
  };

  const handleSelectOrganFromStrip = (organId) => {
    setSelectedOrganId(organId);
    setTopic("organ");
    const preset = ORGAN_MAP[organId];
    if (preset) {
      setSelectedId(preset.primaryKey);
    }
  };

  const api = useMemo(
    () => ({
      topic,
      setTopic,
      system,
      setSystem,
      sex,
      setSex,
      spread,
      setSpread,
      selectedId,
      hoverId,
      query: searchQuery,
      onSelect,
      onHover,
      onResetView,
      viewKey,
      bpm,
      setBpm,
      phase,
      onPhase: setPhase,
    }),
    [
      topic,
      system,
      sex,
      spread,
      selectedId,
      hoverId,
      searchQuery,
      viewKey,
      bpm,
      phase,
    ]
  );

  const structures = useMemo(() => structuresFor(sex), [sex]);
  return (
    <AnatomyContext.Provider value={api}>
      <main className="workspace anatomy-workspace">
        {/* Welcome Banner */}
        <section className="welcome anatomy-hero">
          <p className="eyebrow">HUMAN ANATOMY ATLAS & 3D ORGAN STUDIO</p>
          <h1>Interactive Human Anatomy</h1>
          <p>
            Explore 147 anatomical structures in 3D: inspect individual organs in isolated high-detail
            studio, dissect full-body systems, test your medical knowledge with interactive quizzes,
            and review high-yield mnemonics and clinical facts.
          </p>
        </section>

        {/* Stats Strip */}
        <div className="atlas-stats">
          <div>
            <span>3D Structures</span>
            <strong>{structures.length}</strong>
          </div>
          <div>
            <span>Organ Systems</span>
            <strong>7</strong>
          </div>
          <div>
            <span>3D Studio Specimens</span>
            <strong>10 Organs</strong>
          </div>
          <div>
            <span>Active Mode</span>
            <strong>
              {topic === "atlas"
                ? "Full Body Atlas"
                : topic === "organ"
                ? `${ORGAN_MAP[selectedOrganId]?.name || "3D Organ"} Studio`
                : "Cardiac Cycle"}
            </strong>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="topic-switch anatomy-mode-switch" role="tablist">
          <button
            className={topic === "atlas" ? "active" : ""}
            onClick={() => setTopic("atlas")}
          >
            <User size={16} />
            <span>3D Body Atlas</span>
          </button>
          <button
            className={topic === "organ" ? "active" : ""}
            onClick={() => setTopic("organ")}
          >
            <Sparkles size={16} />
            <span>3D Organ Studio</span>
          </button>
          <button
            className={topic === "circulation" ? "active" : ""}
            onClick={() => setTopic("circulation")}
          >
            <HeartPulse size={16} />
            <span>Blood Circulation</span>
          </button>
        </div>

        {/* Organ Selector Strip */}
        <OrganSelectorStrip
          activeOrganId={selectedOrganId}
          onSelectOrgan={handleSelectOrganFromStrip}
          isStudioActive={topic === "organ"}
        />

        {/* Main Grid: Left = 3D Viewer Panel, Right = Educational Inspector */}
        <div className="exploration-grid anatomy-grid">
          <section className="viewer-panel">
            <div className="viewer-top">
              <div className="viewer-top-title">
                <span className="live-dot" />
                {topic === "atlas"
                  ? "3D HUMAN BODY ATLAS"
                  : topic === "organ"
                  ? `3D ORGAN STUDIO · ${ORGAN_MAP[selectedOrganId]?.name?.toUpperCase() || "SPECIMEN"}`
                  : "CARDIAC CYCLE SIMULATOR"}
              </div>
              <span className="viewer-top-meta">
                {topic === "atlas"
                  ? `${sex} reference model`
                  : topic === "organ"
                  ? `${ORGAN_MAP[selectedOrganId]?.system || "Visceral"}`
                  : `${bpm} BPM`}
              </span>
            </div>

            {/* 3D Content Render Area */}
            {topic === "atlas" ? (
              <>
                <AnatomyControls />
                <AnatomyViewer />
                <p className="viewer-hint">
                  Hover over any part to reveal its name · Drag to rotate 360° · Scroll to zoom · Click to inspect
                </p>
              </>
            ) : topic === "organ" ? (
              <>
                <OrganStudioViewer
                  organId={selectedOrganId}
                  sex={sex}
                  selectedPart={selectedId}
                  onSelectPart={onSelect}
                />
                <p className="viewer-hint">
                  Hover over organ structures to reveal names · Use Camera presets to view Anterior, Posterior, Lateral & Superior
                </p>
              </>
            ) : (
              <>
                <BloodFlow />
                <p className="viewer-hint">
                  Blue blood enters the right heart, turns red in the lungs, and leaves through the aorta. Drag the heart rate to speed the pump and the flow.
                </p>
              </>
            )}
          </section>

          {/* Right Side: Educational Facts, Mnemonics, and Quiz Console */}
          <AnatomyInspector
            selectedId={selectedId}
            selectedOrganId={selectedOrganId}
            topic={topic}
            setTopic={setTopic}
            setSelectedOrganId={setSelectedOrganId}
            sex={sex}
            onSelectPart={onSelect}
            searchQuery={searchQuery}
          />
        </div>
      </main>
    </AnatomyContext.Provider>
  );
}
