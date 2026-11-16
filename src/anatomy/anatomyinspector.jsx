
import { getStructure, SYSTEM_LABELS } from "./anatomyData";

export default function AnatomyInspector({ selectedKey, onClear }) {
  const structure = getStructure(selectedKey);

  if (!structure) {
    return (
      <aside className="anatomy-inspector">
        <div className="inspector-eyebrow">STRUCTURE INSPECTOR</div>
        <h2>Explore the body</h2>
        <p className="inspector-muted">
          Select a structure in the 3D model to inspect its anatomical
          information.
        </p>
        <div className="inspector-placeholder">
          <span>+</span>
          <p>Nothing selected yet</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="anatomy-inspector">
      <div className="inspector-top">
        <div className="inspector-eyebrow">SELECTED STRUCTURE</div>
        <button onClick={onClear}>Clear</button>
      </div>

      <div
        className="structure-color"
        style={{ background: structure.color || "#5eead4" }}
      />

      <h2>{structure.label}</h2>

      <div className="structure-category">
        {SYSTEM_LABELS[structure.system] || structure.system}
      </div>

      <div className="inspector-section">
        <h3>Structure information</h3>
        <p><strong>Catalogue key:</strong> {structure.key}</p>
        <p><strong>Category:</strong> {structure.category || "Not specified"}</p>
        <p><strong>System:</strong> {structure.system}</p>
      </div>

      <div className="inspector-note">
        This is catalogue information from the anatomy dataset. Verified
        educational descriptions and references will be added as the
        knowledge library is developed.
      </div>
    </aside>
  );
}
