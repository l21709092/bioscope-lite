
import { useState } from "react";
import PromptBar from "./promptbar";
import Viewer from "./viewer";
import Inspector from "./inspector";

export default function Workspace() {
  const [prompt, setPrompt] = useState("");
  const [selectedAtom, setSelectedAtom] = useState(null);

  const generateScene = () => {
    if (!prompt.trim()) return;

    alert(
      "Custom scene generation is our next development milestone!"
    );
  };

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

      <div className="exploration-grid">
        <Viewer onSelect={setSelectedAtom} />

        <Inspector selectedAtom={selectedAtom} />
      </div>
    </main>
  );
}
