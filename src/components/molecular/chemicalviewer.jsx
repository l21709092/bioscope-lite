
import { useEffect, useRef, useState } from "react";
import * as $3Dmol from "3dmol";

export default function ChemicalViewer({ model }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [status, setStatus] = useState("Loading molecule...");

  useEffect(() => {
    let cancelled = false;
    let viewer;

    async function loadMolecule() {
      try {
        setStatus("Preparing molecular viewer...");

        const response = await fetch(model.modelUrl);

        if (!response.ok) {
          throw new Error("Could not retrieve molecule.");
        }

        const sdf = await response.text();

        if (!sdf.trim()) {
          throw new Error("The molecule file is empty.");
        }

        if (cancelled || !containerRef.current) return;

        viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: "#101a24",
        });

        viewerRef.current = viewer;

        viewer.addModel(sdf, "sdf");

        viewer.setStyle({}, {
          stick: { radius: 0.16 },
          sphere: { scale: 0.23 },
        });

        viewer.zoomTo();
        viewer.render();

        if (!cancelled) {
          setStatus("");
        }
      } catch (error) {
        console.error("Chemical viewer error:", error);

        if (!cancelled) {
          setStatus(
            "Unable to load this molecule. It may not have a 3D conformer."
          );
        }
      }
    }

    if (model?.modelUrl) {
      loadMolecule();
    }

    return () => {
      cancelled = true;

      if (viewer) {
        viewer.clear();
        viewerRef.current = null;
      }
    };
  }, [model?.id, model?.modelUrl]);

  return (
    <section className="chemical-viewer-section">
      {status && (
        <div className="chemical-viewer-status">
          {status}
        </div>
      )}

      <div
        ref={containerRef}
        className="chemical-viewer-canvas"
      />
    </section>
  );
}
