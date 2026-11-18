import { lazy, Suspense, useState } from "react";
import { Dna, Microscope } from "lucide-react";
import "./ImmunologyHub.css";

const MolecularWorkspace = lazy(() => import("./ImmunologyWorkspace"));
const CellularWorkspace = lazy(() => import("../scenes/cell"));

export default function ImmunologyHub() {
  const [section, setSection] = useState("molecular");
  const [cellularLoaded, setCellularLoaded] = useState(false);

  const openSection = nextSection => {
    setSection(nextSection);
    if (nextSection === "cellular") setCellularLoaded(true);
  };

  return (
    <div className="immunology-hub">
      <nav className="immunology-section-nav" aria-label="Immunology learning sections">
        <div className="immunology-section-heading">
          <span>IMMUNOLOGY LAB</span>
          <strong>Choose a scale to explore</strong>
        </div>
        <div className="immunology-section-tabs" role="group" aria-label="Molecular or cellular Immunology">
          <button aria-pressed={section === "molecular"} className={section === "molecular" ? "active" : ""} onClick={() => openSection("molecular")}>
            <Dna size={16} /> Molecular Immunology
          </button>
          <button aria-pressed={section === "cellular"} className={section === "cellular" ? "active" : ""} onClick={() => openSection("cellular")}>
            <Microscope size={16} /> Cellular Immunology
          </button>
        </div>
      </nav>
      <div hidden={section !== "molecular"}>
        <Suspense fallback={<div className="immunology-section-loading">Loading molecular Immunology…</div>}>
          <MolecularWorkspace />
        </Suspense>
      </div>
      {cellularLoaded && <div hidden={section !== "cellular"}>
        <Suspense fallback={<div className="immunology-section-loading">Loading cellular learning space…</div>}>
          <CellularWorkspace active={section === "cellular"} />
        </Suspense>
      </div>}
    </div>
  );
}
