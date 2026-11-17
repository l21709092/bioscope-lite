
import { useState } from "react";
import PromptBar from "./promptbar";
import Viewer from "./viewer";
import Inspector from "./inspector";
import DnaQuiz from "./dnaquiz.jsx";

export default function Workspace({
  activeSection,
  searchQuery,
  selectedStructure,
  onSelectStructure,
}) {
  const [prompt, setPrompt] = useState("");
  const [selectedAtom, setSelectedAtom] = useState(null);

  const generateScene = () => {
    if (!prompt.trim()) return;

    alert(
      "Custom scene generation is our next development milestone!"
    );
  };

  // EXPLORE PAGE
  if (activeSection === "Explore") {
    return (
      <main className="workspace">
        <section className="welcome">
          <p className="eyebrow">
            EXPLORE THE SCIENCE OF LIFE
          </p>

          <h1>Biology, brought to life.</h1>

          <p>
            Explore real biological structures in interactive 3D.
          </p>
        </section>

        <PromptBar
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={generateScene}
        />
      </main>
    );
  }

  // MOLECULAR BIOLOGY LIBRARY
  if (
    activeSection === "Molecular Biology" &&
    !selectedStructure
  ) {
    return (
      <main className="workspace">
        <section className="welcome">
          <p className="eyebrow">MOLECULAR BIOLOGY</p>

          <h1>Explore molecular structures.</h1>

          <p>
            Select a biological structure from the navigation
            panel to begin exploring it in 3D.
          </p>
        </section>
      </main>
    );
  }

  // DNA 3D VIEWER + INTERACTIVE QUIZ
  if (
    activeSection === "Molecular Biology" &&
    selectedStructure?.id === "dna"
  ) {
    return (
      <main className="workspace">

        <section className="welcome">
          <p className="eyebrow">
            MOLECULAR BIOLOGY / DNA
          </p>

          <h1>DNA Explorer</h1>

          <p>
            Explore the double helix and inspect its molecular
            components interactively.
          </p>
        </section>

        {/* 3D VIEWER AND INSPECTOR */}
        <div className="exploration-grid">
          <Viewer onSelect={setSelectedAtom} />

          <Inspector selectedAtom={selectedAtom} />
        </div>

        {/* SINGLE INTERACTIVE QUIZ */}
        <DnaQuiz selectedAtom={selectedAtom} />

      </main>
    );
  }

  // OTHER MOLECULAR STRUCTURES
  if (
    activeSection === "Molecular Biology" &&
    selectedStructure
  ) {
    return (
      <main className="workspace">
        <section className="welcome">
          <p className="eyebrow">MOLECULAR BIOLOGY</p>

          <h1>{selectedStructure.name}</h1>

          <p>
            {selectedStructure.description ||
              "This biological structure is coming soon."}
          </p>
        </section>
      </main>
    );
  }

  // OTHER CATEGORIES
  return (
    <main className="workspace">
      <section className="welcome">
        <p className="eyebrow">
          {activeSection?.toUpperCase()}
        </p>

        <h1>Explore {activeSection}.</h1>

        <p>
          Interactive biological explorations for this category
          are coming soon.
        </p>
      </section>
    </main>
  );
}
