
import { useEffect, useRef, useState } from "react";
import * as $3Dmol from "3dmol";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react";

const baseNames = { DA: "Adenine", DT: "Thymine", DG: "Guanine", DC: "Cytosine" };
const baseColors = { DA: "#43bce5", DT: "#f5a64e", DG: "#a58cf5", DC: "#65d49b" };
const backboneAtoms = ["P", "OP1", "OP2", "O1P", "O2P", "O5'", "C5'", "C4'", "O4'", "C3'", "O3'", "C2'", "C1'"];
const componentNames = {
  backbone: "Sugar-phosphate backbone", adenine: "Adenine", thymine: "Thymine", guanine: "Guanine",
  cytosine: "Cytosine", hydrogenBonds: "Hydrogen bonds", nucleotide: "Nucleotide", basePair: "Complementary base pair"
};

function atomComponent(atom) {
  const name = String(atom.atom || "").trim().toUpperCase();
  if (backboneAtoms.some(part => name === part.toUpperCase())) return "backbone";
  return ({ DA: "adenine", DT: "thymine", DG: "guanine", DC: "cytosine" })[atom.resn] || "nucleotide";
}

function atomInfo(atom) {
  const componentId = atomComponent(atom);
  return {
    atom: atom.atom,
    element: atom.elem,
    residue: atom.resn,
    residueNumber: atom.resi,
    chain: atom.chain,
    componentId,
    componentName: componentNames[componentId]
  };
}

function residuePairs(atoms) {
  const residues = new Map();
  atoms.filter(atom => baseNames[atom.resn]).forEach(atom => {
    const key = `${atom.chain}:${atom.resi}:${atom.resn}`;
    if (!residues.has(key)) residues.set(key, { key, chain: atom.chain, resi: atom.resi, resn: atom.resn, atoms: [], center: [0, 0, 0] });
    const residue = residues.get(key);
    residue.atoms.push(atom);
    residue.center[0] += atom.x;
    residue.center[1] += atom.y;
    residue.center[2] += atom.z;
  });
  const groups = [...residues.values()];
  groups.forEach(residue => residue.center.forEach((value, index) => { residue.center[index] = value / residue.atoms.length; }));
  const complement = { DA: "DT", DT: "DA", DG: "DC", DC: "DG" };
  const candidates = [];
  groups.forEach((left, index) => groups.slice(index + 1).forEach(right => {
    if (left.chain === right.chain || complement[left.resn] !== right.resn) return;
    const distance = Math.hypot(left.center[0] - right.center[0], left.center[1] - right.center[1], left.center[2] - right.center[2]);
    if (distance < 7.5) candidates.push({ left, right, distance });
  }));
  candidates.sort((left, right) => left.distance - right.distance);
  const used = new Set();
  return candidates.filter(pair => {
    if (used.has(pair.left.key) || used.has(pair.right.key)) return false;
    used.add(pair.left.key);
    used.add(pair.right.key);
    return true;
  });
}

function atomFor(residue, name) {
  return residue.atoms.find(atom => String(atom.atom || "").trim().toUpperCase() === name);
}

function addHydrogenBondLines(viewer, pairs) {
  const bonds = [];
  pairs.forEach(({ left, right }) => {
    const purine = ["DA", "DG"].includes(left.resn) ? left : right;
    const pyrimidine = purine === left ? right : left;
    const atomPairs = purine.resn === "DA"
      ? [["N6", "O4"], ["N1", "N3"]]
      : [["O6", "N4"], ["N1", "N3"], ["N2", "O2"]];
    atomPairs.forEach(([firstName, secondName]) => {
      const first = atomFor(purine, firstName);
      const second = atomFor(pyrimidine, secondName);
      if (!first || !second) return;
      const bond = { start: first, end: second };
      bonds.push(bond);
      viewer.addCylinder({
        start: { x: first.x, y: first.y, z: first.z },
        end: { x: second.x, y: second.y, z: second.z },
        radius: 0.045,
        color: "#70e4df",
        fromCap: 0,
        toCap: 0
      });
    });
  });
  return bonds;
}

