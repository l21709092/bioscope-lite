
import { useEffect, useRef, useState } from "react";

import { createPluginUI } from "molstar/lib/mol-plugin-ui";
import { renderReact18 } from "molstar/lib/mol-plugin-ui/react18";
import { DefaultPluginUISpec } from "molstar/lib/mol-plugin-ui/spec";

import "molstar/build/viewer/molstar.css";

export default function MolecularViewer({ model }) {
  const containerRef = useRef(null);

  const [status, setStatus] = useState("Waiting for a structure...");

  useEffect(() => {
    if (!model?.modelUrl || !containerRef.current) return;

    let cancelled = false;
    let plugin = null;

    async function initialiseViewer() {
      try {
        setStatus("Initialising molecular viewer...");

        plugin = await createPluginUI({
          target: containerRef.current,
          render: renderReact18,
          spec: DefaultPluginUISpec(),
        });

        if (cancelled) {
          plugin.dispose();
          return;
        }

        setStatus("Downloading molecular structure...");

        const data = await plugin.builders.data.download(
          { url: model.modelUrl },
          { state: { isGhost: true } }
        );

        if (cancelled) return;

        const format =
          model.format?.toLowerCase() === "pdb"
            ? "pdb"
            : "mmcif";

        setStatus("Processing molecular structure...");

        const trajectory =
          await plugin.builders.structure.parseTrajectory(
            data,
            format
          );

        if (cancelled) return;

        await plugin.builders.structure.hierarchy.applyPreset(
          trajectory,
          "default"
        );

        if (!cancelled) {
          setStatus("");
        }
      } catch (error) {
        console.error("Mol* viewer error:", error);

        if (!cancelled) {
          setStatus(
            "Unable to load this structure. Try another model."
          );
        }
      }
    }

    initialiseViewer();

    return () => {
      cancelled = true;

      if (plugin) {
        plugin.dispose();
        plugin = null;
      }
    };
  }, [model?.id, model?.modelUrl, model?.format]);

  return (
    <section className="molecular-viewer-section">
      {status && (
        <div className="molecular-viewer-status" role="status">
          {status}
        </div>
      )}

      <div
        ref={containerRef}
        className="molecular-viewer-canvas"
      />
    </section>
  );
}
