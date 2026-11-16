
import { Sparkles, ArrowUp } from "lucide-react";

export default function PromptBar({ prompt, setPrompt, onGenerate }) {
  return (
    <div className="prompt-bar">
      <Sparkles size={20} />

      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onGenerate();
        }}
        placeholder="Describe a biological concept to explore..."
      />

      <button onClick={onGenerate} aria-label="Generate scene">
        Generate <ArrowUp size={16} />
      </button>
    </div>
  );
}
