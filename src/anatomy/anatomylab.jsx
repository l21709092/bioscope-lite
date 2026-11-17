
import { useMemo, useState } from "react";
import AnatomyViewer from "./anatomyviewer";
import AnatomyControls from "./anatomycontrols";
import AnatomyInspector from "./anatomyinspector";
import {
  ANATOMY_STRUCTURES,
  SYSTEM_KEYS,
  ATTRIBUTION,
} from "./anatomydata";
import "./AnatomyLab.css";

export default function AnatomyLab() {
  const [sex, setSex] = useState("female");
  const [selectedKey, setSelectedKey] = useState(null);
  const [search, setSearch] = useState("");

  const [activeSystems, setActiveSystems] = useState([
    "skeleton",
    "organs",
    "vessels",
    "nerves",
  ]);

  const filteredStructures = useMemo(() => {
    return ANATOMY_STRUCTURES.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 8);
  }, [search]);

  const selectStructure = (key) => {
    setSelectedKey(key);
  };

  return (
    <main className="anatomy-lab">
      <header className="lab-header">
        <div>
          <div className="lab-eyebrow">BIOSCOPE / EXPLORATION</div>
          <h1>Anatomy Lab</h1>
        </div>
        <div className="lab-status">
          <span className="status-dot" />
          3D ENVIRONMENT
        </div>
      </header>

      <section className="anatomy-workspace">
        <AnatomyControls
          sex={sex}
          setSex={setSex}
          activeSystems={activeSystems}
          setActiveSystems={setActiveSystems}
          search={search}
          setSearch={setSearch}
        />

        <div className="anatomy-main">
          <div className="viewport-toolbar">
            <span>HUMAN ANATOMY / 3D VIEW</span>
            <span>DRAG TO ROTATE · SCROLL TO ZOOM</span>
          </div>

          <AnatomyViewer
            sex={sex}
            selectedKey={selectedKey}
            activeSystems={activeSystems}
            onSelect={selectStructure}
          />

          {search && (
            <div className="search-results">
              <div className="inspector-eyebrow">SEARCH RESULTS</div>
              {filteredStructures.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setSelectedKey(item.key);
                    setSearch("");
                  }}
                >
                  {item.label}
                </button>
              ))}
              {filteredStructures.length === 0 && (
                <p>No matching structures found.</p>
              )}
            </div>
          )}

          <div className="viewport-footer">
            <span>INTERACTIVE ANATOMICAL MODEL</span>
            <span>EDUCATIONAL VISUALIZATION</span>
          </div>
        </div>

        <AnatomyInspector
          selectedKey={selectedKey}
          onClear={() => setSelectedKey(null)}
        />
      </section>

      <footer className="anatomy-attribution">
        {ATTRIBUTION}
      </footer>
    </main>
  );
}
