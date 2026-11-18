import { SYSTEMS } from "./anatomydata";
import { useAnatomy } from "./anatomystate";

export default function AnatomyControls() {
  const { system, setSystem, sex, setSex, spread, setSpread, onResetView } = useAnatomy();

  return (
    <div className="anatomy-controls">
      <div className="body-selector" aria-label="Reference body">
        <span>Reference body</span>
        <div>
          {['female', 'male'].map((option) => <button key={option} className={sex === option ? 'active' : ''} onClick={() => { setSex(option); onResetView(); }}>{option}</button>)}
        </div>
      </div>
      <div className="system-row" role="tablist" aria-label="Body systems">
        {SYSTEMS.map((item) => (
          <button
            key={item.id}
            className={`system-chip ${system === item.id ? "active" : ""}`}
            onClick={() => setSystem(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="spread-control">
        <label htmlFor="spread">Spread structures</label>
        <input
          id="spread"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={spread}
          onChange={(event) => setSpread(Number(event.target.value))}
        />
        <button onClick={onResetView}>Reset view</button>
      </div>
    </div>
  );
}