function selectorFor(componentId, atom, pairs) {
  if (["adenine", "thymine", "guanine", "cytosine"].includes(componentId)) {
    return [{ resn: ({ adenine: "DA", thymine: "DT", guanine: "DG", cytosine: "DC" })[componentId] }];
  }
  if (componentId === "backbone") return [{ atom: backboneAtoms }];
  if (componentId === "nucleotide") return [{ chain: atom?.chain || "A", resi: atom?.resi || 1 }];
  if (componentId === "basePair" || componentId === "hydrogenBonds") {
    const pair = atom ? pairs.find(item => item.left.chain === atom.chain && item.left.resi === atom.resi || item.right.chain === atom.chain && item.right.resi) : pairs[0];
    return pair ? [{ chain: pair.left.chain, resi: pair.left.resi }, { chain: pair.right.chain, resi: pair.right.resi }] : [];
  }
  return [];
}

function applyDnaStyle(viewer, componentId, atom, pairs, viewMode = "overview") {
  const isComponentMode = viewMode === "component";
  const isAtomicMode = viewMode === "atomic";
  const isInterfaceMode = viewMode === "interface";
  viewer.setStyle({}, isAtomicMode
    ? { stick: { colorscheme: "Jmol", radius: 0.16 }, sphere: { colorscheme: "Jmol", scale: 0.24 } }
    : { stick: { color: isComponentMode ? "#53677b" : "#a7b9cc", radius: isComponentMode ? 0.1 : 0.13, opacity: isComponentMode ? 0.34 : 1 }, sphere: { color: isComponentMode ? "#53677b" : "#a7b9cc", scale: isComponentMode ? 0.14 : 0.18, opacity: isComponentMode ? 0.34 : 1 } });
  if (!isComponentMode && !isAtomicMode) {
    Object.entries(baseColors).forEach(([resn, color]) => viewer.setStyle({ resn }, { stick: { color, radius: 0.17 }, sphere: { color, scale: 0.22 } }));
  }
  const selectedComponent = isInterfaceMode ? "basePair" : componentId;
  selectorFor(selectedComponent, atom, pairs).forEach(selector => viewer.setStyle(selector, {
    stick: { color: "#fff0a6", radius: 0.24 },
    sphere: { color: "#fff0a6", scale: 0.28 }
  }));
  viewer.render();
}

function addResidueLabels(viewer, atoms) {
  const residues = new Map();
  atoms.filter(atom => baseNames[atom.resn]).forEach(atom => {
    const key = `${atom.chain}:${atom.resi}:${atom.resn}`;
    if (!residues.has(key)) residues.set(key, { atom, center: [0, 0, 0], count: 0 });
    const residue = residues.get(key);
    residue.center[0] += atom.x;
    residue.center[1] += atom.y;
    residue.center[2] += atom.z;
    residue.count += 1;
  });
  return [...residues.values()].map(({ atom, center, count }) => viewer.addLabel(
    `${baseNames[atom.resn]} ${atom.resn.slice(1)}${atom.resi} · ${atom.chain}`,
    {
      position: { x: center[0] / count, y: center[1] / count, z: center[2] / count },
      backgroundColor: baseColors[atom.resn],
      backgroundOpacity: 0.88,
      fontColor: "#07111c",
      fontOpacity: 0.96,
      fontSize: 11,
      borderColor: "#e7f5fa",
      borderOpacity: 0.7,
      borderThickness: 1,
      inFront: true
    },
    undefined,
    true
  ));
}

function setLabelOpacity(labels, opacity) {
  labels.forEach(label => {
    if (!label.sprite?.material) return;
    label.sprite.material.transparent = true;
    label.sprite.material.opacity = opacity;
    if (opacity < 0.025) label.hide();
    else label.show();
  });
}

