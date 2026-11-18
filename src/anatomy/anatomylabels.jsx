import { structuresFor, SYSTEMS } from "./anatomydata";
import { useAnatomy } from "./anatomystate";

export default function AnatomyLabels() {
  const { query, selectedId, onSelect, setTopic, sex } = useAnatomy();
  const needle = query.trim().toLowerCase();
  const partsInBody = structuresFor(sex);
  const wantsCirculation = /blood|circul|cardiac|heart rate|bpm/.test(needle);

  return (
    <div className="part-browser">
      {wantsCirculation && (
        <button className="learning-link part-jump" onClick={() => setTopic("circulation")}>
          Open the blood circulation simulator
        </button>
      )}

      {SYSTEMS.filter((item) => item.id !== "all").map((item) => {
        const parts = partsInBody.filter((part) => {
          if (part.system !== item.id) return false;
          if (!needle) return true;
          return part.label.toLowerCase().includes(needle);
        });

        if (!parts.length) return null;

        return (
          <div key={item.id}>
            <p className="detail-label">{item.label}</p>
            {parts.map((part) => (
              <button
                key={part.key}
                className={`part-button ${selectedId === part.key ? "active" : ""}`}
                onClick={() => onSelect(part.key)}
              >
                <span className="part-swatch" style={{ background: part.color }} />
                {part.label}
              </button>
            ))}
          </div>
        );
      })}

      {needle && !partsInBody.some((part) => part.label.toLowerCase().includes(needle)) && (
        <p className="empty-inspector">No structures match that search.</p>
      )}
    </div>
  );
}
