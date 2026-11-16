
import { useEffect, useRef, useState } from "react";
import * as $3Dmol from "3dmol";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MousePointer2
} from "lucide-react";

export default function Viewer({ onSelect }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mouseSensitive, setMouseSensitive] = useState(true);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;
    let viewer = null;

    async function loadMolecule() {
      try {
        viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: "#0b1220",
          antialias: true
        });

        const response = await fetch(
          "https://files.rcsb.org/download/1BNA.pdb"
        );

        if (!response.ok) {
          throw new Error("Could not download the DNA structure.");
        }

        const pdbData = await response.text();

        if (cancelled) return;

        viewer.addModel(pdbData, "pdb");

        viewer.setStyle({}, {
          stick: { radius: 0.16 },
          sphere: { scale: 0.22 }
        });

        viewer.zoomTo();

        viewer.setClickable({}, true, (atom) => {
          const selected = {
            atom: atom.atom,
            element: atom.elem,
            residue: atom.resn,
            residueNumber: atom.resi,
            chain: atom.chain
          };

          onSelect(selected);

          viewer.zoomTo({
            chain: atom.chain,
            resi: atom.resi
          }, 500);

          viewer.render();
        });

        viewer.render();
        viewerRef.current = viewer;
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong loading DNA.");
          setLoading(false);
        }
      }
    }

    loadMolecule();

    return () => {
  cancelled = true;

  if (viewer && typeof viewer.clear === "function") {
    viewer.clear();
  }

  viewerRef.current = null;
};
  }, [onSelect]);

  const handleMouseMove = (event) => {
    if (!mouseSensitive) return;

    const rect = event.currentTarget.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    setTilt({
      x: (0.5 - y) * 7,
      y: (x - 0.5) * 7
    });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  const zoomIn = () => {
    viewerRef.current?.zoom(1.4, 300);
    viewerRef.current?.render();
  };

  const zoomOut = () => {
    viewerRef.current?.zoom(0.7, 300);
    viewerRef.current?.render();
  };

  const resetView = () => {
    viewerRef.current?.zoomTo({}, 500);
    viewerRef.current?.render();
    resetTilt();
  };

  return (
    <section className="viewer-panel">
      <div className="viewer-top">
        <div>
          <span className="live-dot" />
          LIVE MOLECULAR VIEWER
        </div>
        <span>DNA · PDB: 1BNA</span>
      </div>

      <div
        className="molecule-stage"
        onPointerMove={handleMouseMove}
        onPointerLeave={resetTilt}
      >
        <div
          ref={containerRef}
          className="molecule-canvas"
          style={{
            transform: mouseSensitive
              ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
              : "none"
          }}
        />

        {loading && (
          <div className="viewer-overlay">
            Loading DNA structure...
          </div>
        )}

        {error && (
          <div className="viewer-overlay error-message">
            {error}
          </div>
        )}
      </div>

      <div className="viewer-controls">
        <button onClick={zoomIn}>
          <ZoomIn size={17} />
          Zoom in
        </button>

        <button onClick={zoomOut}>
          <ZoomOut size={17} />
          Zoom out
        </button>

        <button onClick={resetView}>
          <RotateCcw size={17} />
          Reset
        </button>

        <button
          className={mouseSensitive ? "sensitivity-active" : ""}
          onClick={() => {
            setMouseSensitive(!mouseSensitive);
            resetTilt();
          }}
        >
          <MousePointer2 size={17} />
          Cursor response: {mouseSensitive ? "ON" : "OFF"}
        </button>
      </div>

      <p className="viewer-hint">
        Drag to rotate · Scroll to zoom · Click an atom to inspect it
      </p>
    </section>
  );
}
