
import { useState } from "react";
import PromptBar from "./PromptBar";
import Viewer from "./Viewer";
import Inspector from "./Inspector";

export default function Workspace() {
  const [prompt, setPrompt] = useState("");
  const [playing, setPlaying] = useState(true);

  const generateScene = () => {
    if (!prompt.trim()) return;

    alert("Scene generation will be connected in the next phase!");
  };

  const resetScene = () => {
    setPlaying(false);
    setPrompt("");
  };

  return (
    <main className="workspace">
      <section className="welcome">
        <p className="eyebrow">EXPLORE THE SCIENCE OF LIFE</p>

        <h1>Biology, brought to life.</h1>

        <p>
          Turn biological concepts into interactive 3D experiences.
        </p>
      </section>

      <PromptBar
        prompt={prompt}
        setPrompt={setPrompt}
        onGenerate={generateScene}
      />

      <div className="exploration-grid">
        <Viewer
          playing={playing}
          setPlaying={setPlaying}
          onReset={resetScene}
        />

        <Inspector />
      </div>
    </main>
  );
}
