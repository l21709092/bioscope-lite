
import { Play, Pause, RotateCcw, Maximize2 } from "lucide-react";

export default function Viewer({ playing, setPlaying, onReset }) {
  return (
    <section className="viewer-panel">
      <div className="viewer-top">
        <div>
          <span className="live-dot" />
          LIVE 3D VIEWER
        </div>

        <span>INTERACTIVE MODE</span>
      </div>

      <div className="viewer-placeholder">
        <div className="viewer-message">
          <span>3D SCENE ENGINE</span>
          <h2>Your biological world awaits.</h2>
          <p>Generate a scene to begin exploring.</p>
        </div>
      </div>

      <div className="viewer-controls">
        <button onClick={() => setPlaying(!playing)}>
          {playing ? <Pause size={17} /> : <Play size={17} />}
          {playing ? "Pause" : "Play"}
        </button>

        <button onClick={onReset}>
          <RotateCcw size={17} />
          Reset
        </button>

        <button aria-label="Fullscreen">
          <Maximize2 size={17} />
        </button>
      </div>
    </section>
  );
}