export default function Viewer({ onSelect, onHover, focusedComponent, onLoadStatus, molecularMode = false }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const pairsRef = useRef([]);
  const zoomLabelsRef = useRef([]);
  const initialZoomRef = useRef(null);
  const selectedAtomRef = useRef(null);
  const viewModeRef = useRef("overview");
  const focusedComponentRef = useRef(focusedComponent);
  const onSelectRef = useRef(onSelect);
  const onHoverRef = useRef(onHover);
  const onLoadStatusRef = useRef(onLoadStatus);
  const [viewMode, setViewMode] = useState("overview");
  const [labelVisibility, setLabelVisibility] = useState("off");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewerReady, setViewerReady] = useState(false);

  useEffect(() => { focusedComponentRef.current = focusedComponent; }, [focusedComponent]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { onHoverRef.current = onHover; }, [onHover]);
  useEffect(() => { onLoadStatusRef.current = onLoadStatus; }, [onLoadStatus]);
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);

  useEffect(() => {
    if (!molecularMode) return undefined;
    let cancelled = false;
    let viewer = null;
    let labelRenderFrame = 0;
    setLoading(true);
    setError("");

    async function loadMolecule() {
      try {
        viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: "#0b1220",
          antialias: true
        });
        const response = await fetch("https://files.rcsb.org/download/1BNA.pdb");
        if (!response.ok) throw new Error("Could not download the DNA structure.");
        const pdbData = await response.text();
        if (cancelled) return;

        viewer.addModel(pdbData, "pdb");
        const atoms = viewer.selectedAtoms({});
        pairsRef.current = residuePairs(atoms);
        addHydrogenBondLines(viewer, pairsRef.current);
        applyDnaStyle(viewer, focusedComponentRef.current, null, pairsRef.current, viewModeRef.current);
        viewer.zoomTo();
        zoomLabelsRef.current = addResidueLabels(viewer, atoms);
        setLabelOpacity(zoomLabelsRef.current, 0);
        initialZoomRef.current = viewer.getView()[3];

        viewer.setViewChangeCallback(view => {
          const baselineDistance = Math.max(1, viewer.CAMERA_Z - initialZoomRef.current);
          const currentDistance = viewer.CAMERA_Z - view[3];
          const zoomProgress = Math.max(0, Math.min(1, (baselineDistance - currentDistance) / baselineDistance));
          const opacity = Math.max(0, Math.min(1, (zoomProgress - 0.12) / 0.48));
          setLabelOpacity(zoomLabelsRef.current, opacity);
          const visibility = opacity < 0.025 ? "off" : opacity > 0.98 ? "visible" : "fading";
          setLabelVisibility(previous => previous === visibility ? previous : visibility);
          if (labelRenderFrame || cancelled) return;
          labelRenderFrame = window.requestAnimationFrame(() => {
            labelRenderFrame = 0;
            if (!cancelled) viewer.render();
          });
        });

        viewer.setClickable({}, true, (atom, currentViewer) => {
          const selected = atomInfo(atom);
          selectedAtomRef.current = atom;
          onSelectRef.current?.(selected);
          applyDnaStyle(currentViewer, selected.componentId, atom, pairsRef.current, viewModeRef.current);
          currentViewer.zoomTo({ chain: atom.chain, resi: atom.resi }, 500);
        });

        viewer.setHoverable({}, true, (atom, currentViewer) => {
          const hovered = atomInfo(atom);
          onHoverRef.current?.(hovered);
          applyDnaStyle(currentViewer, hovered.componentId, atom, pairsRef.current, viewModeRef.current);
        }, (_atom, currentViewer) => {
          onHoverRef.current?.(null);
          applyDnaStyle(currentViewer, focusedComponentRef.current, selectedAtomRef.current, pairsRef.current, viewModeRef.current);
        });

        viewer.render();
        viewerRef.current = viewer;
        setViewerReady(true);
        onLoadStatusRef.current?.("ready");
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong loading DNA.");
          onLoadStatusRef.current?.("error");
          setLoading(false);
        }
      }
    }

    loadMolecule();
    return () => {
      cancelled = true;
      if (labelRenderFrame) window.cancelAnimationFrame(labelRenderFrame);
      if (viewer) {
        viewer.setViewChangeCallback(null);
        viewer.clear();
      }
      viewerRef.current = null;
      zoomLabelsRef.current = [];
    };
  }, [molecularMode]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !viewerReady) return;
    applyDnaStyle(viewer, focusedComponent, selectedAtomRef.current, pairsRef.current, viewMode);
  }, [focusedComponent, viewMode, viewerReady]);

  const zoomIn = () => {
    viewerRef.current?.zoom(1.4, 300);
    viewerRef.current?.render();
  };
  const zoomOut = () => {
    viewerRef.current?.zoom(0.7, 300);
    viewerRef.current?.render();
  };
  const resetView = () => {
    setViewMode("overview");
    viewerRef.current?.zoomTo({}, 500);
    viewerRef.current?.render();
  };
  const pan = (x, y) => {
    viewerRef.current?.translate(x, y, 220);
  };

  if (!molecularMode) {
    return (
      <section className="viewer-panel viewer-unavailable">
        <div className="viewer-top"><span>INTERACTIVE STRUCTURES</span><span>DNA Explorer</span></div>
        <div className="viewer-placeholder">
          <div className="viewer-message">
            <span>MOLECULAR BIOLOGY</span>
            <h2>Explore DNA in its learning space</h2>
            <p>The DNA structure viewer is in the Molecular Biology section, with guided visuals and a component inspector.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="viewer-panel">
      <div className="viewer-top">
        <div><span className="live-dot" /> LIVE MOLECULAR VIEWER</div>
        <span>DNA · PDB: 1BNA</span>
      </div>
      <div className="molecule-stage">
        <div ref={containerRef} className="molecule-canvas" />
        {loading && <div className="viewer-overlay">Loading DNA structure…</div>}
        {error && <div className="viewer-overlay error-message">{error}</div>}
      </div>
      <div className="dna-view-modes" role="group" aria-label="Molecular viewing mode">
        {["overview", "component", "interface", "atomic"].map(mode => (
          <button key={mode} type="button" className={viewMode === mode ? "selected" : ""} aria-pressed={viewMode === mode} onClick={() => setViewMode(mode)}>
            {mode === "component" ? "Component" : mode[0].toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>
      <div className="viewer-controls dna-viewer-controls">
        <button type="button" onClick={zoomIn}><ZoomIn size={16} />Zoom In</button>
        <button type="button" onClick={zoomOut}><ZoomOut size={16} />Zoom Out</button>
        <div className="dna-pan-controls" role="group" aria-label="Pan the DNA structure">
          <button type="button" aria-label="Pan up" title="Pan up" onClick={() => pan(0, -55)}><ArrowUp size={15} /></button>
          <button type="button" aria-label="Pan left" title="Pan left" onClick={() => pan(-55, 0)}><ArrowLeft size={15} /></button>
          <button type="button" aria-label="Pan down" title="Pan down" onClick={() => pan(0, 55)}><ArrowDown size={15} /></button>
          <button type="button" aria-label="Pan right" title="Pan right" onClick={() => pan(55, 0)}><ArrowRight size={15} /></button>
        </div>
        <button type="button" onClick={resetView}><RotateCcw size={16} />Reset</button>
      </div>
      <p className="viewer-hint" aria-live="polite">Drag to rotate · Right-drag or arrows to pan · Scroll to zoom · Detailed labels: {labelVisibility === "off" ? "zoom in to reveal" : labelVisibility === "visible" ? "visible" : "fading in"}</p>
    </section>
  );
}
