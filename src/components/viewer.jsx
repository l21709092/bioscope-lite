
import { useEffect, useRef, useState } from "react";
import * as $3Dmol from "3dmol";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MousePointer2
} from "lucide-react";

// Identify which biological component was clicked.
function identifyDnaComponent(atom) {
  const atomName = (atom.atom || "").trim().toUpperCase();
  const residue = (atom.resn || "").trim().toUpperCase();

  const baseNames = {
    DA: "Adenine",
    DG: "Guanine",
    DC: "Cytosine",
    DT: "Thymine"
  };

  const baseName = baseNames[residue] || "Unknown base";

  const phosphateAtoms = [
    "P", "OP1", "OP2", "O1P", "O2P"
  ];

  const sugarAtoms = [
    "C1'", "C2'", "C3'", "C4'", "C5'",
    "O2'", "O3'", "O4'", "O5'"
  ];

  if (phosphateAtoms.includes(atomName)) {
    return {
      componentType: "phosphate_backbone",
      componentName: "Phosphate group",
      topic: "phosphate",
      description: "Part of the DNA sugar-phosphate backbone."
    };
  }

  if (sugarAtoms.includes(atomName)) {
    return {
      componentType: "deoxyribose_sugar",
      componentName: "Deoxyribose sugar",
      topic: "sugar",
      description: "Part of the sugar in a DNA nucleotide."
    };
  }

  if (baseNames[residue]) {
    return {
      componentType: "nitrogenous_base",
      componentName: baseName,
      topic: residue,
      description: `A nitrogenous base in DNA: ${baseName}.`
    };
  }

  return {
    componentType: "unknown_dna_atom",
    componentName: "DNA atom",
    topic: "general_dna",
    description: "An atom belonging to the DNA structure."
  };
}

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
        if (!containerRef.current) {
          throw new Error("DNA viewer container was not found.");
        }

        viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: "#0b1220",
          antialias: true
        });

        if (!viewer) {
          throw new Error(
            "3D viewer could not initialize. Check its container dimensions."
          );
        }

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

        // PROGRESSIVE MOLECULAR LABELLING
        let currentLabelLevel = -1;
        const initialView = viewer.getView();
        const initialDistance = 150 - initialView[3];
        const atoms = viewer.selectedAtoms({});

        function getLabelLevel(view) {
          const currentDistance = 150 - view[3];
          const zoomRatio = currentDistance / initialDistance;

          if (zoomRatio <= 0.28) return 3;
          if (zoomRatio <= 0.48) return 2;
          if (zoomRatio <= 0.72) return 1;

          return 0;
        }

        function createLabel(text, atom, fontSize = 11) {
          viewer.addLabel(text, {
            position: {
              x: atom.x,
              y: atom.y,
              z: atom.z
            },
            fontSize,
            fontColor: "#e2e8f0",
            backgroundColor: "#0b1220",
            backgroundOpacity: 0.8,
            borderThickness: 0,
            showBackground: true,
            inFront: true
          });
        }

        function updateMolecularLabels(view) {
          const nextLevel = getLabelLevel(view);

          if (nextLevel === currentLabelLevel) return;

          currentLabelLevel = nextLevel;
          viewer.removeAllLabels();

          if (nextLevel === 0) {
            viewer.render();
            return;
          }

          if (nextLevel >= 1) {
            const chains = [
              ...new Set(atoms.map((atom) => atom.chain))
            ];

            chains.forEach((chain, index) => {
              const phosphorus = atoms.find(
                (atom) =>
                  atom.chain === chain &&
                  atom.atom.trim() === "P"
              );

              if (phosphorus) {
                createLabel(
                  `DNA STRAND ${index + 1}`,
                  phosphorus,
                  13
                );
              }
            });
          }

          if (nextLevel >= 2) {
            const labelledResidues = new Set();

            atoms.forEach((atom) => {
              if (atom.atom.trim() !== "C1'") return;

              const residueKey = `${atom.chain}-${atom.resi}`;

              if (labelledResidues.has(residueKey)) return;

              labelledResidues.add(residueKey);

              createLabel(
                `${atom.resn} ${atom.resi}`,
                atom,
                10
              );
            });
          }

          if (nextLevel >= 3) {
            atoms.forEach((atom) => {
              const element = (atom.elem || "").toUpperCase();

              if (!["C", "N", "O", "P", "S"].includes(element)) {
                return;
              }

              createLabel(
                `${atom.atom.trim()} · ${atom.resi}`,
                atom,
                9
              );
            });
          }

          viewer.render();
        }

        viewer.setViewChangeCallback((view) => {
          if (!cancelled) {
            updateMolecularLabels(view);
          }
        });

        // CLICK DETECTION + BIOLOGICAL CLASSIFICATION
        viewer.setClickable({}, true, (atom) => {
          const component = identifyDnaComponent(atom);

          const selected = {
            atom: (atom.atom || "").trim(),
            element: atom.elem || "",
            residue: atom.resn || "",
            residueNumber: atom.resi ?? null,
            chain: atom.chain || "",
            atomIndex: atom.index ?? null,

            // Extra information for the contextual quiz
            componentType: component.componentType,
            componentName: component.componentName,
            topic: component.topic,
            description: component.description,

            // Bond information
            bonds: atom.bonds || [],
            bondCount: atom.bonds?.length || 0,

            // 3D position
            position: {
              x: atom.x,
              y: atom.y,
              z: atom.z
            }
          };

          onSelect?.(selected);

          viewer.zoomTo(
            { chain: atom.chain, resi: atom.resi },
            500
          );

          viewer.render();
        });

        viewer.render();

        viewerRef.current = viewer;
        setLoading(false);

      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Something went wrong loading DNA."
          );
          setLoading(false);
        }
      }
    }

    loadMolecule();

    return () => {
      cancelled = true;

      if (viewer) {
        viewer.setViewChangeCallback(null);

        if (typeof viewer.clear === "function") {
          viewer.clear();
        }
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

  const resetTilt = () => {
    setTilt({ x: 0, y: 0 });
  };

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
        style={{
          width: "100%",
          height: "520px",
          minHeight: "520px",
          position: "relative"
        }}
      >
        <div
          ref={containerRef}
          className="molecule-canvas"
          style={{
            width: "100%",
            height: "520px",
            minHeight: "520px",
            position: "relative",
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
          className={
            mouseSensitive ? "sensitivity-active" : ""
          }
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
